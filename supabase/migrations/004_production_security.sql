-- Production security hardening. Run after 003_supabase_auth_profiles.sql.
-- This migration intentionally removes the legacy personnel PIN column.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.personnel DROP COLUMN IF EXISTS pin;
ALTER TABLE public.personnel ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE TABLE IF NOT EXISTS public.staff_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  personnel_id TEXT UNIQUE REFERENCES public.personnel(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  position TEXT,
  department TEXT,
  role TEXT NOT NULL DEFAULT 'staff',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_profiles_own_read ON public.staff_profiles;
CREATE POLICY staff_profiles_own_read ON public.staff_profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_work_orders_version ON public.work_orders(id, version);

-- Authoritative, transaction-safe counter. It uses a row lock, so two devices
-- can never receive the same number.
INSERT INTO public.system_meta (id, schema_version, wo_counter)
VALUES (1, 4, 0)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.reserve_work_order_number(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(counter INTEGER, work_order_number TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE next_counter INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  SELECT wo_counter + 1 INTO next_counter FROM public.system_meta WHERE id = 1 FOR UPDATE;
  UPDATE public.system_meta SET wo_counter = next_counter, last_sync_at = NOW(), updated_at = NOW() WHERE id = 1;
  RETURN QUERY SELECT next_counter,
    format('WO-%s%s-%s', extract(year FROM p_date)::INTEGER + 543,
      lpad(extract(month FROM p_date)::INTEGER::TEXT, 2, '0'),
      lpad(next_counter::TEXT, 4, '0'));
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_work_order_number(DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_work_order_number(DATE) TO authenticated;

-- Role lookup is SECURITY DEFINER to avoid RLS recursion on staff_profiles.
CREATE OR REPLACE FUNCTION public.app_role()
RETURNS TEXT LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT role FROM public.staff_profiles WHERE user_id = auth.uid() AND active), 'staff');
$$;
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.app_role() IN ('admin', 'dean', 'deputy_dean', 'finance_head', 'section_head');
$$;

-- Remove permissive anonymous policies from sensitive tables.
DO $$ DECLARE policy_record RECORD; BEGIN
  FOR policy_record IN SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('work_orders','inspections','personnel','user_preferences','system_meta')
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policyname, policy_record.tablename); END LOOP;
END $$;

CREATE POLICY work_orders_read ON public.work_orders FOR SELECT TO authenticated
  USING (public.is_manager() OR created_by = auth.uid() OR updated_by = auth.uid());
CREATE POLICY work_orders_insert ON public.work_orders FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() OR public.is_manager());
CREATE POLICY work_orders_update ON public.work_orders FOR UPDATE TO authenticated
  USING (public.is_manager() OR created_by = auth.uid())
  WITH CHECK (public.is_manager() OR created_by = auth.uid());

CREATE POLICY inspections_read ON public.inspections FOR SELECT TO authenticated
  USING (public.is_manager() OR created_by = auth.uid() OR updated_by = auth.uid());
CREATE POLICY inspections_insert ON public.inspections FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() OR public.is_manager());
CREATE POLICY inspections_update ON public.inspections FOR UPDATE TO authenticated
  USING (public.is_manager() OR created_by = auth.uid())
  WITH CHECK (public.is_manager() OR created_by = auth.uid());

CREATE POLICY personnel_read ON public.personnel FOR SELECT TO authenticated
  USING (public.is_manager() OR auth_user_id = auth.uid());
CREATE POLICY personnel_write ON public.personnel FOR ALL TO authenticated
  USING (public.is_manager()) WITH CHECK (public.is_manager());
CREATE POLICY preferences_own ON public.user_preferences FOR ALL TO authenticated
  USING (user_id = auth.uid()::TEXT OR public.is_manager())
  WITH CHECK (user_id = auth.uid()::TEXT OR public.is_manager());
CREATE POLICY system_meta_read ON public.system_meta FOR SELECT TO authenticated USING (true);
CREATE POLICY system_meta_admin_update ON public.system_meta FOR UPDATE TO authenticated
  USING (public.is_manager()) WITH CHECK (public.is_manager());

-- Catalog is readable to logged-in staff; only managers can change master data.
DO $$ DECLARE t TEXT; policy_record RECORD; BEGIN
  FOR policy_record IN SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('categories','items','buildings','vendors','budget')
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policyname, policy_record.tablename); END LOOP;
  FOREACH t IN ARRAY ARRAY['categories','items','buildings','vendors','budget'] LOOP
    EXECUTE format('CREATE POLICY catalog_read_%s ON public.%I FOR SELECT TO authenticated USING (true)', t, t);
    EXECUTE format('CREATE POLICY catalog_write_%s ON public.%I FOR ALL TO authenticated USING (public.is_manager()) WITH CHECK (public.is_manager())', t, t);
  END LOOP;
