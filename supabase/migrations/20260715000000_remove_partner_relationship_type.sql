-- Remove 'partner' from relationship_type: only legally-binding marriages
-- (spouse / divorced) are tracked going forward.
--
-- NOTE: the live relationship_type enum already diverged from the checked-in
-- 20260503000000_initial_schema.sql migration (it uses spouse/divorced/partner/
-- parent_child/adopted_parent_child/step_parent_child/sibling/half_sibling/
-- step_sibling, per src/lib/supabase/types.ts, not the older parent/child/
-- grandparent/grandchild set in that file). This migration only removes
-- 'partner' from that live enum; it does not attempt to reconcile the
-- pre-existing drift.

-- Migrate any existing 'partner' rows to 'spouse' before the value goes away.
UPDATE relationships SET type = 'spouse' WHERE type = 'partner';

-- Postgres has no DROP VALUE for enums, so rebuild the type without 'partner'.
ALTER TYPE relationship_type RENAME TO relationship_type_old;

CREATE TYPE relationship_type AS ENUM (
  'spouse',
  'divorced',
  'parent_child',
  'adopted_parent_child',
  'step_parent_child',
  'sibling',
  'half_sibling',
  'step_sibling'
);

ALTER TABLE relationships
  ALTER COLUMN type TYPE relationship_type
  USING type::text::relationship_type;

DROP TYPE relationship_type_old;
