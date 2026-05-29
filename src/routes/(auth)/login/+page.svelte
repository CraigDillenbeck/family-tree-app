<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'
  import Input from '$lib/components/ui/Input.svelte'
  import Button from '$lib/components/ui/Button.svelte'

  let { form }: { form: ActionData } = $props()
  let loading = $state(false)
  let oauthLoading = $state(false)
</script>

<svelte:head>
  <title>Sign in — Prosapiam</title>
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
        <a href="/login" class="tab active" aria-current="page">Sign in</a>
        <a href="/signup" class="tab">Create account</a>
      </nav>

      {#if form?.error}
        <div class="alert" role="alert">{form.error}</div>
      {/if}

      <form
        method="POST"
        action="?/login"
        use:enhance={() => {
          loading = true
          return async ({ update }) => { await update(); loading = false }
        }}
      >
        <div class="fields">
          <Input label="Email" type="email" name="email" autocomplete="email" required placeholder="you@example.com" />
          <div class="pw-row">
            <Input label="Password" type="password" name="password" autocomplete="current-password" required placeholder="Your password" />
            <a href="/forgot-password" class="forgot">Forgotten password?</a>
          </div>
          <Button type="submit" size="lg" disabled={loading} style="width:100%;justify-content:center;margin-top:8px">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </div>
      </form>

      <div class="or"><span>or</span></div>

      <form
        method="POST"
        action="?/oauth"
        use:enhance={() => {
          oauthLoading = true
          return async ({ update }) => { await update(); oauthLoading = false }
        }}
      >
        <button class="google" type="submit" disabled={oauthLoading}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {oauthLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>
      </form>
    </div>

    <p class="switch">
      New to Prosapiam? <a href="/signup">Create an account</a>
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

  /* ── Brand ── */
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

  /* ── Card ── */
  .card {
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-lg);
    padding: var(--space-8);
  }

  /* ── Tabs ── */
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

  /* ── Alert ── */
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

  /* ── Fields ── */
  .fields {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .pw-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .forgot {
    font-family: var(--font-display);
    font-size: 12px;
    color: var(--color-text-body);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
    text-decoration-color: var(--color-border-strong);
    align-self: flex-end;
  }
  .forgot:hover { color: var(--color-text-primary); }

  /* ── OR divider ── */
  .or {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin: var(--space-6) 0;
    color: var(--color-text-hint);
    font-family: var(--font-display);
    font-size: 12px;
  }
  .or::before, .or::after {
    content: '';
    flex: 1;
    height: 0.5px;
    background: var(--color-border-default);
  }

  /* ── Google ── */
  .google {
    width: 100%;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    background: transparent;
    border: var(--border-default);
    border-radius: var(--radius-sm);
    font-family: var(--font-display);
    font-weight: var(--font-weight-medium);
    font-size: 13px;
    color: var(--color-text-primary);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
  }
  .google:hover:not(:disabled) {
    background: var(--color-bg-surface-2);
    border-color: var(--color-border-strong);
  }
  .google:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Switch link ── */
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
