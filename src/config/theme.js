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
  name: "งานพันธกิจเพื่อสังคม",
  faculty: "คณะสิ่งแวดล้อมและทรัพยากรศาสตร์",
  university: "มหาวิทยาลัยมหิดล (วิทยาเขตลำปาง)",
  fullName: "งานพันธกิจเพื่อสังคม คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ มหาวิทยาลัยมหิดล",
  primary: "#123B63",     // Brand Navy (Header, Heading, Nav)
  darkNavy: "#0e2b42",    // Topbar Dark Navy
  secondary: "#D6A84F",   // Northern Gold (Highlight, Badge, Accent)
  accentBlue: "#1677A8",  // Brand Blue (Buttons, Focus, Link)
  terracotta: "#C66B4F",  // Local Terracotta (Community accent)
  leafGreen: "#5F8D62",   // Leaf Green (Eco, Agriculture, Done)
  surfaceWarm: "#F8F6F0", // Warm content canvas
};

/** ชุดสี preset สอดคล้องกับ Mahidol Lampang Portal Design System */
export const COLOR_PRESET = {
  mahidol: {
    key: "mahidol", label: "น้ำเงินมหิดล (Brand Navy)",
    solid: "bg-[#123B63]", solidHover: "hover:bg-[#0e2b42]",
    soft: "bg-[#123B63]/10", softText: "text-[#123B63]",
    ring: "ring-[#123B63]/20", border: "border-[#123B63]/20",
    text: "text-[#123B63]", dot: "bg-[#123B63]",
    gradient: "from-[#123B63] via-[#0e2b42] to-slate-900",
  },
  gold: {
    key: "gold", label: "ทองล้านนา (Northern Gold)",
    solid: "bg-[#D6A84F]", solidHover: "hover:bg-[#b88c3a]",
    soft: "bg-[#D6A84F]/15", softText: "text-[#8a6519]",
    ring: "ring-[#D6A84F]/30", border: "border-[#D6A84F]/30",
    text: "text-[#8a6519]", dot: "bg-[#D6A84F]",
    gradient: "from-[#D6A84F] to-[#b88c3a]",
  },
  terracotta: {
    key: "terracotta", label: "ดินเผาพื้นถิ่น (Local Terracotta)",
    solid: "bg-[#C66B4F]", solidHover: "hover:bg-[#a65339]",
    soft: "bg-[#C66B4F]/15", softText: "text-[#9e462d]",
    ring: "ring-[#C66B4F]/30", border: "border-[#C66B4F]/30",
    text: "text-[#C66B4F]", dot: "bg-[#C66B4F]",
    gradient: "from-[#C66B4F] to-[#a65339]",
  },
  farm: {
    key: "farm", label: "เขียวใบไม้ (Leaf Green)",
    solid: "bg-[#5F8D62]", solidHover: "hover:bg-[#4a734d]",
    soft: "bg-[#5F8D62]/15", softText: "text-[#3b5e3e]",
    ring: "ring-[#5F8D62]/20", border: "border-[#5F8D62]/20",
    text: "text-[#5F8D62]", dot: "bg-[#5F8D62]",
    gradient: "from-[#5F8D62] to-[#4a734d]",
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
  blue: {
    key: "blue", label: "น้ำเงินฟ้า",
    solid: "bg-blue-600", solidHover: "hover:bg-blue-700",
    soft: "bg-blue-50", softText: "text-blue-700",
    ring: "ring-blue-200", border: "border-blue-200",
    text: "text-blue-600", dot: "bg-blue-600",
    gradient: "from-blue-500 to-blue-700",
  },
  sky: {
    key: "sky", label: "ฟ้าสดใส",
    solid: "bg-sky-500", solidHover: "hover:bg-sky-600",
    soft: "bg-sky-50", softText: "text-sky-700",
    ring: "ring-sky-200", border: "border-sky-200",
    text: "text-sky-600", dot: "bg-sky-500",
    gradient: "from-sky-400 to-sky-600",
  },
  cyan: {
    key: "cyan", label: "ครามอ่อน",
    solid: "bg-cyan-500", solidHover: "hover:bg-cyan-600",
    soft: "bg-cyan-50", softText: "text-cyan-700",
    ring: "ring-cyan-200", border: "border-cyan-200",
    text: "text-cyan-600", dot: "bg-cyan-500",
    gradient: "from-cyan-400 to-cyan-600",
  },
  violet: {
    key: "violet", label: "ม่วงชมพู",
    solid: "bg-violet-600", solidHover: "hover:bg-violet-700",
    soft: "bg-violet-50", softText: "text-violet-700",
    ring: "ring-violet-200", border: "border-violet-200",
    text: "text-violet-600", dot: "bg-violet-600",
    gradient: "from-violet-500 to-violet-700",
  },
  emerald: {
    key: "emerald", label: "มรกตเขียว",
    solid: "bg-emerald-600", solidHover: "hover:bg-emerald-700",
    soft: "bg-emerald-50", softText: "text-emerald-700",
    ring: "ring-emerald-200", border: "border-emerald-200",
    text: "text-emerald-600", dot: "bg-emerald-600",
    gradient: "from-emerald-500 to-emerald-700",
  },
  rose: {
    key: "rose", label: "กุหลาบแดง",
    solid: "bg-rose-600", solidHover: "hover:bg-rose-700",
    soft: "bg-rose-50", softText: "text-rose-700",
    ring: "ring-rose-200", border: "border-rose-200",
    text: "text-rose-600", dot: "bg-rose-600",
    gradient: "from-rose-500 to-rose-700",
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