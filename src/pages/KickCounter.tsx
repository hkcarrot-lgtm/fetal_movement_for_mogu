import { useState, useEffect, useCallback } from "react";
import { db } from "../lib/db.ts";
import { getSettings } from "../lib/settings.ts";

const SESSION_ID = "session-" + Date.now();

export default function KickCounter() {
  const settings = getSettings();
  const [count, setCount] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSessionCount = useCallback(async () => {
    const mergeMs = settings.kickMergeMinutes * 60 * 1000;
    const sessionStart = startedAt ?? Date.now();
    const records = await db.kicks
      .where("timestamp")
      .aboveOrEqual(sessionStart - mergeMs)
      .toArray();
    const merged = mergeKicks(records, mergeMs);
    setCount(merged.length);
  }, [settings.kickMergeMinutes, startedAt]);

  useEffect(() => {
    db.kicks.count().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    loadSessionCount();
  }, [loading, loadSessionCount]);

  const handleKick = async () => {
    const now = Date.now();
    if (!startedAt) setStartedAt(now);
    await db.kicks.add({
      timestamp: now,
      sessionId: SESSION_ID,
    });
    await loadSessionCount();
  };

  const target = settings.kickTargetCount;
  const reached = count >= target;

  return (
    <div className="flex flex-col items-center gap-8 p-6 pt-safe">
      <h1 className="text-xl font-semibold text-duo-green dark:text-duo-green-light">数胎动</h1>
      <p className="text-center text-lg text-duo-green dark:text-duo-green-light">
        快来数胎动吧～蘑菇
      </p>
      <p className="text-center text-sm text-duo-gray-dark">
        Cardiff Count-to-10：记录胎动，合并窗口 {settings.kickMergeMinutes} 分钟，目标 {target} 次。
      </p>

      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl font-bold text-duo-green dark:text-duo-green-light">{count}</div>
        <p className="text-sm text-duo-gray-dark">
          / {target} 次
          {startedAt && (
            <span className="ml-2 text-duo-green">
              {reached ? "✓ 达标！" : ""}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={handleKick}
          className="mt-4 rounded-2xl bg-duo-green px-8 py-4 text-lg font-semibold text-white shadow-lg transition active:scale-95 dark:bg-duo-green-dark"
        >
          点一下记一次胎动
        </button>
      </div>

      {startedAt && (
        <button
          type="button"
          onClick={async () => {
            setStartedAt(null);
            setCount(0);
          }}
          className="text-sm text-duo-gray-dark underline"
        >
          重新开始本次记录
        </button>
      )}
    </div>
  );
}

function mergeKicks(records: { timestamp: number }[], windowMs: number): number[] {
  if (records.length === 0) return [];
  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);
  const merged: number[] = [sorted[0]!.timestamp];
  for (let i = 1; i < sorted.length; i++) {
    const t = sorted[i]!.timestamp;
    if (t - merged[merged.length - 1]! >= windowMs) merged.push(t);
  }
  return merged;
}
