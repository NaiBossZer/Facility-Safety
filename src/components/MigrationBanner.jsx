// ============================================================
// MigrationBanner.jsx — UI component for localStorage to Supabase migration
// ============================================================
import { AlertCircle, Cloud, Database, Loader2 } from "lucide-react";

export function MigrationBanner({ migration, onMigrate }) {
  if (!migration?.hasLocalStorage) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-1">
            ย้ายข้อมูลไป Supabase
          </h3>
          <p className="text-sm text-amber-700 mb-3">
            พบข้อมูลเก่าใน localStorage คุณสามารถย้ายข้อมูลไปเก็บใน Supabase 
            เพื่อให้สามารถเข้าถึงข้อมูลจากอุปกรณ์อื่นได้
          </p>
          <div className="flex gap-2">
            <button
              onClick={onMigrate}
              disabled={migration.isMigrating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {migration.isMigrating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังย้ายข้อมูล...
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  ย้ายข้อมูลเลย
                </>
              )}
            </button>
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <Database className="w-4 h-4" />
              <span>ข้อมูลจะถูก sync ข้ามอุปกรณ์</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MigrationBanner;