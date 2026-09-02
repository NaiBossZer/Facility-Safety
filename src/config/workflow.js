// ============================================================
// workflow.js — กำหนด Track การตรวจ, สถานะ, ความถี่, และเกณฑ์ประเมิน
// ============================================================

/** 2 Track หลักของการตรวจสอบ */
export const INSPECTION_TRACKS = {
  safety_legal: {
    key: "safety_legal",
    title: "1. การตรวจสอบอาคารตามมาตรฐานความปลอดภัยและกฎหมาย",
    shortTitle: "ความปลอดภัย & กฎหมาย",
    desc: "โครงสร้าง, อัคคีภัย, ไฟฟ้าแรงสูง, ทางหนีไฟ (เน้นรอบ 6 เดือน / รายปี เพื่อออกรายงานกฎหมาย)",
    color: "red",
    icon: "ShieldAlert",
    targetPeriod: ["biannual", "yearly"],
    reportType: "annual_safety_report",
  },
  facility_continuity: {
    key: "facility_continuity",
    title: "2. การตรวจสอบความต่อเนื่องของระบบสาธารณูปโภค",
    shortTitle: "สาธารณูปโภค & บำรุงรักษา",
    desc: "แอร์, ปั๊มน้ำ, โซลาร์เซลล์, ประปา, ยานพาหนะ (เน้นรอบ รายวัน/สัปดาห์/เดือน เพื่อออก งพ.001/003)",
    color: "blue",
    icon: "Wrench",
    targetPeriod: ["daily", "weekly", "monthly", "quarterly"],
    reportType: "continuity_maintenance_report",
  },
};

export const TRACK_OPTIONS = Object.values(INSPECTION_TRACKS);

/** Pipeline 7 สถานะของงานซ่อม/จัดซื้อ */
export const STATUS_FLOW = [
  { id: 0, key: "draft",     label: "ร่าง",           color: "slate",   short: "ร่าง" },
  { id: 1, key: "reported",  label: "แจ้งซ่อมแล้ว",    color: "sky",     short: "แจ้งแล้ว" },
  { id: 2, key: "surveyed",  label: "สำรวจหน้างาน",    color: "cyan",    short: "สำรวจ" },
  { id: 3, key: "waiting",   label: "รอพัสดุ/จัดซื้อ",  color: "amber",   short: "รอจัดหา" },
  { id: 4, key: "approved",  label: "อนุมัติจัดหา",    color: "violet",  short: "อนุมัติ" },
  { id: 5, key: "repairing", label: "กำลังดำเนินการ",   color: "blue",    short: "ดำเนินการ" },
  { id: 6, key: "done",      label: "เสร็จสิ้น/ตรวจรับ",color: "emerald", short: "เสร็จสิ้น" },
];

export const STATUS_BY_KEY = Object.fromEntries(
  STATUS_FLOW.map((s) => [s.key, s])
);

export function getStatus(id) {
  return STATUS_FLOW.find((s) => s.id === id) || STATUS_FLOW[0];
}

/** ระดับความเร่งด่วน */
export const PRIORITY = {
  urgent: { key: "urgent", label: "เร่งด่วนวิกฤต", color: "red",     weight: 3, sla: 1 },
  high:   { key: "high",   label: "สำคัญ",           color: "amber",   weight: 2, sla: 7 },
  normal: { key: "normal", label: "ทั่วไป",          color: "sky",     weight: 1, sla: 30 },
  low:    { key: "low",    label: "ตามรอบปกติ",       color: "slate",   weight: 0, sla: 90 },
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
  { key: "pass", label: "ปกติ / ผ่านเกณฑ์",     color: "emerald", icon: "CheckCircle2" },
  { key: "warn", label: "เฝ้าระวัง / ปรับปรุง",  color: "amber",   icon: "AlertTriangle" },
  { key: "fail", label: "ชำรุด / ไม่ผ่านเกณฑ์", color: "red",     icon: "XCircle" },
];

/** แบบฟอร์มเอกสารทางราชการ */
export const DOC_TYPES = {
  "np001": { key: "np001", label: "แบบ งพ 001 — แบบการขออนุมัติจัดหา" },
  "np003": { key: "np003", label: "แบบ งพ 003 — ใบสืบราคา" },
};