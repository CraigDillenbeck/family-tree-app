<script lang="ts">
  import Divider from '$lib/components/ui/Divider.svelte'
  import Tag from '$lib/components/ui/Tag.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import MemoryStoryCard, { type MemoryData } from './MemoryStoryCard.svelte'
  import { ChevronDown } from 'lucide-svelte'
  import Icon from '$lib/components/ui/Icon.svelte'
  import { prefersReducedMotion } from '$lib/utils/motion'

  type SortOrder = 'newest' | 'oldest' | 'decade'
  type TagFilter = { id: string; name: string }

  let {
    memories,
    availableTags = [],
    personName,
    onaddmemory,
    onviewmemory,
  }: {
    memories: MemoryData[]
    availableTags?: TagFilter[]
    /** Person's first name — used in aria labels */
    personName?: string
    onaddmemory?: () => void
    onviewmemory?: (id: string) => void
  } = $props()

  let sort = $state<SortOrder>('newest')
  let activeTagIds = $state<Set<string>>(new Set())
  let sortAnnouncement = $state('')

  // Filter: union — show memories with any active tag
  const filtered = $derived.by(() => {
    if (activeTagIds.size === 0) return memories
    return memories.filter((m) =>
      m.tags?.some((t) => activeTagIds.has(t.id))
    )
  })

  // Sort
  const sorted = $derived.by(() => {
    const list = [...filtered]
    if (sort === 'oldest') {
      return list.sort((a, b) => (a.memoryDate ?? '').localeCompare(b.memoryDate ?? ''))
    }
    return list.sort((a, b) => (b.memoryDate ?? '').localeCompare(a.memoryDate ?? ''))
  })

  // Group by year for timeline display
  type YearGroup = { year: string; items: MemoryData[] }
  const grouped = $derived.by<YearGroup[]>(() => {
    const map = new Map<string, MemoryData[]>()
    for (const m of sorted) {
      const year = m.memoryDate ? String(new Date(m.memoryDate + 'T00:00:00').getFullYear()) : 'Undated'
      if (!map.has(year)) map.set(year, [])
      map.get(year)!.push(m)
    }
    return [...map.entries()].map(([year, items]) => ({ year, items }))
  })

  function setSort(value: SortOrder, label: string) {
    sort = value
    sortAnnouncement = `Sorted by ${label}`
  }

  function toggleTag(id: string) {
    const next = new Set(activeTagIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    activeTagIds = next
  }

  const filterCount = $derived(sorted.length)
  const totalCount = $derived(memories.length)

  const dur = prefersReducedMotion() ? 0 : 40  // stagger base delay

  const sortLabels: Record<SortOrder, string> = {
    newest: 'Newest first',
    oldest: 'Oldest first',
    decade: 'By decade',
  }
</script>

<section class="timeline" aria-label="{personName ? `${personName}'s memories` : 'Memories'}">
  <!-- ── Controls ── -->
  <div class="controls">
    <!-- Tag filter chips -->
    {#if availableTags.length > 0}
      <div class="filter-chips" role="group" aria-label="Filter by tag">
        <Tag
          onclick={() => { activeTagIds = new Set() }}
        >
          <span aria-pressed={activeTagIds.size === 0}>All memories</span>
        </Tag>
        {#each availableTags as tag (tag.id)}
          <Tag
            onclick={() => toggleTag(tag.id)}
          >
            <span aria-pressed={activeTagIds.has(tag.id)}>{tag.name}</span>
          </Tag>
        {/each}
      </div>
    {/if}

    <!-- Sort + count row -->
    <div class="sort-row">
      <span class="count" aria-live="polite">
        {#if filterCount < totalCount}
          {filterCount} of {totalCount} memories
        {:else}
          {totalCount} {totalCount === 1 ? 'memory' : 'memories'}
        {/if}
      </span>

      <div class="sort-group" role="group" aria-label="Sort order">
        {#each (['newest', 'oldest', 'decade'] as SortOrder[]) as option}
          <button
            class="sort-btn"
            class:active={sort === option}
            onclick={() => setSort(option, sortLabels[option])}
            aria-pressed={sort === option}
          >{sortLabels[option]}</button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Screen reader sort announcement -->
  <p class="sr-only" role="status" aria-live="polite">{sortAnnouncement}</p>

  <!-- ── Timeline list ── -->
  {#if grouped.length === 0}
    <p class="empty-message">No memories found.</p>
  {:else}
    <ul class="year-list" aria-label="Memory timeline">
      {#each grouped as group, gi (group.year)}
        <li class="year-section">
          <h2 class="year-heading">
            <Divider variant="label" label={group.year} decorative={false} />
          </h2>

          <ul class="memory-list" aria-label={group.year}>
            {#each group.items as memory, mi (memory.id)}
              <li
                class="memory-item"
                style="animation-delay: {(gi * group.items.length + mi) * dur}ms"
              >
                <MemoryStoryCard
                  {memory}
                  onclick={onviewmemory ? () => onviewmemory!(memory.id) : undefined}
                />
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
  {/if}

  <!-- Sticky "Add memory" — bottom-right of viewport -->
  {#if onaddmemory}
    <div class="sticky-add">
      <Button
        variant="primary"
        onclick={onaddmemory}
        aria-label={personName ? `Add a memory for ${personName}` : 'Add a memory'}
      >Add memory</Button>
    </div>
  {/if}
</section>

<style>
  .timeline {
    position: relative;
    max-width: var(--reading-width);
    margin: 0 auto;
  }

  /* ── Controls ── */
  .controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-bottom: var(--space-8);
  }

  .filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .sort-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .count {
    font-family: var(--font-ui);
    font-size: var(--font-size-caption);
    color: var(--color-warm-mid);
  }

  .sort-group {
    display: flex;
    gap: var(--space-1);
  }

  .sort-btn {
    font-family: var(--font-ui);
    font-size: var(--font-size-caption);
    font-weight: var(--font-weight-regular);
    color: var(--color-warm-mid);
    background: transparent;
    border: none;
    padding: 4px var(--space-2);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease);
  }

  .sort-btn:hover { color: var(--color-ink); background: var(--color-bg-surface-1); }

  .sort-btn.active {
    color: var(--color-ink);
    font-weight: var(--font-weight-medium);
  }

  /* ── Year list ── */
  .year-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .year-section {
    margin-bottom: var(--space-12);
  }

  .year-heading {
    margin: 0 0 var(--space-8);
  }

  /* ── Memory list ── */
  .memory-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .memory-item {
    animation: rise-in 280ms var(--ease) both;
  }

  @keyframes rise-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .memory-item { animation: none; }
  }

  /* ── Sticky CTA ── */
  .sticky-add {
    position: fixed;
    bottom: var(--space-8);
    right: var(--space-8);
    z-index: 100;
  }

  /* ── Empty / misc ── */
  .empty-message {
    font-family: var(--font-ui);
    font-size: var(--font-size-body-ui);
    color: var(--color-warm-mid);
    text-align: center;
    padding: var(--space-12) 0;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 480px) {
    .sort-row { flex-direction: column; align-items: flex-start; }
    .sticky-add { bottom: var(--space-4); right: var(--space-4); }
  }
</style>
