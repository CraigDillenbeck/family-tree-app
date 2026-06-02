<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte'

  export type MediaItem = {
    id: string
    media_type: 'image' | 'video' | 'audio' | 'document'
    storage_path: string
    title: string | null
    caption: string | null
    signedUrl: string | null
  }

  interface Props {
    items: MediaItem[]
    canEdit?: boolean
    onDelete?: (id: string) => void
  }

  let { items, canEdit = false, onDelete }: Props = $props()

  let deletingId: string | null = $state(null)

  async function handleDelete(id: string) {
    deletingId = id
    onDelete?.(id)
    deletingId = null
  }
</script>

<div class="grid">
  {#each items as item (item.id)}
    <div class="cell">

      {#if item.media_type === 'image' && item.signedUrl}
        <div class="thumb-wrap">
          <img src={item.signedUrl} alt={item.title ?? ''} class="thumb" loading="lazy" />
        </div>
      {:else if item.media_type === 'audio' && item.signedUrl}
        <div class="audio-wrap">
          <!-- svelte-ignore a11y_media_has_caption -->
          <audio controls src={item.signedUrl} class="audio-player" preload="metadata"></audio>
        </div>
      {:else if item.media_type === 'video' && item.signedUrl}
        <div class="thumb-wrap">
          <!-- svelte-ignore a11y_media_has_caption -->
          <video controls src={item.signedUrl} class="thumb" preload="metadata"></video>
        </div>
      {:else}
        <div class="placeholder-wrap">
          <span class="placeholder-icon">◻</span>
        </div>
      {/if}

      {#if item.title || item.caption}
        <div class="meta">
          {#if item.title}<p class="item-title">{item.title}</p>{/if}
          {#if item.caption}<p class="item-caption">{item.caption}</p>{/if}
        </div>
      {/if}

      {#if canEdit && onDelete}
        <div class="actions">
          <button
            class="delete-btn"
            onclick={() => handleDelete(item.id)}
            disabled={deletingId === item.id}
            aria-label="Delete this media item"
          >
            Remove
          </button>
        </div>
      {/if}

    </div>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--space-4);
  }

  .cell {
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .thumb-wrap {
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--color-bg-surface-2);
  }

  .thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .audio-wrap {
    padding: var(--space-4);
    background: var(--color-bg-surface-2);
  }

  .audio-player {
    width: 100%;
  }

  .placeholder-wrap {
    aspect-ratio: 4 / 3;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-surface-2);
    font-size: 32px;
    color: var(--color-text-hint);
  }

  .meta {
    padding: var(--space-3) var(--space-3) var(--space-2);
    flex: 1;
  }

  .item-title {
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-1) 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-caption {
    font-family: var(--font-body);
    font-size: 13px;
    font-style: italic;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .actions {
    padding: var(--space-2) var(--space-3) var(--space-3);
    display: flex;
    justify-content: flex-end;
  }

  .delete-btn {
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-error);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }
  .delete-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
