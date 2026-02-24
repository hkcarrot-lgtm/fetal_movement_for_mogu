import { useState, useEffect, useCallback } from "react";
import { db } from "../lib/db.ts";
import { getSettings } from "../lib/settings.ts";
import { formatDate } from "../lib/time.ts";

function mergeKicks(records: { timestamp: number }[], windowMs: number): number {
  if (records.length === 0) return 0;
  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);
  let count = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i]!.timestamp - sorted[i - 1]!.timestamp >= windowMs) count++;
  }
  return count;
}

export default function History() {
  const settings = getSettings();
  const [days7, setDays7] = useState<{ date: string; count: number }[]>([]);
  const [days30, setDays30] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const mergeMs = settings.kickMergeMinutes * 60 * 1000;
    const all = await db.kicks.orderBy("timestamp").toArray();
    const byDay = new Map<string, { timestamp: number }[]>();
    for (const r of all) {
      const day = formatDate(r.timestamp);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push({ timestamp: r.timestamp });
    }
    const sortedDays = Array.from(byDay.entries()).sort((a, b) => b[0].localeCompare(a[0]));
    const last7 = sortedDays.slice(0, 7).map(([date, list]) => ({
      date,
      count: mergeKicks(list, mergeMs),
    }));
    const last30 = sortedDays.slice(0, 30).map(([date, list]) => ({
      date,
      count: mergeKicks(list, mergeMs),
    }));
    setDays7(last7);
    setDays30(last30);
  }, [settings.kickMergeMinutes]);

  useEffect(() => {
    db.kicks.count().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    load();
  }, [loading, load]);

  const target = settings.kickTargetCount;
  const maxCount = Math.max(1, target, ...days30.map((d) => d.count));

  return (
    <div className="flex flex-col gap-6 p-6 pt-safe">
      <h1 className="text-xl font-semibold text-duo-green dark:text-duo-green-light">历史趋势</h1>
      <p className="text-sm text-duo-gray-dark">
        胎动 7 天 / 30 天趋势（合并窗口 {settings.kickMergeMinutes} 分钟，目标 {target} 次）
      </p>

      <section>
        <h2 className="mb-2 text-sm font-medium text-duo-gray-dark">近 7 天</h2>
        <div className="flex items-end justify-between gap-1 rounded-xl bg-white/80 p-4 dark:bg-white/5">
          {days7.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full min-h-[4px] rounded-t bg-duo-green dark:bg-duo-green-light transition-all"
                style={{
                  height: `${Math.max(4, (d.count / maxCount) * 80)}px`,
                }}
              />
              <span className="text-xs text-duo-gray-dark">
                {d.count >= target ? "✓" : d.count}
              </span>
              <span className="text-xs text-duo-gray-dark">
                {d.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-duo-gray-dark">近 30 天</h2>
        <div className="flex flex-wrap gap-2">
          {days30.map((d) => (
            <div
              key={d.date}
              className={`rounded-lg px-2 py-1 text-sm ${
                d.count >= target
                  ? "bg-duo-green/20 text-duo-green dark:bg-duo-green/30 dark:text-duo-green-light"
                  : "bg-duo-gray/50 text-duo-gray-dark dark:bg-white/10"
              }`}
            >
              {d.date} {d.count >= target ? "✓" : d.count + "次"}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
