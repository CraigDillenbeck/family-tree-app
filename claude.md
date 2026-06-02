# Prosapiam — Claude Code Project Memory

> Single source of truth for architecture, design system, conventions, and build status.
> Keep it updated as the project evolves.

---

## What This App Is

Prosapiam is a consumer web app for building beautiful family trees and preserving family memories. Users can:

- Build a visual, interactive family tree
- Click any person to open their full profile page
- Write memories and stories about individuals
- Upload images, audio clips, and documents (plan-gated — see Plans)
- Tag multiple family members to a single piece of media or memory
- Invite collaborators to view or edit their tree
- Track all changes via an activity log (owner-only)
- Manage multiple family trees from a single dashboard

The emphasis is on **beauty, celebration, and emotional resonance** — not dry genealogy software. Every UI decision should serve that feeling. This product holds something precious. Build it accordingly.

---

## Tech Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | SvelteKit 2 | SSR everywhere, no SSG |
| Language | TypeScript | Strict mode on. No `any` types. |
| UI | Svelte 5 | **Runes syntax throughout. No Svelte 4 patterns.** |
| Database | Supabase (Postgres) | RLS enforced on every table |
| Auth | Supabase Auth | Email + Google OAuth — tested and working |
| Storage | Supabase Storage | `avatars` (public) + `tree-media` (private) |
| Hosting | Vercel | @sveltejs/adapter-vercel |
| Email | Resend | Transactional only |
| Payments | Lemon Squeezy | Merchant of Record — handles all tax compliance |
| Analytics | PostHog | User analytics, funnels, feature flags |
| Error monitoring | Sentry | @sentry/sveltekit |
| Tree canvas | @xyflow/svelte | XYFlow official Svelte port ✓ |
| Tree layout | Dagre | Auto-layout algorithm ✓ |
| Styling | CSS custom properties + scoped Svelte styles | **No Tailwind. No utility classes.** |

---

## Svelte 5 — Non-Negotiable

All components must use runes syntax. No Svelte 4 patterns anywhere.

```svelte
<script lang="ts">
  let { name, age = 0 }: { name: string; age?: number } = $props()
  let count = $state(0)
  let doubled = $derived(count * 2)
  $effect(() => { console.log(count) })
</script>
<button onclick={() => count++}>Click</button>
```

Never: `export let`, `$:`, `on:click`. Always: `$props()`, `$derived()`, `onclick={}`.

---

## Design System

### Typography — Three typefaces, strictly separated

| Typeface | Token | Role | Never use for |
| --- | --- | --- | --- |
| **Young Serif** | `--font-display` | Display headlines ONLY — hero titles, dashboard greeting, person-profile name | Any UI chrome; anything smaller than ~28px |
| **Plus Jakarta Sans** | `--font-ui` | All UI chrome — labels, buttons, tabs, navigation, form fields, captions, badges | Story or narrative content |
| **Cormorant Garamond** | `--font-body` | Narrative text, biographies, memory excerpts, story content, taglines | Navigation, buttons, labels, metadata |

**Non-negotiable typography rules:**
- Cormorant Garamond minimum **14px** — never smaller; line-height minimum **1.7**
- No Cormorant Garamond **bold** — ever
- No Cormorant Garamond **ALL CAPS** — ever
- No **typeface mixing on the same line** — register shifts at element boundaries only
- Plus Jakarta Sans max weight **500 (Medium)** on light surfaces; **600 (SemiBold)** on inverse (Ink) surfaces only
- Cormorant Garamond **italic** for: sign-in tagline, memory card excerpts, dashboard subtext — everything else upright
- `max-width: 680px` on any Cormorant Garamond prose block

Font files are self-hosted in `static/fonts/`, declared in `src/lib/styles/tokens.css`. Do not duplicate `@font-face` declarations in `app.css`.

### CSS Custom Properties — Complete Token System

All design values live in `src/lib/styles/tokens.css`. **Never hardcode a color, spacing, radius, or typography value.** Key tokens:

