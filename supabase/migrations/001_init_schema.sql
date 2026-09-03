-- ============================================================
-- 001_init_schema.sql — Facility & Safety Management Database Schema
-- Mirror localStorage structure with proper PostgreSQL types
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATALOG TABLES
-- ============================================================

-- Categories (หมวดหมู่การตรวจสอบ)
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  track TEXT NOT NULL CHECK (track IN ('safety_legal', 'facility_continuity')),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items (รายการตรวจสอบ)
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  standard TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'yearly')),
  critical BOOLEAN NOT NULL DEFAULT false,
  parts JSONB DEFAULT '[]',
  "order" INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buildings (อาคาร)
CREATE TABLE buildings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  detail TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors (ผู้ขาย)
CREATE TABLE vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tax TEXT,
  tel TEXT,
  factor NUMERIC(5,3) NOT NULL DEFAULT 1.0,
  "order" INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget (งบประมาณ)
CREATE TABLE budget (
  id SERIAL PRIMARY KEY,
  fiscal_year INTEGER NOT NULL,
  total NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personnel (บุคลากร)
CREATE TABLE personnel (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT,
  department TEXT,
  role TEXT CHECK (role IN ('inspector', 'section_head', 'deputy_dean', 'admin')),
  phone TEXT,
  email TEXT,
  is_responsible BOOLEAN NOT NULL DEFAULT false,
  pin TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- WORK ORDERS & INSPECTIONS
-- ============================================================

-- Work Orders (ใบแจ้งซ่อม)
CREATE TABLE work_orders (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  building_id TEXT NOT NULL REFERENCES buildings(id),
  building_name TEXT NOT NULL,
  building_code TEXT NOT NULL,
  title TEXT NOT NULL,
  reporter TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  date DATE NOT NULL,
  status INTEGER NOT NULL DEFAULT 1 CHECK (status >= 0 AND status <= 6),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  findings JSONB DEFAULT '[]',
  source_item_ids JSONB DEFAULT '[]',
  items JSONB DEFAULT '[]',
  total NUMERIC(15,2) NOT NULL DEFAULT 0,
  photos JSONB DEFAULT '[]',
  catalog_version_at INTEGER,
  history JSONB DEFAULT '[]',
  procurement JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspections (ประวัติการตรวจ)
CREATE TABLE inspections (
  id TEXT PRIMARY KEY,
  building_id TEXT NOT NULL REFERENCES buildings(id),
  inspector TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  results JSONB NOT NULL DEFAULT '{}',
  notes JSONB NOT NULL DEFAULT '{}',
  photos JSONB DEFAULT '[]',
  summary JSONB NOT NULL DEFAULT '{}',
  work_order_id TEXT REFERENCES work_orders(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- USER PREFERENCES & META
-- ============================================================

-- User UI Preferences
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  active_track TEXT CHECK (active_track IN ('safety_legal', 'facility_continuity')),
  last_route TEXT,
  preferences JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Meta Data
CREATE TABLE system_meta (
  id SERIAL PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 2,
  wo_counter INTEGER NOT NULL DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Categories
CREATE INDEX idx_categories_track ON categories(track);
CREATE INDEX idx_categories_active ON categories(active) WHERE active = true;

-- Items
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_active ON items(active) WHERE active = true;
CREATE INDEX idx_items_frequency ON items(frequency);

-- Work Orders
CREATE INDEX idx_work_orders_building ON work_orders(building_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_priority ON work_orders(priority);
CREATE INDEX idx_work_orders_date ON work_orders(date);
CREATE INDEX idx_work_orders_created ON work_orders(created_at);

-- Inspections
CREATE INDEX idx_inspections_building ON inspections(building_id);
CREATE INDEX idx_inspections_date ON inspections(date);
CREATE INDEX idx_inspections_work_order ON inspections(work_order_id);

-- Personnel
CREATE INDEX idx_personnel_active ON personnel(active) WHERE active = true;
CREATE INDEX idx_personnel_role ON personnel(role);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_meta ENABLE ROW LEVEL SECURITY;

-- Public read access for catalog data (no auth yet)
CREATE POLICY "Public read access to categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public read access to items" ON items
  FOR SELECT USING (true);

CREATE POLICY "Public read access to buildings" ON buildings
  FOR SELECT USING (true);

CREATE POLICY "Public read access to vendors" ON vendors
  FOR SELECT USING (true);

CREATE POLICY "Public read access to budget" ON budget
  FOR SELECT USING (true);

CREATE POLICY "Public read access to personnel" ON personnel
  FOR SELECT USING (true);

-- Public read/write access for work orders and inspections
CREATE POLICY "Public read access to work orders" ON work_orders
  FOR SELECT USING (true);

CREATE POLICY "Public insert access to work orders" ON work_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access to work orders" ON work_orders
  FOR UPDATE USING (true);

CREATE POLICY "Public read access to inspections" ON inspections
  FOR SELECT USING (true);

CREATE POLICY "Public insert access to inspections" ON inspections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access to inspections" ON inspections
  FOR UPDATE USING (true);

-- Public read/write access to user preferences
CREATE POLICY "Public read access to user_preferences" ON user_preferences
  FOR SELECT USING (true);

CREATE POLICY "Public insert access to user_preferences" ON user_preferences
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access to user_preferences" ON user_preferences
  FOR UPDATE USING (true);

-- Public read/write access to system meta
CREATE POLICY "Public read access to system_meta" ON system_meta
  FOR SELECT USING (true);

CREATE POLICY "Public update access to system_meta" ON system_meta
  FOR UPDATE USING (true);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_updated_at BEFORE UPDATE ON budget
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON personnel
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- INITIAL SYSTEM META
-- ============================================================

INSERT INTO system_meta (schema_version, wo_counter) VALUES (2, 0);

-- ============================================================
-- INITIAL USER PREFERENCES
-- ============================================================

INSERT INTO user_preferences (user_id, active_track, preferences) 
VALUES ('default', 'safety_legal', '{}');