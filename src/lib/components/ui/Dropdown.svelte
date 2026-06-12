<script lang="ts">
  import type { Snippet } from 'svelte'
  import { fade } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import { prefersReducedMotion } from '$lib/utils/motion'
  import Icon from './Icon.svelte'

  export type DropdownItem = {
    label: string
    // lucide-svelte uses SvelteComponentTyped (Svelte 4 compat); `any` bridges the gap
    icon?: any
    onclick: () => void
    destructive?: boolean
    /** render a divider above this item */
    divider?: boolean
    disabled?: boolean
  }

  let {
    items,
    align = 'right',
    trigger,
  }: {
    items: DropdownItem[]
    align?: 'left' | 'right'
    /**
     * Render the trigger element. Receives `{ open, toggle }` so you can wire
     * aria-expanded and onclick directly onto your button:
     *
     *   {#snippet trigger({ open, toggle })}
     *     <button onclick={toggle} aria-haspopup="menu" aria-expanded={open}>
     *       Actions
     *     </button>
     *   {/snippet}
     */
    trigger: Snippet<[{ open: boolean; toggle: () => void }]>
  } = $props()

  const dur = prefersReducedMotion() ? 0 : 150

  let open = $state(false)
  let wrapperEl: HTMLElement | undefined = $state()
  let menuEl: HTMLElement | null = $state(null)

  function toggle() {
    open = !open
    if (open) {
      requestAnimationFrame(() => {
        menuEl?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled])')?.focus()
      })
    }
  }

  function close(returnFocus = true) {
    if (!open) return
    open = false
    if (returnFocus) {
      requestAnimationFrame(() => {
        wrapperEl?.querySelector<HTMLElement>('button, [role="button"]')?.focus()
      })
    }
  }

  function selectItem(item: DropdownItem) {
    if (item.disabled) return
    item.onclick()
    close()
  }

  // Close when focus moves outside the entire dropdown wrapper
  function handleFocusOut(e: FocusEvent) {
    const related = e.relatedTarget as Node | null
    if (wrapperEl && !wrapperEl.contains(related)) close(false)
  }

  // Close on outside click (e.g. mouse user clicks elsewhere without focusing)
  $effect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (wrapperEl && !wrapperEl.contains(e.target as Node)) close(false)
    }
    document.addEventListener('click', onDocClick, { capture: true })
    return () => document.removeEventListener('click', onDocClick, { capture: true })
  })

  function handleMenuKeydown(e: KeyboardEvent) {
    const els = [...(menuEl?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled])') ?? [])]
    if (!els.length) return
    const idx = els.indexOf(document.activeElement as HTMLElement)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        els[(idx + 1) % els.length].focus()
        break
      case 'ArrowUp':
        e.preventDefault()
        els[(idx - 1 + els.length) % els.length].focus()
        break
      case 'Home':
        e.preventDefault()
        els[0].focus()
        break
      case 'End':
        e.preventDefault()
        els[els.length - 1].focus()
        break
      case 'Escape':
        e.preventDefault()
        close()
        break
      case 'Tab':
        close(false)
        break
    }
  }

  // Panel rises 4px upward into place (spec: translateY(−4px)→0)
  function riseIn(_node: Element, { duration }: { duration: number }) {
    return {
      duration,
      easing: cubicOut,
      css: (t: number) => `transform: translateY(${(1 - t) * -4}px); opacity: ${t}`,
    }
  }
</script>

<div
  class="dropdown"
  bind:this={wrapperEl}
  onfocusout={handleFocusOut}
>
  {@render trigger({ open, toggle })}

  {#if open}
    <div
      class="panel {align}"
      role="menu"
      tabindex="-1"
      bind:this={menuEl}
      in:riseIn={{ duration: dur }}
      out:fade={{ duration: dur, easing: cubicOut }}
      onkeydown={handleMenuKeydown}
    >
      {#each items as item}
        {#if item.divider}
          <div role="separator" class="divider" aria-hidden="true"></div>
        {/if}
        <button
          class="item"
          class:destructive={item.destructive}
          role="menuitem"
          aria-disabled={item.disabled ? 'true' : undefined}
          tabindex="-1"
          onclick={() => selectItem(item)}
        >
          {#if item.icon}
            <span class="item-icon" aria-hidden="true">
              <Icon
                icon={item.icon}
                size={16}
                color={item.destructive ? 'var(--color-terra)' : 'var(--color-warm-mid)'}
              />
            </span>
          {/if}
          {item.label}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .panel {
    position: absolute;
    top: calc(100% + 4px);
    z-index: 250;
    background: var(--color-bg-page);
    border: var(--border-default);
    border-radius: var(--radius-md);
    min-width: 180px;
    max-height: 280px;
    overflow-y: auto;
    overscroll-behavior: contain;
    box-shadow: var(--shadow-floating);
    padding: var(--space-1) 0;
  }

  .panel.right { right: 0; }
  .panel.left  { left: 0; }

  .item {
    display: flex;
    align-items: center;
    width: 100%;
    height: 36px;
    padding: 0 var(--space-4);
    background: transparent;
    border: none;
    border-radius: 0;
    font-family: var(--font-ui);
    font-size: 14px;
    font-weight: var(--font-weight-regular);
    color: var(--color-ink);
    text-align: left;
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease);
    white-space: nowrap;
  }

  .item:hover,
  .item:focus-visible {
    background: var(--color-bg-surface-1);
    outline: none;
  }

  .item.destructive {
    color: var(--color-terra);
  }
  .item.destructive:hover,
  .item.destructive:focus-visible {
    background: var(--color-terra-tint);
  }

  .item[aria-disabled='true'] {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  .item-icon {
    display: inline-flex;
    margin-right: var(--space-2);
    flex-shrink: 0;
  }

  .divider {
    height: 0.5px;
    background: var(--color-warm-light);
    margin: var(--space-1) 0;
  }
</style>
