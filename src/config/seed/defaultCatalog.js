// ============================================================
// defaultCatalog.js — ข้อมูลตั้งต้นของระบบ (Seed Data)
// ⚠️ id ทุกตัวต้องคงที่ตลอดไป เพราะ WO/ประวัติเก่าอ้างอิงอยู่
// ============================================================

export const CATALOG_VERSION = 1;

export const DEFAULT_CATEGORIES = [
  { id: "cat_elec",   name: "ระบบไฟฟ้า",        icon: "Zap",          color: "amber",   order: 1, active: true },
  { id: "cat_fire",   name: "ระบบดับเพลิง",      icon: "Flame",        color: "red",     order: 2, active: true },
  { id: "cat_struct", name: "โครงสร้างอาคาร",    icon: "Building2",    color: "slate",   order: 3, active: true },
  { id: "cat_water",  name: "ระบบประปา/สุขาภิบาล", icon: "Droplets",   color: "cyan",    order: 4, active: true },
  { id: "cat_hvac",   name: "ระบบปรับอากาศ",     icon: "Snowflake",    color: "sky",     order: 5, active: true },
  { id: "cat_lift",   name: "ลิฟต์/บันไดหนีไฟ",  icon: "ArrowUpDown",  color: "violet",  order: 6, active: true },
];

