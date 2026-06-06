<script lang="ts">
  import { invalidateAll, goto } from '$app/navigation'
  import type { PageProps } from './$types'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Drawer from '$lib/components/ui/Drawer.svelte'
  import MemoryEditor from '$lib/components/memory/MemoryEditor.svelte'

  const { data }: PageProps = $props()

  let editDrawerOpen = $state(false)

  const canEdit = $derived(data.userRole === 'owner' || data.userRole === 'editor')

  const backHref = $derived(
    data.fromPersonId
      ? `/trees/${data.tree.id}/persons/${data.fromPersonId}`
      : `/trees/${data.tree.id}`
  )

  const backLabel = $derived(data.fromPersonId ? '← Back to profile' : '← Back to tree')

  function formatDate(date: string | null, precision: string | null): string {
    if (!date) return ''
    const d = new Date(date + 'T00:00:00')
    switch (precision) {
      case 'year':    return String(d.getFullYear())
      case 'month':   return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      case 'circa':   return `c. ${d.getFullYear()}`
      case 'decade':  return `${Math.floor(d.getFullYear() / 10) * 10}s`
      default:        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }
  }

  const dateLabel = $derived(formatDate(data.memory.memory_date, data.memory.memory_date_precision))

  async function handleEdited() {
    editDrawerOpen = false
    await invalidateAll()
  }

  async function handleDeleted() {
    editDrawerOpen = false
    await goto(backHref)
  }
</script>

<svelte:head>
  <title>{data.memory.title} — Prosapiam</title>
</svelte:head>

<div class="page">

  <div class="breadcrumb">
    <a href={backHref} class="back-link">{backLabel}</a>
    {#if canEdit}
      <Button variant="ghost" onclick={() => (editDrawerOpen = true)}>Edit memory</Button>
    {/if}
  </div>

  <article class="article">

    <header class="article-header">
      {#if dateLabel}
        <p class="dateline">{dateLabel}</p>
      {/if}
      <h1 class="headline">{data.memory.title}</h1>
      {#if data.authorName}
        <p class="byline">Added by {data.authorName}</p>
      {/if}
      <div class="rule" role="presentation"></div>
    </header>

    {#if data.memory.body}
      <div class="body-text">
        {#each data.memory.body.split('\n\n') as paragraph}
          {#if paragraph.trim()}
            <p>{paragraph.trim()}</p>
          {/if}
        {/each}
      </div>
    {:else}
      <p class="body-empty">No story written yet.</p>
    {/if}

    {#if data.taggedPersons.length > 0}
      <footer class="people-footer">
        <p class="people-label">People in this memory</p>
        <div class="people-list">
          {#each data.taggedPersons as person (person.id)}
            <a
              href="/trees/{data.tree.id}/persons/{person.id}"
              class="person-chip"
              aria-label="{person.first_name} {person.last_name ?? ''}"
            >
              <Avatar
                person={{ given: person.first_name, family: person.last_name ?? '', status: person.is_living ? 'living' : 'deceased' }}
                size={32}
              />
              <span class="person-name">
                {person.first_name}{person.last_name ? ` ${person.last_name}` : ''}
              </span>
            </a>
          {/each}
        </div>
      </footer>
    {/if}

  </article>
</div>

<Drawer
  open={editDrawerOpen}
  title="Edit memory"
  variant="detail"
  onclose={() => (editDrawerOpen = false)}
>
  {#key editDrawerOpen}
    <MemoryEditor
      memory={{
        id: data.memory.id,
        title: data.memory.title,
        content: data.memory.body,
        memory_date: data.memory.memory_date,
        memory_date_precision: data.memory.memory_date_precision,
      }}
      personId={data.taggedPersons[0]?.id ?? ''}
      onSuccess={handleEdited}
      onCancel={() => (editDrawerOpen = false)}
    />
  {/key}
</Drawer>

<style>
  .page {
    background: var(--color-bg-page);
    min-height: calc(100vh - 52px);
    padding-bottom: var(--space-24);
  }

  /* ── Breadcrumb / top bar ── */
  .breadcrumb {
    display: flex;
    align-items: center;
    justify-content: space-between;
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

  /* ── Article ── */
  .article {
    max-width: 740px;
    margin: 0 auto;
    padding: var(--space-16) var(--space-8) 0;
  }

  /* ── Header ── */
  .article-header {
    margin-bottom: var(--space-8);
  }

  .dateline {
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: var(--font-weight-medium);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-gold);
    margin: 0 0 var(--space-3) 0;
  }

  .headline {
    font-family: var(--font-display);
    font-weight: var(--font-weight-light);
    font-size: clamp(32px, 5vw, 52px);
    letter-spacing: -0.01em;
    line-height: 1.1;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-4) 0;
  }

  .byline {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-6) 0;
  }

  .rule {
    height: 1px;
    background: var(--color-border-default);
    margin-bottom: var(--space-8);
  }

  /* ── Body text ── */
  .body-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    max-width: 680px;
  }

  .body-text p {
    font-family: var(--font-body);
    font-size: 18px;
    font-weight: var(--font-weight-regular);
    line-height: 1.9;
    color: var(--color-text-body);
    margin: 0;
  }

  .body-empty {
    font-family: var(--font-body);
    font-size: 18px;
    font-style: italic;
    color: var(--color-text-hint);
    margin: 0;
    line-height: 1.9;
  }

  /* ── People footer ── */
  .people-footer {
    margin-top: var(--space-12);
    padding-top: var(--space-8);
    border-top: var(--border-subtle);
  }

  .people-label {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-4) 0;
  }

  .people-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .person-chip {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface-1);
    border: var(--border-default);
    border-radius: 9999px;
    text-decoration: none;
    transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
  }
  .person-chip:hover {
    background: var(--color-surface-2);
    border-color: var(--color-border-hover);
  }

  .person-name {
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }
</style>
