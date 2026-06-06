<script lang="ts">
  import { invalidateAll, goto } from '$app/navigation'
  import type { PageProps } from './$types'
  import type { ProfileMemory, ProfileMedia } from './+page.server'
  import Badge from '$lib/components/ui/Badge.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Tabs from '$lib/components/ui/Tabs.svelte'
  import Tag from '$lib/components/ui/Tag.svelte'
  import Drawer from '$lib/components/ui/Drawer.svelte'
  import MemoryStoryCard from '$lib/components/patterns/MemoryStoryCard.svelte'
  import MemoryEditor from '$lib/components/memory/MemoryEditor.svelte'
  import MediaGrid from '$lib/components/media/MediaGrid.svelte'
  import MediaUploader from '$lib/components/media/MediaUploader.svelte'

  const { data }: PageProps = $props()

  let activeTab = $state('memories')
  let drawerOpen = $state(false)
  let editingMemory = $state<ProfileMemory | null>(null)
  let uploaderOpen = $state(false)

  async function handleMediaUploaded() {
    uploaderOpen = false
    await invalidateAll()
  }

  async function handleMediaDeleted(mediaId: string) {
    await fetch(`/api/trees/${data.tree.id}/media?mediaId=${mediaId}`, { method: 'DELETE' })
    await invalidateAll()
  }

  function openCreateDrawer() {
    editingMemory = null
    drawerOpen = true
  }

  function openEditDrawer(m: ProfileMemory) {
    editingMemory = m
    drawerOpen = true
  }

  function closeDrawer() {
    drawerOpen = false
  }

  async function handleMemorySaved() {
    drawerOpen = false
    await invalidateAll()
  }

  const tabs = $derived([
    { value: 'about', label: 'About' },
    { value: 'memories', label: 'Memories', count: data.memories.length || undefined },
    { value: 'media', label: 'Media', count: data.media.length || undefined },
  ])

  const fullName = $derived(
    [data.person.first_name, data.person.last_name].filter(Boolean).join(' ') || 'Unknown person'
  )

  function yearOf(iso: string | null): string | null {
    if (!iso) return null
    return new Date(iso + 'T00:00:00').getFullYear().toString()
  }

  const birthYear = $derived(yearOf(data.person.birth_date))
  const deathYear = $derived(yearOf(data.person.death_date))
  const dateRange = $derived(
    data.person.is_living
      ? birthYear ? `b. ${birthYear}` : null
      : [birthYear, deathYear].filter(Boolean).join('–') || null
  )

  const hasDetails = $derived(
    !!(data.person.bio || data.person.birth_date || data.person.birth_place)
  )

  const canEdit = $derived(data.userRole === 'owner' || data.userRole === 'editor')

  type RelPart = { text: string; href?: string }
  type RelClause = RelPart[]

  function personName(p: { first_name: string; last_name: string | null }): string {
    return [p.first_name, p.last_name].filter(Boolean).join(' ')
  }

  function nameLink(p: { id: string; first_name: string; last_name: string | null }): RelPart {
    return { text: personName(p), href: `/trees/${data.tree.id}/persons/${p.id}` }
  }

  const relationshipClauses = $derived.by((): RelClause[] => {
    const rels = data.relationships
    if (!rels.length) return []

    const clauses: RelClause[] = []

    const parents = rels.filter(r => r.label === 'Parent')
    if (parents.length) {
      const clause: RelPart[] = [{ text: 'Child of ' }]
      parents.forEach((r, i) => {
        if (i > 0) clause.push({ text: i === parents.length - 1 ? ' and ' : ', ' })
        clause.push(nameLink(r.person))
      })
      clauses.push(clause)
    }

    const adoptiveParents = rels.filter(r => r.label === 'Adoptive parent')
    if (adoptiveParents.length) {
      const clause: RelPart[] = [{ text: 'Adopted child of ' }]
      adoptiveParents.forEach((r, i) => {
        if (i > 0) clause.push({ text: ' and ' })
        clause.push(nameLink(r.person))
      })
      clauses.push(clause)
    }

    const stepParents = rels.filter(r => r.label === 'Step-parent')
    if (stepParents.length) {
      const clause: RelPart[] = [{ text: 'Step-child of ' }]
      stepParents.forEach((r, i) => {
        if (i > 0) clause.push({ text: ' and ' })
        clause.push(nameLink(r.person))
      })
      clauses.push(clause)
    }

    rels.filter(r => r.label === 'Spouse').forEach(r =>
      clauses.push([{ text: 'Married to ' }, nameLink(r.person)])
    )
    rels.filter(r => r.label === 'Former spouse').forEach(r =>
      clauses.push([{ text: 'Formerly married to ' }, nameLink(r.person)])
    )
    rels.filter(r => r.label === 'Partner').forEach(r =>
      clauses.push([{ text: 'Partner of ' }, nameLink(r.person)])
    )

    const children = rels.filter(r => ['Child', 'Adopted child', 'Step-child'].includes(r.label))
    if (children.length) {
      const clause: RelPart[] = [{ text: 'Parent of ' }]
      children.forEach((r, i) => {
        if (i > 0) clause.push({ text: i === children.length - 1 ? ' and ' : ', ' })
        clause.push(nameLink(r.person))
      })
      clauses.push(clause)
    }

    const siblings = rels.filter(r => ['Sibling', 'Half-sibling', 'Step-sibling'].includes(r.label))
    if (siblings.length >= 1 && siblings.length <= 2) {
      const clause: RelPart[] = [{ text: 'Sibling of ' }]
      siblings.forEach((r, i) => {
        if (i > 0) clause.push({ text: ' and ' })
        clause.push(nameLink(r.person))
      })
      clauses.push(clause)
    }

    return clauses
  })
