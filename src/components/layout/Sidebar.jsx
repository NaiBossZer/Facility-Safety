// ============================================================
// Sidebar.jsx — Portal-style grouped navigation and mobile drawer
// ============================================================
import React from "react";
import {
  LayoutDashboard, ClipboardCheck, Wrench, FileText, FileCheck2,
  ShieldAlert, AlertTriangle, X, LogOut, Fuel, ChevronDown, Building2
} from "lucide-react";
import { useAppData } from "../../store/AppDataProvider";
import { cx } from "../../lib/helpers";

export const NAV_ITEMS = [
  { id: "dashboard", name: "ภาพรวมระบบ", desc: "Dashboard และตัวชี้วัด", group: "overview", icon: LayoutDashboard },
  { id: "inspection", name: "แบบตรวจสอบอาคาร", desc: "Inspection Checklist", group: "inspection", icon: ClipboardCheck },
  { id: "sobprap-safety", name: "Checklist สบปราบ", desc: "แบบตรวจ FM_0000 – FM_6000", group: "inspection", icon: ShieldAlert },
  { id: "workorder", name: "รายการแจ้งซ่อม", desc: "ติดตามและแก้ไขข้อบกพร่อง", group: "operations", icon: Wrench },
  { id: "fuel", name: "เชื้อเพลิงและยานพาหนะ", desc: "Fuel & Fleet", group: "operations", icon: Fuel },
  { id: "procurement", name: "งานพัสดุและจัดซื้อ", desc: "งพ.001 / งพ.003", group: "reports", icon: FileText },
  { id: "reports", name: "รายงานและเอกสาร", desc: "รายงานประจำปีและ PDF", group: "reports", icon: FileCheck2 },
  { id: "admin", name: "จัดการระบบ", desc: "ผู้ใช้และแคตตาล็อก", group: "settings", icon: Building2 },
];

const GROUPS = [
  { id: "overview", label: "ภาพรวม" },
  { id: "inspection", label: "ตรวจสอบความปลอดภัย" },
  { id: "operations", label: "งานปฏิบัติการ" },
  { id: "reports", label: "รายงานและเอกสาร" },
  { id: "settings", label: "ตั้งค่าระบบ" },
];

export function Sidebar({ menuOpen, setMenuOpen, currentUser, onLogout }) {
  const { page, setPage, workOrders, stats } = useAppData();
  const urgentCount = stats?.urgent ?? workOrders.filter((w) => w.priority === "urgent" && w.status < 6).length;
  const openCount = stats?.open ?? workOrders.filter((w) => w.status < 6).length;
  const canManage = ["admin", "dean", "deputy_dean", "finance_head", "section_head"].includes(currentUser?.role);
  const visibleItems = NAV_ITEMS.filter((item) => item.id !== "admin" || canManage);

  const handleNav = (id) => {
    setPage(id);
    setMenuOpen?.(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navContent = (
    <>
      <div className="facility-sidebar-brand flex min-h-[82px] items-center gap-3 border-b border-white/10 px-4 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm">
          <img src="/mahidol-logo.png" alt="มหาวิทยาลัยมหิดล" className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-extrabold text-white">Facility &amp; Safety</p>
          <p className="mt-1 text-[10px] font-medium leading-relaxed text-[#c5d0dc]">คณะสิ่งแวดล้อมและทรัพยากรศาสตร์</p>
          <span className="mt-1 inline-flex rounded-full border border-[#d6a84f]/40 bg-[#d6a84f]/10 px-2 py-0.5 text-[9px] font-bold text-[#e6c77f]">มหาวิทยาลัยมหิดล · ลำปาง</span>
        </div>
        <button onClick={() => setMenuOpen(false)} className="ml-auto rounded-lg p-1.5 text-slate-300 hover:bg-white/10 lg:hidden" aria-label="ปิดเมนู"><X className="h-5 w-5" /></button>
      </div>

      <nav className="facility-sidebar-nav min-h-0 flex-1 overflow-y-auto px-3 py-5" aria-label="เมนูหลัก">
        {GROUPS.map((group) => {
          const items = visibleItems.filter((item) => item.group === group.id);
          if (!items.length) return null;
          const expanded = items.some((item) => item.id === page) || group.id === "overview";
          return (
            <section key={group.id} className="mb-4">
              <div className="mb-2 flex items-center justify-between px-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#93a6ba]">{group.label}</p>
                {group.id !== "overview" && <ChevronDown className={cx("h-3.5 w-3.5 text-[#738ba3]", expanded && "rotate-180")} />}
              </div>
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = page === item.id;
                  return (
                    <button key={item.id} onClick={() => handleNav(item.id)} aria-current={active ? "page" : undefined}
                      className={cx("facility-nav-item group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
                        active ? "border-[#d6a84f]/35 bg-[#163a66] text-white shadow-sm" : "border-transparent text-[#c3ceda] hover:border-white/10 hover:bg-white/[.07] hover:text-white")}>
                      <Icon className={cx("h-[18px] w-[18px] shrink-0", active ? "text-[#e4c477]" : "text-[#91a4b8] group-hover:text-[#e4c477]")} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-bold">{item.name}</span>
                        <span className={cx("mt-0.5 block truncate text-[10px]", active ? "text-blue-100" : "text-[#91a4b8]")}>{item.desc}</span>
                      </span>
                      {item.id === "workorder" && openCount > 0 && <span className="rounded-full bg-[#d6a84f] px-2 py-0.5 text-[10px] font-extrabold text-[#0c2340]">{openCount}</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </nav>

      <div className="facility-sidebar-footer border-t border-white/10 p-3">
        <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-white/[.06] p-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d6a84f]/40 bg-[#163a66] text-xs font-extrabold text-white">{(currentUser?.name || "MU").slice(0,2)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-white">{currentUser?.name || "ผู้ใช้งานระบบ"}</p>
            <p className="truncate text-[10px] text-[#aab8ca]">{currentUser?.position || currentUser?.role || "บุคลากร"}</p>
          </div>
        </div>
        <div className="flex items-center justify-between px-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] text-[#93a6ba]"><span className="h-1.5 w-1.5 rounded-full bg-[#5f8d62]" />ระบบพร้อมใช้งาน</span>
          <button onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-[#c3ceda] hover:bg-white/10 hover:text-white"><LogOut className="h-3.5 w-3.5" />ออกจากระบบ</button>
        </div>
        {urgentCount > 0 && <button onClick={() => handleNav("workorder")} className="mt-3 flex w-full items-center gap-2 rounded-lg border border-[#c66b4f]/30 bg-[#c66b4f]/10 px-3 py-2 text-left text-[10px] font-bold text-[#f0b19d]"><AlertTriangle className="h-4 w-4 shrink-0" />มีรายการเร่งด่วน {urgentCount} รายการ</button>}
      </div>
    </>
  );

  return (
    <>
      <aside className="facility-sidebar no-print fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col bg-[#0c2340] text-white shadow-xl lg:flex">{navContent}</aside>
      {menuOpen && <div className="facility-mobile-drawer no-print fixed inset-0 z-50 lg:hidden">
        <button className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => setMenuOpen(false)} aria-label="ปิดเมนู" />
        <aside className="absolute inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col bg-[#0c2340] text-white shadow-2xl animate-fade">{navContent}</aside>
      </div>}
    </>
  );
}
