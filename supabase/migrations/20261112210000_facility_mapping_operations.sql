-- Facility Mapping operational schema: maintenance plans, typed checklists,
-- assigned inspectors, inspection records, review notes, and private photo evidence.
-- This migration is committed for review; it has NOT been applied to production.

ALTER TABLE public.buildings
  ADD COLUMN IF NOT EXISTS building_type TEXT;

CREATE TABLE IF NOT EXISTS public.facility_fiscal_year_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year INTEGER NOT NULL,
  title TEXT NOT NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  source_workbook TEXT,
  source_sheet TEXT,
  source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  copied_from_plan_id UUID REFERENCES public.facility_fiscal_year_plans(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (fiscal_year, title),
  CHECK (ends_on > starts_on)
);

CREATE TABLE IF NOT EXISTS public.facility_maintenance_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.facility_fiscal_year_plans(id) ON DELETE CASCADE,
  source_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (plan_id, source_number)
);

CREATE TABLE IF NOT EXISTS public.facility_maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.facility_maintenance_groups(id) ON DELETE CASCADE,
  source_row INTEGER,
  description TEXT NOT NULL,
  frequency_text TEXT,
  planned_weeks TEXT[] NOT NULL DEFAULT '{}',
  source_note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.facility_maintenance_task_buildings (
  task_id UUID NOT NULL REFERENCES public.facility_maintenance_tasks(id) ON DELETE CASCADE,
  building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, building_id)
);
CREATE INDEX IF NOT EXISTS facility_maintenance_tasks_group_idx
  ON public.facility_maintenance_tasks(group_id);
CREATE INDEX IF NOT EXISTS facility_maintenance_task_buildings_building_idx
  ON public.facility_maintenance_task_buildings(building_id);

CREATE TABLE IF NOT EXISTS public.facility_checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_type TEXT NOT NULL,
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (building_type, version)
);

CREATE UNIQUE INDEX IF NOT EXISTS facility_checklist_templates_one_active_idx
  ON public.facility_checklist_templates(building_type) WHERE is_active;

CREATE TABLE IF NOT EXISTS public.facility_checklist_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.facility_checklist_templates(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  requires_photo_on_pass BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS facility_checklist_items_template_idx
  ON public.facility_checklist_template_items(template_id, sort_order);

CREATE TABLE IF NOT EXISTS public.facility_building_inspector_assignments (
  building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (building_id, user_id)
);
CREATE INDEX IF NOT EXISTS facility_inspector_assignments_user_idx
  ON public.facility_building_inspector_assignments(user_id);

CREATE TABLE IF NOT EXISTS public.facility_inspection_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE RESTRICT,
  template_id UUID NOT NULL REFERENCES public.facility_checklist_templates(id) ON DELETE RESTRICT,
  template_version INTEGER NOT NULL,
  inspector_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'reviewed')),
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  risk_assessment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS facility_inspection_records_building_date_idx
  ON public.facility_inspection_records(building_id, inspection_date DESC);
CREATE INDEX IF NOT EXISTS facility_inspection_records_inspector_idx
  ON public.facility_inspection_records(inspector_id);

CREATE TABLE IF NOT EXISTS public.facility_inspection_item_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.facility_inspection_records(id) ON DELETE CASCADE,
  template_item_id UUID NOT NULL REFERENCES public.facility_checklist_template_items(id) ON DELETE RESTRICT,
  result TEXT NOT NULL CHECK (result IN ('pass', 'fail')),
  remark TEXT,
  evidence_paths TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (inspection_id, template_item_id),
  CHECK (cardinality(evidence_paths) <= 2),
  CHECK (
    result <> 'fail'
    OR (length(btrim(coalesce(remark, ''))) > 0 AND cardinality(evidence_paths) BETWEEN 1 AND 2)
  )
);
CREATE INDEX IF NOT EXISTS facility_inspection_item_results_inspection_idx
  ON public.facility_inspection_item_results(inspection_id);

