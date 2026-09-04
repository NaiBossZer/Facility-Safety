// ============================================================
// OtherManagers.jsx — Building, Vendor, Budget & Settings Managers
// ============================================================
import React, { useState } from "react";
import {
  Building2,
  Store,
  CircleDollarSign,
  Settings,
  Plus,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Save,
  CheckCircle2,
  Edit2,
  X,
} from "lucide-react";
import { useAppData } from "../../store/AppDataProvider";
import { Badge } from "../../components/ui/Badge";
import { fmt } from "../../lib/helpers";
import { downloadBackup, readBackupFile, applyBackup } from "../../lib/backup";
import { fetchAuditLogs } from "../../lib/supabaseData";

// 1. Building Manager
export function BuildingManager() {
  const { cat, toast } = useAppData();
  const buildings = cat?.allBuildings || [];
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [editingBuilding, setEditingBuilding] = useState(null);

  const handleAdd = () => {
    if (!name.trim()) return toast.error("กรุณากรอกชื่ออาคาร");
    cat.addBuilding({ name, detail });
    setName("");
    setDetail("");
    toast.success("เพิ่มอาคารเรียบร้อย");
  };

  const handleSaveEdit = () => {
    if (!editingBuilding?.name?.trim()) return toast.error("กรุณากรอกชื่ออาคาร");
    cat.updateBuilding(editingBuilding.id, {
      name: editingBuilding.name,
      detail: editingBuilding.detail,
      code: editingBuilding.code,
    });
    setEditingBuilding(null);
    toast.success("อัปเดตข้อมูลอาคารเรียบร้อย");
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-extrabold text-slate-800">จัดการข้อมูลอาคาร/สถานที่</h3>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ชื่ออาคาร เช่น อาคาร 9"
          className="flex-1 rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-400"
        />
        <input
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="รายละเอียด เช่น อาคารศูนย์กีฬา"
          className="flex-1 rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-400"
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 active:scale-95 transition"
        >
          <Plus className="h-4 w-4" /> เพิ่ม
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {buildings.map((b) => (
          <div key={b.id} className="flex items-center justify-between py-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-slate-700">{b.name}</p>
                {b.code && <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{b.code}</span>}
              </div>
              <p className="text-xs text-slate-400">{b.detail || "-"}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingBuilding({ ...b })}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition"
              >
                <Edit2 className="h-3 w-3" /> แก้ไข
              </button>
              <button
                onClick={() => cat.toggleBuilding(b.id, !b.active)}
                className={`text-xs font-bold px-2 py-1 rounded-lg ${b.active !== false ? "text-emerald-700 bg-emerald-50" : "text-slate-400 bg-slate-100"}`}
              >
                {b.active !== false ? "เปิดใช้งาน" : "ปิดใช้งาน"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Building Modal */}
      {editingBuilding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-600" /> แก้ไขข้อมูลอาคาร
              </h4>
              <button onClick={() => setEditingBuilding(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block">
                <span className="font-bold text-slate-700">ชื่ออาคาร</span>
                <input
                  value={editingBuilding.name || ""}
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-bold text-slate-800"
                />
              </label>
              <label className="block">
                <span className="font-bold text-slate-700">รหัสย่ออาคาร</span>
                <input
                  value={editingBuilding.code || ""}
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, code: e.target.value })}
                  placeholder="เช่น BLD-01"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-mono"
                />
              </label>
              <label className="block">
                <span className="font-bold text-slate-700">รายละเอียด</span>
                <input
                  value={editingBuilding.detail || ""}
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, detail: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button onClick={() => setEditingBuilding(null)} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100">
                ยกเลิก
              </button>
              <button onClick={handleSaveEdit} className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700">
                <Save className="h-3.5 w-3.5" /> บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 2. Vendor Manager
export function VendorManager() {
  const { cat, toast } = useAppData();
  const vendors = cat?.allVendors || [];
  const [name, setName] = useState("");
  const [tax, setTax] = useState("");
  const [tel, setTel] = useState("");
  const [editingVendor, setEditingVendor] = useState(null);

  const handleAdd = () => {
    if (!name.trim()) return toast.error("กรุณากรอกชื่อร้านค้า");
    cat.addVendor({ name, tax, tel });
    setName("");
    setTax("");
    setTel("");
    toast.success("เพิ่มร้านค้าเรียบร้อย");
  };

  const handleSaveEdit = () => {
    if (!editingVendor?.name?.trim()) return toast.error("กรุณากรอกชื่อร้านค้า");
    cat.updateVendor(editingVendor.id, {
      name: editingVendor.name,
      tax: editingVendor.tax,
      tel: editingVendor.tel,
    });
    setEditingVendor(null);
    toast.success("อัปเดตข้อมูลร้านค้าเรียบร้อย");
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-extrabold text-slate-800">จัดการข้อมูลร้านค้า/ผู้ขาย</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ชื่อร้านค้า/บริษัท"
          className="rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-400"
        />
        <input
          value={tax}
          onChange={(e) => setTax(e.target.value)}
          placeholder="เลขประจำตัวผู้เสียภาษี"
          className="rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-400"
        />
        <div className="flex gap-2">
          <input
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            placeholder="เบอร์โทรศัพท์"
            className="flex-1 rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-400"
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 active:scale-95 transition"
          >
            <Plus className="h-4 w-4" /> เพิ่ม
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {vendors.map((v) => (
          <div key={v.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-bold text-sm text-slate-700">{v.name}</p>
              <p className="text-xs text-slate-400">
                เลขภาษี: {v.tax || "-"} · โทร: {v.tel || "-"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingVendor({ ...v })}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition"
              >
                <Edit2 className="h-3 w-3" /> แก้ไข
              </button>
              <button
                onClick={() => cat.toggleVendor(v.id, !v.active)}
                className={`text-xs font-bold px-2 py-1 rounded-lg ${v.active !== false ? "text-emerald-700 bg-emerald-50" : "text-slate-400 bg-slate-100"}`}
              >
                {v.active !== false ? "เปิดใช้งาน" : "ปิดใช้งาน"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Vendor Modal */}
      {editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Store className="h-4 w-4 text-indigo-600" /> แก้ไขข้อมูลร้านค้า/ผู้ขาย
              </h4>
              <button onClick={() => setEditingVendor(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block">
                <span className="font-bold text-slate-700">ชื่อร้านค้า/บริษัท</span>
                <input
                  value={editingVendor.name || ""}
                  onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-bold text-slate-800"
                />
              </label>
              <label className="block">
                <span className="font-bold text-slate-700">เลขประจำตัวผู้เสียภาษี</span>
                <input
                  value={editingVendor.tax || ""}
                  onChange={(e) => setEditingVendor({ ...editingVendor, tax: e.target.value })}
                  placeholder="เช่น 0105542001234"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-mono"
                />
              </label>
              <label className="block">
                <span className="font-bold text-slate-700">เบอร์โทรศัพท์</span>
                <input
                  value={editingVendor.tel || ""}
                  onChange={(e) => setEditingVendor({ ...editingVendor, tel: e.target.value })}
                  placeholder="เช่น 02-591-8800"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button onClick={() => setEditingVendor(null)} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100">
                ยกเลิก
              </button>
              <button onClick={handleSaveEdit} className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700">
                <Save className="h-3.5 w-3.5" /> บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 3. Budget Manager
export function BudgetManager() {
  const { catalog, cat, toast } = useAppData();
  const [total, setTotal] = useState(catalog?.budget?.total || 2500000);

  const handleSave = () => {
    try {
      const numTotal = Number(total) || 0;
      if (numTotal < 0) return toast.error("วงเงินงบประมาณต้องไม่ติดลบ");
      cat.updateBudget({ total: numTotal });
      toast.success("บันทึกวงเงินงบประมาณประจำปีเรียบร้อย");
    } catch (err) {
      console.error("[BudgetManager] updateBudget ล้มเหลว:", err);
      toast.error("เกิดข้อผิดพลาดในการบันทึกงบประมาณ");
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm max-w-lg">
      <h3 className="font-extrabold text-slate-800">ตั้งค่างบประมาณบำรุงรักษา</h3>
      <label className="block text-xs">
        <span className="font-bold text-slate-600">วงเงินงบประมาณรวมประจำปี (บาท)</span>
        <input
          type="number"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none font-bold text-indigo-700 text-lg"
        />
      </label>
      <button
        onClick={handleSave}
        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700"
      >
        <Save className="h-4 w-4" /> บันทึกงบประมาณ
      </button>
    </div>
  );
}

// 4. Settings Manager (PIN, Backup, Restore)
export function SettingsManager({ auth }) {
  const { wipeAll, toast } = useAppData();
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [exportingAudit, setExportingAudit] = useState(false);

  const handleChangePin = async () => {
    const res = await auth.changePin(oldPin, newPin);
    if (res.ok) {
      toast.success("เปลี่ยนรหัส PIN สำเร็จ");
      setOldPin("");
      setNewPin("");
    } else {
      toast.error(res.error);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readBackupFile(file);
      const res = applyBackup(data);
      if (res.ok) {
        toast.success("นำเข้าข้อมูลสำเร็จ — ระบบกำลังโหลดใหม่");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const exportAudit = async () => {
    setExportingAudit(true);
    try {
      const logs = await fetchAuditLogs();
      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), logs }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fsa-audit-log-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`ส่งออก Audit Log ${logs.length} รายการแล้ว`);
    } catch (error) {
      toast.error(error.message || "ส่งออก Audit Log ไม่สำเร็จ");
    } finally {
      setExportingAudit(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Change PIN */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm max-w-lg space-y-4">
        <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-indigo-600" /> เปลี่ยนรหัสผ่าน Admin PIN
        </h3>
        <div className="space-y-3 text-xs">
          <input
            type="password"
            maxLength={6}
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value)}
            placeholder="PIN เดิม 6 หลัก"
            className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
          />
          <input
            type="password"
            maxLength={6}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="PIN ใหม่ 6 หลัก (ตัวเลขล้วน)"
            className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
          />
          <button
            onClick={handleChangePin}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900"
          >
            อัปเดตรหัส PIN
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm max-w-lg space-y-3">
        <h3 className="font-extrabold text-slate-800 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-indigo-600" /> Audit Trail สำหรับ Compliance</h3>
        <p className="text-xs text-slate-500">บันทึกว่าใครสร้าง แก้ไข หรือลบข้อมูลสำคัญ เมื่อใด โดยอ่านได้เฉพาะผู้มีสิทธิ์จัดการ</p>
        <button onClick={exportAudit} disabled={exportingAudit} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50">
          <Download className="h-4 w-4" /> {exportingAudit ? "กำลังเตรียมไฟล์..." : "Export Audit Log (.json)"}
        </button>
      </div>

      {/* Backup & Restore */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm max-w-lg space-y-4">
        <h3 className="font-extrabold text-slate-800">สำรองและกู้คืนข้อมูล (Backup & Restore)</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              downloadBackup();
              toast.success("ส่งออกไฟล์สำรอง .json เรียบร้อย");
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            <Download className="h-4 w-4" /> Export ข้อมูล (.json)
          </button>

          <label className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white cursor-pointer hover:bg-indigo-700">
            <Upload className="h-4 w-4" /> Import ข้อมูล
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm max-w-lg space-y-2">
        <h3 className="font-extrabold text-red-700">Danger Zone (ล้างข้อมูลระบบ)</h3>
        <p className="text-xs text-red-600">
          การล้างข้อมูลจะลบรายการตรวจสอบ ใบแจ้งซ่อม และการตั้งค่าทั้งหมดกลับเป็นค่าเริ่มต้น
        </p>
        <button
          onClick={() => {
            if (window.confirm("ยืนยันการล้างข้อมูลทั้งหมดของระบบใช่หรือไม่?")) {
              wipeAll();
            }
          }}
          className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
        >
          ล้างข้อมูลทั้งหมด (Reset to Factory)
        </button>
      </div>
    </div>
  );
}
