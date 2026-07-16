<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageProps } from './$types'

  let { data, form }: PageProps = $props()

  let accepting = $state(false)

  const emailMismatch = $derived(
    data.state.status === 'valid' &&
      data.sessionEmail !== null &&
      data.sessionEmail.toLowerCase() !== data.state.inviteEmail.toLowerCase()
  )
</script>

<svelte:head>
  <title>You're invited — Prosapia</title>
</svelte:head>

<div class="page">
  <div class="inner">

    <div class="brand">
      <img src="/logo-mark.svg" width="40" height="40" alt="" aria-hidden="true" />
      <div class="wordmark">prosapia</div>
    </div>

    <div class="card">
      {#if data.state.status === 'not_found'}
        <h1 class="heading">This invite link isn't valid</h1>
        <p class="body">It may have been revoked, or the link was copied incorrectly. Ask the person who invited you to send a new one.</p>
        <a class="cta" href="/">Go to Prosapia</a>

      {:else if data.state.status === 'expired'}
        <h1 class="heading">This invite has expired</h1>
        <p class="body">Invites to <strong>{data.state.treeName}</strong> are valid for 14 days. Ask them to send you a new one.</p>
        <a class="cta" href="/">Go to Prosapia</a>

      {:else if data.state.status === 'already_accepted'}
        <h1 class="heading">You've already joined {data.state.treeName}</h1>
        {#if data.sessionEmail}
          <a class="cta" href="/trees/{data.state.treeId}">Go to the tree</a>
        {:else}
          <p class="body">Sign in to pick up where you left off.</p>
          <a class="cta" href="/login">Sign in</a>
        {/if}

      {:else if emailMismatch}
        <h1 class="heading">Wrong account</h1>
        <p class="body">
          This invite was sent to <strong>{data.state.inviteEmail}</strong>, but you're signed in as
          {data.sessionEmail}. Sign out and sign back in with the invited address to accept.
        </p>
        <form method="POST" action="/api/auth/signout">
          <button class="cta secondary" type="submit">Sign out</button>
        </form>

      {:else if data.sessionEmail}
        <h1 class="heading">{data.state.inviterName} invited you to {data.state.treeName}</h1>
        <p class="body">
          Add your own memories, photographs, and the details only you remember — as a {data.state.role === 'editor' ? 'editor' : 'viewer'}.
        </p>
        {#if form?.error}
          <p class="error" role="alert">{form.error}</p>
        {/if}
        <form
          method="POST"
          action="?/accept"
          use:enhance={() => {
            accepting = true
            return async ({ update }) => {
              accepting = false
              await update()
            }
          }}
        >
          <button class="cta" type="submit" disabled={accepting}>
            {accepting ? 'Joining…' : `Accept invitation`}
          </button>
        </form>

      {:else}
        <h1 class="heading">{data.state.inviterName} invited you to {data.state.treeName}</h1>
        <p class="body">Add your own memories, photographs, and the details only you remember — the tree grows every time someone adds their voice.</p>
        <div class="cta-row">
          <a class="cta" href="/signup?redirectTo=/invite/{data.token}&email={encodeURIComponent(data.state.inviteEmail)}">Create account</a>
          <a class="cta secondary" href="/login?redirectTo=/invite/{data.token}">Sign in</a>
        </div>
      {/if}
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
    max-width: 440px;
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

  .card {
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-lg);
    padding: var(--space-8);
    text-align: center;
  }

  .heading {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 22px;
    letter-spacing: -0.01em;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-4);
    line-height: var(--line-height-tight);
  }

  .body {
    font-family: var(--font-body);
    font-size: var(--font-size-body-story);
    line-height: var(--line-height-story);
    color: var(--color-text-body);
    margin: 0 0 var(--space-6);
    max-width: 380px;
    margin-left: auto;
    margin-right: auto;
  }

  .error {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-terra);
    margin: 0 0 var(--space-4);
  }

  .cta-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    padding: 0 var(--space-6);
    background: var(--color-ink);
    color: var(--color-bg-page);
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 14px;
    border: none;
    border-radius: var(--radius-md);
    text-decoration: none;
    cursor: pointer;
    width: 100%;
  }

  .cta.secondary {
    background: transparent;
    color: var(--color-text-primary);
    border: var(--border-default);
  }

  .cta:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
