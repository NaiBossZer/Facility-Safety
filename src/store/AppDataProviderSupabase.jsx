// ============================================================
// AppDataProviderSupabase.jsx — Supabase-based data provider
// Migration from localStorage to Supabase backend
// ============================================================
import { createContext, useContext, useMemo, useCallback, useEffect, useState, useRef } from "react";
import { buildDefaultCatalog } from "../config/seed/defaultCatalog";
import { useCatalogSupabase } from "../hooks/useCatalogSupabase";
import { useToast } from "../hooks/useToast";
import { createWorkOrderFromInspection, advanceStatus, summarizeWorkOrders } from "../lib/workorder";
import { nowISO } from "../lib/helpers";
import { 
  fetchCatalog, 
  fetchWorkOrders, 
  fetchInspections, 
  fetchUserPreferences, 
  fetchSystemMeta,
  saveWorkOrder,
  saveInspection,
  updateSystemMeta,
  saveUserPreferences
} from "../lib/supabaseData";
import { performMigration, getMigrationStatus } from "../lib/migrationToSupabase";
import { readJSON, writeJSON } from "../lib/storage";

const LOCAL_STORAGE_KEYS = {
  catalog: "fsa:v2:catalog",
  workOrders: "fsa:v2:workOrders", 
  inspections: "fsa:v2:inspections",
  ui: "fsa:v2:ui",
  meta: "fsa:v2:meta"
};

const AppDataContext = createContext(null);

