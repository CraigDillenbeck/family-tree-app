# MyNamesake — Claude Code Project Memory

> This file is read by Claude Code at the start of every session.
> Keep it updated as the project evolves.

---

## What This App Is

MyNamesake is a consumer web app for building beautiful family trees and preserving family memories. Users can:

- Build a visual, interactive family tree
- Click any person to open their full profile page
- Write memories and stories about individuals
- Upload images, videos, audio clips, and documents
- Tag multiple family members to a single piece of media or memory
- Invite collaborators to view or edit their tree
- Track all changes via an activity log (owner-only)

The emphasis is on **beauty, celebration, and emotional resonance** — not dry genealogy software. Every UI decision should serve that feeling.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | SvelteKit | SSR everywhere, no SSG |
| Language | TypeScript | Strict mode on |
| Database | Supabase (Postgres) | RLS enforced on every table |
| Auth | Supabase Auth | Email + OAuth (Google) |
| Storage | Supabase Storage | `avatars` (public) + `tree-media` (private) |
| Hosting | Vercel | SvelteKit adapter-vercel |
| Email | Resend | Transactional only |
| Styling | CSS custom properties + scoped Svelte styles | No Tailwind |

---

## Project Structure

```
src/
├── lib/
│   ├── server/
│   │   ├── supabase.ts        # Service-role client (NEVER import in components)
│   │   └── auth.ts            # getUser(), requireAuth() helpers
│   ├── supabase/
│   │   ├── client.ts          # Browser Supabase client
│   │   └── types.ts           # Generated DB types (run: supabase gen types)
│   ├── stores/
│   │   ├── auth.ts            # Current session store
│   │   ├── tree.ts            # Active tree + persons cache
│   │   └── notifications.ts   # Activity feed store
│   ├── components/
│   │   ├── ui/                # Buttons, inputs, modals, toasts
│   │   ├── tree/              # TreeCanvas, PersonNode, RelationshipLine
│   │   ├── person/            # PersonCard, ProfileHeader, HighlightBadge
│   │   ├── media/             # MediaGrid, Uploader, MediaViewer
│   │   ├── memory/            # MemoryCard, MemoryEditor
│   │   └── activity/          # ActivityFeed, ActivityItem
│   └── utils/
│       ├── dates.ts
│       ├── storage.ts         # Supabase Storage upload helpers
│       ├── activity.ts        # Write activity log entries
│       └── permissions.ts     # isOwner(), canEdit() helpers
├── routes/
│   ├── +layout.server.ts      # Global session check
│   ├── +layout.svelte         # Root shell
│   ├── (marketing)/           # Public pages, no auth
│   ├── (auth)/                # Login, signup, OAuth callback
│   ├── (app)/                 # All protected routes
│   │   ├── +layout.server.ts  # Redirect if no session
│   │   ├── dashboard/
│   │   ├── trees/
│   │   │   ├── new/
│   │   │   └── [treeId]/
│   │   │       ├── +page.svelte        # Tree canvas
│   │   │       ├── settings/
│   │   │       ├── collaborators/
│   │   │       ├── activity/
│   │   │       └── persons/
│   │   │           ├── new/
│   │   │           └── [personId]/
│   │   │               ├── edit/
│   │   │               ├── memories/
│   │   │               └── media/
│   │   └── account/
│   └── api/
│       └── trees/[treeId]/    # Mutation endpoints
├── app.html
├── app.d.ts                   # Locals type
└── hooks.server.ts            # Supabase session on every request
```

---

## Database Schema Summary

All tables live in Supabase. RLS is enabled on every table.

