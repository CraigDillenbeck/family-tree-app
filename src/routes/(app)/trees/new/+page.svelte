<script lang="ts">
  import { enhance } from '$app/forms'
  import { goto } from '$app/navigation'
  import type { PageProps } from './$types'
  import Input from '$lib/components/ui/Input.svelte'
  import Textarea from '$lib/components/ui/Textarea.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Icon from '$lib/components/ui/Icon.svelte'
  import { ArrowLeft } from 'lucide-svelte'

  const { data }: PageProps = $props()

  let submitting = $state(false)
  let serverError = $state<string | null>(null)
  let name = $state('')
  let description = $state('')
  let nameError = $state<string | null>(null)

  function validate(): boolean {
    if (!name.trim()) {
      nameError = 'Every family tree needs a name.'
      return false
    }
    return true
  }
</script>

<svelte:head>
  <title>Create a new family tree — Prosapiam</title>
</svelte:head>

<div class="page">
  <div class="inner">

    <a class="back" href="/dashboard">
      <Icon icon={ArrowLeft} size={16} color="currentColor" />
      Dashboard
    </a>

    <header class="header">
      <h1 class="title">Start a new family tree</h1>
      <p class="subtitle">Give it a name — you can always change it later.</p>
    </header>

    <form
      method="POST"
      action="?/create"
      use:enhance={({ cancel }) => {
        if (!validate()) { cancel(); return }
        submitting = true
        serverError = null
        return async ({ result, update }) => {
          submitting = false
          if (result.type === 'failure') {
            serverError = (result.data as { error?: string })?.error ?? 'Something went wrong.'
          }
          await update()
        }
      }}
    >
      <section class="section">
        <Input
          label="Tree name"
          name="name"
          placeholder="The Walsh Family"
          bind:value={name}
          error={nameError ?? undefined}
          autocomplete="off"
          autofocus
          oninput={() => { if (nameError) nameError = null }}
        />
        <Textarea
          label="Description"
          name="description"
          placeholder="A brief note about this branch of the family — optional."
          bind:value={description}
          variant="story"
        />
      </section>

      {#if serverError}
        <p class="server-error" role="alert">{serverError}</p>
      {/if}

      <div class="actions">
        <Button type="submit" variant="primary" size="lg" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create tree'}
        </Button>
        <Button variant="ghost" size="lg" onclick={() => goto('/dashboard')}>Cancel</Button>
      </div>
    </form>

  </div>
</div>

<style>
  .page {
    min-height: calc(100vh - 52px);
    background: var(--color-bg-page);
    padding: var(--space-12) var(--space-8);
  }

  .inner {
    max-width: 560px;
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
    font-family: var(--font-ui);
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

  .section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding-bottom: var(--space-8);
    margin-bottom: var(--space-8);
    border-bottom: var(--border-subtle);
  }

  .server-error {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-terra);
    background: var(--color-terra-tint);
    border: var(--border-error);
    border-radius: var(--radius-sm);
    padding: var(--space-3) var(--space-4);
    margin: 0 0 var(--space-4) 0;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding-top: var(--space-4);
  }

  @media (max-width: 640px) {
    .page { padding: var(--space-6) var(--space-4); }
  }
</style>
