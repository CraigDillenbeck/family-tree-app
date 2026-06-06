<script lang="ts">
  import { enhance } from '$app/forms'
  import { untrack } from 'svelte'
  import Input from '$lib/components/ui/Input.svelte'
  import Textarea from '$lib/components/ui/Textarea.svelte'
  import Select from '$lib/components/ui/Select.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import type { SelectOption } from '$lib/components/ui/Select.svelte'

  export interface EditMemory {
    id: string
    title: string
    content: string | null
    memory_date: string | null
    memory_date_precision: string
  }

  let {
    memory = null as EditMemory | null,
    personId,
    onSuccess,
    onCancel,
  }: {
    memory?: EditMemory | null
    personId: string
    onSuccess?: () => void
    onCancel?: () => void
  } = $props()

  let loading = $state(false)
  let deleting = $state(false)
  let formError = $state<string | null>(null)
  let confirmDelete = $state(false)

  let title = $state(untrack(() => memory?.title ?? ''))
  let content = $state(untrack(() => memory?.content ?? ''))
  let memoryDate = $state(untrack(() => memory?.memory_date ?? ''))
  let precision = $state(untrack(() => memory?.memory_date_precision ?? 'exact'))

  const isEditing = $derived(!!memory)
  const showPrecision = $derived(memoryDate.length > 0)

  const precisionOptions: SelectOption[] = [
    { value: 'exact', label: 'Exact date' },
    { value: 'month', label: 'Month and year' },
    { value: 'year', label: 'Year only' },
    { value: 'circa', label: 'Approximate year' },
  ]
</script>

<div class="editor">
  {#if formError}
    <div class="error-banner" role="alert">{formError}</div>
  {/if}

  {#if !confirmDelete}
    <form
      method="POST"
      action={isEditing ? '?/updateMemory' : '?/createMemory'}
      use:enhance={() => {
        loading = true
        formError = null
        return async ({ result, update }) => {
          loading = false
          if (result.type === 'failure') {
            formError = (result.data as { error?: string })?.error ?? 'Something went wrong. Please try again.'
          } else if (result.type === 'success') {
            await update()
            onSuccess?.()
          }
        }
      }}
    >
      {#if isEditing}
        <input type="hidden" name="memoryId" value={memory!.id} />
      {/if}
      <input type="hidden" name="personId" value={personId} />

      <div class="fields">
        <Input
          label="Title"
          name="title"
          placeholder="Give this memory a name"
          required
          bind:value={title}
        />

        <Textarea
          label="Story"
          name="content"
          placeholder="Write as much or as little as you like…"
          variant="auto"
          bind:value={content}
        />

        <div class="date-section">
          <div class="date-field">
            <label class="field-label" for="memory-date">
              Date <span class="optional">— optional</span>
            </label>
            <input
              id="memory-date"
              type="date"
              name="memory_date"
              class="date-input"
              bind:value={memoryDate}
            />
          </div>

          {#if showPrecision}
            <div class="precision-field">
              <Select
                label="How specific?"
                options={precisionOptions}
                bind:value={precision}
              />
            </div>
          {/if}
        </div>

        <input type="hidden" name="memory_date_precision" value={precision} />
      </div>

      <div class="footer">
        <div class="footer-left">
          {#if isEditing}
            <button
              type="button"
              class="delete-trigger"
              onclick={() => (confirmDelete = true)}
            >Delete memory</button>
          {/if}
        </div>
        <div class="footer-right">
          <Button type="button" variant="ghost" onclick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={loading || !title.trim()}>
            {#if loading}
              {isEditing ? 'Saving…' : 'Adding…'}
            {:else}
              {isEditing ? 'Save changes' : 'Add memory'}
            {/if}
          </Button>
        </div>
      </div>
    </form>

  {:else}
    <div class="confirm-area">
      <p class="confirm-text">
        This memory will be gone forever. There's no way to get it back.
      </p>
      <form
        method="POST"
        action="?/deleteMemory"
        use:enhance={() => {
          deleting = true
          formError = null
          return async ({ result, update }) => {
            deleting = false
            if (result.type === 'failure') {
              formError = (result.data as { error?: string })?.error ?? 'Could not delete the memory.'
              confirmDelete = false
            } else if (result.type === 'success') {
              await update()
              onSuccess?.()
            }
          }
        }}
      >
        <input type="hidden" name="memoryId" value={memory!.id} />
        <div class="confirm-actions">
          <Button type="button" variant="ghost" onclick={() => (confirmDelete = false)}>
            Keep it
          </Button>
          <Button type="submit" variant="destructive" disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete forever'}
          </Button>
        </div>
      </form>
    </div>
  {/if}
</div>

<style>
  .editor {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-6);
    height: 100%;
  }

  .error-banner {
    background: var(--color-error-bg);
    border: var(--border-error);
    border-radius: var(--radius-sm);
    color: var(--color-error);
    font-family: var(--font-ui);
    font-size: 13px;
    padding: var(--space-3) var(--space-4);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    flex: 1;
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    flex: 1;
  }

  /* ── Date section ── */
  .date-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .date-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-label {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-label);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
    cursor: default;
  }

  .optional {
    font-weight: var(--font-weight-regular);
    text-transform: none;
    letter-spacing: 0;
    color: var(--color-text-hint);
  }

  .date-input {
    height: 36px;
    padding: 0 var(--space-3);
    background: var(--color-surface-2);
    border: var(--border-default);
    border-radius: var(--radius-sm);
    font-family: var(--font-ui);
    font-size: 14px;
    font-weight: var(--font-weight-regular);
    color: var(--color-ink);
    transition:
      background var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease);
    width: 100%;
    box-sizing: border-box;
  }

  .date-input:focus {
    outline: var(--border-focus-ring);
    outline-offset: 2px;
    border-color: var(--color-gold);
    background: #fff;
  }

  .precision-field {
    width: 100%;
  }

  /* ── Footer ── */
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: var(--space-4);
    border-top: var(--border-subtle);
    margin-top: auto;
  }

  .footer-right {
    display: flex;
    gap: var(--space-2);
  }

  .delete-trigger {
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: var(--font-weight-regular);
    color: var(--color-terra);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
  }
  .delete-trigger:hover { opacity: 0.75; }

  /* ── Delete confirmation ── */
  .confirm-area {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding: var(--space-8) 0;
  }

  .confirm-text {
    font-family: var(--font-body);
    font-style: italic;
    font-size: var(--font-size-body-story);
    color: var(--color-text-body);
    line-height: var(--line-height-story);
    margin: 0;
    max-width: 340px;
  }

  .confirm-actions {
    display: flex;
    gap: var(--space-3);
    align-items: center;
  }
</style>
