-- 007_central_admin_security.sql
-- Central Admin security hardening for the Mahidol Lampang platform.
-- Portal is the administrative entry point; Facility-Safety remains the domain API/UI.
-- Never expose service-role credentials to browser clients.

-- ------------------------------------------------------------------
-- 1) Remove permissive write policies introduced by legacy/unified setup.
-- ------------------------------------------------------------------
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'assets', 'fuel_vehicles', 'fuel_mower_inventory', 'fuel_trips',
        'fuel_refuel_logs', 'fuel_plans', 'audit_logs'
      )
      AND (
        policyname LIKE '%write%'
        OR policyname LIKE '%insert%'
        OR policyname LIKE '%update%'
        OR policyname LIKE '%delete%'
        OR policyname LIKE '%all%'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;

-- ------------------------------------------------------------------
-- 2) Asset master data: authenticated staff can read; managers write.
-- ------------------------------------------------------------------
DROP POLICY IF EXISTS assets_read ON public.assets;
DROP POLICY IF EXISTS assets_manager_write ON public.assets;
CREATE POLICY assets_read ON public.assets
  FOR SELECT TO authenticated USING (true);
CREATE POLICY assets_manager_write ON public.assets
  FOR ALL TO authenticated
  USING (public.is_manager())
  WITH CHECK (public.is_manager());

DROP POLICY IF EXISTS fuel_vehicles_read ON public.fuel_vehicles;
DROP POLICY IF EXISTS fuel_vehicles_manager_write ON public.fuel_vehicles;
CREATE POLICY fuel_vehicles_read ON public.fuel_vehicles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY fuel_vehicles_manager_write ON public.fuel_vehicles
  FOR ALL TO authenticated
  USING (public.is_manager())
  WITH CHECK (public.is_manager());

-- ------------------------------------------------------------------
-- 3) Operational fuel records: staff may create records, but cannot
--    rewrite/delete history. Managers retain full control.
-- ------------------------------------------------------------------
DROP POLICY IF EXISTS fuel_mower_read ON public.fuel_mower_inventory;
DROP POLICY IF EXISTS fuel_mower_insert ON public.fuel_mower_inventory;
DROP POLICY IF EXISTS fuel_mower_manager_write ON public.fuel_mower_inventory;
CREATE POLICY fuel_mower_read ON public.fuel_mower_inventory
  FOR SELECT TO authenticated USING (true);
CREATE POLICY fuel_mower_insert ON public.fuel_mower_inventory
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY fuel_mower_manager_write ON public.fuel_mower_inventory
  FOR UPDATE TO authenticated
  USING (public.is_manager())
  WITH CHECK (public.is_manager());
CREATE POLICY fuel_mower_manager_delete ON public.fuel_mower_inventory
  FOR DELETE TO authenticated USING (public.is_manager());

DROP POLICY IF EXISTS fuel_trips_read ON public.fuel_trips;
DROP POLICY IF EXISTS fuel_trips_insert ON public.fuel_trips;
DROP POLICY IF EXISTS fuel_trips_manager_write ON public.fuel_trips;
CREATE POLICY fuel_trips_read ON public.fuel_trips
  FOR SELECT TO authenticated USING (true);
CREATE POLICY fuel_trips_insert ON public.fuel_trips
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY fuel_trips_manager_write ON public.fuel_trips
  FOR UPDATE TO authenticated
  USING (public.is_manager())
  WITH CHECK (public.is_manager());
CREATE POLICY fuel_trips_manager_delete ON public.fuel_trips
  FOR DELETE TO authenticated USING (public.is_manager());

DROP POLICY IF EXISTS fuel_refuel_read ON public.fuel_refuel_logs;
DROP POLICY IF EXISTS fuel_refuel_insert ON public.fuel_refuel_logs;
DROP POLICY IF EXISTS fuel_refuel_manager_write ON public.fuel_refuel_logs;
CREATE POLICY fuel_refuel_read ON public.fuel_refuel_logs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY fuel_refuel_insert ON public.fuel_refuel_logs
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY fuel_refuel_manager_write ON public.fuel_refuel_logs
  FOR UPDATE TO authenticated
  USING (public.is_manager())
  WITH CHECK (public.is_manager());
CREATE POLICY fuel_refuel_manager_delete ON public.fuel_refuel_logs
  FOR DELETE TO authenticated USING (public.is_manager());

DROP POLICY IF EXISTS fuel_plans_read ON public.fuel_plans;
DROP POLICY IF EXISTS fuel_plans_manager_write ON public.fuel_plans;
CREATE POLICY fuel_plans_read ON public.fuel_plans
  FOR SELECT TO authenticated USING (true);
CREATE POLICY fuel_plans_manager_write ON public.fuel_plans
  FOR ALL TO authenticated
  USING (public.is_manager())
  WITH CHECK (public.is_manager());

-- ------------------------------------------------------------------
-- 4) Audit trail is append-only by database triggers/functions.
--    Clients cannot inject or edit audit history directly.
-- ------------------------------------------------------------------
DROP POLICY IF EXISTS audit_logs_read ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_insert ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_admin_read ON public.audit_logs;
CREATE POLICY audit_logs_admin_read ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_manager());
REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM anon, authenticated;

-- ------------------------------------------------------------------
-- 5) Cross-system linkage registry. This is metadata only: it does not
--    copy operational data between applications and avoids dual writes.
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_key TEXT NOT NULL UNIQUE,
  system_name TEXT NOT NULL,
  system_type TEXT NOT NULL,
  base_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','maintenance','disabled')),
  owner_domain TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.system_registry ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS system_registry_read ON public.system_registry;
DROP POLICY IF EXISTS system_registry_manager_write ON public.system_registry;
CREATE POLICY system_registry_read ON public.system_registry
  FOR SELECT TO authenticated USING (true);
CREATE POLICY system_registry_manager_write ON public.system_registry
  FOR ALL TO authenticated
  USING (public.is_manager())
  WITH CHECK (public.is_manager());

INSERT INTO public.system_registry(system_key, system_name, system_type, owner_domain)
VALUES
  ('portal', 'Mahidol Lampang Portal', 'portal', 'central-admin'),
  ('facility-safety', 'Facility & Safety Management System', 'facility-safety', 'engineering-safety'),
  ('lac-learning', 'Lac Learning Game', 'learning', 'learning-center'),
  ('smart-farm', 'Smart Farm IoT', 'iot', 'smart-farm'),
  ('clean-energy', 'Clean Energy / EV', 'energy', 'clean-energy')
ON CONFLICT (system_key) DO UPDATE SET
  system_name = EXCLUDED.system_name,
  system_type = EXCLUDED.system_type,
  owner_domain = EXCLUDED.owner_domain,
  updated_at = NOW();

CREATE INDEX IF NOT EXISTS idx_system_registry_status ON public.system_registry(status);
