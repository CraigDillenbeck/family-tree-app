<script lang="ts">
  import type { PageProps } from './$types'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Icon from '$lib/components/ui/Icon.svelte'
  import { ArrowLeft, Users, BookOpen, Image, UserPlus, ChevronDown, ChevronUp, Activity } from 'lucide-svelte'

  const { data }: PageProps = $props()

  type ActivityAction = 'created' | 'updated' | 'deleted' | 'uploaded' | 'tagged' | 'invited'
  type Event = typeof data.events[number]

  const DEFAULT_SHOWN = 10

  let showAll = $state<Record<string, boolean>>({})

  function toggleShowAll(key: string) {
    showAll = { ...showAll, [key]: !showAll[key] }
  }

  function visible(events: Event[], key: string): Event[] {
    return showAll[key] ? events : events.slice(0, DEFAULT_SHOWN)
  }

  const personEvents = $derived(data.events.filter(e => e.entity_type === 'person'))
  const memoryEvents = $derived(data.events.filter(e => e.entity_type === 'memory'))
  const mediaEvents  = $derived(data.events.filter(e => e.entity_type === 'media'))
  const collabEvents = $derived(data.events.filter(e => e.entity_type === 'collaborator'))

  function actorOf(ev: Event) {
    return Array.isArray(ev.actor) ? ev.actor[0] : ev.actor
  }

  function actorName(ev: Event): string {
    return actorOf(ev)?.display_name ?? 'Someone'
  }

  function actorAvatar(ev: Event): string | undefined {
    return actorOf(ev)?.avatar_url ?? undefined
  }

  function verb(action: ActivityAction): string {
    switch (action) {
      case 'created':  return 'added'
      case 'updated':  return 'updated'
      case 'deleted':  return 'removed'
      case 'uploaded': return 'uploaded'
      case 'tagged':   return 'tagged'
      case 'invited':  return 'invited'
      default:         return action
    }
  }

  function personHref(ev: Event): string | null {
    if (ev.action === 'deleted') return null
    return `/trees/${data.tree.id}?person=${ev.entity_id}`
  }

  function memoryHref(ev: Event): string | null {
    if (ev.action === 'deleted') return null
    const pid = data.memoryPersonId[ev.entity_id]
    return pid ? `/trees/${data.tree.id}/persons/${pid}` : null
  }

  function mediaHref(ev: Event): string | null {
    if (ev.action === 'deleted') return null
    const pid = data.mediaPersonId[ev.entity_id]
    return pid ? `/trees/${data.tree.id}/persons/${pid}/media` : null
  }

  function formatTime(isoString: string): string {
    const now = Date.now()
    const then = new Date(isoString).getTime()
    const diff = now - then
    const minute = 60_000
    const hour = 60 * minute
    const day = 24 * hour
    const week = 7 * day

    if (diff < minute) return 'just now'
    if (diff < hour) return `${Math.floor(diff / minute)}m ago`
    if (diff < day) return `${Math.floor(diff / hour)}h ago`
    if (diff < week) return `${Math.floor(diff / day)}d ago`
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: new Date(isoString).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    })
  }

  function formatFullTime(isoString: string): string {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    })
  }
</script>

<svelte:head>
  <title>Activity — {data.tree.name}</title>
</svelte:head>

