// ============================================================
// App.jsx — Mahidol Portal-style authenticated application shell
// ============================================================
import React, { useState } from "react";
import { useAppData } from "./store/AppDataProviderSupabase";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { BottomNav } from "./components/layout/BottomNav";
import { Toast } from "./components/ui/Toast";
import { MigrationBanner } from "./components/MigrationBanner";
import { useAuth } from "./hooks/useAuth";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InspectionPage } from "./pages/InspectionPage";
import { WorkOrderPage } from "./pages/WorkOrderPage";
import { ProcurementPage } from "./pages/ProcurementPage";
import { ReportsPage } from "./pages/ReportsPage";
import { AdminPage } from "./pages/admin/AdminPage";
import { FuelManagementPage } from "./pages/FuelManagementPage";
import { SobprapSafetyChecklistPage } from "./pages/SobprapSafetyChecklistPage";

export default function App() {
  const { page, setPage, migration } = useAppData();
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, login, logout, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb] text-sm text-slate-500">กำลังตรวจสอบสิทธิ์…</div>;
  }
  if (!currentUser) return <LoginPage onLogin={login} />;

  const canManage = ["admin", "dean", "deputy_dean", "finance_head", "section_head"].includes(currentUser.role);

  return (
    <div className="facility-app-shell min-h-screen bg-[#f4f6fb] font-sans text-[#1f2933] antialiased">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .animate-fade { animation: fadeIn .3s cubic-bezier(.2,.7,.3,1) both; }
        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area { position: absolute; inset: 0; width: 100%; border: none !important; box-shadow: none !important; padding: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} currentUser={currentUser} onLogout={logout} />

      <div className="facility-main-column min-h-screen lg:pl-[260px]">
        <Header setMenuOpen={setMenuOpen} currentUser={currentUser} onLogout={logout} />
        <main className="safety-workspace">
          <MigrationBanner migration={migration} onMigrate={() => migration.runMigration()} />
          {page === "dashboard" && <DashboardPage />}
          {page === "inspection" && <InspectionPage currentUser={currentUser} />}
          {page === "sobprap-safety" && <SobprapSafetyChecklistPage currentUser={currentUser} />}
          {page === "workorder" && <WorkOrderPage />}
          {page === "fuel" && <FuelManagementPage />}
          {page === "procurement" && <ProcurementPage />}
          {page === "reports" && <ReportsPage />}
          {page === "admin" && canManage && <AdminPage onExit={() => setPage("dashboard")} />}
          {page === "admin" && !canManage && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">คุณไม่มีสิทธิ์เข้าถึง Admin Console</div>}
        </main>
      </div>

      <BottomNav />
      <Toast />
    </div>
  );
}
