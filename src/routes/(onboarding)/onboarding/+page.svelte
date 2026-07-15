<script lang="ts">
  import { enhance } from '$app/forms'
  import { goto } from '$app/navigation'
  import type { PageData } from './$types'
  import Input from '$lib/components/ui/Input.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import { capture } from '$lib/utils/analytics'

  let { data }: { data: PageData } = $props()

  let step = $state<1 | 2 | 3>(1)
  let submitting = $state(false)
  let serverError = $state<string | null>(null)
  let savedTreeId = $state<string | null>(null)
  let savedFirstName = $state('')

  // Form fields
  let firstName = $state('')
  let lastName = $state('')
  let birthYear = $state('')
  let birthplace = $state('')
  let firstNameError = $state<string | null>(null)

  const givenName = $derived(
    data.profile?.display_name?.split(' ')[0] ?? 'there'
  )

  const previewInitials = $derived(
    ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase() || '—'
  )

  const filled = $derived(firstName.trim().length > 0)

  const previewDisplayName = $derived(
    firstName.trim() || lastName.trim()
      ? [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
      : null
  )

  const previewSubline = $derived(
    ['Living', birthYear.trim() ? `Born ${birthYear}` : '', birthplace.trim()]
      .filter(Boolean)
      .join(' · ')
  )

  function handleYearInput(e: Event) {
    const input = e.target as HTMLInputElement
    birthYear = input.value.replace(/\D/g, '').slice(0, 4)
  }

  function validateAndAdvance() {
    if (!firstName.trim()) {
      firstNameError = 'A given name keeps the record yours.'
      return false
    }
    if (birthYear.trim() && !/^\d{4}$/.test(birthYear.trim())) {
      firstNameError = 'Please enter a four-digit year, like 1987.'
      return false
    }
    firstNameError = null
    return true
  }
</script>

<svelte:head>
  <title>Welcome — Prosapia</title>
</svelte:head>

<div class="shell">
  <div class="frame" aria-hidden="true"></div>

  <!-- Top chrome -->
  <div class="topbar">
    {#if step === 2}
      <button
        class="back"
        type="button"
        onclick={() => { step = 1; serverError = null }}
        aria-label="Back to welcome"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Back
      </button>
    {/if}
    <span class="wordmark">PROSAPIA</span>
  </div>

  <!-- Step 1 — Welcome -->
  {#if step === 1}
    <div class="content" role="main">
      <div class="welcome-panel">
        <p class="section-label">Welcome</p>
        <h1 class="display-italic">Hello, {givenName}.</h1>
        <p class="body-text">
          What you make here will outlast the screen you're holding.
          A name. A face. A summer your grandmother kept a garden on Maple Street.
        </p>
        <p class="tagline-small">Every family tree begins the same way.</p>
        <div class="welcome-actions">
          <Button
            variant="primary"
            size="lg"
            onclick={() => { step = 2 }}
          >
            Begin with yourself
            {#snippet iconRight()}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            {/snippet}
          </Button>
          <button
            class="ghost-link"
            type="button"
            onclick={() => goto('/dashboard')}
          >
            I'll come back to it later
          </button>
        </div>
      </div>
    </div>

  <!-- Step 2 — Begin with yourself -->
  {:else if step === 2}
    <div class="content" role="main">
      <div class="begin-panel">
        <p class="step-indicator">Step 1 of 3</p>
        <h1 class="display-italic">Begin with yourself.</h1>
        <p class="body-text center">
          You are the first person in your tree. Add what feels right — you can fill in the rest later.
        </p>

        <div class="begin-body">
          <!-- Live preview node -->
          <div class="preview-wrap">
            <div class="preview-node" class:active={filled}>
              <span class="avatar-initials">{previewInitials}</span>
              <div class="preview-meta">
                <div class="preview-name">
                  {#if previewDisplayName}
                    {previewDisplayName}
                  {:else}
                    <span class="preview-placeholder">Your name</span>
                  {/if}
                </div>
                <div class="preview-sub">
                  <span class="sage-dot" aria-hidden="true"></span>
                  {previewSubline}
                </div>
              </div>
            </div>
          </div>

          <!-- Form -->
          <form
            method="POST"
            action="?/create"
            class="begin-form"
            use:enhance={({ cancel }) => {
              if (!validateAndAdvance()) {
                cancel()
                return
              }
              submitting = true
              serverError = null
              return async ({ result }) => {
                submitting = false
                if (result.type === 'success' && result.data) {
                  savedTreeId = result.data.treeId as string
                  savedFirstName = result.data.firstName as string
                  capture('tree_created', { tree_id: savedTreeId })
                  step = 3
                } else if (result.type === 'failure') {
                  serverError = (result.data as { error?: string })?.error ?? 'Something went wrong.'
                }
              }
            }}
          >
            <div class="name-row">
              <Input
                label="Given name"
                name="firstName"
                placeholder="Sarah"
                bind:value={firstName}
                error={firstNameError ?? undefined}
                autocomplete="given-name"
                autofocus
                oninput={() => { if (firstNameError) firstNameError = null }}
              />
              <Input
                label="Family name"
                name="lastName"
                placeholder="Walsh"
                bind:value={lastName}
                autocomplete="family-name"
              />
            </div>
            <Input
              label="Year of birth"
              name="birthYear"
              placeholder="e.g. 1987"
              bind:value={birthYear}
              oninput={handleYearInput}
              inputmode="numeric"
              autocomplete="bday-year"
            />
            <Input
              label="Where you were born"
              name="birthplace"
              placeholder="e.g. Cork, Ireland"
              bind:value={birthplace}
              autocomplete="country-name"
            />
            {#if serverError}
              <p class="server-error" role="alert">{serverError}</p>
            {/if}
            <div class="form-submit">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
              >
                {submitting ? 'Saving…' : 'Add yourself to the tree'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>

  <!-- Step 3 — First leaf (success) -->
  {:else}
    <div class="content" role="main">
      <div class="success-panel">
        <div class="check-circle" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 12L10 17L20 7" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <p class="section-label">The first leaf</p>
        <h1 class="display-italic">Your tree has begun, {savedFirstName}.</h1>
        <p class="body-text">
          From here, every parent, sibling and grandparent you remember will find their place.
        </p>
        <div class="success-actions">
          <Button
            variant="primary"
            size="lg"
            onclick={() => goto(`/trees/${savedTreeId}`)}
          >
            Take me to my tree
            {#snippet iconRight()}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            {/snippet}
          </Button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* ── Shell ── */
  .shell {
    min-height: 100vh;
    background: var(--color-bg-page);
    display: flex;
    flex-direction: column;
    padding: 80px;
    box-sizing: border-box;
    position: relative;
  }

  /* Archival inset frame */
  .frame {
    position: absolute;
    inset: 32px;
    border: var(--border-default);
    pointer-events: none;
  }

  /* ── Top chrome ── */
  .topbar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-12);
  }

  .wordmark {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-light);
    font-size: 16px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--color-text-primary);
  }

  .back {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    background: transparent;
    border: none;
    padding: 8px 12px 8px 4px;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 13px;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: color var(--dur-fast) var(--ease);
  }
  .back:hover { color: var(--color-text-primary); }

  /* ── Content column ── */
  .content {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── Shared typography ── */
  .section-label {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-gold);
    text-align: center;
    margin: 0 0 var(--space-4) 0;
  }

  .display-italic {
    margin: 0 0 var(--space-6) 0;
    font-family: var(--font-body);
    font-style: italic;
    font-weight: var(--font-weight-regular);
    font-size: 56px;
    line-height: 1.1;
    letter-spacing: -0.01em;
    color: var(--color-text-primary);
    text-align: center;
  }

  .body-text {
    margin: 0;
    font-family: var(--font-body);
    font-weight: var(--font-weight-regular);
    font-size: 20px;
    line-height: var(--line-height-story);
    color: var(--color-text-body);
    max-width: 480px;
    text-align: center;
  }

  .body-text.center { text-align: center; }

  /* ── Step 1: Welcome ── */
  .welcome-panel {
    max-width: 560px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .tagline-small {
    margin: var(--space-8) 0 0 0;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-regular);
    font-size: 13px;
    letter-spacing: 0.04em;
    color: var(--color-text-secondary);
  }

  .welcome-actions {
    margin-top: var(--space-12);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
  }

  .ghost-link {
    background: transparent;
    border: none;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 12px;
    letter-spacing: 0.02em;
    color: var(--color-text-secondary);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
    cursor: pointer;
    padding: var(--space-2) var(--space-3);
    transition: opacity var(--dur-fast) var(--ease);
  }
  .ghost-link:hover { opacity: 0.7; }

  /* ── Step 2: Begin with yourself ── */
  .begin-panel {
    width: 100%;
    max-width: 880px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .step-indicator {
    margin: 0 0 var(--space-4) 0;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .begin-panel .display-italic {
    font-size: 44px;
    margin-bottom: var(--space-3);
  }

  .begin-body {
    margin-top: var(--space-12);
    width: 100%;
    display: grid;
    grid-template-columns: 360px minmax(0, 1fr);
    gap: var(--space-12);
    align-items: start;
  }

  /* Preview node */
  .preview-wrap {
    position: sticky;
    top: 0;
  }

  .preview-node {
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-lg);
    padding: 20px 22px;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    transition: border-color var(--dur-base) var(--ease);
  }

  .preview-node.active {
    border: var(--border-featured);
  }

  .avatar-initials {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-full);
    background: var(--color-bg-surface-2);
    border: var(--border-default);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 17px;
    letter-spacing: 0.04em;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  .preview-meta {
    flex: 1;
    min-width: 0;
  }

  .preview-name {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 16px;
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-placeholder {
    color: var(--color-warm-light);
    font-weight: var(--font-weight-regular);
  }

  .preview-sub {
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-weight: var(--font-weight-regular);
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  .sage-dot {
    width: 6px;
    height: 6px;
    border-radius: var(--radius-full);
    background: var(--color-sage);
    display: inline-block;
    flex-shrink: 0;
  }

  /* Form */
  .begin-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .name-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }

  .server-error {
    margin: 0;
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-terra);
    background: var(--color-terra-tint);
    border: var(--border-error);
    border-radius: var(--radius-sm);
    padding: var(--space-3) var(--space-4);
  }

  .form-submit {
    margin-top: var(--space-2);
  }

  /* ── Step 3: Success ── */
  .success-panel {
    max-width: 520px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .check-circle {
    width: 72px;
    height: 72px;
    border-radius: var(--radius-full);
    background: var(--color-success-bg);
    border: 0.5px solid var(--color-sage);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-sage);
    margin-bottom: var(--space-6);
  }

  .success-actions {
    margin-top: var(--space-12);
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .shell {
      padding: 32px 24px;
    }

    .frame {
      inset: 16px;
    }

    .topbar {
      margin-bottom: var(--space-8);
    }

    .wordmark {
      font-size: 14px;
    }

    .display-italic {
      font-size: 36px;
    }

    .body-text {
      font-size: 17px;
    }

    .begin-panel .display-italic {
      font-size: 28px;
    }

    .begin-body {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-8);
      margin-top: var(--space-8);
    }

    .preview-wrap {
      position: static;
      display: flex;
      justify-content: center;
    }

    .preview-node {
      max-width: 360px;
      width: 100%;
    }

    .name-row {
      grid-template-columns: 1fr;
    }
  }
</style>
