-- ============================================================
-- 002_shared_activity_content.sql
-- Shared Content / Activity module for all Mahidol RAC apps.
-- This project is the central Supabase project for Facility-Safety
-- and the Mahidol RAC website consumes the same database/storage.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  category text,
  cover_image text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  objective text NOT NULL DEFAULT '',
  key_activities jsonb NOT NULL DEFAULT '[]'::jsonb,
  outcomes text NOT NULL DEFAULT '',
  participants text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activities_status_date_idx
  ON public.activities (status, date DESC);

CREATE OR REPLACE FUNCTION public.set_activities_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS activities_set_updated_at ON public.activities;
CREATE TRIGGER activities_set_updated_at
BEFORE UPDATE ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.set_activities_updated_at();

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "published activities are public" ON public.activities;
CREATE POLICY "published activities are public"
ON public.activities
FOR SELECT
TO anon, authenticated
USING (status = 'published');

DROP POLICY IF EXISTS "authenticated users manage activities" ON public.activities;
CREATE POLICY "authenticated users manage activities"
ON public.activities
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Shared public image bucket used by the Mahidol RAC Activity CMS.
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-images', 'activity-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "public can view activity images" ON storage.objects;
CREATE POLICY "public can view activity images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'activity-images');

DROP POLICY IF EXISTS "authenticated can upload activity images" ON storage.objects;
CREATE POLICY "authenticated can upload activity images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'activity-images');

DROP POLICY IF EXISTS "authenticated can update activity images" ON storage.objects;
CREATE POLICY "authenticated can update activity images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'activity-images')
WITH CHECK (bucket_id = 'activity-images');

DROP POLICY IF EXISTS "authenticated can delete activity images" ON storage.objects;
CREATE POLICY "authenticated can delete activity images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'activity-images');
