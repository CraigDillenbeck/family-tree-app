# Prosapia — Design Handoff for Claude Code

**Read this first.** This bundle hands the **Prosapia design system** to the existing
**SvelteKit + Supabase** codebase (`CraigDillenbeck/family-tree-app`).
It is written to be dropped into that repo and consumed by Claude Code.

---

## 0. What this bundle is (and is not)

- **It is** the visual + interaction + content system for the product: design tokens, a
  component build-spec, written voice/tone rules, brand assets, fonts, and **reference UI**.
- The reference UI in `reference-ui/` is built in **React/JSX as a fidelity mock** — it shows
  *exactly how things should look and behave*. **It is not the code you ship.** The target app
  is **Svelte 5**. The core atoms have **already been ported to Svelte for you** (see `svelte/` and
  step 4); for anything beyond them, match the React visuals pixel-for-pixel and rewrite the
  mechanics the Svelte way. Keep React in `reference-ui/` and never import from it.
- **Fidelity: hi-fi.** Colors, type, spacing, radii, borders, motion, and copy are all final.
  Reproduce them exactly — do not approximate, do not invent new values.

---

## 1. Product name: **Prosapia** (canonical)

The product is named **Prosapia**. The repo still carries the old name **MyNamesake** in several
places — treat those as stale and rename them as you touch each file:

- `package.json` → `"name"` field (`mynamesake` → `prosapiam`)
- `src/routes/(app)/dashboard/+page.svelte` → `<title>` and the `.wordmark` text
- any `<svelte:head><title>… — MyNamesake</title>` across routes → `— Prosapia`
- the repo's own `claude.md` headline/prose ("MyNamesake" → "Prosapia")

Use the wordmark/mark SVGs in `assets/` for the brand lockup, not a text string or emoji.

---

## 2. Why this is a clean fit

The repo's `claude.md` already mandates the exact styling approach this system is built for:

> **Styling:** CSS custom properties + scoped Svelte styles. **No Tailwind.**

`design-system/colors_and_type.css` is *already* pure CSS custom properties. It drops in as the
global token layer with almost no change — see step 3.

---

## 3. Integration order (do these in sequence)

### Step 1 — Install the tokens globally
1. Copy **`svelte/lib/styles/tokens.css`** → `src/lib/styles/tokens.css`. (This is the same token
   set as `design-system/colors_and_type.css`, but with the `@font-face` paths already rewritten
   to `/fonts/…` for SvelteKit — see step 2. Use this copy, not the raw one.)
2. Import it once, app-wide, in `src/routes/+layout.svelte` (root): `import '$lib/styles/tokens.css'`.
3. Add the base reset/typography to the root shell: put `class="mn-base"` on the top-level app
   element (or copy the `.mn-base` rule into a global `<style>` in the root layout). This sets
   the page to Parchment `#F7F4EE`, Plus Jakarta Sans, and warm Ink text.

### Step 2 — Self-host the fonts
Copy the `fonts/` folder → `static/fonts/`. The ready-made `svelte/lib/styles/tokens.css` already
references them at `/fonts/…` (SvelteKit serves `static/` at `/`), so no path edits are needed.
Both families ship here: **Plus Jakarta Sans** (UI) and **Cormorant Garamond** (story).

### Step 3 — Replace the off-brand scaffold styling
The scaffolded `src/routes/(app)/dashboard/+page.svelte` is placeholder styling that **violates the
system** and must be redone. Use it as a worked example of the translation:

| Scaffold (wrong) | Prosapia (correct) | Token |
|---|---|---|
| `background: linear-gradient(135deg,#fdf6ec…)` | flat Parchment, **no gradients in product UI** | `--color-bg-page` |
| `🌳` emoji logo | typographic wordmark / brand mark SVG | `assets/logo-*.svg` |
| `font-family: system-ui` | Plus Jakarta Sans (UI) / Cormorant (story) | `--font-display` / `--font-body` |
| orange `#c8842a` button | Ink-filled primary button | `--color-ink` on `--color-parchment` |
| `border: 1.5px solid #e8d5b4` | 0.5px hairline | `--border-default` |
| `border-radius: 0.625rem` (button) | 4px | `--radius-sm` |
| pure `#fff` surfaces | Surface-1 | `--color-bg-surface-1` |

Rebuilding this one screen against the tokens is the fastest way to internalize the system.

### Step 4 — Drop in the pre-built Svelte atoms
**These are already written for you** in `svelte/lib/components/ui/` — real Svelte 5 components
(runes, scoped styles, token-driven, TypeScript). Copy that folder into `src/lib/components/ui/`
and you have a working atom layer; no React translation needed for the basics. They are a faithful
port of `reference-ui/components.jsx`. One-to-one map:

| Reference (React) | Pre-built Svelte file | Notes |
|---|---|---|
| `Button` (primary/secondary/ghost/destructive) | `ui/Button.svelte` | sizes sm/md/lg; hover = opacity 0.85 (primary), bg lift (secondary). One primary per view. |
| `Input` | `ui/Input.svelte` | focus → Surface→white, 0.5px Gold border, 2px Ink@20% focus ring. Error = Terracotta, never red. |
| `Avatar` | `ui/Avatar.svelte` | circle; deceased gets `filter: grayscale(.25)` + Surface-3 bg. |
| `Badge` (default/gold/sage/terra/warm) | `ui/Badge.svelte` | radius 2px (hard — reads as a label). Sage = living, Terra = deceased. |
| `Tag` | `ui/Tag.svelte` | radius 2px, optional dismiss. |
| `Card` | `ui/Card.svelte` | Surface-1, 0.5px border, radius 10px, **no shadow**; hover → Surface-3 + Warm-Light border; featured = 1px Gold. |
| `Tabs` | `ui/Tabs.svelte` | underline active (2px Gold), optional count pill. |
| `TopNav` | `ui/TopNav.svelte` or root shell | Ink bar, Light wordmark, search affordance, avatar. |
| `Icon` | `ui/Icon.svelte` | thin wrapper over **`lucide-svelte`** — run `npm i lucide-svelte`. 1.5px stroke, 16/20/24px, default color Warm-Mid. |