```css
--font-display: 'Young Serif', 'Times New Roman', Georgia, serif;
--font-ui:      'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif;
--font-body:    'Cormorant Garamond', Georgia, 'Times New Roman', serif;

--font-weight-light: 300;  --font-weight-regular: 400;
--font-weight-medium: 500; --font-weight-semibold: 600; /* inverse surfaces only */

/* Spacing — no --space-5 or --space-10 */
--space-1:4px  --space-2:8px  --space-3:12px  --space-4:16px
--space-6:24px  --space-8:32px  --space-12:48px  --space-16:64px
--space-20:80px  --space-24:96px  --space-30:120px

/* Floating UI only (dropdowns, tooltips) */
--shadow-floating: 0 4px 16px rgba(28,26,23,.10), 0 1px 4px rgba(28,26,23,.06);
```

### Non-Negotiable Design Rules

- **Never `#FFF`** as any background — Parchment `#F7F4EE` is the floor
- **Never `#000`** for any text — Ink `#1C1A17` only
- **No drop shadows** on cards/modals/panels — depth is tonal. Only `--shadow-floating` is permitted (dropdowns + tooltips only)
- **No gradients** on product chrome (tree canvas dot-grid background is the one exception)
- **No border-radius values** outside the defined scale
- **No colors** outside the token system
- **No new typefaces**
- Gold `#8C7355` is an accent, never a large fill. Sage = living/success, Terracotta = deceased/error (never red)
- Motion: ease-out only `cubic-bezier(0.22,1,0.36,1)`; always provide `prefersReducedMotion()` fallback at 0ms

### Design Handoff

The product's visual system lives in `design_handoff_prosapiam/`. **Read `START_HERE.md` before building or restyling any UI.**

- **Tokens:** `design_handoff_prosapiam/design-system/colors_and_type.css` → installed as `src/lib/styles/tokens.css`
- **Reference UI** in `design_handoff_prosapiam/reference-ui/` — React fidelity mock, LOOK ONLY, never ship
- **Screen designs** in `design_handoff_prosapiam/design-reference/` — canonical references, LOOK ONLY, rebuild in Svelte 5
- **Spec:** `design_handoff_prosapiam/spec/ComponentBrief.txt` and `spec/DesignSpec.txt` — spec wins all conflicts

**Voice:** editorial, second-person, specific. Empty states are invitations ("The first memory you add will live here."), never error-toned.

---

## Project Structure

```
src/
├── lib/
│   ├── styles/tokens.css           — ALL tokens, fonts, base styles (imported once in root layout)
│   ├── server/
│   │   ├── supabase.ts             — Service-role client (NEVER import in .svelte or client .ts)
│   │   └── auth.ts                 — getUser(), requireAuth() helpers
│   ├── supabase/
│   │   ├── client.ts               — Browser Supabase client
│   │   └── types.ts                — Generated DB types (regenerate after schema changes)
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── notifications.ts
│   │   ├── toasts.ts
│   │   └── tree.ts
│   ├── components/
│   │   ├── ui/                     — 24 core UI atoms (all complete)
│   │   ├── patterns/               — 6 product patterns P01–P05, P11 (all complete)
│   │   ├── tree/                   — empty (TreeCanvas, PersonNode to build)
│   │   ├── person/                 — empty (PersonCard, ProfileHeader to build)
│   │   ├── media/                  — empty (MediaGrid, Uploader, MediaViewer to build)
│   │   ├── memory/                 — empty (MemoryCard, MemoryEditor to build)
│   │   └── activity/               — empty (ActivityFeed, ActivityItem to build)
│   └── utils/
│       ├── dates.ts
│       ├── storage.ts              — Supabase Storage upload helpers
│       ├── activity.ts             — Write activity log entries
│       ├── permissions.ts          — isOwner(), canEdit() helpers
│       └── motion.ts               — prefersReducedMotion() helper
│       (plans.ts — TODO: plan limits and enforcement — not yet created)
├── routes/
│   ├── +layout.svelte              — Root shell, PostHog init (TODO), Sentry init (TODO)
│   ├── (marketing)/+page.svelte    — Landing page (stub)
│   ├── (auth)/                     — login ✓, signup ✓, forgot-password ✓, reset-password ✓
│   ├── (onboarding)/onboarding/    — full-screen 3-step flow, no TopNav, auth-gated ✓
│   ├── (app)/                      — All protected routes
│   │   ├── dashboard/              — S2: surface + Supabase data layer ✓
│   │   ├── account/                — stub
│   │   └── trees/
│   │       ├── new/                — stub form for creating a tree
│   │       └── [treeId]/           — S3: surface + data layer ✓ (@xyflow/svelte TODO)
│   │           ├── activity/       — stub
│   │           ├── collaborators/  — stub
│   │           ├── settings/       — stub
│   │           └── persons/
│   │               ├── new/        — stub form for adding a person
│   │               └── [personId]/ — S4: surface + Supabase data layer ✓
│   │                   ├── edit/   — stub
│   │                   ├── media/  — stub
│   │                   └── memories/ — stub
│   └── api/
│       ├── auth/signout/           — DELETE session endpoint
│       └── trees/[treeId]/         — tree · persons · relationships · memories · media · collaborators
└── admin/                          — Founder dashboard (not yet built)
```