-- Central role claims remain distinct. Content/Operations admins do not become
-- Facility Admin unless their central role explicitly grants it.
CREATE OR REPLACE FUNCTION public.facility_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT lower(coalesce(
    (
      SELECT CASE
        WHEN sp.central_role IN ('SUPER_ADMIN', 'FACILITY_ADMIN', 'CONTENT_ADMIN', 'OPERATIONS_ADMIN') THEN sp.central_role
        ELSE sp.role
      END
      FROM public.staff_profiles sp
      WHERE sp.user_id = auth.uid() AND sp.active IS DISTINCT FROM false
      LIMIT 1
    ),
    (
      SELECT sp.central_role
      FROM public.staff_profiles sp
      WHERE sp.user_id = auth.uid() AND sp.active IS DISTINCT FROM false
      LIMIT 1
    ),
    public.app_role()
  ));
$$;

CREATE OR REPLACE FUNCTION public.facility_is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT public.facility_user_role() IN (
    'super_admin', 'facility_admin', 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.facility_is_safety_officer()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT public.facility_user_role() IN (
    'safety_officer', 'safety officer',
    'super_admin', 'facility_admin', 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.facility_can_inspect_building(target_building_id TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT public.facility_is_admin()
    OR (
      public.facility_user_role() IN ('building_inspector', 'building inspector', 'inspector')
      AND EXISTS (
        SELECT 1
        FROM public.facility_building_inspector_assignments a
        WHERE a.building_id = target_building_id AND a.user_id = auth.uid()
      )
    );
$$;

-- Once a template is active or has inspection history, its items cannot be
-- changed. Admins must create a new version so old inspections stay meaningful.
CREATE OR REPLACE FUNCTION public.guard_facility_checklist_template_item_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_template_id UUID;
  template_active BOOLEAN;
  template_used BOOLEAN;
BEGIN
  target_template_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.template_id ELSE NEW.template_id END;
  SELECT t.is_active,
         EXISTS (SELECT 1 FROM public.facility_inspection_records i WHERE i.template_id = t.id)
    INTO template_active, template_used
  FROM public.facility_checklist_templates t
  WHERE t.id = target_template_id;

  IF coalesce(template_active, false) OR coalesce(template_used, false) THEN
    RAISE EXCEPTION 'Checklist versions are immutable once activated or used; create a new version instead';
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS facility_checklist_template_items_immutable
  ON public.facility_checklist_template_items;
CREATE TRIGGER facility_checklist_template_items_immutable
  BEFORE INSERT OR UPDATE OR DELETE ON public.facility_checklist_template_items
  FOR EACH ROW EXECUTE FUNCTION public.guard_facility_checklist_template_item_changes();

CREATE OR REPLACE FUNCTION public.guard_facility_checklist_template_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.is_active AND NOT OLD.is_active
     AND NOT EXISTS (
       SELECT 1 FROM public.facility_checklist_template_items i WHERE i.template_id = NEW.id
     ) THEN
    RAISE EXCEPTION 'A checklist template must contain at least one item before activation';
  END IF;

  IF TG_OP = 'UPDATE' AND (
    EXISTS (SELECT 1 FROM public.facility_inspection_records i WHERE i.template_id = OLD.id)
    OR OLD.is_active
  ) AND (
    NEW.building_type IS DISTINCT FROM OLD.building_type
    OR NEW.name IS DISTINCT FROM OLD.name
    OR NEW.version IS DISTINCT FROM OLD.version
  ) THEN
    RAISE EXCEPTION 'A checklist version cannot be renamed or changed after activation/use; create a new version';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS facility_checklist_templates_immutable
  ON public.facility_checklist_templates;
CREATE TRIGGER facility_checklist_templates_immutable
  BEFORE UPDATE ON public.facility_checklist_templates
  FOR EACH ROW EXECUTE FUNCTION public.guard_facility_checklist_template_changes();

CREATE OR REPLACE FUNCTION public.validate_facility_inspection_record()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  building_type_value TEXT;
  template_type_value TEXT;
  template_version_value INTEGER;
  template_active_value BOOLEAN;
  expected_items INTEGER;
  saved_items INTEGER;
BEGIN
  SELECT building_type INTO building_type_value
  FROM public.buildings WHERE id = NEW.building_id;
  SELECT building_type, version, is_active
    INTO template_type_value, template_version_value, template_active_value
  FROM public.facility_checklist_templates WHERE id = NEW.template_id;

  IF building_type_value IS NULL OR template_type_value IS DISTINCT FROM building_type_value THEN
    RAISE EXCEPTION 'The selected checklist template does not match the building type';
  END IF;
  IF TG_OP = 'INSERT' AND NOT coalesce(template_active_value, false) THEN
    RAISE EXCEPTION 'Only an active checklist template can be used for a new inspection';
  END IF;
  IF template_version_value IS DISTINCT FROM NEW.template_version THEN
    RAISE EXCEPTION 'The inspection template version does not match the selected template';
  END IF;

  IF NEW.status = 'submitted' THEN
    SELECT count(*) INTO expected_items
    FROM public.facility_checklist_template_items WHERE template_id = NEW.template_id;
    SELECT count(*) INTO saved_items
    FROM public.facility_inspection_item_results WHERE inspection_id = NEW.id;
    IF expected_items = 0 OR saved_items <> expected_items THEN
      RAISE EXCEPTION 'Every checklist item must have a result before submission';
    END IF;
  END IF;

  IF TG_OP = 'INSERT' AND (
    NEW.status <> 'draft' OR NEW.reviewer_id IS NOT NULL OR NEW.reviewed_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'A new inspection must start as a draft without reviewer fields';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status <> 'draft' THEN
    IF NOT public.facility_is_safety_officer() THEN
      RAISE EXCEPTION 'Submitted inspections can only be changed by a Safety Officer';
    END IF;
    IF NEW.building_id IS DISTINCT FROM OLD.building_id
       OR NEW.template_id IS DISTINCT FROM OLD.template_id
       OR NEW.template_version IS DISTINCT FROM OLD.template_version
       OR NEW.inspector_id IS DISTINCT FROM OLD.inspector_id
       OR NEW.inspection_date IS DISTINCT FROM OLD.inspection_date THEN
      RAISE EXCEPTION 'Inspection identity and checklist fields are immutable after submission';
    END IF;
    IF OLD.status = 'reviewed' AND NEW.status <> 'reviewed' THEN
      RAISE EXCEPTION 'A reviewed inspection cannot be reopened by editing its review';
    END IF;
  END IF;

  IF NEW.status = 'reviewed' THEN
    IF NOT public.facility_is_safety_officer()
       OR NEW.reviewer_id IS DISTINCT FROM auth.uid()
       OR NEW.reviewed_at IS NULL THEN
      RAISE EXCEPTION 'Only the acting Safety Officer may complete an inspection review';
    END IF;
  ELSIF NEW.reviewer_id IS NOT NULL OR NEW.reviewed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Reviewer fields are only allowed after review';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS facility_inspection_record_validate
  ON public.facility_inspection_records;
CREATE TRIGGER facility_inspection_record_validate
  BEFORE INSERT OR UPDATE ON public.facility_inspection_records
  FOR EACH ROW EXECUTE FUNCTION public.validate_facility_inspection_record();

-- Validate the remark, evidence count, checklist/template relationship, and
-- existence/MIME type of every private Storage object on every item write.
CREATE OR REPLACE FUNCTION public.validate_facility_inspection_item_result()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  parent_inspection public.facility_inspection_records%ROWTYPE;
  expected_template_id UUID;
  evidence_path TEXT;
  evidence_mime TEXT;
BEGIN
  SELECT * INTO parent_inspection
  FROM public.facility_inspection_records
  WHERE id = NEW.inspection_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inspection record not found';
  END IF;

  SELECT template_id INTO expected_template_id
  FROM public.facility_checklist_template_items
  WHERE id = NEW.template_item_id;

  IF expected_template_id IS NULL OR expected_template_id <> parent_inspection.template_id THEN
    RAISE EXCEPTION 'Checklist item does not belong to the inspection template';
  END IF;

  IF NEW.result = 'fail' AND length(btrim(coalesce(NEW.remark, ''))) = 0 THEN
    RAISE EXCEPTION 'A problem description is required for failed items';
  END IF;

  IF cardinality(NEW.evidence_paths) > 2
     OR (NEW.result = 'fail' AND cardinality(NEW.evidence_paths) < 1) THEN
    RAISE EXCEPTION 'Failed items require one or two photo evidence files';
  END IF;

  IF cardinality(NEW.evidence_paths) <> (
    SELECT count(DISTINCT evidence_value) FROM unnest(NEW.evidence_paths) AS evidence_value
  ) THEN
    RAISE EXCEPTION 'Duplicate evidence files are not allowed';
  END IF;

  FOREACH evidence_path IN ARRAY NEW.evidence_paths LOOP
    IF evidence_path !~ (
      '^' || NEW.inspection_id::text || '/' || NEW.template_item_id::text || '/[^/]+$'
    ) THEN
      RAISE EXCEPTION 'Invalid evidence file path';
    END IF;

    SELECT metadata->>'mimetype' INTO evidence_mime
    FROM storage.objects
    WHERE bucket_id = 'facility-inspection-evidence' AND name = evidence_path;

    IF evidence_mime IS NULL OR evidence_mime NOT IN ('image/jpeg', 'image/png', 'image/webp') THEN
      RAISE EXCEPTION 'Evidence file is missing or is not an allowed image type';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS facility_inspection_item_result_validate
  ON public.facility_inspection_item_results;
CREATE TRIGGER facility_inspection_item_result_validate
  BEFORE INSERT OR UPDATE ON public.facility_inspection_item_results
  FOR EACH ROW EXECUTE FUNCTION public.validate_facility_inspection_item_result();

ALTER TABLE public.facility_fiscal_year_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_maintenance_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_maintenance_task_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_checklist_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_building_inspector_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_inspection_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_inspection_item_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY facility_plans_read ON public.facility_fiscal_year_plans
  FOR SELECT TO authenticated USING (true);
CREATE POLICY facility_plans_manage ON public.facility_fiscal_year_plans
  FOR ALL TO authenticated USING (public.facility_is_admin())
  WITH CHECK (public.facility_is_admin());

CREATE POLICY facility_maintenance_groups_read ON public.facility_maintenance_groups
  FOR SELECT TO authenticated USING (true);
CREATE POLICY facility_maintenance_groups_manage ON public.facility_maintenance_groups
  FOR ALL TO authenticated USING (public.facility_is_admin())
  WITH CHECK (public.facility_is_admin());

CREATE POLICY facility_maintenance_tasks_read ON public.facility_maintenance_tasks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY facility_maintenance_tasks_manage ON public.facility_maintenance_tasks
  FOR ALL TO authenticated USING (public.facility_is_admin())
  WITH CHECK (public.facility_is_admin());

CREATE POLICY facility_task_buildings_read ON public.facility_maintenance_task_buildings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY facility_task_buildings_manage ON public.facility_maintenance_task_buildings
  FOR ALL TO authenticated USING (public.facility_is_admin())
  WITH CHECK (public.facility_is_admin());

CREATE POLICY facility_checklist_templates_read ON public.facility_checklist_templates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY facility_checklist_templates_manage ON public.facility_checklist_templates
  FOR ALL TO authenticated USING (public.facility_is_admin())
  WITH CHECK (public.facility_is_admin());

CREATE POLICY facility_checklist_items_read ON public.facility_checklist_template_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY facility_checklist_items_manage ON public.facility_checklist_template_items
  FOR ALL TO authenticated USING (public.facility_is_admin())
  WITH CHECK (public.facility_is_admin());

-- Facility Admin needs a directory view to assign eligible inspectors. Ordinary
-- users retain the existing own-profile-only visibility.
CREATE POLICY facility_admin_read_staff_profiles ON public.staff_profiles
  FOR SELECT TO authenticated USING (public.facility_is_admin());

CREATE POLICY facility_assignments_read ON public.facility_building_inspector_assignments
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR public.facility_is_admin() OR public.facility_is_safety_officer()
  );
CREATE POLICY facility_assignments_manage ON public.facility_building_inspector_assignments
  FOR ALL TO authenticated USING (public.facility_is_admin())
  WITH CHECK (public.facility_is_admin());

CREATE POLICY facility_inspections_read ON public.facility_inspection_records
  FOR SELECT TO authenticated USING (
    inspector_id = auth.uid() OR public.facility_is_safety_officer()
    OR public.facility_can_inspect_building(building_id)
  );
CREATE POLICY facility_inspections_insert ON public.facility_inspection_records
  FOR INSERT TO authenticated WITH CHECK (
    inspector_id = auth.uid() AND public.facility_can_inspect_building(building_id)
  );
CREATE POLICY facility_inspections_update ON public.facility_inspection_records
  FOR UPDATE TO authenticated USING (
    (inspector_id = auth.uid() AND status = 'draft' AND public.facility_can_inspect_building(building_id))
    OR (public.facility_is_safety_officer() AND status IN ('submitted', 'reviewed'))
  ) WITH CHECK (
    (inspector_id = auth.uid() AND public.facility_can_inspect_building(building_id))
    OR (public.facility_is_safety_officer() AND status IN ('submitted', 'reviewed'))
  );

CREATE POLICY facility_inspection_results_read ON public.facility_inspection_item_results
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.facility_inspection_records i
      WHERE i.id = inspection_id AND (
        i.inspector_id = auth.uid() OR public.facility_is_safety_officer()
        OR public.facility_can_inspect_building(i.building_id)
      )
    )
  );
CREATE POLICY facility_inspection_results_write ON public.facility_inspection_item_results
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.facility_inspection_records i
      WHERE i.id = inspection_id AND i.inspector_id = auth.uid()
        AND i.status = 'draft' AND public.facility_can_inspect_building(i.building_id)
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.facility_inspection_records i
      WHERE i.id = inspection_id AND i.inspector_id = auth.uid()
        AND i.status = 'draft' AND public.facility_can_inspect_building(i.building_id)
    )
  );

