# Snippet for the repo's `claude.md`

Paste the block below into the existing `claude.md` (e.g. as a new `## Design System` section,
just before `## Important Reminders for Claude Code`). It points future Claude Code sessions at
this bundle and encodes the rules most likely to be violated. Adjust the bundle path if you move
the folder.

---

## Design System (Prosapiam)

The product's visual + content system lives in `design_handoff_prosapiam/`. **Read
`design_handoff_prosapiam/START_HERE.md` before building or restyling any UI.**

- **Tokens:** all design values are CSS custom properties in
  `design_handoff_prosapiam/design-system/colors_and_type.css` → installed as
  `src/lib/styles/tokens.css`, imported once in `src/routes/+layout.svelte`. Never hardcode a
  color, size, radius, or duration — reference a `--token`.
- **Reference UI** in `design_handoff_prosapiam/reference-ui/` is a **React fidelity mock** — LOOK
  ONLY. Never import from it and never ship it. The core atoms are already ported to **Svelte 5**
  in `design_handoff_prosapiam/svelte/lib/components/ui/` — copy those into `src/lib/components/ui/`.
- **Build spec:** `design_handoff_prosapiam/spec/ComponentBrief.txt` (grep by component name) and
  `spec/DesignSpec.txt` (authoritative). If anything disagrees, the spec wins.

### Non-negotiables
- Never `#FFF` page bg (Parchment `#F7F4EE` floor) · never `#000` text (Ink `#1C1A17`).
- No gradients / background images / backdrop-blur on product chrome. No emoji.
- No shadows on cards/modals/panels (depth is tonal). Only floating UI gets the one allowed shadow.
- 0.5px hairline borders by default. Two typefaces, never on one line: Plus Jakarta Sans (UI, max
  weight 500) and Cormorant Garamond (story only, ≥14px, line-height ≥1.7, never bold/ALL-CAPS).
- Gold `#8C7355` is an accent, never a large fill. Sage = living/success, Terracotta = deceased/error
  (never red). Photography is the only full-color element.
- Motion ease-out only `cubic-bezier(0.22,1,0.36,1)`; no bounce/spring/loop; reduced-motion fallback required.
- **Voice:** editorial, second-person, specific. Living/Deceased, Given/Family name, "About this person."
  Empty states are invitations ("The first memory you add will live here."), never error-toned.

### Product name
The product is **Prosapiam**. The repo still says **MyNamesake** in stale spots (`package.json`
`name`, dashboard `<title>`/wordmark, this file's prose). Rename them to Prosapiam as you touch
each file. Use the wordmark SVGs in `design_handoff_prosapiam/assets/` — never a text string or emoji.
