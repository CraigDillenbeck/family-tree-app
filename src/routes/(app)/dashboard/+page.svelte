<script lang="ts">
  import type { PageData } from './$types'
  import type { Json } from '$lib/supabase/types'
  import Card from '$lib/components/ui/Card.svelte'
  import Button from '$lib/components/ui/Button.svelte'

  let { data }: { data: PageData } = $props()

  const givenName = $derived(
    data.user?.user_metadata?.full_name?.split(' ')[0]
    ?? data.user?.email?.split('@')[0]
    ?? 'there'
  )

  const today = $derived(
    new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      .format(new Date())
  )

  const primaryTree = $derived(data.primaryTree)
  const addPersonHref = $derived(
    primaryTree ? `/trees/${primaryTree.id}/persons/new` : '/trees/new'
  )

  function activityLabel(action: string, metadata: Json | null): string {
    const m = (metadata ?? {}) as Record<string, unknown>
    switch (action) {
      case 'person_added': {
        const name = [m.first_name, m.last_name].filter(Boolean).join(' ')
        return name ? `Added ${name}` : 'Added a person'
      }
      case 'person_updated':
        return 'Updated a person'
      case 'memory_created':
        return m.title ? `Added memory: "${m.title}"` : 'Added a memory'
      case 'memory_updated':
        return 'Updated a memory'
      case 'media_uploaded':
        return 'Uploaded media'
      case 'relationship_added':
        return 'Added a relationship'
      case 'collaborator_invited':
        return 'Invited a collaborator'
      default:
        return action.replace(/_/g, ' ')
    }
  }

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60_000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    if (d < 7) return `${d}d ago`
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(iso))
  }

  function memoryExcerpt(content: string | null): string {
    if (!content) return ''
    return content.length > 140 ? content.slice(0, 137) + '…' : content
  }
</script>

<svelte:head>
  <title>Dashboard — Prosapiam</title>
</svelte:head>

