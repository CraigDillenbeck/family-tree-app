<script lang="ts">
  import { enhance } from '$app/forms'
  import { goto } from '$app/navigation'
  import type { PageProps } from './$types'
  import Input from '$lib/components/ui/Input.svelte'
  import Textarea from '$lib/components/ui/Textarea.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Icon from '$lib/components/ui/Icon.svelte'
  import { ArrowLeft, Trash2 } from 'lucide-svelte'
  import { untrack } from 'svelte'

  const { data }: PageProps = $props()

  function yearFromDate(d: string | null): string {
    return d ? d.slice(0, 4) : ''
  }

  // One-time initializations from server-loaded data — untrack marks this as intentional
  const initial = untrack(() => data.person)
  let submitting = $state(false)
  let deleting = $state(false)
  let serverError = $state<string | null>(null)

  let firstName = $state(initial.first_name)
  let lastName = $state(initial.last_name ?? '')
  let maidenName = $state(initial.maiden_name ?? '')
  let isLiving = $state(initial.is_living)
  let birthYear = $state(yearFromDate(initial.birth_date))
  let birthPlace = $state(initial.birth_place ?? '')
  let deathYear = $state(yearFromDate(initial.death_date))
  let primaryResidence = $state(initial.primary_residence ?? '')
  let occupation = $state(initial.occupation ?? '')
  let bio = $state(initial.bio ?? '')

  let firstNameError = $state<string | null>(null)
  let birthYearError = $state<string | null>(null)
  let deathYearError = $state<string | null>(null)

  const fullName = $derived(
    [data.person.first_name, data.person.last_name].filter(Boolean).join(' ')
  )

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

  function confirmDelete() {
    if (!confirm(`Remove ${fullName} from the tree? This cannot be undone.`)) return false
    return true
  }

  const p = $derived(data.person)
</script>

<svelte:head>
  <title>Edit {fullName} — {data.tree.name}</title>
</svelte:head>

<div class="page">
  <div class="inner">

    <a class="back" href="/trees/{data.tree.id}/persons/{p.id}">
      <Icon icon={ArrowLeft} size={16} color="currentColor" />
      {fullName}
    </a>

    <header class="header">
      <h1 class="title">Edit {p.first_name}</h1>
    </header>

    <form
      method="POST"
      action="?/update"
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
            bind:value={firstName}
            error={firstNameError ?? undefined}
            autocomplete="off"
            oninput={() => { if (firstNameError) firstNameError = null }}
          />
          <Input
            label="Family name"
            name="lastName"
            bind:value={lastName}
            autocomplete="off"
          />
        </div>
        <Input
          label="Maiden name"
          name="maidenName"
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
            bind:value={birthYear}
            error={birthYearError ?? undefined}
            oninput={handleYearInput('birth')}
            inputmode="numeric"
            autocomplete="off"
          />
          <Input
            label="Place of birth"
            name="birthPlace"
            bind:value={birthPlace}
            autocomplete="off"
          />
        </div>
        {#if !isLiving}
          <Input
            label="Year of death"
            name="deathYear"
            bind:value={deathYear}
            error={deathYearError ?? undefined}
            oninput={handleYearInput('death')}
            inputmode="numeric"
            autocomplete="off"
          />
        {/if}
        <Input
          label="Location"
          name="primaryResidence"
          bind:value={primaryResidence}
          autocomplete="off"
        />
      </section>

      <!-- Background -->
      <section class="section">
        <h2 class="section-label">Background</h2>
        <Input
          label="Occupation"
          name="occupation"
          bind:value={occupation}
          autocomplete="off"
        />
        <Textarea
          label="Biography"
          name="bio"
          bind:value={bio}
          variant="story"
        />
      </section>

      {#if serverError}
        <p class="server-error" role="alert">{serverError}</p>
      {/if}

      <div class="actions">
        <Button type="submit" variant="primary" size="lg" disabled={submitting || deleting}>
          {submitting ? 'Saving…' : 'Save changes'}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          disabled={submitting || deleting}
          onclick={() => goto(`/trees/${data.tree.id}/persons/${p.id}`)}
        >
          Cancel
        </Button>
      </div>
    </form>

    <!-- Danger zone -->
    <div class="danger-zone">
      <div class="danger-info">
        <p class="danger-title">Remove from tree</p>
        <p class="danger-body">
          This will permanently remove {p.first_name} and all their connections from the tree.
          Memories and media tagged to them will remain in the tree but become untagged.
        </p>
      </div>
      <form
        method="POST"
        action="?/delete"
        use:enhance={({ cancel }) => {
          if (!confirmDelete()) { cancel(); return }
          deleting = true
          return async ({ result, update }) => {
            deleting = false
            if (result.type === 'failure') {
              serverError = (result.data as { error?: string })?.error ?? 'Could not remove this person.'
            }
            await update()
          }
        }}
      >
        <Button type="submit" variant="destructive" size="sm" disabled={deleting || submitting}>
          {#snippet icon()}<Icon icon={Trash2} size={14} color="currentColor" />{/snippet}
          {deleting ? 'Removing…' : 'Remove person'}
        </Button>
      </form>
    </div>

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
    font-family: var(--font-ui);
    font-size: 36px;
    font-weight: var(--font-weight-regular);
    color: var(--color-text-primary);
    margin: 0;
    line-height: 1.15;
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

  /* Danger zone */
  .danger-zone {
    margin-top: var(--space-16);
    padding-top: var(--space-8);
    border-top: var(--border-default);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-8);
  }

  .danger-info {
    flex: 1;
  }

  .danger-title {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 13px;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-2) 0;
  }

  .danger-body {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-text-secondary);
    line-height: var(--line-height-ui);
    margin: 0;
    max-width: 380px;
  }

  @media (max-width: 640px) {
    .page { padding: var(--space-6) var(--space-4); }
    .two-col { grid-template-columns: 1fr; }
    .danger-zone { flex-direction: column; }
  }
</style>