-- Evidence is private; object paths are <inspection_uuid>/<template_item_uuid>/<file>.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'facility-inspection-evidence',
  'facility-inspection-evidence',
  false,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp'];

CREATE POLICY facility_evidence_read ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'facility-inspection-evidence'
    AND EXISTS (
      SELECT 1 FROM public.facility_inspection_records i
      WHERE i.id::text = (storage.foldername(name))[1]
        AND (
          i.inspector_id = auth.uid()
          OR public.facility_is_safety_officer()
          OR public.facility_can_inspect_building(i.building_id)
        )
    )
  );

CREATE POLICY facility_evidence_insert ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'facility-inspection-evidence'
    AND lower(coalesce(metadata->>'mimetype','')) IN ('image/jpeg','image/png','image/webp')
    AND EXISTS (
      SELECT 1 FROM public.facility_inspection_records i
      WHERE i.id::text = (storage.foldername(name))[1]
        AND i.inspector_id = auth.uid()
        AND i.status = 'draft'
        AND public.facility_can_inspect_building(i.building_id)
    )
  );

CREATE POLICY facility_evidence_delete ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'facility-inspection-evidence'
    AND EXISTS (
      SELECT 1 FROM public.facility_inspection_records i
      WHERE i.id::text = (storage.foldername(name))[1]
        AND i.inspector_id = auth.uid()
        AND i.status = 'draft'
        AND public.facility_can_inspect_building(i.building_id)
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.facility_fiscal_year_plans,
  public.facility_maintenance_groups,
  public.facility_maintenance_tasks,
  public.facility_maintenance_task_buildings,
  public.facility_checklist_templates,
  public.facility_checklist_template_items,
  public.facility_building_inspector_assignments,
  public.facility_inspection_records,
  public.facility_inspection_item_results
TO authenticated;

COMMENT ON TABLE public.facility_maintenance_tasks IS
  'Planning-only tasks imported from the FY2570 workbook. No automatic inspection or work-order creation.';
COMMENT ON COLUMN public.facility_maintenance_tasks.planned_weeks IS
  'Source orange-fill markers in M-W format, e.g. 10-W1. Frequency text is retained separately.';
COMMENT ON TABLE public.facility_inspection_item_results IS
  'Binary Pass/Fail results. Fail requires nonblank remark and 1-2 private image evidence paths.';
