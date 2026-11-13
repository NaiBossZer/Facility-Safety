// ============================================================
// AdminPage.jsx — Consolidated administration workspace
// ============================================================
import React, { useState } from "react";
import {
  ShieldCheck,
  Layers,
  Building2,
  Store,
  CircleDollarSign,
  Settings,
  ArrowLeft,
  Users,
  Wrench,
  Car,
  ShieldAlert,
} from "lucide-react";
import { CatalogManager } from "./CatalogManager";
import {
  BuildingManager,
  VendorManager,
  BudgetManager,
  SettingsManager,
} from "./OtherManagers";
import { PersonnelManager } from "./PersonnelManager";
import { AssetManager } from "./AssetManager";
import { VehicleManager } from "./VehicleManager";
import { AuditTrailViewer } from "./AuditTrailViewer";
import { cx } from "../../lib/helpers";

const TABS = [
  { id: "personnel", name: "บุคลากร", section: "people", icon: Users },
  { id: "catalog", name: "หมวดและรายการตรวจ", section: "master", icon: Layers },
  { id: "asset", name: "ครุภัณฑ์", section: "master", icon: Wrench },
  { id: "vehicle", name: "ยานพาหนะ", section: "master", icon: Car },
  { id: "building", name: "ข้อมูลอาคาร", section: "master", icon: Building2 },
  { id: "vendor", name: "ผู้ขาย", section: "finance", icon: Store },
  { id: "budget", name: "งบประมาณ", section: "finance", icon: CircleDollarSign },
  { id: "audit", name: "ประวัติการใช้งาน", section: "system", icon: ShieldAlert },
  { id: "settings", name: "ตั้งค่าและสำรองข้อมูล", section: "system", icon: Settings },
];

const SECTIONS = [
  { id: "people", name: "บุคลากร", description: "รายชื่อและผู้รับผิดชอบ", icon: Users },
  { id: "master", name: "ทะเบียนและมาตรฐาน", description: "ข้อมูลกลางที่ระบบใช้ร่วมกัน", icon: Layers },
  { id: "finance", name: "ผู้ขายและงบประมาณ", description: "ข้อมูลสนับสนุนการจัดซื้อ", icon: CircleDollarSign },
  { id: "system", name: "ระบบและตรวจสอบ", description: "ประวัติ การตั้งค่า และสำรองข้อมูล", icon: ShieldCheck },
];

export function AdminPage({ onExit }) {
  const [activeSection, setActiveSection] = useState("people");
  const [activeTab, setActiveTab] = useState("personnel");
  const sectionTabs = TABS.filter((tab) => tab.section === activeSection);

  const selectSection = (section) => {
    setActiveSection(section);
    const firstTab = TABS.find((tab) => tab.section === section);
    if (firstTab) setActiveTab(firstTab.id);
  };

  return (
    <div className="space-y-5 animate-fade">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-[#002D62] p-2.5 text-white shadow-md">
            <ShieldCheck className="h-6 w-6 text-[#F2A900]" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-[#002D62]">ศูนย์จัดการระบบ</h2>
            <p className="text-xs text-slate-400">รวมข้อมูลบุคลากร ทะเบียนกลาง การเงิน และการตั้งค่าไว้ในที่เดียว</p>
          </div>
        </div>
        <button onClick={onExit} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 active:scale-95">
          <ArrowLeft className="h-3.5 w-3.5" /> กลับหน้าภาพรวม
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const active = activeSection === section.id;
          return (
            <button key={section.id} onClick={() => selectSection(section.id)}
              className={cx("flex min-w-0 items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition",
                active ? "border-[#002D62] bg-[#002D62] text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50")}>
              <Icon className={cx("h-5 w-5 shrink-0", active ? "text-[#F2A900]" : "text-slate-400")} />
              <span className="min-w-0">
                <span className="block truncate text-xs font-extrabold">{section.name}</span>
                <span className={cx("mt-0.5 block truncate text-[10px]", active ? "text-blue-100" : "text-slate-400")}>{section.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {sectionTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cx("flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition",
                active ? "bg-[#DCE8F2] text-[#002D62] ring-1 ring-[#9DB5CC]" : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800")}>
              <Icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      <main>
        {activeTab === "personnel" && <PersonnelManager />}
        {activeTab === "catalog" && <CatalogManager />}
        {activeTab === "asset" && <AssetManager />}
        {activeTab === "vehicle" && <VehicleManager />}
        {activeTab === "building" && <BuildingManager />}
        {activeTab === "vendor" && <VendorManager />}
        {activeTab === "budget" && <BudgetManager />}
        {activeTab === "audit" && <AuditTrailViewer />}
        {activeTab === "settings" && <SettingsManager />}
      </main>
    </div>
  );
}

export default AdminPage;
