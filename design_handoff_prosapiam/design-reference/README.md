# Prosapiam — Design Reference (canonical screens)

These are the **authoritative visual references** for the Prosapiam app. When building or
restyling any screen, open the matching file here and match it exactly — layout, spacing,
hierarchy, type, color, and copy. The design system in `../design-system/` (tokens, spec)
provides the *rules*; these files are the *target*. If they ever disagree, the spec wins on
token values, but these files win on layout and composition.

## How to use these files

Each `.html` file is a **design-canvas presentation**: it loads React + Babel from a CDN and
renders the real screen components (from `app/*.jsx`) onto a pannable canvas, usually showing
**several artboards** — e.g. desktop + mobile breakpoints, plus empty/loading/switched states.

- **Open in a browser** to see the rendered design (everything is self-contained in this folder —
  fonts, styles, and components all load by relative path).
- **Read the source** to lift exact structure and values: the screen shell is the `.html` file;
  the actual markup + scoped styles live in the imported `app/*.jsx` components.
- These are **reference only** — React/JSX mocks. Do **not** import them into the SvelteKit app or
  ship them. Rebuild each screen as a Svelte 5 component, matching what you see here.

## Screen index

| Surface | Reference file | Real components (`app/`) | Artboards / states shown |
| --- | --- | --- | --- |
| **Landing page** | `Landing Page.html` | `LandingPage.jsx`, `MemoryCard.jsx` | Desktop + mobile; 5 sections + footer |
| **Onboarding** | `Onboarding.html` | `Onboarding.jsx` | Post-signup first-tree flow |
| **Dashboard** | `Dashboard.html` | `Dashboard.jsx` (+ tree + card components) | Desktop, mobile, tree-switched, empty-new-user, empty-tree |
| **Family tree canvas** | `FamilyTreeView.html` | `TreeViewCanvas/Panels/Primitives.jsx`, `FamilyTreeNode.jsx`, `RelationshipConnector.jsx` | Canvas, node zoom levels, side panels |
| **Person profile** | `ProfileHeader.html`, `ProfileTimeline.html` | `ProfileHeader.jsx`, `ProfileTimeline.jsx`, `MemoryCard.jsx`, `PersonSummaryCard.jsx` | Living + deceased headers; timeline with year dividers |

## Component references (product patterns)

| Component | Reference file | `app/` source |
| --- | --- | --- |
| Person summary card (P03) | `PersonSummaryCard.html` | `PersonSummaryCard.jsx` |
| Memory / story card (P05) | `MemoryCard.html` | `MemoryCard.jsx` |
| Family tree node (P01) | `FamilyTreeNode.html` | `FamilyTreeNode.jsx` |
| Relationship connector (P02) | `RelationshipConnector.html` | `RelationshipConnector.jsx` |
| Tabs | `Tabs.html` | `Tabs.jsx` |

## Shared assets in this folder

- `styles/tokens.css` — design tokens + `@font-face` declarations (mirrors the app's source of truth)
- `styles/app.css` — prototype-level base styles + keyframes
- `fonts/` — Young Serif (woff2), Plus Jakarta Sans, Cormorant Garamond
- `uploads/` — Young Serif woff2 used by the Landing + Onboarding shells
- `design-canvas.jsx` — the pan/zoom canvas wrapper (presentation only — not part of the product)
