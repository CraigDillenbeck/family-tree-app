-- Tracks whether a person is a blood descendant of the tree's own family line,
-- as opposed to someone who married into it. Set via an explicit confirm step
-- when a parent or spouse is added (AddRelationshipModal), never inferred silently.
ALTER TABLE persons
  ADD COLUMN is_direct_descendant BOOLEAN NOT NULL DEFAULT TRUE;
