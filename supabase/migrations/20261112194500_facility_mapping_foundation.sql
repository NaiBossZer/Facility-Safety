-- Facility Mapping foundation for the existing campus GLB.
-- Coordinates are model-local (x, y, z), not GPS. No geometry or building
-- records are fabricated; real anchors are added only after visual verification.

ALTER TABLE public.buildings
  ADD COLUMN IF NOT EXISTS model_node_name TEXT,
  ADD COLUMN IF NOT EXISTS model_node_path TEXT,
  ADD COLUMN IF NOT EXISTS model_anchor JSONB,
  ADD COLUMN IF NOT EXISTS model_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS mapping_status TEXT NOT NULL DEFAULT 'unmapped'
    CHECK (mapping_status IN ('unmapped', 'placed', 'verified', 'needs_review'));

ALTER TABLE public.buildings
  ADD CONSTRAINT buildings_model_anchor_object_check
  CHECK (model_anchor IS NULL OR jsonb_typeof(model_anchor) = 'object');

CREATE TABLE IF NOT EXISTS public.facility_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  parent_area_id UUID REFERENCES public.facility_areas(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  area_type TEXT NOT NULL DEFAULT 'zone'
    CHECK (area_type IN ('campus', 'floor', 'room', 'zone', 'outdoor', 'greenhouse', 'warehouse', 'other')),
  level_label TEXT,
  anchor_position JSONB,
  boundary_geometry JSONB,
  mapping_status TEXT NOT NULL DEFAULT 'unmapped'
    CHECK (mapping_status IN ('unmapped', 'placed', 'verified', 'needs_review')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (building_id, code),
  CHECK (anchor_position IS NULL OR jsonb_typeof(anchor_position) = 'object'),
  CHECK (boundary_geometry IS NULL OR jsonb_typeof(boundary_geometry) IN ('object', 'array'))
);

CREATE INDEX IF NOT EXISTS facility_areas_building_idx
  ON public.facility_areas(building_id);
CREATE INDEX IF NOT EXISTS facility_areas_parent_idx
  ON public.facility_areas(parent_area_id);

CREATE TABLE IF NOT EXISTS public.facility_map_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  area_id UUID REFERENCES public.facility_areas(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  point_type TEXT NOT NULL
    CHECK (point_type IN (
      'fire_extinguisher', 'fire_hose', 'fire_alarm', 'emergency_exit',
      'assembly_point', 'first_aid', 'aed', 'cctv', 'hazard',
      'electrical_panel', 'water_valve', 'sensor', 'access_point', 'other'
    )),
  anchor_position JSONB,
  model_node_name TEXT,
  model_node_path TEXT,
  visibility TEXT NOT NULL DEFAULT 'standard'
    CHECK (visibility IN ('standard', 'restricted')),
  mapping_status TEXT NOT NULL DEFAULT 'unmapped'
    CHECK (mapping_status IN ('unmapped', 'placed', 'verified', 'needs_review')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (building_id, code),
  CHECK (anchor_position IS NULL OR jsonb_typeof(anchor_position) = 'object')
);

CREATE INDEX IF NOT EXISTS facility_map_points_building_idx
  ON public.facility_map_points(building_id);
CREATE INDEX IF NOT EXISTS facility_map_points_area_idx
  ON public.facility_map_points(area_id);
CREATE INDEX IF NOT EXISTS facility_map_points_type_idx
  ON public.facility_map_points(point_type);
CREATE INDEX IF NOT EXISTS facility_map_points_visibility_idx
  ON public.facility_map_points(visibility);

-- Keep the existing assets table intact and allow one asset to be associated
-- with one or more mapped locations when the inventory is ready.
CREATE TABLE IF NOT EXISTS public.facility_asset_locations (
  asset_id TEXT NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  map_point_id UUID NOT NULL REFERENCES public.facility_map_points(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (asset_id, map_point_id)
);

ALTER TABLE public.work_orders
  ADD COLUMN IF NOT EXISTS facility_area_id UUID
    REFERENCES public.facility_areas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS facility_map_point_id UUID
    REFERENCES public.facility_map_points(id) ON DELETE SET NULL;

ALTER TABLE public.inspections
  ADD COLUMN IF NOT EXISTS facility_area_id UUID
    REFERENCES public.facility_areas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS facility_map_point_id UUID
    REFERENCES public.facility_map_points(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS work_orders_facility_area_idx
  ON public.work_orders(facility_area_id);
CREATE INDEX IF NOT EXISTS work_orders_facility_map_point_idx
  ON public.work_orders(facility_map_point_id);
CREATE INDEX IF NOT EXISTS inspections_facility_area_idx
  ON public.inspections(facility_area_id);
CREATE INDEX IF NOT EXISTS inspections_facility_map_point_idx
  ON public.inspections(facility_map_point_id);

ALTER TABLE public.facility_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_map_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_asset_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY facility_areas_read_authenticated
  ON public.facility_areas FOR SELECT TO authenticated
  USING (true);
CREATE POLICY facility_areas_manage
  ON public.facility_areas FOR ALL TO authenticated
  USING (public.is_manager())
  WITH CHECK (public.is_manager());

CREATE POLICY facility_map_points_read_authenticated
  ON public.facility_map_points FOR SELECT TO authenticated
  USING (visibility = 'standard' OR public.is_manager());
CREATE POLICY facility_map_points_manage
  ON public.facility_map_points FOR ALL TO authenticated
  USING (public.is_manager())
  WITH CHECK (public.is_manager());

CREATE POLICY facility_asset_locations_read_authenticated
  ON public.facility_asset_locations FOR SELECT TO authenticated
  USING (public.is_manager());
CREATE POLICY facility_asset_locations_manage
  ON public.facility_asset_locations FOR ALL TO authenticated
  USING (public.is_manager())
  WITH CHECK (public.is_manager());

-- Explicit Data API grants: new public-schema tables are not auto-exposed by
-- default on current Supabase projects. No anon/public access is granted.
GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.facility_areas, public.facility_map_points, public.facility_asset_locations
  TO authenticated;

COMMENT ON TABLE public.facility_areas IS
  'Hierarchical campus areas (floors, rooms, zones, outdoor areas) linked to the existing 3D model.';
COMMENT ON TABLE public.facility_map_points IS
  'Model-local safety and facility points. Restricted points are visible only to Facility managers.';
COMMENT ON COLUMN public.buildings.model_anchor IS
  'JSON object with model-local x, y, z coordinates; not geographic coordinates.';
COMMENT ON COLUMN public.facility_map_points.anchor_position IS
  'JSON object {x, y, z} in the existing GLB model coordinate space; populate only after verification.';
