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
  { id: "sobprap-safety", name: "Safety Checklist สบปราบ", desc: "แบบตรวจ FM_0000 – FM_6000", icon: ShieldAlert },
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
      <aside className="no-print fixed top-[52px] bottom-0 left-0 z-40 hidden w-[260px] flex-col border-r border-white/10 bg-[#0c2340] text-white shadow-xl lg:flex">
        {/* Brand Header */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-5 py-5">
          <img
            src="/mahidol-logo.png"
            alt="Mahidol University"
            className="h-9 w-auto rounded-xl bg-white p-1 shadow ring-1 ring-white/20"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-black leading-tight text-white">Facility &amp; Safety Platform</p>
            <p className="truncate text-[10px] font-semibold text-[#aab8ca]">งานพันธกิจเพื่อสังคม ลำปาง</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6">
          {NAV_ITEMS.filter((n) => n.id !== "admin" || ["admin", "dean", "deputy_dean", "finance_head", "section_head"].includes(currentUser?.role)).map((n) => {
            const Icon = n.icon;
            const on = page === n.id;
            return (
              <button
                key={n.id}
                onClick={() => handleNav(n.id)}
                className={cx(
                  "group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-all duration-200",
                  on
                    ? "border-[#d6a84f]/40 bg-[#163a66] text-white shadow-lg shadow-black/20"
                    : "text-[#bbcad9] hover:border-white/10 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon
                  className={cx(
                    "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                    on ? "text-white" : "text-[#9aa8ba] group-hover:text-[#d6a84f]"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{n.name}</p>
                  <p className={cx("truncate text-[11px]", on ? "text-blue-100" : "text-[#9aa8ba]")}>
                    {n.desc}
                  </p>
                </div>
                {n.id === "workorder" && openCount > 0 && (
                  <span
                    className={cx(
                      "rounded-full px-2 py-0.5 text-[10px] font-black",
                      on ? "bg-[#D6A84F] text-[#0c2340]" : "bg-slate-200 text-slate-700"
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
        <div className="m-3 rounded-2xl bg-gradient-to-br from-[#0c2340] via-[#163a66] to-[#0c2340] p-4 text-white border border-white/10 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#D6A84F]" />
            <p className="text-xs font-bold text-white">แจ้งเตือนเร่งด่วน</p>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-white">
            {urgentCount} <span className="text-xs font-medium text-blue-200">รายการ</span>
          </p>
          <button
            onClick={() => handleNav("workorder")}
            className="mt-2.5 w-full rounded-lg bg-white/15 py-1.5 text-[11px] font-bold text-white backdrop-blur transition hover:bg-[#d6a84f] hover:text-[#0c2340] active:scale-95"
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
          <div className="absolute inset-y-0 left-0 w-72 animate-fade bg-[#0c2340] p-4 text-white shadow-2xl flex flex-col">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/mahidol-logo.png"
                  alt="Mahidol University"
                  className="h-8 w-auto rounded-lg bg-white p-1 shadow ring-1 ring-white/20"
                />
                <div>
                  <p className="text-xs font-black text-white">Facility &amp; Safety</p>
                  <p className="text-[10px] text-[#aab8ca] font-semibold">งานพันธกิจเพื่อสังคม</p>
                </div>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-2 text-slate-300 hover:bg-white/10"
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
                      "flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition",
                      on ? "border-[#d6a84f]/40 bg-[#163a66] text-white shadow-lg" : "text-[#bbcad9] hover:border-white/10 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className={cx("h-5 w-5 shrink-0", on ? "text-white" : "text-[#9aa8ba]")} />
                    <div>
                      <p className="text-sm font-bold">{n.name}</p>
                      <p className={cx("text-[11px]", on ? "text-blue-100" : "text-[#9aa8ba]")}>
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
