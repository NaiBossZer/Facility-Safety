-- 002_fix_rls_and_preferences.sql
-- Run this ONCE in Supabase SQL Editor for the existing database.
-- Enables the anon client used by the current app to seed/update catalog data.

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_preferences_user_id
  ON user_preferences(user_id);

DROP POLICY IF EXISTS "Public write access to categories" ON categories;
CREATE POLICY "Public write access to categories" ON categories
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update access to categories" ON categories;
CREATE POLICY "Public update access to categories" ON categories
  FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete access to categories" ON categories;
CREATE POLICY "Public delete access to categories" ON categories
  FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public write access to items" ON items;
CREATE POLICY "Public write access to items" ON items
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update access to items" ON items;
CREATE POLICY "Public update access to items" ON items
  FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete access to items" ON items;
CREATE POLICY "Public delete access to items" ON items
  FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public write access to buildings" ON buildings;
CREATE POLICY "Public write access to buildings" ON buildings
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update access to buildings" ON buildings;
CREATE POLICY "Public update access to buildings" ON buildings
  FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete access to buildings" ON buildings;
CREATE POLICY "Public delete access to buildings" ON buildings
  FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public write access to vendors" ON vendors;
CREATE POLICY "Public write access to vendors" ON vendors
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update access to vendors" ON vendors;
CREATE POLICY "Public update access to vendors" ON vendors
  FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete access to vendors" ON vendors;
CREATE POLICY "Public delete access to vendors" ON vendors
  FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public write access to budget" ON budget;
CREATE POLICY "Public write access to budget" ON budget
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update access to budget" ON budget;
CREATE POLICY "Public update access to budget" ON budget
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public write access to personnel" ON personnel;
CREATE POLICY "Public write access to personnel" ON personnel
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update access to personnel" ON personnel;
CREATE POLICY "Public update access to personnel" ON personnel
  FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete access to personnel" ON personnel;
CREATE POLICY "Public delete access to personnel" ON personnel
  FOR DELETE USING (true);
