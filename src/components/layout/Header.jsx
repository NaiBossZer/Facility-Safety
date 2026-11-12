// ============================================================
// Header.jsx — Portal-style page context and account header
// ============================================================
import React from "react";
import { Menu, Bell, LogOut, ChevronRight } from "lucide-react";
import { useAppData } from "../../store/AppDataProvider";
import { NAV_ITEMS } from "./Sidebar";

export function Header({ setMenuOpen, currentUser, onLogout }) {
  const { page, setPage, workOrders, stats } = useAppData();
  const currentNav = NAV_ITEMS.find((item) => item.id === page) || NAV_ITEMS[0];
  const urgentCount = stats?.urgent ?? workOrders.filter((item) => item.priority === "urgent" && item.status < 6).length;
  const todayThai = new Date().toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const userName = currentUser?.name || "ผู้ใช้งานระบบ";
  const userPos = currentUser?.position || currentUser?.role || "บุคลากร";

  return (
    <header className="facility-top-header no-print sticky top-0 z-30 border-b border-[#e2e8f0] bg-white/95 backdrop-blur-md">
      <div className="flex min-h-[68px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={() => setMenuOpen(true)} className="rounded-lg border border-slate-200 p-2 text-[#0c2340] hover:bg-slate-50 lg:hidden" aria-label="เปิดเมนู"><Menu className="h-5 w-5" /></button>
          <div className="min-w-0">
            <div className="hidden items-center gap-1.5 text-[10px] font-semibold text-[#98a2b3] sm:flex">
              <span>Facility &amp; Safety</span><ChevronRight className="h-3 w-3" /><span className="text-[#667085]">{currentNav.name}</span>
            </div>
            <h1 className="truncate text-[15px] font-extrabold leading-tight text-[#0c2340] sm:mt-1 sm:text-base">{currentNav.name}</h1>
            <p className="mt-0.5 hidden text-[10px] text-[#98a2b3] md:block">{currentNav.desc} <span className="px-1">·</span> {todayThai}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button onClick={() => setPage("workorder")} className="relative rounded-lg border border-[#e2e8f0] p-2 text-[#667085] transition hover:bg-[#f4f6fb]" title="ดูรายการแจ้งซ่อม" aria-label="การแจ้งเตือนรายการเร่งด่วน">
            <Bell className="h-4 w-4" />
            {urgentCount > 0 && <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c66b4f] px-1 text-[9px] font-bold text-white ring-2 ring-white">{urgentCount}</span>}
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] py-1 pl-1.5 pr-2 sm:pr-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0c2340] text-[11px] font-extrabold text-white ring-1 ring-[#d6a84f]/50">{userName.slice(0,2)}</span>
            <div className="hidden min-w-0 sm:block">
              <p className="max-w-[150px] truncate text-[11px] font-bold text-[#1f2933]">{userName}</p>
              <p className="max-w-[150px] truncate text-[10px] text-[#667085]">{userPos}</p>
            </div>
            <button onClick={onLogout} className="ml-1 rounded-lg p-1.5 text-[#98a2b3] transition hover:bg-red-50 hover:text-red-600" title="ออกจากระบบ" aria-label="ออกจากระบบ"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </header>
  );
}