export const DEFAULT_ITEMS = [
  // ---------- ระบบไฟฟ้า ----------
  {
    id: "itm_elec_mdb", categoryId: "cat_elec",
    label: "ตรวจตู้ MDB / เบรกเกอร์หลัก",
    standard: "วสท. 022013", frequency: "monthly",
    critical: true, buildingScope: "all", order: 1, active: true,
    parts: [
      { id: "prt_e1", name: "เบรกเกอร์ 3P 100A", unit: "ตัว", qty: 1, unitPrice: 4500 },
      { id: "prt_e2", name: "ค่าแรงช่างไฟฟ้า",    unit: "งาน", qty: 1, unitPrice: 800 },
    ],
  },
  {
    id: "itm_elec_ground", categoryId: "cat_elec",
    label: "วัดค่าความต้านทานสายดิน (Ground)",
    standard: "วสท. 022013 ข้อ 4.2", frequency: "yearly",
    critical: true, buildingScope: "all", order: 2, active: true,
    parts: [
      { id: "prt_e3", name: "แท่งกราวด์ทองแดง 2.4 ม.", unit: "แท่ง", qty: 1, unitPrice: 1200 },
      { id: "prt_e4", name: "ค่าบริการวัดค่า",          unit: "จุด",  qty: 1, unitPrice: 1500 },
    ],
  },
  {
    id: "itm_elec_emlight", categoryId: "cat_elec",
    label: "ทดสอบไฟฉุกเฉิน (Emergency Light)",
    standard: "กฎกระทรวง ฉ.33", frequency: "monthly",
    critical: false, buildingScope: "all", order: 3, active: true,
    parts: [
      { id: "prt_e5", name: "โคมไฟฉุกเฉิน LED 2x3W", unit: "ชุด", qty: 1, unitPrice: 1850 },
      { id: "prt_e6", name: "แบตเตอรี่สำรอง",         unit: "ก้อน", qty: 1, unitPrice: 650 },
    ],
  },
  {
    id: "itm_elec_wire", categoryId: "cat_elec",
    label: "ตรวจสภาพสายไฟ / ราง Wireway",
    standard: "วสท. 022013", frequency: "quarterly",
    critical: false, buildingScope: "all", order: 4, active: true,
    parts: [
      { id: "prt_e7", name: "สายไฟ THW 2.5 sq.mm", unit: "เมตร", qty: 50, unitPrice: 18 },
    ],
  },

  // ---------- ระบบดับเพลิง ----------
  {
    id: "itm_fire_ext", categoryId: "cat_fire",
    label: "ตรวจถังดับเพลิง (แรงดัน/วันหมดอายุ)",
    standard: "NFPA 10", frequency: "monthly",
    critical: true, buildingScope: "all", order: 1, active: true,
    parts: [
      { id: "prt_f1", name: "ถังดับเพลิงผงเคมี 10 ปอนด์", unit: "ถัง", qty: 1, unitPrice: 1250 },
      { id: "prt_f2", name: "ค่าบรรจุผงเคมีใหม่",         unit: "ถัง", qty: 1, unitPrice: 450 },
    ],
  },
  {
    id: "itm_fire_alarm", categoryId: "cat_fire",
    label: "ทดสอบระบบแจ้งเหตุเพลิงไหม้ (Fire Alarm)",
    standard: "NFPA 72", frequency: "quarterly",
    critical: true, buildingScope: "all", order: 2, active: true,
    parts: [
      { id: "prt_f3", name: "Smoke Detector",   unit: "ตัว", qty: 1, unitPrice: 1600 },
      { id: "prt_f4", name: "ค่าแรงทดสอบระบบ",  unit: "งาน", qty: 1, unitPrice: 2500 },
    ],
  },
  {
    id: "itm_fire_hose", categoryId: "cat_fire",
    label: "ตรวจตู้สายฉีดน้ำดับเพลิง (Fire Hose Cabinet)",
    standard: "NFPA 14", frequency: "quarterly",
    critical: false, buildingScope: "all", order: 3, active: true,
    parts: [
      { id: "prt_f5", name: "สายส่งน้ำดับเพลิง 1.5 นิ้ว x 30 ม.", unit: "เส้น", qty: 1, unitPrice: 3800 },
    ],
  },
  {
    id: "itm_fire_pump", categoryId: "cat_fire",
    label: "ทดสอบเดินเครื่องสูบน้ำดับเพลิง (Fire Pump)",
    standard: "NFPA 25", frequency: "weekly",
    critical: true, buildingScope: "all", order: 4, active: true,
    parts: [
      { id: "prt_f6", name: "ค่าบำรุงรักษาเครื่องสูบน้ำ", unit: "ครั้ง", qty: 1, unitPrice: 5500 },
    ],
  },

  // ---------- โครงสร้างอาคาร ----------
  {
    id: "itm_str_crack", categoryId: "cat_struct",
    label: "ตรวจรอยร้าวเสา/คาน/พื้น",
    standard: "กฎกระทรวง ฉ.6 (พ.ศ.2527)", frequency: "biannual",
    critical: true, buildingScope: "all", order: 1, active: true,
    parts: [
      { id: "prt_s1", name: "อีพ็อกซี่อัดฉีดรอยร้าว", unit: "เมตร", qty: 5, unitPrice: 850 },
      { id: "prt_s2", name: "ค่าวิศวกรตรวจสอบ",       unit: "ครั้ง", qty: 1, unitPrice: 8000 },
    ],
  },
  {
    id: "itm_str_roof", categoryId: "cat_struct",
    label: "ตรวจหลังคา / รางน้ำ / จุดรั่วซึม",
    standard: "-", frequency: "biannual",
    critical: false, buildingScope: "all", order: 2, active: true,
    parts: [
      { id: "prt_s3", name: "แผ่นเมทัลชีท",   unit: "แผ่น", qty: 5, unitPrice: 450 },
      { id: "prt_s4", name: "ซิลิโคนกันรั่ว",  unit: "หลอด", qty: 10, unitPrice: 180 },
    ],
  },
  {
    id: "itm_str_paint", categoryId: "cat_struct",
    label: "ตรวจสภาพสีผนัง / วัสดุกรุผิว",
    standard: "-", frequency: "yearly",
    critical: false, buildingScope: "all", order: 3, active: true,
    parts: [
      { id: "prt_s5", name: "สีน้ำอะคริลิกภายนอก", unit: "ถัง", qty: 4, unitPrice: 1650 },
    ],
  },

  // ---------- ระบบประปา ----------
  {
    id: "itm_wtr_tank", categoryId: "cat_water",
    label: "ตรวจถังเก็บน้ำ / ล้างทำความสะอาด",
    standard: "กรมอนามัย", frequency: "biannual",
    critical: false, buildingScope: "all", order: 1, active: true,
    parts: [
      { id: "prt_w1", name: "ค่าบริการล้างถังน้ำ", unit: "ถัง", qty: 1, unitPrice: 3500 },
    ],
  },
  {
    id: "itm_wtr_pump", categoryId: "cat_water",
    label: "ตรวจปั๊มน้ำ / แรงดันน้ำ",
    standard: "-", frequency: "monthly",
    critical: false, buildingScope: "all", order: 2, active: true,
    parts: [
      { id: "prt_w2", name: "ปั๊มน้ำอัตโนมัติ 400W", unit: "ตัว", qty: 1, unitPrice: 5900 },
      { id: "prt_w3", name: "ค่าแรงติดตั้ง",         unit: "งาน", qty: 1, unitPrice: 1200 },
    ],
  },
  {
    id: "itm_wtr_drain", categoryId: "cat_water",
    label: "ตรวจท่อระบายน้ำ / บ่อดักไขมัน",
    standard: "-", frequency: "quarterly",
    critical: false, buildingScope: "all", order: 3, active: true,
    parts: [
      { id: "prt_w4", name: "ค่าบริการดูดสิ่งปฏิกูล", unit: "ครั้ง", qty: 1, unitPrice: 2800 },
    ],
  },

  // ---------- ระบบปรับอากาศ ----------
  {
    id: "itm_ac_clean", categoryId: "cat_hvac",
    label: "ล้างเครื่องปรับอากาศ / เปลี่ยนฟิลเตอร์",
    standard: "-", frequency: "biannual",
    critical: false, buildingScope: "all", order: 1, active: true,
    parts: [
      { id: "prt_h1", name: "ค่าบริการล้างแอร์", unit: "เครื่อง", qty: 1, unitPrice: 800 },
    ],
  },
  {
    id: "itm_ac_gas", categoryId: "cat_hvac",
    label: "ตรวจน้ำยาแอร์ / จุดรั่ว",
    standard: "-", frequency: "yearly",
    critical: false, buildingScope: "all", order: 2, active: true,
    parts: [
      { id: "prt_h2", name: "น้ำยาแอร์ R32", unit: "ปอนด์", qty: 3, unitPrice: 350 },
    ],
  },
  {
    id: "itm_ac_vent", categoryId: "cat_hvac",
    label: "ตรวจพัดลมระบายอากาศ / ท่อลม",
    standard: "-", frequency: "quarterly",
    critical: false, buildingScope: "all", order: 3, active: true,
    parts: [
      { id: "prt_h3", name: "พัดลมระบายอากาศ 8 นิ้ว", unit: "ตัว", qty: 1, unitPrice: 1450 },
    ],
  },

  // ---------- ลิฟต์ / บันไดหนีไฟ ----------
  {
    id: "itm_lift_maint", categoryId: "cat_lift",
    label: "ตรวจสอบลิฟต์โดยสารประจำเดือน",
    standard: "มอก. 2867", frequency: "monthly",
    critical: true, buildingScope: "all", order: 1, active: true,
    parts: [
      { id: "prt_l1", name: "ค่าบริการ Maintenance ลิฟต์", unit: "ครั้ง", qty: 1, unitPrice: 4500 },
    ],
  },
  {
    id: "itm_lift_stair", categoryId: "cat_lift",
    label: "ตรวจบันไดหนีไฟ / ป้ายทางออก / ประตูกันไฟ",
    standard: "กฎกระทรวง ฉ.55", frequency: "monthly",
    critical: true, buildingScope: "all", order: 2, active: true,
    parts: [
      { id: "prt_l2", name: "ป้ายทางออกฉุกเฉิน LED", unit: "ป้าย", qty: 1, unitPrice: 1200 },
      { id: "prt_l3", name: "โช้คอัพประตูกันไฟ",     unit: "ตัว",  qty: 1, unitPrice: 2200 },
    ],
  },
];

