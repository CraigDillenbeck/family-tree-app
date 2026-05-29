# `svelte/` — Pre-built Prosapiam code for the SvelteKit app

This folder is **real, ready-to-ship Svelte 5 code** (not the React reference in `../reference-ui/`).
It mirrors the repo's `src/lib/` layout so you can copy it straight in.

```
svelte/
  lib/
    styles/tokens.css                 → src/lib/styles/tokens.css   (font paths already /fonts/-ready)
    components/ui/
      Button.svelte  Input.svelte  Avatar.svelte  Badge.svelte  Tag.svelte
      Card.svelte    Tabs.svelte   TopNav.svelte  Icon.svelte
                                        → src/lib/components/ui/
```

## Install (3 steps)

```bash
# 1. Tokens + components into the repo
cp svelte/lib/styles/tokens.css            src/lib/styles/tokens.css
cp svelte/lib/components/ui/*.svelte        src/lib/components/ui/

# 2. Fonts into static (tokens.css already references /fonts/…)
cp -R fonts/                                 static/fonts/

# 3. Icons (Icon.svelte / TopNav.svelte wrap lucide-svelte)
npm i lucide-svelte
```

Then import the tokens once in the root layout and set the base class:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '$lib/styles/tokens.css';
  let { children } = $props();
</script>

<div class="mn-base">{@render children()}</div>
```

## Conventions these follow

- **Svelte 5 runes** (`$props`, `$state`, `$derived`, `$bindable`) and `lang="ts"`.
- **Scoped `<style>` only** — every value is a `var(--token)` from `tokens.css`. No hardcoded colours,
  no Tailwind, no global class pollution. (Matches the repo's `claude.md` styling rule.)
- **Hover/press/focus** handled in CSS, not JS. Press is `scale(0.98)`; motion is ease-out only.
- **No emoji.** Icons come from `lucide-svelte` via `Icon.svelte`.

## Usage

```svelte
<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Avatar from '$lib/components/ui/Avatar.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { Plus } from 'lucide-svelte';

  let email = $state('');
</script>

<!-- One primary action per view. Optional icon snippet. -->
<Button variant="primary" size="lg">
  {#snippet icon()}<Icon icon={Plus} size={18} color="currentColor" />{/snippet}
  Add a memory
</Button>

<Button variant="secondary">View tree</Button>
<Button variant="ghost">Cancel</Button>

<!-- Two-way bound, with leading icon + error state (Terracotta, never red). -->
<Input label="Email" type="email" bind:value={email} placeholder="you@example.com" />

<Card interactive onclick={() => goto(`/trees/${id}/persons/${personId}`)}>
  <Avatar person={{ given: 'Mary', family: 'Walsh', status: 'living' }} size={56} />
  <Badge variant="sage" dot>Living</Badge>
  <Badge variant="terra" dot>Deceased</Badge>
</Card>
```

## Component reference

| Component | Key props |
|---|---|
| `Button` | `variant` primary·secondary·ghost·destructive · `size` sm·md·lg · `icon`/`iconRight` snippets · `onclick` |
| `Input` | `label` · `type` · `bind:value` · `error` · `prefix` snippet · `oninput` |
| `Avatar` | `person` (`{given,family,initials,status,avatarUrl}`) · `size` · `src` · `deceased` |
| `Badge` | `variant` default·gold·sage·terra·warm · `dot` |
| `Tag` | `onclick` · `ondismiss` |
| `Card` | `interactive` · `featured` (1px Gold border) · `onclick` |
| `Tabs` | `value` · `items` (`{value,label,count?}`) · `onchange` |
| `TopNav` | `active` · `links` · `wordmark` · `onnav` · `onsearch` · `avatar` snippet |
| `Icon` | `icon` (a lucide-svelte component) · `size` 12·16·20·24 · `color` · `strokeWidth` |

## Not yet built (translate from `../reference-ui/` + `../spec/ComponentBrief.txt`)

Textarea, Select, Checkbox, Radio, Toggle, Divider, **Modal, Drawer, Tooltip, Dropdown**, Empty State,
Loading Skeleton, Alert/Validation — plus the product patterns (Family Tree Node, Relationship
Connector, Person Card, Profile Header, Memory Card, Media Card, timelines). Build these the same way:
Svelte 5 + scoped styles + tokens, look matched to the reference, spec'd in `ComponentBrief.txt`.
Remember the one allowed shadow is for **floating** UI only (Modal/Drawer/Tooltip/Dropdown):
`var(--shadow-floating)`.
