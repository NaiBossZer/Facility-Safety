// ============================================================
// PersonnelManager.jsx — จัดการข้อมูลคนในองค์กร & ผู้มีหน้าที่รับผิดชอบ
// บันทึกลง catalog.personnel (unified storage — useAuth อ่านได้ทันที)
// ============================================================
import React, { useState } from "react";
import {
  Users, UserPlus, Edit2, Trash2, Phone, Mail,
  Save, RefreshCw, Link2, FileSpreadsheet, X, KeyRound, Eye, EyeOff,
} from "lucide-react";
import { useAppData } from "../../store/AppDataProvider";
import { Badge } from "../../components/ui/Badge";
import { SectionTitle } from "../../components/ui/SectionTitle";
import {
  getAppScriptUrl, setAppScriptUrl, pullFromAppScript,
  APPSCRIPT_BACKEND_CODE_SAMPLE,
} from "../../lib/appscriptSync";

const ROLE_OPTIONS = [
  { value: "inspector",    label: "เจ้าหน้าที่ตรวจสอบ" },
  { value: "section_head", label: "หัวหน้างาน" },
  { value: "deputy_dean",  label: "รองคณบดี" },
  { value: "dean",         label: "คณบดี" },
  { value: "finance_head", label: "หัวหน้าการเงิน" },
];

const EMPTY_PERSON = {
  name: "", position: "", department: "",
  role: "inspector", phone: "", email: "",
  isResponsible: false, pin: "1234",
};

