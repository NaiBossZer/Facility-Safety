// ============================================================
// supabaseData.js — Supabase data access functions
// เขียน/อ่านข้อมูลจาก Supabase แทน localStorage
// ============================================================
import { supabase } from "./supabaseClient";
const fromDbWorkOrder=w=>({...w,buildingId:w.building_id,buildingName:w.building_name,buildingCode:w.building_code,createdAt:w.created_at,catalogVersionAt:w.catalog_version_at,sourceItemIds:w.source_item_ids||[],history:w.history||[],procurement:w.procurement??null,photos:w.photos||[],items:w.items||[]});
const toDbWorkOrder=w=>({id:w.id,number:w.number,building_id:w.buildingId,building_name:w.buildingName||"-",building_code:w.buildingCode||"-",title:w.title,reporter:w.reporter||"-",reason:w.reason||null,created_at:w.createdAt,date:w.date,status:Number(w.status??1),priority:w.priority||"normal",findings:w.findings||[],source_item_ids:w.sourceItemIds||[],items:w.items||[],total:Number(w.total??0),photos:w.photos||[],catalog_version_at:w.catalogVersionAt??null,history:w.history||[],procurement:w.procurement??null});
const fromDbInspection=i=>({...i,buildingId:i.building_id,createdAt:i.created_at,workOrderId:i.work_order_id,notes:i.notes||{},results:i.results||{},photos:i.photos||[],summary:i.summary||{}});
const toDbInspection=i=>({id:i.id,building_id:i.buildingId,inspector:i.inspector||"-",date:i.date,created_at:i.createdAt,results:i.results||{},notes:i.notes||{},photos:i.photos||[],summary:i.summary||{},work_order_id:i.workOrderId||null});
const mapCategory=x=>({...x,order:x.order,active:x.active});
const mapItem=x=>({...x,categoryId:x.category_id,unitPrice:x.unit_price,createdAt:x.created_at,updatedAt:x.updated_at});
const mapBuilding=x=>({...x,code:x.code,order:x.order,active:x.active});
const mapVendor=x=>({...x,factor:Number(x.factor??1),order:x.order,active:x.active});
const mapBudget=x=>x?({fiscalYear:x.fiscal_year,total:Number(x.total??0),id:x.id}):{fiscalYear:2569,total:2500000};
const mapPersonnel=x=>({...x,isResponsible:x.is_responsible});
const toDbCatalog=c=>({categories:(c.categories||[]).map(x=>({id:x.id,track:x.track,name:x.name,color:x.color,icon:x.icon,order:x.order??0,active:x.active??true})),items:(c.items||[]).map(x=>({id:x.id,category_id:x.categoryId,label:x.label,standard:x.standard||null,frequency:x.frequency||null,critical:Boolean(x.critical),parts:x.parts||[],order:x.order??0,active:x.active??true})),buildings:(c.buildings||[]).map(x=>({id:x.id,name:x.name,code:x.code,detail:x.detail||null,order:x.order??0,active:x.active??true})),vendors:(c.vendors||[]).map(x=>({id:x.id,name:x.name,tax:x.tax||null,tel:x.tel||null,factor:x.factor??1,order:x.order??0,active:x.active??true})),budget:c.budget?{id:c.budget.id,fiscal_year:c.budget.fiscalYear,total:c.budget.total}:{fiscal_year:2569,total:2500000},personnel:(c.personnel||[]).map(x=>({id:x.id,name:x.name,position:x.position||null,department:x.department||null,role:x.role,phone:x.phone||null,email:x.email||null,is_responsible:Boolean(x.isResponsible),pin:x.pin,active:x.active??true}))});


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
      categories: (categories.data || []).map(mapCategory),
      items: (items.data || []).map(mapItem),
      buildings: (buildings.data || []).map(mapBuilding),
      vendors: (vendors.data || []).map(mapVendor),
      budget: mapBudget(budget.data?.[0]),
      personnel: (personnel.data || []).map(mapPersonnel)
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
        .upsert(toDbCatalog(catalog).categories);
      if (catError) throw catError;
    }

    // Save items
    if (catalog.items) {
      const { error: itemError } = await supabase
        .from('items')
        .upsert(toDbCatalog(catalog).items);
      if (itemError) throw itemError;
    }

    // Save buildings
    if (catalog.buildings) {
      const { error: bldError } = await supabase
        .from('buildings')
        .upsert(toDbCatalog(catalog).buildings);
      if (bldError) throw bldError;
    }

    // Save vendors
    if (catalog.vendors) {
      const { error: venError } = await supabase
        .from('vendors')
        .upsert(toDbCatalog(catalog).vendors);
      if (venError) throw venError;
    }

    // Save budget
    if (catalog.budget) {
      const { error: budError } = await supabase
        .from('budget')
        .upsert(toDbCatalog(catalog).budget);
      if (budError) throw budError;
    }

    // Save personnel
    if (catalog.personnel) {
      const { error: perError } = await supabase
        .from('personnel')
        .upsert(toDbCatalog(catalog).personnel);
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
    return (data || []).map(fromDbWorkOrder);
  } catch (error) {
    console.error('Error fetching work orders:', error);
    throw error;
  }
}

export async function saveWorkOrder(workOrder) {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .upsert(toDbWorkOrder(workOrder))
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
    return (data || []).map(fromDbInspection);
  } catch (error) {
    console.error('Error fetching inspections:', error);
    throw error;
  }
}

export async function saveInspection(inspection) {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .upsert(toDbInspection(inspection))
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
    const { data: existing, error: findError } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', prefs.user_id || "default")
      .maybeSingle();
    if (findError) throw findError;
    if (existing?.id) {
      const { data, error } = await supabase.from('user_preferences').update(prefs).eq('id', existing.id).select().single();
      if (error) throw error;
      return { ok: true, data };
    }
    const { data, error } = await supabase.from('user_preferences').insert(prefs).select().single();
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