<div class="page">
  <div class="inner">

    <div class="welcome">
      <p class="dateline">{today}</p>
      <h1>Welcome back, {givenName}.</h1>
      {#if !primaryTree}
        <p class="subtext">Your tree is ready to grow — begin with yourself.</p>
      {:else if primaryTree.personCount === 0}
        <p class="subtext">Your tree is planted. Add the first person to watch it grow.</p>
      {:else}
        <p class="subtext">Begin with yourself — your tree is ready to grow.</p>
      {/if}
    </div>

    <div class="grid">

      <div class="col-main">

        <Card style="padding: 0">
          <div class="card-head">
            <span class="section-label">Recent activity</span>
            {#if primaryTree}
              <Button variant="ghost" size="sm" href="/trees/{primaryTree.id}/activity">See all</Button>
            {/if}
          </div>
          {#if data.recentActivity.length > 0}
            <ul class="activity-list" role="list">
              {#each data.recentActivity as entry (entry.id)}
                <li class="activity-item">
                  <span class="activity-label">{activityLabel(entry.action, entry.metadata)}</span>
                  <span class="activity-time">{timeAgo(entry.created_at)}</span>
                </li>
              {/each}
            </ul>
          {:else}
            <div class="empty-area">
              <p class="empty-text">No activity yet. Your tree's story begins here.</p>
            </div>
          {/if}
        </Card>

        <Card style="padding: 0">
          <div class="card-head">
            <span class="section-label">Latest memory</span>
            {#if primaryTree}
              <Button variant="ghost" size="sm" href="/trees/{primaryTree.id}/persons">Add memory</Button>
            {/if}
          </div>
          {#if data.latestMemory}
            <a
              href="/trees/{primaryTree?.id}/persons"
              class="memory-preview"
              aria-label="View memory: {data.latestMemory.title}"
            >
              <p class="memory-title">{data.latestMemory.title}</p>
              {#if data.latestMemory.content}
                <p class="memory-excerpt">{memoryExcerpt(data.latestMemory.content)}</p>
              {/if}
              <p class="memory-date">{timeAgo(data.latestMemory.created_at)}</p>
            </a>
          {:else}
            <div class="empty-area">
              <p class="empty-text">The first memory you add will live here.</p>
            </div>
          {/if}
        </Card>

      </div>

      <div class="col-side">

        {#if data.trees.length === 0}
          <a href="/trees/new" class="tree-card-link">
            <Card interactive>
              <p class="section-label">Your tree</p>
              <p class="tree-count">0</p>
              <p class="tree-meta">family members</p>
              <span class="begin-cta">Begin your tree →</span>
            </Card>
          </a>
        {:else}
          {#each data.trees as tree (tree.id)}
            <a href="/trees/{tree.id}" class="tree-card-link">
              <Card interactive>
                <p class="section-label">{tree.name}</p>
                <p class="tree-count">{tree.personCount}</p>
                <p class="tree-meta">{tree.personCount === 1 ? 'family member' : 'family members'}</p>
                <span class="begin-cta">{tree.personCount === 0 ? 'Begin your tree →' : 'Open tree →'}</span>
              </Card>
            </a>
          {/each}
        {/if}

        <Card>
          <p class="section-label">Quick add</p>
          <div class="quick-add">
            <Button href={addPersonHref}>Add a person</Button>
            <Button variant="secondary" disabled={!primaryTree}>Add a memory</Button>
            <Button variant="secondary" disabled={!primaryTree}>Upload media</Button>
          </div>
        </Card>

      </div>

    </div>
  </div>
</div>

<style>
  .page {
    background: var(--color-bg-page);
    min-height: calc(100vh - 52px);
    padding: var(--space-12) var(--space-20);
  }

  .inner {
    max-width: 1120px;
    margin: 0 auto;
  }

  /* ── Welcome ── */
  .welcome { margin-bottom: var(--space-8); }

  .dateline {
    font-family: var(--font-body);
    font-size: 13px;
    font-style: italic;
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-1) 0;
  }

  h1 {
    font-family: var(--font-display);
    font-size: var(--font-size-display-l);
    font-weight: var(--font-weight-light);
    letter-spacing: -0.01em;
    line-height: var(--line-height-tight);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-2) 0;
  }

  .subtext {
    font-family: var(--font-body);
    font-size: var(--font-size-body-ui);
    font-style: italic;
    line-height: var(--line-height-story);
    color: var(--color-text-body);
    max-width: 560px;
    margin: 0;
  }

  /* ── Grid ── */
  .grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--space-6);
    align-items: start;
  }

  .col-main,
  .col-side {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* ── Card internals ── */
  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px var(--space-6);
    border-bottom: var(--border-default);
  }

  .section-label {
    display: block;
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-2) 0;
  }

  .card-head .section-label { margin: 0; }

  .empty-area {
    padding: var(--space-8) var(--space-6);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-text {
    font-family: var(--font-body);
    font-size: var(--font-size-body-ui);
    font-style: italic;
    color: var(--color-text-hint);
    text-align: center;
    margin: 0;
  }

  /* ── Activity list ── */
  .activity-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .activity-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-6);
    border-bottom: var(--border-default);
  }

  .activity-item:last-child { border-bottom: none; }

  .activity-label {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-text-primary);
  }

  .activity-time {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-text-hint);
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* ── Memory preview ── */
  .memory-preview {
    display: block;
    padding: var(--space-6);
    text-decoration: none;
    transition: background var(--dur-fast) var(--ease);
  }

  .memory-preview:hover { background: var(--color-bg-surface-2); }

  .memory-title {
    font-family: var(--font-ui);
    font-size: var(--font-size-body-ui);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-2) 0;
  }

  .memory-excerpt {
    font-family: var(--font-body);
    font-size: var(--font-size-body-ui);
    font-style: italic;
    line-height: var(--line-height-story);
    color: var(--color-text-body);
    margin: 0 0 var(--space-3) 0;
  }

  .memory-date {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-text-hint);
    margin: 0;
  }

  /* ── Tree stat card ── */
  .tree-card-link { text-decoration: none; }

  .tree-count {
    font-family: var(--font-ui);
    font-size: var(--font-size-display-l);
    font-weight: var(--font-weight-light);
    color: var(--color-text-primary);
    line-height: 1;
    margin: var(--space-1) 0 0 0;
  }

  .tree-meta {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-text-secondary);
    margin: var(--space-1) 0 var(--space-4) 0;
  }

  .begin-cta {
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: var(--font-weight-medium);
    color: var(--color-accent);
  }

  /* ── Quick add ── */
  .quick-add {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .quick-add :global(button),
  .quick-add :global(a) {
    width: 100%;
    justify-content: center;
  }
</style>
