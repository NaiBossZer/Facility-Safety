// ============================================================
// helpers.js — ฟังก์ชันช่วยเหลือทั่วไป (ไม่มี dependency กับ React)
// ============================================================

/** รวม className แบบปลอดภัย: cx("a", cond && "b") */
export function cx(...args) {
  return args.filter(Boolean).join(" ");
}

/** สร้าง id ไม่ซ้ำ: uid("itm") -> "itm_lz9x2k_a4f1" */
export function uid(prefix = "id") {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 6);
  return `${prefix}_${t}_${r}`;
}

/** จัดรูปแบบเงินบาท: fmt(4500) -> "4,500" */
export function fmt(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

/** เงินบาทพร้อมสัญลักษณ์: baht(4500) -> "฿4,500" */
export function baht(n) {
  return `฿${fmt(n)}`;
}

/** วันที่ไทย: thDate("2026-09-02") -> "2 ก.ย. 2569" */
export function thDate(input, opts = {}) {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: opts.long ? "long" : "short",
    year: "numeric",
  });
}

/** วันที่+เวลาไทย แบบสั้น: "2 ก.ย. 69 10:42" */
export function thDateTime(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  })} ${d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`;
}

/** เวลาปัจจุบันแบบ HH:MM */
export function clockNow() {
  return new Date().toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** วันนี้ในรูปแบบ ISO date (YYYY-MM-DD) */
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** timestamp ISO เต็ม */
export function nowISO() {
  return new Date().toISOString();
}

/** deep clone แบบปลอดภัย (รองรับเบราว์เซอร์เก่า) */
export function clone(obj) {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(obj);
    } catch {
      /* fallthrough */
    }
  }
  return JSON.parse(JSON.stringify(obj));
}

/** หน่วงการเรียกฟังก์ชัน พร้อม .flush() และ .cancel() */
export function debounce(fn, wait = 300) {
  let timer = null;
  let lastArgs = null;

  const wrapped = (...args) => {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...lastArgs);
    }, wait);
  };

  wrapped.flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      if (lastArgs) fn(...lastArgs);
    }
  };

  wrapped.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    lastArgs = null;
  };

  return wrapped;
}

/** เรียงตาม field `order` แล้วตามด้วยชื่อ */
export function byOrder(a, b) {
  const oa = a?.order ?? 9999;
  const ob = b?.order ?? 9999;
  if (oa !== ob) return oa - ob;
  return String(a?.name ?? a?.label ?? "").localeCompare(
    String(b?.name ?? b?.label ?? ""),
    "th"
  );
}

/** ย้ายตำแหน่ง item ใน array (ใช้กับ drag & drop) */
export function moveItem(arr, from, to) {
  const list = [...arr];
  if (from < 0 || from >= list.length || to < 0 || to >= list.length) return list;
  const [moved] = list.splice(from, 1);
  list.splice(to, 0, moved);
  return list.map((it, i) => ({ ...it, order: i + 1 }));
}

/** ค้นหาแบบ fuzzy ง่าย ๆ (ไม่สนตัวพิมพ์ใหญ่เล็ก / ช่องว่าง) */
export function matchSearch(text, keyword) {
  if (!keyword) return true;
  const norm = (s) => String(s ?? "").toLowerCase().replace(/\s+/g, "");
  return norm(text).includes(norm(keyword));
}

/** บีบค่าให้อยู่ในช่วง */
export function clamp(n, min, max) {
  return Math.min(Math.max(Number(n) || 0, min), max);
}