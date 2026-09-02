// ============================================================
// workorder.js — หัวใจ Business Logic: แปลงผลตรวจ -> ใบแจ้งซ่อม
// ⭐ กฎ Snapshot: ราคาถูกคัดลอก ณ เวลาสร้าง ห้ามอ้างอิง catalog ย้อนหลัง
// ============================================================
import { uid, nowISO, todayISO } from "./helpers";
import { getItem, getCategory } from "./catalog";
import { PRIORITY } from "../config/workflow";

/** เลขที่ใบแจ้งซ่อม: WO-256909-0001 */
export function makeWoNumber(counter, date = new Date()) {
  const y = date.getFullYear() + 543;
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `WO-${y}${m}-${String(counter).padStart(4, "0")}`;
}

/** สร้าง snapshot อะไหล่จากรายการตรวจ ณ เวลานี้ */
export function snapshotParts(item) {
  return (item?.parts || []).map((p) => ({
    id: uid("snap"),
    sourcePartId: p.id,
    sourceItemId: item.id,
    name: p.name,
    unit: p.unit,
    qty: Number(p.qty) || 1,
    unitPrice: Number(p.unitPrice) || 0,
  }));
}

export function itemsTotal(items = []) {
  return items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
}

/**
 * แปลงผลตรวจเป็นใบแจ้งซ่อม
 * @param inspection { buildingId, inspector, date, results:{[itemId]:"pass"|"warn"|"fail"}, notes:{[itemId]:string} }
 * @param catalog    catalog ปัจจุบัน
 * @param opts       { counter } เลขลำดับถัดไปจาก meta.woCounter
 * @returns { workOrder|null, inspectionRecord, nextCounter, summary }
 */
export function createWorkOrderFromInspection(inspection, catalog, opts = {}) {
  const counter = Number(opts.counter || 0) + 1;
  const results = inspection?.results || {};
  const notes = inspection?.notes || {};

  const failIds = Object.keys(results).filter((id) => results[id] === "fail");
  const warnIds = Object.keys(results).filter((id) => results[id] === "warn");
  const passIds = Object.keys(results).filter((id) => results[id] === "pass");

  const problemIds = [...failIds, ...warnIds];

  // บันทึกประวัติการตรวจเสมอ แม้ไม่มีปัญหา
  const inspectionRecord = {
    id: uid("ins"),
    buildingId: inspection.buildingId,
    inspector: inspection.inspector || "-",
    date: inspection.date || todayISO(),
    createdAt: nowISO(),
    results,
    notes,
    photos: inspection.photos || [],
    summary: { pass: passIds.length, warn: warnIds.length, fail: failIds.length },
    workOrderId: null,
  };

  if (problemIds.length === 0) {
    return {
      workOrder: null,
      inspectionRecord,
      nextCounter: counter - 1, // ไม่ได้ใช้เลข
      summary: inspectionRecord.summary,
    };
  }

  // ---- ประเมินความเร่งด่วน ----
  const criticalFails = failIds.filter((id) => getItem(catalog, id)?.critical);
  let priority = PRIORITY.normal.key;
  if (criticalFails.length > 0) priority = PRIORITY.urgent.key;
  else if (failIds.length > 0) priority = PRIORITY.high.key;

  // ---- Snapshot รายการอะไหล่ ----
  const woItems = [];
  const findings = [];

  problemIds.forEach((id) => {
    const item = getItem(catalog, id);
    if (!item) return;
    const cat = getCategory(catalog, item.categoryId);

    findings.push({
      sourceItemId: item.id,
      label: item.label,                       // snapshot ชื่อ
      categoryId: item.categoryId,
      categoryName: cat?.name || "-",          // snapshot ชื่อหมวด
      standard: item.standard || "",
      result: results[id],
      critical: Boolean(item.critical),
      note: notes[id] || notes.general || "",
    });

    // เอาอะไหล่เฉพาะรายการที่ "ชำรุด" เท่านั้น (เฝ้าระวังยังไม่ต้องซื้อ)
    if (results[id] === "fail") {
      woItems.push(...snapshotParts(item));
    }
  });

  const total = itemsTotal(woItems);
  const woNumber = makeWoNumber(counter);
  const building = (catalog?.buildings || []).find((b) => b.id === inspection.buildingId);

  const workOrder = {
    id: uid("wo"),
    number: woNumber,
    buildingId: inspection.buildingId,
    buildingName: building?.name || "-",       // snapshot ชื่ออาคาร
    buildingCode: building?.code || "-",
    title: buildTitle(findings),
    reporter: inspection.inspector || "-",
    reason: notes.general || (findings.length > 0 ? findings.map((f) => f.label).join(", ") : "-"),
    createdAt: nowISO(),
    date: inspection.date || todayISO(),
    status: 1,                                  // 1 = แจ้งซ่อมแล้ว
    priority,
    findings,                                   // snapshot ผลตรวจที่มีปัญหา
    sourceItemIds: problemIds,
    items: woItems,                             // snapshot อะไหล่+ราคา
    total,
    photos: inspection.photos || [],
    catalogVersionAt: catalog?.catalogVersion ?? null,
    history: [
      { at: nowISO(), status: 1, by: inspection.inspector || "-", note: "สร้างจากผลการตรวจอาคาร" },
    ],
    procurement: null,
  };

  inspectionRecord.workOrderId = workOrder.id;

  return {
    workOrder,
    inspectionRecord,
    nextCounter: counter,
    summary: inspectionRecord.summary,
  };
}

function buildTitle(findings) {
  if (findings.length === 0) return "งานซ่อมบำรุง";
  const first = findings[0].label;
  if (findings.length === 1) return first;
  return `${first} และอีก ${findings.length - 1} รายการ`;
}

/** เปลี่ยนสถานะ WO พร้อมบันทึกประวัติ */
export function advanceStatus(workOrder, nextStatus, { by = "-", note = "" } = {}) {
  return {
    ...workOrder,
    status: nextStatus,
    updatedAt: nowISO(),
    history: [
      ...(workOrder.history || []),
      { at: nowISO(), status: nextStatus, by, note },
    ],
  };
}

/** สรุปสถิติสำหรับ Dashboard */
export function summarizeWorkOrders(workOrders = []) {
  const total = workOrders.length;
  const done = workOrders.filter((w) => w.status === 6).length;
  const open = total - done;
  const urgent = workOrders.filter((w) => w.priority === "urgent" && w.status !== 6).length;
  const waiting = workOrders.filter((w) => w.status === 3).length;
  const cost = workOrders.reduce((s, w) => s + (Number(w.total) || 0), 0);
  const doneCost = workOrders.filter((w) => w.status === 6).reduce((s, w) => s + (Number(w.total) || 0), 0);

  const byStatus = {};
  workOrders.forEach((w) => { byStatus[w.status] = (byStatus[w.status] || 0) + 1; });

  return {
    total, done, open, urgent, waiting, cost, doneCost, byStatus,
    completionRate: total ? Math.round((done / total) * 100) : 0,
  };
}