<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'
  import { untrack } from 'svelte'
  import type { PageProps } from './$types'
  import Input from '$lib/components/ui/Input.svelte'
  import Textarea from '$lib/components/ui/Textarea.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Modal from '$lib/components/ui/Modal.svelte'
  import { toast } from '$lib/stores/toasts'

  const { data }: PageProps = $props()

  const initial = untrack(() => data.tree)
  let treeName = $state(initial.name)
  let treeDescription = $state(initial.description ?? '')
  let saving = $state(false)
  let renameError = $state<string | null>(null)

  let deleteModalOpen = $state(false)
  let confirmName = $state('')
  let deleting = $state(false)
  let deleteError = $state<string | null>(null)

  const confirmMatch = $derived(confirmName.trim() === data.tree.name)
</script>

<svelte:head>
  <title>Settings — {data.tree.name}</title>
</svelte:head>

<div class="page">

  <div class="breadcrumb">
    <a href="/trees/{data.tree.id}" class="back-link">&#8592; Back to tree</a>
  </div>

  <div class="inner">

    <h1 class="page-title">Tree Settings</h1>

    <!-- ── Rename section ── -->
    <section class="section">
      <h2 class="section-heading">General</h2>
      <form
        method="POST"
        action="?/rename"
        use:enhance={() => {
          saving = true
          renameError = null
          return async ({ result, update }) => {
            saving = false
            if (result.type === 'failure') {
              renameError = (result.data as { error?: string })?.error ?? 'Something went wrong.'
            } else if (result.type === 'success') {
              toast.success('Changes saved.')
              await invalidateAll()
            }
            await update({ reset: false })
          }
        }}
      >
        <div class="form-fields">
          <Input
            label="Tree name"
            bind:value={treeName}
            name="name"
            placeholder="e.g. The Dillenbeck Family"
            error={renameError ?? undefined}
          />
          <Textarea
            label="Description"
            bind:value={treeDescription}
            name="description"
            placeholder="A short description of this family tree — optional."
            variant="standard"
          />
        </div>

        {#if renameError}
          <p class="form-error" role="alert">{renameError}</p>
        {/if}

        <div class="form-actions">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </section>

    <!-- ── Danger zone ── -->
    <section class="section danger-section">
      <h2 class="section-heading danger-heading">Danger zone</h2>
      <div class="danger-row">
        <div class="danger-text">
          <p class="danger-label">Delete this tree</p>
          <p class="danger-description">
            Permanently removes all persons, memories, and media in this tree. This cannot be undone.
          </p>
        </div>
        <Button variant="destructive" onclick={() => { deleteModalOpen = true; confirmName = ''; deleteError = null }}>
          Delete tree
        </Button>
      </div>
    </section>

  </div>
</div>

<!-- ── Delete confirmation modal ── -->
<Modal
  open={deleteModalOpen}
  title="Delete this tree?"
  variant="confirmation"
  onclose={() => { deleteModalOpen = false }}
>
  <form
    method="POST"
    action="?/delete"
    use:enhance={() => {
      deleting = true
      deleteError = null
      return async ({ result }) => {
        deleting = false
        if (result.type === 'failure') {
          deleteError = (result.data as { error?: string })?.error ?? 'Something went wrong.'
        }
        // On success the server redirects to /dashboard — no client update needed
      }
    }}
  >
    <div class="modal-body">
      <p class="modal-warning">
        All persons, memories, and media in <strong>{data.tree.name}</strong> will be permanently deleted.
        This cannot be undone.
      </p>
      <Input
        label="Type the tree name to confirm"
        bind:value={confirmName}
        name="confirm"
        placeholder={data.tree.name}
        error={deleteError ?? undefined}
      />
    </div>

    {#snippet footer()}
      <Button variant="secondary" onclick={() => { deleteModalOpen = false }} disabled={deleting}>
        Cancel
      </Button>
      <Button variant="destructive" type="submit" disabled={!confirmMatch || deleting}>
        {deleting ? 'Deleting…' : 'Delete permanently'}
      </Button>
    {/snippet}
  </form>
</Modal>

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

  .inner {
    max-width: 640px;
    margin: 0 auto;
    padding: var(--space-12) var(--space-20) var(--space-20);
    display: flex;
    flex-direction: column;
    gap: var(--space-12);
  }

  .page-title {
    font-family: var(--font-display);
    font-weight: var(--font-weight-light);
    font-size: var(--font-size-display-l);
    letter-spacing: -0.01em;
    color: var(--color-text-primary);
    margin: 0;
    line-height: var(--line-height-tight);
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding: var(--space-8);
    background: var(--color-surface-0);
    border: var(--border-default);
    border-radius: var(--radius-lg);
  }

  .section-heading {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .form-fields {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .form-error {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-terracotta);
    margin: 0;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
  }

  /* ── Danger zone ── */
  .danger-section {
    border-color: color-mix(in srgb, var(--color-terracotta) 40%, transparent);
  }

  .danger-heading {
    color: var(--color-terracotta);
  }

  .danger-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-6);
  }

  .danger-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .danger-label {
    font-family: var(--font-ui);
    font-size: 14px;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin: 0;
  }

  .danger-description {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-text-secondary);
    margin: 0;
    max-width: 340px;
  }

  /* ── Modal ── */
  .modal-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .modal-warning {
    font-family: var(--font-body);
    font-size: var(--font-size-body-story);
    color: var(--color-text-body);
    line-height: var(--line-height-story);
    margin: 0;
  }

  .modal-warning strong {
    font-weight: var(--font-weight-medium);
    font-style: normal;
  }

  @media (max-width: 540px) {
    .inner { padding: var(--space-8) var(--space-4) var(--space-12); }
    .danger-row { flex-direction: column; align-items: flex-start; }
  }
</style>
