// ============================================================
// Header.jsx — Top App Bar with mobile menu toggle & user profile
// ============================================================
import React from "react";
import { Menu, Bell, LogOut, User } from "lucide-react";
import { useAppData } from "../../store/AppDataProvider";
import { NAV_ITEMS } from "./Sidebar";
import { thDate } from "../../lib/helpers";

export function Header({ setMenuOpen, currentUser, onLogout }) {
  const { page, setPage, workOrders, stats } = useAppData();

  const currentNav = NAV_ITEMS.find((n) => n.id === page) || NAV_ITEMS[0];
  const urgentCount = stats?.urgent ?? workOrders.filter((w) => w.priority === "urgent" && w.status < 6).length;

  const todayThai = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const userName = currentUser?.name || "ผู้ใช้งานระบบ";
  const userPos = currentUser?.position || "บุคลากร";
  const initials = userName.slice(0, 2);

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

        {/* Right: Notification bell & User Profile */}
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

          {/* Logged in User Pill */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-1 pl-1.5 pr-2 sm:py-1.5 sm:pr-3">
            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#002D62] text-xs font-bold text-white shadow-sm">
              {initials}
            </span>
            <div className="hidden sm:block leading-tight min-w-0">
              <p className="truncate text-xs font-bold text-slate-800">{userName}</p>
              <p className="truncate text-[10px] text-slate-500">{userPos}</p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="ml-1 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                title="ออกจากระบบ"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;