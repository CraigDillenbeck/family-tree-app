# MyNamesake — Claude Code Project Memory

> This file is read by Claude Code at the start of every session.
> It is the single source of truth for the entire project — architecture, design system, conventions, and build status.
> Keep it updated as the project evolves.

---

## What This App Is

MyNamesake is a consumer web app for building beautiful family trees and preserving family memories. Users can:

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
| Tree canvas | @xyflow/svelte | XYFlow official Svelte port |
| Tree layout | Dagre | Auto-layout algorithm |
| Styling | CSS custom properties + scoped Svelte styles | **No Tailwind. No utility classes.** |

---

## Svelte 5 — Non-Negotiable

The project uses **Svelte 5**. All components must use runes syntax. No Svelte 4 patterns anywhere. If referencing documentation or examples online, verify they are Svelte 5 compatible — much existing Svelte content is Svelte 4.

**Use runes — always:**
```svelte
<script lang="ts">
  // Props
  let { name, age = 0 }: { name: string; age?: number } = $props()

  // State
  let count = $state(0)
  let doubled = $derived(count * 2)

  // Effects
  $effect(() => {
    console.log(count)
  })
</script>

<!-- Event handling -->
<button onclick={() => count++}>Click</button>
```

**Never use Svelte 4 patterns:**
```svelte
<!-- WRONG -->
<script>
  export let name        // use $props()
  let count = 0
  $: doubled = count * 2 // use $derived()
</script>
<button on:click={...}>  <!-- use onclick={...} -->
```

---

## Design System

### Typography — Three typefaces, strictly separated

| Typeface | Role | Never use for |
| --- | --- | --- |
| **Young Serif** | Display headlines, hero text, emotional anchors, pullquotes, plan names | UI chrome, buttons, labels, form fields |
| **Cormorant Garamond** | Narrative text, biographies, memory excerpts, story content | Navigation, buttons, labels, metadata |
| **League Spartan** | All UI chrome — labels, buttons, tabs, navigation, form fields, captions, badges | Story or narrative content |

**Non-negotiable typography rules:**
- Cormorant Garamond minimum **17px always** — never smaller
- No Cormorant Garamond **bold** — ever
- No Cormorant Garamond **ALL CAPS** — ever
- No **typeface mixing on the same line** — register shifts at element boundaries only
- Young Serif **Light (300)** and **Medium (500)** weights available
- Cormorant Garamond **italic** reserved for: sign-in panel tagline, memory card excerpts, plan description lines only — everything else regular upright
- League Spartan **Regular (400)** and **Medium (500)** only — max weight 500

**Font loading — @font-face in app.css:**
```css
@font-face {
  font-family: 'Young Serif';
  src: url('/fonts/YoungSerif-Regular.woff2') format('woff2');
  font-weight: 300;
  font-display: swap;
}
@font-face {
  font-family: 'Young Serif';
  src: url('/fonts/YoungSerif-Medium.woff2') format('woff2');
  font-weight: 500;
  font-display: swap;
}
@font-face {
  font-family: 'Cormorant Garamond';
  src: url('/fonts/CormorantGaramond-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Cormorant Garamond';
  src: url('/fonts/CormorantGaramond-Italic.woff2') format('woff2');
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}
@font-face {
  font-family: 'League Spartan';
  src: url('/fonts/LeagueSpartan-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'League Spartan';
  src: url('/fonts/LeagueSpartan-Medium.woff2') format('woff2');
  font-weight: 500;
  font-display: swap;
}
```

Place all font files in `/static/fonts/`.

### CSS Custom Properties — Complete Token System

All design values live as CSS custom properties in `app.css`. **Never hardcode a color, spacing, radius, or typography value.** Every value has a token. Use it.