---

## Database Schema

All tables in Supabase. RLS enabled on every table. All timestamps UTC.

```sql
profiles          — id (own UUID, NOT same as auth.users.id), auth_user_id (FK → auth.users),
                    display_name, avatar_url, created_at, updated_at
                  -- plan/storage/lemon_squeezy columns NOT YET added — will come with billing

trees             — id, owner_id (→ profiles.id), name, description, is_public,
                    created_at, updated_at

tree_collaborators — id, tree_id (→ trees.id), profile_id (→ profiles.id),
                     role (viewer|editor), invited_by (→ profiles.id, nullable),
                     invited_at, accepted_at (nullable)

persons           — id, tree_id (→ trees.id), created_by (→ profiles.id),
                    first_name, last_name (nullable), maiden_name (nullable),
                    birth_date (nullable), birth_place (nullable), primary_residence (nullable),
                    death_date (nullable), occupation (nullable), bio (nullable),
                    highlights (nullable), avatar_url (nullable), is_living,
                    created_at, updated_at

relationships     — id, tree_id (→ trees.id), person_a_id (→ persons.id),
                    person_b_id (→ persons.id), type (relationship_type enum), is_current,
                    start_date (nullable), end_date (nullable), created_at
                  -- relationship_type enum:
                  --   spouse | divorced | partner           ← symmetric pairs
                  --   parent_child                          ← person_a IS THE PARENT of person_b
                  --   adopted_parent_child                  ← person_a IS THE ADOPTIVE PARENT
                  --   step_parent_child                     ← person_a IS THE STEP-PARENT
                  --   sibling | half_sibling | step_sibling ← symmetric pairs
                  -- NEVER store child/grandchild — those are derived by reversing parent_child
                  -- is_current=false = historical (divorced, ended partnership); hidden in
                  -- canvas by default, visible on profile

memories          — id, tree_id (→ trees.id), created_by (→ profiles.id),
                    title, body (nullable), memory_date (nullable),
                    memory_date_precision (date_precision enum, default 'exact'),
                    created_at, updated_at
                  -- date_precision enum: exact | month | year | decade | circa
                  -- Use 'circa' for approximate dates ("around 1920"),
                  -- 'decade' for "sometime in the 1960s", etc.

memory_persons    — memory_id, person_id  ← junction: memory ↔ person tags

media             — id, tree_id (→ trees.id), created_by (→ profiles.id),
                    media_type (media_type enum: image|video|audio|document),
                    storage_path (path within Supabase Storage — NOT a full URL),
                    title (nullable), caption (nullable),
                    file_size_bytes (bigint, default 0), created_at
                  -- Always generate signed URLs on the fly; never store them in the DB
                  -- file_size_bytes is required for storage quota enforcement

media_persons     — media_id, person_id  ← junction: media ↔ person tags

tags / memory_tags — NOT YET CREATED — memory categorization (planned)

activity_log      — APPEND ONLY: id, tree_id (→ trees.id), actor_id (→ profiles.id, nullable),
                    action (activity_action enum: created|updated|deleted|uploaded|tagged|invited),
                    entity_type (text), entity_id (uuid), diff (jsonb, nullable), created_at
```

**Key decisions:**
- `profiles.id` is its **own UUID** — it is NOT equal to `auth.uid()`. Always look up via `auth_user_id = user.id`. All FK references (`trees.owner_id`, `persons.created_by`, `tree_collaborators.profile_id`, etc.) use `profiles.id`, not the auth user ID.
- `current_profile_id()` — `SECURITY DEFINER` SQL function. Returns `profiles.id` for `auth.uid()`. Used in all RLS policies. Must stay SECURITY DEFINER or policies recurse.
- `is_tree_collaborator(tree_id uuid)` — `SECURITY DEFINER` SQL function. Used in the trees SELECT policy to avoid a circular RLS cycle between `trees` and `tree_collaborators`.
- Profile row created automatically via database trigger on `auth.users` insert
- Activity log: never add UPDATE or DELETE RLS policies
- Storage paths: `avatars/{profile_id}` and `tree-media/{tree_id}/{media_id}`
- `media.storage_path` is a bucket-relative path — generate signed URLs server-side on demand, never persist them

