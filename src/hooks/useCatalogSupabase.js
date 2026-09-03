// ============================================================
// useCatalogSupabase.js — Supabase-based catalog management
// Extends the existing catalog logic with Supabase persistence
// ============================================================
import { useCallback } from "react";
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
  updateBudget
} from "../lib/catalog";
import { saveCatalog } from "../lib/supabaseData";

export function useCatalogSupabase(catalog, setCatalog, { workOrders = [], inspections = [] } = {}) {
  const safeCatalog = ensureCatalogStructure(catalog);

  // ---- CATEGORIES ----
  const handleAddCategory = useCallback(async (category) => {
    const updated = addCategory(safeCatalog, category);
    setCatalog(updated);
    await saveCatalog(updated);
  }, [safeCatalog, setCatalog]);

  const handleUpdateCategory = useCallback(async (categoryId, updates) => {
    const updated = updateCategory(safeCatalog, categoryId, updates);
    setCatalog(updated);
    await saveCatalog(updated);
  }, [safeCatalog, setCatalog]);

  const handleDeleteCategory = useCallback(async (categoryId) => {
    const updated = toggleCategory(safeCatalog, categoryId, false);
    setCatalog(updated);
    await saveCatalog(updated);
  }, [safeCatalog, setCatalog]);

  // ---- ITEMS ----
  const handleAddItem = useCallback(async (item) => {
    const updated = addItem(safeCatalog, item);
    setCatalog(updated);
    await saveCatalog(updated);
  }, [safeCatalog, setCatalog]);

  const handleUpdateItem = useCallback(async (itemId, updates) => {
    const updated = updateItem(safeCatalog, itemId, updates);
    setCatalog(updated);
    await saveCatalog(updated);
  }, [safeCatalog, setCatalog]);

  const handleDeleteItem = useCallback(async (itemId) => {
    const updated = toggleItem(safeCatalog, itemId, false);
    setCatalog(updated);
    await saveCatalog(updated);
  }, [safeCatalog, setCatalog]);

  // ---- BUILDINGS ----
  const handleAddBuilding = useCallback(async (building) => {
    const updated = addBuilding(safeCatalog, building);
    setCatalog(updated);
    await saveCatalog(updated);
  }, [safeCatalog, setCatalog]);

  const handleUpdateBuilding = useCallback(async (buildingId, updates) => {
    const updated = updateBuilding(safeCatalog, buildingId, updates);
    setCatalog(updated);
    await saveCatalog(updated);
  }, [safeCatalog, setCatalog]);

  const handleDeleteBuilding = useCallback(async (buildingId) => {
    const updated = toggleBuilding(safeCatalog, buildingId, false);
    setCatalog(updated);
    await saveCatalog(updated);
  }, [safeCatalog, setCatalog]);

  // ---- VENDORS ----
  const handleAddVendor = useCallback(async (vendor) => {
    const updated = addVendor(safeCatalog, vendor);
    setCatalog(updated);
    await saveCatalog(updated);
  }, [safeCatalog, setCatalog]);

  const handleUpdateVendor = useCallback(async (vendorId, updates) => {
    const updated = updateVendor(safeCatalog, vendorId, updates);
    setCatalog(updated);
    await saveCatalog(updated);
  }, [safeCatalog, setCatalog]);

  const handleDeleteVendor = useCallback(async (vendorId) => {
    const updated = toggleVendor(safeCatalog, vendorId, false);
    setCatalog(updated);
    await saveCatalog(updated);
  }, [safeCatalog, setCatalog]);

  // ---- BUDGET ----
  const handleUpdateBudget = useCallback(async (budgetUpdates) => {
    const updated = updateBudget(safeCatalog, budgetUpdates);
    setCatalog(updated);
    await saveCatalog(updated);
  }, [safeCatalog, setCatalog]);

  return {
    // Catalog state
    catalog: safeCatalog,
    
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