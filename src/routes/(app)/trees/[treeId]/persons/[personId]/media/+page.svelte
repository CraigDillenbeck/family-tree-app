<script lang="ts">
  import { invalidateAll } from '$app/navigation'
  import type { PageProps } from './$types'
  import Button from '$lib/components/ui/Button.svelte'
  import Drawer from '$lib/components/ui/Drawer.svelte'
  import MediaGrid from '$lib/components/media/MediaGrid.svelte'
  import MediaUploader from '$lib/components/media/MediaUploader.svelte'

  const { data }: PageProps = $props()

  const personName = $derived(
    [data.person.first_name, data.person.last_name].filter(Boolean).join(' ')
  )

  let uploaderOpen = $state(false)
  const canEdit = $derived(data.userRole === 'owner' || data.userRole === 'editor')

  async function handleUploaded() {
    uploaderOpen = false
    await invalidateAll()
  }

  async function handleDelete(mediaId: string) {
    await fetch(`/api/trees/${data.tree.id}/media?mediaId=${mediaId}`, { method: 'DELETE' })
    await invalidateAll()
  }
</script>

<svelte:head>
  <title>{personName} — Media — Prosapia</title>
</svelte:head>

<div class="page">
  <div class="breadcrumb">
    <a href="/trees/{data.tree.id}/persons/{data.person.id}" class="back-link">
      &#8592; Back to {personName}
    </a>
  </div>

  <div class="content">
    <div class="page-header">
      <h1 class="page-title">Media</h1>
      <p class="page-sub">Photos, recordings, and documents for {personName}</p>

      {#if canEdit}
        <Button onclick={() => (uploaderOpen = true)}>Upload media</Button>
      {/if}
    </div>

    {#if data.media.length === 0}
      <div class="empty-state">
        <p class="empty-text">Photographs, letters, recordings — add them here.</p>
        {#if canEdit}
          <Button variant="secondary" onclick={() => (uploaderOpen = true)}>Upload the first file</Button>
        {/if}
      </div>
    {:else}
      <MediaGrid items={data.media} {canEdit} onDelete={handleDelete} />
    {/if}
  </div>
</div>

<Drawer
  open={uploaderOpen}
  title="Upload media"
  variant="detail"
  onclose={() => (uploaderOpen = false)}
>
  <MediaUploader
    treeId={data.tree.id}
    personId={data.person.id}
    onUploaded={handleUploaded}
    onCancel={() => (uploaderOpen = false)}
  />
</Drawer>

<style>
  .page {
    background: var(--color-bg-page);
    min-height: calc(100vh - 52px);
  }

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

  .content {
    max-width: var(--grid-max-width);
    margin: 0 auto;
    padding: var(--space-12) var(--space-20) var(--space-20);
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .page-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .page-title {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-display-m);
    color: var(--color-text-primary);
    margin: 0;
    line-height: var(--line-height-tight);
  }

  .page-sub {
    font-family: var(--font-body);
    font-size: var(--font-size-body-story);
    font-style: italic;
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-4) 0;
    line-height: var(--line-height-story);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-16) 0;
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
</style>
