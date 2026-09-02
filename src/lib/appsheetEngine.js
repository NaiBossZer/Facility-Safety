// ============================================================
// appsheetEngine.js — AppSheet-Style Data Architecture Library
// ออกแบบสถาปัตยกรรมข้อมูลตามโครงสร้าง AppSheet (Tables, Actions, Expressions, Sync Engine)
// ============================================================

import { uid, clone, nowISO } from "./helpers";
import { buildDefaultCatalog } from "../config/seed/defaultCatalog";

/**
 * 1. AppSheet Table Schema Definitions
 */
export const APPSHEET_TABLES = {
  categories:  { key: "categories",  idPrefix: "cat", label: "หมวดหมู่การตรวจ" },
  items:       { key: "items",       idPrefix: "itm", label: "รายการตรวจเช็ค" },
  buildings:   { key: "buildings",   idPrefix: "bld", label: "อาคาร/สถานที่" },
  vendors:     { key: "vendors",     idPrefix: "ven", label: "ร้านค้า/ผู้ขาย" },
  personnel:   { key: "personnel",   idPrefix: "per", label: "บุคลากร" },
  inspections: { key: "inspections", idPrefix: "ins", label: "ประวัติการตรวจ" },
  workOrders:  { key: "workOrders",  idPrefix: "wo",  label: "ใบแจ้งซ่อม" },
  budget:      { key: "budget",      idPrefix: "bgt", label: "งบประมาณ" },
};

/**
 * 2. AppSheet Expressions Engine (คำนวณสูตรเหมือน AppSheet)
 */
export const AppSheetExpressions = {
  // LOOKUP("bld_1", "buildings", "id", "name")
  LOOKUP: (value, list, keyField = "id", returnField = "name", fallback = "-") => {
    if (!Array.isArray(list)) return fallback;
    const found = list.find((item) => item?.[keyField] === value);
    return found?.[returnField] ?? fallback;
  },

  // FILTER(items, (i) => i.categoryId === "cat_1")
  FILTER: (list, predicate) => {
    if (!Array.isArray(list)) return [];
    return list.filter(predicate);
  },

  // COUNT(items)
  COUNT: (list) => (Array.isArray(list) ? list.length : 0),

  // SUM(items, "price")
  SUM: (list, field = "price") => {
    if (!Array.isArray(list)) return 0;
    return list.reduce((sum, item) => sum + (Number(item?.[field]) || 0), 0);
  },
};

/**
 * 3. AppSheet Table Operations (Add, Edit, Delete, Toggle)
 */
export class AppSheetTable {
  constructor(tableName, getData, setData) {
    this.tableName = tableName;
    this.meta = APPSHEET_TABLES[tableName] || { key: tableName, idPrefix: "row" };
    this.getData = getData;
    this.setData = setData;
  }

  get rows() {
    const data = this.getData();
    return Array.isArray(data) ? data : [];
  }

  getAll(options = { includeInactive: false }) {
    const list = this.rows;
    if (options.includeInactive) return list;
    return list.filter((r) => r?.active !== false);
  }

  getById(id) {
    return this.rows.find((r) => r?.id === id) || null;
  }

  addRow(draftData) {
    const newId = draftData.id || uid(this.meta.idPrefix);
    const newRow = {
      ...draftData,
      id: newId,
      createdAt: draftData.createdAt || nowISO(),
      active: draftData.active !== false,
    };
    const nextList = [newRow, ...this.rows];
    this.setData(nextList);
    return newRow;
  }

  updateRow(id, patchData) {
    const nextList = this.rows.map((r) => {
      if (r?.id === id) {
        return { ...r, ...patchData, id, updatedAt: nowISO() };
      }
      return r;
    });
    this.setData(nextList);
    return this.getById(id);
  }

  deleteRow(id) {
    const nextList = this.rows.filter((r) => r?.id !== id);
    this.setData(nextList);
    return true;
  }

  toggleRowActive(id, activeState) {
    return this.updateRow(id, { active: activeState });
  }
}

/**
 * 4. AppSheet Data Manager Wrapper (สร้างอินสแตนซ์พร้อมใช้งาน)
 */
export function createAppSheetEngine(catalogState, setCatalogState) {
  const catalog = catalogState || buildDefaultCatalog();

  const getTableData = (tableKey) => catalog[tableKey] || [];
  const setTableData = (tableKey, nextData) => {
    setCatalogState((prev) => ({
      ...buildDefaultCatalog(),
      ...prev,
      [tableKey]: nextData,
    }));
  };

  return {
    categories:  new AppSheetTable("categories",  () => getTableData("categories"),  (d) => setTableData("categories", d)),
    items:       new AppSheetTable("items",       () => getTableData("items"),       (d) => setTableData("items", d)),
    buildings:   new AppSheetTable("buildings",   () => getTableData("buildings"),   (d) => setTableData("buildings", d)),
    vendors:     new AppSheetTable("vendors",     () => getTableData("vendors"),     (d) => setTableData("vendors", d)),
    personnel:   new AppSheetTable("personnel",   () => getTableData("personnel"),   (d) => setTableData("personnel", d)),
    budget:      catalog.budget || { total: 2500000, fiscalYear: 2569 },

    // Expressions helper
    expr: AppSheetExpressions,
  };
}

export default createAppSheetEngine;
