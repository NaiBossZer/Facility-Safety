// ============================================================
// PersonnelManager.jsx — จัดการข้อมูลคนในองค์กร & ผู้มีหน้าที่รับผิดชอบ
// รองรับการซิงก์ตรงกับ Google Sheets ผ่าน Google Apps Script
// ============================================================
import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building,
  ShieldCheck,
  CheckCircle2,
  Save,
  RefreshCw,
  Link2,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { useAppData } from "../../store/AppDataProvider";
import { Badge } from "../../components/ui/Badge";
import { SectionTitle } from "../../components/ui/SectionTitle";
import {
  getAppScriptUrl,
  setAppScriptUrl,
  pullFromAppScript,
  pushToAppScript,
  APPSCRIPT_BACKEND_CODE_SAMPLE,
} from "../../lib/appscriptSync";

// Mock initial personnel (มหาวิทยาลัยมหิดล วิทยาเขตลำปาง)
const DEFAULT_PERSONNEL = [
  {
    id: "per_1",
    name: "นายสมชาย ตรวจดี",
    position: "เจ้าหน้าที่ตรวจสอบอาคารและความปลอดภัย",
    department: "งานอาคารสถานที่และยานพาหนะ",
    role: "inspector", // 'inspector' | 'section_head' | 'deputy_dean' | 'dean' | 'finance_head'
    phone: "081-234-5678",
    email: "somchai.tru@mahidol.edu",
    isResponsible: true,
  },
  {
    id: "per_2",
    name: "นายประเสริฐ มั่นคงชัย",
    position: "หัวหน้างานอาคารสถานที่และความปลอดภัย",
    department: "งานอาคารสถานที่และยานพาหนะ",
    role: "section_head",
    phone: "089-987-6543",
    email: "prasert.man@mahidol.edu",
    isResponsible: true,
  },
  {
    id: "per_3",
    name: "ผศ.ดร. นิทัศน์ สมานพงษ์",
    position: "รองคณบดีฝ่ายบริหารและพันธกิจเพื่อสังคม",
    department: "สำนักงานคณบดี",
    role: "deputy_dean",
    phone: "054-829-888",
    email: "nithat.sam@mahidol.edu",
    isResponsible: true,
  },
  {
    id: "per_4",
    name: "นางสุภาพร บริหารกิจ",
    position: "หัวหน้างานคลังและพัสดุ",
    department: "งานคลังและพัสดุ",
    role: "finance_head",
    phone: "054-829-889",
    email: "supaporn.bor@mahidol.edu",
    isResponsible: true,
  },
];

