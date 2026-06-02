<script lang="ts">
  import { enhance } from '$app/forms'
  import { page } from '$app/stores'
  import type { ActionData } from './$types'
  import Input from '$lib/components/ui/Input.svelte'
  import Button from '$lib/components/ui/Button.svelte'

  let { form }: { form: ActionData } = $props()
  let loading = $state(false)

  const expired = $derived($page.url.searchParams.get('expired') === '1')
</script>

<svelte:head>
  <title>Reset password — Prosapiam</title>
</svelte:head>

<div class="page">
  <div class="inner">

    <div class="brand">
      <img src="/logo-mark.svg" width="40" height="40" alt="" aria-hidden="true" />
      <div class="wordmark">prosapiam</div>
      <p class="tagline">The people who made you, kept.</p>
    </div>

    <div class="card">
      <h1 class="heading">Reset your password</h1>

      {#if form?.sent}
        <div class="success" role="status">
          <p>Check your inbox. If that address is on file, we've sent a reset link.</p>
          <p class="hint">Didn't get it? Check your spam folder, or <a href="/forgot-password">try again</a>.</p>
        </div>
      {:else}
        {#if expired}
          <div class="alert" role="alert">That reset link has expired. Please request a new one.</div>
        {/if}

        {#if form?.error}
          <div class="alert" role="alert">{form.error}</div>
        {/if}

        <p class="description">Enter the email address for your account and we'll send you a reset link.</p>

        <form
          method="POST"
          action="?/request"
          use:enhance={() => {
            loading = true
            return async ({ update }) => { await update(); loading = false }
          }}
        >
          <div class="fields">
            <Input label="Email" type="email" name="email" autocomplete="email" required placeholder="you@example.com" />
            <Button type="submit" size="lg" disabled={loading} style="width:100%;justify-content:center;margin-top:4px">
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
          </div>
        </form>
      {/if}
    </div>

    <p class="back">
      <a href="/login">Back to sign in</a>
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

  .description {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-6) 0;
    line-height: 1.6;
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
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

  .success {
    font-family: var(--font-ui);
    font-size: 14px;
    color: var(--color-text-body);
    line-height: 1.6;
  }

  .success p { margin: 0 0 var(--space-3) 0; }
  .success p:last-child { margin-bottom: 0; }

  .hint {
    color: var(--color-text-secondary);
    font-size: 13px;
  }
  .hint a {
    color: var(--color-text-primary);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
    text-decoration-color: var(--color-border-strong);
  }

  .back {
    text-align: center;
    margin: var(--space-6) 0 0 0;
    font-family: var(--font-ui);
    font-size: 13px;
  }
  .back a {
    color: var(--color-text-secondary);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
    text-decoration-color: var(--color-border-default);
  }
  .back a:hover { color: var(--color-text-primary); }
</style>
