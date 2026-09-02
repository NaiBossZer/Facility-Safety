// ============================================================
// PinGate.jsx — Secure Numeric PIN Entry Modal (Default PIN: 112233)
// ============================================================
import React, { useState } from "react";
import { Lock, ShieldCheck, AlertCircle, KeyRound, ArrowLeft } from "lucide-react";
import { cx } from "../../lib/helpers";

export function PinGate({ auth, onCancel }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleKey = (digit) => {
    if (pin.length < 6) {
      const next = pin + digit;
      setPin(next);
      setError(null);
      if (next.length === 6) {
        submitPin(next);
      }
    }
  };

  const handleBackspace = () => {
    setPin((p) => p.slice(0, -1));
    setError(null);
  };

  const submitPin = async (val) => {
    setBusy(true);
    const res = await auth.unlock(val);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-fade">
      <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl text-center">
        {/* Header Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
          <Lock className="h-8 w-8" />
        </div>

        <h3 className="mt-4 text-xl font-extrabold text-slate-800">ระบบจัดการผู้ดูแลระบบ (Admin)</h3>
        <p className="mt-1 text-xs text-slate-400">
          กรุณากรอกรหัส PIN 6 หลักเพื่อเข้าถึงระบบจัดการ
          {auth.isDefaultPin && <span className="block mt-1 text-amber-600 font-semibold">(PIN เริ่มต้น: 112233)</span>}
        </p>

        {/* PIN Dots display */}
        <div className="my-6 flex justify-center gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const filled = i < pin.length;
            return (
              <div
                key={i}
                className={cx(
                  "h-4 w-4 rounded-full transition-all duration-200",
                  filled
                    ? "scale-110 bg-indigo-600 shadow-md shadow-indigo-300"
                    : "border-2 border-slate-200 bg-slate-100"
                )}
              />
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 flex items-center justify-center gap-1.5 rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-600 animate-shake">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              disabled={busy || auth.isLocked}
              onClick={() => handleKey(String(n))}
              className="flex h-13 items-center justify-center rounded-2xl bg-slate-50 text-lg font-extrabold text-slate-700 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 disabled:opacity-50"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => onCancel && onCancel()}
            className="flex h-13 items-center justify-center rounded-2xl text-xs font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            ยกเลิก
          </button>
          <button
            disabled={busy || auth.isLocked}
            onClick={() => handleKey("0")}
            className="flex h-13 items-center justify-center rounded-2xl bg-slate-50 text-lg font-extrabold text-slate-700 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="flex h-13 items-center justify-center rounded-2xl text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-red-600 active:scale-95"
          >
            ลบ
          </button>
        </div>
      </div>
    </div>
  );
}

export default PinGate;
