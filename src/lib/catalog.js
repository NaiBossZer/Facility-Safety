// ============================================================
// catalog.js — ตรรกะจัดการ Catalog ทั้งหมด (Pure Functions)
// ทุกฟังก์ชันรับ catalog เดิม แล้วคืน catalog ใหม่ (immutable)
// ============================================================
import { uid, clone, byOrder, moveItem, matchSearch, nowISO } from "./helpers";
import { COLOR_PRESET, DEFAULT_COLOR, ICON_MAP, DEFAULT_ICON } from "../config/theme";
import { FREQUENCY } from "../config/workflow";
import { buildDefaultCatalog } from "../config/seed/defaultCatalog";

// ------------------------------------------------------------
// ENSURE STRUCTURE — ป้องกันโครงสร้าง catalog หลุดหาย
// ------------------------------------------------------------

export function ensureCatalogStructure(catalog) {
  const defaults = buildDefaultCatalog();
  if (!catalog || typeof catalog !== "object") return defaults;
  return {
    ...defaults,
    ...catalog,
    categories: Array.isArray(catalog.categories) ? catalog.categories : defaults.categories,
    items: Array.isArray(catalog.items) ? catalog.items : defaults.items,
    buildings: Array.isArray(catalog.buildings) ? catalog.buildings : defaults.buildings,
    vendors: Array.isArray(catalog.vendors) ? catalog.vendors : defaults.vendors,
    budget: catalog.budget && typeof catalog.budget === "object" ? { ...defaults.budget, ...catalog.budget } : defaults.budget,
    personnel: Array.isArray(catalog.personnel) ? catalog.personnel : defaults.personnel,
  };
}

// ------------------------------------------------------------
// SELECTORS — อ่านข้อมูล
// ------------------------------------------------------------

export function getCategories(catalog, { includeInactive = false } = {}) {
  const list = catalog?.categories || [];
  return list
    .filter((c) => includeInactive || c.active !== false)
    .slice()
    .sort(byOrder);
}

export function getCategory(catalog, categoryId) {
  return (catalog?.categories || []).find((c) => c.id === categoryId) || null;
}

export function getItems(catalog, { categoryId = null, includeInactive = false, search = "" } = {}) {
  const list = catalog?.items || [];
  return list
    .filter((i) => (categoryId ? i.categoryId === categoryId : true))
    .filter((i) => includeInactive || i.active !== false)
    .filter((i) => matchSearch(`${i.label} ${i.standard || ""}`, search))
    .slice()
    .sort(byOrder);
}

export function getItem(catalog, itemId) {
  return (catalog?.items || []).find((i) => i.id === itemId) || null;
}

export function countItemsByCategory(catalog, { includeInactive = false } = {}) {
  const map = {};
  (catalog?.items || []).forEach((i) => {
    if (!includeInactive && i.active === false) return;
    map[i.categoryId] = (map[i.categoryId] || 0) + 1;
  });
  return map;
}

export function getBuildings(catalog, { includeInactive = false } = {}) {
  return (catalog?.buildings || [])
    .filter((b) => includeInactive || b.active !== false)
    .slice()
    .sort(byOrder);
}

export function getVendors(catalog, { includeInactive = false } = {}) {
  return (catalog?.vendors || [])
    .filter((v) => includeInactive || v.active !== false)
    .slice()
    .sort(byOrder);
}

/** ราคารวมของอะไหล่ในรายการตรวจหนึ่ง */
export function itemPartsTotal(item) {
  return (item?.parts || []).reduce(
    (sum, p) => sum + (Number(p.qty) || 0) * (Number(p.unitPrice) || 0),
    0
  );
}

// ------------------------------------------------------------
// VALIDATION — คืน object { field: "ข้อความ error" } ว่าง = ผ่าน
// ------------------------------------------------------------

