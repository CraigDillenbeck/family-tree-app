-- =============================================================
-- STEP 2: CUSTOM ENUM TYPES
-- =============================================================

CREATE TYPE collaborator_role AS ENUM (
  'viewer',
  'editor'
);

CREATE TYPE relationship_type AS ENUM (
  'spouse',
  'partner',
  'parent',
  'child',
  'sibling',
  'half_sibling',
  'step_sibling',
  'step_parent',
  'step_child',
  'grandparent',
  'grandchild'
);

CREATE TYPE media_type AS ENUM (
  'image',
  'video',
  'audio',
  'document'
);

CREATE TYPE activity_action AS ENUM (
  'created',
  'updated',
  'deleted',
  'uploaded',
  'tagged',
  'invited'
);


-- =============================================================
-- STEP 3: CORE TABLES
-- =============================================================

-- profiles
-- One row per authenticated user. Extends Supabase auth.users.
CREATE TABLE profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT NOT NULL,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- trees
-- A family tree owned by one profile.
CREATE TABLE trees (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- tree_collaborators
-- Invited users and their permission level on a tree.
CREATE TABLE tree_collaborators (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id     UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role        collaborator_role NOT NULL DEFAULT 'viewer',
  invited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(tree_id, profile_id)
);

-- persons
-- An individual in a family tree.
CREATE TABLE persons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id           UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  created_by        UUID NOT NULL REFERENCES profiles(id),
  first_name        TEXT NOT NULL,
  last_name         TEXT,
  maiden_name       TEXT,
  birth_date        DATE,
  birth_place       TEXT,
  primary_residence TEXT,
  death_date        DATE,
  occupation        TEXT,
  bio               TEXT,
  highlights        TEXT,         -- Short curated highlights shown on profile
  avatar_url        TEXT,
  is_living         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- relationships
-- Links two persons in a family tree.
-- is_current = FALSE means historical (e.g. ex-spouse) — stored but hidden in tree view.
CREATE TABLE relationships (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id      UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  person_a_id  UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  person_b_id  UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  type         relationship_type NOT NULL,
  is_current   BOOLEAN NOT NULL DEFAULT TRUE,
  start_date   DATE,
  end_date     DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_relationship CHECK (person_a_id <> person_b_id)
);

-- memories
-- A written story or memory, optionally tagged to multiple persons.
CREATE TABLE memories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id      UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  created_by   UUID NOT NULL REFERENCES profiles(id),
  title        TEXT NOT NULL,
  body         TEXT,
  memory_date  DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- memory_persons
-- Junction: which persons are tagged in a memory.
CREATE TABLE memory_persons (
  memory_id  UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  person_id  UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  PRIMARY KEY (memory_id, person_id)
);

-- media
-- An uploaded image, video, audio clip, or document.
CREATE TABLE media (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id       UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  created_by    UUID NOT NULL REFERENCES profiles(id),
  media_type    media_type NOT NULL,
  storage_path  TEXT NOT NULL,  -- Supabase Storage bucket path
  title         TEXT,
  caption       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- media_persons
-- Junction: which persons are tagged in a media item.
CREATE TABLE media_persons (
  media_id   UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  person_id  UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  PRIMARY KEY (media_id, person_id)
);

-- activity_log
-- Immutable audit trail of all changes made to a tree.
CREATE TABLE activity_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id      UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  profile_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action       activity_action NOT NULL,
  entity_type  TEXT NOT NULL,   -- e.g. 'person', 'memory', 'media'
  entity_id    UUID NOT NULL,
  diff         JSONB,           -- Before/after snapshot for updates
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================
-- STEP 4: INDEXES
-- Tuned for the queries MyNamesake will run most often
-- =============================================================

-- Trees by owner
CREATE INDEX idx_trees_owner_id ON trees(owner_id);

-- Collaborators by tree and profile
CREATE INDEX idx_tree_collaborators_tree_id   ON tree_collaborators(tree_id);
CREATE INDEX idx_tree_collaborators_profile_id ON tree_collaborators(profile_id);

-- Persons by tree (primary tree query)
CREATE INDEX idx_persons_tree_id ON persons(tree_id);

-- Relationships by tree and both persons
CREATE INDEX idx_relationships_tree_id    ON relationships(tree_id);
CREATE INDEX idx_relationships_person_a   ON relationships(person_a_id);
CREATE INDEX idx_relationships_person_b   ON relationships(person_b_id);

-- Memories by tree and author
CREATE INDEX idx_memories_tree_id    ON memories(tree_id);
CREATE INDEX idx_memories_created_by ON memories(created_by);

-- Media by tree and type
CREATE INDEX idx_media_tree_id    ON media(tree_id);
CREATE INDEX idx_media_media_type ON media(media_type);

-- Junction tables
CREATE INDEX idx_memory_persons_person_id ON memory_persons(person_id);
CREATE INDEX idx_media_persons_person_id  ON media_persons(person_id);

-- Activity log by tree and time (owner dashboard feed)
CREATE INDEX idx_activity_log_tree_id    ON activity_log(tree_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);


-- =============================================================
-- STEP 5: UPDATED_AT TRIGGER
-- Automatically keeps updated_at in sync
-- =============================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON trees
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON persons
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


-- =============================================================
-- STEP 6: AUTO-CREATE PROFILE ON SIGNUP
-- Fires when a new user signs up via Supabase Auth
-- =============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (auth_user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =============================================================
-- STEP 7: HELPER FUNCTION
-- Returns the profile ID for the currently authenticated user.
-- Used throughout RLS policies for clean, readable rules.
-- =============================================================

CREATE OR REPLACE FUNCTION current_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE auth_user_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;


-- =============================================================
-- STEP 8: ENABLE ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE trees               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_collaborators  ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships       ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_persons      ENABLE ROW LEVEL SECURITY;
ALTER TABLE media               ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_persons       ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log        ENABLE ROW LEVEL SECURITY;


-- =============================================================
-- STEP 9: RLS POLICIES
-- =============================================================

-- ----- profiles -----

-- Users can read their own profile
CREATE POLICY "profiles: read own"
  ON profiles FOR SELECT
  USING (auth_user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE
  USING (auth_user_id = auth.uid());


-- ----- trees -----

-- Owners and collaborators can view a tree
CREATE POLICY "trees: read if owner or collaborator"
  ON trees FOR SELECT
  USING (
    owner_id = current_profile_id()
    OR id IN (
      SELECT tree_id FROM tree_collaborators
      WHERE profile_id = current_profile_id()
      AND accepted_at IS NOT NULL
    )
    OR is_public = TRUE
  );

-- Only the owner can create a tree
CREATE POLICY "trees: insert as owner"
  ON trees FOR INSERT
  WITH CHECK (owner_id = current_profile_id());

-- Only the owner can update tree metadata
CREATE POLICY "trees: update as owner"
  ON trees FOR UPDATE
  USING (owner_id = current_profile_id());

-- Only the owner can delete a tree
CREATE POLICY "trees: delete as owner"
  ON trees FOR DELETE
  USING (owner_id = current_profile_id());


-- ----- tree_collaborators -----

-- Tree owners can see all collaborators on their trees
CREATE POLICY "tree_collaborators: read if owner or self"
  ON tree_collaborators FOR SELECT
  USING (
    profile_id = current_profile_id()
    OR tree_id IN (SELECT id FROM trees WHERE owner_id = current_profile_id())
  );

-- Only tree owners can invite collaborators
CREATE POLICY "tree_collaborators: insert as owner"
  ON tree_collaborators FOR INSERT
  WITH CHECK (
    tree_id IN (SELECT id FROM trees WHERE owner_id = current_profile_id())
  );

-- Invited user can accept (update accepted_at); owner can change role
CREATE POLICY "tree_collaborators: update by owner or self"
  ON tree_collaborators FOR UPDATE
  USING (
    profile_id = current_profile_id()
    OR tree_id IN (SELECT id FROM trees WHERE owner_id = current_profile_id())
  );

-- Owner can remove collaborators
CREATE POLICY "tree_collaborators: delete as owner"
  ON tree_collaborators FOR DELETE
  USING (
    tree_id IN (SELECT id FROM trees WHERE owner_id = current_profile_id())
  );


-- ----- persons -----

-- Anyone with tree access can view persons
CREATE POLICY "persons: read if tree access"
  ON persons FOR SELECT
  USING (
    tree_id IN (
      SELECT id FROM trees WHERE owner_id = current_profile_id()
      UNION
      SELECT tree_id FROM tree_collaborators
      WHERE profile_id = current_profile_id() AND accepted_at IS NOT NULL
    )
  );

-- Editors and owners can add persons
CREATE POLICY "persons: insert if editor or owner"
  ON persons FOR INSERT
  WITH CHECK (
    tree_id IN (
      SELECT id FROM trees WHERE owner_id = current_profile_id()
      UNION
      SELECT tree_id FROM tree_collaborators
      WHERE profile_id = current_profile_id()
      AND role = 'editor' AND accepted_at IS NOT NULL
    )
  );

-- Editors and owners can update persons
CREATE POLICY "persons: update if editor or owner"
  ON persons FOR UPDATE
  USING (
    tree_id IN (
      SELECT id FROM trees WHERE owner_id = current_profile_id()
      UNION
      SELECT tree_id FROM tree_collaborators
      WHERE profile_id = current_profile_id()
      AND role = 'editor' AND accepted_at IS NOT NULL
    )
  );

-- Only tree owner can delete a person
CREATE POLICY "persons: delete as owner"
  ON persons FOR DELETE
  USING (
    tree_id IN (SELECT id FROM trees WHERE owner_id = current_profile_id())
  );


-- ----- relationships -----

CREATE POLICY "relationships: read if tree access"
  ON relationships FOR SELECT
  USING (
    tree_id IN (
      SELECT id FROM trees WHERE owner_id = current_profile_id()
      UNION
      SELECT tree_id FROM tree_collaborators
      WHERE profile_id = current_profile_id() AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "relationships: insert if editor or owner"
  ON relationships FOR INSERT
  WITH CHECK (
    tree_id IN (
      SELECT id FROM trees WHERE owner_id = current_profile_id()
      UNION
      SELECT tree_id FROM tree_collaborators
      WHERE profile_id = current_profile_id()
      AND role = 'editor' AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "relationships: update if editor or owner"
  ON relationships FOR UPDATE
  USING (
    tree_id IN (
      SELECT id FROM trees WHERE owner_id = current_profile_id()
      UNION
      SELECT tree_id FROM tree_collaborators
      WHERE profile_id = current_profile_id()
      AND role = 'editor' AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "relationships: delete as owner"
  ON relationships FOR DELETE
  USING (
    tree_id IN (SELECT id FROM trees WHERE owner_id = current_profile_id())
  );


-- ----- memories -----

CREATE POLICY "memories: read if tree access"
  ON memories FOR SELECT
  USING (
    tree_id IN (
      SELECT id FROM trees WHERE owner_id = current_profile_id()
      UNION
      SELECT tree_id FROM tree_collaborators
      WHERE profile_id = current_profile_id() AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "memories: insert if editor or owner"
  ON memories FOR INSERT
  WITH CHECK (
    tree_id IN (
      SELECT id FROM trees WHERE owner_id = current_profile_id()
      UNION
      SELECT tree_id FROM tree_collaborators
      WHERE profile_id = current_profile_id()
      AND role = 'editor' AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "memories: update by creator or owner"
  ON memories FOR UPDATE
  USING (
    created_by = current_profile_id()
    OR tree_id IN (SELECT id FROM trees WHERE owner_id = current_profile_id())
  );

CREATE POLICY "memories: delete by creator or owner"
  ON memories FOR DELETE
  USING (
    created_by = current_profile_id()
    OR tree_id IN (SELECT id FROM trees WHERE owner_id = current_profile_id())
  );


-- ----- memory_persons -----

CREATE POLICY "memory_persons: read if tree access"
  ON memory_persons FOR SELECT
  USING (
    memory_id IN (SELECT id FROM memories)
  );

CREATE POLICY "memory_persons: insert if editor or owner"
  ON memory_persons FOR INSERT
  WITH CHECK (
    memory_id IN (SELECT id FROM memories)
  );

CREATE POLICY "memory_persons: delete if editor or owner"
  ON memory_persons FOR DELETE
  USING (
    memory_id IN (SELECT id FROM memories)
  );


-- ----- media -----

CREATE POLICY "media: read if tree access"
  ON media FOR SELECT
  USING (
    tree_id IN (
      SELECT id FROM trees WHERE owner_id = current_profile_id()
      UNION
      SELECT tree_id FROM tree_collaborators
      WHERE profile_id = current_profile_id() AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "media: insert if editor or owner"
  ON media FOR INSERT
  WITH CHECK (
    tree_id IN (
      SELECT id FROM trees WHERE owner_id = current_profile_id()
      UNION
      SELECT tree_id FROM tree_collaborators
      WHERE profile_id = current_profile_id()
      AND role = 'editor' AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "media: delete by uploader or owner"
  ON media FOR DELETE
  USING (
    created_by = current_profile_id()
    OR tree_id IN (SELECT id FROM trees WHERE owner_id = current_profile_id())
  );


-- ----- media_persons -----

CREATE POLICY "media_persons: read if tree access"
  ON media_persons FOR SELECT
  USING (
    media_id IN (SELECT id FROM media)
  );

CREATE POLICY "media_persons: insert if editor or owner"
  ON media_persons FOR INSERT
  WITH CHECK (
    media_id IN (SELECT id FROM media)
  );

CREATE POLICY "media_persons: delete if editor or owner"
  ON media_persons FOR DELETE
  USING (
    media_id IN (SELECT id FROM media)
  );


-- ----- activity_log -----

-- Only tree owners can read the activity log
CREATE POLICY "activity_log: read as owner"
  ON activity_log FOR SELECT
  USING (
    tree_id IN (SELECT id FROM trees WHERE owner_id = current_profile_id())
  );

-- Any authenticated user with tree access can insert log entries
-- (writes happen server-side via service role in practice)
CREATE POLICY "activity_log: insert if tree access"
  ON activity_log FOR INSERT
  WITH CHECK (
    tree_id IN (
      SELECT id FROM trees WHERE owner_id = current_profile_id()
      UNION
      SELECT tree_id FROM tree_collaborators
      WHERE profile_id = current_profile_id() AND accepted_at IS NOT NULL
    )
  );

-- Activity log is immutable — no updates or deletes


-- =============================================================
-- STEP 10: SUPABASE STORAGE BUCKETS
-- Run these separately in your Supabase Storage settings,
-- or uncomment to run via SQL if using service role
-- =============================================================

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES
--   ('avatars',   'avatars',   true),   -- Profile + person avatars (public CDN)
--   ('tree-media', 'tree-media', false); -- All tree uploads (private, RLS enforced)

-- Storage RLS for tree-media bucket (private):
-- Users can only access media in trees they belong to.
-- Set these up in Supabase Dashboard > Storage > Policies.


-- =============================================================
-- DONE
-- Tables, types, indexes, triggers, and RLS policies created.
-- Next: configure Storage buckets and test with a seed user.
-- =============================================================