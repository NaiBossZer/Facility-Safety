// ============================================================
// migrationToSupabase.js — Utility to migrate localStorage data to Supabase
// Run this once to move existing data from localStorage to Supabase
// ============================================================
import { readJSON } from "./storage";
import { migrateLocalStorageToSupabase } from "./supabaseData";

const LOCAL_STORAGE_KEYS = {
  catalog: "fsa:v2:catalog",
  workOrders: "fsa:v2:workOrders", 
  inspections: "fsa:v2:inspections",
  ui: "fsa:v2:ui",
  meta: "fsa:v2:meta",
  migrationCompleted: "fsa:v2:migrationCompleted"
};

export async function performMigration() {
  console.log("🚀 Starting migration from localStorage to Supabase...");
  
  try {
    // Read all localStorage data
    const localStorageData = {
      catalog: readJSON(LOCAL_STORAGE_KEYS.catalog),
      workOrders: readJSON(LOCAL_STORAGE_KEYS.workOrders),
      inspections: readJSON(LOCAL_STORAGE_KEYS.inspections),
      ui: readJSON(LOCAL_STORAGE_KEYS.ui),
      meta: readJSON(LOCAL_STORAGE_KEYS.meta)
    };

    console.log("📦 Data loaded from localStorage:", {
      hasCatalog: !!localStorageData.catalog,
      hasWorkOrders: !!localStorageData.workOrders,
      hasInspections: !!localStorageData.inspections,
      hasUI: !!localStorageData.ui,
      hasMeta: !!localStorageData.meta
    });

    // Migrate to Supabase
    const result = await migrateLocalStorageToSupabase(localStorageData);
    
    if (result.ok) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.migrationCompleted, new Date().toISOString());
      console.log("✅ Migration completed successfully!");
      console.log("📊 Summary:");
      console.log(`   - Categories: ${localStorageData.catalog?.categories?.length || 0}`);
      console.log(`   - Items: ${localStorageData.catalog?.items?.length || 0}`);
      console.log(`   - Buildings: ${localStorageData.catalog?.buildings?.length || 0}`);
      console.log(`   - Vendors: ${localStorageData.catalog?.vendors?.length || 0}`);
      console.log(`   - Personnel: ${localStorageData.catalog?.personnel?.length || 0}`);
      console.log(`   - Work Orders: ${localStorageData.workOrders?.length || 0}`);
      console.log(`   - Inspections: ${localStorageData.inspections?.length || 0}`);
      
      return { success: true, migrated: localStorageData };
    } else {
      throw new Error("Migration failed");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    return { success: false, error: error.message };
  }
}

// Function to check if migration is needed
export function needsMigration() {
  // fsa:v2:* is the current offline/cache layer, not legacy data.
  // Migration must never be triggered merely because the cache exists.
  return false;
}

// Function to get migration status
export async function getMigrationStatus() {
  try {
    const { fetchSystemMeta } = await import("./supabaseData");
    const meta = await fetchSystemMeta();
    
    // A recorded Supabase sync means the v2 cache is no longer legacy data.
    if (meta?.last_sync_at) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.migrationCompleted, meta.last_sync_at);
    }

    return {
      hasLocalStorage: meta?.last_sync_at ? false : needsMigration(),
      lastSyncAt: meta?.last_sync_at,
      schemaVersion: meta?.schema_version
    };
  } catch (error) {
    console.error("Error checking migration status:", error);
    return {
      hasLocalStorage: needsMigration(),
      lastSyncAt: null,
      schemaVersion: null
    };
  }
}