// ============================================================
// useAuth.js — Session บุคลากร (Soft Gate ไม่ใช่ production security)
// เหมือน useAdminAuth แต่สำหรับ user ทั่วไปเข้าแอป
// ============================================================
import { useState, useCallback } from "react";
import { KEYS, readJSON, writeJSON, removeKey } from "../lib/storage";

const AUTH_USER_KEY = "fsa:v2:userSession";
const SESSION_MINUTES = 480; // 8 ชั่วโมง (วันทำงาน)

/** โหลด session ที่ยัง valid */
function loadSession() {
  try {
    const s = readJSON(AUTH_USER_KEY, null);
    if (!s || !s.expiresAt) return null;
    if (Date.now() > s.expiresAt) {
      removeKey(AUTH_USER_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [session, setSession] = useState(() => loadSession());

  /** currentUser: { id, name, position, department, role } | null */
  const currentUser = session?.user ?? null;

  /**
   * login — ตรวจ personnel list จาก localStorage (catalog)
   * รหัสเริ่มต้นทุกคน = "1234" หรือรหัสที่ admin กำหนด (เก็บใน personnel.pin)
   */
  const login = useCallback((personnelId, pin) => {
    if (!personnelId || !pin) {
      return { ok: false, error: "กรุณากรอกข้อมูลให้ครบ" };
    }

    // อ่าน personnel list จาก catalog (localStorage)
    const catalog = readJSON(KEYS.catalog, null);
    const personnelList = catalog?.personnel ?? [];

    const person = personnelList.find((p) => p.id === personnelId);
    if (!person) {
      return { ok: false, error: "ไม่พบข้อมูลบุคลากรนี้ในระบบ" };
    }

    const correctPin = person.pin ?? "1234";
    if (String(pin) !== String(correctPin)) {
      return { ok: false, error: "รหัสพนักงานไม่ถูกต้อง" };
    }

    const user = {
      id: person.id,
      name: person.name,
      position: person.position,
      department: person.department,
      role: person.role,
    };
    const newSession = {
      user,
      loginAt: Date.now(),
      expiresAt: Date.now() + SESSION_MINUTES * 60 * 1000,
    };
    writeJSON(AUTH_USER_KEY, newSession);
    setSession(newSession);
    return { ok: true, user };
  }, []);

  const logout = useCallback(() => {
    removeKey(AUTH_USER_KEY);
    setSession(null);
  }, []);

  return { currentUser, login, logout };
}

export default useAuth;
