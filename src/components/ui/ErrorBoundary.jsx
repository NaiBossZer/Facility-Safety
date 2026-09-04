// ============================================================
// ErrorBoundary.jsx — React Error Boundary (AppSheet Style)
// ป้องกันหน้าจอขาว (White Screen) โดยจับ Error ทั้งหมดแล้วแสดงUIกู้คืน
// ============================================================
import React from "react";
import { AlertTriangle, RefreshCw, Home, ShieldAlert, Trash2 } from "lucide-react";
import { clearNamespace } from "../../lib/storage";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary Caught Exception]:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleClearCacheAndReset = () => {
    try {
      // Clear only this app's non-auth cache. Never clear other applications'
      // storage or the encrypted Supabase Auth session.
      clearNamespace();
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans text-slate-800 antialiased">
          <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-6 shadow-2xl sm:p-8">
            {/* Header Icon */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-inner">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <h2 className="text-center text-xl font-extrabold text-slate-900">
              เกิดข้อผิดพลาดในการแสดงผลระบบ
            </h2>
            <p className="mt-1 text-center text-xs leading-relaxed text-slate-500">
              ระบบบันทึกความปลอดภัยจับข้อยกเว้นได้เพื่อป้องกันข้อมูลสูญหาย (AppSheet Guard Active)
            </p>

            {/* Error Detail Message */}
            <div className="my-5 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
              <p className="font-bold text-red-700">
                {this.state.error?.name || "Error"}: {this.state.error?.message || "Unknown error"}
              </p>
              {this.state.errorInfo?.componentStack && (
                <pre className="mt-2 text-[10px] text-slate-500 overflow-x-auto max-h-32">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                onClick={this.handleReset}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition"
              >
                <RefreshCw className="h-4 w-4" /> รีโหลดหน้านี้ใหม่
              </button>
              <button
                onClick={this.handleClearCacheAndReset}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-xs font-bold text-red-700 hover:bg-red-100 active:scale-95 transition"
              >
                <Trash2 className="h-4 w-4" /> ล้างข้อมูลแคช & รีสตาร์ท
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