export function validateCategory(catalog, draft, { editingId = null } = {}) {
  const e = {};
  const name = String(draft?.name || "").trim();
  if (!name) e.name = "กรุณากรอกชื่อหมวด";
  else if (name.length > 60) e.name = "ชื่อหมวดยาวเกิน 60 ตัวอักษร";
  else {
    const dup = (catalog?.categories || []).some(
      (c) => c.id !== editingId && c.name.trim() === name
    );
    if (dup) e.name = "มีหมวดชื่อนี้อยู่แล้ว";
  }
  if (draft?.color && !COLOR_PRESET[draft.color]) e.color = "สีไม่ถูกต้อง";
  if (draft?.icon && !ICON_MAP[draft.icon]) e.icon = "ไอคอนไม่ถูกต้อง";
  return e;
}

export function validateItem(catalog, draft, { editingId = null } = {}) {
  const e = {};
  const label = String(draft?.label || "").trim();

  if (!label) e.label = "กรุณากรอกชื่อรายการตรวจ";
  else if (label.length > 120) e.label = "ชื่อรายการยาวเกิน 120 ตัวอักษร";
  else {
    const dup = (catalog?.items || []).some(
      (i) =>
        i.id !== editingId &&
        i.categoryId === draft.categoryId &&
        i.label.trim() === label
    );
    if (dup) e.label = "มีรายการชื่อนี้ในหมวดนี้แล้ว";
  }

  if (!draft?.categoryId) e.categoryId = "กรุณาเลือกหมวด";
  else if (!getCategory(catalog, draft.categoryId)) e.categoryId = "ไม่พบหมวดนี้";

  if (draft?.frequency && !FREQUENCY[draft.frequency]) e.frequency = "ความถี่ไม่ถูกต้อง";

  const parts = draft?.parts || [];
  const partErrors = {};
  parts.forEach((p, idx) => {
    const pe = {};
    if (!String(p.name || "").trim()) pe.name = "กรุณากรอกชื่อ";
    if (Number(p.qty) <= 0 || !Number.isFinite(Number(p.qty))) pe.qty = "จำนวนต้องมากกว่า 0";
    if (Number(p.unitPrice) < 0 || !Number.isFinite(Number(p.unitPrice))) pe.unitPrice = "ราคาต้องไม่ติดลบ";
    if (Object.keys(pe).length) partErrors[idx] = pe;
  });
  if (Object.keys(partErrors).length) e.parts = partErrors;

  return e;
}

export function isValid(errors) {
  return !errors || Object.keys(errors).length === 0;
}

// ------------------------------------------------------------
// MUTATIONS — CATEGORY
// ------------------------------------------------------------

export function addCategory(catalog, draft) {
  const next = clone(catalog);
  const maxOrder = Math.max(0, ...next.categories.map((c) => c.order || 0));
  next.categories.push({
    id: uid("cat"),
    name: String(draft.name).trim(),
    icon: draft.icon || DEFAULT_ICON,
    color: draft.color || DEFAULT_COLOR,
    order: maxOrder + 1,
    active: true,
  });
  return next;
}

export function updateCategory(catalog, categoryId, patch) {
  const next = clone(catalog);
  next.categories = next.categories.map((c) =>
    c.id === categoryId
      ? { ...c, ...patch, id: c.id, name: String(patch.name ?? c.name).trim() }
      : c
  );
  return next;
}

/** ปิด/เปิดใช้งานหมวด — ปิดหมวดจะปิดรายการในหมวดนั้นด้วย */
export function toggleCategory(catalog, categoryId, active) {
  const next = clone(catalog);
  next.categories = next.categories.map((c) =>
    c.id === categoryId ? { ...c, active } : c
  );
  if (active === false) {
    next.items = next.items.map((i) =>
      i.categoryId === categoryId ? { ...i, active: false, updatedAt: nowISO() } : i
    );
  }
  return next;
}

export function reorderCategories(catalog, fromIdx, toIdx) {
  const next = clone(catalog);
  const sorted = next.categories.slice().sort(byOrder);
  const moved = moveItem(sorted, fromIdx, toIdx);
  const orderMap = Object.fromEntries(moved.map((c) => [c.id, c.order]));
  next.categories = next.categories.map((c) => ({ ...c, order: orderMap[c.id] ?? c.order }));
  return next;
}

// ------------------------------------------------------------
// MUTATIONS — ITEM
// ------------------------------------------------------------

