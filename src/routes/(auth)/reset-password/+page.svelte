<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'
  import Input from '$lib/components/ui/Input.svelte'
  import Button from '$lib/components/ui/Button.svelte'

  let { form }: { form: ActionData } = $props()
  let loading = $state(false)
  let password = $state('')
  let confirm = $state('')

  let mismatch = $derived(confirm.length > 0 && password !== confirm)
</script>

<svelte:head>
  <title>Choose a new password — Prosapiam</title>
</svelte:head>

<div class="page">
  <div class="inner">

    <div class="brand">
      <img src="/logo-mark.svg" width="40" height="40" alt="" aria-hidden="true" />
      <div class="wordmark">prosapiam</div>
      <p class="tagline">The people who made you, kept.</p>
    </div>

    <div class="card">
      <h1 class="heading">Choose a new password</h1>

      {#if form?.error}
        <div class="alert" role="alert">{form.error}</div>
      {/if}

      <form
        method="POST"
        action="?/update"
        use:enhance={() => {
          loading = true
          return async ({ update }) => { await update(); loading = false }
        }}
      >
        <div class="fields">
          <Input
            label="New password"
            type="password"
            name="password"
            autocomplete="new-password"
            required
            placeholder="At least 8 characters"
            bind:value={password}
          />
          <div class="confirm-wrap">
            <Input
              label="Confirm password"
              type="password"
              name="confirm"
              autocomplete="new-password"
              required
              placeholder="Repeat your password"
              bind:value={confirm}
            />
            {#if mismatch}
              <p class="mismatch" role="alert">Passwords don't match.</p>
            {/if}
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading || mismatch}
            style="width:100%;justify-content:center;margin-top:4px"
          >
            {loading ? 'Saving…' : 'Set new password'}
          </Button>
        </div>
      </form>
    </div>

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
    font-family: var(--font-ui);
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

  .heading {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 18px;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-6) 0;
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .confirm-wrap {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .mismatch {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-error);
    margin: 0;
  }

  .alert {
    background: var(--color-error-bg);
    border: var(--border-error);
    border-radius: var(--radius-sm);
    color: var(--color-error);
    font-family: var(--font-ui);
    font-size: 13px;
    padding: var(--space-3) var(--space-4);
    margin-bottom: var(--space-4);
  }
</style>
