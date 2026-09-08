-- ============================================================
-- 005_unified_facility_platform.sql — Unified Facility, Safety & Utilities Schema
-- Adds Assets, Fuel & Fleet Management, and Audit Trail Tables with RLS & Triggers
-- ============================================================

-- Enable pgcrypto if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. ASSETS MASTER TABLE (ครุภัณฑ์และระบบหลัก)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assets (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  building_id TEXT REFERENCES public.buildings(id) ON DELETE SET NULL,
  location_detail TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'repairing', 'inactive', 'archived')),
  installation_date DATE,
  warranty_expire_date DATE,
  responsible_person TEXT,
  purchase_cost NUMERIC(15,2) DEFAULT 0,
  specs JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_building ON public.assets(building_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON public.assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);

-- ============================================================
-- 2. VEHICLES MASTER TABLE (ยานพาหนะราชการ)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fuel_vehicles (
  id TEXT PRIMARY KEY,
  plate_number TEXT NOT NULL UNIQUE,
  province TEXT NOT NULL DEFAULT 'กรุงเทพมหานคร',
  brand_model TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'กระบะ 4 ประตู (ดีเซล)',
  assigned_unit TEXT NOT NULL DEFAULT 'งานพันธกิจเพื่อสังคม (ลำปาง)',
  primary_driver TEXT,
  current_odometer NUMERIC(10,1) NOT NULL DEFAULT 0,
  avg_consumption_km_per_liter NUMERIC(5,2) NOT NULL DEFAULT 11.5,
  fuel_type TEXT NOT NULL DEFAULT 'ดีเซล B7 / PTT Fleet Card',
  fleet_card_number TEXT,
  fleet_card_limit_monthly NUMERIC(10,2) DEFAULT 15000,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive', 'archived')),
  tank_capacity_liters NUMERIC(6,1) DEFAULT 80,
  next_maintenance_km NUMERIC(10,1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. MOWER CENTRAL TANK INVENTORY (คลังน้ำมันถังกลางเครื่องตัดหญ้า)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fuel_mower_inventory (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdraw')),
  deposit_liters NUMERIC(8,2) NOT NULL DEFAULT 0,
  withdraw_liters NUMERIC(8,2) NOT NULL DEFAULT 0,
  balance_liters NUMERIC(8,2) NOT NULL CHECK (balance_liters >= 0), -- ป้องกันสต็อกติดลบ
  requested_by TEXT NOT NULL,
  purpose TEXT,
  receipt_no TEXT,
  total_amount NUMERIC(10,2) DEFAULT 0,
  receipt_attachment TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mower_inv_date ON public.fuel_mower_inventory(date);

-- ============================================================
-- 4. VEHICLE TRIP LOGS (บันทึกการใช้รถยนต์ราชการ)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fuel_trips (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES public.fuel_vehicles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  route TEXT NOT NULL,
  start_odometer NUMERIC(10,1) NOT NULL,
  end_odometer NUMERIC(10,1) NOT NULL CHECK (end_odometer >= start_odometer), -- เลขไมล์กลับห้ามต่ำกว่าไมล์ไป
  distance_km NUMERIC(8,1) GENERATED ALWAYS AS (end_odometer - start_odometer) STORED,
  driver TEXT NOT NULL,
  purpose TEXT,
  fuel_used_liters NUMERIC(6,2),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fuel_trips_vehicle ON public.fuel_trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_trips_date ON public.fuel_trips(date);

-- ============================================================
-- 5. REFUEL LOGS (ประวัติการเติมน้ำมันบัตร Fleet Card)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fuel_refuel_logs (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES public.fuel_vehicles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  odometer_reading NUMERIC(10,1) NOT NULL,
  volume_liters NUMERIC(8,2) NOT NULL,
  price_per_liter NUMERIC(6,2) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  driver_name TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'PTT Fleet Card',
  station_name TEXT,
  receipt_no TEXT,
  receipt_attachment TEXT,
  odometer_image TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. FUEL PLANNING & FORECASTING (แผนการประเมินการใช้น้ำมัน)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fuel_plans (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL, -- เช่น '2026-09'
  target_type TEXT NOT NULL CHECK (target_type IN ('vehicle', 'mower')),
  asset_name TEXT NOT NULL,
  target_date DATE NOT NULL,
  estimated_work_unit NUMERIC(8,1) NOT NULL, -- กม. หรือ ชม.
  unit_label TEXT NOT NULL DEFAULT 'กม.',
  avg_rate NUMERIC(6,2) NOT NULL,
  estimated_liters NUMERIC(8,2) NOT NULL,
  estimated_budget NUMERIC(10,2) NOT NULL,
  actual_work_unit NUMERIC(8,1) DEFAULT 0,
  actual_liters NUMERIC(8,2) DEFAULT 0,
  actual_budget NUMERIC(10,2) DEFAULT 0,
  variance_percentage NUMERIC(6,2) DEFAULT 0,
  variance_reason TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. AUDIT TRAIL LOGS (บันทึกประวัติการใช้งานและตรวจสอบย้อนหลัง)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  module TEXT NOT NULL, -- 'inspection', 'work_order', 'procurement', 'fuel', 'master_data'
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'STATUS_CHANGE', 'APPROVE', 'DELETE', 'EXPORT'
  record_id TEXT NOT NULL,
  description TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT,
  ip_address TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_audit_module ON public.audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_record ON public.audit_logs(record_id);

-- ============================================================
-- 8. WORK ORDERS ENHANCEMENT (เพิ่มฟิลด์ CM/PM, ช่าง, และค่าแรง)
-- ============================================================
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS maintenance_type TEXT DEFAULT 'cm' CHECK (maintenance_type IN ('cm', 'pm'));
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS assigned_technician TEXT;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS scheduled_date DATE;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS completed_date DATE;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS labor_cost NUMERIC(15,2) DEFAULT 0;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS service_cost NUMERIC(15,2) DEFAULT 0;

-- ============================================================
-- 9. ROW LEVEL SECURITY (RLS) FOR NEW TABLES
-- ============================================================
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_mower_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_refuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY assets_read ON public.assets FOR SELECT TO authenticated USING (true);
CREATE POLICY assets_write ON public.assets FOR ALL TO authenticated USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY fuel_vehicles_read ON public.fuel_vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY fuel_vehicles_write ON public.fuel_vehicles FOR ALL TO authenticated USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY fuel_mower_read ON public.fuel_mower_inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY fuel_mower_write ON public.fuel_mower_inventory FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY fuel_trips_read ON public.fuel_trips FOR SELECT TO authenticated USING (true);
CREATE POLICY fuel_trips_write ON public.fuel_trips FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY fuel_refuel_read ON public.fuel_refuel_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY fuel_refuel_write ON public.fuel_refuel_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY fuel_plans_read ON public.fuel_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY fuel_plans_write ON public.fuel_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY audit_logs_read ON public.audit_logs FOR SELECT TO authenticated USING (public.is_manager());
CREATE POLICY audit_logs_insert ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