export function normalizeParts(parts = []) {
  return parts.map((p) => ({
    id: p.id || uid("prt"),
    name: String(p.name || "").trim(),
    unit: String(p.unit || "รายการ").trim(),
    qty: Number(p.qty) || 1,
    unitPrice: Number(p.unitPrice) || 0,
  }));
}

export function addItem(catalog, draft) {
  const next = clone(catalog);
  const inCat = next.items.filter((i) => i.categoryId === draft.categoryId);
  const maxOrder = Math.max(0, ...inCat.map((i) => i.order || 0));
  next.items.push({
    id: uid("itm"),
    categoryId: draft.categoryId,
    label: String(draft.label).trim(),
    standard: String(draft.standard || "").trim(),
    frequency: draft.frequency || "monthly",
    critical: Boolean(draft.critical),
    buildingScope: draft.buildingScope || "all",
    parts: normalizeParts(draft.parts),
    order: maxOrder + 1,
    active: true,
    updatedAt: nowISO(),
  });
  return next;
}

export function updateItem(catalog, itemId, patch) {
  const next = clone(catalog);
  next.items = next.items.map((i) =>
    i.id === itemId
      ? {
          ...i,
          ...patch,
          id: i.id,
          label: String(patch.label ?? i.label).trim(),
          parts: patch.parts ? normalizeParts(patch.parts) : i.parts,
          updatedAt: nowISO(),
        }
      : i
  );
  return next;
}

/** Soft delete — ประวัติเก่ายังอ่านได้ */
export function toggleItem(catalog, itemId, active) {
  const next = clone(catalog);
  next.items = next.items.map((i) =>
    i.id === itemId ? { ...i, active, updatedAt: nowISO() } : i
  );
  return next;
}

/** Hard delete — ใช้ได้เฉพาะเมื่อไม่มีอะไรอ้างอิง (เช็คด้วย getItemUsage ก่อน) */
export function deleteItem(catalog, itemId) {
  const next = clone(catalog);
  next.items = next.items.filter((i) => i.id !== itemId);
  return next;
}

export function reorderItems(catalog, categoryId, fromIdx, toIdx) {
  const next = clone(catalog);
  const inCat = next.items.filter((i) => i.categoryId === categoryId).sort(byOrder);
  const moved = moveItem(inCat, fromIdx, toIdx);
  const orderMap = Object.fromEntries(moved.map((i) => [i.id, i.order]));
  next.items = next.items.map((i) =>
    orderMap[i.id] !== undefined ? { ...i, order: orderMap[i.id] } : i
  );
  return next;
}

export function duplicateItem(catalog, itemId) {
  const src = getItem(catalog, itemId);
  if (!src) return catalog;
  return addItem(catalog, {
    ...src,
    label: `${src.label} (สำเนา)`,
    parts: src.parts.map((p) => ({ ...p, id: undefined })),
  });
}

// ------------------------------------------------------------
// MUTATIONS — BUILDING / VENDOR / BUDGET
// ------------------------------------------------------------

function genericAdd(catalog, listKey, prefix, draft) {
  const next = clone(catalog) || {};
  const list = next[listKey] || [];
  const maxOrder = Math.max(0, ...list.map((x) => x?.order || 0));
  next[listKey] = [...list, { ...draft, id: uid(prefix), order: maxOrder + 1, active: true }];
  return next;
}

function genericUpdate(catalog, listKey, id, patch) {
  const next = clone(catalog) || {};
  next[listKey] = (next[listKey] || []).map((x) => (x?.id === id ? { ...x, ...patch, id } : x));
  return next;
}

function genericToggle(catalog, listKey, id, active) {
  return genericUpdate(catalog, listKey, id, { active });
}

export const addBuilding    = (c, d) => genericAdd(c, "buildings", "bld", d);
export const updateBuilding = (c, id, p) => genericUpdate(c, "buildings", id, p);
export const toggleBuilding = (c, id, a) => genericToggle(c, "buildings", id, a);

