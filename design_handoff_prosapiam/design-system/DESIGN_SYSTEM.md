# Prosapiam — Design System

A warm, story-first family tree app for preserving the people, memories, photos, and histories that make a family feel alive.

This system codifies Prosapiam's emotional intent — *archival warmth, editorial restraint, the dignity of the people being recorded* — into design tokens, component specs, and reference implementations.

---

## Sources

- **Spec:** `uploads/Prosapiam_DesignSpec_v1.1.docx` — design tokens, interactive states, accessibility guardrails, Figma file structure (extracted to `uploads/_DesignSpec.txt` for grep)
- **Brief:** `uploads/Prosapiam_ComponentBrief.docx` — 20 core UI components + 12 product patterns (extracted to `uploads/_ComponentBrief.txt`)
- **Repo:** `github.com/CraigDillenbeck/family-tree-app` — placeholder only at time of capture (no code committed beyond a one-line README). The system below is built from the two spec documents.

The spec is the source of truth. If anything in this folder disagrees with the spec, the spec wins.

---

## Product surfaces

Four primary surfaces. Each is recreated as a clickable mock in `ui_kits/app/`.

1. **Sign in / Create account** — single-page authentication with two toggled modes (sign-in / create). The first thing a new user sees.
2. **Dashboard** — home base after sign-in. Recent activity, tree state at a glance, fastest paths to *add memory · view tree · find a person*. A living entry point, not a data dashboard.
3. **Family Tree view** — the navigable spatial canvas. The product's most technically and emotionally significant surface. Pan/zoom, select, add people, draw relationships.
4. **Person Profile** — the biographical record + memory archive for one person. Reference document and growing archive in one. Tabs: About · Memories · Media · Relationships.

---

## Content fundamentals

Tone is the most important system in this product. Copy can break the design even when the visuals are correct.

**Voice.** Quiet, considered, second-person where it improves intimacy. The product addresses the user as someone *recording* — not a customer, not a player. Words like "you," "your grandmother," "their first home" are first-class. Avoid "users," "items," "records."

**Register.** Editorial, not transactional. *"Begin with yourself."* not *"Get started."* *"What do you most want to remember about them?"* not *"Enter biography."* The empty-tree CTA copy is approved at the design-principle level — non-negotiable.

**Casing.** Sentence case for everything except ALL-CAPS micro-labels (≤14px). Title case is allowed for badges and tabs but not required. Never use ALL CAPS for body or story text.

**Vocabulary — chosen carefully.**
- "Living" / "Deceased" — never "Active" / "Dead"
- "Given name" / "Family name" — never "First" / "Last"
- "About this person" — never "Bio" or "Description"
- "Add a memory" — never "Create entry" or "New post"
- "Begin with yourself." — the empty-tree prompt
- "The first memory you add will live here." — empty-memories prompt

**Specifics over genericness.** "Lived 1932–2011" beats "Deceased." "Cork, Ireland" beats "Location." "Kept a garden on Maple Street" beats "Loved gardening." The product gets warmer as the data gets more specific — never substitute boilerplate.

**Emoji.** Not used. Emoji break the typographic register and the editorial tone.

**Punctuation.** Em-dash for asides ("a quiet warmth — never gold-as-fill"). Middot (·) as a thin inline separator in metadata ("Born 1932 · Cork, Ireland"). Never use em-dashes as bullets.

**Errors.** Plain-spoken. "We couldn't save that — try again?" not "An unexpected error occurred." Errors use Terracotta only — never red.

**Empty states.** Inviting, not apologetic. *Absence is a beginning, not a gap.* "No memories yet" → "The first memory you add will live here."

---

## Visual foundations

### Palette
Warm, low-saturation, parchment-grounded. **Never pure white** (`#FFF` is forbidden as a page bg — Parchment `#F7F4EE` is the warmth floor). **Never pure black** (`#000`); Ink `#1C1A17` only.

