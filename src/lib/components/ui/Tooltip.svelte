<script lang="ts">
  import type { Snippet } from 'svelte'
  import { fade } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import { prefersReducedMotion } from '$lib/utils/motion'

  let {
    content,
    placement = 'top',
    delay = 200,
    children,
  }: {
    content: string
    placement?: 'top' | 'bottom' | 'left' | 'right'
    delay?: number
    children: Snippet
  } = $props()

  const tooltipId = `tooltip-${Math.random().toString(36).slice(2)}`
  const dur = prefersReducedMotion() ? 0 : 150

  let visible = $state(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  function show(immediate = false) {
    if (timer) clearTimeout(timer)
    if (immediate) {
      visible = true
    } else {
      timer = setTimeout(() => { visible = true }, delay)
    }
  }

  function hide() {
    if (timer) { clearTimeout(timer); timer = null }
    visible = false
  }

  // Automatically wire aria-describedby onto whatever element receives focus
  // inside the wrapper — no consumer boilerplate required.
  function handleFocusIn(e: FocusEvent) {
    const target = e.target as HTMLElement
    if (target && target !== e.currentTarget) {
      target.setAttribute('aria-describedby', tooltipId)
    }
    show(true)
  }

  function handleFocusOut(e: FocusEvent) {
    const target = e.target as HTMLElement
    if (target?.getAttribute('aria-describedby') === tooltipId) {
      target.removeAttribute('aria-describedby')
    }
    hide()
  }

  $effect(() => {
    if (!visible) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') hide() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
  class="wrapper"
  onmouseenter={() => show()}
  onmouseleave={hide}
  onfocusin={handleFocusIn}
  onfocusout={handleFocusOut}
>
  {@render children()}

  {#if visible}
    <span
      id={tooltipId}
      role="tooltip"
      class="tip {placement}"
      transition:fade={{ duration: dur, easing: cubicOut }}
    >{content}</span>
  {/if}
</span>

<style>
  .wrapper {
    position: relative;
    display: inline-block;
  }

  .tip {
    position: absolute;
    z-index: 300;
    background: var(--color-ink);
    color: var(--color-parchment);
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: var(--font-weight-regular);
    line-height: 1.4;
    padding: 4px 10px;
    border-radius: var(--radius-sm);
    max-width: 240px;
    white-space: normal;
    text-align: center;
    pointer-events: none;
    box-shadow: var(--shadow-floating);
  }

  /* ── Top (default) ── */
  .tip.top {
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
  }
  .tip.top::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: var(--color-ink);
  }

  /* ── Bottom ── */
  .tip.bottom {
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
  }
  .tip.bottom::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-bottom-color: var(--color-ink);
  }

  /* ── Left ── */
  .tip.left {
    right: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
  }
  .tip.left::after {
    content: '';
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-left-color: var(--color-ink);
  }

  /* ── Right ── */
  .tip.right {
    left: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
  }
  .tip.right::after {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-right-color: var(--color-ink);
  }
</style>
