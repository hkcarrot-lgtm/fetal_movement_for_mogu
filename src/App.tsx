import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import KickCounter from "./pages/KickCounter.tsx";
import ContractionTimer from "./pages/ContractionTimer.tsx";
import HospitalBag from "./pages/HospitalBag.tsx";
import FeedingLog from "./pages/FeedingLog.tsx";
import History from "./pages/History.tsx";
import Settings from "./pages/Settings.tsx";

const navItems = [
  { to: "/", label: "数胎动", end: true },
  { to: "/contraction", label: "宫缩", end: false },
  { to: "/bag", label: "待产包", end: false },
  { to: "/feeding", label: "喂奶", end: false },
  { to: "/history", label: "趋势", end: false },
  { to: "/settings", label: "设置", end: false },
];

const pathPrefixes = ["/", "/contraction", "/bag", "/feeding", "/history", "/settings"];

function pathMatches(pathname: string): boolean {
  if (pathname === "/") return true;
  return pathPrefixes.some((p) => p !== "/" && pathname.startsWith(p));
}

export default function App() {
  const location = useLocation();
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const hasBottomNav = pathMatches(location.pathname);

  return (
    <div className="flex h-full flex-col bg-duo-gray dark:bg-[#1a1a2e]">
      <main className="min-h-0 flex-1 overflow-auto pb-safe">
        <Routes>
          <Route path="/" element={<KickCounter />} />
          <Route path="/contraction" element={<ContractionTimer />} />
          <Route path="/bag" element={<HospitalBag />} />
          <Route path="/feeding" element={<FeedingLog />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {hasBottomNav && (
        <nav
          className="floating-dock border-t border-black/5 bg-white/80 text-duo-gray-dark dark:border-white/10 dark:bg-[#16162a]/90"
          style={{ paddingBottom: isStandalone ? "env(safe-area-inset-bottom)" : undefined }}
        >
          <ul className="flex justify-around gap-1 overflow-x-auto py-2 text-xs">
            {navItems.map(({ to, label, end }) => (
              <li key={to} className="shrink-0">
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `block whitespace-nowrap px-2 py-1.5 font-medium transition-colors rounded-lg ${isActive ? "text-duo-green bg-duo-green/10 dark:text-duo-green-light dark:bg-duo-green/20" : "text-duo-gray-dark hover:text-duo-green dark:hover:text-duo-green-light"}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
