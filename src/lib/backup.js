// ============================================================
// backup.js — Export / Import ข้อมูลทั้งระบบเป็นไฟล์ .json
// ============================================================
import { KEYS, readJSON, writeJSON, SCHEMA_VERSION } from "./storage";
import { nowISO } from "./helpers";

export const BACKUP_SIGNATURE = "facility-safety-app-backup";

/** รวบรวมข้อมูลทั้งหมดเป็น object เดียว */
export function buildBackup() {
  return {
    signature: BACKUP_SIGNATURE,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: nowISO(),
    data: {
      catalog: readJSON(KEYS.catalog, null),
      workOrders: readJSON(KEYS.workOrders, []),
      inspections: readJSON(KEYS.inspections, []),
      meta: readJSON(KEYS.meta, null),
    },
  };
}

/** ดาวน์โหลดไฟล์สำรอง */
export function downloadBackup(filename) {
  const payload = buildBackup();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  a.href = url;
  a.download = filename || `fsa-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return payload;
}

/** ตรวจสอบไฟล์ก่อน import — คืน { ok, error, preview } */
export function validateBackup(obj) {
  if (!obj || typeof obj !== "object") {
    return { ok: false, error: "ไฟล์ไม่ถูกต้อง (ไม่ใช่ JSON object)" };
  }
  if (obj.signature !== BACKUP_SIGNATURE) {
    return { ok: false, error: "ไม่ใช่ไฟล์สำรองของระบบนี้" };
  }
  if (!obj.data?.catalog) {
    return { ok: false, error: "ไฟล์สำรองไม่มีข้อมูล catalog" };
  }
  if (Number(obj.schemaVersion) > SCHEMA_VERSION) {
    return { ok: false, error: `ไฟล์มาจากเวอร์ชันใหม่กว่า (v${obj.schemaVersion}) กรุณาอัปเดตแอปก่อน` };
  }
  return {
    ok: true,
    error: null,
    preview: {
      exportedAt: obj.exportedAt,
      schemaVersion: obj.schemaVersion,
      categories: obj.data.catalog?.categories?.length || 0,
      items: obj.data.catalog?.items?.length || 0,
      workOrders: obj.data.workOrders?.length || 0,
      inspections: obj.data.inspections?.length || 0,
    },
  };
}

/** อ่านไฟล์จาก input[type=file] */
export function readBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)));
      } catch {
        reject(new Error("อ่านไฟล์ไม่สำเร็จ — รูปแบบ JSON ไม่ถูกต้อง"));
      }
    };
    reader.onerror = () => reject(new Error("เปิดไฟล์ไม่สำเร็จ"));
    reader.readAsText(file, "utf-8");
  });
}

/** เขียนข้อมูลจาก backup ลง storage (ต้อง reload หน้าหลังเรียก) */
export function applyBackup(obj) {
  const check = validateBackup(obj);
  if (!check.ok) return check;

  writeJSON(KEYS.catalog, obj.data.catalog);
  writeJSON(KEYS.workOrders, obj.data.workOrders || []);
  writeJSON(KEYS.inspections, obj.data.inspections || []);
  writeJSON(KEYS.meta, {
    ...(obj.data.meta || {}),
    schemaVersion: SCHEMA_VERSION,
    restoredAt: nowISO(),
  });

  return { ok: true, error: null, preview: check.preview };
}