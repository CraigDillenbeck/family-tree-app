<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    onclick,
    ondismiss,
    children
  }: {
    onclick?: (e: MouseEvent) => void;
    /** when provided, renders a dismiss affordance */
    ondismiss?: () => void;
    children?: Snippet;
  } = $props();
</script>

<span class="tag" class:clickable={!!onclick} {onclick} role={onclick ? 'button' : undefined}>
  {@render children?.()}
  {#if ondismiss}
    <button
      class="dismiss"
      type="button"
      aria-label="Remove"
      onclick={(e) => {
        e.stopPropagation();
        ondismiss?.();
      }}>×</button>
  {/if}
</span>

<style>
  .tag {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    height: 28px;
    padding: 0 var(--space-3);
    background: var(--color-surface-2);
    border: var(--border-default);
    border-radius: var(--radius-xs); /* 2px — reads as a label */
    font-family: var(--font-display);
    font-size: var(--font-size-caption); /* 12px */
    color: var(--color-ink-soft);
  }
  .clickable { cursor: pointer; }
  .dismiss {
    border: none;
    background: transparent;
    padding: 0;
    margin-right: -4px;
    font-size: 14px;
    line-height: 1;
    color: var(--color-warm-mid);
    cursor: pointer;
  }
  .dismiss:hover { opacity: 0.7; }
</style>
