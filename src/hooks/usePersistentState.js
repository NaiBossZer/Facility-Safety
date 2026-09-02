// ============================================================
// usePersistentState.js — useState ที่เซฟลง localStorage อัตโนมัติ
// ใช้งาน: const [wo, setWo, meta] = usePersistentState(KEYS.workOrders, [])
// ============================================================
import { useState, useRef, useEffect, useCallback } from "react";
import { readJSON, writeJSON, isAvailable } from "../lib/storage";
import { debounce, clockNow } from "../lib/helpers";

export function usePersistentState(key, initialValue, options = {}) {
  const {
    delay = 400,          // หน่วงก่อนเขียน (ลดการเขียนถี่)
    version = null,       // ถ้าใส่ จะเช็คว่าข้อมูลเก่าเข้ากันได้ไหม
    migrate = null,       // (stored) => value  แปลงข้อมูลเก่าก่อนใช้
    onError = null,       // (errorType) => void
  } = options;

  // ---- โหลดค่าเริ่มต้น (lazy — ทำครั้งเดียว) ----
  const [state, setState] = useState(() => {
    const stored = readJSON(key, undefined);
    if (stored === undefined || stored === null) {
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
    try {
      if (typeof migrate === "function") return migrate(stored);
      if (version !== null && stored?.__v !== undefined && stored.__v !== version) {
        return typeof initialValue === "function" ? initialValue() : initialValue;
      }
      return stored;
    } catch (err) {
      console.warn(`[usePersistentState] migrate "${key}" ล้มเหลว:`, err);
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  });

  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState(isAvailable() ? null : "unavailable");
  const firstRun = useRef(true);
  const stateRef = useRef(state);
  stateRef.current = state;

  // ---- ตัวเขียนแบบหน่วงเวลา ----
  const writerRef = useRef(null);
  if (!writerRef.current) {
    writerRef.current = debounce((value) => {
      const res = writeJSON(key, value);
      if (res.ok) {
        setError(null);
        setSavedAt(clockNow());
      } else {
        setError(res.error);
        if (typeof onError === "function") onError(res.error);
      }
    }, delay);
  }

  // ---- เขียนทุกครั้งที่ state เปลี่ยน (ข้ามรอบแรก) ----
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    writerRef.current(state);
  }, [state]);

  // ---- flush ตอนปิดแท็บ / สลับแอปบนมือถือ / unmount ----
  useEffect(() => {
    const writer = writerRef.current;
    const flush = () => writer.flush();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") writer.flush();
    };

    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
      writer.flush();
    };
  }, []);

  // ---- ซิงก์ข้ามแท็บ ----
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key || e.newValue === null) return;
      try {
        setState(JSON.parse(e.newValue));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  /** บังคับเซฟทันที (ใช้ก่อน export/reload) */
  const flushNow = useCallback(() => {
    writerRef.current.cancel();
    const res = writeJSON(key, stateRef.current);
    if (res.ok) setSavedAt(clockNow());
    else setError(res.error);
    return res;
  }, [key]);

  return [state, setState, { savedAt, error, flushNow, available: isAvailable() }];
}

export default usePersistentState;