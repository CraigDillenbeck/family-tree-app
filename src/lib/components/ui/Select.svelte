<script lang="ts">
  import { ChevronDown, Check } from 'lucide-svelte'
  import Icon from './Icon.svelte'
  import Tag from './Tag.svelte'

  export interface SelectOption {
    value: string
    label: string
    disabled?: boolean
  }

  let {
    label,
    placeholder = 'Select…',
    options = [],
    value = $bindable(''),
    values = $bindable<string[]>([]),
    variant = 'default',
    error,
    disabled = false,
    onchange,
  }: {
    label?: string
    placeholder?: string
    options: SelectOption[]
    /** single-select value — bind for default + searchable variants */
    value?: string
    /** multi-select values — bind for multi variant */
    values?: string[]
    variant?: 'default' | 'searchable' | 'multi'
    error?: string
    disabled?: boolean
    onchange?: (value: string) => void
  } & Record<string, unknown> = $props()

  const uid = Math.random().toString(36).slice(2, 7)
  const listboxId = `listbox-${uid}`

  let open = $state(false)
  let activeIndex = $state(-1)
  let query = $state('')
  let containerEl: HTMLDivElement | undefined = $state()
  let triggerEl: HTMLDivElement | undefined = $state()
  let searchEl: HTMLInputElement | undefined = $state()

  const filteredOptions = $derived(
    variant === 'searchable' && query.trim()
      ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
      : options
  )

  const selectedLabel = $derived(options.find(o => o.value === value)?.label ?? '')

  const activeDescendant = $derived(
    open && activeIndex >= 0 ? `option-${uid}-${activeIndex}` : undefined
  )

  function isSelected(v: string) {
    return variant === 'multi' ? values.includes(v) : value === v
  }

  function firstNavigableIndex() {
    return filteredOptions.findIndex(o => !o.disabled)
  }

  function openDropdown() {
    if (disabled) return
    open = true
    // pre-highlight the currently selected option (or first navigable)
    const preselect = filteredOptions.findIndex(o => !o.disabled && isSelected(o.value))
    activeIndex = preselect >= 0 ? preselect : firstNavigableIndex()
    if (variant === 'searchable') {
      // let the search input render first, then focus it
      setTimeout(() => searchEl?.focus(), 0)
    }
  }

  function closeDropdown() {
    open = false
    activeIndex = -1
    query = ''
    triggerEl?.focus()
  }

  function toggleDropdown() {
    if (open) closeDropdown(); else openDropdown()
  }

  function selectOption(option: SelectOption) {
    if (option.disabled) return
    if (variant === 'multi') {
      values = values.includes(option.value)
        ? values.filter(v => v !== option.value)
        : [...values, option.value]
    } else {
      value = option.value
      onchange?.(option.value)
      closeDropdown()
    }
  }

  function handleTriggerKeydown(e: KeyboardEvent) {
    // Don't intercept when searchable + open (search input handles it)
    if (variant === 'searchable' && open) return
    handleListboxKeydown(e)
  }

  function handleListboxKeydown(e: KeyboardEvent) {
    const navigable = filteredOptions
      .map((o, i) => ({ o, i }))
      .filter(({ o }) => !o.disabled)
    const currentNav = navigable.findIndex(({ i }) => i === activeIndex)

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!open) { openDropdown(); break }
        if (activeIndex >= 0) selectOption(filteredOptions[activeIndex])
        if (variant !== 'multi') closeDropdown()
        break
      case 'Escape':
        e.preventDefault()
        closeDropdown()
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!open) { openDropdown(); break }
        activeIndex = navigable[Math.min(currentNav + 1, navigable.length - 1)]?.i ?? activeIndex
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!open) { openDropdown(); break }
        activeIndex = navigable[Math.max(currentNav - 1, 0)]?.i ?? activeIndex
        break
      case 'Home':
        e.preventDefault()
        activeIndex = navigable[0]?.i ?? -1
        break
      case 'End':
        e.preventDefault()
        activeIndex = navigable[navigable.length - 1]?.i ?? -1
        break
    }
  }

  // Scroll the active option into view without causing layout jumps
  $effect(() => {
    if (!open || activeIndex < 0) return
    const el = document.getElementById(`option-${uid}-${activeIndex}`)
    el?.scrollIntoView({ block: 'nearest' })
  })

  // Close on outside click
  $effect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      if (containerEl && !containerEl.contains(e.target as Node)) closeDropdown()
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  })
</script>

