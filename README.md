# Facility & Safety Management System

## Production deployment

1. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Run migrations `001` through `004` in order in the Supabase SQL editor.
3. Create users in Supabase Auth and assign their role in `staff_profiles` (`staff`, `inspector`, `section_head`, `finance_head`, `deputy_dean`, `dean`, or `admin`). Do not put passwords/PINs in catalog data.
4. Build with `npm run build` and deploy the generated `dist` directory.

The app uses encrypted Supabase Auth storage (AES-GCM/WebCrypto), a durable local write-through cache, an offline outbox with backoff, server-side atomic work-order numbering, RLS, database audit triggers, and a notification retry queue.

## Verification

Run `npm run lint`, `npm run build`, and the authenticated RLS/counter tests:

```text
SUPABASE_TEST_EMAIL=qa@example.org SUPABASE_TEST_PASSWORD=... npm run test:supabase
LOAD_TEST_EMAIL=qa@example.org LOAD_TEST_PASSWORD=... LOAD_TEST_REQUESTS=50 npm run test:load
```

The load test only reserves numbers; it does not create work orders. For email/push delivery, deploy `supabase/functions/process-notifications` and configure `SUPABASE_SERVICE_ROLE_KEY` plus an approved server-side `NOTIFICATION_WEBHOOK_URL`; never put a service-role key in Vite environment variables.
