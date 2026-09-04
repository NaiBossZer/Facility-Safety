-- Link application users to Supabase Auth.
-- Run after enabling Email/SSO providers in the Supabase dashboard.

ALTER TABLE personnel ALTER COLUMN pin DROP NOT NULL;
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.staff_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  personnel_id TEXT UNIQUE REFERENCES public.personnel(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  position TEXT,
  department TEXT,
  role TEXT NOT NULL DEFAULT 'staff',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff can read own profile" ON public.staff_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.staff_profile_for_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.staff_profiles (user_id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), COALESCE(NEW.raw_user_meta_data->>'role', 'staff'))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_staff_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_staff_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.staff_profile_for_user();
