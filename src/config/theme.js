// ============================================================
// theme.js — อัปเดต Theme ตามอัตลักษณ์ มหิดล ลำปาง (MULA)
// Royal Blue (#002D62) + Bright Gold (#F2A900) + Smart Farm Emerald (#16A34A)
// ============================================================
import {
  Zap, Flame, Building2, Droplets, Snowflake, ArrowUpDown,
  Wrench, ShieldCheck, Wind, Lightbulb, Cctv, DoorOpen,
  Gauge, Hammer, Package, AlertTriangle, Sprout, Tractor,
  Users, CheckCircle2, ShieldAlert
} from "lucide-react";

export const BRAND = {
  name: "มหาวิทยาลัยมหิดล วิทยาเขตลำปาง",
  subName: "Mahidol University Lampang Campus",
  primary: "#002D62",   // Deep Royal Blue
  secondary: "#F2A900", // Bright Gold / Yellow
  accentGreen: "#16A34A", // Smart Farm Emerald
};

/** ชุดสี preset สอดคล้องกับแบรนด์ */
export const COLOR_PRESET = {
  mahidol: {
    key: "mahidol", label: "น้ำเงินมหิดล",
    solid: "bg-[#002D62]", solidHover: "hover:bg-[#001f44]",
    soft: "bg-[#002D62]/10", softText: "text-[#002D62]",
    ring: "ring-[#002D62]/20", border: "border-[#002D62]/20",
    text: "text-[#002D62]", dot: "bg-[#002D62]",
    gradient: "from-[#002D62] to-[#001733]",
  },
  gold: {
    key: "gold", label: "ทองอร่าม",
    solid: "bg-[#F2A900]", solidHover: "hover:bg-[#d99700]",
    soft: "bg-[#F2A900]/15", softText: "text-[#b37d00]",
    ring: "ring-[#F2A900]/30", border: "border-[#F2A900]/30",
    text: "text-[#b37d00]", dot: "bg-[#F2A900]",
    gradient: "from-[#F2A900] to-[#d99700]",
  },
  farm: {
    key: "farm", label: "เขียวเกษตรอัจฉริยะ",
    solid: "bg-[#16A34A]", solidHover: "hover:bg-[#15803d]",
    soft: "bg-[#16A34A]/10", softText: "text-[#16A34A]",
    ring: "ring-[#16A34A]/20", border: "border-[#16A34A]/20",
    text: "text-[#16A34A]", dot: "bg-[#16A34A]",
    gradient: "from-[#16A34A] to-[#15803d]",
  },
  red: {
    key: "red", label: "แดงเตือนภัย",
    solid: "bg-red-600", solidHover: "hover:bg-red-700",
    soft: "bg-red-50", softText: "text-red-700",
    ring: "ring-red-200", border: "border-red-200",
    text: "text-red-600", dot: "bg-red-600",
    gradient: "from-red-500 to-red-700",
  },
  amber: {
    key: "amber", label: "เหลืองเฝ้าระวัง",
    solid: "bg-amber-500", solidHover: "hover:bg-amber-600",
    soft: "bg-amber-50", softText: "text-amber-700",
    ring: "ring-amber-200", border: "border-amber-200",
    text: "text-amber-600", dot: "bg-amber-500",
    gradient: "from-amber-400 to-amber-600",
  },
  slate: {
    key: "slate", label: "เทามาตรฐาน",
    solid: "bg-slate-700", solidHover: "hover:bg-slate-800",
    soft: "bg-slate-100", softText: "text-slate-700",
    ring: "ring-slate-200", border: "border-slate-200",
    text: "text-slate-600", dot: "bg-slate-500",
    gradient: "from-slate-600 to-slate-800",
  },
};

export const COLOR_OPTIONS = Object.values(COLOR_PRESET);
export const DEFAULT_COLOR = "mahidol";

export function getColor(key) {
  return COLOR_PRESET[key] || COLOR_PRESET[DEFAULT_COLOR];
}

export const ICON_MAP = {
  Zap, Flame, Building2, Droplets, Snowflake, ArrowUpDown,
  Wrench, ShieldCheck, Wind, Lightbulb, Cctv, DoorOpen,
  Gauge, Hammer, Package, AlertTriangle, Sprout, Tractor,
  Users, CheckCircle2, ShieldAlert
};

export const ICON_OPTIONS = Object.keys(ICON_MAP);
export const DEFAULT_ICON = "Building2";

export function getIcon(name) {
  return ICON_MAP[name] || ICON_MAP[DEFAULT_ICON];
}