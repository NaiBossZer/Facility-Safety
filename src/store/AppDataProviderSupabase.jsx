// ============================================================
// AppDataProviderSupabase.jsx — Supabase-based data provider
// Migration from localStorage to Supabase backend
// ============================================================
import { createContext, useContext, useMemo, useCallback, useEffect, useState } from "react";
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
import { performMigration, needsMigration, getMigrationStatus } from "../lib/migrationToSupabase";
import { readJSON } from "../lib/storage";

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

        if (catalogData) setCatalog(catalogData);
        if (workOrdersData) setWorkOrders(workOrdersData);
        if (inspectionsData) setInspections(inspectionsData);
        if (userPrefs) {
          setUi({
            page: userPrefs.last_route || "dashboard",
            procureWO: null,
            activeTrack: userPrefs.active_track || "safety_legal",
            ...userPrefs.preferences
          });
        }
        if (systemMeta) {
          setMeta({
            schemaVersion: systemMeta.schema_version,
            woCounter: systemMeta.wo_counter,
            lastSavedAt: systemMeta.last_sync_at
          });
        }

        // Check if migration is needed
        if (status.hasLocalStorage && !status.lastSyncAt) {
          console.log("🔄 Migration needed - localStorage data detected");
          toast.info("พบข้อมูลเก่าใน localStorage - กดที่ปุ่ม Migration เพื่อย้ายข้อมูล");
        }

      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("ไม่สามารถโหลดข้อมูลจาก Supabase ได้");
        
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
      }
    };

    loadInitialData();
  }, [toast]);

  // Save UI preferences when they change
  useEffect(() => {
    if (!loading) {
      saveUserPreferences({
        user_id: 'default',
        active_track: ui.activeTrack || 'safety_legal',
        last_route: ui.page,
        preferences: ui
      }).catch(err => console.error("Error saving UI preferences:", err));
    }
  }, [ui, loading]);

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

      // Save inspection to Supabase
      await saveInspection(result.inspectionRecord);
      setInspections((list) => [result.inspectionRecord, ...list]);

      if (result.workOrder) {
        // Save work order to Supabase
        await saveWorkOrder(result.workOrder);
        setWorkOrders((list) => [result.workOrder, ...list]);
        
        // Update meta counter
        const updatedMeta = { 
          ...meta, 
          woCounter: result.nextCounter, 
          lastSavedAt: nowISO() 
        };
        setMeta(updatedMeta);
        await updateSystemMeta({
          wo_counter: result.nextCounter,
          last_sync_at: nowISO()
        });
        
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
      
      // Save to Supabase
      const updatedWO = updatedOrders.find(wo => wo.id === woId);
      if (updatedWO) {
        await saveWorkOrder(updatedWO);
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
      
      // Save to Supabase
      const updatedWO = updatedOrders.find(wo => wo.id === woId);
      if (updatedWO) {
        await saveWorkOrder(updatedWO);
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
        if (workOrdersData) setWorkOrders(workOrdersData);
        if (inspectionsData) setInspections(inspectionsData);
        
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
      wipeAll,
      loading
    }),
    [
      catalog, workOrders, inspections, ui, meta, stats, cat,
      setWorkOrders, setInspections, setUi, setMeta,
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