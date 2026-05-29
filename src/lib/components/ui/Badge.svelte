<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'default' | 'gold' | 'sage' | 'terra' | 'warm';

  let {
    variant = 'default',
    dot = false,
    children
  }: {
    variant?: Variant;
    /** show the leading status dot (sage = living, terra = deceased) */
    dot?: boolean;
    children?: Snippet;
  } = $props();
</script>

<span class="badge {variant}">
  {#if dot}<span class="dot"></span>{/if}
  {@render children?.()}
</span>

<style>
  /* Radius 2px is intentional — hard corners read as a label, not a pill. */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: 3px var(--space-2);
    border-radius: var(--radius-xs); /* 2px */
    font-family: var(--font-display);
    font-weight: var(--font-weight-medium);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .dot { width: 6px; height: 6px; border-radius: var(--radius-full); background: currentColor; }

  .default { background: rgba(28, 26, 23, 0.08); color: var(--color-ink-soft); }
  .gold    { background: rgba(140, 115, 85, 0.12); color: #7a5f3e; }
  .sage    { background: var(--color-sage-tint); color: var(--color-sage); }   /* living / success */
  .terra   { background: var(--color-terra-tint); color: var(--color-terra); } /* deceased / error */
  .warm    { background: var(--color-surface-2); color: var(--color-warm-mid); }
</style>
