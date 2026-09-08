// ============================================================
// Sidebar.jsx — Navigation Sidebar (Desktop) & Mobile Drawer
// ============================================================
import React from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  Wrench,
  FileText,
  FileCheck2,
  ShieldAlert,
  AlertTriangle,
  X,
  LogOut,
  User,
  Fuel,
} from "lucide-react";
import { useAppData } from "../../store/AppDataProvider";
import { cx } from "../../lib/helpers";

export const NAV_ITEMS = [
  { id: "dashboard",   name: "Dashboard",            desc: "ภาพรวมระบบ",       icon: LayoutDashboard },
  { id: "inspection",  name: "Inspection Checklist", desc: "บันทึกแบบตรวจเช็ค (2 Tracks)", icon: ClipboardCheck },
  { id: "workorder",   name: "Work Orders",          desc: "ติดตามใบแจ้งซ่อม",  icon: Wrench },
  { id: "fuel",        name: "Fuel & Fleet",         desc: "บริหารเชื้อเพลิง & วางแผน", icon: Fuel },
  { id: "procurement", name: "E-Procurement",        desc: "งพ.001 / งพ.003 (Word/PDF)", icon: FileText },
  { id: "reports",     name: "Official Reports",     desc: "รายงานประจำปี & สรุปผล PDF", icon: FileCheck2 },
  { id: "admin",       name: "Admin Console",        desc: "จัดการระบบ & แคตตาล็อก", icon: ShieldAlert },
];

export function Sidebar({ menuOpen, setMenuOpen, currentUser, onLogout }) {
  const { page, setPage, workOrders, stats } = useAppData();

  const urgentCount = stats?.urgent ?? workOrders.filter((w) => w.priority === "urgent" && w.status < 6).length;
  const openCount = stats?.open ?? workOrders.filter((w) => w.status < 6).length;

  const handleNav = (id) => {
    setPage(id);
    if (setMenuOpen) setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="no-print fixed top-[52px] bottom-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        {/* Brand Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 bg-slate-50/60">
          <img
            src="/mahidol-logo.png"
            alt="Mahidol University"
            className="h-8 w-auto rounded-md bg-white p-0.5 shadow-xs ring-1 ring-slate-200"
          />
          <div className="min-w-0">
            <p className="text-xs font-black leading-tight text-[#123B63] truncate">Facility &amp; Safety Platform</p>
            <p className="text-[10px] font-semibold text-[#D6A84F] truncate">งานพันธกิจเพื่อสังคม ลำปาง</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
          {NAV_ITEMS.filter((n) => n.id !== "admin" || ["admin", "dean", "deputy_dean", "finance_head", "section_head"].includes(currentUser?.role)).map((n) => {
            const Icon = n.icon;
            const on = page === n.id;
            return (
              <button
                key={n.id}
                onClick={() => handleNav(n.id)}
                className={cx(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200",
                  on
                    ? "bg-[#123B63] text-white shadow-md shadow-[#123B63]/25 border-l-4 border-[#D6A84F]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-[#123B63]"
                )}
              >
                <Icon
                  className={cx(
                    "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                    on ? "text-[#D6A84F]" : "text-slate-400 group-hover:text-[#123B63]"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{n.name}</p>
                  <p className={cx("truncate text-[11px]", on ? "text-blue-100" : "text-slate-400")}>
                    {n.desc}
                  </p>
                </div>
                {n.id === "workorder" && openCount > 0 && (
                  <span
                    className={cx(
                      "rounded-full px-2 py-0.5 text-[10px] font-black",
                      on ? "bg-[#D6A84F] text-[#123B63]" : "bg-slate-200 text-slate-700"
                    )}
                  >
                    {openCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Urgent Alert Banner in Sidebar */}
        <div className="m-3 rounded-2xl bg-gradient-to-br from-[#123B63] via-[#0e2b42] to-slate-900 p-4 text-white border border-white/10 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#D6A84F]" />
            <p className="text-xs font-bold text-white">แจ้งเตือนเร่งด่วน</p>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-white">
            {urgentCount} <span className="text-xs font-medium text-blue-200">รายการ</span>
          </p>
          <button
            onClick={() => handleNav("workorder")}
            className="mt-2.5 w-full rounded-lg bg-white/15 py-1.5 text-[11px] font-bold text-white backdrop-blur transition hover:bg-[#D6A84F] hover:text-[#123B63] active:scale-95"
          >
            ตรวจสอบทันที
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 animate-fade bg-white p-4 shadow-2xl flex flex-col">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/mahidol-logo.png"
                  alt="Mahidol University"
                  className="h-8 w-auto rounded-md bg-white p-0.5 shadow-xs ring-1 ring-slate-200"
                />
                <div>
                  <p className="text-xs font-black text-[#123B63]">Facility &amp; Safety</p>
                  <p className="text-[10px] text-[#D6A84F] font-semibold">งานพันธกิจเพื่อสังคม</p>
                </div>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1.5 flex-1 overflow-y-auto">
              {NAV_ITEMS.filter((n) => n.id !== "admin" || ["admin", "dean", "deputy_dean", "finance_head", "section_head"].includes(currentUser?.role)).map((n) => {
                const Icon = n.icon;
                const on = page === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleNav(n.id)}
                    className={cx(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition",
                      on ? "bg-[#123B63] text-white border-l-4 border-[#D6A84F]" : "text-slate-600 hover:bg-slate-100 hover:text-[#123B63]"
                    )}
                  >
                    <Icon className={cx("h-5 w-5 shrink-0", on ? "text-[#D6A84F]" : "text-slate-400")} />
                    <div>
                      <p className="text-sm font-bold">{n.name}</p>
                      <p className={cx("text-[11px]", on ? "text-blue-100" : "text-slate-400")}>
                        {n.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