The neutral spine: `Parchment → Surface-1 → Surface-2 → Surface-3 → Warm-Light → Warm-Mid → Ink-Soft → Ink`. Depth on a page is expressed through this tonal ladder *only* — there are no elevation shadows on cards, modals, or panels.

Three accent colors carry semantic weight and never decorate:
- **Gold `#8C7355`** — primary CTA fill, active state, focused border. Never a fill for large areas.
- **Sage `#5A6B5C`** — living status, success.
- **Terracotta `#8C4A38`** — deceased status, errors, validation.

Photography is the *only* full-color element in the UI. The interface is monochrome-warm; photographs carry the color.

### Type
Three typefaces in three distinct roles. Never mix roles on the same line.

- **Young Serif** (`--font-display`) — display headlines only: hero titles, the dashboard greeting, person profile names. Variable font (`YoungSerifVF.woff2`), wght axis 300–700.
- **Plus Jakarta Sans** (`--font-ui`) — all UI chrome: navigation, buttons, tabs, labels, badges, metadata, card/section titles, stat numbers, inputs, breadcrumbs. Max weight **500** (semibold 600 only on Ink/inverse surfaces).
- **Cormorant Garamond** (`--font-body`) — story/narrative text only. Minimum 14px, line-height ≥1.7, max-width 680px. **No bold body. No ALL CAPS in the serif, ever.**

The register-shift between faces is at element boundary — typefaces never share a line. All faces are self-hosted from `fonts/`.

### Spacing & rhythm
4-based scale: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 80 · 96 · 120. Story pages use generous vertical rhythm — year dividers in a memory timeline have 48px above / 32px below. Component-internal spacing is tight (4–16px); page-level spacing is generous (32–96px).

### Backgrounds
Flat Parchment or flat Surface-1. **No gradients in the product UI** — gradients are marketing-only. **No background images on chrome.** Photography appears only inside content cards and the optional cover-photo area on a profile header.

### Borders
**0.5px hairline borders** are the system default — `1px` reads as too heavy in this palette. Two intentional exceptions only: focus rings (2px Ink at 20%) and the Featured-card accent (1px Gold). Figma renders these as 1px at 50% opacity since Figma can't show 0.5px natively — that is documented as a handoff convention.

### Shadows
**Zero shadows on cards, modals, panels, or anything anchored in layout flow.** Depth is tonal. The single permitted shadow is for *floating* UI (dropdowns, tooltips, date pickers, command palettes, context menus):

```
box-shadow: 0 4px 16px rgba(28,26,23,0.10), 0 1px 4px rgba(28,26,23,0.06);
```

Warm Ink — never cool gray, never black.

### Corner radii
A small scale: `0 · 2 · 4 · 6 · 10 · 16 · full`. Cards use `10`. Buttons use `4`. Badges and tags use `2` (intentionally hard — they read as labels, not pills). Avatars are `full` (true circle).

### Hover & press
**Hover** is opacity-based or one-step-tonal:
- Primary buttons: `opacity: 0.85` (no color shift)
- Secondary/ghost buttons: bg lifts to Surface-1; ghost loses 30% opacity
- Cards: bg shifts to Surface-3, border to Warm-Light
- Links: `opacity: 0.70`, never a color change, never underline removal

**Press** is `scale(0.98)` for buttons, `scale(0.995)` for cards — small, fast (100ms), no bounce.

### Motion
Ease-out only: `cubic-bezier(0.22, 1, 0.36, 1)`. Duration scale: 0 / 150 / 280 / 480 / 700 ms. **No bounce. No spring. No looping animations** (skeleton pulse is the only exception). All motion has a `prefers-reduced-motion` zero-duration fallback — non-negotiable.

Stagger reveals are 40ms per item, max ~8 items before snapping to a single fade.

### Transparency & blur
Used sparingly. Modal scrim is Ink @ 40%. Drawer scrim is Ink @ 30%. Image lightbox controls sit on Ink @ 85% to be legible over arbitrary photographs. **No backdrop-blur on chrome** — it conflicts with the editorial restraint.

