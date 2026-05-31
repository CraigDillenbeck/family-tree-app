<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'first-use' | 'section' | 'search' | 'error';

  let {
    variant = 'section',
    heading,
    body,
    icon,
    cta,
  }: {
    variant?: Variant;
    heading: string;
    body?: string;
    /** optional 48×48 icon zone — pass an <Icon> or simple SVG */
    icon?: Snippet;
    /** optional CTA — pass a <Button> */
    cta?: Snippet;
  } = $props();
</script>

<div
  class="empty {variant}"
  aria-live="polite"
  role={variant === 'error' ? 'alert' : 'status'}
>
  {#if icon}
    <div class="icon-zone" aria-hidden="true">
      {@render icon()}
    </div>
  {/if}

  <h2 class="heading">{heading}</h2>

  {#if body}
    <p class="body-text">{body}</p>
  {/if}

  {#if cta}
    <div class="cta">
      {@render cta()}
    </div>
  {/if}
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--space-12) var(--space-4);
  }

  /* first-use fills the viewport and is the most prominent */
  .first-use {
    min-height: 60vh;
    justify-content: center;
    padding: var(--space-20) var(--space-4);
  }

  /* search is inline — tighter, no vertical padding stretch */
  .search {
    padding: var(--space-8) var(--space-4);
  }

  .icon-zone {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-warm-light);
    margin-bottom: var(--space-6);
    flex-shrink: 0;
  }

  .heading {
    margin: 0;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 18px;
    line-height: var(--line-height-heading);
    color: var(--color-text-primary);
    max-width: 40ch;
  }

  .error .heading {
    color: var(--color-terra);
  }

  .body-text {
    margin: var(--space-3) 0 0;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-regular);
    font-size: 14px;
    line-height: 1.6;
    color: var(--color-text-secondary);
    max-width: 360px;
  }

  .cta {
    margin-top: var(--space-6);
  }
</style>