export const addVendor      = (c, d) => genericAdd(c, "vendors", "ven", d);
export const updateVendor   = (c, id, p) => genericUpdate(c, "vendors", id, p);
export const toggleVendor   = (c, id, a) => genericToggle(c, "vendors", id, a);

export function updateBudget(catalog, patch = {}) {
  const next = clone(catalog) || {};
  const currentBudget = next.budget || { fiscalYear: 2569, total: 2500000 };
  next.budget = {
    ...currentBudget,
    ...patch,
    total: Number(patch.total ?? currentBudget.total) || 0,
  };
  return next;
}

// ------------------------------------------------------------
// INTEGRITY — ตรวจการอ้างอิงก่อนลบ
// ------------------------------------------------------------

/** นับว่ารายการนี้ถูกใช้ใน WO / ประวัติตรวจ กี่ครั้ง */
export function getItemUsage(itemId, { workOrders = [], inspections = [] } = {}) {
  const woCount = workOrders.filter((wo) =>
    (wo.items || []).some((it) => it.sourceItemId === itemId) ||
    (wo.sourceItemIds || []).includes(itemId)
  ).length;

  const insCount = inspections.filter((ins) =>
    Object.keys(ins.results || {}).includes(itemId)
  ).length;

  const openWO = workOrders.filter(
    (wo) =>
      wo.status < 6 &&
      ((wo.items || []).some((it) => it.sourceItemId === itemId) ||
        (wo.sourceItemIds || []).includes(itemId))
  ).length;

  return { woCount, insCount, openWO, total: woCount + insCount, canHardDelete: woCount + insCount === 0 };
}

/** ตรวจสุขภาพ catalog โดยรวม — ใช้แสดงเตือนในหน้า Admin */
export function checkIntegrity(catalog) {
  const issues = [];
  const catIds = new Set((catalog?.categories || []).map((c) => c.id));

  (catalog?.items || []).forEach((i) => {
    if (!catIds.has(i.categoryId)) {
      issues.push({ level: "error", message: `รายการ "${i.label}" อ้างอิงหมวดที่ไม่มีอยู่` });
    }
    if (!i.parts || i.parts.length === 0) {
      issues.push({ level: "warn", message: `รายการ "${i.label}" ยังไม่มีอะไหล่ — สร้างใบแจ้งซ่อมจะไม่มีรายการวัสดุ` });
    }
  });

  const activeCats = (catalog?.categories || []).filter((c) => c.active !== false);
  if (activeCats.length === 0) {
    issues.push({ level: "error", message: "ไม่มีหมวดที่เปิดใช้งานเลย — หน้าตรวจเช็คจะว่างเปล่า" });
  }

  return issues;
}

/** คืนค่า catalog มาตรฐาน */
export function resetCatalog() {
  return buildDefaultCatalog();
}
// ------------------------------------------------------------
// SMOKE TEST — ทดสอบความถูกต้องของตรรกะเบื้องต้น
// ------------------------------------------------------------

export function runCatalogSmokeTest() {
  console.log("🚀 Starting Catalog Module Smoke Test...");
  try {
    let catalog = { categories: [], items: [], buildings: [], vendors: [], budget: { total: 0 } };

    // 1. Test Add Category
    catalog = addCategory(catalog, { name: "ระบบไฟฟ้า", color: "blue", icon: "bolt" });
    const catId = catalog.categories[0].id;
    console.assert(catalog.categories.length === 1, "Add Category Failed");

    // 2. Test Add Item
    catalog = addItem(catalog, { categoryId: catId, label: "ตรวจสอบเบรกเกอร์", parts: [{ name: "เบรกเกอร์", qty: 1, unitPrice: 500 }] });
    console.assert(catalog.items.length === 1, "Add Item Failed");

    // 3. Test Selectors
    const items = getItems(catalog, { categoryId: catId });
    console.assert(items.length === 1, "Get Items Failed");

    // 4. Test Integrity
    const issues = checkIntegrity(catalog);
    console.log("🔍 Integrity Check found issues:", issues);

    console.log("✅ Catalog Module Smoke Test Passed!");
    return true;
  } catch (error) {
    console.error("❌ Catalog Module Smoke Test Failed:", error);
    return false;
  }
}