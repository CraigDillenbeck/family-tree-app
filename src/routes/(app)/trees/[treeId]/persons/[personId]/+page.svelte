<script lang="ts">
  import { invalidateAll, goto } from '$app/navigation'
  import type { PageProps } from './$types'
  import type { ProfileMemory, ProfileMedia } from './+page.server'
  import Badge from '$lib/components/ui/Badge.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Card from '$lib/components/ui/Card.svelte'
  import Tabs from '$lib/components/ui/Tabs.svelte'
  import Tag from '$lib/components/ui/Tag.svelte'
  import Drawer from '$lib/components/ui/Drawer.svelte'
  import Modal from '$lib/components/ui/Modal.svelte'
  import Icon from '$lib/components/ui/Icon.svelte'
  import { Trash2 } from 'lucide-svelte'
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

  const tabs = $derived([
    { value: 'about', label: 'About' },
    { value: 'memories', label: 'Memories', count: data.memories.length || undefined },
    { value: 'media', label: 'Media', count: data.media.length || undefined },
    { value: 'relationships', label: 'Relationships', count: data.relationships.length || undefined },
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

  // Relationship deletion
  let deletingRelId = $state<string | null>(null)
  let deleteRelError = $state<string | null>(null)
  let deleteRelSubmitting = $state(false)

  async function confirmDeleteRelationship() {
    if (!deletingRelId || deleteRelSubmitting) return
    deleteRelSubmitting = true
    deleteRelError = null
    try {
      const res = await fetch(`/api/trees/${data.tree.id}/relationships?id=${deletingRelId}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        deleteRelError = d.error ?? 'Could not remove the connection. Please try again.'
        return
      }
      deletingRelId = null
      await invalidateAll()
    } catch {
      deleteRelError = 'Something went wrong. Please try again.'
    } finally {
      deleteRelSubmitting = false
    }
  }
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
      </div>

      {#if data.person.bio}
        <p class="bio">{data.person.bio}</p>
      {:else}
        <p class="bio empty-bio">This person's story is waiting to be told.</p>
      {/if}

      <div class="actions">
        {#if canEdit}
          <Button onclick={openCreateDrawer}>Add a memory</Button>
          <Button variant="secondary" onclick={() => goto(`/trees/${data.tree.id}/persons/${data.person.id}/edit`)}>Edit profile</Button>
          <Button variant="ghost" onclick={() => goto(`/trees/${data.tree.id}`)}>Add relationship</Button>
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
          <Tag>All memories</Tag>
        </div>

        {#if data.memories.length === 0}
          <div class="empty-state">
            <p class="empty-text">The first memory you add will live here.</p>
            {#if canEdit}
              <Button variant="secondary" onclick={openCreateDrawer}>Add a memory</Button>
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
                  memoryDatePrecision: m.memory_date_precision as 'full' | 'month_year' | 'year' | 'approximate',
                  tags: [],
                }}
                onclick={canEdit ? () => openEditDrawer(m) : undefined}
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

    {#if activeTab === 'relationships'}
      <div class="tab-inner narrow">
        {#if data.relationships.length === 0}
          <div class="empty-state">
            <p class="empty-text">Connect this person to others in your tree.</p>
            {#if canEdit}
              <Button variant="secondary" onclick={() => goto(`/trees/${data.tree.id}`)}>Go to tree to add connections</Button>
            {/if}
          </div>
        {:else}
          <div class="rel-list">
            {#each data.relationships as r (r.id)}
              {@const relName = [r.person.first_name, r.person.last_name].filter(Boolean).join(' ')}
              <div class="rel-row">
                <a class="rel-link" href="/trees/{data.tree.id}/persons/{r.person.id}">
                  <Avatar
                    person={{ given: r.person.first_name, family: r.person.last_name ?? '', status: r.person.is_living ? 'living' : 'deceased' }}
                    size={48}
                  />
                  <div class="rel-info">
                    <p class="rel-name">{relName}</p>
                    {#if r.dates}<p class="rel-dates">{r.dates}</p>{/if}
                  </div>
                  <Badge variant="warm">{r.label}</Badge>
                </a>
                {#if canEdit}
                  <button
                    class="rel-delete"
                    type="button"
                    onclick={() => { deletingRelId = r.id; deleteRelError = null }}
                    aria-label={`Remove ${r.label} connection to ${relName}`}
                  >
                    <Icon icon={Trash2} size={14} color="currentColor" />
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

  </div>
</div>

<!-- ── Delete relationship confirmation ── -->
<Modal
  open={deletingRelId !== null}
  title="Remove connection"
  variant="confirmation"
  onclose={() => { deletingRelId = null; deleteRelError = null }}
>
  {#snippet children()}
    <p style="font-family:var(--font-body);font-size:var(--font-size-body-story);line-height:var(--line-height-story);color:var(--color-text-primary);margin:0">
      This will remove the connection from the tree. The two people will remain in your tree — only their link is removed.
    </p>
    {#if deleteRelError}
      <p style="font-family:var(--font-ui);font-size:var(--font-size-label);color:var(--color-terra);margin:var(--space-3) 0 0">{deleteRelError}</p>
    {/if}
  {/snippet}
  {#snippet footer()}
    <Button variant="ghost" onclick={() => { deletingRelId = null; deleteRelError = null }} disabled={deleteRelSubmitting}>Cancel</Button>
    <Button variant="destructive" onclick={confirmDeleteRelationship} disabled={deleteRelSubmitting}>
      {deleteRelSubmitting ? 'Removing…' : 'Remove connection'}
    </Button>
  {/snippet}
</Modal>

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
      onSuccess={closeDrawer}
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
    margin-top: var(--space-3);
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

  /* ── Relationships ── */
  .rel-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .rel-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-lg);
    transition: border-color var(--dur-fast) var(--ease);
  }
  .rel-row:has(.rel-link:hover) { border-color: var(--color-border-strong); }

  .rel-link {
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    text-decoration: none;
    color: inherit;
    min-width: 0;
  }

  .rel-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-right: var(--space-2);
    background: none;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--color-text-secondary);
    flex-shrink: 0;
    transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
  }
  .rel-delete:hover {
    background: color-mix(in srgb, var(--color-terra) 10%, transparent);
    color: var(--color-terra);
  }

  .rel-info { flex: 1; min-width: 0; }

  .rel-name {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 14px;
    color: var(--color-text-primary);
    margin: 0;
  }

  .rel-dates {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-text-secondary);
    margin: 0;
  }
</style>
