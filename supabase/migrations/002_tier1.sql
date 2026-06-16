-- Tier 1 features: taste quiz prefs, notifications, push tokens
-- Run in Supabase SQL Editor after schema.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_cuisines TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_completed_taste_quiz BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow')),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Enable live notification delivery in the app (Supabase Dashboard → Database → Replication also works)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