---

## Authentication Flow

1. Sign in via Supabase Auth — email/password or Google OAuth
2. `hooks.server.ts` attaches Supabase client + refreshes session on every request
3. `(app)/+layout.server.ts` redirects to `/signin` if no session
4. On signup: database trigger auto-creates `profiles` row

**Auth is complete. Do not modify without good reason.**

---

## Subscription Plans

Three tiers. Plan gating always enforced **server-side** — never trust client-side plan checks. Full limits will live in `src/lib/utils/plans.ts` (TODO — not yet created).

| Plan | Storage | Trees | Collaborators | Media |
| --- | --- | --- | --- | --- |
| Remembrance (free) | 500MB | 1 | 0 | Images only (2MB max) |
| Heritage ($6/mo) | 50GB | 3 | 10 | Images + audio |
| Legacy ($12/mo) | Unlimited | ∞ | ∞ | Images + audio + video |

**Every upload endpoint must check:** storage quota · tree count · collaborator count · allowed media types.

**Error messages must be warm:** "You've reached your storage limit on the Remembrance plan. Upgrade to Heritage for 50GB." Never expose raw error strings.

Show upgrade prompt (warm, non-aggressive) when user hits 80% of storage limit.

---

## Lemon Squeezy Integration

Merchant of Record — handles all tax compliance. Use test mode until founder confirms DBA/LLC setup with attorney.

Webhook at `/api/webhooks/lemonsqueezy` (HMAC-SHA256 signature check required). Handle:
- `subscription_created` — update profile plan + storage limit, send welcome email
- `subscription_updated` — handle upgrade/downgrade, adjust storage limit
- `subscription_cancelled` — downgrade to remembrance at period end, send confirmation
- `subscription_expired` — enforce remembrance limits, notify user
- `subscription_payment_failed` — send payment failed email, 7-day grace period before downgrade

Use hosted checkout — no custom payment forms. Pass user email + Supabase user ID as custom data.

---

## File Storage

Two Supabase Storage buckets:
- `avatars` — public read, images only, max 2MB
- `tree-media` — private, signed URLs only, plan-gated

Upload flow: client requests signed URL from `/api/upload` → server validates plan limits → client uploads directly → on success update `media` table + increment `storage_used_bytes`. Never update counter on failure.

Image thumbnails via `sharp` (server-side): 128×128 and 48×48 for avatars, 400×300 for memory card thumbnails.

---

## Family Tree Canvas

Uses `@xyflow/svelte` + `dagre` (both installed ✓).

```svelte
<script lang="ts">
  import { SvelteFlow, Background, MiniMap } from '@xyflow/svelte'
  import '@xyflow/svelte/dist/style.css'
  import FamilyTreeNode from '$lib/components/patterns/FamilyTreeNode.svelte'
  import RelationshipEdge from '$lib/components/patterns/RelationshipConnector.svelte'

  const nodeTypes = { familyNode: FamilyTreeNode }
  const edgeTypes = { relationship: RelationshipEdge }
</script>

<SvelteFlow {nodeTypes} {edgeTypes} fitView style="background: var(--color-bg-page)">
  <MiniMap />
</SvelteFlow>
```

**Auto-layout (Dagre):** `rankdir: 'TB'`, `ranksep: 80`, `nodesep: 40`. Node size: 120×100. Offset position by half-node on render.

**Node zoom variants:**
- `zoom >= 0.85` — full: 48px avatar, name, dates
- `zoom >= 0.60` — medium: 32px avatar, name only
- `zoom < 0.60` — compact: 24px avatar chip only

**Canvas rules:**
- Background: Parchment `#F7F4EE` — the canvas feels like paper
- No grid lines in default auto-layout mode
- Connectors: orthogonal routing, no diagonals, no curves, no arrowheads
- Minimum 44px touch target on nodes regardless of visual size
- Accessibility: list-view alternative in toolbar (table of all persons)
- Performance: virtualize — only render nodes within viewport + 200px buffer

---

## Screen Fidelity Protocol

