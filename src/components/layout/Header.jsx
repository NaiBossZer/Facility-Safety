// ============================================================
// Header.jsx — Top App Bar with mobile menu toggle & user profile
// ============================================================
import React from "react";
import { Menu, Bell } from "lucide-react";
import { useAppData } from "../../store/AppDataProvider";
import { NAV_ITEMS } from "./Sidebar";
import { thDate } from "../../lib/helpers";

export function Header({ setMenuOpen }) {
  const { page, setPage, workOrders, stats } = useAppData();

  const currentNav = NAV_ITEMS.find((n) => n.id === page) || NAV_ITEMS[0];
  const urgentCount = stats?.urgent ?? workOrders.filter((w) => w.priority === "urgent" && w.status < 6).length;

  const todayThai = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        {/* Left: Mobile hamburger & Page title */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            aria-label="เปิดเมนู"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold text-slate-800 sm:text-lg">
              {currentNav.name}
            </h1>
            <p className="truncate text-[11px] text-slate-400 sm:text-xs">
              {currentNav.desc} · {todayThai}
            </p>
          </div>
        </div>

        {/* Right: Notification bell & User pill */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setPage("workorder")}
            className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 active:scale-95"
            title="ไปที่ Work Orders"
          >
            <Bell className="h-4.5 w-4.5" />
            {urgentCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                {urgentCount}
              </span>
            )}
          </button>

          <div className="hidden items-center gap-2.5 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-3 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-bold text-white">
              สช
            </span>
            <div className="leading-tight">
              <p className="text-xs font-bold text-slate-700">สมชาย ตรวจดี</p>
              <p className="text-[10px] text-slate-400">เจ้าหน้าที่ตรวจอาคาร</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;