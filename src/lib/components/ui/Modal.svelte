<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { prefersReducedMotion } from '$lib/utils/motion';
  import Icon from './Icon.svelte';
  import { X } from 'lucide-svelte';

  type Variant = 'standard' | 'wide' | 'confirmation';

  let {
    open = false,
    title,
    variant = 'standard',
    onclose,
    children,
    footer,
  }: {
    open?: boolean;
    title?: string;
    variant?: Variant;
    onclose?: () => void;
    children?: Snippet;
    footer?: Snippet;
  } = $props();

  const dur = prefersReducedMotion() ? 0 : 280;
  const titleId = `modal-title-${Math.random().toString(36).slice(2)}`;

  let previouslyFocused: HTMLElement | null = null;

  // Body scroll lock + focus return
  $effect(() => {
    if (open) {
      previouslyFocused = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previouslyFocused?.focus();
      previouslyFocused = null;
    }
  });

  // Escape key
  $effect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onclose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // Only close when clicking the overlay itself, not content inside it
  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget && variant !== 'confirmation') onclose?.();
  }

  // Tab-key focus trap — only handles cycling, Escape handled above
  function trapFocus(node: HTMLElement) {
    const sel = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    requestAnimationFrame(() => {
      (node.querySelectorAll<HTMLElement>(sel)[0])?.focus();
    });

    function onKeydown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const els = [...node.querySelectorAll<HTMLElement>(sel)];
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    node.addEventListener('keydown', onKeydown);
    return { destroy: () => node.removeEventListener('keydown', onKeydown) };
  }
</script>

{#if open}
  <!--
    Overlay: provides the scrim background + flex centering + click-to-close.
    The dialog inside stops click propagation so only outside clicks close.
  -->
  <div
    class="overlay"
    transition:fade={{ duration: dur, easing: cubicOut }}
    onclick={handleOverlayClick}
    aria-hidden="true"
  >
    <div
      class="dialog {variant}"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      tabindex="-1"
      use:trapFocus
    >
      <div class="header">
        {#if title}
          <h2 id={titleId} class="title">{title}</h2>
        {:else}
          <span></span>
        {/if}
        <button class="close-btn" onclick={() => onclose?.()} aria-label="Close dialog">
          <Icon icon={X} size={16} color="var(--color-warm-mid)" />
        </button>
      </div>

      <div class="body">
        {@render children?.()}
      </div>

      {#if footer}
        <div class="foot">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(28, 26, 23, 0.40);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
  }

  .dialog {
    position: relative;
    background: var(--color-bg-page);
    border-radius: var(--radius-lg);
    padding: var(--space-8);
    width: 100%;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .standard     { max-width: 560px; }
  .wide         { max-width: 760px; }
  .confirmation { max-width: 400px; }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
    flex-shrink: 0;
  }

  .title {
    margin: 0;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 18px;
    line-height: var(--line-height-heading);
    color: var(--color-text-primary);
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    /* pull into padding so content stays optically aligned */
    margin-top: -10px;
    margin-right: -10px;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition:
      background var(--dur-fast) var(--ease),
      color var(--dur-fast) var(--ease);
  }
  .close-btn:hover { background: var(--color-surface-1); }

  .body {
    overflow-y: auto;
    flex: 1;
  }

  .foot {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    padding-top: var(--space-6);
    border-top: var(--border-default);
    flex-shrink: 0;
  }
</style>
