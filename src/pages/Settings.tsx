import { useState, useEffect } from "react";
import { getSettings, saveSettings, applyColorMode, type AppSettings, type ColorMode } from "../lib/settings.ts";

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  useEffect(() => {
    saveSettings(settings);
    applyColorMode(settings.colorMode);
  }, [settings]);

  const update = (patch: Partial<AppSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
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
