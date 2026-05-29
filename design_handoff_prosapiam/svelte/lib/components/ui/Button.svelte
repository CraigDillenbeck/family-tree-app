<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
  type Size = 'sm' | 'md' | 'lg';

  let {
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    onclick,
    icon,
    iconRight,
    children,
    ...rest
  }: {
    variant?: Variant;
    size?: Size;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
    /** optional leading icon (e.g. a <Icon name="plus" />) */
    icon?: Snippet;
    /** optional trailing icon */
    iconRight?: Snippet;
    children?: Snippet;
  } & Record<string, unknown> = $props();
</script>

<button class="btn {variant} {size}" {type} {disabled} {onclick} {...rest}>
  {#if icon}<span class="ico">{@render icon()}</span>{/if}
  <span class="label">{@render children?.()}</span>
  {#if iconRight}<span class="ico">{@render iconRight()}</span>{/if}
</button>

<style>
  /* Geometry + type are shared across variants — only fill/outline distinguish them. */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-width: 80px;
    border: none;
    border-radius: var(--radius-sm); /* 4px */
    font-family: var(--font-display);
    font-weight: var(--font-weight-medium); /* 500 */
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    transition:
      opacity var(--dur-fast) var(--ease),
      background var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease),
      transform var(--dur-fast) var(--ease);
  }
  .btn:active { transform: scale(0.98); } /* press — small, fast, no bounce */
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .label { white-space: nowrap; }
  .ico { display: inline-flex; }

  /* Sizes */
  .sm { height: 28px; padding: 0 var(--space-4); font-size: 12px; border-radius: 3px; }
  .md { height: 36px; padding: 0 var(--space-6); font-size: 13px; }
  .lg { height: 48px; padding: 0 var(--space-8); font-size: 15px; }

  /* Primary — Ink fill on Parchment. One per view. */
  .primary { background: var(--color-ink); color: var(--color-parchment); }
  .primary:hover:not(:disabled) { opacity: 0.85; } /* no colour shift */

  /* Secondary — outlined hairline. */
  .secondary {
    background: transparent;
    color: var(--color-ink);
    border: var(--border-default);
  }
  .secondary:hover:not(:disabled) {
    background: var(--color-surface-1);
    border-color: var(--color-warm-light);
  }

  /* Ghost — text only, underlined. */
  .ghost {
    background: transparent;
    color: var(--color-ink);
    min-width: 0;
    padding-left: var(--space-2);
    padding-right: var(--space-2);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
  }
  .ghost:hover:not(:disabled) { opacity: 0.7; }

  /* Destructive — Terracotta, never red. Confirmation required by caller. */
  .destructive { background: var(--color-terra); color: var(--color-parchment); }
  .destructive:hover:not(:disabled) { opacity: 0.85; }
</style>
