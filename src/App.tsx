import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import KickCounter from "./pages/KickCounter.tsx";
import Settings from "./pages/Settings.tsx";

const navItems = [
  { to: "/", label: "数胎动", end: true },
  { to: "/settings", label: "设置", end: false },
];

export default function App() {
  const location = useLocation();
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const hasBottomNav = ["/", "/settings"].some((path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path),
  );

  return (
    <div className="flex h-full flex-col bg-duo-gray dark:bg-[#1a1a2e]">
      <main className="min-h-0 flex-1 overflow-auto pb-safe">
        <Routes>
          <Route path="/" element={<KickCounter />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {hasBottomNav && (
        <nav
          className="floating-dock border-t border-black/5 bg-white/80 text-duo-gray-dark dark:border-white/10 dark:bg-[#16162a]/90"
          style={{ paddingBottom: isStandalone ? "env(safe-area-inset-bottom)" : undefined }}
        >
          <ul className="flex justify-around py-2">
            {navItems.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm font-medium transition-colors ${isActive ? "text-duo-green dark:text-duo-green-light" : "text-duo-gray-dark hover:text-duo-green dark:hover:text-duo-green-light"}`
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
