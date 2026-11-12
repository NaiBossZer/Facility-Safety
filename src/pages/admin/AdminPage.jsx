// ============================================================
// AdminPage.jsx — Admin Console protected by the shared Supabase session
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
  { id: "personnel", name: "บุคลากร & ผู้รับผิดชอบ", icon: Users },
  { id: "catalog", name: "หมวด & รายการตรวจ", icon: Layers },
  { id: "asset", name: "ครุภัณฑ์ (Assets)", icon: Wrench },
  { id: "vehicle", name: "ยานพาหนะ (Vehicles)", icon: Car },
  { id: "building", name: "ข้อมูลอาคาร", icon: Building2 },
  { id: "vendor", name: "ร้านค้า/ผู้ขาย", icon: Store },
  { id: "budget", name: "งบประมาณ", icon: CircleDollarSign },
  { id: "audit", name: "บันทึกตรวจสอบ (Audit)", icon: ShieldAlert },
  { id: "settings", name: "ตั้งค่าระบบ & สำรอง", icon: Settings },
];

export function AdminPage({ onExit }) {
  const [activeTab, setActiveTab] = useState("personnel");

  return (
    <div className="space-y-6 animate-fade">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-[#002D62] p-2.5 text-white shadow-md">
            <ShieldCheck className="h-6 w-6 text-[#F2A900]" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-[#002D62]">ระบบจัดการผู้ดูแลระบบ (Admin Console)</h2>
            <p className="text-xs text-slate-400">
              ใช้บัญชีและสิทธิ์ผู้ดูแลจาก Mahidol Lampang Portal โดยตรง
            </p>
          </div>
        </div>
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> กลับหน้าภาพรวม
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cx(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition active:scale-95",
                active
                  ? "bg-[#002D62] text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
              )}
            >
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