Before building any screen, open its reference in `design_handoff_prosapiam/design-reference/` and match exactly — structure, spacing, hierarchy, type scale, and copy.

| Screen | Reference file |
| --- | --- |
| Landing | `design-reference/Landing Page.html` |
| Onboarding | `design-reference/Onboarding.html` |
| Dashboard | `design-reference/Dashboard.html` |
| Tree canvas | `design-reference/FamilyTreeView.html` |
| Profile | `design-reference/ProfileHeader.html` + `ProfileTimeline.html` |

After building: compare side-by-side and reconcile every difference before marking done. HTML reference is authoritative for layout; `tokens.css` for values; spec resolves conflicts.

---

## Admin Dashboard (/admin)

Password protected via `ADMIN_PASSWORD` env var. Never indexed (noindex header). Desktop only.

Sections: Growth metrics · Revenue (Lemon Squeezy API) · Storage (by tier, users at >80%) · Error monitoring (Sentry link) · System health.

---

## Email Templates (Resend)

Use Plus Jakarta Sans for UI/headings, Cormorant Garamond for body text, Parchment backgrounds.

Required: Welcome · Payment confirmation · Storage warning (80%) · Storage limit reached · Payment failed (7-day grace noted) · Subscription cancelled (no guilt, data retention noted) · Password reset · Collaborator invitation.

---

## Key Conventions

**Data fetching:** Always in `+page.server.ts` / `+layout.server.ts`. Use `event.locals.supabase` server-side; `$lib/supabase/client.ts` only for real-time subscriptions.

**Mutations:** Simple → SvelteKit form actions. Complex/async → `src/routes/api/`. Always write to `activity_log` after meaningful mutations (`$lib/utils/activity.ts`).

**Permissions:** Verify server-side. Use `isOwner()` and `canEdit()` from `$lib/utils/permissions.ts`. RLS is the last line of defence, not the first.