```css
:root {
  /* ── Colors ── */
  --color-ink: #1C1A17;
  --color-ink-soft: #3D3A35;
  --color-warm-mid: #7A6F63;
  --color-warm-light: #C4B9A8;
  --color-parchment: #F7F4EE;
  --color-surface-1: #EDE8E0;
  --color-surface-2: #E5DDD2;
  --color-surface-3: #D9D0C4;
  --color-gold: #8C7355;
  --color-gold-light: #BFA882;
  --color-sage: #5A6B5C;
  --color-sage-tint: #E4EDE5;
  --color-terra: #8C4A38;
  --color-terra-tint: #F2E4E1;
  --color-border: #D6CFC4;

  /* ── Semantic color roles ── */
  --color-bg-page: #F7F4EE;
  --color-bg-surface-1: #EDE8E0;
  --color-bg-surface-2: #E5DDD2;
  --color-bg-surface-3: #D9D0C4;
  --color-bg-inverse: #1C1A17;
  --color-bg-inverse-muted: rgba(28,26,23,0.40);
  --color-text-primary: #1C1A17;
  --color-text-body: #3D3A35;
  --color-text-secondary: #7A6F63;
  --color-text-hint: #C4B9A8;
  --color-text-inverse: #F7F4EE;
  --color-text-inverse-muted: #C4B9A8;
  --color-accent: #8C7355;
  --color-accent-light: #BFA882;
  --color-success: #5A6B5C;
  --color-success-bg: #E4EDE5;
  --color-error: #8C4A38;
  --color-error-bg: #F2E4E1;
  --color-border-default: #D6CFC4;
  --color-border-subtle: rgba(28,26,23,0.07);
  --color-border-strong: #C4B9A8;
  --color-border-active: #8C7355;
  --color-border-inverse: rgba(247,244,238,0.15);
  --color-border-focus-ring: rgba(28,26,23,0.20);

  /* ── Typography ── */
  --font-display: 'Young Serif', Georgia, serif;
  --font-body: 'Cormorant Garamond', Georgia, serif;
  --font-ui: 'League Spartan', Arial, sans-serif;

  --font-size-display-xl: 56px;
  --font-size-display-l: 40px;
  --font-size-h1: 28px;
  --font-size-h2: 20px;
  --font-size-h3: 15px;
  --font-size-body-story: 17px;
  --font-size-body-ui: 15px;
  --font-size-label: 11px;
  --font-size-caption: 12px;
  --font-size-meta: 11px;

  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;

  --line-height-tight: 1.1;
  --line-height-heading: 1.25;
  --line-height-ui: 1.55;
  --line-height-story: 1.75;

  --letter-spacing-tight: -0.02em;
  --letter-spacing-base: 0em;
  --letter-spacing-label: 0.10em;

  --reading-width: 680px;

  /* ── Spacing ── */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-30: 120px;

  /* ── Border radius ── */
  --radius-none: 0px;
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* ── Borders ── */
  --border-default: 0.5px solid #D6CFC4;
  --border-subtle: 0.5px solid rgba(28,26,23,0.07);
  --border-strong: 0.5px solid #C4B9A8;
  --border-active: 0.5px solid #8C7355;
  --border-error: 0.5px solid #8C4A38;
  --border-inverse: 0.5px solid rgba(247,244,238,0.15);
  --border-focus-ring: 2px solid rgba(28,26,23,0.20);
  --border-featured: 1px solid #8C7355;

  /* ── Motion ── */
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-instant: 0ms;
  --dur-fast: 150ms;
  --dur-base: 280ms;
  --dur-slow: 480ms;
  --dur-long: 700ms;
  --stagger-delay: 40ms;
}

/* ── Base styles ── */
html {
  background-color: var(--color-bg-page);
  color: var(--color-text-primary);
  font-family: var(--font-ui);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Reduced motion — always respected ── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0ms !important;
    transition-duration: 0ms !important;
  }
}
```

### Non-Negotiable Design Rules

Violations here are regressions, not exceptions:

