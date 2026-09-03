// ============================================================
// useCatalogSupabase.js — Supabase-based catalog management
// Extends the existing catalog logic with Supabase persistence
// ============================================================
import { useCallback, useMemo } from "react";
import { 
  ensureCatalogStructure, 
  addCategory, 
  updateCategory, 
  toggleCategory,
  addItem,
  updateItem,
  toggleItem,
  deleteItem,
  addBuilding,
  updateBuilding,
  toggleBuilding,
  addVendor,
  updateVendor,
  toggleVendor,
  updateBudget,
  getCategories,
  getBuildings,
  getVendors,
  getItems,
  countItemsByCategory,
  checkIntegrity,
  getItem,
  getCategory,
  getItemUsage,
  itemPartsTotal
} from "../lib/catalog";
import { saveCatalog } from "../lib/supabaseData";
import { writeJSON } from "../lib/storage";

const LOCAL_CATALOG_KEY = "fsa:v2:catalog";

export function useCatalogSupabase(catalog, setCatalog, { workOrders = [], inspections = [] } = {}) {
  const safeCatalog = ensureCatalogStructure(catalog);

  const persistCatalog = useCallback(async (updated) => {
    setCatalog(updated);
    writeJSON(LOCAL_CATALOG_KEY, updated);
    try {
      await saveCatalog(updated);
      return { ok: true };
    } catch (error) {
      console.warn("Supabase catalog save failed; local catalog retained", error);
      return { ok: false, error };
    }
  }, [setCatalog]);

  // ---- CATEGORIES ----
  const handleAddCategory = useCallback(async (category) => {
    const updated = addCategory(safeCatalog, category);
    return await persistCatalog(updated);
  }, [safeCatalog, persistCatalog]);

  const handleUpdateCategory = useCallback(async (categoryId, updates) => {
    const updated = updateCategory(safeCatalog, categoryId, updates);
    return await persistCatalog(updated);
  }, [safeCatalog, persistCatalog]);

  const handleDeleteCategory = useCallback(async (categoryId) => {
    const updated = toggleCategory(safeCatalog, categoryId, false);
    return await persistCatalog(updated);
  }, [safeCatalog, persistCatalog]);

  // ---- ITEMS ----
  const handleAddItem = useCallback(async (item) => {
    const updated = addItem(safeCatalog, item);
    return await persistCatalog(updated);
  }, [safeCatalog, persistCatalog]);

  const handleUpdateItem = useCallback(async (itemId, updates) => {
    const updated = updateItem(safeCatalog, itemId, updates);
    return await persistCatalog(updated);
  }, [safeCatalog, persistCatalog]);

  const handleDeleteItem = useCallback(async (itemId) => {
    const updated = toggleItem(safeCatalog, itemId, false);
    return await persistCatalog(updated);
  }, [safeCatalog, persistCatalog]);

  // ---- BUILDINGS ----
  const handleAddBuilding = useCallback(async (building) => {
    const updated = addBuilding(safeCatalog, building);
    return await persistCatalog(updated);
  }, [safeCatalog, persistCatalog]);

  const handleUpdateBuilding = useCallback(async (buildingId, updates) => {
    const updated = updateBuilding(safeCatalog, buildingId, updates);
    return await persistCatalog(updated);
  }, [safeCatalog, persistCatalog]);

  const handleDeleteBuilding = useCallback(async (buildingId) => {
    const updated = toggleBuilding(safeCatalog, buildingId, false);
    return await persistCatalog(updated);
  }, [safeCatalog, persistCatalog]);

  // ---- VENDORS ----
  const handleAddVendor = useCallback(async (vendor) => {
    const updated = addVendor(safeCatalog, vendor);
    return await persistCatalog(updated);
  }, [safeCatalog, persistCatalog]);

  const handleUpdateVendor = useCallback(async (vendorId, updates) => {
    const updated = updateVendor(safeCatalog, vendorId, updates);
    return await persistCatalog(updated);
  }, [safeCatalog, persistCatalog]);

  const handleDeleteVendor = useCallback(async (vendorId) => {
    const updated = toggleVendor(safeCatalog, vendorId, false);
    return await persistCatalog(updated);
  }, [safeCatalog, persistCatalog]);

  // ---- BUDGET ----
  const handleUpdateBudget = useCallback(async (budgetUpdates) => {
    const updated = updateBudget(safeCatalog, budgetUpdates);
    return await persistCatalog(updated);
  }, [safeCatalog, persistCatalog]);

  const categories = useMemo(() => getCategories(safeCatalog), [safeCatalog]);
  const allCategories = useMemo(() => getCategories(safeCatalog, { includeInactive: true }), [safeCatalog]);
  const buildings = useMemo(() => getBuildings(safeCatalog), [safeCatalog]);
  const allBuildings = useMemo(() => getBuildings(safeCatalog, { includeInactive: true }), [safeCatalog]);
  const vendors = useMemo(() => getVendors(safeCatalog), [safeCatalog]);
  const allVendors = useMemo(() => getVendors(safeCatalog, { includeInactive: true }), [safeCatalog]);
  const budget = safeCatalog?.budget || { total: 0, fiscalYear: 0 };
  const itemCounts = useMemo(() => countItemsByCategory(safeCatalog), [safeCatalog]);
  const integrity = useMemo(() => checkIntegrity(safeCatalog), [safeCatalog]);
  const itemsOf = useCallback((categoryId, opts) => getItems(safeCatalog, { categoryId, ...opts }), [safeCatalog]);
  const itemById = useCallback((id) => getItem(safeCatalog, id), [safeCatalog]);
  const categoryById = useCallback((id) => getCategory(safeCatalog, id), [safeCatalog]);
  const usageOf = useCallback((itemId) => getItemUsage(itemId, { workOrders, inspections }), [workOrders, inspections]);

  return {
    // Catalog state
    catalog: safeCatalog,
    categories, allCategories,
    buildings, allBuildings,
    vendors, allVendors,
    budget, itemCounts, integrity,
    itemsOf, itemById, categoryById, usageOf,
    partsTotal: itemPartsTotal,
    
    // Categories
    addCategory: handleAddCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
    
    // Items
    addItem: handleAddItem,
    updateItem: handleUpdateItem,
    deleteItem: handleDeleteItem,
    
    // Buildings
    addBuilding: handleAddBuilding,
    updateBuilding: handleUpdateBuilding,
    deleteBuilding: handleDeleteBuilding,
    
    // Vendors
    addVendor: handleAddVendor,
    updateVendor: handleUpdateVendor,
    deleteVendor: handleDeleteVendor,
    
    // Budget
    updateBudget: handleUpdateBudget,
    
    // Work orders and inspections for reference
    workOrders,
    inspections
  };
}

export default useCatalogSupabase;