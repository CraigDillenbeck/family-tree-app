-- Pending, email-addressed invitations to collaborate on a tree.
-- tree_collaborators.profile_id is mandatory, so it can't hold an invite
-- to someone without a Prosapia account yet — this table bridges that gap
-- until the invite is accepted, at which point a tree_collaborators row
-- is created and this row is marked accepted_at.
CREATE TABLE tree_invites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id      UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  invited_by   UUID NOT NULL REFERENCES profiles(id),
  email        TEXT NOT NULL,
  role         collaborator_role NOT NULL DEFAULT 'viewer',
  token        UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
  accepted_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tree_id, email)
);

CREATE INDEX idx_tree_invites_tree_id ON tree_invites(tree_id);
CREATE INDEX idx_tree_invites_token   ON tree_invites(token);

ALTER TABLE tree_invites ENABLE ROW LEVEL SECURITY;

-- No SELECT path exists for anonymous/unaccepted visitors — the accept
-- page always looks the token up via the service-role client, same
-- pattern as the contact form and the tree-delete cascade.
CREATE POLICY "tree_invites: read as owner"
  ON tree_invites FOR SELECT
  USING (
    tree_id IN (SELECT id FROM trees WHERE owner_id = current_profile_id())
  );

CREATE POLICY "tree_invites: insert as owner"
  ON tree_invites FOR INSERT
  WITH CHECK (
    tree_id IN (SELECT id FROM trees WHERE owner_id = current_profile_id())
  );

CREATE POLICY "tree_invites: update as owner"
  ON tree_invites FOR UPDATE
  USING (
    tree_id IN (SELECT id FROM trees WHERE owner_id = current_profile_id())
  );

CREATE POLICY "tree_invites: delete as owner"
  ON tree_invites FOR DELETE
  USING (
    tree_id IN (SELECT id FROM trees WHERE owner_id = current_profile_id())
  );
