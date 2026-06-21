-- Run in Supabase SQL Editor if you already ran schema.sql before Google Places support

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS google_place_id TEXT UNIQUE;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_restaurants_google_place_id ON restaurants(google_place_id);

