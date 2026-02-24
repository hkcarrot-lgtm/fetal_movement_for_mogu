import { useState, useEffect, useCallback } from "react";
import { db } from "../lib/db.ts";
import type { FeedingRecord as Rec, FeedingType } from "../lib/db.ts";
import { formatDate, formatTime, formatDuration } from "../lib/time.ts";

const TYPE_LABELS: Record<FeedingType, string> = {
  breast_left: "亲喂(左)",
  breast_right: "亲喂(右)",
  bottle: "奶瓶",
  pump: "吸奶",
};

export default function FeedingLog() {
  const [records, setRecords] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<Rec | null>(null);
  const [mode, setMode] = useState<"list" | "breast" | "bottle" | "pump">("list");
  const [bottleMl, setBottleMl] = useState("");
  const [pumpMl, setPumpMl] = useState("");

  const load = useCallback(async () => {
    const list = await db.feeding.orderBy("startTime").reverse().toArray();
    setRecords(list);
    const ongoing = list.find((r) => r.endTime === 0);
    setActiveSession(ongoing ?? null);
  }, []);

  useEffect(() => {
    db.feeding.count().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    load();
  }, [loading, load]);

  const startBreast = async (side: "breast_left" | "breast_right") => {
    await db.feeding.add({
      type: side,
      startTime: Date.now(),
      endTime: 0,
      amountMl: 0,
    });
    await load();
    setMode("list");
  };

  const endBreast = async () => {
    if (!activeSession || activeSession.endTime !== 0) return;
    await db.feeding.update(activeSession.id!, { endTime: Date.now() });
    await load();
    setActiveSession(null);
  };

  const addBottle = async () => {
    const ml = Number(bottleMl) || 0;
    if (ml <= 0) return;
    await db.feeding.add({
      type: "bottle",
      startTime: Date.now(),
      endTime: 0,
      amountMl: ml,
    });
    setBottleMl("");
    setMode("list");
    await load();
  };

  const startPump = async () => {
    await db.feeding.add({
      type: "pump",
      startTime: Date.now(),
      endTime: 0,
      amountMl: 0,
    });
    setMode("list");
    await load();
  };

  const endPump = async () => {
    if (!activeSession || activeSession.type !== "pump" || activeSession.endTime !== 0) return;
    const ml = Number(pumpMl) || 0;
    await db.feeding.update(activeSession.id!, { endTime: Date.now(), amountMl: ml });
    setPumpMl("");
    setActiveSession(null);
    await load();
  };

  const byDay = new Map<string, Rec[]>();
  for (const r of records) {
    const day = formatDate(r.startTime);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(r);
  }
  const days = Array.from(byDay.entries()).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 14);

  return (
    <div className="flex flex-col gap-6 p-6 pt-safe">
      <h1 className="text-xl font-semibold text-duo-green dark:text-duo-green-light">喂奶记录</h1>
      <p className="text-sm text-duo-gray-dark">亲喂（左/右）、奶瓶、吸奶，按日分组。</p>

      {activeSession && (activeSession.type === "breast_left" || activeSession.type === "breast_right") && (
        <div className="rounded-xl bg-duo-green/20 p-4 dark:bg-duo-green/30">
          <p className="text-sm">正在 {TYPE_LABELS[activeSession.type]} 计时中</p>
          <p className="text-2xl font-bold text-duo-green">
            {formatDuration(Math.floor((Date.now() - activeSession.startTime) / 1000))}
          </p>
          <button
            type="button"
            onClick={endBreast}
            className="mt-2 rounded-xl bg-duo-green px-4 py-2 text-white dark:bg-duo-green-dark"
          >
            结束
          </button>
        </div>
      )}

      {activeSession && activeSession.type === "pump" && (
        <div className="rounded-xl bg-duo-green/20 p-4 dark:bg-duo-green/30">
          <p className="text-sm">正在吸奶计时中</p>
          <p className="text-2xl font-bold text-duo-green">
            {formatDuration(Math.floor((Date.now() - activeSession.startTime) / 1000))}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              placeholder="奶量(ml)"
              value={pumpMl}
              onChange={(e) => setPumpMl(e.target.value)}
              className="w-24 rounded-lg border border-black/10 bg-white px-2 py-1 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            <button
              type="button"
              onClick={endPump}
              className="rounded-xl bg-duo-green px-4 py-2 text-white dark:bg-duo-green-dark"
            >
              结束并保存
            </button>
          </div>
        </div>
      )}

      {mode === "list" && !activeSession && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => startBreast("breast_left")}
            className="rounded-xl bg-duo-green px-4 py-2 text-white dark:bg-duo-green-dark"
          >
            亲喂(左)
          </button>
          <button
            type="button"
            onClick={() => startBreast("breast_right")}
            className="rounded-xl bg-duo-green px-4 py-2 text-white dark:bg-duo-green-dark"
          >
            亲喂(右)
          </button>
          <button
            type="button"
            onClick={() => setMode("bottle")}
            className="rounded-xl bg-duo-blue px-4 py-2 text-white"
          >
            奶瓶
          </button>
          <button
            type="button"
            onClick={startPump}
            className="rounded-xl bg-duo-purple px-4 py-2 text-white"
          >
            吸奶
          </button>
        </div>
      )}

      {mode === "bottle" && (
        <div className="flex items-center gap-2 rounded-xl border border-black/10 p-4 dark:border-white/10">
          <input
            type="number"
            placeholder="奶量(ml)"
            value={bottleMl}
            onChange={(e) => setBottleMl(e.target.value)}
            className="w-28 rounded-lg border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          <button
            type="button"
            onClick={addBottle}
            className="rounded-xl bg-duo-blue px-4 py-2 text-white"
          >
            记录
          </button>
          <button
            type="button"
            onClick={() => setMode("list")}
            className="text-duo-gray-dark"
          >
            取消
          </button>
        </div>
      )}

      <section>
        <h2 className="mb-2 text-sm font-medium text-duo-gray-dark">历史记录</h2>
        <div className="space-y-4">
          {days.map(([day, list]) => (
            <div key={day}>
              <p className="text-sm font-medium text-duo-gray-dark">{day}</p>
              <ul className="mt-1 space-y-1 text-sm">
                {list.map((r) => (
                  <li key={r.id} className="flex justify-between">
                    <span>{TYPE_LABELS[r.type]}</span>
                    <span>
                      {r.endTime > 0
                        ? formatDuration(Math.floor((r.endTime - r.startTime) / 1000))
                        : formatTime(r.startTime)}
                      {r.amountMl > 0 && ` · ${r.amountMl}ml`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
