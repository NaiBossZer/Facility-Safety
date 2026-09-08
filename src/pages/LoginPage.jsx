import React, { useState } from "react";
import { AlertCircle, Lock, LogIn, Mail, ShieldCheck } from "lucide-react";
import { cx } from "../lib/helpers";

export function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    if (!email || !password) { setError("กรุณากรอก Email และรหัสผ่าน"); return; }
    setBusy(true);
    const result = await onLogin(email, password);
    setBusy(false);
    if (!result.ok) { setError(result.error); setPassword(""); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#123B63] via-[#0e2b42] to-slate-950 p-4">
      <div className="w-full max-w-md animate-fade">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <img
              src="/mahidol-logo.png"
              alt="มหาวิทยาลัยมหิดล"
              className="h-16 w-auto rounded-2xl bg-white p-1.5 shadow-2xl ring-2 ring-[#D6A84F]/60"
            />
            <img
              src="/envi-logo.jpg"
              alt="คณะสิ่งแวดล้อมและทรัพยากรศาสตร์"
              className="h-16 w-auto rounded-2xl bg-white p-1 shadow-2xl ring-2 ring-[#D6A84F]/60"
            />
          </div>
          <span className="rounded-full bg-[#D6A84F]/20 px-3 py-1 text-[11px] font-black text-[#D6A84F] border border-[#D6A84F]/40">
            MAHIDOL SOCIAL ENGAGEMENT
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-white">ระบบบริหารจัดการอาคารและสาธารณูปโภค</h1>
          <p className="mt-1 text-xs text-blue-200">งานพันธกิจเพื่อสังคม คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ มหาวิทยาลัยมหิดล</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
          <h2 className="mb-6 text-center text-lg font-extrabold text-white">เข้าสู่ระบบบุคลากร</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs font-bold text-blue-100"><span className="mb-1.5 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-[#D6A84F]" /> Email บุคลากร</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder="name@mahidol.edu" className="w-full rounded-xl border border-white/20 bg-white/15 px-3 py-3 text-sm text-white outline-none placeholder:text-blue-300/50 focus:border-[#D6A84F] focus:ring-2 focus:ring-[#D6A84F]/30" /></label>
            <label className="block text-xs font-bold text-blue-100"><span className="mb-1.5 flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-[#D6A84F]" /> รหัสผ่าน</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="รหัสผ่าน Supabase Auth" className="w-full rounded-xl border border-white/20 bg-white/15 px-3 py-3 text-sm text-white outline-none placeholder:text-blue-300/50 focus:border-[#D6A84F] focus:ring-2 focus:ring-[#D6A84F]/30" /></label>
            {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-300/30 bg-red-500/20 px-3 py-2.5 text-xs font-semibold text-red-200"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
            <button type="submit" disabled={busy} className={cx("mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold transition active:scale-95 shadow-lg", busy ? "cursor-not-allowed bg-slate-400 text-slate-200" : "bg-[#D6A84F] text-[#123B63] hover:bg-[#c49842]")}><LogIn className="h-4 w-4" />{busy ? "กำลังตรวจสอบ…" : "เข้าสู่ระบบ"}</button>
          </form>
          <p className="mt-5 text-center text-[11px] leading-relaxed text-blue-300/70">ใช้บัญชีที่ผู้ดูแลระบบลงทะเบียน<br />ติดต่อผู้ดูแลระบบหากไม่สามารถเข้าสู่ระบบได้</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