export function AppDataProviderSupabase({ children }) {
  const { toasts, toast, dismiss } = useToast();
  
  // Data state
  const [catalog, setCatalog] = useState(buildDefaultCatalog);
  const [workOrders, setWorkOrders] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [ui, setUi] = useState({ page: "dashboard", procureWO: null });
  const [meta, setMeta] = useState({ schemaVersion: 2, woCounter: 0, lastSavedAt: null });
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);
  const loadStartedRef = useRef(false);
  const [migrationStatus, setMigrationStatus] = useState({ hasLocalStorage: false, lastSyncAt: null });
  const [isMigrating, setIsMigrating] = useState(false);

  // Load initial data from Supabase
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Check migration status
        const status = await getMigrationStatus();
        setMigrationStatus(status);
        
        // Load data from Supabase
        const [catalogData, workOrdersData, inspectionsData, userPrefs, systemMeta] = await Promise.all([
          fetchCatalog(),
          fetchWorkOrders(),
          fetchInspections(),
          fetchUserPreferences(),
          fetchSystemMeta()
        ]);

        if (catalogData?.categories?.length || catalogData?.items?.length || catalogData?.buildings?.length || catalogData?.personnel?.length) {
          setCatalog(catalogData);
          writeJSON(LOCAL_STORAGE_KEYS.catalog, catalogData);
        }
        if (workOrdersData) {
          setWorkOrders(workOrdersData);
          writeJSON(LOCAL_STORAGE_KEYS.workOrders, workOrdersData);
        }
        if (inspectionsData) {
          setInspections(inspectionsData);
          writeJSON(LOCAL_STORAGE_KEYS.inspections, inspectionsData);
        }
        // Route is local UI/session state. Prefer the local route so refresh remains
        // stable even when Supabase RLS prevents preference writes.
        const localUI = readJSON(LOCAL_STORAGE_KEYS.ui);
        if (userPrefs || localUI) {
          setUi({
            page: localUI?.page || userPrefs?.last_route || "dashboard",
            procureWO: localUI?.procureWO || null,
            activeTrack: userPrefs?.active_track || localUI?.activeTrack || "safety_legal",
            ...(userPrefs?.preferences || {}),
            ...(localUI || {})
          });
        }
        if (systemMeta) {
          setMeta({
            schemaVersion: systemMeta.schema_version,
            woCounter: systemMeta.wo_counter,
            lastSavedAt: systemMeta.last_sync_at
          });
        }

        // v2 localStorage is an offline cache only. Never notify about migration on startup.
        // If Supabase is available, its data above is the source of truth.

      } catch (error) {
        console.error("Error loading initial data:", error);
        console.warn("Supabase unavailable; using localStorage offline cache");
        
        // Fallback to localStorage if Supabase fails
        console.log("🔄 Falling back to localStorage");
        const localCatalog = readJSON(LOCAL_STORAGE_KEYS.catalog);
        const localWorkOrders = readJSON(LOCAL_STORAGE_KEYS.workOrders);
        const localInspections = readJSON(LOCAL_STORAGE_KEYS.inspections);
        const localUI = readJSON(LOCAL_STORAGE_KEYS.ui);
        const localMeta = readJSON(LOCAL_STORAGE_KEYS.meta);
        
        if (localCatalog) setCatalog(localCatalog);
        if (localWorkOrders) setWorkOrders(localWorkOrders);
        if (localInspections) setInspections(localInspections);
        if (localUI) setUi(localUI);
        if (localMeta) setMeta(localMeta);
        
      } finally {
        setLoading(false);
        setDataInitialized(true);
      }
    };

    // Initial data load must run only once. A changing toast callback must not
    // reload Supabase preferences and reset the current page to Dashboard.
    if (!loadStartedRef.current) {
      loadStartedRef.current = true;
      loadInitialData();
    }
  }, []);

  // Persist UI locally first so navigation survives refresh even if Supabase
  // preference writes are blocked by RLS. Supabase remains best-effort sync.
  useEffect(() => {
    if (!loading && dataInitialized) {
      writeJSON(LOCAL_STORAGE_KEYS.ui, ui);
      saveUserPreferences({
        user_id: 'default',
        active_track: ui.activeTrack || 'safety_legal',
        last_route: ui.page,
        preferences: ui
      }).catch(err => console.warn("Supabase UI preference sync failed; local UI retained", err));
    }
  }, [ui, loading, dataInitialized]);

  const cat = useCatalogSupabase(catalog, setCatalog, { workOrders, inspections });

  // ---------- NAVIGATION ----------
  const setPage = useCallback((page) => setUi((u) => ({ ...u, page })), []);
  const openProcurement = useCallback(
    (woId) => setUi((u) => ({ ...u, page: "procurement", procureWO: woId })),
    []
  );

  // ---------- BUSINESS LOGIC ----------
  const submitInspection = useCallback(
    async (inspection) => {
      const result = createWorkOrderFromInspection(inspection, catalog, {
        counter: meta.woCounter || 0,
      });

      // Supabase-first, local fallback so the app remains usable before RLS is fixed.
      try { await saveInspection(result.inspectionRecord); }
      catch (error) { console.warn("Supabase inspection save failed; using local fallback", error); }
      setInspections((list) => {
        const next = [result.inspectionRecord, ...list.filter(x => x.id !== result.inspectionRecord.id)];
        writeJSON(LOCAL_STORAGE_KEYS.inspections, next);
        return next;
      });

      if (result.workOrder) {
        try { await saveWorkOrder(result.workOrder); }
        catch (error) { console.warn("Supabase work order save failed; using local fallback", error); }
        setWorkOrders((list) => {
          const next = [result.workOrder, ...list.filter(x => x.id !== result.workOrder.id)];
          writeJSON(LOCAL_STORAGE_KEYS.workOrders, next);
          return next;
        });
        
        // Update meta counter
        const updatedMeta = { 
          ...meta, 
          woCounter: result.nextCounter, 
          lastSavedAt: nowISO() 
        };
        setMeta(updatedMeta);
        writeJSON(LOCAL_STORAGE_KEYS.meta, updatedMeta);
        try {
          await updateSystemMeta({
            wo_counter: result.nextCounter,
            last_sync_at: updatedMeta.lastSavedAt
          });
        } catch (error) {
          console.warn("Supabase meta update failed; local meta retained", error);
        }
        
        toast.success(`สร้างใบแจ้งซ่อม ${result.workOrder.number} เรียบร้อย`);
      } else {
        toast.success("บันทึกผลการตรวจเรียบร้อย — ไม่พบสิ่งผิดปกติ");
      }
      return result;
    },
    [catalog, meta, setInspections, setWorkOrders, setMeta, toast]
  );

  const updateWorkOrderStatus = useCallback(
    async (woId, nextStatus, info = {}) => {
      const updatedOrders = workOrders.map((wo) => 
        wo.id === woId ? advanceStatus(wo, nextStatus, info) : wo
      );
      setWorkOrders(updatedOrders);
      writeJSON(LOCAL_STORAGE_KEYS.workOrders, updatedOrders);
      
      const updatedWO = updatedOrders.find(wo => wo.id === woId);
      if (updatedWO) {
        try { await saveWorkOrder(updatedWO); }
        catch (error) { console.warn("Supabase work order save failed; local copy retained", error); }
      }
    },
    [workOrders]
  );

  const updateWorkOrder = useCallback(
    async (woId, patch) => {
      const updatedOrders = workOrders.map((wo) => 
        wo.id === woId ? { ...wo, ...patch, id: wo.id } : wo
      );
      setWorkOrders(updatedOrders);
      writeJSON(LOCAL_STORAGE_KEYS.workOrders, updatedOrders);
      
      const updatedWO = updatedOrders.find(wo => wo.id === woId);
      if (updatedWO) {
        try { await saveWorkOrder(updatedWO); }
        catch (error) { console.warn("Supabase work order save failed; local copy retained", error); }
      }
    },
    [workOrders]
  );

  // ---------- MIGRATION ----------
  const runMigration = useCallback(async () => {
    try {
      setIsMigrating(true);
      toast.info("กำลังย้ายข้อมูลไป Supabase...");
      
      const result = await performMigration();
      
      if (result.success) {
        toast.success("ย้ายข้อมูลเรียบร้อยแล้ว!");
        setMigrationStatus({ hasLocalStorage: false, lastSyncAt: new Date().toISOString() });
        
        // Reload data from Supabase
        const [catalogData, workOrdersData, inspectionsData] = await Promise.all([
          fetchCatalog(),
          fetchWorkOrders(),
          fetchInspections()
        ]);
        
        if (catalogData) setCatalog(catalogData);
        if (workOrdersData) {
          setWorkOrders(workOrdersData);
          writeJSON(LOCAL_STORAGE_KEYS.workOrders, workOrdersData);
        }
        if (inspectionsData) {
          setInspections(inspectionsData);
          writeJSON(LOCAL_STORAGE_KEYS.inspections, inspectionsData);
        }
        
      } else {
        toast.error("ย้ายข้อมูลไม่สำเร็จ: " + result.error);
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast.error("เกิดข้อผิดพลาดในการย้ายข้อมูล");
    } finally {
      setIsMigrating(false);
    }
  }, [toast]);

  const stats = useMemo(() => summarizeWorkOrders(workOrders), [workOrders]);

  // ---------- DANGER ZONE ----------
  const wipeAll = useCallback(() => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด?")) {
      // Clear localStorage
      Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      window.location.reload();
    }
  }, []);

  const restoreFromBackup = useCallback(() => {
    window.location.reload();
  }, []);

  // ---------- LEGACY NAV FALLBACKS (Dashboard.jsx old signatures) ----------
  const goto = useCallback((nextPage) => setUi((u) => ({ ...u, page: nextPage })), [setUi]);
  const setSelectedWO = useCallback(() => { /* handled via procurement state */ }, []);

  const value = useMemo(
    () => ({
      // data
      catalog, workOrders, inspections, ui, meta, stats,
      // catalog api
      cat,
      // setters
      setWorkOrders, setInspections, setUi, setMeta,
      // navigation
      page: ui.page, setPage, procureWO: ui.procureWO, openProcurement,
      goto, setSelectedWO,
      // actions
      submitInspection, updateWorkOrderStatus, updateWorkOrder,
      // system
      toasts, toast, dismiss,
      storage: {
        savedAt: meta.lastSavedAt,
        error: null,
        available: true,
        usage: { used: 0, total: Infinity },
        flushNow: async () => { /* handled automatically */ },
      },
      migration: { 
        hasLocalStorage: migrationStatus.hasLocalStorage,
        lastSyncAt: migrationStatus.lastSyncAt,
        runMigration,
        isMigrating
      },
      wipeAll, restoreFromBackup,
      loading
    }),
    [
      catalog, workOrders, inspections, ui, meta, stats, cat,
      setWorkOrders, setInspections, setUi, setMeta,
      goto, setSelectedWO, restoreFromBackup,
      setPage, openProcurement, submitInspection,
      updateWorkOrderStatus, updateWorkOrder,
      toasts, toast, dismiss, migrationStatus, runMigration, isMigrating, wipeAll, loading
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData ต้องอยู่ภายใน <AppDataProvider>");
  return ctx;
}

export default AppDataProviderSupabase;