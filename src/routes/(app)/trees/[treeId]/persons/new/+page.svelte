<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageProps } from './$types'
  import Input from '$lib/components/ui/Input.svelte'
  import Textarea from '$lib/components/ui/Textarea.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Icon from '$lib/components/ui/Icon.svelte'
  import { ArrowLeft } from 'lucide-svelte'
  import { goto } from '$app/navigation'

  const { data }: PageProps = $props()

  let submitting = $state(false)
  let serverError = $state<string | null>(null)

  let firstName = $state('')
  let lastName = $state('')
  let maidenName = $state('')
  let isLiving = $state(true)
  let birthYear = $state('')
  let birthPlace = $state('')
  let deathYear = $state('')
  let occupation = $state('')
  let bio = $state('')

  let firstNameError = $state<string | null>(null)
  let birthYearError = $state<string | null>(null)
  let deathYearError = $state<string | null>(null)

  function validateYear(val: string): boolean {
    return val === '' || /^\d{4}$/.test(val)
  }

  function handleYearInput(field: 'birth' | 'death') {
    return (e: Event) => {
      const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4)
      if (field === 'birth') { birthYear = raw; birthYearError = null }
      else { deathYear = raw; deathYearError = null }
    }
  }

  function validate(): boolean {
    let ok = true
    if (!firstName.trim()) { firstNameError = 'A given name keeps the record theirs.'; ok = false }
    if (!validateYear(birthYear)) { birthYearError = 'Four digits, like 1942.'; ok = false }
    if (!isLiving && !validateYear(deathYear)) { deathYearError = 'Four digits, like 2018.'; ok = false }
    return ok
  }
</script>

<svelte:head>
  <title>Add a person — {data.tree.name}</title>
</svelte:head>

<div class="page">
  <div class="inner">

    <a class="back" href="/trees/{data.tree.id}">
      <Icon icon={ArrowLeft} size={16} color="currentColor" />
      {data.tree.name}
    </a>

    <header class="header">
      <h1 class="title">Add a person</h1>
      <p class="subtitle">Add what you know — everything else can be filled in later.</p>
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
      <input type="hidden" name="isLiving" value={isLiving} />

      <!-- Name -->
      <section class="section">
        <h2 class="section-label">Name</h2>
        <div class="two-col">
          <Input
            label="Given name"
            name="firstName"
            placeholder="Margaret"
            bind:value={firstName}
            error={firstNameError ?? undefined}
            autocomplete="off"
            autofocus
            oninput={() => { if (firstNameError) firstNameError = null }}
          />
          <Input
            label="Family name"
            name="lastName"
            placeholder="Walsh"
            bind:value={lastName}
            autocomplete="off"
          />
        </div>
        <Input
          label="Maiden name"
          name="maidenName"
          placeholder="O'Brien"
          bind:value={maidenName}
          autocomplete="off"
        />
      </section>

      <!-- Status -->
      <section class="section">
        <h2 class="section-label">Status</h2>
        <div class="status-toggle" role="group" aria-label="Living status">
          <button
            type="button"
            class="status-btn"
            class:active={isLiving}
            onclick={() => { isLiving = true; deathYear = ''; deathYearError = null }}
          >
            <span class="status-dot sage" aria-hidden="true"></span>
            Living
          </button>
          <button
            type="button"
            class="status-btn"
            class:active={!isLiving}
            onclick={() => isLiving = false}
          >
            <span class="status-dot terra" aria-hidden="true"></span>
            Deceased
          </button>
        </div>
      </section>

      <!-- Dates & Places -->
      <section class="section">
        <h2 class="section-label">Dates &amp; places</h2>
        <div class="two-col">
          <Input
            label="Year of birth"
            name="birthYear"
            placeholder="1942"
            bind:value={birthYear}
            error={birthYearError ?? undefined}
            oninput={handleYearInput('birth')}
            inputmode="numeric"
            autocomplete="off"
          />
          <Input
            label="Place of birth"
            name="birthPlace"
            placeholder="Cork, Ireland"
            bind:value={birthPlace}
            autocomplete="off"
          />
        </div>
        {#if !isLiving}
          <Input
            label="Year of death"
            name="deathYear"
            placeholder="2018"
            bind:value={deathYear}
            error={deathYearError ?? undefined}
            oninput={handleYearInput('death')}
            inputmode="numeric"
            autocomplete="off"
          />
        {/if}
      </section>

      <!-- Background -->
      <section class="section">
        <h2 class="section-label">Background</h2>
        <Input
          label="Occupation"
          name="occupation"
          placeholder="Schoolteacher, farmer, nurse…"
          bind:value={occupation}
          autocomplete="off"
        />
        <Textarea
          label="Biography"
          name="bio"
          placeholder="A few sentences about who they were, where they lived, what mattered to them."
          bind:value={bio}
          variant="story"
        />
      </section>

      {#if serverError}
        <p class="server-error" role="alert">{serverError}</p>
      {/if}

      <div class="actions">
        <Button type="submit" variant="primary" size="lg" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add to tree'}
        </Button>
        <Button variant="ghost" size="lg" onclick={() => goto(`/trees/${data.tree.id}`)}>Cancel</Button>
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

  .section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding-bottom: var(--space-8);
    margin-bottom: var(--space-8);
    border-bottom: var(--border-subtle);
  }

  .section-label {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }

  .status-toggle {
    display: inline-flex;
    border: var(--border-default);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .status-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 10px var(--space-6);
    background: none;
    border: none;
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
  }

  .status-btn + .status-btn {
    border-left: var(--border-default);
  }

  .status-btn.active {
    background: var(--color-bg-surface-1);
    color: var(--color-text-primary);
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: var(--radius-full);
    flex-shrink: 0;
  }
  .status-dot.sage  { background: var(--color-sage); }
  .status-dot.terra { background: var(--color-terra); }

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
    .two-col { grid-template-columns: 1fr; }
  }
</style>
