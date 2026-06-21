-- Structured restaurant review scores

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS food_quality DECIMAL(3,1) CHECK (food_quality BETWEEN 1.0 AND 10.0);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS service_score DECIMAL(3,1) CHECK (service_score BETWEEN 1.0 AND 10.0);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS atmosphere DECIMAL(3,1) CHECK (atmosphere BETWEEN 1.0 AND 10.0);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS value_score DECIMAL(3,1) CHECK (value_score BETWEEN 1.0 AND 10.0);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating_manual_override BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS wait_time TEXT CHECK (wait_time IN ('under_15', '15_30', '30_60', 'over_60'));
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS would_return BOOLEAN;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS would_recommend BOOLEAN;

UPDATE reviews
SET
  food_quality = rating,
  service_score = rating,
  atmosphere = rating,
  value_score = rating
WHERE food_quality IS NULL;