export const DEFAULT_BUILDINGS = [
  { id: "bld_a", code: "A", name: "อาคารอำนวยการ",       floors: 4, year: 2551, order: 1, active: true },
  { id: "bld_b", code: "B", name: "อาคารผู้ป่วยนอก",      floors: 5, year: 2554, order: 2, active: true },
  { id: "bld_c", code: "C", name: "อาคารผู้ป่วยใน 1",     floors: 6, year: 2556, order: 3, active: true },
  { id: "bld_d", code: "D", name: "อาคารผู้ป่วยใน 2",     floors: 6, year: 2560, order: 4, active: true },
  { id: "bld_e", code: "E", name: "อาคารพัสดุและซ่อมบำรุง", floors: 2, year: 2549, order: 5, active: true },
  { id: "bld_f", code: "F", name: "อาคารโรงอาหาร",       floors: 2, year: 2552, order: 6, active: true },
  { id: "bld_g", code: "G", name: "อาคารหอพักเจ้าหน้าที่", floors: 5, year: 2558, order: 7, active: true },
  { id: "bld_h", code: "H", name: "อาคารจอดรถ",          floors: 3, year: 2562, order: 8, active: true },
];

export const DEFAULT_VENDORS = [
  { id: "ven_1", name: "หจก. ไทยเจริญ วิศวกรรม",  tax: "0105551234567", phone: "02-123-4567", order: 1, active: true },
  { id: "ven_2", name: "บจก. เอส.พี. อิเล็คทริค",  tax: "0105549876543", phone: "02-987-6543", order: 2, active: true },
  { id: "ven_3", name: "ร้าน สยามการช่าง",        tax: "3100200345678", phone: "081-234-5678", order: 3, active: true },
];

export const DEFAULT_BUDGET = {
  fiscalYear: 2569,
  total: 2500000,
  currency: "THB",
};

/** ประกอบ catalog ตั้งต้นทั้งก้อน */
export function buildDefaultCatalog() {
  return {
    catalogVersion: CATALOG_VERSION,
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    items: DEFAULT_ITEMS.map((i) => ({
      ...i,
      parts: i.parts.map((p) => ({ ...p })),
      updatedAt: new Date().toISOString(),
    })),
    buildings: DEFAULT_BUILDINGS.map((b) => ({ ...b })),
    vendors: DEFAULT_VENDORS.map((v) => ({ ...v })),
    budget: { ...DEFAULT_BUDGET },
  };
}