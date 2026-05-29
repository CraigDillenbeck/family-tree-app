<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    interactive = false,
    featured = false,
    onclick,
    style = '',
    children
  }: {
    /** enables hover affordance + pointer cursor */
    interactive?: boolean;
    /** featured cards get the one place 1px + Gold border is allowed */
    featured?: boolean;
    onclick?: (e: MouseEvent) => void;
    style?: string;
    children?: Snippet;
  } = $props();
</script>

<div
  class="card"
  class:interactive
  class:featured
  {onclick}
  role={onclick ? 'button' : undefined}
  {style}
>
  {@render children?.()}
</div>

<style>
  /* Surface-1, hairline border, radius 10px — and NO shadow. Depth is tonal. */
  .card {
    background: var(--color-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-lg); /* 10px */
    padding: var(--space-6); /* 24px */
    transition:
      background var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease),
      transform var(--dur-fast) var(--ease);
  }
  .interactive { cursor: pointer; }
  /* Hover — bg lifts to Surface-3, border to Warm-Light. */
  .interactive:hover {
    background: var(--color-surface-3);
    border-color: var(--color-warm-light);
  }
  /* Press — barely-there. */
  .interactive:active { transform: scale(0.995); }

  /* Featured — the only sanctioned 1px Gold border. */
  .featured { border: var(--border-featured); }
</style>
