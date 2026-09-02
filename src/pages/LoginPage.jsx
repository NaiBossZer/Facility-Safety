// ============================================================
// LoginPage.jsx — หน้าเข้าสู่ระบบสำหรับบุคลากร
// ดึงรายชื่อจาก catalog.personnel (Admin จัดการใน PersonnelManager)
// ============================================================
import React, { useState, useMemo } from "react";
import { ShieldCheck, LogIn, AlertCircle, Lock, User } from "lucide-react";
import { useAppData } from "../store/AppDataProvider";
import { cx } from "../lib/helpers";

export function LoginPage({ onLogin }) {
  const { catalog } = useAppData();

  // ดึง personnel list จาก catalog (Admin เพิ่มได้ใน PersonnelManager)
  const personnel = useMemo(() => {
    const list = catalog?.personnel ?? [];
    // ถ้ายังไม่มีข้อมูล ให้ใช้ fallback เพื่อป้องกันหน้าว่าง
    if (list.length === 0) {
      return [
        { id: "per_1", name: "นายสมชาย ตรวจดี", position: "เจ้าหน้าที่ตรวจสอบอาคารและความปลอดภัย", department: "งานอาคารสถานที่และยานพาหนะ", role: "inspector" },
        { id: "per_2", name: "นายประเสริฐ มั่นคงชัย", position: "หัวหน้างานอาคารสถานที่และความปลอดภัย", department: "งานอาคารสถานที่และยานพาหนะ", role: "section_head" },
        { id: "per_3", name: "ผศ.ดร. นิทัศน์ สมานพงษ์", position: "รองคณบดีฝ่ายบริหารและพันธกิจเพื่อสังคม", department: "สำนักงานคณบดี", role: "deputy_dean" },
      ];
    }
    return list;
  }, [catalog]);

  const [selectedId, setSelectedId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const selectedPerson = personnel.find((p) => p.id === selectedId);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!selectedId) { setError("กรุณาเลือกชื่อบุคลากร"); return; }
    if (!pin) { setError("กรุณากรอกรหัสพนักงาน"); return; }
    setBusy(true);
    // รอเล็กน้อยเพื่อ UX
    setTimeout(() => {
      const result = onLogin(selectedId, pin);
      setBusy(false);
      if (!result.ok) {
        setError(result.error);
        setPin("");
      }
    }, 400);
  };

  const ROLE_LABEL = {
    inspector: "เจ้าหน้าที่ตรวจสอบ",
    section_head: "หัวหน้างาน",
    deputy_dean: "รองคณบดี",
    dean: "คณบดี",
    finance_head: "หัวหน้าการเงิน",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#002D62] via-[#004499] to-[#001a3e] p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F2A900] shadow-2xl shadow-yellow-900/40">
            <ShieldCheck className="h-10 w-10 text-[#002D62]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">ระบบบริหารจัดการ</h1>
          <p className="mt-1 text-sm text-blue-200">ความปลอดภัยอาคารสถานที่ · งานพันธกิจเพื่อสังคม คณะสิ่งแวดล้อมและทรัพยากรณศาสตร์ มหาวิทยาลัยมหิดล</p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-sm">
          <h2 className="mb-6 text-center text-lg font-extrabold text-white">เข้าสู่ระบบ</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* เลือกบุคลากร */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-blue-100">
                <User className="h-3.5 w-3.5" /> เลือกชื่อบุคลากร
              </label>
              <select
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); setError(null); setPin(""); }}
                className="w-full rounded-xl border border-white/20 bg-white/15 px-3 py-3 text-sm font-semibold text-white outline-none transition focus:border-yellow-400 focus:bg-white/20 focus:ring-2 focus:ring-yellow-400/30"
              >
                <option value="" className="bg-[#002D62]">— เลือกชื่อ —</option>
                {personnel.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#002D62]">
                    {p.name} ({ROLE_LABEL[p.role] ?? p.role})
                  </option>
                ))}
              </select>
            </div>

            {/* แสดงตำแหน่ง */}
            {selectedPerson && (
              <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-xs text-blue-100">
                <p className="font-bold text-white">{selectedPerson.position}</p>
                <p className="mt-0.5">{selectedPerson.department}</p>
              </div>
            )}

            {/* รหัสพนักงาน */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-blue-100">
                <Lock className="h-3.5 w-3.5" /> รหัสพนักงาน
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError(null); }}
                placeholder="รหัสเริ่มต้น:1234"
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/20 bg-white/15 px-3 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-blue-300/50 focus:border-yellow-400 focus:bg-white/20 focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-300/30 bg-red-500/20 px-3 py-2.5 text-xs font-semibold text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className={cx(
                "mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold transition active:scale-95",
                busy
                  ? "bg-slate-400 text-slate-200 cursor-not-allowed"
                  : "bg-[#F2A900] text-[#002D62] shadow-lg shadow-yellow-900/30 hover:bg-yellow-400"
              )}
            >
              {busy ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#002D62]/30 border-t-[#002D62]" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {busy ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-blue-300/70">
            รหัสเริ่มต้น <span className="font-bold text-blue-200">1234</span> · เปลี่ยนได้ใน Admin Panel
            <br />ติดต่อผู้ดูแลระบบหากลืมรหัส
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
