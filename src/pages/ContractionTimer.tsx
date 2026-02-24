import { useState, useEffect, useCallback } from "react";
import { db } from "../lib/db.ts";
import { formatDuration, formatTime } from "../lib/time.ts";

const SESSION_ID = "contraction-" + Date.now();
const FIVE_ONE_ONE_MINUTES = 60; // 持续 ≥1 小时
const INTERVAL_THRESHOLD_SEC = 5 * 60; // 间隔 ≤5 分钟
const DURATION_THRESHOLD_SEC = 60; // 每次持续 ≥1 分钟

export default function ContractionTimer() {
  const [currentStart, setCurrentStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [records, setRecords] = useState<{ startTime: number; endTime: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentStart == null) return;
    setElapsed(0);
    const start = currentStart;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [currentStart]);

  const loadSession = useCallback(async () => {
    const list = await db.contractions
      .where("sessionId")
      .equals(SESSION_ID)
      .sortBy("startTime");
    setRecords(list.map((r) => ({ startTime: r.startTime, endTime: r.endTime })));
  }, []);

  useEffect(() => {
    db.contractions.count().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    loadSession();
  }, [loading, loadSession]);

  const startContraction = () => {
    const now = Date.now();
    setCurrentStart(now);
  };

  const endContraction = async () => {
    if (currentStart == null) return;
    const now = Date.now();
    await db.contractions.add({
      sessionId: SESSION_ID,
      startTime: currentStart,
      endTime: now,
    });
    setCurrentStart(null);
    await loadSession();
  };

  const displayElapsed = currentStart ? elapsed : 0;
  const intervals: number[] = [];
  const durations: number[] = [];
  for (let i = 0; i < records.length; i++) {
    durations.push(Math.floor((records[i].endTime - records[i].startTime) / 1000));
    if (i > 0) {
      intervals.push(Math.floor((records[i].startTime - records[i - 1].endTime) / 1000));
    }
  }
  const recentIntervals = intervals.slice(-5).filter((s) => s <= INTERVAL_THRESHOLD_SEC);
  const recentDurations = durations.filter((s) => s >= DURATION_THRESHOLD_SEC);
  const oneHourAgo = Date.now() - FIVE_ONE_ONE_MINUTES * 60 * 1000;
  const countInLastHour = records.filter((r) => r.endTime >= oneHourAgo).length;
  const fiveOneOne =
    countInLastHour >= 1 &&
    recentIntervals.length >= 1 &&
    recentDurations.length >= 1;

  return (
    <div className="flex flex-col gap-6 p-6 pt-safe">
      <h1 className="text-xl font-semibold text-duo-green dark:text-duo-green-light">宫缩计时</h1>
      <p className="text-sm text-duo-gray-dark">
        记录每次宫缩开始与结束。5-1-1 规则：间隔 ≤5 分钟、每次持续 ≥1 分钟、持续 ≥1 小时，建议去医院。
      </p>

      {fiveOneOne && (
        <div className="rounded-xl bg-duo-orange/20 px-4 py-3 text-duo-orange dark:bg-duo-orange/30">
          ⚠️ 已达 5-1-1，建议联系医院或前往待产。
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        {currentStart ? (
          <>
            <div className="text-3xl font-bold text-duo-green dark:text-duo-green-light">
              {formatDuration(displayElapsed)}
            </div>
            <p className="text-sm text-duo-gray-dark">本次宫缩进行中</p>
            <button
              type="button"
              onClick={endContraction}
              className="rounded-2xl bg-duo-red px-6 py-3 text-white font-medium"
            >
              结束本次宫缩
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={startContraction}
            className="rounded-2xl bg-duo-green px-8 py-4 text-lg font-semibold text-white dark:bg-duo-green-dark"
          >
            开始宫缩
          </button>
        )}
      </div>

      {records.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-duo-gray-dark">本次记录</h2>
          <ul className="space-y-1 text-sm">
            {records.slice(-10).reverse().map((r) => {
              const dur = Math.floor((r.endTime - r.startTime) / 1000);
              const idx = records.indexOf(r);
              const interval =
                idx > 0
                  ? Math.floor((r.startTime - records[idx - 1].endTime) / 1000)
                  : null;
              return (
                <li key={r.startTime} className="flex justify-between">
                  <span>
                    {formatTime(r.startTime)} 持续 {formatDuration(dur)}
                  </span>
                  {interval != null && (
                    <span className="text-duo-gray-dark">间隔 {formatDuration(interval)}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
