-- =============================================================
-- waitlist_subscribers
-- Public email capture for the private-beta landing page.
-- Anonymous visitors insert directly; founder reads via the
-- Supabase dashboard (service role bypasses RLS).
-- =============================================================

CREATE TABLE IF NOT EXISTS waitlist_subscribers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  source      TEXT NOT NULL DEFAULT 'landing_hero',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_subscribers_created_at ON waitlist_subscribers(created_at DESC);

ALTER TABLE waitlist_subscribers ENABLE ROW LEVEL SECURITY;

-- No SELECT/UPDATE/DELETE policies — defense in depth (see contact_submissions).
CREATE POLICY "waitlist_subscribers: insert from anyone"
  ON waitlist_subscribers FOR INSERT
  WITH CHECK (true);
