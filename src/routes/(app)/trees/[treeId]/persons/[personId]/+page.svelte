<script lang="ts">
  import Badge from '$lib/components/ui/Badge.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Card from '$lib/components/ui/Card.svelte'
  import Tabs from '$lib/components/ui/Tabs.svelte'
  import Tag from '$lib/components/ui/Tag.svelte'
  import { page } from '$app/stores'

  // Server will populate this in a future step:
  // data.person, data.memories[], data.media[], data.relationships[]
  const treeId = $page.params.treeId

  // Placeholder — will come from data.person once server load is wired up
  const person = {
    firstName: '',
    lastName: '',
    isLiving: true,
    birthDate: null as string | null,
    deathDate: null as string | null,
    birthplace: null as string | null,
    biography: null as string | null,
  }

  const memories: { id: string; title: string; excerpt: string; date: string; tags: string[] }[] = []
  const mediaItems: { id: string; caption: string | null }[] = []
  const relationships: { id: string; label: string; personName: string; dates: string }[] = []

  let activeTab = $state('memories')

  const tabs = [
    { value: 'about', label: 'About' },
    { value: 'memories', label: 'Memories', count: memories.length || undefined },
    { value: 'media', label: 'Media', count: mediaItems.length || undefined },
    { value: 'relationships', label: 'Relationships', count: relationships.length || undefined },
  ]

  const hasData = $derived(person.firstName !== '')
  const fullName = $derived(
    [person.firstName, person.lastName].filter(Boolean).join(' ') || 'Unknown person'
  )
  const dateRange = $derived(
    [person.birthDate, person.deathDate].filter(Boolean).join(' – ') ||
    (person.birthDate ? `b. ${person.birthDate}` : null)
  )
</script>

<svelte:head>
  <title>{fullName} — Prosapiam</title>
</svelte:head>

