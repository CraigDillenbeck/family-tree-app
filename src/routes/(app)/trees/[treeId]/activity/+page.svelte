<script lang="ts">
  import type { PageProps } from './$types'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Icon from '$lib/components/ui/Icon.svelte'
  import { ArrowLeft, Activity } from 'lucide-svelte'

  const { data }: PageProps = $props()

  type ActivityAction = 'created' | 'updated' | 'deleted' | 'uploaded' | 'tagged' | 'invited'

  function describeEvent(action: ActivityAction, entityType: string): string {
    const entity = entityType === 'tree' ? 'tree' :
                   entityType === 'person' ? 'person' :
                   entityType === 'memory' ? 'memory' :
                   entityType === 'media' ? 'a file' :
                   entityType === 'relationship' ? 'a relationship' :
                   entityType === 'collaborator' ? 'a collaborator' :
                   entityType

    switch (action) {
      case 'created':  return entityType === 'tree' ? 'Created this tree' : `Added ${entity === 'person' ? 'a person' : entity}`
      case 'updated':  return `Updated ${entity === 'tree' ? 'tree details' : entity === 'person' ? 'a person' : entity}`
      case 'deleted':  return `Removed ${entity === 'person' ? 'a person' : entity}`
      case 'uploaded': return 'Uploaded a file'
      case 'tagged':   return 'Tagged a person'
      case 'invited':  return 'Invited a collaborator'
      default:         return `${action} ${entity}`
    }
  }

  function formatRelativeTime(isoString: string): string {
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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Group events by calendar day for the timeline separator
  type Event = typeof data.events[number]
  type Group = { dateLabel: string; events: Event[] }

  const grouped = $derived.by(() => {
    const groups: Group[] = []
    let lastLabel = ''
    for (const ev of data.events) {
      const d = new Date(ev.created_at)
      const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      if (label !== lastLabel) {
        groups.push({ dateLabel: label, events: [] })
        lastLabel = label
      }
      groups[groups.length - 1].events.push(ev)
    }
    return groups
  })
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
      <p class="subtitle">Every change to this tree, in the order it happened.</p>
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
      <div class="feed">
        {#each grouped as group (group.dateLabel)}
          <div class="day-group">
            <div class="day-label">{group.dateLabel}</div>
            <div class="day-events">
              {#each group.events as ev (ev.id)}
                {@const actor = Array.isArray(ev.actor) ? ev.actor[0] : ev.actor}
                <div class="event">
                  <div class="event-avatar">
                    {#if actor}
                      <Avatar
                        person={{ given: actor.display_name ?? '?', family: '', status: 'living' }}
                        src={actor.avatar_url ?? undefined}
                        size={32}
                      />
                    {:else}
                      <div class="avatar-placeholder" aria-hidden="true"></div>
                    {/if}
                    <div class="connector" aria-hidden="true"></div>
                  </div>
                  <div class="event-body">
                    <p class="event-text">
                      {#if actor}
                        <span class="actor-name">{actor.display_name ?? 'Someone'}</span>
                      {/if}
                      {describeEvent(ev.action as ActivityAction, ev.entity_type)}
                    </p>
                    <time
                      class="event-time"
                      datetime={ev.created_at}
                      title={formatFullTime(ev.created_at)}
                    >
                      {formatRelativeTime(ev.created_at)}
                    </time>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}

        {#if data.events.length === 200}
          <p class="cap-note">Showing the most recent 200 events.</p>
        {/if}
      </div>
    {/if}

  </div>
</div>

<style>
  .page {
    min-height: calc(100vh - 52px);
    background: var(--color-bg-page);
    padding: var(--space-12) var(--space-8);
  }

  .inner {
    max-width: 640px;
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
    margin-bottom: var(--space-12);
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
    margin: 0;
    line-height: var(--line-height-story);
    max-width: 360px;
    margin-inline: auto;
  }

  /* ── Feed ── */
  .feed {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .day-label {
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: var(--font-weight-medium);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-tertiary, var(--color-text-secondary));
    padding-bottom: var(--space-4);
    border-bottom: var(--border-subtle);
    margin-bottom: var(--space-4);
  }

  .day-events {
    display: flex;
    flex-direction: column;
  }

  .event {
    display: grid;
    grid-template-columns: 40px 1fr;
    gap: var(--space-3);
    position: relative;
  }

  .event-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .avatar-placeholder {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    background: var(--color-bg-surface-2, var(--color-bg-surface-1));
    flex-shrink: 0;
  }

  .connector {
    width: 1px;
    flex: 1;
    min-height: var(--space-4);
    background: var(--border-subtle, #E8E3DA);
    margin-top: var(--space-1);
  }

  .event:last-child .connector {
    display: none;
  }

  .event-body {
    padding-bottom: var(--space-6);
    padding-top: 6px;
  }

  .event-text {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-1) 0;
    line-height: 1.5;
  }

  .actor-name {
    font-weight: var(--font-weight-medium);
    margin-right: 4px;
  }

  .event-time {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  .cap-note {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-text-secondary);
    text-align: center;
    margin: var(--space-4) 0 0;
  }

  @media (max-width: 640px) {
    .page { padding: var(--space-6) var(--space-4); }
  }
</style>
