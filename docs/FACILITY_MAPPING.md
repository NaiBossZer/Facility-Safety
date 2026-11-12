# Facility Mapping — Data & Spatial Contract

## Goal

Connect the existing Mahidol Lampang campus GLB to Facility-Safety without replacing, modifying, or auto-rotating the original model. The GLB remains a visual asset; operational data is stored separately in the shared Supabase project.

## Current verified state

- The shared Supabase project is `rdnbodadxvvykfrxmeqn`.
- `public.buildings`, `public.work_orders`, `public.inspections`, and `public.assets` already exist.
- Those four tables currently contain zero rows. Do not create sample buildings or claim any physical location is verified.
- Work orders, inspections, and assets already reference `buildings.id`.
- The Portal's existing GLB has no verified building-to-mesh mapping yet.

## Spatial coordinate contract

All positions are **model-local coordinates**, not latitude/longitude:

```json
{ "x": 0.0, "y": 0.0, "z": 0.0 }
```

- Use the coordinate space of the loaded GLB.
- Store the anchor on a building, area, or map point independently of the GLB file.
- Prefer `model_node_path` / `model_node_name` over transient mesh indices.
- Do not invent anchors from an oblique aerial photograph. A point becomes `verified` only after checking it against the loaded model and a reliable site reference.
- `boundary_geometry` is reserved for future polygon/zone overlays; no PostGIS dependency is introduced in this foundation.

## Entity hierarchy

```text
Campus GLB
└── buildings (existing master table)
    └── facility_areas (floor / room / zone / outdoor / greenhouse)
        └── facility_map_points (equipment / exits / hazards / sensors)
```

Existing `assets` remain the asset master. `facility_asset_locations` links assets to one or more mapped points. Existing work orders and inspections gain nullable area/point references; all old rows and workflows remain valid.

## Mapping states

- `unmapped`: no model position assigned
- `placed`: a provisional anchor exists
- `verified`: checked against the actual GLB and trusted site information
- `needs_review`: anchor or identity is uncertain

## Security

- New tables enable RLS.
- Read access requires an authenticated session.
- Writes require `public.is_manager()`, which is narrowed by the current SSO work.
- Points marked `restricted` are hidden from non-managers.
- No `anon` grants or public read policies are added.
- Never expose the Supabase service-role key in the browser.

## Rollout

1. Review and apply the migration in the shared Supabase project.
2. Verify the new tables, RLS, grants, and unchanged legacy tables.
3. Add a Facility Mapping admin view for registering buildings, areas, and point anchors.
4. Capture the actual GLB node/anchor mapping using the model viewer.
5. Add a read-only Safety overlay to the Portal's existing 3D model.
6. Connect inspections, work orders, assets, and later Smart Farm telemetry.

The migration is intentionally additive and does not seed fabricated campus records.