| Table | Purpose |
|---|---|
| `profiles` | One per auth user. Extends `auth.users`. |
| `trees` | A family tree, owned by one profile. |
| `tree_collaborators` | Invited users with `viewer` or `editor` role. |
| `persons` | An individual in a tree. Biographical + narrative data. |
| `relationships` | Links two persons. Type enum + `is_current` flag. |
| `memories` | Written stories/memories, tagged to multiple persons. |
| `memory_persons` | Junction: memory ↔ person tags. |
| `media` | Uploaded files (image/video/audio/document). |
| `media_persons` | Junction: media ↔ person tags. |
| `activity_log` | Immutable audit trail of all tree changes. |

Key design decisions:
- **`is_current = false`** on relationships = historical (ex-spouse). Hidden in tree view, visible on profile page.
- **`current_profile_id()`** is a Supabase helper function used in all RLS policies.
- **Activity log is append-only** — no UPDATE or DELETE policies.
- Supabase Storage paths: `avatars/{profile_id}` and `tree-media/{tree_id}/{media_id}`

---

## Authentication Flow

1. User signs in via Supabase Auth (email or Google OAuth)
2. `hooks.server.ts` attaches a Supabase client + refreshes session on every request
3. Session is passed to `event.locals.session` and `event.locals.supabase`
4. `(app)/+layout.server.ts` redirects to `/login` if no session
5. On first signup, a database trigger auto-creates a `profiles` row

---

## Key Conventions

### Data fetching
- Always fetch in `+page.server.ts` or `+layout.server.ts` — never directly in components
- Use the **server-side Supabase client** (`event.locals.supabase`) in load functions
- Use the **browser client** (`$lib/supabase/client.ts`) only for real-time subscriptions

### Mutations
- Simple form actions go in `+page.server.ts` as SvelteKit form actions
- Complex/async mutations (tree canvas interactions) go in `src/routes/api/` endpoints
- **Always write to `activity_log`** after any meaningful mutation — use `$lib/utils/activity.ts`

### Permissions
- Never trust the client for permission checks — always verify server-side
- Use `$lib/utils/permissions.ts` helpers: `isOwner(tree, profileId)`, `canEdit(tree, collaborators, profileId)`
- RLS is the last line of defence, not the first

### TypeScript
- All Supabase queries should use the generated types from `$lib/supabase/types.ts`
- Regenerate types after any schema change: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts`
- No `any` types — use `unknown` and narrow properly

### Error handling
- All server load functions should handle errors gracefully and return typed errors
- Use SvelteKit's `error()` helper for 404s and permission errors
- Never expose raw Supabase error messages to the client

### Styling
- Use CSS custom properties defined in `app.html` or a global stylesheet
- Scoped `<style>` blocks in Svelte components — no global class pollution
- No inline styles except for dynamic values (e.g. position on the tree canvas)

---

## Environment Variables

Required in `.env.local`:

```
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```

`PUBLIC_` prefix = safe to expose to browser. Never expose `SERVICE_ROLE_KEY`.

---

## Commands

```bash
# Migration files live in supabase/migrations/

# Dev server
npm run dev

# Type check
npm run check

# Regenerate Supabase types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts

# Build
npm run build
```

---

## Current Status

- [x] Database schema designed and migrated
- [x] Project scaffolded
- [ ] Auth flow working end-to-end
- [ ] Dashboard — list/create trees
- [ ] Tree canvas — visual family tree
- [ ] Person profile page
- [ ] Media upload
- [ ] Memory editor
- [ ] Collaborator invitations
- [ ] Activity log + notifications
- [ ] Vercel deployment

---

## Important Reminders for Claude Code

- **Never import `$lib/server/` in a `.svelte` file or client-side `.ts` file** — this leaks the service role key
- **Always use `event.locals.supabase`** in server load functions, not the browser client
- **RLS is active** — queries will return empty results (not errors) if the user doesn't have access. If data is missing, check RLS policies first.
- **The `profiles` table, not `auth.users`**, is the source of truth for user data in the app
- **`is_current` on relationships** controls what the tree canvas renders — always set this correctly
- When adding a new route under `(app)/`, it is automatically protected — no extra auth check needed