// ============================================================
// useAdminAuth.js — PIN Gate สำหรับหน้า Admin
// ⚠️ นี่คือการป้องกัน "การกดพลาด" ไม่ใช่ security ระดับ production
//    เมื่อย้ายไป Supabase/Firebase ให้แก้เฉพาะไฟล์นี้ไฟล์เดียว
// ============================================================
import { useState, useEffect, useCallback, useRef } from "react";
import { KEYS, readJSON, writeJSON, removeKey } from "../lib/storage";
import { nowISO } from "../lib/helpers";

// Deliberately non-sequential bootstrap PIN. Admin should change it immediately.
export const DEFAULT_PIN = "839174";
const SESSION_MINUTES = 30;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 5;
const SALT = "fsa-admin-v2";

/** hash แบบ SHA-256 (มี fallback สำหรับ context ที่ไม่ใช่ https/localhost) */
async function hashPin(pin) {
  const text = `${SALT}:${pin}`;
  if (window.crypto?.subtle) {
    try {
      const buf = await window.crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(text)
      );
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } catch {
      /* fallthrough */
    }
  }
  // fallback: djb2
  let h = 5381;
  for (let i = 0; i < text.length; i += 1) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return `djb2_${h.toString(16)}`;
}

function loadAuth() {
  return readJSON(KEYS.auth, null);
}

export function useAdminAuth() {
  const [record, setRecord] = useState(() => loadAuth());
  const [unlocked, setUnlocked] = useState(false);
  const [attempts, setAttempts] = useState(() => loadAuth()?.failedAttempts || 0);
  const [lockedUntil, setLockedUntil] = useState(() => loadAuth()?.lockedUntil || null);
  const [initializing, setInitializing] = useState(() => {
    const auth = loadAuth();
    return !auth || (auth.isDefault && auth.defaultVersion !== 2);
  });
  const timerRef = useRef(null);

  // ---- ตั้ง PIN เริ่มต้นครั้งแรก ----
  useEffect(() => {
    if (record && !(record.isDefault && record.defaultVersion !== 2)) return;
    let cancelled = false;
    (async () => {
      const hash = await hashPin(DEFAULT_PIN);
      if (cancelled) return;
      const rec = { hash, isDefault: true, defaultVersion: 2, failedAttempts: 0, lockedUntil: null, createdAt: record?.createdAt || nowISO(), updatedAt: nowISO() };
      writeJSON(KEYS.auth, rec);
      setRecord(rec);
      setInitializing(false);
    })();
    return () => { cancelled = true; };
  }, [record]);

  // ---- หมดเวลา session อัตโนมัติ ----
  const startSessionTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setUnlocked(false), SESSION_MINUTES * 60 * 1000);
  }, []);

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  /** ตรวจ PIN — คืน { ok, error } */
  const unlock = useCallback(
    async (pin) => {
      if (isLocked) {
        const mins = Math.ceil((lockedUntil - Date.now()) / 60000);
        return { ok: false, error: `ใส่ผิดเกินกำหนด กรุณารออีก ${mins} นาที` };
      }
      const current = record || loadAuth();
      if (!current) return { ok: false, error: "ระบบยังไม่พร้อม กรุณาลองใหม่" };

      const hash = await hashPin(String(pin));
      if (hash === current.hash) {
        setUnlocked(true);
        setAttempts(0);
        setLockedUntil(null);
        const clean = { ...current, failedAttempts: 0, lockedUntil: null, updatedAt: nowISO() };
        writeJSON(KEYS.auth, clean);
        setRecord(clean);
        startSessionTimer();
        return { ok: true, error: null, isDefault: Boolean(current.isDefault) };
      }

      const next = attempts + 1;
      setAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
        setLockedUntil(until);
        setAttempts(0);
        writeJSON(KEYS.auth, { ...current, failedAttempts: 0, lockedUntil: until, updatedAt: nowISO() });
        return { ok: false, error: `ใส่ผิด ${MAX_ATTEMPTS} ครั้ง ระบบล็อก ${LOCKOUT_MINUTES} นาที` };
      }
      writeJSON(KEYS.auth, { ...current, failedAttempts: next, lockedUntil: null, updatedAt: nowISO() });
      return { ok: false, error: `PIN ไม่ถูกต้อง (เหลืออีก ${MAX_ATTEMPTS - next} ครั้ง)` };
    },
    [record, attempts, isLocked, lockedUntil, startSessionTimer]
  );

  /** เปลี่ยน PIN — ต้องรู้ PIN เดิม */
  const changePin = useCallback(
    async (oldPin, newPin) => {
      const current = record || loadAuth();
      const oldHash = await hashPin(String(oldPin));
      if (oldHash !== current?.hash) return { ok: false, error: "PIN เดิมไม่ถูกต้อง" };

      const pin = String(newPin);
      if (!/^\d{6}$/.test(pin)) return { ok: false, error: "PIN ต้องเป็นตัวเลข 6 หลัก" };
      if (pin === DEFAULT_PIN) return { ok: false, error: "ห้ามใช้ PIN เริ่มต้นของระบบ" };
      if (/^(\d)\1{5}$/.test(pin)) return { ok: false, error: "ห้ามใช้เลขซ้ำทั้งหมด" };

      const hash = await hashPin(pin);
      const rec = { hash, isDefault: false, createdAt: current.createdAt, updatedAt: nowISO() };
      const res = writeJSON(KEYS.auth, rec);
      if (!res.ok) return { ok: false, error: "บันทึก PIN ไม่สำเร็จ" };
      setRecord(rec);
      return { ok: true, error: null };
    },
    [record]
  );

  const lock = useCallback(() => {
    setUnlocked(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  /** ต่ออายุ session เมื่อมีการใช้งาน */
  const touch = useCallback(() => {
    if (unlocked) startSessionTimer();
  }, [unlocked, startSessionTimer]);

  const resetAuth = useCallback(() => {
    removeKey(KEYS.auth);
    setRecord(null);
    setUnlocked(false);
    setInitializing(true);
  }, []);

  return {
    unlocked,
    initializing,
    isLocked,
    lockedUntil,
    attemptsLeft: MAX_ATTEMPTS - attempts,
    isDefaultPin: Boolean(record?.isDefault),
    unlock,
    lock,
    changePin,
    touch,
    resetAuth,
    sessionMinutes: SESSION_MINUTES,
  };
}

export default useAdminAuth;
