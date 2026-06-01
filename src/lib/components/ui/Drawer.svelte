<script lang="ts">
  import type { Snippet } from 'svelte'
  import { fade } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import { prefersReducedMotion } from '$lib/utils/motion'
  import Icon from './Icon.svelte'
  import { X } from 'lucide-svelte'

  let {
    open = false,
    title,
    variant = 'detail',
    onclose,
    children,
    footer,
  }: {
    open?: boolean
    title?: string
    /** detail = 480px · filter = 360px · settings = 400px */
    variant?: 'detail' | 'filter' | 'settings'
    onclose?: () => void
    children?: Snippet
    footer?: Snippet
  } = $props()

  const dur = prefersReducedMotion() ? 0 : 280
  const titleId = `drawer-title-${Math.random().toString(36).slice(2)}`

  let previouslyFocused: HTMLElement | null = null

  $effect(() => {
    if (open) {
      previouslyFocused = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      previouslyFocused?.focus()
      previouslyFocused = null
    }
  })

  $effect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onclose?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  function handleScrimClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onclose?.()
  }

  function trapFocus(node: HTMLElement) {
    const sel = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',')

    requestAnimationFrame(() => {
      node.querySelectorAll<HTMLElement>(sel)[0]?.focus()
    })

    function onKeydown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const els = [...node.querySelectorAll<HTMLElement>(sel)]
      if (!els.length) return
      const first = els[0], last = els[els.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    node.addEventListener('keydown', onKeydown)
    return { destroy: () => node.removeEventListener('keydown', onKeydown) }
  }

  // Panel slides in from the right. Only translateX — parent scrim handles opacity.
  function slideIn(_node: Element, { duration }: { duration: number }) {
    return { duration, easing: cubicOut, css: (t: number) => `transform: translateX(${(1 - t) * 100}%)` }
  }
</script>

{#if open}
  <!-- Keyboard close is handled via Escape in the $effect above — the scrim is not a keyboard target. -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="scrim"
    transition:fade={{ duration: dur, easing: cubicOut }}
    onclick={handleScrimClick}
  >
    <div
      class="panel {variant}"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      tabindex="-1"
      in:slideIn={{ duration: dur }}
      use:trapFocus
    >
      <div class="header">
        {#if title}
          <h2 id={titleId} class="title">{title}</h2>
        {:else}
          <span></span>
        {/if}
        <button class="close-btn" onclick={() => onclose?.()} aria-label="Close panel">
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
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 190;
    background: rgba(28, 26, 23, 0.30);
    display: flex;
    justify-content: flex-end;
  }

  .panel {
    position: relative;
    height: 100%;
    background: var(--color-bg-page);
    border-left: var(--border-default);
    /* Left corners rounded; right edge is flush with viewport */
    border-radius: var(--radius-lg) 0 0 var(--radius-lg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Variant widths — full-width on mobile */
  .detail   { width: min(480px, 100vw); }
  .filter   { width: min(360px, 100vw); }
  .settings { width: min(400px, 100vw); }

  /* No left radius when full-width on mobile */
  @media (max-width: 480px) {
    .panel { border-radius: 0; border-left: none; }
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-6);
    border-bottom: var(--border-default);
    flex-shrink: 0;
  }

  .title {
    margin: 0;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 16px;
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
    margin: -10px -10px -10px 0;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease);
  }
  .close-btn:hover { background: var(--color-surface-1); }

  .body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-6);
    overscroll-behavior: contain;
  }

  .foot {
    flex-shrink: 0;
    padding: var(--space-4) var(--space-6);
    border-top: var(--border-default);
  }
</style>
