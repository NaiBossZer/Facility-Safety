// ============================================================
// migrations.js — ยกระดับข้อมูลเก่าให้เข้ากับ schema ใหม่
// เพิ่ม schema version ใหม่ = เพิ่มฟังก์ชันใน MIGRATIONS
// ============================================================
import { NS, SCHEMA_VERSION, readJSON, writeJSON, KEYS, isAvailable } from "./storage";
import { buildDefaultCatalog } from "../config/seed/defaultCatalog";
import { nowISO } from "./helpers";

const vKey = (v, name) => `${NS}:v${v}:${name}`;

/** v1 -> v2 : เพิ่ม catalog + ใส่ snapshot ให้ WO เก่า */
function migrate_1_to_2() {
  const oldWO = readJSON(vKey(1, "workOrders"), null);
  const oldINS = readJSON(vKey(1, "inspections"), null);
  const oldUI = readJSON(vKey(1, "ui"), null);

  if (!oldWO && !oldINS) return false; // ไม่มีข้อมูล v1 ไม่ต้องทำอะไร

  const catalog = buildDefaultCatalog();

  const workOrders = (oldWO || []).map((wo) => ({
    ...wo,
    // WO เก่าไม่มี snapshot — เติมให้ครบ
    items: (wo.items || []).map((it) => ({
      id: it.id || `snap_${Math.random().toString(36).slice(2, 8)}`,
      sourceItemId: it.sourceItemId ?? null,
      name: it.name ?? it.label ?? "-",
      unit: it.unit ?? "รายการ",
      qty: Number(it.qty) || 1,
      unitPrice: Number(it.unitPrice ?? it.price) || 0,
    })),
    migratedFrom: "v1",
  }));

  writeJSON(KEYS.catalog, catalog);
  writeJSON(KEYS.workOrders, workOrders);
  writeJSON(KEYS.inspections, oldINS || []);
  writeJSON(KEYS.ui, oldUI || { page: "dashboard", procureWO: null });

  return true;
}

const MIGRATIONS = {
  2: migrate_1_to_2,
};

/**
 * รัน migration ทั้งหมดที่จำเป็น — เรียกครั้งเดียวตอนแอปเริ่มทำงาน
 * คืน { migrated: boolean, from: number|null, to: number }
 */
export function runMigrations() {
  if (!isAvailable()) {
    return { migrated: false, from: null, to: SCHEMA_VERSION, storage: false };
  }

  const meta = readJSON(KEYS.meta, null);
  const current = meta?.schemaVersion ?? null;

  // ข้อมูลปัจจุบันทันสมัยแล้ว
  if (current === SCHEMA_VERSION) {
    return { migrated: false, from: current, to: SCHEMA_VERSION, storage: true };
  }

  let from = current;
  let migrated = false;

  // ผู้ใช้เก่าที่ยังไม่มี meta — ตรวจว่ามีข้อมูล v1 ไหม
  if (current === null) {
    const hasV1 = readJSON(vKey(1, "workOrders"), null) !== null;
    from = hasV1 ? 1 : 0;
  }

  for (let v = (from || 0) + 1; v <= SCHEMA_VERSION; v += 1) {
    const fn = MIGRATIONS[v];
    if (typeof fn === "function") {
      try {
        const did = fn();
        migrated = migrated || did;
      } catch (err) {
        console.error(`[migrations] v${v - 1} -> v${v} ล้มเหลว:`, err);
      }
    }
  }

  writeJSON(KEYS.meta, {
    ...(meta || {}),
    schemaVersion: SCHEMA_VERSION,
    migratedAt: nowISO(),
    lastSavedAt: meta?.lastSavedAt ?? null,
    woCounter: meta?.woCounter ?? 0,
  });

  return { migrated, from, to: SCHEMA_VERSION, storage: true };
}