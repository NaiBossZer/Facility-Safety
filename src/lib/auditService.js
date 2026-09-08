// ============================================================
// auditService.js — Centralized Audit Trail & Activity Logging Service
// ============================================================
import { uid, nowISO } from "./helpers.js";

export const AUDIT_MODULES = {
  INSPECTION: "inspection",
  WORK_ORDER: "work_order",
  PROCUREMENT: "procurement",
  FUEL: "fuel",
  MASTER_DATA: "master_data",
  SYSTEM: "system",
};

export const AUDIT_ACTIONS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  STATUS_CHANGE: "STATUS_CHANGE",
  APPROVE: "APPROVE",
  DELETE: "DELETE",
  EXPORT: "EXPORT",
};

export const INITIAL_AUDIT_LOGS = [
  {
    id: "aud-001",
    timestamp: "2026-08-01T08:30:00.000Z",
    module: "fuel",
    action: "CREATE",
    recordId: "mw-tx-01",
    description: "บันทึกการเติมน้ำมันแก๊สโซฮอล์ 95 เข้าถังกลางเครื่องตัดหญ้า 100 ลิตร (3,850 บาท)",
    userName: "นายสมชาย (หัวหน้าหมวดสวน)",
    userRole: "inspector",
    metadata: { receiptNo: "INV-PTT-44091", liters: 100 },
  },
  {
    id: "aud-002",
    timestamp: "2026-08-03T09:15:00.000Z",
    module: "fuel",
    action: "CREATE",
    recordId: "trip-01",
    description: "บันทึกการใช้รถยนต์ 6ฝ-0559 เส้นทางผาลาด - เทศบาล (ระยะทาง 29 กม.)",
    userName: "นายจตุพร",
    userRole: "staff",
    metadata: { startOdo: 672705, endOdo: 672734, distance: 29 },
  },
  {
    id: "aud-003",
    timestamp: "2026-08-05T14:20:00.000Z",
    module: "fuel",
    action: "CREATE",
    recordId: "mw-tx-02",
    description: "เบิกน้ำมันตัดหญ้าสนามฟุตบอลและลานจอดรถ 15 ลิตร",
    userName: "นายสุรชัย (คนงานสวน 1)",
    userRole: "staff",
    metadata: { liters: 15, purpose: "ตัดหญ้าสนามฟุตบอล" },
  },
  {
    id: "aud-004",
    timestamp: "2026-08-20T11:00:00.000Z",
    module: "work_order",
    action: "STATUS_CHANGE",
    recordId: "WO-256908-0001",
    description: "ปรับสถานะใบแจ้งซ่อมระบบปรับอากาศห้องประชุมใหญ่ เป็น 'อนุมัติจัดหา'",
    userName: "นายอภิวัฒน์ สุวรรณนัง",
    userRole: "section_head",
    metadata: { oldStatus: 3, newStatus: 4 },
  },
  {
    id: "aud-005",
    timestamp: "2026-09-01T09:00:00.000Z",
    module: "fuel",
    action: "EXPORT",
    recordId: "memo-206-2569",
    description: "ออกหนังสือบันทึกข้อความสรุปการใช้น้ำมัน งพส.206/2569 เรียน รองคณบดีฝ่ายนโยบายฯ",
    userName: "นายอภิวัฒน์ สุวรรณนัง",
    userRole: "section_head",
    metadata: { totalDistanceKm: 505, fleetCardExpense: 0 },
  },
];

export function buildAuditEntry({ module, action, recordId, description, user, metadata = {} }) {
  return {
    id: uid("aud"),
    timestamp: nowISO(),
    module,
    action,
    recordId: String(recordId || "-"),
    description: description || "",
    userName: user?.name || user?.fullName || "ผู้ใช้งานระบบ",
    userRole: user?.role || "staff",
    metadata,
  };
}
