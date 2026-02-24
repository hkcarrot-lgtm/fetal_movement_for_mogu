import { useState, useEffect, useRef } from "react";
import { getSettings, saveSettings, applyColorMode, type AppSettings, type ColorMode } from "../lib/settings.ts";
import { db } from "../lib/db.ts";

const STORAGE_KEY = "babycare-settings";

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [dataMsg, setDataMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveSettings(settings);
    applyColorMode(settings.colorMode);
  }, [settings]);

  const update = (patch: Partial<AppSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  };

  const exportData = async () => {
    const [kicks, contractions, hospitalBag, feeding] = await Promise.all([
      db.kicks.toArray(),
      db.contractions.toArray(),
      db.hospitalBag.toArray(),
      db.feeding.toArray(),
    ]);
    const settingsJson = localStorage.getItem(STORAGE_KEY);
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: settingsJson ? JSON.parse(settingsJson) : null,
      kicks,
      contractions,
      hospitalBag,
      feeding,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `孕期数胎动-备份-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDataMsg("已导出备份");
    setTimeout(() => setDataMsg(null), 2000);
  };

  const importData = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const backup = JSON.parse(text) as {
        settings?: AppSettings | null;
        kicks?: { timestamp: number; sessionId: string }[];
        contractions?: { startTime: number; endTime: number; sessionId: string }[];
        hospitalBag?: { category: string; name: string; checked: boolean; sortOrder: number }[];
        feeding?: { type: string; startTime: number; endTime: number; amountMl: number }[];
      };
      if (backup.settings) {
        saveSettings({ ...getSettings(), ...backup.settings });
        setSettings(getSettings());
      }
      if (backup.kicks?.length) {
        await db.kicks.bulkAdd(backup.kicks.map((k) => ({ timestamp: k.timestamp, sessionId: k.sessionId })));
      }
      if (backup.contractions?.length) {
        await db.contractions.bulkAdd(
          backup.contractions.map((c) => ({
            startTime: c.startTime,
            endTime: c.endTime,
            sessionId: c.sessionId,
          })),
        );
      }
      if (backup.hospitalBag?.length) {
        await db.hospitalBag.bulkAdd(
          backup.hospitalBag.map((h, i) => ({
            category: h.category as "mom" | "baby" | "doc",
            name: h.name,
            checked: h.checked,
            sortOrder: h.sortOrder ?? i,
          })),
        );
      }
      if (backup.feeding?.length) {
        await db.feeding.bulkAdd(
          backup.feeding.map((f) => ({
            type: f.type as "breast_left" | "breast_right" | "bottle" | "pump",
            startTime: f.startTime,
            endTime: f.endTime,
            amountMl: f.amountMl ?? 0,
          })),
        );
      }
      setDataMsg("导入成功");
    } catch (e) {
      setDataMsg("导入失败，请确认文件格式");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setTimeout(() => setDataMsg(null), 3000);
  };

  const clearData = async () => {
    if (!confirm("确定清除全部数据？此操作不可恢复。")) return;
    await Promise.all([
      db.kicks.clear(),
      db.contractions.clear(),
      db.hospitalBag.clear(),
      db.feeding.clear(),
    ]);
    saveSettings({
      colorMode: "system",
      dueDate: null,
      kickTargetCount: 10,
      kickMergeMinutes: 5,
    });
    setSettings(getSettings());
    setDataMsg("已清除全部数据");
    setTimeout(() => setDataMsg(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 pt-safe">
      <h1 className="text-xl font-semibold text-duo-green dark:text-duo-green-light">设置</h1>

      <section className="flex flex-col gap-2">
        <label className="text-sm font-medium text-duo-gray-dark">深色模式</label>
        <select
          value={settings.colorMode}
          onChange={(e) => update({ colorMode: e.target.value as ColorMode })}
          className="rounded-xl border border-black/10 bg-white px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <option value="system">跟随系统</option>
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
      </section>

      <section className="flex flex-col gap-2">
        <label className="text-sm font-medium text-duo-gray-dark">预产期</label>
        <input
          type="date"
          value={settings.dueDate ?? ""}
          onChange={(e) => update({ dueDate: e.target.value || null })}
          className="rounded-xl border border-black/10 bg-white px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </section>

      <section className="flex flex-col gap-2">
        <label className="text-sm font-medium text-duo-gray-dark">数胎动目标次数</label>
        <input
          type="number"
          min={1}
          max={20}
          value={settings.kickTargetCount}
          onChange={(e) => update({ kickTargetCount: Number(e.target.value) || 10 })}
          className="rounded-xl border border-black/10 bg-white px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </section>

      <section className="flex flex-col gap-2">
        <label className="text-sm font-medium text-duo-gray-dark">合并窗口（分钟）</label>
        <select
          value={settings.kickMergeMinutes}
          onChange={(e) => update({ kickMergeMinutes: Number(e.target.value) as 3 | 5 | 10 })}
          className="rounded-xl border border-black/10 bg-white px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <option value={3}>3 分钟</option>
          <option value={5}>5 分钟</option>
          <option value={10}>10 分钟</option>
        </select>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-duo-gray-dark">数据管理</h2>
        {dataMsg && <p className="text-sm text-duo-green">{dataMsg}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportData}
            className="rounded-xl bg-duo-green px-4 py-2 text-white dark:bg-duo-green-dark"
          >
            导出 JSON 备份
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={importData}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-duo-green px-4 py-2 text-duo-green dark:border-duo-green-light dark:text-duo-green-light"
          >
            导入备份
          </button>
          <button
            type="button"
            onClick={clearData}
            className="rounded-xl border border-duo-red px-4 py-2 text-duo-red"
          >
            清除全部数据
          </button>
        </div>
      </section>

      <p className="text-xs text-duo-gray-dark">
        数据仅保存在本机，无账号、无上传。基于{" "}
        <a
          href="https://github.com/CaliCastle/babycare"
          target="_blank"
          rel="noopener noreferrer"
          className="text-duo-green underline"
        >
          BabyCare
        </a>{" "}
        本地构建。
      </p>
    </div>
  );
}
