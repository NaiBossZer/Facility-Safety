// ============================================================
// AppDataProvider.jsx — Single Source of Truth ของทั้งระบบ
// batch 2-4 จะดึงข้อมูลผ่าน useAppData() เท่านั้น
// ============================================================
import { createContext, useContext, useMemo, useCallback, useEffect, useState } from "react";
import { KEYS, estimateUsage, clearNamespace, readJSON, writeJSON } from "../lib/storage";
import { runMigrations } from "../lib/migrations";
import { buildDefaultCatalog } from "../config/seed/defaultCatalog";
import { usePersistentState } from "../hooks/usePersistentState";
import { useCatalog } from "../hooks/useCatalog";
import { useToast } from "../hooks/useToast";
import { createWorkOrderFromInspection, advanceStatus, summarizeWorkOrders } from "../lib/workorder";
import { nowISO } from "../lib/helpers";

const AppDataContext = createContext(null);

// รัน migration ครั้งเดียวก่อน React mount (ต้องเกิดก่อนอ่าน state)
const MIGRATION_RESULT = runMigrations();

export function AppDataProvider({ children }) {
  const { toasts, toast, dismiss } = useToast();
  const handleStorageError = useCallback(
    (type) => {
      if (type === "quota") toast.error("พื้นที่จัดเก็บเต็ม — กรุณา Export ข้อมูลแล้วล้างงานเก่า");
      else if (type === "unavailable") toast.warn("เบราว์เซอร์ปิดการจัดเก็บข้อมูล — ข้อมูลจะหายเมื่อปิดหน้า");
    },
    [toast]
  );

  const opts = { onError: handleStorageError };

  const [catalog, setCatalog, catalogMeta]   = usePersistentState(KEYS.catalog, buildDefaultCatalog, opts);
 const [workOrders, setWorkOrders] = usePersistentState(KEYS.workOrders, [
  { id: 'WO-001', description: 'ตรวจสอบระบบดับเพลิง', status: 'pending', createdAt: nowISO() },
  { id: 'WO-002', description: 'ซ่อมแซมประตูทางออกฉุกเฉิน', status: 'in-progress', createdAt: nowISO() }
], opts);

  const [inspections, setInspections]        = usePersistentState(KEYS.inspections, [], opts);
  const [ui, setUi]                          = usePersistentState(KEYS.ui, { page: "dashboard", procureWO: null }, opts);
  const [meta, setMeta]                      = usePersistentState(KEYS.meta, { schemaVersion: 2, woCounter: 0, lastSavedAt: null }, opts);

  const [usage, setUsage] = useState(() => estimateUsage());
  useEffect(() => {
    const id = setInterval(() => setUsage(estimateUsage()), 10000);
    return () => clearInterval(id);
  }, []);

  const cat = useCatalog(catalog, setCatalog, { workOrders, inspections });

  // ---------- NAVIGATION ----------
  const setPage = useCallback((page) => setUi((u) => ({ ...u, page })), [setUi]);
  const openProcurement = useCallback(
    (woId) => setUi((u) => ({ ...u, page: "procurement", procureWO: woId })),
    [setUi]
  );

  // ---------- BUSINESS LOGIC ----------
  const submitInspection = useCallback(
    (inspection) => {
      const result = createWorkOrderFromInspection(inspection, catalog, {
        counter: meta.woCounter || 0,
      });

      setInspections((list) => [result.inspectionRecord, ...list]);

      if (result.workOrder) {
        setWorkOrders((list) => [result.workOrder, ...list]);
        setMeta((m) => ({ ...m, woCounter: result.nextCounter, lastSavedAt: nowISO() }));
        toast.success(`สร้างใบแจ้งซ่อม ${result.workOrder.number} เรียบร้อย`);
      } else {
        toast.success("บันทึกผลการตรวจเรียบร้อย — ไม่พบสิ่งผิดปกติ");
      }
      return result;
    },
    [catalog, meta.woCounter, setInspections, setWorkOrders, setMeta, toast]
  );

  const updateWorkOrderStatus = useCallback(
    (woId, nextStatus, info = {}) => {
      setWorkOrders((list) =>
        list.map((wo) => (wo.id === woId ? advanceStatus(wo, nextStatus, info) : wo))
      );
    },
    [setWorkOrders]
  );

  const updateWorkOrder = useCallback(
    (woId, patch) => {
      setWorkOrders((list) => list.map((wo) => (wo.id === woId ? { ...wo, ...patch, id: wo.id } : wo)));
    },
    [setWorkOrders]
  );

  const stats = useMemo(() => summarizeWorkOrders(workOrders), [workOrders]);

  // ---------- DANGER ZONE ----------
  const wipeAll = useCallback(() => {
    clearNamespace();
    window.location.reload();
  }, []);

  const restoreFromBackup = useCallback(() => {
    // backup.applyBackup() เขียนลง storage แล้ว — reload เพื่อโหลดใหม่ทั้งหมด
    window.location.reload();
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
        savedAt: catalogMeta.savedAt,
        error: catalogMeta.error,
        available: catalogMeta.available,
        usage,
        flushNow: catalogMeta.flushNow,
      },
      migration: MIGRATION_RESULT,
      wipeAll, restoreFromBackup,
    }),
    [
      catalog, workOrders, inspections, ui, meta, stats, cat,
      setWorkOrders, setInspections, setUi, setMeta,
      setPage, openProcurement, submitInspection,
      updateWorkOrderStatus, updateWorkOrder,
      toasts, toast, dismiss, catalogMeta, usage, wipeAll, restoreFromBackup,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData ต้องอยู่ภายใน <AppDataProvider>");
  return ctx;
}

export default AppDataProvider;