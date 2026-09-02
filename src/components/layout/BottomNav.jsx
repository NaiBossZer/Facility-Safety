// ============================================================
// BottomNav.jsx — Mobile Bottom Navigation Bar
// ============================================================
import React from "react";
import { LayoutDashboard, ClipboardCheck, Wrench, FileText } from "lucide-react";
import { useAppData } from "../../store/AppDataProvider";
import { cx } from "../../lib/helpers";

const ITEMS = [
  { id: "dashboard",   label: "ภาพรวม",   icon: LayoutDashboard },
  { id: "inspection",  label: "ตรวจเช็ค", icon: ClipboardCheck },
  { id: "workorder",   label: "งานซ่อม",   icon: Wrench },
  { id: "procurement", label: "เอกสาร",   icon: FileText },
];

export function BottomNav() {
  const { page, setPage } = useAppData();

  const handleNav = (id) => {
    setPage(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden">
      <div className="grid grid-cols-4">
        {ITEMS.map((n) => {
          const Icon = n.icon;
          const on = page === n.id;
          return (
            <button
              key={n.id}
              onClick={() => handleNav(n.id)}
              className="relative flex flex-col items-center gap-1 py-2.5 transition active:scale-95"
            >
              {on && (
                <span className="absolute inset-x-5 top-0 h-1 rounded-b-full bg-indigo-600" />
              )}
              <Icon
                className={cx("h-5 w-5 transition", on ? "text-indigo-600" : "text-slate-400")}
              />
              <span
                className={cx("text-[10px] font-bold", on ? "text-indigo-600" : "text-slate-400")}
              >
                {n.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
