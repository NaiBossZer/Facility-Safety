// ============================================================
// storage.js — Layer เดียวที่คุยกับ localStorage โดยตรง
// ที่อื่นห้ามเรียก localStorage ตรง ๆ เด็ดขาด
// ============================================================

export const NS = "fsa";
export const SCHEMA_VERSION = 2;

/** สร้าง key เต็ม: k("catalog") -> "fsa:v2:catalog" */
export function k(name, version = SCHEMA_VERSION) {
  return `${NS}:v${version}:${name}`;
}

export const KEYS = {
  catalog: k("catalog"),
  workOrders: k("workOrders"),
  inspections: k("inspections"),
  ui: k("ui"),
  meta: k("meta"),
  auth: k("auth"),
};

let _available = null;

/** เช็คว่าใช้ localStorage ได้ไหม (โหมด Private บาง browser จะ throw) */
export function isAvailable() {
  if (_available !== null) return _available;
  try {
    const probe = `${NS}:__probe__`;
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    _available = true;
  } catch {
    _available = false;
  }
  return _available;
}

/** อ่านค่า — คืน fallback ถ้าไม่มีหรือ parse ไม่ได้ */
export function readJSON(key, fallback = null) {
  if (!isAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    const value = JSON.parse(raw);
    // Legacy personnel records may contain plaintext PINs. Never expose or
    // rehydrate that field into the application cache.
    if (key === KEYS.catalog && value?.personnel) {
      const safeValue = { ...value, personnel: value.personnel.map(({ pin: _pin, ...person }) => person) };
      if (JSON.stringify(safeValue) !== raw) {
        try { window.localStorage.setItem(key, JSON.stringify(safeValue)); } catch { /* cache cleanup is best effort */ }
      }
      return safeValue;
    }
    return value;
  } catch (err) {
    console.warn(`[storage] อ่าน "${key}" ไม่สำเร็จ:`, err);
    return fallback;
  }
}

/**
 * เขียนค่า — คืน { ok, error }
 * error: "unavailable" | "quota" | "unknown"
 */
export function writeJSON(key, value) {
  if (!isAvailable()) return { ok: false, error: "unavailable" };
  try {
    let safeValue = value;
    if (key === KEYS.catalog && value?.personnel) {
      safeValue = { ...value, personnel: value.personnel.map(({ pin: _pin, ...person }) => person) };
    }
    window.localStorage.setItem(key, JSON.stringify(safeValue));
    return { ok: true, error: null };
  } catch (err) {
    const isQuota =
      err?.name === "QuotaExceededError" ||
      err?.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      err?.code === 22;
    console.error(`[storage] เขียน "${key}" ไม่สำเร็จ:`, err);
    return { ok: false, error: isQuota ? "quota" : "unknown" };
  }
}

export function removeKey(key) {
  if (!isAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storage] ลบ "${key}" ไม่สำเร็จ:`, err);
  }
}

/** ลบข้อมูลทั้งหมดของแอปนี้ (ไม่แตะ key ของแอปอื่น) */
export function clearNamespace() {
  if (!isAvailable()) return 0;
  let count = 0;
  try {
    const keys = Object.keys(window.localStorage);
    keys.forEach((key) => {
      if (key.startsWith(`${NS}:`) && !key.startsWith(`${NS}:secure:`)) {
        window.localStorage.removeItem(key);
        count += 1;
      }
    });
  } catch (err) {
    console.error("[storage] clearNamespace ล้มเหลว:", err);
  }
  return count;
}

/** ประมาณการพื้นที่ที่แอปนี้ใช้ (bytes) */
export function estimateUsage() {
  if (!isAvailable()) return { bytes: 0, kb: 0, percent: 0 };
  let bytes = 0;
  try {
    Object.keys(window.localStorage).forEach((key) => {
      if (key.startsWith(`${NS}:`)) {
        bytes += (window.localStorage.getItem(key) || "").length * 2;
      }
    });
  } catch {
    /* ignore */
  }
  const LIMIT = 5 * 1024 * 1024; // 5MB โดยประมาณ
  return {
    bytes,
    kb: Math.round(bytes / 1024),
    percent: Math.min(100, Math.round((bytes / LIMIT) * 100)),
  };
}

/** ดึง key ทั้งหมดของ namespace (ใช้ตอน backup/debug) */
export function listKeys() {
  if (!isAvailable()) return [];
  try {
    return Object.keys(window.localStorage).filter((key) =>
      key.startsWith(`${NS}:`)
    );
  } catch {
    return [];
  }
}
