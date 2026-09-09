-- Shared Activity CMS security hardening.
-- Canonical project: Facility-Safety Supabase, also consumed by Mahidol RAC.
-- Requires 003_supabase_auth_profiles.sql and 004_production_security.sql.

-- Only active managers/admins may create, edit, publish, or delete Activity content.
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS activities_public_read ON public.activities;
DROP POLICY IF EXISTS activities_authenticated_manage ON public.activities;
DROP POLICY IF EXISTS activities_published_read ON public.activities;
DROP POLICY IF EXISTS activities_manager_write ON public.activities;

CREATE POLICY activities_published_read
  ON public.activities FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY activities_manager_write
  ON public.activities FOR ALL
  TO authenticated
  USING (public.is_manager())
  WITH CHECK (public.is_manager());

-- Storage: public can view published media, while only managers can mutate files.
DROP POLICY IF EXISTS activity_images_public_read ON storage.objects;
DROP POLICY IF EXISTS activity_images_authenticated_select ON storage.objects;
DROP POLICY IF EXISTS activity_images_authenticated_insert ON storage.objects;
DROP POLICY IF EXISTS activity_images_authenticated_update ON storage.objects;
DROP POLICY IF EXISTS activity_images_authenticated_delete ON storage.objects;
DROP POLICY IF EXISTS activity_images_manager_insert ON storage.objects;
DROP POLICY IF EXISTS activity_images_manager_update ON storage.objects;
DROP POLICY IF EXISTS activity_images_manager_delete ON storage.objects;

CREATE POLICY activity_images_public_read
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'activity-images');

CREATE POLICY activity_images_manager_insert
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'activity-images' AND public.is_manager());

CREATE POLICY activity_images_manager_update
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'activity-images' AND public.is_manager())
  WITH CHECK (bucket_id = 'activity-images' AND public.is_manager());

CREATE POLICY activity_images_manager_delete
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'activity-images' AND public.is_manager());
