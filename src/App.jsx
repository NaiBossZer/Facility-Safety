// ============================================================
// App.jsx — Modular Application Shell Root
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

export default function App() {
  const { page, setPage, migration } = useAppData();
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, login, logout, loading } = useAuth();

  // ถ้ายังไม่ได้ login → แสดงหน้า Login
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">กำลังตรวจสอบสิทธิ์…</div>;
  }
  if (!currentUser) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      {/* Global CSS for Print & Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade {
          animation: fadeIn 0.35s cubic-bezier(0.2, 0.7, 0.3, 1) both;
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-area, #print-area * {
            visibility: visible !important;
          }
          #print-area {
            position: absolute;
            inset: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} currentUser={currentUser} onLogout={logout} />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header Bar */}
        <Header setMenuOpen={setMenuOpen} currentUser={currentUser} onLogout={logout} />

        {/* Page Views Router */}
        <main className="px-4 pb-28 pt-5 sm:px-6 lg:pb-10">
          <MigrationBanner migration={migration} onMigrate={() => migration.runMigration()} />
          {page === "dashboard" && <DashboardPage />}
          {page === "inspection" && <InspectionPage currentUser={currentUser} />}
          {page === "workorder" && <WorkOrderPage />}
          {page === "procurement" && <ProcurementPage />}
          {page === "reports" && <ReportsPage />}
          {page === "admin" && <AdminPage onExit={() => setPage("dashboard")} />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Toast Notification Container */}
      <Toast />
    </div>
  );
}