<div class="page">
  <div class="inner">

    <a class="back" href="/trees/{data.tree.id}">
      <Icon icon={ArrowLeft} size={16} color="currentColor" />
      {data.tree.name}
    </a>

    <header class="header">
      <h1 class="title">Activity</h1>
      <p class="subtitle">A record of every change to this tree.</p>
    </header>

    {#if data.events.length === 0}
      <div class="empty">
        <div class="empty-icon">
          <Icon icon={Activity} size={28} color="var(--color-warm-light)" />
        </div>
        <p class="empty-title">No activity yet.</p>
        <p class="empty-body">Changes to this tree — people added, memories written, files uploaded — will appear here.</p>
      </div>
    {:else}
      <div class="grid">

        <!-- People -->
        <section class="card">
          <div class="card-head">
            <div class="card-icon">
              <Icon icon={Users} size={15} color="var(--color-gold)" />
            </div>
            <h2 class="card-title">People</h2>
            {#if personEvents.length > 0}
              <span class="card-count">{personEvents.length}</span>
            {/if}
          </div>

          {#if personEvents.length === 0}
            <p class="card-empty">No changes to people yet.</p>
          {:else}
            <ul class="item-list">
              {#each visible(personEvents, 'person') as ev (ev.id)}
                {@const href = personHref(ev)}
                {@const name = data.personNames[ev.entity_id] ?? 'a person'}
                <li class="item">
                  <Avatar
                    person={{ given: actorName(ev), family: '', status: 'living' }}
                    src={actorAvatar(ev)}
                    size={24}
                  />
                  <div class="item-body">
                    <p class="item-text">
                      <span class="item-actor">{actorName(ev)}</span>
                      {' '}{verb(ev.action as ActivityAction)}{' '}
                      {#if href}
                        <a class="item-link" {href}>{name}</a>
                      {:else}
                        <span class="item-gone">{name}</span>
                      {/if}
                    </p>
                    <time class="item-time" datetime={ev.created_at} title={formatFullTime(ev.created_at)}>
                      {formatTime(ev.created_at)}
                    </time>
                  </div>
                </li>
              {/each}
            </ul>
            {#if personEvents.length > DEFAULT_SHOWN}
              <button class="show-more" type="button" onclick={() => toggleShowAll('person')}>
                <Icon icon={showAll['person'] ? ChevronUp : ChevronDown} size={13} color="currentColor" />
                {showAll['person'] ? 'Show less' : `Show all ${personEvents.length}`}
              </button>
            {/if}
          {/if}
        </section>

        <!-- Memories -->
        <section class="card">
          <div class="card-head">
            <div class="card-icon">
              <Icon icon={BookOpen} size={15} color="var(--color-gold)" />
            </div>
            <h2 class="card-title">Memories</h2>
            {#if memoryEvents.length > 0}
              <span class="card-count">{memoryEvents.length}</span>
            {/if}
          </div>

          {#if memoryEvents.length === 0}
            <p class="card-empty">No memories added yet.</p>
          {:else}
            <ul class="item-list">
              {#each visible(memoryEvents, 'memory') as ev (ev.id)}
                {@const href = memoryHref(ev)}
                {@const title = data.memoryTitles[ev.entity_id] ?? 'a memory'}
                <li class="item">
                  <Avatar
                    person={{ given: actorName(ev), family: '', status: 'living' }}
                    src={actorAvatar(ev)}
                    size={24}
                  />
                  <div class="item-body">
                    <p class="item-text">
                      <span class="item-actor">{actorName(ev)}</span>
                      {' '}{verb(ev.action as ActivityAction)}{' '}
                      {#if href}
                        <a class="item-link" {href}>{title}</a>
                      {:else}
                        <span class="item-gone">{title}</span>
                      {/if}
                    </p>
                    <time class="item-time" datetime={ev.created_at} title={formatFullTime(ev.created_at)}>
                      {formatTime(ev.created_at)}
                    </time>
                  </div>
                </li>
              {/each}
            </ul>
            {#if memoryEvents.length > DEFAULT_SHOWN}
              <button class="show-more" type="button" onclick={() => toggleShowAll('memory')}>
                <Icon icon={showAll['memory'] ? ChevronUp : ChevronDown} size={13} color="currentColor" />
                {showAll['memory'] ? 'Show less' : `Show all ${memoryEvents.length}`}
              </button>
            {/if}
          {/if}
        </section>

        <!-- Media -->
        <section class="card">
          <div class="card-head">
            <div class="card-icon">
              <Icon icon={Image} size={15} color="var(--color-gold)" />
            </div>
            <h2 class="card-title">Media</h2>
            {#if mediaEvents.length > 0}
              <span class="card-count">{mediaEvents.length}</span>
            {/if}
          </div>

          {#if mediaEvents.length === 0}
            <p class="card-empty">No files uploaded yet.</p>
          {:else}
            <ul class="item-list">
              {#each visible(mediaEvents, 'media') as ev (ev.id)}
                {@const href = mediaHref(ev)}
                {@const title = data.mediaTitles[ev.entity_id] ?? 'a file'}
                <li class="item">
                  <Avatar
                    person={{ given: actorName(ev), family: '', status: 'living' }}
                    src={actorAvatar(ev)}
                    size={24}
                  />
                  <div class="item-body">
                    <p class="item-text">
                      <span class="item-actor">{actorName(ev)}</span>
                      {' '}{verb(ev.action as ActivityAction)}{' '}
                      {#if href}
                        <a class="item-link" {href}>{title}</a>
                      {:else}
                        <span class="item-gone">{title}</span>
                      {/if}
                    </p>
                    <time class="item-time" datetime={ev.created_at} title={formatFullTime(ev.created_at)}>
                      {formatTime(ev.created_at)}
                    </time>
                  </div>
                </li>
              {/each}
            </ul>
            {#if mediaEvents.length > DEFAULT_SHOWN}
              <button class="show-more" type="button" onclick={() => toggleShowAll('media')}>
                <Icon icon={showAll['media'] ? ChevronUp : ChevronDown} size={13} color="currentColor" />
                {showAll['media'] ? 'Show less' : `Show all ${mediaEvents.length}`}
              </button>
            {/if}
          {/if}
        </section>

      </div>

      <!-- Collaborators (full-width strip below the grid, only if relevant) -->
      {#if collabEvents.length > 0}
        <section class="card collab-card">
          <div class="card-head">
            <div class="card-icon">
              <Icon icon={UserPlus} size={15} color="var(--color-gold)" />
            </div>
            <h2 class="card-title">Collaborators</h2>
            <span class="card-count">{collabEvents.length}</span>
          </div>
          <ul class="item-list collab-list">
            {#each visible(collabEvents, 'collab') as ev (ev.id)}
              <li class="item">
                <Avatar
                  person={{ given: actorName(ev), family: '', status: 'living' }}
                  src={actorAvatar(ev)}
                  size={24}
                />
                <div class="item-body">
                  <p class="item-text">
                    <span class="item-actor">{actorName(ev)}</span>
                    {' '}invited a collaborator
                  </p>
                  <time class="item-time" datetime={ev.created_at} title={formatFullTime(ev.created_at)}>
                    {formatTime(ev.created_at)}
                  </time>
                </div>
              </li>
            {/each}
          </ul>
          {#if collabEvents.length > DEFAULT_SHOWN}
            <button class="show-more" type="button" onclick={() => toggleShowAll('collab')}>
              <Icon icon={showAll['collab'] ? ChevronUp : ChevronDown} size={13} color="currentColor" />
              {showAll['collab'] ? 'Show less' : `Show all ${collabEvents.length}`}
            </button>
          {/if}
        </section>
      {/if}

    {/if}

  </div>
</div>

<style>
  .page {
    min-height: calc(100vh - 52px);
    background: var(--color-bg-page);
    padding: var(--space-10) var(--space-6);
  }

  .inner {
    max-width: 1200px;
    margin: 0 auto;
  }

  .back {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    text-decoration: none;
    margin-bottom: var(--space-8);
    transition: color var(--dur-fast) var(--ease);
  }
  .back:hover { color: var(--color-text-primary); }

  .header {
    margin-bottom: var(--space-10);
  }

  .title {
    font-family: var(--font-display);
    font-size: 36px;
    font-weight: var(--font-weight-regular);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-2) 0;
    line-height: 1.15;
  }

  .subtitle {
    font-family: var(--font-body);
    font-style: italic;
    font-size: 16px;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: var(--line-height-story);
  }

  /* ── Empty state ── */
  .empty {
    text-align: center;
    padding: var(--space-20) 0;
  }

  .empty-icon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-full);
    background: var(--color-bg-surface-1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--space-6);
  }

  .empty-title {
    font-family: var(--font-ui);
    font-size: 15px;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-2) 0;
  }

  .empty-body {
    font-family: var(--font-body);
    font-size: 15px;
    color: var(--color-text-secondary);
    margin: 0 auto;
    line-height: var(--line-height-story);
    max-width: 360px;
    font-style: italic;
  }

  /* ── Category grid ── */
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
    margin-bottom: var(--space-6);
  }

  /* ── Section card ── */
  .card {
    background: var(--color-bg-surface-1);
    border: var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 0;
  }

  .collab-card {
    margin-top: 0;
  }

  .card-head {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    background: var(--color-bg-surface-2);
    flex-shrink: 0;
  }

  .card-title {
    font-family: var(--font-ui);
    font-size: 14px;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin: 0;
    flex: 1;
  }

  .card-count {
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    background: var(--color-bg-surface-2);
    border-radius: var(--radius-full);
    padding: 2px var(--space-2);
    flex-shrink: 0;
  }

  .card-empty {
    font-family: var(--font-body);
    font-style: italic;
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: var(--line-height-story);
  }

  /* ── Item list ── */
  .item-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
    flex: 1;
  }

  .collab-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 0;
  }

  .item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-2) 0;
    border-bottom: var(--border-subtle);
  }

  .item:last-child {
    border-bottom: none;
  }

  .item-body {
    flex: 1;
    min-width: 0;
  }

  .item-text {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-text-primary);
    margin: 0 0 2px;
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-actor {
    font-weight: var(--font-weight-medium);
  }

  .item-link {
    color: var(--color-text-primary);
    text-decoration: underline;
    text-decoration-color: var(--color-warm-light);
    text-underline-offset: 2px;
    transition: color var(--dur-fast) var(--ease), text-decoration-color var(--dur-fast) var(--ease);
  }

  .item-link:hover {
    color: var(--color-gold);
    text-decoration-color: var(--color-gold);
  }

  .item-gone {
    color: var(--color-text-secondary);
  }

  .item-time {
    font-family: var(--font-ui);
    font-size: 11px;
    color: var(--color-text-secondary);
  }

  /* ── Show more button ── */
  .show-more {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    background: none;
    border: none;
    padding: 0;
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: color var(--dur-fast) var(--ease);
    align-self: flex-start;
  }

  .show-more:hover {
    color: var(--color-gold);
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 600px) {
    .page { padding: var(--space-6) var(--space-3); }
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
