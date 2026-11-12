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

## Confirmed product requirements

### Building interaction

- The existing GLB stays the primary model; automatic rotation remains disabled.
- Selecting a building in the 3D model navigates to the Facility-Safety **full-page** building inspection view.
- Navigation carries the selected `building_id`; never identify a building by its display label alone.
- The inspection page shows the building context and the standard building inspection checklist.
- Use **separate standard checklist templates by building type** (for example: office, greenhouse, laboratory/operation building, warehouse, or other confirmed types).
- When a building is registered, assign its building type and associate the matching standard checklist template; do not force one universal checklist onto every building.
- Checklist templates are centrally administered and versioned so later revisions do not silently rewrite historical inspection records.
- The initial checklist categories can be tailored to the building type while retaining relevant core safety topics (structure, electrical, fire protection, sanitation/water, ventilation, building-use safety, and surrounding environment).

### Inspection result choices

- Each checklist item has exactly two result choices: **ผ่าน (Pass)** and **ไม่ผ่าน (Fail)**.
- Do not include **ไม่เกี่ยวข้อง (N/A)** or **ต้องปรับปรุง (Needs improvement)** as item result choices in this version.
- Store the result for each checklist item against the inspection record and the checklist template version used, so historical results remain interpretable.
- When an inspector selects **ไม่ผ่าน (Fail)**, require a non-empty problem description / remark for that checklist item before the inspection can be saved or submitted. A blank or whitespace-only remark is invalid; the validation must also be enforced by trusted server-side logic, not only the form UI.
- For **ผ่าน (Pass)**, a remark is optional unless a separate checklist rule explicitly requires it.
- Any remediation / corrective-action workflow is handled separately from the binary inspection result; selecting “ไม่ผ่าน” must not silently create or assign a work order unless a separately approved workflow defines that behavior.

### Inspection roles

- **Building Inspector:** may inspect only buildings assigned to them.
- **Safety Officer:** may review inspection results, assess risk, and follow up corrective actions.
- **Admin:** manages buildings, checklist templates, assignments, and access.
- Enforce these rules in database policies / trusted server logic, not only by hiding UI controls.

### Maintenance plan and calendar

The uploaded workbook `ตารางปฏิทินงานประจำ(แยกตามระบบ).xlsx` is the source of truth for FY2570.

- Import the workbook's 10 system groups, task descriptions, stated frequencies, and orange week markers without rewriting their meaning.
- A blank frequency stays blank; do not infer a frequency from a neighbouring row.
- The orange fill represents a planned week in the source calendar. Preserve that week-level schedule as well as the written frequency.
- Show a **central campus plan** and allow filtering / viewing the same plan by building.
- Support three scopes: campus-wide tasks, tasks linked to one building, and one task linked to multiple buildings.
- The calendar is **read-only planning**: display scheduled tasks only. Do not auto-create inspections, assign work, or send notifications when a date arrives.
- The default landing view is **Dashboard + monthly calendar**, with system, building, and date filters.
- Selecting a calendar item opens its details first; the detail view then provides navigation to the related building / equipment inspection page.
- Do not display operational progress statuses in this calendar. It is a plan view only.

### Fiscal-year versioning

- Support multiple fiscal-year plans, not only FY2570.
- A new fiscal year may be created from a prior-year plan as a **copy/template**, then edited independently.
- Copying a plan must create a new fiscal-year version; it must not mutate the source year.
- Keep source workbook metadata and imported schedule data for traceability.
- Use the Thai fiscal-year range (1 October to 30 September) and retain the original calendar-year month/week context.

## Mapping states

- `unmapped`: no model position assigned
- `placed`: a provisional anchor exists
- `verified`: checked against the actual GLB and trusted site information
- `needs_review`: anchor or identity is uncertain

## Security

- New tables enable RLS.
- Read access requires an authenticated session.
- Writes require an authorized role; manager-only policies in the foundation are a temporary baseline and must be refined to support assigned inspectors and Safety Officers before enabling the inspection workflow.
- Points marked `restricted` are hidden from non-managers.
- No `anon` grants or public read policies are added.
- Never expose the Supabase service-role key in the browser.

## Rollout

1. Review the additive migration and verify its assumptions against the live schema.
2. Design and migrate fiscal-year plan, plan-task, and task-building link tables; keep imported FY2570 plan separate from inspection execution records.
3. Import and validate the workbook's exact 10 groups, 39 task rows, orange week markers, and frequency text.
4. Build the Dashboard + monthly calendar and filters; calendar selection opens details and then the related inspection page.
5. Build the standard building checklist and role-aware assignment / inspection workflow, using the binary Pass / Fail result choices above and requiring a problem description whenever an item is marked Fail.
6. Register real buildings, areas, and point anchors only after the owner confirms their names and positions.
7. Add a read-only Safety overlay to the Portal's existing 3D model and pass the selected `building_id` into Facility-Safety.
8. Verify RLS, role boundaries, old workflows, and the imported plan before production rollout.

The migration is intentionally additive and does not seed fabricated campus records. The workbook import must preserve source values; no sample building names, model coordinates, or building-to-task relationships are fabricated.