- **Never use pure white (#FFF)** as any background — Parchment `#F7F4EE` is the minimum
- **Never use pure black (#000)** for any text — Ink `#1C1A17` only
- **No drop shadows** anywhere in the UI — no `box-shadow` on any component
- **No gradients** anywhere in the UI
- **No border-radius values** outside the defined scale
- **No colors** outside the defined token system
- **No new typefaces** — Young Serif, Cormorant Garamond, League Spartan only

### Using Tokens in Svelte Components

```svelte
<style>
  .card {
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    transition: background var(--dur-fast) var(--ease),
                border-color var(--dur-fast) var(--ease);
  }

  .card:hover {
    background: var(--color-bg-surface-3);
    border: var(--border-strong);
  }

  .label {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .story-text {
    font-family: var(--font-body);
    font-size: var(--font-size-body-story);
    line-height: var(--line-height-story);
    color: var(--color-text-body);
    max-width: var(--reading-width);
  }
</style>
```

---

## Project Structure

```
src/
├── app.css                         — tokens, fonts, base styles (source of truth)
├── app.html                        — root HTML template
├── app.d.ts                        — locals type declarations
├── hooks.server.ts                 — Supabase session refresh on every request
├── lib/
│   ├── server/
│   │   ├── supabase.ts             — Service-role client (NEVER import in .svelte or client .ts)
│   │   └── auth.ts                 — getUser(), requireAuth() helpers
│   ├── supabase/
│   │   ├── client.ts               — Browser Supabase client
│   │   └── types.ts                — Generated DB types (regenerate after schema changes)
│   ├── lemonsqueezy/
│   │   └── client.ts               — Lemon Squeezy SDK setup
│   ├── stores/
│   │   ├── auth.ts                 — Current session store
│   │   ├── tree.ts                 — Active tree + persons cache
│   │   └── notifications.ts        — Activity feed store
│   ├── components/
│   │   ├── ui/                     — Core UI components (Button, Input, Modal, etc.)
│   │   ├── patterns/               — Product patterns (P01–P11)
│   │   ├── tree/                   — TreeCanvas, PersonNode, RelationshipLine
│   │   ├── person/                 — PersonCard, ProfileHeader, HighlightBadge
│   │   ├── media/                  — MediaGrid, Uploader, MediaViewer
│   │   ├── memory/                 — MemoryCard, MemoryEditor
│   │   └── activity/               — ActivityFeed, ActivityItem
│   └── utils/
│       ├── dates.ts
│       ├── storage.ts              — Supabase Storage upload helpers
│       ├── activity.ts             — Write activity log entries
│       ├── permissions.ts          — isOwner(), canEdit() helpers
│       ├── plans.ts                — Plan limits and enforcement
│       └── motion.ts               — prefersReducedMotion() helper
├── routes/
│   ├── +layout.server.ts           — Global session check
│   ├── +layout.svelte              — Root shell, PostHog init, Sentry init
│   ├── +layout.ts                  — Session passed to all pages
│   ├── (marketing)/                — Public pages, no auth required
│   │   └── +page.svelte            — Landing page
│   ├── (auth)/                     — Login, signup, OAuth callback
│   │   ├── signin/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (app)/                      — All protected routes (auto-guarded)
│   │   ├── +layout.server.ts       — Redirects to /signin if no session
│   │   ├── dashboard/
│   │   ├── trees/
│   │   │   ├── new/
│   │   │   └── [treeId]/
│   │   │       ├── +page.svelte    — Tree canvas (S3)
│   │   │       ├── settings/
│   │   │       ├── collaborators/
│   │   │       ├── activity/
│   │   │       └── persons/
│   │   │           ├── new/
│   │   │           └── [personId]/
│   │   │               ├── +page.svelte  — Person profile (S4)
│   │   │               ├── edit/
│   │   │               ├── memories/
│   │   │               └── media/
│   │   └── account/
│   └── api/
│       ├── trees/[treeId]/         — Mutation endpoints
│       ├── upload/                 — Signed upload URL generation
│       └── webhooks/
│           └── lemonsqueezy/       — Subscription lifecycle events
├── admin/                          — Founder dashboard (password protected)
│   ├── +layout.server.ts           — ADMIN_PASSWORD check
│   └── +page.svelte
static/
└── fonts/                          — All .woff2 font files
supabase/
└── migrations/                     — SQL migration files
```

---

## Database Schema

All tables in Supabase. RLS enabled on every table. All timestamps UTC.

```sql
-- Extends auth.users — created automatically via trigger on signup
profiles
  id                          uuid references auth.users primary key
  full_name                   text
  avatar_url                  text
  plan                        text default 'remembrance'  -- remembrance | heritage | legacy
  storage_used_bytes          bigint default 0
  storage_limit_bytes         bigint default 524288000    -- 500MB
  lemon_squeezy_customer_id   text
  lemon_squeezy_subscription_id text
  created_at                  timestamptz default now()
  updated_at                  timestamptz default now()

-- Family trees
trees
  id          uuid primary key default gen_random_uuid()
  owner_id    uuid references profiles(id)
  name        text not null
  description text
  is_active   boolean default true
  created_at  timestamptz default now()
  updated_at  timestamptz default now()

-- Collaborators on a tree
tree_collaborators
  id          uuid primary key default gen_random_uuid()
  tree_id     uuid references trees(id)
  user_id     uuid references profiles(id)
  role        text default 'viewer'  -- viewer | editor
  invited_by  uuid references profiles(id)
  created_at  timestamptz default now()

-- Individuals within a tree
persons
  id              uuid primary key default gen_random_uuid()
  tree_id         uuid references trees(id)
  first_name      text not null
  last_name       text
  birth_date      date
  death_date      date
  birthplace      text
  nationality     text
  occupation      text
  biography       text
  avatar_url      text
  is_living       boolean default true
  is_root         boolean default false  -- the tree's root/starting person
  created_at      timestamptz default now()
  updated_at      timestamptz default now()

-- Relationships between two persons
relationships
  id                uuid primary key default gen_random_uuid()
  tree_id           uuid references trees(id)
  person_a_id       uuid references persons(id)
  person_b_id       uuid references persons(id)
  relationship_type text not null
  -- spouse | divorced | parent_child | adopted | step | uncertain
  is_current        boolean default true
  -- is_current=false = historical (ex-spouse etc.)
  -- Hidden in tree canvas, visible on profile page
  created_at        timestamptz default now()

-- Written memories and stories
memories
  id                    uuid primary key default gen_random_uuid()
  tree_id               uuid references trees(id)
  title                 text not null
  content               text
  memory_date           date
  memory_date_precision text default 'full'  -- full | month_year | year | approximate
  author_id             uuid references profiles(id)
  created_at            timestamptz default now()
  updated_at            timestamptz default now()

-- Junction: memory ↔ person tags (one memory can tag multiple people)
memory_persons
  memory_id   uuid references memories(id)
  person_id   uuid references persons(id)
  primary key (memory_id, person_id)

-- Uploaded media files
media
  id               uuid primary key default gen_random_uuid()
  tree_id          uuid references trees(id)
  owner_id         uuid references profiles(id)
  file_url         text not null
  file_type        text not null  -- image | audio | video | document
  file_size_bytes  bigint not null
  caption          text
  created_at       timestamptz default now()

-- Junction: media ↔ person tags
media_persons
  media_id    uuid references media(id)
  person_id   uuid references persons(id)
  primary key (media_id, person_id)

-- Memory tags/categories
tags
  id       uuid primary key default gen_random_uuid()
  tree_id  uuid references trees(id)
  name     text not null
  created_at timestamptz default now()

memory_tags
  memory_id  uuid references memories(id)
  tag_id     uuid references tags(id)
  primary key (memory_id, tag_id)

-- Immutable audit trail — append only, no UPDATE or DELETE policies
activity_log
  id           uuid primary key default gen_random_uuid()
  tree_id      uuid references trees(id)
  actor_id     uuid references profiles(id)
  action       text not null  -- person_added | memory_created | media_uploaded | etc.
  target_type  text           -- person | memory | media | relationship
  target_id    uuid
  metadata     jsonb
  created_at   timestamptz default now()
```

**Key design decisions:**
- `is_current = false` on relationships = historical (ex-spouse). Hidden in tree canvas, visible on profile page.
- `current_profile_id()` is a Supabase helper function used in all RLS policies.
- Activity log is append-only — no UPDATE or DELETE RLS policies on this table.
- Profile row is created automatically via a Supabase database trigger on `auth.users` insert.
- Supabase Storage paths: `avatars/{profile_id}` and `tree-media/{tree_id}/{media_id}`

---

## Authentication Flow

1. User signs in via Supabase Auth — email/password or Google OAuth
2. `hooks.server.ts` attaches Supabase client + refreshes session on every request
3. Session is passed to `event.locals.session` and `event.locals.supabase`
4. `(app)/+layout.server.ts` redirects to `/signin` if no session
5. On first signup: database trigger auto-creates `profiles` row
6. Google OAuth: configured in Supabase dashboard — tested and working

**Auth is the one area that is already complete. Do not modify the auth setup without good reason.**

---

## Subscription Plans

Three tiers. Plan gating is always enforced **server-side** — never trust client-side plan checks.

```typescript
// src/lib/utils/plans.ts
export const PLAN_LIMITS = {
  remembrance: {
    storage_bytes: 524_288_000,        // 500MB
    trees: 1,
    collaborators: 0,
    allowed_media_types: ['image/jpeg', 'image/png', 'image/webp'],
    max_image_size_bytes: 2_097_152,   // 2MB per image
    galleries: false,
    audio: false,
    video: false,
    price_monthly: 0,
    price_annual: 0,
  },
  heritage: {
    storage_bytes: 53_687_091_200,     // 50GB
    trees: 3,
    collaborators: 10,
    allowed_media_types: ['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav'],
    galleries: true,
    audio: true,
    video: false,
    price_monthly: 7.99,
    price_annual: 79.00,
  },
  legacy: {
    storage_bytes: Infinity,           // Unlimited — flag accounts >500GB for review
    trees: Infinity,
    collaborators: Infinity,
    allowed_media_types: ['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav', 'video/mp4'],
    galleries: true,
    audio: true,
    video: true,
    price_monthly: 14.99,
    price_annual: 139.00,
  },
} as const

export type Plan = keyof typeof PLAN_LIMITS
```

**Plan enforcement checklist — every relevant endpoint must check:**
- Storage quota before any upload
- Tree count before creating a new tree
- Collaborator count before sending an invite
- Media type allowed on this plan before accepting upload

**Error messages to users must be warm, not technical.** Example:
- ✓ "You've reached your storage limit on the Remembrance plan. Upgrade to Heritage for 50GB of space."
- ✗ "Error: storage_limit_exceeded"

**Show upgrade prompt** (warm, non-aggressive) when user reaches 80% of storage limit.

---

## Lemon Squeezy Integration

Lemon Squeezy is the Merchant of Record — they handle all payment processing, US sales tax, EU VAT, and international tax compliance. Use test mode credentials until the founder confirms business/DBA setup with their attorney.

```typescript
// src/lib/lemonsqueezy/client.ts
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy-js'
import { LEMONSQUEEZY_API_KEY } from '$env/static/private'

lemonSqueezySetup({ apiKey: LEMONSQUEEZY_API_KEY })
```

**Webhook handler at `/api/webhooks/lemonsqueezy`:**

```typescript
import { json } from '@sveltejs/kit'
import crypto from 'crypto'
import { LEMONSQUEEZY_WEBHOOK_SECRET } from '$env/static/private'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  const rawBody = await request.text()
  const signature = request.headers.get('x-signature')
  const hash = crypto
    .createHmac('sha256', LEMONSQUEEZY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex')

  if (hash !== signature) return json({ error: 'Invalid signature' }, { status: 401 })

  const event = JSON.parse(rawBody)

  switch (event.meta.event_name) {
    case 'subscription_created':
      // Update profile plan + storage limit. Send welcome email via Resend.
      break
    case 'subscription_updated':
      // Handle upgrade or downgrade. Adjust storage limit.
      break
    case 'subscription_cancelled':
      // Downgrade to remembrance at period end. Send confirmation email.
      break
    case 'subscription_expired':
      // Enforce remembrance limits. Notify user.
      break
    case 'subscription_payment_failed':
      // Send payment failed email. 7-day grace period before downgrade.
      break
  }

  return json({ received: true })
}
```

**Checkout:** Use Lemon Squeezy hosted checkout — do not build custom payment forms. Pass user email and Supabase user ID as custom data. Upgrade/downgrade via Lemon Squeezy customer portal from the account/settings page.

---

## File Storage

Supabase Storage with two buckets:
- `avatars` — public read. Person profile thumbnails. Images only. Max 2MB.
- `tree-media` — private, signed URLs only. Photos, audio, video. Plan-gated.

**Upload flow — always server-side validation:**
1. Client requests upload URL from `/api/upload`
2. Server checks plan limits and storage quota — reject if exceeded
3. Server generates signed upload URL via Supabase Storage
4. Client uploads directly to storage — never through your server
5. On success: update `media` table, increment `storage_used_bytes` on profile
6. On failure: do not update storage counter

**Image thumbnails:** Generate on upload — 128×128px and 48×48px for avatars, 400×300px for memory card thumbnails. Use `sharp` server-side.

---

## Family Tree Canvas

Use `@xyflow/svelte` — the official XYFlow Svelte port (same team as React Flow).

```svelte
<script lang="ts">
  import { SvelteFlow, Background, MiniMap } from '@xyflow/svelte'
  import '@xyflow/svelte/dist/style.css'
  import FamilyTreeNode from '$lib/components/patterns/FamilyTreeNode.svelte'
  import RelationshipEdge from '$lib/components/patterns/RelationshipConnector.svelte'

  const nodeTypes = { familyNode: FamilyTreeNode }
  const edgeTypes = { relationship: RelationshipEdge }
</script>

<SvelteFlow
  {nodeTypes}
  {edgeTypes}
  fitView
  style="background: var(--color-bg-page)"
>
  <MiniMap />
</SvelteFlow>
```

**Auto-layout with Dagre:**
```typescript
// src/lib/utils/treeLayout.ts
import dagre from 'dagre'

export function applyTreeLayout(nodes: Node[], edges: Edge[]) {
  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 40 })
  nodes.forEach((node) => graph.setNode(node.id, { width: 120, height: 100 }))
  edges.forEach((edge) => graph.setEdge(edge.source, edge.target))
  dagre.layout(graph)
  return nodes.map((node) => {
    const pos = graph.node(node.id)
    return { ...node, position: { x: pos.x - 60, y: pos.y - 50 } }
  })
}
```

**Node zoom variants** — trigger based on SvelteFlow viewport zoom level:
- `zoom >= 0.85` — full: 48px avatar, name, dates
- `zoom >= 0.60` — medium: 32px avatar, name only
- `zoom < 0.60` — compact: 24px avatar chip only

**Canvas rules:**
- Background: Parchment `#F7F4EE` — the canvas feels like paper, not a screen
- No grid lines in default auto-layout mode
- Connectors use orthogonal routing — no diagonal lines, no curved paths, no arrowheads
- Minimum touch target on nodes: 44px enforced via padding regardless of visual size
- Accessibility: list-view alternative in toolbar — table of all persons for keyboard/screen reader users
- Performance: virtualize nodes — only render nodes within viewport + 200px buffer

---

## Animations and Transitions

Use Svelte's built-in transition directives. No external animation library.

```svelte
<script lang="ts">
  import { fade, fly } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import { prefersReducedMotion } from '$lib/utils/motion'

  const dur = prefersReducedMotion() ? 0 : 280
</script>

{#if visible}
  <div transition:fade={{ duration: dur, easing: cubicOut }}>content</div>
{/if}

{#if drawerOpen}
  <div transition:fly={{ x: 320, duration: prefersReducedMotion() ? 0 : 480, easing: cubicOut }}>
    drawer content
  </div>
{/if}
```

```typescript
// src/lib/utils/motion.ts
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
```

**Always check `prefersReducedMotion()` before any animation. Always provide an instant (0ms) fallback.**

---

## Component Build Order

Build in this order. Each component fully built and tested before moving to the next. Do not build screens before their components are complete.

**Phase 1 — Foundation:**
1. `app.css` — all tokens, fonts, base styles
2. Root `+layout.svelte` — Supabase session, PostHog init, Sentry init
3. Layout components — AppLayout (with nav), AuthLayout, AdminLayout

**Phase 2 — Core UI components** (reference Component Library Brief):
4. `Button.svelte` — Primary, Secondary, Ghost, Destructive + all states
5. `Input.svelte` — all variants + all states
6. `Textarea.svelte`
7. `Select.svelte`
8. `Checkbox.svelte` · `Radio.svelte` · `Toggle.svelte`
9. `Badge.svelte` — all semantic variants
10. `Tag.svelte` — Static, Dismissible, Clickable
11. `Avatar.svelte` — all sizes, photo + initials fallback, deceased tint
12. `Divider.svelte` — all variants including with-label
13. `Tabs.svelte` — underline variant, Gold active indicator
14. `Card.svelte` — base component
15. `Modal.svelte` — focus trap, reduced motion aware
16. `Drawer.svelte` — right edge and bottom sheet variants
17. `Tooltip.svelte`
18. `Dropdown.svelte` — keyboard navigation
19. `EmptyState.svelte` — full screen and section level
20. `LoadingSkeleton.svelte` — opacity pulse
21. `Alert.svelte` — all semantic variants
22. `Toast.svelte` — Terra error, Sage success

**Phase 3 — Product patterns** (reference Component Library Brief Part II):
23. `PersonSummaryCard.svelte` (P03) — interactive, static, compact variants
24. `MemoryStoryCard.svelte` (P05) — standard, with media, featured, compact
25. `PersonProfileHeader.svelte` (P04) — living and deceased variants
26. `FamilyTreeNode.svelte` (P01) — all zoom levels and states
27. `RelationshipConnector.svelte` (P02) — all types and states
28. `ProfileTimeline.svelte` (P11) — with year dividers

**Phase 4 — Screens:**
29. Landing page `(marketing)/+page.svelte` — all sections, pricing
30. S1 — `(auth)/signin` and `(auth)/signup`
31. S2 — `(app)/dashboard` — multi-tree support, tree switcher
32. S4 — `(app)/trees/[treeId]/persons/[personId]` — all four tabs
33. S3 — `(app)/trees/[treeId]` — canvas
34. Onboarding flow — post-signup, first tree creation
35. `(app)/account` — profile, plan, billing, storage usage
36. `admin/` — founder dashboard

---

## Admin Dashboard (/admin)

Internal founder dashboard. Password protected via `ADMIN_PASSWORD` env variable checked in `+layout.server.ts`. Never indexed by search engines (noindex header). Desktop only — no mobile optimization needed.

```typescript
// src/routes/admin/+layout.server.ts
import { redirect } from '@sveltejs/kit'
import { ADMIN_PASSWORD } from '$env/static/private'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ cookies }) => {
  const auth = cookies.get('admin_auth')
  if (auth !== ADMIN_PASSWORD) redirect(303, '/admin/login')
}
```

**Sections:** Growth metrics (users, signups, plan breakdown) · Revenue (MRR, ARR, transactions from Lemon Squeezy API) · Storage (total used, by tier, users at >80% limit) · Error monitoring (Sentry link) · System health (Supabase + storage status, failed webhooks).

---

## Email Templates (Resend)

Build with React Email or plain HTML. All emails use the MyNamesake visual system — Young Serif headlines, Cormorant Garamond body, League Spartan UI text, Parchment backgrounds, Ink text.

**Required templates:**
1. Welcome — on signup
2. Payment confirmation — on successful subscription
3. Storage warning (80%) — warm, non-alarming, upgrade CTA
4. Storage limit reached — clear, helpful, upgrade CTA
5. Payment failed — 7-day grace period noted
6. Subscription cancelled — warm, no guilt, data retention noted
7. Password reset — simple, functional
8. Collaborator invitation — inviter's name prominent, accept CTA

---

## Key Conventions

### Data fetching
- Always fetch in `+page.server.ts` or `+layout.server.ts` — never directly in components
- Use `event.locals.supabase` (server-side) in load functions
- Use `$lib/supabase/client.ts` (browser) only for real-time subscriptions

### Mutations
- Simple form actions go in `+page.server.ts` as SvelteKit form actions
- Complex/async mutations go in `src/routes/api/` endpoints
- **Always write to `activity_log`** after any meaningful mutation — use `$lib/utils/activity.ts`

### Permissions
- Never trust the client for permission checks — always verify server-side
- Use `$lib/utils/permissions.ts` helpers: `isOwner(tree, profileId)`, `canEdit(tree, collaborators, profileId)`
- RLS is the last line of defence, not the first

### TypeScript
- All Supabase queries use generated types from `$lib/supabase/types.ts`
- Regenerate after any schema change: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts`
- No `any` types — use `unknown` and narrow properly

### Error handling
- All server load functions handle errors gracefully and return typed errors
- Use SvelteKit's `error()` helper for 404s and permission errors
- Never expose raw Supabase error messages to the client
- Error messages to users are always warm and human — never technical strings

### Styling
- CSS custom properties defined in `app.css` — the single source of truth
- Scoped `<style>` blocks in Svelte components — no global class pollution
- No inline styles except for dynamic values (e.g. node position on the tree canvas)
- No Tailwind. No utility classes. CSS custom properties only.

---

## Accessibility — Non-Negotiable

WCAG 2.1 AA throughout.

- All interactive elements keyboard navigable
- Focus management on every route change — focus moves to `h1` or first interactive element
- All images have meaningful alt text — avatar alt is person's name only, never "profile photo of [name]"
- All form inputs have programmatically associated labels (for/id pairs)
- All icon-only buttons have `aria-label`
- Tree canvas has list-view alternative accessible via toolbar
- Color contrast meets WCAG AA on all backgrounds
- All transitions respect `prefers-reduced-motion`

**Route change focus management:**
```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { afterNavigate } from '$app/navigation'

  afterNavigate(() => {
    const heading = document.querySelector('h1')
    if (heading) {
      (heading as HTMLElement).setAttribute('tabindex', '-1')
      ;(heading as HTMLElement).focus()
    }
  })
</script>
```

---

## Environment Variables

Required in `.env.local`:

```bash
# Supabase (public — safe to expose to browser)
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=

# Supabase (private — server only)
SUPABASE_SERVICE_ROLE_KEY=

# Lemon Squeezy (private — server only)
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=

# Resend (private)
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@mynamesake.com

# PostHog (public)
PUBLIC_POSTHOG_KEY=
PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry (public + private)
PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Admin dashboard
ADMIN_PASSWORD=

# App
PUBLIC_APP_URL=
```

**Critical:** `PUBLIC_` prefix = safe to expose to browser. Never import `SUPABASE_SERVICE_ROLE_KEY`, `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_WEBHOOK_SECRET`, `RESEND_API_KEY`, `SENTRY_AUTH_TOKEN`, or `ADMIN_PASSWORD` in any `.svelte` file or client-side `.ts` file. Server files only (`+server.ts`, `+page.server.ts`, `+layout.server.ts`, `$lib/server/`).

---

## Commands

```bash
# Dev server
npm run dev

# Type check
npm run check

# Lint + format
npm run lint
npm run format

# Regenerate Supabase types (run after any schema change)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts

# Build
npm run build
npm run preview
```

---

## Packages to Install

The following packages are not yet in `package.json` and need to be added:

```bash
# Tree canvas
npm install @xyflow/svelte

# Tree auto-layout
npm install dagre
npm install -D @types/dagre

# Payments
npm install @lemonsqueezy/lemonsqueezy-js

# Error monitoring
npm install @sentry/sveltekit

# Analytics
npm install posthog-js

# Image processing (server-side thumbnails)
npm install sharp
```

---

## Launch Checklist

Before any production deployment:

- [ ] All environment variables set in Vercel
- [ ] Supabase RLS enabled and tested on every table
- [ ] Lemon Squeezy webhook endpoint verified, signing secret confirmed
- [ ] Supabase Storage CORS configured for production domain
- [ ] Sentry source maps uploading correctly
- [ ] PostHog events firing on key actions (signup, plan upgrade, tree created, memory added)
- [ ] All Resend email templates tested end to end
- [ ] robots.txt — /admin disallowed, noindex header on admin routes
- [ ] Privacy policy and Terms of service pages live (required by Lemon Squeezy as Merchant of Record)
- [ ] Cookie consent banner — required for EU users (GDPR)
- [ ] GDPR data deletion flow — user can delete account and all data from account settings
- [ ] Storage quota enforcement tested at each plan limit
- [ ] Plan gating tested on all three tiers — staging environment
- [ ] Google OAuth tested in production environment
- [ ] Password reset flow tested end to end
- [ ] Mobile responsive verified at 390px viewport
- [ ] Reduced motion tested — all animations have 0ms fallback
- [ ] Keyboard navigation tested on all four core screens
- [ ] Tree canvas list-view alternative tested with keyboard only
- [ ] Lighthouse score 90+ on landing page and dashboard
- [ ] Founder confirms DBA/LLC business setup with attorney before Lemon Squeezy goes live

---

## Important Reminders

- **Never import `$lib/server/` in a `.svelte` file or client-side `.ts`** — this leaks the service role key
- **Always use `event.locals.supabase`** in server load functions, not the browser client
- **RLS is active** — queries return empty results (not errors) if the user lacks access. Missing data → check RLS policies first.
- **The `profiles` table, not `auth.users`**, is the source of truth for user data in the app
- **`is_current` on relationships** controls what the tree canvas renders — always set this correctly
- **Activity log is append-only** — never add UPDATE or DELETE policies to `activity_log`
- **Lemon Squeezy in test mode** until the founder confirms business/DBA setup with their attorney
- **Svelte 5 runes throughout** — if in doubt about syntax, check Svelte 5 docs specifically
- **The emotional register of this product is paramount** — error messages, empty states, loading states, and edge cases all need the same warmth and care as the primary screens. A frustrated or confused experience anywhere undermines the entire product.
- **This product holds something precious** — family histories, memories of people who are gone, stories that exist nowhere else. Build with that in mind.

---

## Current Status

- [x] Database schema designed and migrated
- [x] Project scaffolded — SvelteKit 5, TypeScript, Vercel adapter
- [x] Supabase configured — SSR client, server client, hooks
- [x] Google OAuth — configured in Supabase, tested and working
- [x] Design system — fully specified in Claude Design (all tokens, components, screens)
- [x] GitHub repository connected
- [ ] CSS token system implemented in app.css
- [ ] Font files added to /static/fonts/
- [ ] Auth flow complete end to end (signin, signup, forgot password)
- [ ] Lemon Squeezy — packages installed, integration built
- [ ] PostHog — installed and initialized
- [ ] Sentry — installed and initialized
- [ ] Landing page built
- [ ] S1 — Sign In / Create Account
- [ ] S2 — Dashboard (multi-tree)
- [ ] S3 — Family Tree Canvas
- [ ] S4 — Person Profile Page
- [ ] Media upload flow
- [ ] Memory editor
- [ ] Collaborator invitations
- [ ] Activity log
- [ ] Account / settings page
- [ ] Admin dashboard
- [ ] Vercel deployment