<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'
  import Input from '$lib/components/ui/Input.svelte'
  import Button from '$lib/components/ui/Button.svelte'

  let { form }: { form: ActionData } = $props()
  let loading = $state(false)
</script>

<svelte:head>
  <title>Create account — Prosapiam</title>
</svelte:head>

<div class="page">
  <div class="inner">

    <div class="brand">
      <img src="/logo-mark.svg" width="40" height="40" alt="" aria-hidden="true" />
      <div class="wordmark">prosapiam</div>
      <p class="tagline">The people who made you, kept.</p>
    </div>

    <div class="card">
      <nav class="tabs" aria-label="Account access">
        <a href="/login" class="tab">Sign in</a>
        <a href="/signup" class="tab active" aria-current="page">Create account</a>
      </nav>

      {#if form?.error}
        <div class="alert" role="alert">{form.error}</div>
      {/if}

      <form
        method="POST"
        action="?/signup"
        use:enhance={() => {
          loading = true
          return async ({ update }) => { await update(); loading = false }
        }}
      >
        <div class="fields">
          <Input label="Given name" type="text" name="displayName" autocomplete="given-name" required placeholder="Sarah" />
          <Input label="Email" type="email" name="email" autocomplete="email" required placeholder="you@example.com" />
          <Input label="Password" type="password" name="password" autocomplete="new-password" required placeholder="At least 8 characters" />
          <Button type="submit" size="lg" disabled={loading} style="width:100%;justify-content:center;margin-top:8px">
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
          <p class="consent">By creating an account you agree to keep family stories with the care they deserve.</p>
        </div>
      </form>
    </div>

    <p class="switch">
      Already have one? <a href="/login">Sign in</a>
    </p>

  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-page);
    padding: var(--space-12) var(--space-6);
  }

  .inner {
    width: 100%;
    max-width: 420px;
  }

  .brand {
    text-align: center;
    margin-bottom: var(--space-8);
  }

  .wordmark {
    font-family: var(--font-display);
    font-weight: var(--font-weight-light);
    font-size: 32px;
    letter-spacing: -0.01em;
    color: var(--color-text-primary);
    margin-top: var(--space-3);
  }

  .tagline {
    font-family: var(--font-body);
    font-style: italic;
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: var(--space-2) 0 0 0;
    line-height: var(--line-height-ui);
  }

  .card {
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-lg);
    padding: var(--space-8);
  }

  .tabs {
    display: flex;
    border-bottom: var(--border-default);
    margin-bottom: var(--space-6);
  }

  .tab {
    flex: 1;
    text-align: center;
    font-family: var(--font-display);
    font-weight: var(--font-weight-medium);
    font-size: 13px;
    height: 40px;
    line-height: 40px;
    color: var(--color-text-secondary);
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    text-decoration: none;
    transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
  }

  .tab.active {
    color: var(--color-text-primary);
    border-bottom-color: var(--color-gold);
  }

  .tab:not(.active):hover { color: var(--color-text-body); }

  .alert {
    background: var(--color-error-bg);
    border: var(--border-error);
    border-radius: var(--radius-sm);
    color: var(--color-error);
    font-family: var(--font-display);
    font-size: 13px;
    padding: var(--space-3) var(--space-4);
    margin-bottom: var(--space-4);
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .consent {
    font-family: var(--font-display);
    font-size: 12px;
    color: var(--color-text-secondary);
    line-height: var(--line-height-ui);
    margin: 0;
    text-align: center;
  }

  .switch {
    text-align: center;
    margin: var(--space-6) 0 0 0;
    font-family: var(--font-display);
    font-size: 13px;
    color: var(--color-text-secondary);
  }
  .switch a {
    color: var(--color-text-primary);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
    text-decoration-color: var(--color-border-strong);
  }
</style>
