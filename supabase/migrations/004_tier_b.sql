-- Tier B: collaborative lists
CREATE TABLE IF NOT EXISTS list_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_list_collaborators_list ON list_collaborators(list_id);
CREATE INDEX IF NOT EXISTS idx_list_collaborators_user ON list_collaborators(user_id);

ALTER TABLE list_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "list_collaborators_select" ON list_collaborators FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM lists l WHERE l.id = list_id AND l.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM list_collaborators lc WHERE lc.list_id = list_collaborators.list_id AND lc.user_id = auth.uid())
  );

CREATE POLICY "list_collaborators_insert" ON list_collaborators FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM lists l WHERE l.id = list_id AND l.user_id = auth.uid())
  );

CREATE POLICY "list_collaborators_delete" ON list_collaborators FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM lists l WHERE l.id = list_id AND l.user_id = auth.uid())
  );

-- Collaborators can add/remove items on shared lists
CREATE POLICY "list_items_insert_collab" ON list_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM lists l WHERE l.id = list_id AND l.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM list_collaborators lc WHERE lc.list_id = list_id AND lc.user_id = auth.uid())
  );

CREATE POLICY "list_items_delete_collab" ON list_items FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM lists l WHERE l.id = list_id AND l.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM list_collaborators lc WHERE lc.list_id = list_id AND lc.user_id = auth.uid())
  );

