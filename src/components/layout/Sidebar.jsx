// ============================================================
// Sidebar.jsx — Task-based navigation for a single administrator
// ============================================================
import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  Wrench,
  FileText,
  FileCheck2,
  ShieldAlert,
  X,
  Fuel,
  MapPinned,
  Users,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useAppData } from "../../store/AppDataProvider";
import { cx } from "../../lib/helpers";

export const NAV_ITEMS = [
  { id: "dashboard", name: "ภาพรวม", desc: "สถานะและงานที่ต้องติดตาม", icon: LayoutDashboard },
  { id: "inspection", name: "แบบตรวจอาคาร", desc: "แบบตรวจมาตรฐาน 2 Tracks", icon: ClipboardCheck },
  { id: "sobprap-safety", name: "แบบตรวจความปลอดภัยสบปราบ", desc: "แบบฟอร์ม FM_0000 – FM_6000", icon: ShieldAlert },
  { id: "facility-mapping", name: "แผนงานและข้อมูลอาคาร", desc: "ปฏิทิน แผนบำรุงรักษา และพื้นที่", icon: MapPinned },
  { id: "facility-templates", name: "แม่แบบการตรวจ", desc: "จัดการรายการตรวจตามประเภทอาคาร", icon: ClipboardCheck },
  { id: "facility-assignments", name: "มอบหมายผู้ตรวจ", desc: "กำหนดผู้ตรวจรับผิดชอบแต่ละอาคาร", icon: Users },
  { id: "facility-review", name: "ทบทวนผลการตรวจ", desc: "ประเมินความเสี่ยงและติดตามผล", icon: ShieldCheck },
  { id: "workorder", name: "งานซ่อมบำรุง", desc: "ติดตามใบแจ้งซ่อมและงานค้าง", icon: Wrench },
  { id: "fuel", name: "เชื้อเพลิงและยานพาหนะ", desc: "บริหารการใช้เชื้อเพลิงและรถ", icon: Fuel },
  { id: "procurement", name: "จัดซื้อจัดจ้าง", desc: "เอกสาร งพ.001 / งพ.003", icon: FileText },
  { id: "reports", name: "รายงาน", desc: "รายงานผลและเอกสารสรุป", icon: FileCheck2 },
  { id: "admin", name: "ตั้งค่าระบบ", desc: "บุคลากร ข้อมูลกลาง และสิทธิ์", icon: ShieldAlert },
];

const NAV_GROUPS = [
  { id: "overview", label: "ภาพรวม", items: ["dashboard"] },
  { id: "inspection", label: "การตรวจและความปลอดภัย", items: ["inspection", "sobprap-safety"] },
  { id: "facility", label: "อาคารและแผนบำรุงรักษา", items: ["facility-mapping", "facility-templates", "facility-assignments", "facility-review"] },
  { id: "operations", label: "งานซ่อมและทรัพยากร", items: ["workorder", "fuel"] },
  { id: "finance", label: "จัดซื้อและรายงาน", items: ["procurement", "reports"] },
  { id: "system", label: "ข้อมูลกลางและผู้ดูแล", items: ["admin"] },
];

const getGroupForPage = (page) => NAV_GROUPS.find((group) => group.items.includes(page))?.id || "overview";

export function Sidebar({ menuOpen, setMenuOpen, currentUser }) {
  const { page, setPage, workOrders, stats } = useAppData();
  const [expandedGroup, setExpandedGroup] = useState(() => getGroupForPage(page));
  const openCount = stats?.open ?? workOrders.filter((w) => w.status < 6).length;
  const canManage = ["admin", "dean", "deputy_dean", "finance_head", "section_head"].includes(currentUser?.role);

  useEffect(() => {
    setExpandedGroup(getGroupForPage(page));
  }, [page]);

  const handleNav = (id) => {
    setPage(id);
    setExpandedGroup(getGroupForPage(id));
    if (setMenuOpen) setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderGroups = () => NAV_GROUPS.map((group) => {
    const items = group.items
      .map((id) => NAV_ITEMS.find((item) => item.id === id))
      .filter((item) => item && (item.id !== "admin" || canManage));
    if (!items.length) return null;
    const expanded = expandedGroup === group.id;
    const active = items.some((item) => item.id === page);
    return (
      <section key={group.id} className="space-y-1">
        <button
          type="button"
          onClick={() => setExpandedGroup((current) => current === group.id ? null : group.id)}
          aria-expanded={expanded}
          className={cx(
            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[11px] font-extrabold tracking-wide transition",
            active ? "bg-blue-50 text-[#123B63]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          )}
        >
          <span>{group.label}</span>
          <ChevronDown className={cx("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
        </button>
        {expanded && (
          <div className="space-y-1 pl-1">
            {items.map((item) => {
              const Icon = item.icon;
              const on = page === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={cx(
                    "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                    on
                      ? "border-l-4 border-[#D6A84F] bg-[#123B63] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#123B63]"
                  )}
                >
                  <Icon className={cx("h-4.5 w-4.5 shrink-0", on ? "text-[#D6A84F]" : "text-slate-400 group-hover:text-[#123B63]")} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold">{item.name}</span>
                    <span className={cx("block truncate text-[10px]", on ? "text-blue-100" : "text-slate-400")}>{item.desc}</span>
                  </span>
                  {item.id === "workorder" && openCount > 0 && (
                    <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-black", on ? "bg-[#D6A84F] text-[#123B63]" : "bg-slate-200 text-slate-700")}>{openCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
    );
  });

  return (
    <>
      <aside className="no-print fixed top-[52px] bottom-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
          <img src="/mahidol-logo.png" alt="Mahidol University" className="h-8 w-auto rounded-md bg-white p-0.5 shadow-xs ring-1 ring-slate-200" />
          <div className="min-w-0">
            <p className="truncate text-xs font-black leading-tight text-[#123B63]">Facility &amp; Safety Platform</p>
            <p className="truncate text-[10px] font-semibold text-[#D6A84F]">งานพันธกิจเพื่อสังคม ลำปาง</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto p-3">{renderGroups()}</nav>
      </aside>

      {menuOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="ปิดเมนู" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[88vw] animate-fade flex-col bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <img src="/mahidol-logo.png" alt="Mahidol University" className="h-8 w-auto rounded-md bg-white p-0.5 shadow-xs ring-1 ring-slate-200" />
                <div>
                  <p className="text-xs font-black text-[#123B63]">Facility &amp; Safety</p>
                  <p className="text-[10px] font-semibold text-[#D6A84F]">งานพันธกิจเพื่อสังคม</p>
                </div>
              </div>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="ปิดเมนู" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex-1 space-y-2 overflow-y-auto">{renderGroups()}</nav>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
