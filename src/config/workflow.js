// ============================================================
// workflow.js — สถานะงาน / ความเร่งด่วน / ความถี่ / ผลตรวจ
// เปลี่ยน "ลำดับ" ของ STATUS_FLOW ต้องเขียน migration ด้วย
// ============================================================

/** Pipeline 7 สถานะ — index = ค่าที่เก็บใน workOrder.status */
export const STATUS_FLOW = [
  { id: 0, key: "draft",     label: "ร่าง",           color: "slate",   short: "ร่าง" },
  { id: 1, key: "reported",  label: "แจ้งซ่อมแล้ว",    color: "sky",     short: "แจ้งแล้ว" },
  { id: 2, key: "surveyed",  label: "สำรวจหน้างาน",    color: "cyan",    short: "สำรวจ" },
  { id: 3, key: "waiting",   label: "รอวัสดุ/จัดซื้อ",  color: "amber",   short: "รอวัสดุ" },
  { id: 4, key: "approved",  label: "อนุมัติจัดซื้อ",   color: "violet",  short: "อนุมัติ" },
  { id: 5, key: "repairing", label: "กำลังซ่อม",       color: "blue",    short: "ซ่อมอยู่" },
  { id: 6, key: "done",      label: "เสร็จสิ้น",       color: "emerald", short: "เสร็จ" },
];

export const STATUS_BY_KEY = Object.fromEntries(
  STATUS_FLOW.map((s) => [s.key, s])
);

export function getStatus(id) {
  return STATUS_FLOW[id] || STATUS_FLOW[0];
}

/** ระดับความเร่งด่วน */
export const PRIORITY = {
  urgent: { key: "urgent", label: "เร่งด่วนวิกฤต", color: "red",     weight: 3, sla: 1 },
  high:   { key: "high",   label: "สูง",           color: "amber",   weight: 2, sla: 7 },
  normal: { key: "normal", label: "ปกติ",          color: "sky",     weight: 1, sla: 30 },
  low:    { key: "low",    label: "ต่ำ",           color: "slate",   weight: 0, sla: 90 },
};

export const PRIORITY_OPTIONS = Object.values(PRIORITY).sort(
  (a, b) => b.weight - a.weight
);

export function getPriority(key) {
  return PRIORITY[key] || PRIORITY.normal;
}

/** ความถี่ในการตรวจ */
export const FREQUENCY = {
  daily:     { key: "daily",     label: "รายวัน",      days: 1 },
  weekly:    { key: "weekly",    label: "รายสัปดาห์",  days: 7 },
  monthly:   { key: "monthly",   label: "รายเดือน",    days: 30 },
  quarterly: { key: "quarterly", label: "รายไตรมาส",   days: 90 },
  biannual:  { key: "biannual",  label: "ราย 6 เดือน", days: 180 },
  yearly:    { key: "yearly",    label: "รายปี",       days: 365 },
};

export const FREQUENCY_OPTIONS = Object.values(FREQUENCY);

export function getFrequency(key) {
  return FREQUENCY[key] || FREQUENCY.monthly;
}

/** ตัวเลือกผลตรวจ 3 ปุ่ม */
export const RESULT_OPT = [
  { key: "pass", label: "ปกติ",     color: "emerald", icon: "CheckCircle2" },
  { key: "warn", label: "เฝ้าระวัง", color: "amber",   icon: "AlertTriangle" },
  { key: "fail", label: "ชำรุด",     color: "red",     icon: "XCircle" },
];

/** สถานะเอกสารจัดซื้อ */
export const DOC_TYPES = {
  "gp001": { key: "gp001", label: "งพ.001 — ใบขออนุมัติจัดซื้อ" },
  "gp003": { key: "gp003", label: "งพ.003 — ใบสืบราคา" },
};