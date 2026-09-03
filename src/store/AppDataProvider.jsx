// ============================================================
// AppDataProvider.jsx — RE-EXPORT BRIDGE → Supabase Version
// ============================================================
// ⚠️ LEGACY COMPATIBILITY LAYER ⚠️
// Old code imports `useAppData` from "./AppDataProvider" 
// We re-export everything from the SUPABASE version so both
// import paths resolve to the SAME Context instance wrapped
// in <AppDataProviderSupabase> at main.jsx root.
//
// This fixes the runtime error:
//   "useAppData ต้องอยู่ภายใน <AppDataProvider>"
// which happened because 15+ pages/components imported the
// OLD Context (no Provider wrapped it) instead of the active
// Supabase Provider in main.jsx.
// ============================================================
export {
  AppDataProviderSupabase,
  AppDataProviderSupabase as AppDataProvider,
  useAppData,
  default,
} from "./AppDataProviderSupabase.jsx";
