<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'
  import Input from '$lib/components/ui/Input.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Alert from '$lib/components/ui/Alert.svelte'

  let { form }: { form: ActionData } = $props()
  let loading = $state(false)
</script>

<svelte:head>
  <title>Private beta access — Prosapia</title>
</svelte:head>

<div class="page">
  <div class="inner">

    <div class="brand">
      <img src="/logo-mark.svg" width="40" height="40" alt="" aria-hidden="true" />
      <div class="wordmark">prosapia</div>
      <p class="tagline">Thanks for being one of the first ones in.</p>
    </div>

    <div class="card">
      <h1 class="heading">Enter your access code</h1>
      <p class="intro">
        Prosapia is in private testing right now. If you were invited, you should have a code —
        drop it in below and you'll go straight to your account.
      </p>

      {#if form?.error}
        <Alert intent="error" message={form.error} />
      {/if}

      <form
        method="POST"
        use:enhance={() => {
          loading = true
          return async ({ update }) => { await update(); loading = false }
        }}
      >
        <Input label="Access code" type="password" name="password" autocomplete="off" required placeholder="Your invite code" />
        <Button type="submit" size="lg" disabled={loading} style="width:100%;justify-content:center;margin-top:16px">
          {loading ? 'Checking…' : 'Continue'}
        </Button>
      </form>

      <p class="footnote">
        Don't have a code yet? <a href="/#waitlist">Join the waitlist</a> and I'll let you know when it's your turn.
      </p>
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
    font-size: 22px;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-3) 0;
  }

  .intro {
    font-family: var(--font-body);
    font-style: italic;
    font-size: 16px;
    line-height: 1.7;
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-6) 0;
  }

  .footnote {
    text-align: center;
    margin: var(--space-6) 0 0 0;
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-text-secondary);
  }
  .footnote a {
    color: var(--color-text-primary);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
    text-decoration-color: var(--color-border-strong);
  }
</style>
