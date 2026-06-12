<script lang="ts">
  import type { PageData } from './$types'
  import type { Json } from '$lib/supabase/types'
  import Card from '$lib/components/ui/Card.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Dropdown from '$lib/components/ui/Dropdown.svelte'
  import type { DropdownItem } from '$lib/components/ui/Dropdown.svelte'
  import Icon from '$lib/components/ui/Icon.svelte'
  import { MoreHorizontal, Settings } from 'lucide-svelte'
  import { goto } from '$app/navigation'

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
  function activityLabel(action: string, diff: Json | null): string {
    const m = (diff ?? {}) as Record<string, unknown>
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

  function cardMenuItems(tree: { id: string }): DropdownItem[] {
    return [
      {
        label: 'Settings',
        icon: Settings,
        onclick: () => goto(`/trees/${tree.id}/settings`),
      },
    ]
  }
</script>

<svelte:head>
  <title>Dashboard — Prosapia</title>
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

        <div class="trees-section">
          <p class="section-label">Your trees</p>
          {#if data.trees.length === 0}
            <div class="trees-grid">
              <a href="/trees/new" class="tree-card-link">
                <Card interactive>
                  <p class="tree-count">0</p>
                  <p class="tree-meta">family members</p>
                  <span class="begin-cta">Begin your tree →</span>
                </Card>
              </a>
            </div>
          {:else}
            <div class="trees-grid">
              {#each data.trees as tree (tree.id)}
                <div class="tree-card-outer">
                  <a href="/trees/{tree.id}" class="tree-card-link">
                    <Card interactive>
                      <p class="tree-name">{tree.name}</p>
                      <p class="tree-count">{tree.personCount}</p>
                      <p class="tree-meta">{tree.personCount === 1 ? 'family member' : 'family members'}</p>
                      <span class="begin-cta">{tree.personCount === 0 ? 'Begin your tree →' : 'Open tree →'}</span>
                    </Card>
                  </a>
                  <div class="tree-card-menu">
                    <Dropdown items={cardMenuItems(tree)} align="right">
                      {#snippet trigger({ open, toggle })}
                        <button
                          class="tree-menu-btn"
                          type="button"
                          onclick={toggle}
                          aria-haspopup="menu"
                          aria-expanded={open}
                          aria-label="Options for {tree.name}"
                        >
                          <Icon icon={MoreHorizontal} size={16} color="currentColor" />
                        </button>
                      {/snippet}
                    </Dropdown>
                  </div>
                </div>
              {/each}
              <a href="/trees/new" class="tree-card-link new-tree-link" aria-label="Create a new tree">
                <Card interactive>
                  <span class="new-tree-plus" aria-hidden="true">+</span>
                  <span class="new-tree-label">New tree</span>
                </Card>
              </a>
            </div>
          {/if}
        </div>

      </div>

      <div class="col-side">

        <Card style="padding: 0">
          <div class="card-head">
            <span class="section-label">Recent activity</span>
            {#if primaryTree}
              <Button variant="ghost" size="sm" onclick={() => goto(`/trees/${primaryTree.id}/activity`)}>See all</Button>
            {/if}
          </div>
          {#if data.recentActivity.length > 0}
            <ul class="activity-list" role="list">
              {#each data.recentActivity as entry (entry.id)}
                <li class="activity-item">
                  <span class="activity-label">{activityLabel(entry.action, entry.diff)}</span>
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
              <Button variant="ghost" size="sm" onclick={() => goto(`/trees/${primaryTree.id}/persons`)}>Add memory</Button>
            {/if}
          </div>
          {#if data.latestMemory}
            <a
              href="/trees/{primaryTree?.id}/persons"
              class="memory-preview"
              aria-label="View memory: {data.latestMemory.title}"
            >
              <p class="memory-title">{data.latestMemory.title}</p>
              {#if data.latestMemory.body}
                <p class="memory-excerpt">{memoryExcerpt(data.latestMemory.body)}</p>
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

  /* ── Trees section ── */
  .trees-section { display: flex; flex-direction: column; gap: var(--space-4); }

  .trees-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .tree-card-outer {
    position: relative;
  }

  .tree-card-link { text-decoration: none; display: block; }

  .tree-card-menu {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    z-index: 1;
  }

  .tree-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: var(--color-bg-page);
    border: var(--border-default);
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--color-text-secondary);
    opacity: 0;
    transition: opacity var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
  }

  .tree-card-outer:hover .tree-menu-btn,
  .tree-menu-btn:focus-visible,
  .tree-menu-btn[aria-expanded='true'] {
    opacity: 1;
  }

  .tree-menu-btn:hover {
    background: var(--color-bg-surface-1);
    color: var(--color-text-primary);
  }

  .tree-name {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-2) 0;
  }

  .tree-count {
    font-family: var(--font-ui);
    font-size: var(--font-size-display-l);
    font-weight: var(--font-weight-light);
    color: var(--color-text-primary);
    line-height: 1;
    margin: 0;
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

  /* ── New tree card ── */
  .new-tree-link :global(.card) {
    border: 1.5px dashed var(--color-border-default);
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    gap: var(--space-2);
  }

  .new-tree-plus {
    font-family: var(--font-ui);
    font-size: 28px;
    font-weight: var(--font-weight-light);
    color: var(--color-text-hint);
    line-height: 1;
  }

  .new-tree-label {
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-hint);
  }

  .new-tree-link:hover .new-tree-plus,
  .new-tree-link:hover .new-tree-label {
    color: var(--color-accent);
  }
</style>
