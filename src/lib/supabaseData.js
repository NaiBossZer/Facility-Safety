// ============================================================
// supabaseData.js — Supabase data access functions
// เขียน/อ่านข้อมูลจาก Supabase แทน localStorage
// ============================================================
import { supabase } from "./supabaseClient";

// ============================================================
// CATALOG OPERATIONS
// ============================================================

export async function fetchCatalog() {
  try {
    const [categories, items, buildings, vendors, budget, personnel] = await Promise.all([
      supabase.from('categories').select('*').order('order'),
      supabase.from('items').select('*').order('order'),
      supabase.from('buildings').select('*').order('order'),
      supabase.from('vendors').select('*').order('order'),
      supabase.from('budget').select('*').order('fiscal_year', { ascending: false }).limit(1),
      supabase.from('personnel').select('*')
    ]);

    if (categories.error) throw categories.error;
    if (items.error) throw items.error;
    if (buildings.error) throw buildings.error;
    if (vendors.error) throw vendors.error;
    if (budget.error) throw budget.error;
    if (personnel.error) throw personnel.error;

    return {
      catalogVersion: 2,
      categories: categories.data || [],
      items: items.data || [],
      buildings: buildings.data || [],
      vendors: vendors.data || [],
      budget: budget.data?.[0] || { fiscalYear: 2569, total: 2500000 },
      personnel: personnel.data || []
    };
  } catch (error) {
    console.error('Error fetching catalog:', error);
    throw error;
  }
}

export async function saveCatalog(catalog) {
  try {
    // Save categories
    if (catalog.categories) {
      const { error: catError } = await supabase
        .from('categories')
        .upsert(catalog.categories);
      if (catError) throw catError;
    }

    // Save items
    if (catalog.items) {
      const { error: itemError } = await supabase
        .from('items')
        .upsert(catalog.items);
      if (itemError) throw itemError;
    }

    // Save buildings
    if (catalog.buildings) {
      const { error: bldError } = await supabase
        .from('buildings')
        .upsert(catalog.buildings);
      if (bldError) throw bldError;
    }

    // Save vendors
    if (catalog.vendors) {
      const { error: venError } = await supabase
        .from('vendors')
        .upsert(catalog.vendors);
      if (venError) throw venError;
    }

    // Save budget
    if (catalog.budget) {
      const { error: budError } = await supabase
        .from('budget')
        .upsert(catalog.budget);
      if (budError) throw budError;
    }

    // Save personnel
    if (catalog.personnel) {
      const { error: perError } = await supabase
        .from('personnel')
        .upsert(catalog.personnel);
      if (perError) throw perError;
    }

    return { ok: true };
  } catch (error) {
    console.error('Error saving catalog:', error);
    throw error;
  }
}

// ============================================================
// WORK ORDER OPERATIONS
// ============================================================

export async function fetchWorkOrders() {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching work orders:', error);
    throw error;
  }
}

export async function saveWorkOrder(workOrder) {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .upsert(workOrder)
      .select()
      .single();

    if (error) throw error;
    return { ok: true, data };
  } catch (error) {
    console.error('Error saving work order:', error);
    throw error;
  }
}

export async function deleteWorkOrder(id) {
  try {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { ok: true };
  } catch (error) {
    console.error('Error deleting work order:', error);
    throw error;
  }
}

// ============================================================
// INSPECTION OPERATIONS
// ============================================================

export async function fetchInspections() {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching inspections:', error);
    throw error;
  }
}

export async function saveInspection(inspection) {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .upsert(inspection)
      .select()
      .single();

    if (error) throw error;
    return { ok: true, data };
  } catch (error) {
    console.error('Error saving inspection:', error);
    throw error;
  }
}

// ============================================================
// SYSTEM META OPERATIONS
// ============================================================

export async function fetchSystemMeta() {
  try {
    const { data, error } = await supabase
      .from('system_meta')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching system meta:', error);
    throw error;
  }
}

export async function updateSystemMeta(updates) {
  try {
    const { data, error } = await supabase
      .from('system_meta')
      .update(updates)
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;
    return { ok: true, data };
  } catch (error) {
    console.error('Error updating system meta:', error);
    throw error;
  }
}

// ============================================================
// USER PREFERENCES OPERATIONS
// ============================================================

export async function fetchUserPreferences(userId = 'default') {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If not found, return default
      if (error.code === 'PGRST116') {
        return {
          user_id: userId,
          active_track: 'safety_legal',
          preferences: {}
        };
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }
}

export async function saveUserPreferences(prefs) {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(prefs)
      .select()
      .single();

    if (error) throw error;
    return { ok: true, data };
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw error;
  }
}

// ============================================================
// MIGRATION HELPERS
// ============================================================

export async function migrateLocalStorageToSupabase(localStorageData) {
  try {
    // Migrate catalog
    if (localStorageData.catalog) {
      await saveCatalog(localStorageData.catalog);
    }

    // Migrate work orders
    if (localStorageData.workOrders) {
      for (const wo of localStorageData.workOrders) {
        await saveWorkOrder(wo);
      }
    }

    // Migrate inspections
    if (localStorageData.inspections) {
      for (const insp of localStorageData.inspections) {
        await saveInspection(insp);
      }
    }

    // Migrate UI preferences
    if (localStorageData.ui) {
      await saveUserPreferences({
        user_id: 'default',
        active_track: localStorageData.ui.activeTrack || 'safety_legal',
        last_route: localStorageData.ui.lastRoute,
        preferences: localStorageData.ui
      });
    }

    // Migrate meta
    if (localStorageData.meta) {
      await updateSystemMeta({
        schema_version: localStorageData.meta.schemaVersion || 2,
        wo_counter: localStorageData.meta.woCounter || 0,
        last_sync_at: new Date().toISOString()
      });
    }

    return { ok: true };
  } catch (error) {
    console.error('Error migrating localStorage to Supabase:', error);
    throw error;
  }
}