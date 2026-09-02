import React, { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard, ClipboardCheck, Wrench, FileText, Building2, ShieldAlert,
  AlertTriangle, CheckCircle2, XCircle, Eye, Camera, Send, Printer, Upload,
  Bell, ChevronRight, Package, Zap, Flame, Wind, Sun, Truck, Layers,
  CircleDollarSign, Clock, Search, X, Menu, TrendingUp, Store, BadgeCheck,
  Loader2, Calendar, MapPin, ClipboardList, Hammer, ShoppingCart, Activity,
  FileCheck2, ArrowRight, Trash2, User, Gauge,
} from "lucide-react";
function DashboardPage({ workOrders, goto, setSelectedWO }) {
  // คำนวณ Stats จาก workOrders ที่ส่งเข้ามา
  const stats = {
    total: workOrders.length,
    open: workOrders.filter((w) => w.status < 7).length,
    urgent: workOrders.filter((w) => w.priority === "urgent" && w.status < 7).length,
    done: workOrders.filter((w) => w.status === 7).length,
  };

  const metrics = [
    { label: "งานทั้งหมด", val: stats.total, icon: ClipboardCheck, color: "text-slate-600", bg: "bg-slate-50" },
    { label: "กำลังดำเนินการ", val: stats.open, icon: Wrench, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "เร่งด่วน", val: stats.urgent, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: "เสร็จสิ้น", val: stats.done, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-6 animate-fade">
      <h2 className="text-2xl font-bold text-slate-800">สรุปภาพรวม</h2>
      
      {/* Metrics Section */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={cx("rounded-xl p-2.5", m.bg)}>
                <m.icon className={cx("h-6 w-6", m.color)} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className="text-2xl font-bold text-slate-800">{m.val}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">ใบแจ้งซ่อมล่าสุด</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {[...workOrders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map((w) => (
              <button 
                key={w.id} 
                onClick={() => { setSelectedWO(w.id); goto("workorder"); }}
                className="grid w-full grid-cols-1 gap-2 px-6 py-4 text-left transition hover:bg-slate-50 sm:grid-cols-12 sm:items-center"
              >
                <span className="col-span-3 font-mono text-xs text-slate-500">{w.id}</span>
                <span className="col-span-6 truncate text-sm font-semibold text-slate-700">{w.title}</span>
                <span className="col-span-3 text-right">
                  <Badge className={st(w.status).soft}>{st(w.status).name}</Badge>
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
/* ==================================================================== */
/*  CONFIG & MOCK DATA                                                  */
/* ==================================================================== */

const cx = (...a) => a.filter(Boolean).join(" ");
const fmt = (n) => n.toLocaleString("th-TH");
const thDate = (d) =>
  new Date(d).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
const todayTH = () =>
  new Date().toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const BUILDINGS = [
  { id: "B1", name: "อาคาร 1", detail: "อาคารอำนวยการ" },
  { id: "B2", name: "อาคาร 2", detail: "อาคารปฏิบัติการ" },
  { id: "B3", name: "อาคาร 3", detail: "คลังพัสดุกลาง" },
  { id: "B4", name: "อาคาร 4", detail: "หอประชุมใหญ่" },
  { id: "B5", name: "อาคาร 5", detail: "โรงเรือน Smart Farm" },
  { id: "B6", name: "อาคาร 6", detail: "โรงจอดรถ / ยานพาหนะ" },
  { id: "B7", name: "อาคาร 7", detail: "อาคารที่พักอาศัย" },
  { id: "B8", name: "อาคาร 8", detail: "อาคารซ่อมบำรุง" },
];

const CATEGORIES = [
  { id: "structure", no: 1, name: "โครงสร้างอาคาร (7 หมวด)", short: "โครงสร้าง", icon: Layers,  ring: "ring-slate-300",  chip: "bg-slate-100 text-slate-700",   active: "bg-slate-800 text-white" },
  { id: "fire",      no: 2, name: "อัคคีภัย & ไฟฉุกเฉิน",     short: "อัคคีภัย",   icon: Flame,   ring: "ring-red-300",    chip: "bg-red-50 text-red-700",        active: "bg-red-600 text-white" },
  { id: "electric",  no: 3, name: "ตู้ MDB & ระบบไฟฟ้า",       short: "ไฟฟ้า",     icon: Zap,     ring: "ring-amber-300",  chip: "bg-amber-50 text-amber-700",    active: "bg-amber-500 text-white" },
  { id: "hvac",      no: 4, name: "ระบบปรับอากาศ & ปั๊มน้ำ",   short: "แอร์/ปั๊มน้ำ", icon: Wind,  ring: "ring-sky-300",    chip: "bg-sky-50 text-sky-700",        active: "bg-sky-600 text-white" },
  { id: "solar",     no: 5, name: "Smart Farm & โซลาร์เซลล์",  short: "Solar",     icon: Sun,     ring: "ring-emerald-300",chip: "bg-emerald-50 text-emerald-700",active: "bg-emerald-600 text-white" },
  { id: "vehicle",   no: 6, name: "ยานพาหนะ",                 short: "ยานพาหนะ",  icon: Truck,   ring: "ring-indigo-300", chip: "bg-indigo-50 text-indigo-700",  active: "bg-indigo-600 text-white" },
];

/* checklist: critical = true -> เลือก Fail แล้วยกระดับ Urgent ทันที */
const CHECKLIST = {
  structure: [
    { id: "st1", label: "1. ฐานราก/เสาเข็ม – ไม่พบการทรุดตัวหรือเอียงของฐานราก", critical: true,  part: { name: "งานเสริมฐานราก + Micro Pile", qty: 1, unit: "งาน", price: 185000 } },
    { id: "st2", label: "2. เสา – พบรอยแตกร้าววิบัติ (Structural Crack) ที่เสา", critical: true, part: { name: "วัสดุ Epoxy Injection + Carbon Fiber Wrap", qty: 12, unit: "เมตร", price: 4500 } },
    { id: "st3", label: "3. คาน – รอยร้าวแนวดิ่ง / เหล็กเสริมเป็นสนิม", part: { name: "ปูนซ่อมโครงสร้าง Non-Shrink Grout", qty: 20, unit: "ถุง", price: 480 } },
    { id: "st4", label: "4. พื้น – พื้นแอ่นตัว / ทรุดตัวผิดปกติ", critical: true, part: { name: "งานเทพื้นคอนกรีตเสริมเหล็กใหม่", qty: 45, unit: "ตร.ม.", price: 950 } },
    { id: "st5", label: "5. ผนัง – รอยร้าวลายงา / คราบน้ำรั่วซึม", part: { name: "ซีเมนต์กันซึม + สีทาภายนอก", qty: 8, unit: "ถัง", price: 1250 } },
    { id: "st6", label: "6. หลังคา/โครงหลังคา – รั่วซึม สนิมกัดกร่อน", part: { name: "แผ่นเมทัลชีท + สกรูยึด", qty: 30, unit: "แผ่น", price: 620 } },
    { id: "st7", label: "7. บันได/ราวกันตก – ความมั่นคงแข็งแรง", part: { name: "เหล็กกล่องราวกันตก + งานเชื่อม", qty: 15, unit: "เมตร", price: 850 } },
  ],
  fire: [
    { id: "fi1", label: "ถังดับเพลิงพร้อมใช้งาน / เข็มวัดความดันอยู่ในช่องเขียว", part: { name: "บรรจุผงเคมีแห้ง 15 ปอนด์", qty: 12, unit: "ถัง", price: 450 } },
    { id: "fi2", label: "ตู้สายฉีดน้ำดับเพลิง (Fire Hose Cabinet) ครบชุด", part: { name: "สายส่งน้ำดับเพลิง 1.5 นิ้ว ยาว 30 ม.", qty: 4, unit: "ชุด", price: 3800 } },
    { id: "fi3", label: "Fire Alarm Panel / Smoke Detector ทำงานปกติ", part: { name: "Smoke Detector แบบ Photoelectric", qty: 10, unit: "ตัว", price: 1450 } },
    { id: "fi4", label: "ไฟฉุกเฉินสำรองไฟน้อยกว่า 2 ชม. (Battery Backup)", critical: true, part: { name: "แบตเตอรี่ไฟฉุกเฉิน 12V 7.2Ah + โคมไฟฉุกเฉิน LED", qty: 18, unit: "ชุด", price: 2350 } },
    { id: "fi5", label: "ป้าย EXIT เรืองแสง มองเห็นชัดเจนทุกจุด", part: { name: "ป้ายทางออกฉุกเฉิน LED 2 หน้า", qty: 8, unit: "ป้าย", price: 1150 } },
    { id: "fi6", label: "เส้นทางหนีไฟ/ประตูหนีไฟ ไม่มีสิ่งกีดขวาง", part: { name: "อุปกรณ์ Panic Bar ประตูหนีไฟ", qty: 3, unit: "ชุด", price: 4200 } },
    { id: "fi7", label: "หัวกระจายน้ำดับเพลิง (Sprinkler) ไม่ชำรุด/อุดตัน", part: { name: "หัว Sprinkler ทองเหลือง 68°C", qty: 25, unit: "หัว", price: 320 } },
    { id: "fi8", label: "เครื่องสูบน้ำดับเพลิง (Fire Pump) เดินเครื่องปกติ", part: { name: "ค่าบริการบำรุงรักษา Fire Pump", qty: 1, unit: "งาน", price: 25000 } },
  ],
  electric: [
    { id: "el1", label: "ตู้ MDB สภาพภายนอกสมบูรณ์ / ไม่มีความร้อนสะสม", part: { name: "พัดลมระบายความร้อนตู้ควบคุม", qty: 4, unit: "ตัว", price: 1850 } },
    { id: "el2", label: "Thermo Scan จุดต่อสาย – ไม่พบ Hot Spot", part: { name: "งานขันแน่นบัสบาร์ + เปลี่ยนหางปลา", qty: 1, unit: "งาน", price: 18500 } },
    { id: "el3", label: "ค่า Load Balance 3 เฟส ต่างกันไม่เกิน 10%", part: { name: "ค่าบริการปรับสมดุลโหลดไฟฟ้า", qty: 1, unit: "งาน", price: 12000 } },
    { id: "el4", label: "ระบบสายดิน (Ground) ค่าความต้านทาน < 5 โอห์ม", part: { name: "แท่งกราวด์ทองแดง + สายดิน THW 35 sq.mm.", qty: 6, unit: "ชุด", price: 2750 } },
    { id: "el5", label: "Breaker / Safety Cut ตัดวงจรได้ปกติ", part: { name: "MCCB 3P 250A", qty: 2, unit: "ตัว", price: 8900 } },
    { id: "el6", label: "หม้อแปลงไฟฟ้า – ระดับน้ำมัน/ซิลิก้าเจลปกติ", part: { name: "น้ำมันหม้อแปลง + ซิลิก้าเจล", qty: 1, unit: "ชุด", price: 15500 } },
    { id: "el7", label: "เครื่องกำเนิดไฟฟ้าสำรอง (Generator) ทดสอบเดินเครื่อง", part: { name: "แบตเตอรี่สตาร์ท + กรองน้ำมันเครื่อง", qty: 1, unit: "ชุด", price: 9800 } },
  ],
  hvac: [
    { id: "hv1", label: "เครื่องปรับอากาศ ความเย็นปกติ / น้ำยาแอร์ไม่รั่ว", part: { name: "น้ำยาแอร์ R32 + งานเติม", qty: 6, unit: "เครื่อง", price: 1650 } },
    { id: "hv2", label: "ล้างแผงคอยล์ / ฟิลเตอร์ตามรอบบำรุงรักษา", part: { name: "ค่าบริการล้างแอร์ขนาด 25,000 BTU", qty: 14, unit: "เครื่อง", price: 750 } },
    { id: "hv3", label: "ท่อน้ำทิ้งแอร์ไม่อุดตัน / ไม่มีน้ำหยด", part: { name: "ท่อ PVC + ฉนวนหุ้มท่อน้ำทิ้ง", qty: 40, unit: "เมตร", price: 95 } },
    { id: "hv4", label: "ปั๊มน้ำ แรงดันคงที่ / ไม่มีเสียงผิดปกติ", part: { name: "ปั๊มน้ำอัตโนมัติ 400W + ตู้ควบคุม", qty: 2, unit: "ชุด", price: 8500 } },
    { id: "hv5", label: "ถังเก็บน้ำ / ถังสูง สะอาด ไม่มีตะกอน", part: { name: "ค่าบริการล้างถังเก็บน้ำ 2,000 ลิตร", qty: 3, unit: "ถัง", price: 2400 } },
    { id: "hv6", label: "Foot Valve / ระบบควบคุมอัตโนมัติทำงานปกติ", part: { name: "Foot Valve ทองเหลือง 2 นิ้ว", qty: 3, unit: "ตัว", price: 1250 } },
  ],
  solar: [
    { id: "so1", label: "แผงโซลาร์เซลล์ สะอาด ไม่มีรอยแตก/เงาบัง", part: { name: "ค่าบริการล้างแผงโซลาร์เซลล์", qty: 120, unit: "แผง", price: 65 } },
    { id: "so2", label: "Inverter ไม่แสดง Error Code / ระบายความร้อนดี", part: { name: "Grid-Tie Inverter 10kW", qty: 1, unit: "ตัว", price: 62000 } },
    { id: "so3", label: "กำลังผลิตไฟฟ้า (kWh) เป็นไปตามเป้าหมายรายวัน", part: { name: "ค่าบริการตรวจวิเคราะห์ String + MPPT", qty: 1, unit: "งาน", price: 8500 } },
    { id: "so4", label: "แบตเตอรี่ / ระบบสำรองไฟฟ้าอยู่ในเกณฑ์", part: { name: "แบตเตอรี่ลิเธียม LiFePO4 48V 100Ah", qty: 2, unit: "ลูก", price: 38000 } },
    { id: "so5", label: "ระบบให้น้ำอัตโนมัติ Smart Farm ทำงานตามตารางเวลา", part: { name: "โซลินอยด์วาล์ว + ตัวควบคุมการให้น้ำ", qty: 4, unit: "ชุด", price: 3200 } },
    { id: "so6", label: "เซนเซอร์อุณหภูมิ/ความชื้น + IoT Gateway ส่งข้อมูลปกติ", part: { name: "IoT Sensor Node + Gateway LoRa", qty: 5, unit: "ชุด", price: 5400 } },
  ],
  vehicle: [
    { id: "ve1", label: "ระดับน้ำมันเครื่อง / น้ำมันเกียร์ / น้ำหล่อเย็น", part: { name: "น้ำมันเครื่องดีเซลสังเคราะห์ + กรอง", qty: 3, unit: "ชุด", price: 2450 } },
    { id: "ve2", label: "ยาง – ดอกยาง/แรงดันลมอยู่ในเกณฑ์ปลอดภัย", part: { name: "ยางรถยนต์ 215/70 R15", qty: 4, unit: "เส้น", price: 3900 } },
    { id: "ve3", label: "ระบบเบรก / ผ้าเบรก / น้ำมันเบรก", part: { name: "ผ้าเบรกหน้า-หลัง + น้ำมันเบรก DOT4", qty: 2, unit: "ชุด", price: 4600 } },
    { id: "ve4", label: "ไฟส่องสว่าง / ไฟเลี้ยว / ไฟเบรก ครบถ้วน", part: { name: "หลอดไฟรถยนต์ LED + ฟิวส์", qty: 10, unit: "ชุด", price: 480 } },
    { id: "ve5", label: "ประกันภัย / พ.ร.บ. / ภาษีรถยนต์ ไม่หมดอายุ", part: { name: "ค่าต่อ พ.ร.บ. + ภาษีประจำปี", qty: 3, unit: "คัน", price: 3200 } },
    { id: "ve6", label: "ถังดับเพลิงประจำรถ / ชุดปฐมพยาบาลครบ", part: { name: "ถังดับเพลิงรถยนต์ + ชุดปฐมพยาบาล", qty: 5, unit: "ชุด", price: 1350 } },
  ],
};

const STATUS_FLOW = [
  { id: 1, name: "รับเรื่อง",        icon: Bell,         dot: "bg-slate-400",   soft: "bg-slate-100 text-slate-700 border-slate-200" },
  { id: 2, name: "ตรวจสอบแล้ว",     icon: Eye,          dot: "bg-violet-500",  soft: "bg-violet-100 text-violet-700 border-violet-200" },
  { id: 3, name: "รอวัสดุ",          icon: Package,      dot: "bg-amber-500",   soft: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: 4, name: "รอช่าง",           icon: User,         dot: "bg-orange-500",  soft: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: 5, name: "กำลังดำเนินการ",   icon: Hammer,       dot: "bg-indigo-500",  soft: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { id: 6, name: "รอตรวจรับ",        icon: ClipboardList,dot: "bg-sky-500",     soft: "bg-sky-100 text-sky-700 border-sky-200" },
  { id: 7, name: "เสร็จสิ้น",         icon: CheckCircle2, dot: "bg-emerald-500", soft: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

const PRIORITY = {
  urgent: { label: "เร่งด่วน", badge: "bg-red-50 text-red-700 border-red-200",    solid: "bg-red-600",    bar: "bg-red-500",    rank: 0 },
  high:   { label: "สำคัญ",   badge: "bg-amber-50 text-amber-700 border-amber-200", solid: "bg-amber-500", bar: "bg-amber-500", rank: 1 },
  normal: { label: "ทั่วไป",  badge: "bg-sky-50 text-sky-700 border-sky-200",     solid: "bg-sky-600",    bar: "bg-sky-500",    rank: 2 },
};

const RESULT_OPT = [
  { key: "pass", label: "ปกติ",          icon: CheckCircle2,  on: "bg-emerald-500 text-white border-emerald-500 shadow-emerald-200", off: "text-emerald-700 border-emerald-200 hover:bg-emerald-50" },
  { key: "warn", label: "เฝ้าระวัง",     icon: AlertTriangle, on: "bg-amber-500 text-white border-amber-500 shadow-amber-200",       off: "text-amber-700 border-amber-200 hover:bg-amber-50" },
  { key: "fail", label: "ไม่ผ่าน/อันตราย", icon: XCircle,     on: "bg-red-600 text-white border-red-600 shadow-red-200",             off: "text-red-700 border-red-200 hover:bg-red-50" },
];

const VENDORS = [
  { name: "บริษัท ไทยเทคนิค ซัพพลาย จำกัด", tax: "0105542001234", tel: "02-591-8800", factor: 1.0 },
  { name: "หจก. ศรีอยุธยาการช่าง",           tax: "0143551000987", tel: "035-241-556", factor: 1.075 },
  { name: "ร้าน พี.เอ็น. วัสดุภัณฑ์",          tax: "3100600123456", tel: "081-445-2290", factor: 1.142 },
];

const BUDGET_TOTAL = 2500000;

const INITIAL_WO = [
  {
    id: "WO-2569-001", title: "ไฟฉุกเฉินสำรองไฟน้อยกว่า 2 ชม. ชั้น 1-3", building: "B3", category: "fire",
    priority: "urgent", status: 5, reporter: "นายสมชาย ตรวจดี", createdAt: "2026-08-27", eoffice: false,
    reason: "ไฟฉุกเฉินสำรองไฟได้ต่ำกว่ามาตรฐาน 2 ชั่วโมง เสี่ยงต่อความปลอดภัยของผู้ใช้อาคารกรณีไฟฟ้าดับ",
    items: [{ name: "แบตเตอรี่ไฟฉุกเฉิน 12V 7.2Ah + โคมไฟฉุกเฉิน LED", qty: 18, unit: "ชุด", price: 2350 }],
    log: [{ s: 1, at: "2026-08-27" }, { s: 2, at: "2026-08-28" }, { s: 5, at: "2026-08-31" }],
  },
  {
    id: "WO-2569-002", title: "พบรอยแตกร้าววิบัติที่เสา C-4 โถงกลาง", building: "B1", category: "structure",
    priority: "urgent", status: 3, reporter: "นางสาวปิยะดา วิศวกรรม", createdAt: "2026-08-29", eoffice: false,
    reason: "ตรวจพบรอยแตกร้าวลักษณะวิบัติเชิงโครงสร้างที่เสา C-4 ต้องเสริมกำลังโดยเร่งด่วนเพื่อป้องกันการวิบัติของอาคาร",
    items: [
      { name: "วัสดุ Epoxy Injection + Carbon Fiber Wrap", qty: 12, unit: "เมตร", price: 4500 },
      { name: "ปูนซ่อมโครงสร้าง Non-Shrink Grout", qty: 20, unit: "ถุง", price: 480 },
    ],
    log: [{ s: 1, at: "2026-08-29" }, { s: 2, at: "2026-08-30" }, { s: 3, at: "2026-09-01" }],
  },
  {
    id: "WO-2569-003", title: "Inverter โซลาร์เซลล์แจ้ง Error Code E-042", building: "B5", category: "solar",
    priority: "high", status: 3, reporter: "นายวีรยุทธ พลังงาน", createdAt: "2026-08-30", eoffice: true,
    reason: "อินเวอร์เตอร์หยุดจ่ายไฟเข้าระบบ ทำให้สูญเสียกำลังผลิตไฟฟ้าเฉลี่ย 42 kWh/วัน กระทบต้นทุนพลังงานโรงเรือน",
    items: [{ name: "Grid-Tie Inverter 10kW", qty: 1, unit: "ตัว", price: 62000 }],
    log: [{ s: 1, at: "2026-08-30" }, { s: 2, at: "2026-08-31" }, { s: 3, at: "2026-09-01" }],
  },
  {
    id: "WO-2569-004", title: "ปั๊มน้ำหอประชุมมีเสียงดังผิดปกติ แรงดันตก", building: "B4", category: "hvac",
    priority: "normal", status: 6, reporter: "นายกิตติศักดิ์ อาคารสถานที่", createdAt: "2026-08-20", eoffice: true,
    reason: "ปั๊มน้ำเดิมใช้งานเกินอายุ ทำให้แรงดันน้ำไม่เพียงพอต่อการใช้งานห้องน้ำหอประชุม",
    items: [{ name: "ปั๊มน้ำอัตโนมัติ 400W + ตู้ควบคุม", qty: 2, unit: "ชุด", price: 8500 }],
    log: [{ s: 1, at: "2026-08-20" }, { s: 3, at: "2026-08-22" }, { s: 5, at: "2026-08-26" }, { s: 6, at: "2026-08-31" }],
  },
  {
    id: "WO-2569-005", title: "Hot Spot จุดต่อบัสบาร์ตู้ MDB-2 (Thermo Scan)", building: "B2", category: "electric",
    priority: "high", status: 7, reporter: "นายอรรถพล ไฟฟ้ากำลัง", createdAt: "2026-08-11", eoffice: true,
    reason: "ตรวจพบอุณหภูมิจุดต่อสูงผิดปกติ 82°C เสี่ยงเกิดอัคคีภัยจากไฟฟ้าลัดวงจร",
    items: [{ name: "งานขันแน่นบัสบาร์ + เปลี่ยนหางปลา", qty: 1, unit: "งาน", price: 18500 }],
    log: [{ s: 1, at: "2026-08-11" }, { s: 2, at: "2026-08-12" }, { s: 5, at: "2026-08-15" }, { s: 7, at: "2026-08-19" }],
  },
  {
    id: "WO-2569-006", title: "รถตู้ทะเบียน นข-4471 ผ้าเบรกใกล้หมด", building: "B6", category: "vehicle",
    priority: "normal", status: 1, reporter: "นายธนกฤต ยานพาหนะ", createdAt: "2026-09-01", eoffice: false,
    reason: "ผ้าเบรกสึกเหลือต่ำกว่า 2 มม. ต้องเปลี่ยนก่อนนำรถออกให้บริการ",
    items: [{ name: "ผ้าเบรกหน้า-หลัง + น้ำมันเบรก DOT4", qty: 2, unit: "ชุด", price: 4600 } ],
    log: [{ s: 1, at: "2026-09-01" }],
  },
];

const NAV = [
  { id: "dashboard",   name: "Dashboard",            desc: "ภาพรวมระบบ",              icon: LayoutDashboard },
  { id: "inspection",  name: "Inspection Checklist", desc: "บันทึกแบบตรวจเช็ค",        icon: ClipboardCheck },
  { id: "workorder",   name: "Work Orders",          desc: "ติดตามใบแจ้งซ่อม",         icon: Wrench },
  { id: "procurement", name: "E-Procurement",        desc: "งพ.001 / งพ.003",         icon: FileText },
];

/* helpers */
const bName = (id) => BUILDINGS.find((b) => b.id === id)?.name || "-";
const bFull = (id) => { const b = BUILDINGS.find((x) => x.id === id); return b ? `${b.name} (${b.detail})` : "-"; };
const cat = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
const st = (id) => STATUS_FLOW.find((s) => s.id === id) || STATUS_FLOW[0];
const woTotal = (wo) => wo.items.reduce((s, i) => s + i.qty * i.price, 0);

/* ==================================================================== */
/*  SHARED UI                                                           */
/* ==================================================================== */

function Badge({ children, className, pulse }) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap", className)}>
      {pulse && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
      {children}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, tone, footer }) {
  const tones = {
    indigo:  { bg: "bg-indigo-50",  fg: "text-indigo-600",  ring: "ring-indigo-100" },
    red:     { bg: "bg-red-50",     fg: "text-red-600",     ring: "ring-red-100" },
    amber:   { bg: "bg-amber-50",   fg: "text-amber-600",   ring: "ring-amber-100" },
    emerald: { bg: "bg-emerald-50", fg: "text-emerald-600", ring: "ring-emerald-100" },
  };
  const t = tones[tone] || tones.indigo;
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold leading-none text-slate-800">{value}</p>
          {sub && <p className="mt-1.5 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={cx("shrink-0 rounded-xl p-3 ring-8 transition-transform duration-300 group-hover:scale-110", t.bg, t.ring)}>
          <Icon className={cx("h-5 w-5", t.fg)} />
        </div>
      </div>
      {footer && <div className="mt-4 border-t border-dashed border-slate-200 pt-3">{footer}</div>}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, desc, right }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {Icon && <span className="rounded-lg bg-slate-800 p-2 text-white shadow-sm"><Icon className="h-4 w-4" /></span>}
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          {desc && <p className="text-xs text-slate-500">{desc}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
      <div className="rounded-2xl bg-slate-100 p-4"><Icon className="h-7 w-7 text-slate-400" /></div>
      <p className="mt-3 font-semibold text-slate-600">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-400">{desc}</p>
    </div>
  );
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const map = {
    success: { bg: "bg-emerald-600", icon: CheckCircle2 },
    error:   { bg: "bg-red-600",     icon: XCircle },
    info:    { bg: "bg-indigo-600",  icon: Bell },
  };
  const t = map[toast.type] || map.info;
  const Icon = t.icon;
  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-24 z-80 flex justify-center px-4 sm:bottom-8">
      <div className={cx("pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl px-4 py-3 text-white shadow-2xl animate-fade", t.bg)}>
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="text-sm leading-relaxed">
          <p className="font-bold">{toast.title}</p>
          {toast.msg && <p className="text-white/85">{toast.msg}</p>}
        </div>
        <button onClick={onClose} className="ml-1 rounded-lg p-1 transition hover:bg-white/20"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  DASHBOARD                                                           */
/* ==================================================================== */

function DashboardPage({ workOrders, inspections, goto, setSelectedWO }) {
  const urgent = workOrders.filter((w) => w.priority === "urgent" && w.status < 7);
  const openWO = workOrders.filter((w) => w.status < 7);
  const done = workOrders.filter((w) => w.status === 7);
  const spent = done.reduce((s, w) => s + woTotal(w), 0);
  const committed = openWO.reduce((s, w) => s + woTotal(w), 0);
  const usedPct = Math.min(100, Math.round(((spent + committed) / BUDGET_TOTAL) * 100));

  const todayInsp = inspections.length;
  const failPoints = inspections.reduce(
    (s, i) => s + Object.values(i.results).filter((r) => r === "fail").length, 0);
  const warnPoints = inspections.reduce(
    (s, i) => s + Object.values(i.results).filter((r) => r === "warn").length, 0);

  const pipeline = STATUS_FLOW.map((s) => ({ ...s, count: workOrders.filter((w) => w.status === s.id).length }));
  const maxCount = Math.max(1, ...pipeline.map((p) => p.count));

  const byBuilding = BUILDINGS.map((b) => ({
    ...b, count: workOrders.filter((w) => w.building === b.id && w.status < 7).length,
  })).filter((b) => b.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6 animate-fade">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-indigo-700 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge className="border-white/25 bg-white/15 text-white">ระบบตรวจเช็คอาคารและความปลอดภัย</Badge>
            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">ภาพรวมระบบบำรุงรักษา</h1>
            <p className="mt-1 text-sm text-indigo-100">{todayTH()} · ผู้ใช้งาน: ฝ่ายอาคารสถานที่และความปลอดภัย</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => goto("inspection")}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-lg transition hover:bg-indigo-50 active:scale-95">
              <ClipboardCheck className="h-4 w-4" /> เริ่มตรวจเช็ค
            </button>
            <button onClick={() => goto("workorder")}
              className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 active:scale-95">
              <Wrench className="h-4 w-4" /> งานซ่อม
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ClipboardCheck} tone="indigo" label="การตรวจประจำวันนี้" value={todayInsp}
          sub={`บันทึกแล้ว ${todayInsp} รอบตรวจ · ${BUILDINGS.length} อาคาร`}
          footer={<div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600"><TrendingUp className="h-3.5 w-3.5" /> ครอบคลุม 6 หมวดการตรวจ</div>} />
        <StatCard icon={ShieldAlert} tone="red" label="จุดที่ไม่ผ่านเกณฑ์" value={failPoints}
          sub={`เฝ้าระวังเพิ่มเติมอีก ${warnPoints} จุด`}
          footer={<button onClick={() => goto("inspection")} className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline">ตรวจเพิ่มเติม <ChevronRight className="h-3.5 w-3.5" /></button>} />
        <StatCard icon={AlertTriangle} tone="amber" label="ใบแจ้งซ่อมเร่งด่วน" value={urgent.length}
          sub={`งานค้างทั้งหมด ${openWO.length} รายการ`}
          footer={<button onClick={() => goto("workorder")} className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:underline">เปิดดู Work Orders <ChevronRight className="h-3.5 w-3.5" /></button>} />
        <StatCard icon={CircleDollarSign} tone="emerald" label="สถานะงบประมาณ" value={`${usedPct}%`}
          sub={`ใช้ไป ${fmt(spent + committed)} / ${fmt(BUDGET_TOTAL)} บาท`}
          footer={
            <div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={cx("h-full rounded-full transition-all duration-700", usedPct > 80 ? "bg-red-500" : usedPct > 60 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${usedPct}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">คงเหลือ {fmt(BUDGET_TOTAL - spent - committed)} บาท</p>
            </div>} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Urgent alerts */}
        <div className="xl:col-span-2">
          <SectionTitle icon={Bell} title="แจ้งเตือนด่วนที่สุด (Urgent Priority)" desc="รายการที่ต้องดำเนินการทันทีตามมาตรฐานความปลอดภัย"
            right={<Badge className="border-red-200 bg-red-50 text-red-700" pulse>{urgent.length} รายการ</Badge>} />
          {urgent.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="ไม่มีรายการเร่งด่วนค้างอยู่" desc="ทุกจุดตรวจอยู่ในเกณฑ์ปลอดภัย" />
          ) : (
            <div className="space-y-3">
              {urgent.map((w) => {
                const C = cat(w.category).icon;
                return (
                  <div key={w.id} className="group relative overflow-hidden rounded-2xl border border-red-200 bg-white p-4 shadow-sm transition hover:shadow-lg hover:shadow-red-100">
                    <span className="absolute inset-y-0 left-0 w-1.5 bg-linear-to-b from-red-500 to-red-700" />
                    <div className="flex flex-col gap-3 pl-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="mt-0.5 shrink-0 rounded-xl bg-red-50 p-2.5 ring-4 ring-red-50"><C className="h-5 w-5 text-red-600" /></span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={PRIORITY.urgent.badge} pulse>เร่งด่วน</Badge>
                            <span className="font-mono text-[11px] text-slate-400">{w.id}</span>
                          </div>
                          <p className="mt-1 truncate font-bold text-slate-800">{w.title}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{bFull(w.building)}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{thDate(w.createdAt)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 pl-11 sm:pl-0">
                        <Badge className={st(w.status).soft}>{st(w.status).id}. {st(w.status).name}</Badge>
                        <button onClick={() => { setSelectedWO(w.id); goto("workorder"); }}
                          className="flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-900 active:scale-95">
                          จัดการ <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent work orders */}
          <div className="mt-6">
            <SectionTitle icon={Wrench} title="ใบแจ้งซ่อมล่าสุด" desc="อัปเดตสถานะล่าสุดในระบบ" />
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="hidden bg-slate-50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:grid sm:grid-cols-12">
                <span className="col-span-3">เลขที่</span><span className="col-span-4">รายการ</span>
                <span className="col-span-2">อาคาร</span><span className="col-span-3 text-right">สถานะ</span>
              </div>
              <div className="divide-y divide-slate-100">
                {[...workOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((w) => (
                  <button key={w.id} onClick={() => { setSelectedWO(w.id); goto("workorder"); }}
                    className="grid w-full grid-cols-1 gap-1 px-4 py-3 text-left transition hover:bg-slate-50 sm:grid-cols-12 sm:items-center">
                    <span className="col-span-3 font-mono text-xs text-slate-500">{w.id}</span>
                    <span className="col-span-4 truncate text-sm font-semibold text-slate-700">{w.title}</span>
                    <span className="col-span-2 text-xs text-slate-500">{bName(w.building)}</span>
                    <span className="col-span-3 flex justify-start gap-2 sm:justify-end">
                      <Badge className={PRIORITY[w.priority].badge}>{PRIORITY[w.priority].label}</Badge>
                      <Badge className={st(w.status).soft}>{st(w.status).name}</Badge>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={Activity} title="Pipeline งานซ่อม" desc="กระจายตามสถานะ 7 ลำดับ" />
            <div className="space-y-2.5">
              {pipeline.map((p) => (
                <button key={p.id} onClick={() => goto("workorder")} className="group w-full text-left">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-slate-600">
                      <span className={cx("h-2 w-2 rounded-full", p.dot)} />{p.id}. {p.name}
                    </span>
                    <span className="font-bold text-slate-700">{p.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={cx("h-full rounded-full transition-all duration-700 group-hover:opacity-80", p.dot)}
                      style={{ width: `${(p.count / maxCount) * 100}%` }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={Building2} title="งานค้างรายอาคาร" desc="อาคารที่มีงานซ่อมค้างมากที่สุด" />
            {byBuilding.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">ไม่มีงานค้าง</p>
            ) : (
              <div className="space-y-2">
                {byBuilding.map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/50">
                    <div className="flex items-center gap-2.5">
                      <span className="rounded-lg bg-white p-1.5 shadow-sm"><Building2 className="h-4 w-4 text-indigo-600" /></span>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{b.name}</p>
                        <p className="text-[11px] text-slate-400">{b.detail}</p>
                      </div>
                    </div>
                    <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">{b.count} งาน</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  INSPECTION                                                          */
/* ==================================================================== */

function ChecklistItemRow({ item, value, onChange, index }) {
  const danger = item.critical && value === "fail";
  return (
    <div className={cx(
      "rounded-2xl border p-4 transition-all duration-300",
      danger ? "border-red-300 bg-red-50/70 shadow-md shadow-red-100"
        : value === "warn" ? "border-amber-200 bg-amber-50/50"
        : value === "pass" ? "border-emerald-200 bg-emerald-50/40"
        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm")}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className={cx("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
            danger ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500")}>{index + 1}</span>
          <div className="min-w-0">
            <p className={cx("text-sm font-medium leading-relaxed", danger ? "text-red-800" : "text-slate-700")}>{item.label}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {item.critical && (
                <Badge className="border-red-200 bg-red-100 text-red-700">
                  <ShieldAlert className="h-3 w-3" /> จุดวิกฤต (Critical)
                </Badge>
              )}
              {danger && <Badge className="border-red-300 bg-red-600 text-white" pulse>ยกระดับเป็น URGENT อัตโนมัติ</Badge>}
            </div>
          </div>
        </div>
        <div className="grid shrink-0 grid-cols-3 gap-2 lg:w-95">
          {RESULT_OPT.map((o) => {
            const Icon = o.icon;
            const on = value === o.key;
            return (
              <button key={o.key} onClick={() => onChange(item.id, on ? null : o.key)}
                className={cx("flex items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-2.5 text-xs font-bold transition-all duration-200 active:scale-95",
                  on ? cx(o.on, "shadow-lg") : cx("bg-white", o.off))}>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InspectionPage({ onSubmit, pushToast }) {
  const [building, setBuilding] = useState("B1");
  const [category, setCategory] = useState("structure");
  const [results, setResults] = useState({});
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState([]);
  const [sending, setSending] = useState(false);

  const items = CHECKLIST[category];
  useEffect(() => { setResults({}); setNote(""); setPhotos([]); }, [category, building]);

  const criticalHits = items.filter((i) => i.critical && results[i.id] === "fail");
  const failCount = Object.values(results).filter((r) => r === "fail").length;
  const warnCount = Object.values(results).filter((r) => r === "warn").length;
  const passCount = Object.values(results).filter((r) => r === "pass").length;
  const answered = passCount + warnCount + failCount;
  const progress = Math.round((answered / items.length) * 100);
  const level = criticalHits.length ? "urgent" : failCount ? "high" : warnCount ? "normal" : null;

  const addPhoto = () => {
    const n = photos.length + 1;
    setPhotos((p) => [...p, { id: Date.now() + n, name: `DMG_${bName(building).replace(" ", "")}_${String(n).padStart(3, "0")}.jpg`, size: (1.2 + Math.random() * 2.6).toFixed(1) }]);
  };

  const submit = () => {
    if (answered === 0) { pushToast({ type: "error", title: "ยังไม่ได้บันทึกผลตรวจ", msg: "กรุณาเลือกสถานะอย่างน้อย 1 รายการก่อนส่งรายงาน" }); return; }
    setSending(true);
    setTimeout(() => {
      onSubmit({ building, category, results, note, photos, items });
      setResults({}); setNote(""); setPhotos([]); setSending(false);
    }, 750);
  };

  const C = cat(category);
  return (
    <div className="space-y-5 animate-fade">
      {/* Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle icon={Building2} title="เลือกพื้นที่และหมวดการตรวจ" desc="ระบุอาคารและหมวดงานที่ต้องการบันทึกผลตรวจ" />
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">อาคาร</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
          {BUILDINGS.map((b) => (
            <button key={b.id} onClick={() => setBuilding(b.id)}
              className={cx("rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-200 active:scale-95",
                building === b.id ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50")}>
              <p className="text-sm font-bold">{b.name}</p>
              <p className={cx("truncate text-[10px]", building === b.id ? "text-indigo-100" : "text-slate-400")}>{b.detail}</p>
            </button>
          ))}
        </div>
        <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-slate-400">หมวดการตรวจ</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const on = category === c.id;
            return (
              <button key={c.id} onClick={() => setCategory(c.id)}
                className={cx("flex items-center gap-3 rounded-xl border-2 px-3 py-3 text-left transition-all duration-200 active:scale-95",
                  on ? cx("border-transparent shadow-lg", c.active) : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50")}>
                <span className={cx("rounded-lg p-2", on ? "bg-white/20" : c.chip)}><Icon className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <p className={cx("truncate text-sm font-bold", on ? "text-white" : "text-slate-700")}>{c.no}. {c.name}</p>
                  <p className={cx("text-[11px]", on ? "text-white/75" : "text-slate-400")}>{CHECKLIST[c.id].length} รายการตรวจ</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Red Alert */}
      {criticalHits.length > 0 && (
        <div className="animate-fade overflow-hidden rounded-2xl border-2 border-red-400 bg-linear-to-r from-red-600 to-red-700 p-5 text-white shadow-2xl shadow-red-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="animate-pulse rounded-xl bg-white/20 p-3"><ShieldAlert className="h-6 w-6" /></span>
              <div>
                <p className="text-lg font-extrabold">🚨 RED ALERT – ตรวจพบจุดวิกฤตด้านความปลอดภัย</p>
                <ul className="mt-1.5 space-y-1 text-sm text-red-50">
                  {criticalHits.map((h) => (
                    <li key={h.id} className="flex items-start gap-1.5"><XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{h.label}</li>
                  ))}
                </ul>
              </div>
            </div>
            <Badge className="self-start border-white/40 bg-white text-red-700 sm:self-center" pulse>ระดับ URGENT เร่งด่วน</Badge>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={cx("rounded-lg p-2", C.chip)}><C.icon className="h-4 w-4" /></span>
            <div>
              <p className="font-bold text-slate-800">{C.no}. {C.name}</p>
              <p className="text-xs text-slate-500">{bFull(building)} · ตรวจแล้ว {answered}/{items.length} รายการ</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-3 w-3" /> ปกติ {passCount}</Badge>
            <Badge className="border-amber-200 bg-amber-50 text-amber-700"><AlertTriangle className="h-3 w-3" /> เฝ้าระวัง {warnCount}</Badge>
            <Badge className="border-red-200 bg-red-50 text-red-700"><XCircle className="h-3 w-3" /> ไม่ผ่าน {failCount}</Badge>
          </div>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={cx("h-full rounded-full transition-all duration-500", criticalHits.length ? "bg-red-500" : failCount ? "bg-amber-500" : "bg-indigo-500")} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {items.map((it, idx) => (
          <ChecklistItemRow key={it.id} item={it} index={idx} value={results[it.id] || null}
            onChange={(id, v) => setResults((p) => { const n = { ...p }; if (v) n[id] = v; else delete n[id]; return n; })} />
        ))}
      </div>

      {/* Note + photo + submit */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={FileText} title="หมายเหตุผู้ตรวจ" desc="ระบุรายละเอียดความเสียหาย ตำแหน่ง หรือข้อเสนอแนะเพิ่มเติม" />
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4}
            placeholder="เช่น พบรอยร้าวกว้าง 3 มม. บริเวณเสา C-4 ชั้น 2 ยาวประมาณ 1.2 เมตร แนะนำให้วิศวกรโครงสร้างเข้าประเมินโดยด่วน..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50" />
          <div className="mt-4">
            <button onClick={addPhoto}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-4 text-sm font-bold text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 active:scale-[0.99]">
              <Camera className="h-5 w-5" /> อัปโหลดรูปถ่ายความเสียหาย
            </button>
            {photos.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {photos.map((p) => (
                  <div key={p.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-linear-to-br from-slate-100 to-slate-200 p-3">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 shrink-0 text-slate-500" />
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-slate-700">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.size} MB</p>
                      </div>
                    </div>
                    <button onClick={() => setPhotos((x) => x.filter((i) => i.id !== p.id))}
                      className="absolute right-1.5 top-1.5 rounded-lg bg-white/90 p-1 text-slate-500 opacity-0 shadow transition group-hover:opacity-100 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={Gauge} title="สรุปผลการประเมิน" />
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="text-slate-500">อาคาร</span><span className="font-semibold text-slate-700">{bName(building)}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-500">หมวด</span><span className="font-semibold text-slate-700">{C.short}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-500">รูปถ่ายแนบ</span><span className="font-semibold text-slate-700">{photos.length} ไฟล์</span></div>
            <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
              <span className="text-slate-500">ระดับความเร่งด่วน</span>
              {level ? <Badge className={PRIORITY[level].badge} pulse={level === "urgent"}>{PRIORITY[level].label}</Badge>
                : <Badge className="border-slate-200 bg-slate-100 text-slate-500">ยังไม่ประเมิน</Badge>}
            </div>
          </div>
          <button onClick={submit} disabled={sending}
            className={cx("mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white shadow-lg transition active:scale-95",
              sending ? "cursor-not-allowed bg-slate-400" : criticalHits.length ? "bg-red-600 shadow-red-200 hover:bg-red-700" : "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700")}>
            {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> กำลังส่งรายงาน...</> : <><Send className="h-4 w-4" /> ส่งรายงานการตรวจ</>}
          </button>
          <p className="mt-2.5 text-center text-[11px] leading-relaxed text-slate-400">
            ระบบจะสร้างใบแจ้งซ่อม (Work Order) อัตโนมัติ<br />สำหรับรายการที่ไม่ผ่านเกณฑ์หรือต้องเฝ้าระวัง
          </p>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  WORK ORDERS                                                         */
/* ==================================================================== */

function WorkOrderCard({ wo, onStatus, onProcure, highlight }) {
  const [open, setOpen] = useState(false);
  const C = cat(wo.category).icon;
  const p = PRIORITY[wo.priority];
  const s = st(wo.status);
  const S = s.icon;
  return (
    <div className={cx("overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-lg",
      highlight ? "border-indigo-400 ring-4 ring-indigo-100" : "border-slate-200")}>
      <div className="flex gap-0">
        <span className={cx("w-1.5 shrink-0", p.bar)} />
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className={cx("mt-0.5 shrink-0 rounded-xl p-2.5", cat(wo.category).chip)}><C className="h-5 w-5" /></span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={p.badge} pulse={wo.priority === "urgent"}>{p.label}</Badge>
                  <span className="font-mono text-[11px] text-slate-400">{wo.id}</span>
                  {wo.eoffice && <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700"><BadgeCheck className="h-3 w-3" /> ส่ง E-OFFICE แล้ว</Badge>}
                </div>
                <p className="mt-1.5 font-bold leading-snug text-slate-800">{wo.title}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{bFull(wo.building)}</span>
                  <span className="flex items-center gap-1"><User className="h-3 w-3" />{wo.reporter}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{thDate(wo.createdAt)}</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-600"><CircleDollarSign className="h-3 w-3" />{fmt(woTotal(wo))} บาท</span>
                </p>
              </div>
            </div>
            <Badge className={cx(s.soft, "self-start px-3 py-1.5")}><S className="h-3.5 w-3.5" /> {s.id}. {s.name}</Badge>
          </div>

          {/* Stepper */}
          <div className="mt-4 -mx-1 overflow-x-auto pb-1">
            <div className="flex min-w-160 items-center gap-1 px-1">
              {STATUS_FLOW.map((step, i) => {
                const done = wo.status >= step.id;
                const cur = wo.status === step.id;
                return (
                  <React.Fragment key={step.id}>
                    <button onClick={() => onStatus(wo.id, step.id)} title={`เปลี่ยนเป็น: ${step.name}`}
                      className="group flex flex-1 flex-col items-center gap-1.5">
                      <span className={cx("flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300 group-hover:scale-110",
                        cur ? cx(step.dot, "text-white ring-4 ring-slate-200 shadow-lg")
                          : done ? cx(step.dot, "text-white opacity-90")
                          : "bg-slate-100 text-slate-400 group-hover:bg-slate-200")}>
                        {done && !cur ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                      </span>
                      <span className={cx("text-center text-[10px] leading-tight transition", cur ? "font-bold text-slate-800" : done ? "text-slate-500" : "text-slate-400")}>
                        {step.name}
                      </span>
                    </button>
                    {i < STATUS_FLOW.length - 1 && (
                      <span className={cx("mb-5 h-0.5 w-4 shrink-0 rounded-full sm:w-6", wo.status > step.id ? "bg-slate-400" : "bg-slate-200")} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dashed border-slate-200 pt-4">
            <button onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95">
              <Eye className="h-3.5 w-3.5" /> {open ? "ซ่อนรายละเอียด" : "ดูรายละเอียด"}
            </button>
            {wo.status < 7 && (
              <button onClick={() => onStatus(wo.id, wo.status + 1)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 active:scale-95">
                <ArrowRight className="h-3.5 w-3.5" /> อัปเดตเป็น "{st(wo.status + 1).name}"
              </button>
            )}
            {wo.status === 3 && (
              <button onClick={() => onProcure(wo.id)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white shadow-md shadow-amber-100 transition hover:bg-amber-600 active:scale-95">
                <ShoppingCart className="h-3.5 w-3.5" /> ออกเอกสารเบิกจ่าย/จัดซื้อ
              </button>
            )}
            {wo.status === 7 && (
              <Badge className="border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> ปิดงานเรียบร้อย</Badge>
            )}
          </div>

          {open && (
            <div className="mt-4 animate-fade space-y-4 rounded-xl bg-slate-50 p-4">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">เหตุผลความจำเป็น</p>
                <p className="text-sm leading-relaxed text-slate-600">{wo.reason}</p>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">รายการวัสดุ/อะไหล่</p>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left font-bold">รายการ</th>
                        <th className="px-3 py-2 text-center font-bold">จำนวน</th>
                        <th className="px-3 py-2 text-right font-bold">ราคา/หน่วย</th>
                        <th className="px-3 py-2 text-right font-bold">รวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {wo.items.map((it, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-slate-700">{it.name}</td>
                          <td className="px-3 py-2 text-center text-slate-600">{it.qty} {it.unit}</td>
                          <td className="px-3 py-2 text-right text-slate-600">{fmt(it.price)}</td>
                          <td className="px-3 py-2 text-right font-semibold text-slate-800">{fmt(it.qty * it.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50">
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-right font-bold text-slate-600">รวมประมาณการ</td>
                        <td className="px-3 py-2 text-right font-extrabold text-indigo-700">{fmt(woTotal(wo))} บาท</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">ประวัติการดำเนินการ</p>
                <div className="space-y-1.5">
                  {wo.log.map((l, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className={cx("h-2 w-2 rounded-full", st(l.s).dot)} />
                      <span className="font-semibold">{st(l.s).name}</span>
                      <span className="text-slate-400">— {thDate(l.at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkOrderPage({ workOrders, setWorkOrders, pushToast, onProcure, selectedWO }) {
  const [filter, setFilter] = useState(0);
  const [prio, setPrio] = useState("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    return workOrders
      .filter((w) => (filter === 0 ? true : w.status === filter))
      .filter((w) => (prio === "all" ? true : w.priority === prio))
      .filter((w) => (q.trim() === "" ? true : (w.title + w.id + bName(w.building) + w.reporter).toLowerCase().includes(q.toLowerCase())))
      .sort((a, b) => PRIORITY[a.priority].rank - PRIORITY[b.priority].rank || a.status - b.status);
  }, [workOrders, filter, prio, q]);

  const changeStatus = (id, next) => {
    if (next < 1 || next > 7) return;
    setWorkOrders((prev) => prev.map((w) => {
      if (w.id !== id) return w;
      const today = new Date().toISOString().slice(0, 10);
      return { ...w, status: next, log: [...w.log.filter((l) => l.s !== next), { s: next, at: today }].sort((a, b) => a.s - b.s) };
    }));
    pushToast({ type: next === 7 ? "success" : "info", title: `อัปเดตสถานะ ${id}`, msg: `เปลี่ยนเป็น "${st(next).id}. ${st(next).name}" เรียบร้อยแล้ว` });
  };

  return (
    <div className="space-y-5 animate-fade">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle icon={Wrench} title="บริหารงานซ่อมบำรุง (Work Orders)" desc="ติดตามและอัปเดตสถานะงานตาม Pipeline 7 ลำดับ"
          right={<Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">ทั้งหมด {workOrders.length} รายการ</Badge>} />
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาเลขที่ใบแจ้งซ่อม / รายการ / อาคาร / ผู้แจ้ง..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50" />
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">กรองตามสถานะ</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter(0)}
            className={cx("rounded-xl border-2 px-3 py-2 text-xs font-bold transition active:scale-95",
              filter === 0 ? "border-slate-800 bg-slate-800 text-white shadow-md" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>
            ทั้งหมด ({workOrders.length})
          </button>
          {STATUS_FLOW.map((s) => {
            const c = workOrders.filter((w) => w.status === s.id).length;
            const on = filter === s.id;
            return (
              <button key={s.id} onClick={() => setFilter(on ? 0 : s.id)}
                className={cx("flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-xs font-bold transition active:scale-95",
                  on ? "border-slate-800 bg-slate-800 text-white shadow-md" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>
                <span className={cx("h-2 w-2 rounded-full", s.dot)} />{s.id}. {s.name} ({c})
              </button>
            );
          })}
        </div>
        <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">กรองตามความเร่งด่วน</p>
        <div className="flex flex-wrap gap-2">
          {[{ k: "all", l: "ทุกระดับ" }, { k: "urgent", l: "เร่งด่วน" }, { k: "high", l: "สำคัญ" }, { k: "normal", l: "ทั่วไป" }].map((o) => (
            <button key={o.k} onClick={() => setPrio(o.k)}
              className={cx("rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition active:scale-95",
                prio === o.k ? "border-indigo-600 bg-indigo-600 text-white shadow-md" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>
              {o.l}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Search} title="ไม่พบใบแจ้งซ่อมตามเงื่อนไข" desc="ลองปรับตัวกรองสถานะ ความเร่งด่วน หรือคำค้นหาใหม่อีกครั้ง" />
      ) : (
        <div className="space-y-4">
          {list.map((w) => (
            <WorkOrderCard key={w.id} wo={w} onStatus={changeStatus} onProcure={onProcure} highlight={selectedWO === w.id} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================================================================== */
/*  E-PROCUREMENT                                                       */
/* ==================================================================== */

function ProcurementPage({ workOrders, setWorkOrders, pushToast, procureWO, setProcureWO }) {
  const eligible = workOrders.filter((w) => w.status >= 1 && w.status <= 6);
  const fallback = eligible.find((w) => w.status === 3) || eligible[0] || workOrders[0];
  const woId = procureWO && workOrders.some((w) => w.id === procureWO) ? procureWO : fallback?.id;
  const wo = workOrders.find((w) => w.id === woId);

  const [tab, setTab] = useState("001");
  const [requester, setRequester] = useState("");
  const [dept, setDept] = useState("ฝ่ายอาคารสถานที่และความปลอดภัย");
  const [reason, setReason] = useState("");
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!wo) return;
    setRequester(wo.reporter);
    setReason(wo.reason);
    const d = new Date(); d.setDate(d.getDate() + (wo.priority === "urgent" ? 7 : 21));
    setDue(d.toISOString().slice(0, 10));
  }, [woId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!wo) return <EmptyState icon={FileText} title="ยังไม่มีใบแจ้งซ่อมสำหรับออกเอกสาร" desc="กรุณาสร้างใบแจ้งซ่อมจากหน้า Inspection Checklist ก่อน" />;

  const total = woTotal(wo);
  const vat = Math.round(total * 0.07);
  const docNo = (t) => `งพ.${t}/2569/${wo.id.slice(-3)}`;
  const quotes = VENDORS.map((v) => ({
    ...v, items: wo.items.map((it) => ({ ...it, price: Math.round(it.price * v.factor) })),
    sum: wo.items.reduce((s, it) => s + Math.round(it.price * v.factor) * it.qty, 0),
  }));
  const best = quotes.reduce((a, b) => (b.sum < a.sum ? b : a), quotes[0]);

  const doPrint = () => {
    setBusy(true);
    setTimeout(() => { setBusy(false); window.print(); pushToast({ type: "info", title: `เตรียมพิมพ์ ${docNo(tab)}`, msg: "เลือก Save as PDF ในหน้าต่างพิมพ์เพื่อ Export ไฟล์เอกสาร" }); }, 600);
  };
  const sendEOffice = () => {
    setBusy(true);
    setTimeout(() => {
      setWorkOrders((prev) => prev.map((w) => (w.id === wo.id ? { ...w, eoffice: true } : w)));
      setBusy(false);
      pushToast({ type: "success", title: "ส่งขออนุมัติไปยัง E-OFFICE สำเร็จ", msg: `เอกสาร ${docNo(tab)} ถูกส่งเข้าสารบรรณอิเล็กทรอนิกส์เรียบร้อยแล้ว` });
    }, 900);
  };

  const Field = ({ label, value, onChange, type = "text" }) => (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-500">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50" />
    </label>
  );

  const SignBox = ({ role, name }) => (
    <div className="text-center text-[11px] leading-relaxed text-slate-600">
      <div className="mx-auto mb-1 h-10 border-b border-dotted border-slate-400" />
      <p>({name})</p>
      <p className="font-semibold">{role}</p>
      <p className="text-slate-400">วันที่ ......../......../..........</p>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade">
      {/* Control bar */}
      <div className="no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle icon={FileText} title="ระบบเอกสารจัดซื้อจัดจ้างอัตโนมัติ" desc="ดึงข้อมูลจากใบแจ้งซ่อมมาเติมในแบบฟอร์มราชการโดยอัตโนมัติ" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <label className="block lg:col-span-2">
            <span className="mb-1 block text-xs font-bold text-slate-500">เลือกใบแจ้งซ่อม (Work Order)</span>
            <select value={woId} onChange={(e) => setProcureWO(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50">
              {workOrders.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.id} · {bName(w.building)} · {w.title} ({fmt(woTotal(w))} บาท)
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <div className="flex w-full rounded-xl bg-slate-100 p-1">
              {[{ k: "001", l: "แบบ งพ.001" }, { k: "003", l: "แบบ งพ.003" }].map((t) => (
                <button key={t.k} onClick={() => setTab(t.k)}
                  className={cx("flex-1 rounded-lg px-3 py-2 text-sm font-bold transition active:scale-95",
                    tab === t.k ? "bg-white text-indigo-700 shadow" : "text-slate-500 hover:text-slate-700")}>
                  {t.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="ผู้ขออนุมัติ" value={requester} onChange={setRequester} />
          <Field label="ฝ่าย/แผนก" value={dept} onChange={setDept} />
          <Field label="กำหนดแล้วเสร็จ" value={due} onChange={setDue} type="date" />
          <div className="flex items-end">
            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-bold text-slate-500">วงเงินประมาณการ</p>
              <p className="text-lg font-extrabold text-indigo-700">{fmt(total)} <span className="text-xs font-medium text-slate-400">บาท</span></p>
            </div>
          </div>
        </div>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-bold text-slate-500">เหตุผลความจำเป็น</span>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50" />
        </label>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-dashed border-slate-200 pt-4">
          <button onClick={doPrint} disabled={busy}
            className={cx("flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition active:scale-95",
              busy ? "bg-slate-400" : "bg-slate-800 shadow-slate-200 hover:bg-slate-900")}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />} พิมพ์เอกสาร / Export PDF
          </button>
          <button onClick={sendEOffice} disabled={busy}
            className={cx("flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition active:scale-95",
              busy ? "bg-slate-400" : "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700")}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} ส่งขออนุมัติไปยัง E-OFFICE
          </button>
          {wo.eoffice && <Badge className="self-center border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700"><BadgeCheck className="h-4 w-4" /> เอกสารนี้ส่ง E-OFFICE แล้ว</Badge>}
        </div>
      </div>

      {/* PAPER */}
      <div id="print-area" className="mx-auto w-full max-w-4xl overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-10">
        <div className="min-w-160">
          <div className="mb-6 border-b-2 border-slate-800 pb-4 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Building2 className="h-6 w-6 text-slate-700" />
              <p className="text-sm font-bold text-slate-600">ฝ่ายอาคารสถานที่และความปลอดภัย</p>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {tab === "001" ? "แบบ งพ.001 — ใบขออนุมัติจัดซื้อ/จัดจ้าง/ซ่อมแซม" : "แบบ งพ.003 — ใบสืบราคา (เปรียบเทียบ 3 ร้านค้า)"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">เลขที่เอกสาร {docNo(tab)} · วันที่ {thDate(new Date())}</p>
          </div>

          {tab === "001" ? (
            <div className="space-y-5 text-sm text-slate-700">
              <table className="w-full border border-slate-300 text-xs">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <td className="w-40 border-r border-slate-300 bg-slate-50 px-3 py-2 font-bold">อ้างอิงใบแจ้งซ่อม</td>
                    <td className="border-r border-slate-300 px-3 py-2 font-mono">{wo.id}</td>
                    <td className="w-32 border-r border-slate-300 bg-slate-50 px-3 py-2 font-bold">ระดับความเร่งด่วน</td>
                    <td className="px-3 py-2 font-bold">{PRIORITY[wo.priority].label}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="border-r border-slate-300 bg-slate-50 px-3 py-2 font-bold">สถานที่ปฏิบัติงาน</td>
                    <td className="border-r border-slate-300 px-3 py-2">{bFull(wo.building)}</td>
                    <td className="border-r border-slate-300 bg-slate-50 px-3 py-2 font-bold">หมวดงาน</td>
                    <td className="px-3 py-2">{cat(wo.category).name}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="border-r border-slate-300 bg-slate-50 px-3 py-2 font-bold">ผู้ขออนุมัติ</td>
                    <td className="border-r border-slate-300 px-3 py-2">{requester}</td>
                    <td className="border-r border-slate-300 bg-slate-50 px-3 py-2 font-bold">ฝ่าย/แผนก</td>
                    <td className="px-3 py-2">{dept}</td>
                  </tr>
                  <tr>
                    <td className="border-r border-slate-300 bg-slate-50 px-3 py-2 font-bold">กำหนดแล้วเสร็จ</td>
                    <td className="border-r border-slate-300 px-3 py-2">{thDate(due)}</td>
                    <td className="border-r border-slate-300 bg-slate-50 px-3 py-2 font-bold">วิธีจัดหา</td>
                    <td className="px-3 py-2">{total > 100000 ? "วิธีเฉพาะเจาะจง (สืบราคา 3 ราย)" : "วิธีเฉพาะเจาะจง"}</td>
                  </tr>
                </tbody>
              </table>

              <div>
                <p className="mb-1.5 font-bold text-slate-800">1. เหตุผลและความจำเป็น</p>
                <p className="rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs leading-relaxed">{reason}</p>
              </div>

              <div>
                <p className="mb-1.5 font-bold text-slate-800">2. รายการที่ขออนุมัติ</p>
                <table className="w-full border border-slate-300 text-xs">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="w-12 border border-slate-300 px-2 py-2">ลำดับ</th>
                      <th className="border border-slate-300 px-2 py-2 text-left">รายการวัสดุ/อะไหล่/งานจ้าง</th>
                      <th className="w-24 border border-slate-300 px-2 py-2">จำนวน</th>
                      <th className="w-28 border border-slate-300 px-2 py-2 text-right">ราคา/หน่วย</th>
                      <th className="w-28 border border-slate-300 px-2 py-2 text-right">จำนวนเงิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wo.items.map((it, i) => (
                      <tr key={i}>
                        <td className="border border-slate-300 px-2 py-2 text-center">{i + 1}</td>
                        <td className="border border-slate-300 px-2 py-2">{it.name}</td>
                        <td className="border border-slate-300 px-2 py-2 text-center">{it.qty} {it.unit}</td>
                        <td className="border border-slate-300 px-2 py-2 text-right">{fmt(it.price)}</td>
                        <td className="border border-slate-300 px-2 py-2 text-right font-semibold">{fmt(it.qty * it.price)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4} className="border border-slate-300 bg-slate-50 px-2 py-2 text-right font-bold">รวมเป็นเงิน</td>
                      <td className="border border-slate-300 px-2 py-2 text-right font-bold">{fmt(total)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="border border-slate-300 bg-slate-50 px-2 py-2 text-right font-bold">ภาษีมูลค่าเพิ่ม 7%</td>
                      <td className="border border-slate-300 px-2 py-2 text-right">{fmt(vat)}</td>
                    </tr>
                    <tr className="bg-slate-100">
                      <td colSpan={4} className="border border-slate-300 px-2 py-2 text-right font-extrabold">รวมทั้งสิ้น (บาท)</td>
                      <td className="border border-slate-300 px-2 py-2 text-right font-extrabold">{fmt(total + vat)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                <div className="rounded-lg border border-slate-300 p-3">
                  <p className="font-bold text-slate-600">แหล่งงบประมาณ</p>
                  <p className="mt-1">งบดำเนินงาน – ค่าซ่อมแซมบำรุงรักษา ปีงบประมาณ 2569</p>
                </div>
                <div className="rounded-lg border border-slate-300 p-3">
                  <p className="font-bold text-slate-600">วงเงินคงเหลือหลังอนุมัติ</p>
                  <p className="mt-1 font-semibold">{fmt(BUDGET_TOTAL - total - vat)} บาท</p>
                </div>
                <div className="rounded-lg border border-slate-300 p-3">
                  <p className="font-bold text-slate-600">สถานะ E-OFFICE</p>
                  <p className="mt-1 font-semibold">{wo.eoffice ? "ส่งขออนุมัติแล้ว" : "ยังไม่ส่งขออนุมัติ"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-3">
                <SignBox role="ผู้ขออนุมัติ" name={requester} />
                <SignBox role="หัวหน้าฝ่ายอาคารสถานที่" name="นายประเสริฐ มั่นคงชัย" />
                <SignBox role="ผู้มีอำนาจอนุมัติ" name="นางสุภาพร บริหารกิจ" />
              </div>
            </div>
          ) : (
            <div className="space-y-5 text-sm text-slate-700">
              <table className="w-full border border-slate-300 text-xs">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <td className="w-40 border-r border-slate-300 bg-slate-50 px-3 py-2 font-bold">อ้างถึงเอกสาร</td>
                    <td className="border-r border-slate-300 px-3 py-2 font-mono">{docNo("001")} ({wo.id})</td>
                    <td className="w-28 border-r border-slate-300 bg-slate-50 px-3 py-2 font-bold">สถานที่</td>
                    <td className="px-3 py-2">{bFull(wo.building)}</td>
                  </tr>
                  <tr>
                    <td className="border-r border-slate-300 bg-slate-50 px-3 py-2 font-bold">งานที่สืบราคา</td>
                    <td colSpan={3} className="px-3 py-2">{wo.title}</td>
                  </tr>
                </tbody>
              </table>

              <div>
                <p className="mb-1.5 font-bold text-slate-800">ตารางเปรียบเทียบราคา 3 ร้านค้า</p>
                <table className="w-full border border-slate-300 text-xs">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="w-10 border border-slate-300 px-2 py-2">ที่</th>
                      <th className="border border-slate-300 px-2 py-2 text-left">รายการ</th>
                      <th className="w-20 border border-slate-300 px-2 py-2">จำนวน</th>
                      {quotes.map((v, i) => (
                        <th key={i} className={cx("w-28 border border-slate-300 px-2 py-2 text-right", v.name === best.name && "bg-emerald-50")}>
                          ร้านที่ {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {wo.items.map((it, r) => (
                      <tr key={r}>
                        <td className="border border-slate-300 px-2 py-2 text-center">{r + 1}</td>
                        <td className="border border-slate-300 px-2 py-2">{it.name}</td>
                        <td className="border border-slate-300 px-2 py-2 text-center">{it.qty} {it.unit}</td>
                        {quotes.map((v, i) => (
                          <td key={i} className={cx("border border-slate-300 px-2 py-2 text-right", v.name === best.name && "bg-emerald-50")}>
                            {fmt(v.items[r].price * it.qty)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="bg-slate-50">
                      <td colSpan={3} className="border border-slate-300 px-2 py-2 text-right font-bold">รวมเป็นเงิน (ไม่รวม VAT)</td>
                      {quotes.map((v, i) => (
                        <td key={i} className={cx("border border-slate-300 px-2 py-2 text-right font-extrabold",
                          v.name === best.name ? "bg-emerald-100 text-emerald-700" : "text-slate-700")}>
                          {fmt(v.sum)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {quotes.map((v, i) => (
                  <div key={i} className={cx("rounded-lg border p-3 text-xs",
                    v.name === best.name ? "border-emerald-400 bg-emerald-50" : "border-slate-300 bg-white")}>
                    <div className="mb-1.5 flex items-center gap-2">
                      <Store className={cx("h-4 w-4", v.name === best.name ? "text-emerald-600" : "text-slate-400")} />
                      <p className="font-bold text-slate-700">ร้านที่ {i + 1}</p>
                      {v.name === best.name && <Badge className="border-emerald-300 bg-emerald-600 text-white">ราคาต่ำสุด</Badge>}
                    </div>
                    <p className="font-semibold text-slate-800">{v.name}</p>
                    <p className="text-slate-500">เลขผู้เสียภาษี {v.tax}</p>
                    <p className="text-slate-500">โทร. {v.tel}</p>
                    <p className="mt-1.5 font-extrabold text-slate-800">{fmt(v.sum)} บาท</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border-2 border-emerald-400 bg-emerald-50 p-4 text-xs">
                <p className="flex items-center gap-2 font-bold text-emerald-800">
                  <FileCheck2 className="h-4 w-4" /> ผลการพิจารณาคัดเลือก
                </p>
                <p className="mt-1.5 leading-relaxed text-emerald-900">
                  เห็นควรคัดเลือก <span className="font-bold">{best.name}</span> เป็นผู้รับจ้าง/ผู้ขาย
                  ในวงเงิน <span className="font-bold">{fmt(best.sum)} บาท</span> (รวม VAT 7% เป็นเงิน {fmt(best.sum + Math.round(best.sum * 0.07))} บาท)
                  เนื่องจากเสนอราคาต่ำสุด มีคุณสมบัติถูกต้องครบถ้วน และสามารถส่งมอบได้ภายในกำหนด {thDate(due)}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-3">
                <SignBox role="เจ้าหน้าที่พัสดุ (ผู้สืบราคา)" name={requester} />
                <SignBox role="หัวหน้าเจ้าหน้าที่พัสดุ" name="นายประเสริฐ มั่นคงชัย" />
                <SignBox role="ผู้อนุมัติ" name="นางสุภาพร บริหารกิจ" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  ROOT                                                                */
/* ==================================================================== */

export default function FacilitySafetyApp() {
  const [page, setPage] = useState("dashboard");
  const [workOrders, setWorkOrders] = useState(INITIAL_WO);
  const [inspections, setInspections] = useState([]);
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedWO, setSelectedWO] = useState(null);
  const [procureWO, setProcureWO] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  const pushToast = (t) => setToast({ ...t, key: Date.now() });
  const goto = (p) => { setPage(p); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleInspectionSubmit = ({ building, category, results, note, photos, items }) => {
    const nextNo = String(workOrders.length + 1).padStart(3, "0");
    const failed = items.filter((i) => results[i.id] === "fail");
    const warned = items.filter((i) => results[i.id] === "warn");
    const criticals = failed.filter((i) => i.critical);
    const today = new Date().toISOString().slice(0, 10);

    setInspections((prev) => [
      ...prev,
      { id: `INS-${Date.now()}`, building, category, results, note, photos: photos.length, date: today },
    ]);

    if (failed.length === 0 && warned.length === 0) {
      pushToast({ type: "success", title: "บันทึกผลการตรวจเรียบร้อย", msg: `${bName(building)} · ${cat(category).short} — ทุกจุดผ่านเกณฑ์ ไม่มีการสร้างใบแจ้งซ่อม` });
      return;
    }

    const target = [...failed, ...warned];
    const priority = criticals.length ? "urgent" : failed.length ? "high" : "normal";
    const headline = criticals[0] || failed[0] || warned[0];
    const newWO = {
      id: `WO-2569-${nextNo}`,
      title: headline.label.replace(/^\d+\.\s*/, ""),
      building, category, priority, status: 1,
      reporter: "นายสมชาย ตรวจดี (เจ้าหน้าที่ตรวจอาคาร)",
      createdAt: today,
      eoffice: false,
      reason: note.trim()
        ? note.trim()
        : `จากการตรวจสอบ${cat(category).name} ณ ${bFull(building)} พบข้อบกพร่องจำนวน ${target.length} รายการ ${criticals.length ? "โดยมีจุดวิกฤตด้านความปลอดภัยที่ต้องแก้ไขโดยเร่งด่วน" : "ซึ่งต้องดำเนินการซ่อมแซมเพื่อให้กลับมาใช้งานได้ตามมาตรฐาน"}`,
      items: target.map((i) => ({ ...i.part })),
      log: [{ s: 1, at: today }],
    };
    setWorkOrders((prev) => [newWO, ...prev]);
    setSelectedWO(newWO.id);
    pushToast({
      type: criticals.length ? "error" : "success",
      title: criticals.length ? `🚨 สร้างใบแจ้งซ่อมเร่งด่วน ${newWO.id}` : `สร้างใบแจ้งซ่อม ${newWO.id} สำเร็จ`,
      msg: `${bName(building)} · ${target.length} รายการ · วงเงินประมาณ ${fmt(woTotal(newWO))} บาท`,
    });
  };

  const openProcurement = (id) => {
    setProcureWO(id);
    goto("procurement");
    pushToast({ type: "info", title: "เตรียมเอกสารจัดซื้อแล้ว", msg: `ดึงข้อมูลจาก ${id} เข้าแบบฟอร์ม งพ.001 อัตโนมัติ` });
  };

  const urgentCount = workOrders.filter((w) => w.priority === "urgent" && w.status < 7).length;
  const openCount = workOrders.filter((w) => w.status < 7).length;
  const current = NAV.find((n) => n.id === page);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform: translateY(10px);} to { opacity:1; transform:none; } }
        .animate-fade { animation: fadeIn .35s cubic-bezier(.2,.7,.3,1) both; }
        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area { position: absolute; inset: 0; width: 100%; border: none !important; box-shadow: none !important; padding: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Sidebar (desktop) */}
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-5">
          <span className="rounded-xl bg-linear-to-br from-indigo-600 to-indigo-800 p-2.5 shadow-lg shadow-indigo-200">
            <ShieldAlert className="h-5 w-5 text-white" />
          </span>
          <div>
            <p className="text-sm font-extrabold leading-tight text-slate-800">Facility & Safety</p>
            <p className="text-[11px] text-slate-400">ระบบตรวจเช็คอาคาร v2.6</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1.5 p-3">
          {NAV.map((n) => {
            const Icon = n.icon;
            const on = page === n.id;
            return (
              <button key={n.id} onClick={() => goto(n.id)}
                className={cx("group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200",
                  on ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-600 hover:bg-slate-100")}>
                <Icon className={cx("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", on ? "text-white" : "text-slate-400")} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{n.name}</p>
                  <p className={cx("truncate text-[11px]", on ? "text-indigo-100" : "text-slate-400")}>{n.desc}</p>
                </div>
                {n.id === "workorder" && openCount > 0 && (
                  <span className={cx("rounded-full px-1.5 py-0.5 text-[10px] font-bold", on ? "bg-white text-indigo-700" : "bg-slate-200 text-slate-600")}>{openCount}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="m-3 rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 p-4 text-white">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <p className="text-xs font-bold">แจ้งเตือนเร่งด่วน</p>
          </div>
          <p className="mt-1 text-2xl font-extrabold">{urgentCount} <span className="text-xs font-medium text-slate-300">รายการ</span></p>
          <button onClick={() => goto("workorder")} className="mt-2.5 w-full rounded-lg bg-white/15 py-1.5 text-[11px] font-bold backdrop-blur transition hover:bg-white/25">
            ตรวจสอบทันที
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 animate-fade bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-indigo-600 p-2"><ShieldAlert className="h-4 w-4 text-white" /></span>
                <p className="text-sm font-extrabold">Facility & Safety</p>
              </div>
              <button onClick={() => setMenuOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-1.5">
              {NAV.map((n) => {
                const Icon = n.icon;
                const on = page === n.id;
                return (
                  <button key={n.id} onClick={() => goto(n.id)}
                    className={cx("flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition",
                      on ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
                    <Icon className="h-5 w-5 shrink-0" />
                    <div><p className="text-sm font-bold">{n.name}</p><p className={cx("text-[11px]", on ? "text-indigo-100" : "text-slate-400")}>{n.desc}</p></div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => setMenuOpen(true)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-base font-extrabold text-slate-800 sm:text-lg">{current?.name}</h1>
                <p className="truncate text-[11px] text-slate-400 sm:text-xs">{current?.desc} · {todayTH()}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => goto("workorder")} className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100">
                <Bell className="h-4.5 w-4.5" />
                {urgentCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {urgentCount}
                  </span>
                )}
              </button>
              <div className="hidden items-center gap-2.5 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-3 sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-indigo-700 text-xs font-bold text-white">สช</span>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-slate-700">สมชาย ตรวจดี</p>
                  <p className="text-[10px] text-slate-400">เจ้าหน้าที่ตรวจอาคาร</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 pb-28 pt-5 sm:px-6 lg:pb-10">
          {page === "dashboard" && <DashboardPage workOrders={workOrders} inspections={inspections} goto={goto} setSelectedWO={setSelectedWO} />}
          {page === "inspection" && <InspectionPage onSubmit={handleInspectionSubmit} pushToast={pushToast} />}
          {page === "workorder" && <WorkOrderPage workOrders={workOrders} setWorkOrders={setWorkOrders} pushToast={pushToast} onProcure={openProcurement} selectedWO={selectedWO} />}
          {page === "procurement" && <ProcurementPage workOrders={workOrders} setWorkOrders={setWorkOrders} pushToast={pushToast} procureWO={procureWO} setProcureWO={setProcureWO} />}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden">
        <div className="grid grid-cols-4">
          {NAV.map((n) => {
            const Icon = n.icon;
            const on = page === n.id;
            return (
              <button key={n.id} onClick={() => goto(n.id)} className="relative flex flex-col items-center gap-1 py-2.5 transition active:scale-95">
                {on && <span className="absolute inset-x-5 top-0 h-1 rounded-b-full bg-indigo-600" />}
                <Icon className={cx("h-5 w-5 transition", on ? "text-indigo-600" : "text-slate-400")} />
                <span className={cx("text-[10px] font-bold", on ? "text-indigo-600" : "text-slate-400")}>
                  {n.id === "dashboard" ? "ภาพรวม" : n.id === "inspection" ? "ตรวจเช็ค" : n.id === "workorder" ? "งานซ่อม" : "เอกสาร"}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}