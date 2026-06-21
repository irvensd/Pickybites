-- Food bucket list: status tracking, reasons, planned/visited dates

ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS place_price_level INTEGER CHECK (place_price_level BETWEEN 1 AND 4);
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS planned_at TIMESTAMPTZ;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS visited_at TIMESTAMPTZ;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- status + notes already added in 005_core_systems.sql

DROP POLICY IF EXISTS "bookmarks_update_own" ON bookmarks;
CREATE POLICY "bookmarks_update_own" ON bookmarks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
