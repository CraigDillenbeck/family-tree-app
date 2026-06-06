<script lang="ts">
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Tag from '$lib/components/ui/Tag.svelte'

  export type MemoryData = {
    id: string
    title: string
    content?: string | null
    memoryDate?: string | null
    memoryDatePrecision?: 'exact' | 'month' | 'year' | 'decade' | 'circa' | null
    tags?: { id: string; name: string }[]
  }

  let {
    memory,
    thumbnail,
    authorName,
    authorAvatarUrl,
    showAuthor = false,
    onclick,
  }: {
    memory: MemoryData
    /** Optional 80×80 thumbnail URL */
    thumbnail?: string | null
    authorName?: string | null
    authorAvatarUrl?: string | null
    showAuthor?: boolean
    onclick?: () => void
  } = $props()

  const MAX_VISIBLE_TAGS = 3

  const visibleTags = $derived(memory.tags?.slice(0, MAX_VISIBLE_TAGS) ?? [])
  const overflowCount = $derived((memory.tags?.length ?? 0) - MAX_VISIBLE_TAGS)

  function formatDate(date: string | null | undefined, precision: string | null | undefined): string {
    if (!date) return ''
    const d = new Date(date + 'T00:00:00')
    switch (precision) {
      case 'year':   return String(d.getFullYear())
      case 'month':  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      case 'circa':  return `c. ${d.getFullYear()}`
      case 'decade': return `${Math.floor(d.getFullYear() / 10) * 10}s`
      default:       return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }
  }

  const dateLabel = $derived(formatDate(memory.memoryDate, memory.memoryDatePrecision))
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<article
  class="card"
  class:has-thumbnail={!!thumbnail}
  class:clickable={!!onclick}
  onclick={onclick}
  onkeydown={onclick ? (e) => (e.key === 'Enter' || e.key === ' ') && onclick?.() : undefined}
  tabindex={onclick ? 0 : undefined}
  role={onclick ? 'button' : undefined}
>
  <div class="card-main">
    <div class="card-text">
      <h3 class="title">{memory.title}</h3>

      {#if memory.content}
        <p class="excerpt">{memory.content}</p>
      {/if}

      <div class="meta">
        {#if dateLabel}
          <time
            class="date"
            datetime={memory.memoryDate ?? ''}
          >{dateLabel}</time>
        {/if}

        {#if visibleTags.length}
          <div class="tags" aria-label="Tags">
            {#each visibleTags as tag (tag.id)}
              <Tag>{tag.name}</Tag>
            {/each}
            {#if overflowCount > 0}
              <Tag>+{overflowCount}</Tag>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    {#if thumbnail}
      <div class="thumbnail-col">
        <img class="thumbnail" src={thumbnail} alt="" aria-hidden="true" />
      </div>
    {/if}
  </div>

  {#if showAuthor && authorName}
    <div class="author-row">
      <Avatar
        person={{ given: authorName, avatarUrl: authorAvatarUrl }}
        size={16}
      />
      <span class="author-label">Added by {authorName}</span>
    </div>
  {/if}
</article>

<style>
  .card {
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    transition:
      background var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease),
      transform var(--dur-fast) var(--ease);
    cursor: pointer;
  }

  .card.clickable {
    cursor: pointer;
  }

  .card.clickable:hover {
    background: var(--color-bg-surface-3);
    border: var(--border-strong);
  }

  .card.clickable:active {
    transform: scale(0.998);
    border-color: var(--color-border-active);
  }

  .card-main {
    display: flex;
    gap: var(--space-4);
    align-items: flex-start;
  }

  .card-text {
    flex: 1;
    min-width: 0;
  }

  .title {
    margin: 0;
    font-family: var(--font-ui);
    font-size: 16px;
    font-weight: var(--font-weight-medium);
    line-height: var(--line-height-heading);
    color: var(--color-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card.clickable:focus-visible {
    outline: var(--border-focus-ring);
    outline-offset: 2px;
  }

  /* Two-line italic Cormorant excerpt — the emotional core of the card */
  .excerpt {
    margin: var(--space-2) 0 0;
    font-family: var(--font-body);
    font-size: 14px;
    font-style: italic;
    font-weight: var(--font-weight-regular);
    line-height: 1.7;
    color: var(--color-ink-soft);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-3);
  }

  .date {
    font-family: var(--font-ui);
    font-size: var(--font-size-meta);
    font-weight: var(--font-weight-regular);
    color: var(--color-warm-mid);
    white-space: nowrap;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  /* ── Thumbnail ── */
  .thumbnail-col {
    flex-shrink: 0;
  }

  .thumbnail {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    display: block;
  }

  /* ── Author row ── */
  .author-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: var(--border-subtle);
  }

  .author-label {
    font-family: var(--font-ui);
    font-size: var(--font-size-meta);
    color: var(--color-warm-mid);
  }

  /* ── Mobile: thumbnail stacks to top ── */
  @media (max-width: 480px) {
    .card.has-thumbnail .card-main {
      flex-direction: column-reverse;
    }
    .card.has-thumbnail .thumbnail {
      width: 100%;
      height: 160px;
    }
  }
</style>