</script>

<svelte:head>
  <title>{fullName} — Prosapiam</title>
</svelte:head>

<div class="profile">

  <!-- ── Breadcrumb ── -->
  <div class="breadcrumb">
    <a href="/trees/{data.tree.id}" class="back-link">&#8592; Back to tree</a>
  </div>

  <!-- ── Profile header ── -->
  <header class="header">
    <Avatar
      person={{ given: data.person.first_name, family: data.person.last_name ?? '', status: data.person.is_living ? 'living' : 'deceased' }}
      size={128}
    />

    <div class="header-info">
      <h1 class="name">{fullName}</h1>

      {#if dateRange || data.person.birth_place}
        <p class="meta">
          {[dateRange, data.person.birth_place].filter(Boolean).join(' · ')}
        </p>
      {/if}

      <div class="status-row">
        <Badge variant={data.person.is_living ? 'sage' : 'terra'} dot>
          {data.person.is_living ? 'Living' : 'Deceased'}
        </Badge>
        {#if data.person.primary_residence}
          <span class="location">{data.person.primary_residence}</span>
        {/if}
      </div>

      {#if relationshipClauses.length}
        <p class="rel-summary">
          {#each relationshipClauses as clause, ci}
            {#if ci > 0}<span class="rel-sep"> · </span>{/if}
            {#each clause as part}
              {#if part.href}
                <a href={part.href} class="rel-name-link">{part.text}</a>
              {:else}
                {part.text}
              {/if}
            {/each}
          {/each}
        </p>
      {/if}

      {#if data.person.bio}
        <p class="bio">{data.person.bio}</p>
      {:else}
        <p class="bio empty-bio">This person's story is waiting to be told.</p>
      {/if}

      <div class="actions">
        {#if canEdit}
          <Button variant="secondary" onclick={() => goto(`/trees/${data.tree.id}/persons/${data.person.id}/edit`)}>Edit profile</Button>
        {/if}
      </div>
    </div>
  </header>

  <!-- ── Tabs ── -->
  <div class="tabs-bar">
    <Tabs
      items={tabs}
      value={activeTab}
      onchange={(v) => (activeTab = v)}
    />
  </div>

  <!-- ── Tab body ── -->
  <div class="tab-body">

    {#if activeTab === 'memories'}
      <div class="tab-inner narrow">
        <div class="tab-top">
          <span class="section-label">Newest first</span>
          {#if canEdit}
            <Button onclick={openCreateDrawer}>Add a memory</Button>
          {/if}
        </div>

        {#if data.memories.length === 0}
          <div class="empty-state">
            <p class="empty-text">The first memory you add will live here.</p>
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
                onclick={() => goto(`/trees/${data.tree.id}/memories/${m.id}?from=${data.person.id}`)}
              />
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    {#if activeTab === 'about'}
      <div class="tab-inner narrow">
        {#if !hasDetails}
          <div class="empty-state">
            <p class="empty-text">Edit this person's profile to add their details.</p>
            {#if canEdit}<Button variant="secondary" onclick={() => goto(`/trees/${data.tree.id}/persons/${data.person.id}/edit`)}>Edit profile</Button>{/if}
          </div>
        {:else}
          <dl class="facts">
            <dt class="fact-label">Given name</dt>
            <dd class="fact-value">{data.person.first_name}</dd>
            {#if data.person.last_name}
              <dt class="fact-label">Family name</dt>
              <dd class="fact-value">{data.person.last_name}</dd>
            {/if}
            {#if data.person.birth_date}
              <dt class="fact-label">Born</dt>
              <dd class="fact-value">{data.person.birth_date}</dd>
            {/if}
            {#if data.person.birth_place}
              <dt class="fact-label">Birthplace</dt>
              <dd class="fact-value">{data.person.birth_place}</dd>
            {/if}
            <dt class="fact-label">Status</dt>
            <dd class="fact-value">{data.person.is_living ? 'Living' : 'Deceased'}</dd>
          </dl>
        {/if}
      </div>
    {/if}

    {#if activeTab === 'media'}
      <div class="tab-inner">
        {#if canEdit}
          <div class="media-toolbar">
            <Button variant="secondary" onclick={() => (uploaderOpen = true)}>Upload media</Button>
          </div>
        {/if}

        {#if data.media.length === 0}
          <div class="empty-state">
            <p class="empty-text">Photographs, letters, recordings — add them here.</p>
          </div>
        {:else}
          <MediaGrid
            items={data.media}
            {canEdit}
            onDelete={handleMediaDeleted}
          />
        {/if}
      </div>
    {/if}

  </div>
</div>

<!-- ── Memory editor drawer ── -->
<Drawer
  open={drawerOpen}
  title={editingMemory ? 'Edit memory' : 'Add a memory'}
  variant="detail"
  onclose={closeDrawer}
>
  {#key editingMemory?.id ?? 'new'}
    <MemoryEditor
      memory={editingMemory}
      personId={data.person.id}
      onSuccess={handleMemorySaved}
      onCancel={closeDrawer}
    />
  {/key}
</Drawer>

<!-- ── Media uploader drawer ── -->
<Drawer
  open={uploaderOpen}
  title="Upload media"
  variant="detail"
  onclose={() => (uploaderOpen = false)}
>
  <MediaUploader
    treeId={data.tree.id}
    personId={data.person.id}
    onUploaded={handleMediaUploaded}
    onCancel={() => (uploaderOpen = false)}
  />
</Drawer>

<style>
  .profile {
    background: var(--color-bg-page);
    min-height: calc(100vh - 52px);
  }

  /* ── Breadcrumb ── */
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

  /* ── Header ── */
  .header {
    display: flex;
    gap: var(--space-12);
    align-items: flex-start;
    max-width: var(--grid-max-width);
    margin: 0 auto;
    padding: var(--space-12) var(--space-20) var(--space-8);
  }

  .header-info {
    flex: 1;
  }

  .name {
    font-family: var(--font-display);
    font-weight: var(--font-weight-light);
    font-size: var(--font-size-display-l);
    letter-spacing: -0.01em;
    color: var(--color-text-primary);
    margin: 0;
    line-height: var(--line-height-tight);
  }

  .meta {
    font-family: var(--font-ui);
    font-size: 16px;
    color: var(--color-text-secondary);
    margin: var(--space-2) 0 0 0;
    line-height: var(--line-height-ui);
  }

  .status-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-3);
  }

  .location {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  .rel-summary {
    font-family: var(--font-body);
    font-size: 15px;
    font-style: italic;
    color: var(--color-text-secondary);
    line-height: var(--line-height-story);
    margin: var(--space-3) 0 0 0;
    max-width: var(--reading-width);
  }

  .rel-name-link {
    color: var(--color-text-primary);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
    text-decoration-color: var(--color-warm-light);
    transition: color var(--dur-fast) var(--ease), text-decoration-color var(--dur-fast) var(--ease);
  }
  .rel-name-link:hover {
    color: var(--color-gold);
    text-decoration-color: var(--color-gold);
  }

  .rel-sep {
    color: var(--color-text-hint);
  }

  .bio {
    font-family: var(--font-body);
    font-size: var(--font-size-body-story);
    color: var(--color-text-body);
    line-height: var(--line-height-story);
    max-width: var(--reading-width);
    margin: var(--space-6) 0 0 0;
  }

  .empty-bio {
    font-style: italic;
    color: var(--color-text-hint);
  }

  .actions {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-6);
  }

  /* ── Tabs bar ── */
  .tabs-bar {
    max-width: var(--grid-max-width);
    margin: 0 auto;
    padding: 0 var(--space-20);
  }

  /* ── Tab body ── */
  .tab-body {
    max-width: var(--grid-max-width);
    margin: 0 auto;
    padding: var(--space-8) var(--space-20) var(--space-20);
  }

  .tab-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .tab-inner.narrow {
    max-width: var(--reading-width);
    margin: 0 auto;
    width: 100%;
  }

  .tab-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* ── Empty states ── */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-12) 0;
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

  /* ── Section label ── */
  .section-label {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  /* ── Memories ── */
  .memory-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* ── About ── */
  .facts {
    display: grid;
    grid-template-columns: 140px 1fr;
    row-gap: var(--space-4);
    column-gap: var(--space-6);
    margin: 0;
  }

  .fact-label {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
    padding-top: 2px;
  }

  .fact-value {
    font-family: var(--font-ui);
    font-size: var(--font-size-body-ui);
    color: var(--color-text-primary);
    margin: 0;
  }

  /* ── Media ── */
  .media-toolbar {
    display: flex;
    justify-content: flex-end;
  }
</style>