**TypeScript:** All Supabase queries use generated types from `$lib/supabase/types.ts`. No `any` — use `unknown` and narrow. Regenerate types after schema changes:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
```

**Error handling:** Use SvelteKit `error()` for 404s and permission errors. Never expose raw Supabase error strings. All user-facing error messages are warm and human.

**Styling:** Scoped `<style>` blocks only. No inline styles except dynamic values (e.g. node position on canvas). No Tailwind, no utility classes.

---

## Accessibility — Non-Negotiable

WCAG 2.1 AA throughout.

- All interactive elements keyboard navigable
- Focus management on every route change — `afterNavigate` moves focus to `h1` (already in root layout)
- All images: meaningful alt text — avatar alt is person's name only
- All form inputs: programmatically associated labels (for/id pairs)
- All icon-only buttons: `aria-label`
- Tree canvas: list-view alternative accessible via toolbar
- Color contrast: WCAG AA on all backgrounds
- All transitions: respect `prefers-reduced-motion` with 0ms fallback

---

## Environment Variables

```bash
PUBLIC_SUPABASE_URL=          # safe to expose
PUBLIC_SUPABASE_ANON_KEY=     # safe to expose
SUPABASE_SERVICE_ROLE_KEY=    # server only — never in .svelte or client .ts
LEMONSQUEEZY_API_KEY=         # server only
LEMONSQUEEZY_STORE_ID=        # server only
LEMONSQUEEZY_WEBHOOK_SECRET=  # server only
RESEND_API_KEY=               # server only
RESEND_FROM_EMAIL=hello@prosapiam.com
PUBLIC_POSTHOG_KEY=
PUBLIC_POSTHOG_HOST=https://app.posthog.com
PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=            # server only
ADMIN_PASSWORD=               # server only
PUBLIC_APP_URL=
```

---

## Commands

```bash
npm run dev        # dev server
npm run check      # type check
npm run lint       # lint
npm run format     # format
npm run build      # production build
npm run preview    # preview build
```

---

## Packages Still to Install

```bash
npm install @lemonsqueezy/lemonsqueezy-js posthog-js
npm install @sentry/sveltekit sharp
```

---

## Launch Checklist

- [ ] All environment variables set in Vercel
- [ ] Supabase RLS enabled and tested on every table
- [ ] Lemon Squeezy webhook endpoint verified, signing secret confirmed
- [ ] Supabase Storage CORS configured for production domain
- [ ] Sentry source maps uploading correctly
- [ ] PostHog events firing on key actions (signup, plan upgrade, tree created, memory added)
- [ ] All Resend email templates tested end to end
- [ ] robots.txt — /admin disallowed, noindex header on admin routes
- [ ] Privacy policy and Terms of service pages live (required by Lemon Squeezy)
- [ ] Cookie consent banner (GDPR — required for EU users)
- [ ] GDPR data deletion flow — user can delete account + all data from account settings
- [ ] Storage quota enforcement tested at each plan limit
- [ ] Plan gating tested on all three tiers in staging
- [ ] Google OAuth tested in production environment
- [ ] Password reset flow tested end to end
- [ ] Mobile responsive verified at 390px viewport
- [ ] Reduced motion tested — all animations have 0ms fallback
- [ ] Keyboard navigation tested on all four core screens
- [ ] Tree canvas list-view alternative tested with keyboard only
- [ ] Lighthouse score 90+ on landing page and dashboard
- [ ] Founder confirms DBA/LLC setup with attorney before Lemon Squeezy goes live

---

## Important Reminders

- **Never import `$lib/server/` in `.svelte` or client `.ts`** — leaks service role key
- **Always use `event.locals.supabase`** in server load functions, not the browser client
- **RLS is active** — missing data → check RLS policies first (queries return empty, not errors)
- **`profiles.id` ≠ `auth.uid()`** — `profiles` has its own UUID PK. To get the profile for the current user, query `profiles` where `auth_user_id = user.id`. All FKs (`owner_id`, `created_by`, `profile_id`, `actor_id`, `invited_by`) use `profiles.id`.
- **`(app)/+layout.server.ts` loads `profile`** — child routes access `profiles.id` via `await parent()`, not a second query.
- **`profiles` table**, not `auth.users`, is the source of truth for user data
- **`is_current` on relationships** controls tree canvas rendering — always set correctly
- **Activity log is append-only** — never add UPDATE or DELETE policies to `activity_log`
- **`current_profile_id()` and `is_tree_collaborator()` must stay `SECURITY DEFINER`** — removing this breaks RLS with infinite recursion
- **Lemon Squeezy in test mode** until founder confirms DBA/LLC setup
- **Svelte 5 runes throughout** — verify any external examples are Svelte 5, not Svelte 4
- **Emotional register is paramount** — error messages, empty states, and edge cases need the same warmth as primary screens
- **This product holds something precious** — family histories, memories of people who are gone, stories that exist nowhere else

---

## Current Status

**Phase 1 — Foundation: ✓ COMPLETE**
- CSS token system, root layout shell, font files, TopNav

**Phase 2 — Core UI atoms: ✓ COMPLETE**
- All 24 atoms: Button, Input, Avatar, Badge, Tag, Card, Tabs, Icon, TopNav, Textarea, Select, Checkbox, Radio, Toggle, Divider, Modal, Drawer, Tooltip, Dropdown, EmptyState, LoadingSkeleton, Alert, Toast

**Phase 3 — Product patterns: ✓ COMPLETE**
- P01 FamilyTreeNode, P02 RelationshipConnector, P03 PersonSummaryCard, P04 PersonProfileHeader, P05 MemoryStoryCard, P11 ProfileTimeline

**Phase 4 — Screens (in progress):**
- [x] S1 — Login + Signup + forgot-password + reset-password ✓
- [x] S2 — Dashboard: surface + Supabase data layer ✓
- [x] S3 — Tree canvas: surface + data layer ✓ + @xyflow/svelte + dagre integrated ✓
- [x] S4 — Person profile: surface + data layer ✓
- [x] API mutation endpoints — persons, relationships, memories, media, collaborators wired
- [x] Route stubs — trees/new, persons/new, person/edit, activity, collaborators, settings, account
- [x] Onboarding flow — 3-step Welcome → Begin with yourself → First leaf ✓
- [x] @xyflow/svelte + dagre — interactive tree canvas ✓
- [ ] Landing page — all sections, pricing
- [x] forgot-password + reset-password auth routes ✓
- [x] plans.ts — plan limit enforcement utility ✓
- [x] Memory editor ✓
- [ ] Media upload flow
- [ ] Collaborator invitations
- [ ] Activity log screen
- [ ] Account / settings page
- [ ] Admin dashboard
- [ ] Lemon Squeezy — install, integration, webhook handler
- [ ] PostHog — install and initialize
- [ ] Sentry — install and initialize
- [ ] Vercel deployment
