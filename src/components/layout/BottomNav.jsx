// ============================================================
// BottomNav.jsx — Compact mobile quick navigation
// ============================================================
import React from "react";
import { LayoutDashboard, ClipboardCheck, Wrench, Fuel, FileText } from "lucide-react";
import { useAppData } from "../../store/AppDataProvider";
import { cx } from "../../lib/helpers";

const ITEMS = [
  { id: "dashboard", label: "ภาพรวม", icon: LayoutDashboard },
  { id: "inspection", label: "ตรวจเช็ค", icon: ClipboardCheck },
  { id: "workorder", label: "งานซ่อม", icon: Wrench },
  { id: "fuel", label: "เชื้อเพลิง", icon: Fuel },
  { id: "procurement", label: "เอกสาร", icon: FileText },
];

export function BottomNav() {
  const { page, setPage } = useAppData();
  const handleNav = (id) => { setPage(id); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return (
    <nav className="facility-bottom-nav no-print fixed inset-x-0 bottom-0 z-40 border-t border-[#e2e8f0] bg-white/95 backdrop-blur-md lg:hidden" aria-label="เมนูลัด">
      <div className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const Icon = item.icon; const active = page === item.id;
          return <button key={item.id} onClick={() => handleNav(item.id)} className="relative flex min-h-[62px] flex-col items-center justify-center gap-1 transition active:scale-95">
            {active && <span className="absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-[#d6a84f]" />}
            <Icon className={cx("h-[19px] w-[19px]", active ? "text-[#163a66]" : "text-[#98a2b3]")} />
            <span className={cx("text-[10px] font-bold", active ? "text-[#163a66]" : "text-[#98a2b3]")}>{item.label}</span>
          </button>;
        })}
      </div>
    </nav>
  );
}
