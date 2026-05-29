<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'

  let { form }: { form: ActionData } = $props()
  let loading = $state(false)
</script>

<svelte:head>
  <title>Create account — Prosapiam</title>
</svelte:head>

<div class="page">
  <div class="card">
    <div class="brand">
      <img src="/logo-lockup.svg" alt="Prosapiam" class="brand-lockup" />
      <p class="tagline">Start your family's story today</p>
    </div>

    {#if form?.error}
      <div class="error-banner" role="alert">{form.error}</div>
    {/if}

    <form
      method="POST"
      action="?/signup"
      use:enhance={() => {
        loading = true
        return async ({ update }) => {
          await update()
          loading = false
        }
      }}
    >
      <div class="field">
        <label for="displayName">Your name</label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          autocomplete="name"
          required
          placeholder="What should we call you?"
        />
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          required
          placeholder="you@example.com"
        />
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autocomplete="new-password"
          required
          minlength="8"
          placeholder="At least 8 characters"
        />
      </div>

      <button class="btn-primary" type="submit" disabled={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>

    <p class="switch-link">
      Already have an account? <a href="/login">Sign in</a>
    </p>
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fdf6ec 0%, #fef9f0 50%, #fdf3e3 100%);
    padding: 1.5rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .card {
    background: #fff;
    border-radius: 1.25rem;
    box-shadow: 0 4px 24px rgba(140, 90, 20, 0.10), 0 1px 4px rgba(140, 90, 20, 0.06);
    padding: 2.5rem 2rem;
    width: 100%;
    max-width: 400px;
  }

  .brand {
    text-align: center;
    margin-bottom: 2rem;
  }

  .brand-lockup {
    display: block;
    height: 40px;
    width: auto;
    margin: 0 auto 8px;
  }

  .tagline {
    color: #9a6a2a;
    font-size: 0.9rem;
    margin: 0;
  }

  .error-banner {
    background: #fff3f3;
    border: 1px solid #f5c6c6;
    border-radius: 0.6rem;
    color: #b91c1c;
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
    margin-bottom: 1.25rem;
  }

  .field {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #5c3a0a;
    margin-bottom: 0.375rem;
  }

  input {
    width: 100%;
    padding: 0.65rem 0.875rem;
    border: 1.5px solid #e8d5b4;
    border-radius: 0.625rem;
    font-size: 1rem;
    color: #3d2000;
    background: #fffdf9;
    box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;
    outline: none;
  }

  input::placeholder {
    color: #c4a06a;
  }

  input:focus {
    border-color: #c8842a;
    box-shadow: 0 0 0 3px rgba(200, 132, 42, 0.15);
  }

  .btn-primary {
    width: 100%;
    padding: 0.75rem;
    background: #c8842a;
    color: #fff;
    border: none;
    border-radius: 0.625rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 0.5rem;
    transition: background 0.15s, transform 0.1s;
  }

  .btn-primary:hover:not(:disabled) {
    background: #a86b1c;
  }

  .btn-primary:active:not(:disabled) {
    transform: scale(0.99);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .switch-link {
    text-align: center;
    margin: 1.5rem 0 0;
    font-size: 0.875rem;
    color: #9a6a2a;
  }

  .switch-link a {
    color: #c8842a;
    font-weight: 600;
    text-decoration: none;
  }

  .switch-link a:hover {
    text-decoration: underline;
  }
</style>
