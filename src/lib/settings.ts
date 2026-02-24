export type ColorMode = "light" | "dark" | "system";

export interface AppSettings {
  colorMode: ColorMode;
  dueDate: string | null;
  kickTargetCount: number;
  kickMergeMinutes: 3 | 5 | 10;
}

const DEFAULT_SETTINGS: AppSettings = {
  colorMode: "system",
  dueDate: null,
  kickTargetCount: 10,
  kickMergeMinutes: 5,
};

const STORAGE_KEY = "babycare-settings";

function parseStored(): Partial<AppSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<AppSettings>;
  } catch {
    return {};
  }
}

export function getSettings(): AppSettings {
  const stored = parseStored();
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
  };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function applyColorMode(mode: ColorMode): void {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}
