<script lang="ts">
  import { invalidateAll, goto } from '$app/navigation'
  import type { PageProps } from './$types'
  import type { MemoryItem } from './+page.server'
  import Button from '$lib/components/ui/Button.svelte'
  import Drawer from '$lib/components/ui/Drawer.svelte'
  import MemoryStoryCard from '$lib/components/patterns/MemoryStoryCard.svelte'
  import MemoryEditor from '$lib/components/memory/MemoryEditor.svelte'

  const { data }: PageProps = $props()

  const fullName = $derived(
    [data.person.first_name, data.person.last_name].filter(Boolean).join(' ')
  )

  let drawerOpen = $state(false)
  let editingMemory = $state<MemoryItem | null>(null)

  function openCreateDrawer() {
    editingMemory = null
    drawerOpen = true
  }

  function openEditDrawer(m: MemoryItem) {
    editingMemory = m
    drawerOpen = true
  }

  async function handleMemorySaved() {
    drawerOpen = false
    await invalidateAll()
  }
</script>

<svelte:head>
  <title>{fullName}'s Memories — {data.tree.name}</title>
</svelte:head>

<div class="page">

  <div class="breadcrumb">
    <a href="/trees/{data.tree.id}/persons/{data.person.id}" class="back-link">
      &#8592; {data.person.first_name}'s profile
    </a>
  </div>

  <div class="inner">

    <div class="page-top">
      <div class="page-heading">
        <h1 class="title">{fullName}'s Memories</h1>
        {#if data.memories.length > 0}
          <p class="count">{data.memories.length} {data.memories.length === 1 ? 'memory' : 'memories'}</p>
        {/if}
      </div>
      {#if data.canEdit}
        <Button onclick={openCreateDrawer}>Add a memory</Button>
      {/if}
    </div>

    {#if data.memories.length === 0}
      <div class="empty-state">
        <p class="empty-text">The first memory you add will live here.</p>
        {#if data.canEdit}
          <Button variant="secondary" onclick={openCreateDrawer}>Add the first memory</Button>
        {/if}
      </div>
    {:else}
      <div class="memory-list">
        {#each data.memories as m (m.id)}
          <MemoryStoryCard
            memory={{
              id: m.id,
              title: m.title,
              content: m.excerpt,
              memoryDate: m.memory_date,
              memoryDatePrecision: m.memory_date_precision as 'exact' | 'month' | 'year' | 'decade' | 'circa',
              tags: [],
            }}
            authorName={m.author_name}
            addedAt={m.created_at}
            onclick={() => {
              if (data.canEdit) {
                openEditDrawer(m)
              } else {
                goto(`/trees/${data.tree.id}/memories/${m.id}?from=${data.person.id}`)
              }
            }}
          />
        {/each}
      </div>
    {/if}

  </div>
</div>

<Drawer
  open={drawerOpen}
  title={editingMemory ? 'Edit memory' : 'Add a memory'}
  variant="detail"
  onclose={() => { drawerOpen = false }}
>
  {#key editingMemory?.id ?? 'new'}
    <MemoryEditor
      memory={editingMemory}
      personId={data.person.id}
      onSuccess={handleMemorySaved}
      onCancel={() => { drawerOpen = false }}
    />
  {/key}
</Drawer>

<style>
  .page {
    background: var(--color-bg-page);
    min-height: calc(100vh - 52px);
  }

  .breadcrumb {
    padding: var(--space-4) var(--space-20);
    border-bottom: var(--border-subtle);
  }

  .back-link {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-text-secondary);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
    text-decoration-color: var(--color-warm-light);
  }
  .back-link:hover { color: var(--color-text-primary); }

  .inner {
    max-width: var(--grid-max-width);
    margin: 0 auto;
    padding: var(--space-12) var(--space-20) var(--space-20);
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .page-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-6);
  }

  .page-heading {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .title {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-display-l);
    letter-spacing: -0.01em;
    color: var(--color-text-primary);
    margin: 0;
    line-height: var(--line-height-tight);
  }

  .count {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
    padding: var(--space-24) 0;
    text-align: center;
  }

  .empty-text {
    font-family: var(--font-body);
    font-size: var(--font-size-body-story);
    font-style: italic;
    color: var(--color-text-hint);
    margin: 0;
    line-height: var(--line-height-story);
  }

  .memory-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
    align-items: start;
  }

  @media (max-width: 860px) {
    .memory-list { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 540px) {
    .inner { padding: var(--space-8) var(--space-4) var(--space-12); }
    .memory-list { grid-template-columns: 1fr; }
    .page-top { flex-direction: column; align-items: flex-start; }
  }
</style>