export function PersonnelManager() {
  const { catalog, cat, toast } = useAppData();

  // อ่านจาก catalog.personnel (unified — useAuth อ่าน key เดียวกัน)
  const personnel = catalog?.personnel ?? [];

  const [editingPerson, setEditingPerson] = useState(null);
  const [showModal, setShowModal]         = useState(false);
  const [showPin, setShowPin]             = useState(false);
  const [appScriptUrl, setUrl]            = useState(() => getAppScriptUrl());
  const [showCodeSample, setShowCodeSample] = useState(false);
  const [syncing, setSyncing]             = useState(false);

  /** บันทึกลง catalog.personnel ผ่าน cat API */
  const savePersonnelList = (list) => {
    if (cat?.setPersonnel) {
      cat.setPersonnel(list);
    }
  };

  const handleSavePerson = () => {
    try {
      if (!editingPerson?.name?.trim()) return toast.error("กรุณากรอกชื่อ-นามสกุล");
      const pinVal = String(editingPerson.pin ?? "1234");
      if (!/^\d{4,8}$/.test(pinVal)) return toast.error("รหัสพนักงานต้องเป็นตัวเลข 4-8 หลัก");

      let updated;
      if (editingPerson.id) {
        updated = personnel.map((p) => (p.id === editingPerson.id ? { ...editingPerson, pin: pinVal } : p));
        toast.success("อัปเดตข้อมูลบุคลากรเรียบร้อย");
      } else {
        updated = [{ ...editingPerson, pin: pinVal, id: `per_${Date.now()}` }, ...personnel];
        toast.success("เพิ่มบุคลากรเรียบร้อย");
      }
      savePersonnelList(updated);
      setShowModal(false);
      setEditingPerson(null);
      setShowPin(false);
    } catch (err) {
      console.error("[PersonnelManager] handleSavePerson ล้มเหลว:", err);
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลบุคลากร");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("ต้องการลบรายชื่อบุคลากรนี้ใช่หรือไม่?")) {
      savePersonnelList(personnel.filter((p) => p.id !== id));
      toast.success("ลบข้อมูลบุคลากรแล้ว");
    }
  };

  const handleSyncFromSheets = async () => {
    if (!appScriptUrl) return toast.warn("กรุณาระบุ Web App URL ก่อน");
    setSyncing(true);
    const res = await pullFromAppScript();
    setSyncing(false);
    if (res.ok && res.data?.personnel) {
      savePersonnelList(res.data.personnel);
      toast.success(`ซิงก์จาก Sheets สำเร็จ (${res.data.personnel.length} รายการ)`);
    } else {
      toast.error(res.error || "ไม่สามารถดึงข้อมูลจาก Sheets ได้");
    }
  };

  const openEdit = (p) => { setEditingPerson({ ...p }); setShowPin(false); setShowModal(true); };
  const openNew  = ()  => { setEditingPerson({ ...EMPTY_PERSON }); setShowPin(false); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingPerson(null); setShowPin(false); };

  return (
    <div className="space-y-6 animate-fade">

      {/* Google Sheets Sync */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
        <SectionTitle icon={FileSpreadsheet} title="ซิงก์ข้อมูลบุคลากรจาก Google Sheets" desc="เชื่อมต่อ Google Apps Script เพื่อดึง/ส่งข้อมูลบุคลากล" />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="mb-1 block text-xs font-bold text-slate-500">Google Apps Script Web App URL</span>
            <input
              value={appScriptUrl}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-indigo-400"
            />
          </label>
          <button onClick={() => { setAppScriptUrl(appScriptUrl); toast.success("บันทึก URL เรียบร้อย"); }}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700">
            <Link2 className="h-3.5 w-3.5" /> บันทึก URL
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={handleSyncFromSheets} disabled={syncing}
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50">
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "กำลังดึง..." : "ดึงข้อมูลจาก Sheets"}
          </button>
          <button onClick={() => setShowCodeSample((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
            <FileSpreadsheet className="h-3.5 w-3.5" /> {showCodeSample ? "ซ่อน" : "ดู"} Code ตัวอย่าง
          </button>
        </div>
        {showCodeSample && (
          <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-[10px] text-green-300">{APPSCRIPT_BACKEND_CODE_SAMPLE}</pre>
        )}
      </div>

      {/* Personnel List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <SectionTitle icon={Users} title={`รายชื่อบุคลากร (${personnel.length} คน)`} desc="จัดการข้อมูลและรหัสเข้าระบบของแต่ละคน" />
          <button onClick={openNew}
            className="flex items-center gap-1.5 rounded-xl bg-[#F2A900] px-4 py-2.5 text-xs font-bold text-slate-900 shadow-md shadow-amber-200 hover:bg-amber-400 transition">
            <UserPlus className="h-4 w-4" /> เพิ่มบุคลากร
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {personnel.length === 0 && (
            <p className="col-span-2 py-8 text-center text-sm text-slate-400">ยังไม่มีข้อมูลบุคลากร — กดปุ่ม "เพิ่มบุคลากร"</p>
          )}
          {personnel.map((p) => (
            <div key={p.id} className="flex items-start justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-indigo-300 hover:bg-white hover:shadow-sm">
              <div className="flex items-start gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#002D62] text-xs font-bold text-white">
                  {(p?.name || "??").slice(0, 2)}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 text-sm truncate">{p.name}</p>
                    {p.isResponsible && <Badge className="bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20">ผู้รับผิดชอบหลัก</Badge>}
                  </div>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">{p.position}</p>
                  <p className="text-[11px] text-slate-400">{p.department}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {p.phone || "-"}</span>
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {p.email || "-"}</span>
                    <span className="flex items-center gap-1 text-indigo-500 font-semibold">
                      <KeyRound className="h-3 w-3" />
                      {p.pin ? `รหัส: ${"•".repeat(Math.min(p.pin.length, 6))}` : "ใช้รหัสเริ่มต้น (1234)"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700" title="แก้ไข">
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="ลบ">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && editingPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-[#002D62] text-base">
                {editingPerson.id ? "แก้ไขข้อมูลบุคลากร" : "เพิ่มบุคลากรใหม่"}
              </h4>
              <button onClick={closeModal} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              {[
                { label: "ชื่อ-นามสกุล", key: "name", placeholder: "เช่น นายสมชาย ตรวจดี", bold: true },
                { label: "ตำแหน่ง", key: "position", placeholder: "เช่น เจ้าหน้าที่ตรวจสอบอาคาร" },
                { label: "หน่วยงาน / ภาควิชา", key: "department", placeholder: "เช่น งานอาคารสถานที่และยานพาหนะ" },
              ].map(({ label, key, placeholder, bold }) => (
                <label key={key} className="block">
                  <span className="font-bold text-slate-700">{label}</span>
                  <input
                    value={editingPerson[key] || ""}
                    onChange={(e) => setEditingPerson({ ...editingPerson, [key]: e.target.value })}
                    placeholder={placeholder}
                    className={`mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 ${bold ? "font-medium" : ""}`}
                  />
                </label>
              ))}

              <label className="block">
                <span className="font-bold text-slate-700">บทบาทในระบบ</span>
                <select
                  value={editingPerson.role}
                  onChange={(e) => setEditingPerson({ ...editingPerson, role: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                >
                  {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="font-bold text-slate-700">เบอร์โทรศัพท์</span>
                  <input value={editingPerson.phone || ""} onChange={(e) => setEditingPerson({ ...editingPerson, phone: e.target.value })}
                    placeholder="081-xxx-xxxx" className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500" />
                </label>
                <label className="block">
                  <span className="font-bold text-slate-700">อีเมล</span>
                  <input value={editingPerson.email || ""} onChange={(e) => setEditingPerson({ ...editingPerson, email: e.target.value })}
                    placeholder="name@mahidol.edu" className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500" />
                </label>
              </div>

              {/* PIN */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                <span className="font-bold text-indigo-700 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5" /> รหัสพนักงาน (ใช้เข้าสู่ระบบ)
                </span>
                <p className="mt-0.5 mb-2 text-[11px] text-indigo-500">ตัวเลข 4-8 หลัก · รหัสเริ่มต้น: 1234</p>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    value={editingPerson.pin ?? "1234"}
                    onChange={(e) => setEditingPerson({ ...editingPerson, pin: e.target.value })}
                    placeholder="1234" maxLength={8}
                    className="w-full rounded-xl border border-indigo-200 bg-white p-2.5 pr-10 outline-none focus:border-indigo-500 font-mono tracking-widest"
                  />
                  <button type="button" onClick={() => setShowPin((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="resp" checked={editingPerson.isResponsible || false}
                  onChange={(e) => setEditingPerson({ ...editingPerson, isResponsible: e.target.checked })}
                  className="h-4 w-4 rounded text-indigo-600" />
                <label htmlFor="resp" className="font-bold text-slate-700 cursor-pointer">กำหนดเป็นผู้รับผิดชอบหลักในการลงนาม</label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <button onClick={closeModal} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100">ยกเลิก</button>
              <button onClick={handleSavePerson} className="flex items-center gap-1.5 rounded-xl bg-[#002D62] px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-950">
                <Save className="h-3.5 w-3.5" /> บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonnelManager;
