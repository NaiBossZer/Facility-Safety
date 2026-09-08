// ============================================================
// VehicleManager.jsx — Master Data: ยานพาหนะราชการ & ข้อมูลบัตรเติมน้ำมัน
// ============================================================
import React, { useState } from "react";
import {
  Car,
  Search,
  Plus,
  Edit2,
  X,
  CreditCard,
  Gauge,
  UserCheck,
} from "lucide-react";
import { useAppData } from "../../store/AppDataProvider";
import { Badge } from "../../components/ui/Badge";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { fmt } from "../../lib/helpers";

export function VehicleManager() {
  const { fuelVehicles, addVehicle, updateVehicle } = useAppData();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const filteredVehicles = (fuelVehicles || []).filter((v) => {
    const q = search.toLowerCase();
    return (
      v.plateNumber?.toLowerCase().includes(q) ||
      v.brandModel?.toLowerCase().includes(q) ||
      v.primaryDriver?.toLowerCase().includes(q) ||
      v.fleetCardNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SectionTitle
          icon={Car}
          title={`ยานพาหนะราชการ & บัตรเติมน้ำมัน (${(fuelVehicles || []).length} คัน)`}
          desc="ทะเบียนรถ, พนักงานขับรถประจำ, บัตร PTT Fleet Card, และรอบการซ่อมบำรุง"
        />
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[#002D62] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-900 active:scale-95 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" /> เพิ่มยานพาหนะใหม่
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาทะเบียนรถ, ยี่ห้อ, พนักงานขับรถ หรือเลขบัตร Fleet Card…"
            className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Vehicle Grid Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredVehicles.map((v) => (
          <div
            key={v.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-md">
                    <Car className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {v.plateNumber} {v.province}
                    </h3>
                    <p className="text-xs text-slate-500">{v.brandModel}</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  {v.status || "active"}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">พนักงานขับรถ</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <UserCheck className="h-3.5 w-3.5 text-blue-600" /> {v.primaryDriver || "-"}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">เลขไมล์ล่าสุด</span>
                  <span className="font-black text-slate-900 flex items-center gap-1 mt-0.5">
                    <Gauge className="h-3.5 w-3.5 text-indigo-600" /> {fmt(v.currentOdometer)} กม.
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">อัตราสิ้นเปลือง</span>
                  <span className="font-black text-emerald-600 mt-0.5 block">
                    {v.avgConsumptionKmPerLiter} กม./ลิตร
                  </span>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-blue-600" /> {v.fuelType}
                  </span>
                  <span className="text-[11px] text-blue-700">วงเงิน {fmt(v.fleetCardLimitMonthly)} บ./ด.</span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-slate-500">
                  บัตรเลขที่: {v.fleetCardNumber || "-"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400">
                รอบเช็คระยะถัดไป: <b className="text-slate-700">{fmt(v.nextMaintenanceKm)} กม.</b>
              </span>
              <button
                onClick={() => setEditingVehicle(v)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 active:scale-95"
              >
                <Edit2 className="h-3 w-3" /> แก้ไขข้อมูล
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Vehicle */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-fade">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                เพิ่มยานพาหนะราชการใหม่
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                addVehicle({
                  plateNumber: fd.get("plateNumber"),
                  province: fd.get("province"),
                  brandModel: fd.get("brandModel"),
                  type: fd.get("type"),
                  primaryDriver: fd.get("primaryDriver"),
                  currentOdometer: Number(fd.get("currentOdometer")) || 0,
                  avgConsumptionKmPerLiter: Number(fd.get("avgConsumptionKmPerLiter")) || 11.5,
                  fleetCardNumber: fd.get("fleetCardNumber"),
                  fleetCardLimitMonthly: Number(fd.get("fleetCardLimitMonthly")) || 15000,
                  nextMaintenanceKm: Number(fd.get("nextMaintenanceKm")) || 10000,
                });
                setShowAddModal(false);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ทะเบียนรถ</label>
                  <input
                    type="text"
                    name="plateNumber"
                    required
                    placeholder="เช่น 6ฝ-0559"
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">จังหวัด</label>
                  <input
                    type="text"
                    name="province"
                    defaultValue="กรุงเทพมหานคร"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ยี่ห้อ / รุ่น</label>
                <input
                  type="text"
                  name="brandModel"
                  required
                  placeholder="เช่น Toyota Hilux Revo 2.4"
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">พนักงานขับรถประจำ</label>
                  <input
                    type="text"
                    name="primaryDriver"
                    defaultValue="จตุพร"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">เลขไมล์ปัจจุบัน</label>
                  <input
                    type="number"
                    name="currentOdometer"
                    defaultValue="0"
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">เลขบัตร Fleet Card</label>
                  <input
                    type="text"
                    name="fleetCardNumber"
                    placeholder="PTT-FLEET-..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">อัตรา กม./ลิตร</label>
                  <input
                    type="number"
                    name="avgConsumptionKmPerLiter"
                    step="0.1"
                    defaultValue="11.5"
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#002D62] py-2.5 font-bold text-white shadow-md hover:bg-blue-900"
                >
                  บันทึกยานพาหนะ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Vehicle */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-fade">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">
                แก้ไขข้อมูลรถยนต์ {editingVehicle.plateNumber}
              </h3>
              <button onClick={() => setEditingVehicle(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                updateVehicle(editingVehicle.id, {
                  primaryDriver: fd.get("primaryDriver"),
                  fleetCardNumber: fd.get("fleetCardNumber"),
                  nextMaintenanceKm: Number(fd.get("nextMaintenanceKm")),
                  avgConsumptionKmPerLiter: Number(fd.get("avgConsumptionKmPerLiter")),
                });
                setEditingVehicle(null);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">พนักงานขับรถประจำ</label>
                <input
                  type="text"
                  name="primaryDriver"
                  defaultValue={editingVehicle.primaryDriver}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">เลขบัตร Fleet Card</label>
                <input
                  type="text"
                  name="fleetCardNumber"
                  defaultValue={editingVehicle.fleetCardNumber}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">รอบเช็คระยะถัดไป (กม.)</label>
                  <input
                    type="number"
                    name="nextMaintenanceKm"
                    defaultValue={editingVehicle.nextMaintenanceKm}
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">อัตราสิ้นเปลือง (กม./ลิตร)</label>
                  <input
                    type="number"
                    name="avgConsumptionKmPerLiter"
                    step="0.1"
                    defaultValue={editingVehicle.avgConsumptionKmPerLiter}
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#002D62] py-2.5 font-bold text-white shadow-md hover:bg-blue-900"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleManager;
