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
- When an inspector selects **ไม่ผ่าน (Fail)**, require at least one and allow up to **2 photo evidence attachments** for that checklist item before the inspection can be saved or submitted. Validate that each uploaded file is an allowed image type and enforce the minimum and maximum through trusted server-side logic as well as the form UI.
- Store photo evidence as a reference associated with the specific inspection item and inspection record; retain access controls so only authorized inspection roles can view it. Do not expose public object URLs for restricted evidence.
- For **ผ่าน (Pass)**, photo evidence is optional unless a separate checklist rule explicitly requires it.
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

## Implementation status (branch preview)
- Facility Mapping dashboard and monthly plan calendar are implemented in this branch.
- FY2570 workbook is represented in `src/data/facilityMaintenanceFY2570.json`, preserving 10 groups, 39 task descriptions, frequency text (including nulls), and source orange week markers.
- Admin UI supports FY2570 import, building/task scope links, independent fiscal-year copies, and editing copied task schedules.
- Checklist template management, building inspector assignments, inspection submission, and Safety Officer review screens are implemented in this branch.
- Fail results require a nonblank remark and 1–2 allowed private image evidence files; database constraints/triggers enforce this independently of the browser.
- These changes are not production-active until the new migration is reviewed/applied and the PR is merged.
- The Portal GLB still has no verified building-to-mesh anchors; click-to-inspect on the 3D model remains blocked until actual buildings and anchors are confirmed.

## Mapping states

- `unmapped`: no model position assigned
- `placed`: a provisional anchor exists
- `verified`: checked against the actual GLB and trusted site information
- `needs_review`: anchor or identity is uncertain

## Security

- New tables enable RLS.
- Read access requires an authenticated session.
- Writes require the role-aware policies in the operational migration: Facility Admin manages plans/templates/assignments; Building Inspector can create and submit inspections only for assigned buildings; Safety Officer can review inspections and record risk assessment / follow-up notes. The UI is not the security boundary; RLS and database triggers enforce these rules.
- Points marked `restricted` are hidden from non-managers.
- No `anon` grants or public read policies are added.
- Never expose the Supabase service-role key in the browser.

## Rollout

1. Review and validate the committed operational migration against the live schema before applying it.
2. The branch now contains the FY2570 workbook import source (10 groups / 39 tasks), Dashboard + monthly calendar, building/system filters, task details, building-scope linking, and independent fiscal-year copy/edit UI.
3. The branch now contains versioned checklist-template management by building type, Building Inspector assignment UI, binary Pass/Fail inspection UI, Safety Officer review UI, and private evidence uploads.
4. The database migration enforces assigned-building inspection access, immutable checklist versions after activation/use, complete checklist submission, mandatory nonblank remarks on Fail, and 1–2 private image evidence files on Fail.
5. Import the FY2570 plan only after the migration is approved and applied; import is idempotent and does not create inspections, work orders, assignments, or notifications.
6. Register real buildings and set their building types only from confirmed facility records. Do not invent model nodes or coordinates.
7. Integrate the read-only Safety overlay into the Portal GLB and pass the selected `building_id` only after node/anchor verification.
8. Run production RLS, role-boundary, evidence-access, existing-workflow, and import checks before rollout.

The migration is intentionally additive and does not seed fabricated campus records. The workbook import must preserve source values; no sample building names, model coordinates, or building-to-task relationships are fabricated.
