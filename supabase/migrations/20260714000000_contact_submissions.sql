-- =============================================================
-- contact_submissions
-- Backfills the migration for a table created directly in the
-- Supabase dashboard for the /contact form (never captured in a
-- migration until now). Schema matches the live table's inferred
-- columns from src/routes/(marketing)/contact/+page.server.ts.
-- =============================================================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  reason      TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anonymous + authenticated visitors can submit the contact form.
-- No SELECT/UPDATE/DELETE policies — only the service-role client
-- (supabaseAdmin, which bypasses RLS) or the Supabase dashboard can
-- read/manage submissions. This is defense in depth: app code already
-- uses supabaseAdmin exclusively, so RLS is a backstop, not the
-- primary control.
CREATE POLICY "contact_submissions: insert from anyone"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);
