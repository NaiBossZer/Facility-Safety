// ============================================================
// useCatalog.js — ห่อ catalog.js ให้เรียกใช้ใน React ได้สะดวก
// รับ [catalog, setCatalog] มาจาก AppDataProvider
// ============================================================
import { useMemo, useCallback } from "react";
import * as C from "../lib/catalog";

export function useCatalog(catalog, setCatalog, deps = {}) {
  const { workOrders = [], inspections = [] } = deps;

  // ---------- SELECTORS (memo) ----------
  const categories = useMemo(() => C.getCategories(catalog), [catalog]);
  const allCategories = useMemo(
    () => C.getCategories(catalog, { includeInactive: true }),
    [catalog]
  );
  const buildings = useMemo(() => C.getBuildings(catalog), [catalog]);
  const allBuildings = useMemo(
    () => C.getBuildings(catalog, { includeInactive: true }),
    [catalog]
  );
  const vendors = useMemo(() => C.getVendors(catalog), [catalog]);
  const allVendors = useMemo(
    () => C.getVendors(catalog, { includeInactive: true }),
    [catalog]
  );
  const itemCounts = useMemo(() => C.countItemsByCategory(catalog), [catalog]);
  const integrity = useMemo(() => C.checkIntegrity(catalog), [catalog]);
  const budget = catalog?.budget || { total: 0, fiscalYear: 0 };

  const itemsOf = useCallback(
    (categoryId, opts) => C.getItems(catalog, { categoryId, ...opts }),
    [catalog]
  );
  const itemById = useCallback((id) => C.getItem(catalog, id), [catalog]);
  const categoryById = useCallback((id) => C.getCategory(catalog, id), [catalog]);
  const usageOf = useCallback(
    (itemId) => C.getItemUsage(itemId, { workOrders, inspections }),
    [workOrders, inspections]
  );

  // ---------- ACTIONS ----------
  const wrap = (fn) => (...args) =>
    setCatalog((prev) => C.ensureCatalogStructure(fn(C.ensureCatalogStructure(prev), ...args)));

  const actions = useMemo(
    () => ({
      // category
      addCategory: wrap(C.addCategory),
      updateCategory: wrap(C.updateCategory),
      toggleCategory: wrap(C.toggleCategory),
      reorderCategories: wrap(C.reorderCategories),
      // item
      addItem: wrap(C.addItem),
      updateItem: wrap(C.updateItem),
      toggleItem: wrap(C.toggleItem),
      deleteItem: wrap(C.deleteItem),
      duplicateItem: wrap(C.duplicateItem),
      reorderItems: wrap(C.reorderItems),
      // building
      addBuilding: wrap(C.addBuilding),
      updateBuilding: wrap(C.updateBuilding),
      toggleBuilding: wrap(C.toggleBuilding),
      // vendor
      addVendor: wrap(C.addVendor),
      updateVendor: wrap(C.updateVendor),
      toggleVendor: wrap(C.toggleVendor),
      // budget
      updateBudget: wrap(C.updateBudget),
      // personnel — unified storage กับ useAuth
      setPersonnel: (list) =>
        setCatalog((prev) =>
          C.ensureCatalogStructure({ ...C.ensureCatalogStructure(prev), personnel: list })
        ),
      // reset
      resetCatalog: () => setCatalog(C.resetCatalog()),
      replaceCatalog: (next) => setCatalog(C.ensureCatalogStructure(next)),
    }),
    [setCatalog]
  );

  // ---------- VALIDATORS ----------
  const validators = useMemo(
    () => ({
      category: (draft, opts) => C.validateCategory(catalog, draft, opts),
      item: (draft, opts) => C.validateItem(catalog, draft, opts),
      isValid: C.isValid,
    }),
    [catalog]
  );

  return {
    catalog,
    categories, allCategories,
    buildings, allBuildings,
    vendors, allVendors,
    budget, itemCounts, integrity,
    itemsOf, itemById, categoryById, usageOf,
    partsTotal: C.itemPartsTotal,
    ...actions,
    validate: validators,
  };
}

export default useCatalog;