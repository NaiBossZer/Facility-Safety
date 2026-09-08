-- 006_social_engagement_central.sql
-- Central Social Engagement + Smart Farm commerce domain.
-- Additive only: does not alter or delete facility-safety-app tables.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE public.activity_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.learning_center_type AS ENUM (
    'SOCIAL_CENTER', 'LEARNING_CENTER', 'RESEARCH_SITE',
    'COMMUNITY', 'SCHOOL', 'PARTNER_SITE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'fulfilled', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.social_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  description text,
  objective text,
  start_date timestamptz,
  end_date timestamptz,
  status varchar(30) NOT NULL DEFAULT 'active',
  cover_image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  type public.learning_center_type NOT NULL,
  description text,
  province varchar(100),
  district varchar(100),
  subdistrict varchar(100),
  address text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  cover_image text,
  status varchar(30) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.social_projects(id) ON DELETE SET NULL,
  center_id uuid REFERENCES public.learning_centers(id) ON DELETE SET NULL,
  title varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  summary text,
  content text,
  activity_date timestamptz NOT NULL,
  location varchar(255),
  participant_count integer CHECK (participant_count IS NULL OR participant_count >= 0),
  objective text,
  process text,
  outcome text,
  impact text,
  featured_image text,
  status public.activity_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  thumbnail_url text,
  caption varchar(500),
  alt_text varchar(500),
  sort_order integer NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  type varchar(100),
  logo text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_partners (
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  CONSTRAINT activity_partners_unique UNIQUE (activity_id, partner_id)
);

CREATE TABLE IF NOT EXISTS public.activity_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  metric_name varchar(255) NOT NULL,
  metric_value varchar(255),
  unit varchar(100),
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activities_activity_date_idx ON public.activities (activity_date DESC);
CREATE INDEX IF NOT EXISTS activities_status_published_idx ON public.activities (status, published_at DESC);
CREATE INDEX IF NOT EXISTS activities_center_date_idx ON public.activities (center_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS activity_photos_activity_sort_idx ON public.activity_photos (activity_id, sort_order);

-- Smart Farm / vegetable support commerce.
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  description text,
  category varchar(100),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  unit varchar(50) NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url text,
  harvest_date timestamptz,
  is_preorder boolean NOT NULL DEFAULT false,
  research_tag varchar(100),
  plot_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name varchar(255) NOT NULL,
  customer_phone varchar(50) NOT NULL,
  delivery_type varchar(50) NOT NULL CHECK (delivery_type IN ('pickup', 'delivery')),
  address text,
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  slip_url text,
  status public.order_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  price_per_unit numeric(10,2) NOT NULL CHECK (price_per_unit >= 0)
);

CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS products_stock_idx ON public.products (stock_quantity);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS order_items_product_idx ON public.order_items (product_id);

-- Portal server uses the Supabase PostgreSQL connection, so RLS does not
-- replace API authorization. Public clients receive only published/read APIs.
ALTER TABLE public.social_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS social_projects_public_read ON public.social_projects;
CREATE POLICY social_projects_public_read ON public.social_projects FOR SELECT TO anon, authenticated USING (status = 'active');
DROP POLICY IF EXISTS learning_centers_public_read ON public.learning_centers;
CREATE POLICY learning_centers_public_read ON public.learning_centers FOR SELECT TO anon, authenticated USING (status = 'active');
DROP POLICY IF EXISTS activities_public_read ON public.activities;
CREATE POLICY activities_public_read ON public.activities FOR SELECT TO anon, authenticated USING (status = 'published');
DROP POLICY IF EXISTS activity_photos_public_read ON public.activity_photos;
CREATE POLICY activity_photos_public_read ON public.activity_photos FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.activities a WHERE a.id = activity_id AND a.status = 'published')
);
DROP POLICY IF EXISTS partners_public_read ON public.partners;
CREATE POLICY partners_public_read ON public.partners FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS activity_partners_public_read ON public.activity_partners;
CREATE POLICY activity_partners_public_read ON public.activity_partners FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS activity_outcomes_public_read ON public.activity_outcomes;
CREATE POLICY activity_outcomes_public_read ON public.activity_outcomes FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.activities a WHERE a.id = activity_id AND a.status = 'published')
);
DROP POLICY IF EXISTS products_public_read ON public.products;
CREATE POLICY products_public_read ON public.products FOR SELECT TO anon, authenticated USING (true);