export function PersonnelManager() {
  const { toast } = useAppData();
  const [personnel, setPersonnel] = useState(() => {
    const saved = localStorage.getItem("fsa:v2:personnel");
    return saved ? JSON.parse(saved) : DEFAULT_PERSONNEL;
  });

  const [editingPerson, setEditingPerson] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [appScriptUrl, setUrl] = useState(() => getAppScriptUrl());
  const [showCodeSample, setShowCodeSample] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const savePersonnelList = (list) => {
    setPersonnel(list);
    localStorage.setItem("fsa:v2:personnel", JSON.stringify(list));
  };

  const handleSavePerson = () => {
    if (!editingPerson.name.trim()) return toast.error("กรุณากรอกชื่อ-นามสกุล");

    let updated;
    if (editingPerson.id) {
      updated = personnel.map((p) => (p.id === editingPerson.id ? editingPerson : p));
      toast.success("อัปเดตข้อมูลบุคลากรเรียบร้อย");
    } else {
      updated = [{ ...editingPerson, id: `per_${Date.now()}` }, ...personnel];
      toast.success("เพิ่มบุคลากรเรียบร้อย");
    }

    savePersonnelList(updated);
    setShowModal(false);
    setEditingPerson(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("ต้องการลบรายชื่อบุคลากรนี้ใช่หรือไม่?")) {
      const updated = personnel.filter((p) => p.id !== id);
      savePersonnelList(updated);
      toast.success("ลบข้อมูลบุคลากรแล้ว");
    }
  };

  const handleSaveUrl = () => {
    setAppScriptUrl(appScriptUrl);
    toast.success("บันทึก Google Apps Script Web App URL เรียบร้อย");
  };

  const handleSyncFromSheets = async () => {
    if (!appScriptUrl) return toast.warn("กรุณาระบุ Web App URL ก่อน");
    setSyncing(true);
    const res = await pullFromAppScript();
    setSyncing(false);
    if (res.ok && res.data?.personnel) {
      savePersonnelList(res.data.personnel);
      toast.success(`ซิงก์ข้อมูลจาก Google Sheets สำเร็จ (${res.data.personnel.length} รายการ)`);
    } else {
      toast.error(res.error || "ไม่สามารถดึงข้อมูลจาก Sheets ได้");
    }
  };

  return (
    <div className="space-y-6 animate-fade">
      {/* Google Sheets / AppScript Cloud Sync Card */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="rounded-xl bg-[#16A34A] p-2 text-white shadow-sm">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-800">
                Google Sheets / Excel Sync (Apps Script Backend)
              </h3>
              <p className="text-xs text-slate-500">
                เชื่อมต่อฐานข้อมูลคนในองค์กรและรายการตรวจจาก Google Spreadsheet โดยตรง
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCodeSample(!showCodeSample)}
              className="text-xs font-bold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition"
            >
              {showCodeSample ? "ซ่อนโค้ด AppScript" : "ดูโค้ด AppScript (Code.gs)"}
            </button>
            <button
              onClick={handleSyncFromSheets}
              disabled={syncing}
              className="flex items-center gap-1.5 rounded-xl bg-[#16A34A] px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
            >
              <RefreshCw className={cx("h-3.5 w-3.5", syncing && "animate-spin")} /> ดึงข้อมูลจาก Sheets
            </button>
          </div>
        </div>

        {/* URL Input */}
        <div className="mt-3 flex gap-2">
          <input
            value={appScriptUrl}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="วาง Google Apps Script Web App URL ที่นี่ (https://script.google.com/macros/s/.../exec)"
            className="flex-1 rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleSaveUrl}
            className="rounded-xl bg-[#002D62] px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-950"
          >
            บันทึก URL
          </button>
        </div>

        {showCodeSample && (
          <div className="mt-3 rounded-xl bg-slate-900 p-4 text-emerald-400 font-mono text-[11px] overflow-x-auto">
            <p className="text-slate-400 mb-2">// คัดลอกโค้ดนี้ไปวางใน Extensions ➔ Apps Script ของ Google Sheet</p>
            <pre>{APPSCRIPT_BACKEND_CODE_SAMPLE}</pre>
          </div>
        )}
      </div>

      {/* Personnel List Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div>
            <h3 className="font-extrabold text-[#002D62] text-base">
              ทำเนียบบุคลากรและผู้มีหน้าที่รับผิดชอบ (Personnel & Signers)
            </h3>
            <p className="text-xs text-slate-400">
              รายชื่อที่จะปรากฏในช่องเลือกลงนามเอกสาร งพ.001, งพ.003 และรายงานการตรวจประจำปี
            </p>
          </div>

          <button
            onClick={() => {
              setEditingPerson({
                name: "",
                position: "",
                department: "งานอาคารสถานที่และยานพาหนะ",
                role: "inspector",
                phone: "",
                email: "",
                isResponsible: true,
              });
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#F2A900] px-4 py-2.5 text-xs font-bold text-slate-900 shadow-md shadow-amber-200 hover:bg-amber-400 transition"
          >
            <UserPlus className="h-4 w-4" /> เพิ่มบุคลากร
          </button>
        </div>

        {/* Personnel Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {personnel.map((p) => (
            <div
              key={p.id}
              className="flex items-start justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-indigo-300 hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#002D62] text-xs font-bold text-white">
                  {p.name.slice(0, 2)}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 text-sm truncate">{p.name}</p>
                    {p.isResponsible && (
                      <Badge className="bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20">
                        ผู้รับผิดชอบหลัก
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">{p.position}</p>
                  <p className="text-[11px] text-slate-400">{p.department}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {p.phone || "-"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {p.email || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => {
                    setEditingPerson(p);
                    setShowModal(true);
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Personnel Modal */}
      {showModal && editingPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-[#002D62] text-base">
                {editingPerson.id ? "แก้ไขข้อมูลบุคลากร" : "เพิ่มบุคลากรใหม่"}
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <label className="block">
                <span className="font-bold text-slate-700">ชื่อ-นามสกุล</span>
                <input
                  value={editingPerson.name}
                  onChange={(e) => setEditingPerson({ ...editingPerson, name: e.target.value })}
                  placeholder="เช่น นายสมชาย ตรวจดี"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-medium"
                />
              </label>

              <label className="block">
                <span className="font-bold text-slate-700">ตำแหน่ง</span>
                <input
                  value={editingPerson.position}
                  onChange={(e) => setEditingPerson({ ...editingPerson, position: e.target.value })}
                  placeholder="เช่น เจ้าหน้าที่ตรวจสอบอาคาร"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                />
              </label>

              <label className="block">
                <span className="font-bold text-slate-700">หน่วยงาน / ภาควิชา</span>
                <input
                  value={editingPerson.department}
                  onChange={(e) => setEditingPerson({ ...editingPerson, department: e.target.value })}
                  placeholder="เช่น งานอาคารสถานที่และยานพาหนะ"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="font-bold text-slate-700">เบอร์โทรศัพท์</span>
                  <input
                    value={editingPerson.phone}
                    onChange={(e) => setEditingPerson({ ...editingPerson, phone: e.target.value })}
                    placeholder="081-xxx-xxxx"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="block">
                  <span className="font-bold text-slate-700">อีเมล</span>
                  <input
                    value={editingPerson.email}
                    onChange={(e) => setEditingPerson({ ...editingPerson, email: e.target.value })}
                    placeholder="name@mahidol.edu"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="resp"
                  checked={editingPerson.isResponsible || false}
                  onChange={(e) => setEditingPerson({ ...editingPerson, isResponsible: e.target.checked })}
                  className="h-4 w-4 rounded text-indigo-600"
                />
                <label htmlFor="resp" className="font-bold text-slate-700 cursor-pointer">
                  กำหนดเป็นผู้รับผิดชอบหลักในการลงนาม
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSavePerson}
                className="flex items-center gap-1.5 rounded-xl bg-[#002D62] px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-950"
              >
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