### Step 5 — Build the four surfaces against real routes
The reference screens map onto the already-scaffolded SvelteKit routes:

| Reference file | Repo route |
|---|---|
| `reference-ui/AuthScreen.jsx` | `src/routes/(auth)/…` |
| `reference-ui/Dashboard.jsx` | `src/routes/(app)/dashboard/+page.svelte` |
| `reference-ui/TreeView.jsx` | `src/routes/(app)/trees/[treeId]/+page.svelte` (tree canvas) |
| `reference-ui/ProfileView.jsx` | `src/routes/(app)/trees/[treeId]/persons/[personId]/+page.svelte` |

`reference-ui/data.jsx` is mock family data — replace with real Supabase loads in
`+page.server.ts` (per the repo's data-fetching conventions). The reference shows **layout,
states, and copy** only.

---

## 4. Non-negotiables (will read as off-brand if broken)

- **Never `#FFF` page background** — Parchment `#F7F4EE` is the floor. **Never `#000` text** — Ink `#1C1A17`.
- **No gradients in product UI.** No background images on chrome. No backdrop-blur on chrome.
- **No shadows** on cards/modals/panels — depth is tonal (the Parchment→Surface ladder). The *only*
  shadow is for floating UI (dropdowns/tooltips): `0 4px 16px rgba(28,26,23,.10), 0 1px 4px rgba(28,26,23,.06)`.
- **0.5px hairline borders** by default. Exceptions: 2px Ink@20% focus ring; 1px Gold featured-card border.
- **Two typefaces, never on the same line.** Plus Jakarta Sans = all UI (max weight 500; 600 only on
  inverse/Ink surfaces). Cormorant Garamond = story text only (≥14px, line-height ≥1.7, max-width 680px,
  never bold, never ALL CAPS).
- **Gold `#8C7355` is an accent, never a large fill.** Sage = living/success. Terracotta = deceased/error
  (errors use Terracotta, never red). **Photography is the only full-color element.**
- **Motion: ease-out only** `cubic-bezier(0.22,1,0.36,1)`. No bounce, no spring, no loops (skeleton pulse
  excepted). `prefers-reduced-motion` zero-duration fallback is required (already in `tokens.css`).
- **No emoji.** (The scaffold's 🌳 must go.) Use Lucide icons and type-set glyphs (· — →).
- **Voice:** editorial, second-person, specific. "Begin with yourself." not "Get started." Living/Deceased
  (not Active/Dead), Given/Family name (not First/Last), "About this person" (not Bio). Empty states are
  invitations: "The first memory you add will live here." Full rules in `design-system/DESIGN_SYSTEM.md`.

---

## 5. Where to look (and grep)

```
START_HERE.md                     ← this file
claude.md.append.md               ← paste into the repo's existing claude.md
svelte/                           ← PRE-BUILT Svelte 5 code — copy into the repo
  README.md                       ← how to drop it in
  lib/styles/tokens.css           ← tokens, SvelteKit-ready font paths (→ src/lib/styles/)
  lib/components/ui/*.svelte       ← Button, Input, Avatar, Badge, Tag, Card, Tabs, TopNav, Icon (→ src/lib/components/ui/)
design-system/
  colors_and_type.css             ← ALL tokens, raw source of truth (svelte/ copy is derived from this)
  DESIGN_SYSTEM.md                ← full system: content rules, visual foundations, iconography
  SKILL.md                        ← one-screen summary of the non-negotiables
reference-ui/                     ← React fidelity mock (LOOK ONLY — never import; do not ship)
  index.html  components.jsx  AuthScreen.jsx  Dashboard.jsx  TreeView.jsx  ProfileView.jsx  data.jsx
  README.md
assets/                           ← logo-mark.svg, logo-wordmark.svg, logo-lockup.svg
fonts/                            ← Plus Jakarta Sans + Cormorant Garamond .ttf (→ static/fonts/)
spec/
  DesignSpec.txt                  ← full design spec, grep-friendly plain text
  ComponentBrief.txt              ← 20 components + 12 product patterns, build-level detail
  Prosapia_DesignSpec_v1.1.docx  ← original docs
  Prosapia_ComponentBrief.docx
```

**For Claude Code:** `spec/ComponentBrief.txt` has per-component build specs (states, spacing,
a11y, tone) — grep it by component name (`Button`, `Modal`, `Family Tree Node`, `Empty Tree State`).
`spec/DesignSpec.txt` is the authoritative token + rule source. If anything here disagrees with the
spec, **the spec wins**.

---

## 6. Known substitutions (flagged for replacement)

- **Brand marks** — `assets/` logos are a placeholder typographic wordmark + a Lucide-derived
  branching glyph. Replace with brand-supplied marks when available.
- **Iconography** — Lucide stands in for any product-specific icons until a custom set is commissioned.
- **Repo had no UI code at design-capture time** — the system was built from the Spec + Brief, then
  this handoff was reconciled against the live scaffold (SvelteKit routes + `claude.md`).