<div class="profile">

  <!-- ── Breadcrumb ── -->
  <div class="breadcrumb">
    <a href="/trees/{treeId}" class="back-link">&#8592; Back to tree</a>
  </div>

  <!-- ── Profile header ── -->
  <header class="header">
    <Avatar
      person={{ given: person.firstName || '?', family: person.lastName, status: person.isLiving ? 'living' : 'deceased' }}
      size={128}
    />

    <div class="header-info">
      <h1 class="name">{fullName}</h1>

      {#if dateRange || person.birthplace}
        <p class="meta">
          {[dateRange, person.birthplace].filter(Boolean).join(' · ')}
        </p>
      {/if}

      <div class="status-row">
        <Badge variant={person.isLiving ? 'sage' : 'terra'} dot>
          {person.isLiving ? 'Living' : 'Deceased'}
        </Badge>
      </div>

      {#if person.biography}
        <p class="bio">{person.biography}</p>
      {:else if !hasData}
        <p class="bio empty-bio">This person's story is waiting to be told.</p>
      {/if}

      <div class="actions">
        <Button>Add a memory</Button>
        <Button variant="secondary">Edit profile</Button>
        <Button variant="ghost">Add relationship</Button>
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

        {#if memories.length === 0}
          <div class="empty-state">
            <p class="empty-text">The first memory you add will live here.</p>
            <Button variant="secondary">Add a memory</Button>
          </div>
        {:else}
          <div class="memory-list">
            {#each memories as m (m.id)}
              <Card interactive>
                <h3 class="memory-title">{m.title}</h3>
                <p class="memory-excerpt">{m.excerpt}</p>
                <div class="memory-foot">
                  <span class="memory-date">{m.date}</span>
                  {#if m.tags.length}
                    <span class="dot">·</span>
                    {#each m.tags as t}
                      <Badge variant="warm">{t}</Badge>
                    {/each}
                  {/if}
                </div>
              </Card>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    {#if activeTab === 'about'}
      <div class="tab-inner narrow">
        {#if !hasData}
          <div class="empty-state">
            <p class="empty-text">Edit this person's profile to add their details.</p>
            <Button variant="secondary">Edit profile</Button>
          </div>
        {:else}
          <dl class="facts">
            {#if person.firstName}
              <dt class="fact-label">Given name</dt>
              <dd class="fact-value">{person.firstName}</dd>
            {/if}
            {#if person.lastName}
              <dt class="fact-label">Family name</dt>
              <dd class="fact-value">{person.lastName}</dd>
            {/if}
            {#if person.birthDate}
              <dt class="fact-label">Born</dt>
              <dd class="fact-value">{person.birthDate}</dd>
            {/if}
            {#if person.birthplace}
              <dt class="fact-label">Birthplace</dt>
              <dd class="fact-value">{person.birthplace}</dd>
            {/if}
            <dt class="fact-label">Status</dt>
            <dd class="fact-value">{person.isLiving ? 'Living' : 'Deceased'}</dd>
          </dl>
        {/if}
      </div>
    {/if}

    {#if activeTab === 'media'}
      <div class="tab-inner">
        {#if mediaItems.length === 0}
          <div class="empty-state">
            <p class="empty-text">Photographs, letters, recordings — add them here.</p>
            <Button variant="secondary">Upload media</Button>
          </div>
        {:else}
          <div class="media-grid">
            {#each mediaItems as item (item.id)}
              <div class="media-cell">
                <div class="media-thumb"></div>
                {#if item.caption}
                  <p class="media-caption">{item.caption}</p>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    {#if activeTab === 'relationships'}
      <div class="tab-inner narrow">
        {#if relationships.length === 0}
          <div class="empty-state">
            <p class="empty-text">Connect this person to others in your tree.</p>
            <Button variant="secondary">Add relationship</Button>
          </div>
        {:else}
          <div class="rel-list">
            {#each relationships as r (r.id)}
              <div class="rel-row">
                <Avatar person={{ given: r.personName }} size={48} />
                <div class="rel-info">
                  <p class="rel-name">{r.personName}</p>
                  <p class="rel-dates">{r.dates}</p>
                </div>
                <Badge variant="warm">{r.label}</Badge>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

  </div>
</div>

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
    font-family: var(--font-display);
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
    font-family: var(--font-display);
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
    font-family: var(--font-display);
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

  .memory-title {
    font-family: var(--font-display);
    font-weight: var(--font-weight-medium);
    font-size: 16px;
    color: var(--color-text-primary);
    margin: 0;
  }

  .memory-excerpt {
    font-family: var(--font-body);
    font-size: 14px;
    font-style: italic;
    color: var(--color-text-body);
    line-height: var(--line-height-story);
    margin: var(--space-2) 0 0 0;
  }

  .memory-foot {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-3);
  }

  .memory-date {
    font-family: var(--font-display);
    font-size: var(--font-size-label);
    color: var(--color-text-secondary);
  }

  .dot {
    font-family: var(--font-display);
    font-size: var(--font-size-label);
    color: var(--color-text-hint);
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
    font-family: var(--font-display);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
    padding-top: 2px;
  }

  .fact-value {
    font-family: var(--font-display);
    font-size: var(--font-size-body-ui);
    color: var(--color-text-primary);
    margin: 0;
  }

  /* ── Media ── */
  .media-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
    max-width: 900px;
    margin: 0 auto;
  }

  .media-cell {
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .media-thumb {
    aspect-ratio: 4 / 3;
    background: var(--color-bg-surface-2);
  }

  .media-caption {
    padding: var(--space-3);
    font-family: var(--font-display);
    font-size: 12px;
    color: var(--color-text-body);
    margin: 0;
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
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-lg);
  }

  .rel-info { flex: 1; }

  .rel-name {
    font-family: var(--font-display);
    font-weight: var(--font-weight-medium);
    font-size: 14px;
    color: var(--color-text-primary);
    margin: 0;
  }

  .rel-dates {
    font-family: var(--font-display);
    font-size: 12px;
    color: var(--color-text-secondary);
    margin: 0;
  }
</style>
