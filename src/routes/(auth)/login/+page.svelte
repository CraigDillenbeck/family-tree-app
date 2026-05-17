<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'

  let { form }: { form: ActionData } = $props()
  let loading = $state(false)
  let oauthLoading = $state(false)
</script>

<svelte:head>
  <title>Sign in — MyNamesake</title>
</svelte:head>

<div class="page">
  <div class="card">
    <div class="brand">
      <div class="logo">🌳</div>
      <h1>MyNamesake</h1>
      <p class="tagline">Your family's story, beautifully told</p>
    </div>

    {#if form?.error}
      <div class="error-banner" role="alert">{form.error}</div>
    {/if}

    <form
      method="POST"
      action="?/login"
      use:enhance={() => {
        loading = true
        return async ({ update }) => {
          await update()
          loading = false
        }
      }}
    >
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
          autocomplete="current-password"
          required
          placeholder="Your password"
        />
      </div>

      <button class="btn-primary" type="submit" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>

    <div class="divider"><span>or</span></div>

    <form
      method="POST"
      action="?/oauth"
      use:enhance={() => {
        oauthLoading = true
        return async ({ update }) => {
          await update()
          oauthLoading = false
        }
      }}
    >
      <button class="btn-google" type="submit" disabled={oauthLoading}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {oauthLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>
    </form>

    <p class="switch-link">
      New to MyNamesake? <a href="/signup">Create an account</a>
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

  .logo {
    font-size: 2.75rem;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .brand h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #3d2000;
    margin: 0 0 0.35rem;
    letter-spacing: -0.02em;
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

  .divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 1.5rem 0;
    color: #c4a06a;
    font-size: 0.8rem;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #f0dfc0;
  }

  .btn-google {
    width: 100%;
    padding: 0.7rem;
    background: #fff;
    color: #3d2000;
    border: 1.5px solid #e8d5b4;
    border-radius: 0.625rem;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    transition: background 0.15s, border-color 0.15s;
  }

  .btn-google:hover:not(:disabled) {
    background: #fffdf7;
    border-color: #c8842a;
  }

  .btn-google:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-google svg {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
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
