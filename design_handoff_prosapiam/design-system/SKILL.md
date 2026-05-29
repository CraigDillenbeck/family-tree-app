---
name: prosapiam-design
description: Use this skill to generate well-branded interfaces and assets for Prosapiam — a warm, story-first family tree app — for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Where to look

- `README.md` — context, content fundamentals, visual foundations, iconography, file index, caveats
- `colors_and_type.css` — every design token, plus semantic CSS classes (`.mn-h1`, `.mn-body-story`, etc). Import this and you have the system.
- `assets/` — wordmark, mark, lockup
- `preview/` — small per-token cards used in the Design System tab
- `ui_kits/app/` — interactive recreation of the four core surfaces (Auth, Dashboard, Tree, Profile) with reusable React atoms (Button, Input, Avatar, Badge, Tag, Card, Tabs, TopNav)
- `uploads/` — original spec docs (DesignSpec v1.1, ComponentBrief)

## Non-negotiable rules to internalize

- Never `#FFF` for page bg (Parchment `#F7F4EE` is the warmth floor). Never `#000` for text (Ink `#1C1A17`).
- Two typefaces, never on the same line: Plus Jakarta Sans for UI, Cormorant Garamond for story. Story text ≥14px, line-height ≥1.7, never bold, never ALL CAPS.
- 0.5px borders. No card shadows. Floating elements (dropdowns, tooltips) get the one allowed shadow: `0 4px 16px rgba(28,26,23,.10), 0 1px 4px rgba(28,26,23,.06)`.
- Ease-out only. No bounce, no spring. `prefers-reduced-motion` zero-duration fallback required.
- Gold is an accent, never a fill for large areas. Photography is the only full-color element.
- Vocabulary: Living/Deceased, Given/Family name, "About this person." Empty states are invitations, not voids.
