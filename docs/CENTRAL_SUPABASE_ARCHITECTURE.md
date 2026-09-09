# Central Supabase Architecture

The Facility-Safety Supabase project is the canonical backend for both applications:

- Facility-Safety — engineering/facility operations
- Mahidol RAC — public portal, Activity CMS, dashboard integration

## Shared services

1. Supabase Auth — one user/session directory
2. `staff_profiles` — application role and staff profile
3. RLS — database authorization enforced server-side
4. `activities` — shared Activity/Content CMS
5. `activity-images` — shared public Activity media bucket
6. Facility tables — `buildings`, `work_orders`, `inspections`, `personnel`, catalogs
7. `audit_logs` — compliance trail for sensitive changes

## Role model

`staff` is the default role. Manager-level roles are:

- `admin`
- `dean`
- `deputy_dean`
- `finance_head`
- `section_head`

The SQL function `public.app_role()` is the authoritative role lookup and `public.is_manager()` is used by RLS policies.

## Migration order

Apply to the canonical Supabase project in this order:

1. `001_init_schema.sql`
2. `002_shared_activity_content.sql`
3. `003_supabase_auth_profiles.sql`
4. `004_production_security.sql`
5. `005_shared_activity_admin_rls.sql`

Run the migrations through Supabase SQL Editor or the Supabase CLI. Do not put a service-role key in either Vite application.

## Client configuration

Both applications use the same:

```env
VITE_SUPABASE_URL=https://rdnbodadxvvykfrxmeqn.supabase.co
VITE_SUPABASE_ANON_KEY=<client anon key>
```

The anon key is a client credential and must still be protected by RLS. Never use a service-role key in browser code.

## Activity CMS flow

Public users can read `published` activities. Only active manager roles can create, update, publish, upload media, or delete Activity content. This authorization is enforced by Supabase RLS, not only by the React UI.

## Dashboard / Facility integration

Mahidol RAC keeps its existing executive Dashboard UI and can read Facility-Safety operational summaries through the same Supabase project. The first shared summary covers buildings, work orders, and inspections. Existing survey analytics remain unchanged until a dedicated survey table is migrated into the central project.