<div class="field" bind:this={containerEl}>
  {#if label}
    <span class="label" id="label-{uid}">{label}</span>
  {/if}

  <!-- Trigger -->
  <div
    bind:this={triggerEl}
    class="trigger"
    class:open
    class:error={!!error}
    class:disabled
    tabindex={disabled ? -1 : 0}
    role="combobox"
    aria-expanded={open}
    aria-haspopup="listbox"
    aria-controls={listboxId}
    aria-activedescendant={activeDescendant}
    aria-labelledby={label ? `label-${uid}` : undefined}
    aria-disabled={disabled}
    aria-invalid={!!error}
    onclick={toggleDropdown}
    onkeydown={handleTriggerKeydown}
  >
    <span class="trigger-content">
      {#if variant === 'multi'}
        {#if values.length > 0}
          <span class="chips">
            {#each values as v}
              {@const opt = options.find(o => o.value === v)}
              {#if opt}
                <Tag ondismiss={() => {
                  values = values.filter(val => val !== v)
                }}>{opt.label}</Tag>
              {/if}
            {/each}
          </span>
        {:else}
          <span class="placeholder">{placeholder}</span>
        {/if}
      {:else if variant === 'searchable' && open}
        <!-- When open: show a search input; value reflects typed query -->
        <input
          bind:this={searchEl}
          bind:value={query}
          class="search"
          placeholder={selectedLabel || placeholder}
          oninput={() => { activeIndex = firstNavigableIndex() }}
          onkeydown={handleListboxKeydown}
          onclick={(e) => e.stopPropagation()}
        />
      {:else}
        {#if selectedLabel}
          <span class="selected-label">{selectedLabel}</span>
        {:else}
          <span class="placeholder">{placeholder}</span>
        {/if}
      {/if}
    </span>

    <span class="chevron" class:flipped={open} aria-hidden="true">
      <Icon icon={ChevronDown} size={12} color="var(--color-warm-mid)" />
    </span>
  </div>

  <!-- Dropdown -->
  {#if open}
    <ul
      class="listbox"
      id={listboxId}
      role="listbox"
      aria-multiselectable={variant === 'multi'}
    >
      {#if variant === 'searchable' && filteredOptions.length === 0}
        <li class="empty">No options match</li>
      {:else}
        {#each filteredOptions as option, i}
          <li
            id="option-{uid}-{i}"
            class="option"
            class:active={i === activeIndex}
            class:selected={isSelected(option.value)}
            class:option-disabled={option.disabled}
            role="option"
            aria-selected={isSelected(option.value)}
            aria-disabled={option.disabled}
            onmousedown={(e) => { e.preventDefault(); selectOption(option) }}
            onmouseenter={() => { if (!option.disabled) activeIndex = i }}
          >
            <span class="option-label">{option.label}</span>
            {#if isSelected(option.value)}
              <span class="check" aria-hidden="true">
                <Icon icon={Check} size={12} color="var(--color-gold)" />
              </span>
            {/if}
          </li>
        {/each}
      {/if}
    </ul>
  {/if}

  {#if error}
    <span class="msg" role="alert">{error}</span>
  {/if}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    position: relative;
  }

  .label {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-label);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  /* ── Trigger ── */
  .trigger {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    height: 36px;
    padding: 0 var(--space-3);
    background: var(--color-surface-2);
    border: var(--border-default);
    border-radius: var(--radius-sm);
    cursor: pointer;
    user-select: none;
    transition:
      background var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease);
  }

  .trigger:hover:not(.open):not(.error):not(.disabled) {
    border: var(--border-strong);
  }

  .trigger:focus-visible {
    outline: var(--border-focus-ring);
    outline-offset: 2px;
    border-color: var(--color-gold);
    background: #fff;
  }

  .trigger.open {
    background: #fff;
    border-color: var(--color-gold);
    outline: var(--border-focus-ring);
    outline-offset: 2px;
  }

  .trigger.error {
    background: var(--color-terra-tint);
    border-color: var(--color-terra);
  }

  .trigger.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* multi variant needs min-height instead of fixed height */
  .trigger:has(.chips) {
    height: auto;
    min-height: 36px;
    padding: var(--space-2) var(--space-3);
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .trigger-content {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .selected-label {
    font-family: var(--font-ui);
    font-size: 14px;
    font-weight: var(--font-weight-regular);
    color: var(--color-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .placeholder {
    font-family: var(--font-ui);
    font-size: 14px;
    color: var(--color-text-hint);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  /* Inline search input for searchable variant */
  .search {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-family: var(--font-ui);
    font-size: 14px;
    font-weight: var(--font-weight-regular);
    color: var(--color-ink);
    padding: 0;
  }

  .search::placeholder {
    color: var(--color-text-hint);
  }

  .chevron {
    display: inline-flex;
    flex-shrink: 0;
    transition: transform var(--dur-fast) var(--ease);
  }

  .chevron.flipped {
    transform: rotate(180deg);
  }

  /* ── Listbox dropdown ── */
  .listbox {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    z-index: 100;
    list-style: none;
    margin: 0;
    padding: var(--space-1) 0;
    background: #fff;
    border: var(--border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-floating);
    max-height: 280px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    padding: 0 var(--space-3);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease);
  }

  .option:hover,
  .option.active {
    background: var(--color-surface-1);
  }

  .option.selected {
    background: var(--color-surface-1);
  }

  .option.option-disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  .option-label {
    font-family: var(--font-ui);
    font-size: 14px;
    font-weight: var(--font-weight-regular);
    color: var(--color-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .check {
    display: inline-flex;
    flex-shrink: 0;
    margin-left: var(--space-2);
  }

  .empty {
    padding: var(--space-3);
    font-family: var(--font-ui);
    font-size: 14px;
    color: var(--color-text-hint);
    text-align: center;
  }

  /* ── Error message ── */
  .msg {
    font-family: var(--font-ui);
    font-size: var(--font-size-caption);
    color: var(--color-terra);
  }
</style>
