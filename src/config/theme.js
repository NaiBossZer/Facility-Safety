// ============================================================
// theme.js — ชุดสีและไอคอนกลาง (Design Token)
// ห้ามสร้าง class แบบ `bg-${color}-500` เด็ดขาด ให้ดึงจากที่นี่เท่านั้น
// ============================================================
import {
  Zap, Flame, Building2, Droplets, Snowflake, ArrowUpDown,
  Wrench, ShieldCheck, Wind, Lightbulb, Cctv, DoorOpen,
  Gauge, Hammer, Package, AlertTriangle,
} from "lucide-react";

/** ชุดสี preset — เพิ่มสีใหม่ต้องเขียน class เต็มทุกบรรทัด */
export const COLOR_PRESET = {
  amber: {
    key: "amber", label: "เหลืองอำพัน",
    solid: "bg-amber-500", solidHover: "hover:bg-amber-600",
    soft: "bg-amber-50", softText: "text-amber-700",
    ring: "ring-amber-200", border: "border-amber-200",
    text: "text-amber-600", dot: "bg-amber-500",
    gradient: "from-amber-400 to-amber-600",
  },
  red: {
    key: "red", label: "แดง",
    solid: "bg-red-500", solidHover: "hover:bg-red-600",
    soft: "bg-red-50", softText: "text-red-700",
    ring: "ring-red-200", border: "border-red-200",
    text: "text-red-600", dot: "bg-red-500",
    gradient: "from-red-400 to-red-600",
  },
  blue: {
    key: "blue", label: "น้ำเงิน",
    solid: "bg-blue-500", solidHover: "hover:bg-blue-600",
    soft: "bg-blue-50", softText: "text-blue-700",
    ring: "ring-blue-200", border: "border-blue-200",
    text: "text-blue-600", dot: "bg-blue-500",
    gradient: "from-blue-400 to-blue-600",
  },
  cyan: {
    key: "cyan", label: "ฟ้าน้ำทะเล",
    solid: "bg-cyan-500", solidHover: "hover:bg-cyan-600",
    soft: "bg-cyan-50", softText: "text-cyan-700",
    ring: "ring-cyan-200", border: "border-cyan-200",
    text: "text-cyan-600", dot: "bg-cyan-500",
    gradient: "from-cyan-400 to-cyan-600",
  },
  sky: {
    key: "sky", label: "ฟ้า",
    solid: "bg-sky-500", solidHover: "hover:bg-sky-600",
    soft: "bg-sky-50", softText: "text-sky-700",
    ring: "ring-sky-200", border: "border-sky-200",
    text: "text-sky-600", dot: "bg-sky-500",
    gradient: "from-sky-400 to-sky-600",
  },
  violet: {
    key: "violet", label: "ม่วง",
    solid: "bg-violet-500", solidHover: "hover:bg-violet-600",
    soft: "bg-violet-50", softText: "text-violet-700",
    ring: "ring-violet-200", border: "border-violet-200",
    text: "text-violet-600", dot: "bg-violet-500",
    gradient: "from-violet-400 to-violet-600",
  },
  emerald: {
    key: "emerald", label: "เขียวมรกต",
    solid: "bg-emerald-500", solidHover: "hover:bg-emerald-600",
    soft: "bg-emerald-50", softText: "text-emerald-700",
    ring: "ring-emerald-200", border: "border-emerald-200",
    text: "text-emerald-600", dot: "bg-emerald-500",
    gradient: "from-emerald-400 to-emerald-600",
  },
  rose: {
    key: "rose", label: "ชมพูกุหลาบ",
    solid: "bg-rose-500", solidHover: "hover:bg-rose-600",
    soft: "bg-rose-50", softText: "text-rose-700",
    ring: "ring-rose-200", border: "border-rose-200",
    text: "text-rose-600", dot: "bg-rose-500",
    gradient: "from-rose-400 to-rose-600",
  },
  slate: {
    key: "slate", label: "เทา",
    solid: "bg-slate-500", solidHover: "hover:bg-slate-600",
    soft: "bg-slate-100", softText: "text-slate-700",
    ring: "ring-slate-200", border: "border-slate-200",
    text: "text-slate-600", dot: "bg-slate-500",
    gradient: "from-slate-400 to-slate-600",
  },
};

export const COLOR_OPTIONS = Object.values(COLOR_PRESET);
export const DEFAULT_COLOR = "slate";

/** ดึงชุดสีแบบปลอดภัย — ถ้าไม่มีจะคืนสีเทาแทน */
export function getColor(key) {
  return COLOR_PRESET[key] || COLOR_PRESET[DEFAULT_COLOR];
}

/** แผนที่ไอคอน — เก็บ "ชื่อ" ใน data แล้ว map เป็น component ที่นี่ */
export const ICON_MAP = {
  Zap, Flame, Building2, Droplets, Snowflake, ArrowUpDown,
  Wrench, ShieldCheck, Wind, Lightbulb, Cctv, DoorOpen,
  Gauge, Hammer, Package, AlertTriangle,
};

export const ICON_OPTIONS = Object.keys(ICON_MAP);
export const DEFAULT_ICON = "Wrench";

/** ดึง Icon component แบบปลอดภัย */
export function getIcon(name) {
  return ICON_MAP[name] || ICON_MAP[DEFAULT_ICON];
}