END $$;

-- Immutable audit trail for compliance.
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_hint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON public.audit_logs(table_name, record_id);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_logs_admin_read ON public.audit_logs;
CREATE POLICY audit_logs_admin_read ON public.audit_logs FOR SELECT TO authenticated USING (public.is_manager());

CREATE OR REPLACE FUNCTION public.write_audit_log()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.audit_logs(actor_id, action, table_name, record_id, old_data, new_data)
  VALUES (auth.uid(), TG_OP, TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT), to_jsonb(OLD), to_jsonb(NEW));
  RETURN COALESCE(NEW, OLD);
END;
$$;
DROP TRIGGER IF EXISTS audit_work_orders ON public.work_orders;
CREATE TRIGGER audit_work_orders AFTER INSERT OR UPDATE OR DELETE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
DROP TRIGGER IF EXISTS audit_inspections ON public.inspections;
CREATE TRIGGER audit_inspections AFTER INSERT OR UPDATE OR DELETE ON public.inspections FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
DROP TRIGGER IF EXISTS audit_personnel ON public.personnel;
CREATE TRIGGER audit_personnel AFTER INSERT OR UPDATE OR DELETE ON public.personnel FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['categories','items','buildings','vendors','budget'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS audit_%s ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER audit_%s AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.write_audit_log()', t, t);
  END LOOP;
END $$;

-- Notification delivery queue. An Edge Function/worker can claim these jobs;
-- failed jobs become retryable with exponential backoff.
CREATE TABLE IF NOT EXISTS public.notification_jobs (
  id BIGSERIAL PRIMARY KEY,
  event_key TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL DEFAULT 'work_order',
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','sent','failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_retry ON public.notification_jobs(status, next_attempt_at);
ALTER TABLE public.notification_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_admin_read ON public.notification_jobs FOR SELECT TO authenticated USING (public.is_manager());

CREATE OR REPLACE FUNCTION public.claim_notification_jobs(p_limit INTEGER DEFAULT 20)
RETURNS SETOF public.notification_jobs
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_manager() THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  UPDATE public.notification_jobs
    SET status = 'processing', attempts = attempts + 1
    WHERE id IN (
      SELECT id FROM public.notification_jobs
      WHERE status IN ('pending','failed') AND next_attempt_at <= NOW()
      ORDER BY next_attempt_at LIMIT p_limit FOR UPDATE SKIP LOCKED
    )
  RETURNING *;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_notification_jobs(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_notification_jobs(INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_notification_job(p_job_id BIGINT, p_error TEXT DEFAULT NULL)
RETURNS public.notification_jobs LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result_row public.notification_jobs;
BEGIN
  IF NOT public.is_manager() THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF p_error IS NULL THEN
    UPDATE public.notification_jobs SET status = 'sent', sent_at = NOW(), last_error = NULL WHERE id = p_job_id RETURNING * INTO result_row;
  ELSE
    UPDATE public.notification_jobs SET status = 'failed', last_error = p_error,
      next_attempt_at = NOW() + LEAST(INTERVAL '30 minutes', (2 ^ LEAST(attempts, 10)) * INTERVAL '1 second')
      WHERE id = p_job_id RETURNING * INTO result_row;
  END IF;
  RETURN result_row;
END;
$$;
REVOKE ALL ON FUNCTION public.complete_notification_job(BIGINT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_notification_job(BIGINT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.enqueue_work_order_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.notification_jobs(event_key, payload)
    VALUES (NEW.id::TEXT || ':' || NEW.status::TEXT,
      jsonb_build_object('workOrderId', NEW.id, 'number', NEW.number, 'status', NEW.status, 'title', NEW.title))
    ON CONFLICT (event_key) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS notify_work_order_change ON public.work_orders;
CREATE TRIGGER notify_work_order_change AFTER INSERT OR UPDATE OF status ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.enqueue_work_order_notification();

CREATE OR REPLACE FUNCTION public.retry_notification_job(p_job_id BIGINT)
RETURNS public.notification_jobs LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result_row public.notification_jobs;
BEGIN
  IF NOT public.is_manager() THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.notification_jobs SET status = 'pending', attempts = attempts + 1,
    next_attempt_at = NOW() + LEAST(INTERVAL '30 minutes', (2 ^ LEAST(attempts, 10)) * INTERVAL '1 second')
    WHERE id = p_job_id RETURNING * INTO result_row;
  RETURN result_row;
END;
$$;
REVOKE ALL ON FUNCTION public.retry_notification_job(BIGINT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.retry_notification_job(BIGINT) TO authenticated;