### Layout
12-column desktop grid, max-width 1280px, 80px page margins. Story content (Cormorant Garamond) is constrained to 680px no matter how wide the viewport is — readable column width is a hard rule.

### Imagery vibe
Warm, slightly desaturated, often archival (sepia-leaning, grainy, or vintage-tinged is welcome — but not forced). Deceased avatars get a gentle 25% grayscale filter — a quiet visual cue, never mournful. We never apply duotone treatments or color-grade overlays to user photos.

### Cards
`bg Surface-1` · `border 0.5px #D6CFC4` · `radius 10px` · **no shadow**. Hover bumps bg to Surface-3 and border to Warm-Light. Featured cards get a 1px Gold border (the only place 1px is allowed). Cards never use color fills or accent strips.

### Surfaces hierarchy (depth ladder, top-to-bottom)
```
Page:        Parchment (#F7F4EE)
└── Card:    Surface-1  (#EDE8E0)
    └── Input:  Surface-2  (#E5DDD2)
        └── Hover fill: Surface-3 (#D9D0C4)
```

---

## Iconography

**System: Lucide.** Stroke-based, 1.5px weight, rounded line caps, 16/20/24px sizes. Lucide's quiet line style matches Plus Jakarta Sans's geometry without the playful curves of Phosphor or the heaviness of Material. Loaded from CDN (`unpkg.com/lucide@latest`) for now — when production wiring lands, the icons can be tree-shaken from `lucide-react`.

**Color rules.**
- Default icon color: `Warm-Mid` (#7A6F63)
- Inside a button: inherits button text color
- Active / selected: Ink
- Inside a Sage badge: Sage; inside a Terra badge: Terra
- Never colored arbitrarily; never multi-color

**Sizes.**
- 12px — inline with caption text, badge prefixes
- 16px — inside buttons, tooltips, dropdown items, status indicators
- 20px — navigation rail, profile actions
- 24px — primary toolbar icons, modal headers
- 48px+ — empty-state illustration zones (currently a single-glyph Lucide icon; reserved for bespoke illustration in future)

**Emoji: not used.** Unicode characters (·, —, →) are used as type-set inline glyphs but not as icons.

**Logo / wordmark.** A simple wordmark in Plus Jakarta Sans Light at the brand wordmark size; pairs with a small "branching" mark when needed. SVGs live in `assets/`. Until brand provides final marks, the wordmark renders typographically and the mark is a Lucide-derived branching glyph — this substitution is **flagged** for the brand team to replace.

---

## Index

```
README.md                    — this file
SKILL.md                     — Agent SKill manifest
colors_and_type.css          — all design tokens + semantic classes
fonts/                       — placeholder (web fonts are loaded from Google Fonts CDN)
assets/                      — logo SVGs, brand glyph
preview/                     — design-system cards (rendered in the Design System tab)
ui_kits/
  app/                       — Prosapiam app UI kit (4 surfaces)
    README.md
    index.html               — interactive click-thru of the four surfaces
    *.jsx                    — modular React components (Avatar, Button, Card, TreeNode, …)
uploads/
  Prosapiam_DesignSpec_v1.1.docx
  Prosapiam_ComponentBrief.docx
  _DesignSpec.txt            — extracted text for grep
  _ComponentBrief.txt        — extracted text for grep
```

---

## Caveats / known substitutions

- **Story face** — Cormorant Garamond, self-hosted from `fonts/` (provided by the brand).
- **UI face** — Plus Jakarta Sans, self-hosted from `fonts/` (provided by the brand).
- **Brand mark / logo** — placeholder typographic wordmark + Lucide branching glyph. Replace with brand-supplied marks.
- **Iconography** — Lucide via CDN substitutes for any product-specific icons until a custom set is commissioned. Stroke weight and grid match the system; flagged as substitution.
- **Repo** — `family-tree-app` had no committed code at capture time; everything below the spec is built from first principles against the Spec + Brief.
