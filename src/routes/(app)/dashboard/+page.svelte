<script lang="ts">
  import type { PageData } from './$types'
  let { data }: { data: PageData } = $props()

  const name = $derived(data.user?.user_metadata?.full_name ?? data.user?.email ?? 'there')
</script>

<svelte:head>
  <title>Dashboard — MyNamesake</title>
</svelte:head>

<div class="page">
  <header class="header">
    <div class="brand">
      <span class="logo">🌳</span>
      <span class="wordmark">MyNamesake</span>
    </div>
    <form method="POST" action="/api/auth/signout">
      <button type="submit" class="btn-signout">Sign out</button>
    </form>
  </header>

  <main class="main">
    <div class="welcome">
      <h1>Welcome, {name} 👋</h1>
      <p>Your family trees will appear here. Let's build something beautiful.</p>
      <a href="/trees/new" class="btn-primary">Create your first tree</a>
    </div>
  </main>
</div>

<style>
  .page {
    min-height: 100vh;
    background: linear-gradient(135deg, #fdf6ec 0%, #fef9f0 50%, #fdf3e3 100%);
    font-family: system-ui, -apple-system, sans-serif;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: #fff;
    border-bottom: 1px solid #f0dfc0;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .logo { font-size: 1.5rem; }

  .wordmark {
    font-size: 1.1rem;
    font-weight: 700;
    color: #3d2000;
    letter-spacing: -0.02em;
  }

  .btn-signout {
    background: none;
    border: 1.5px solid #e8d5b4;
    border-radius: 0.5rem;
    color: #9a6a2a;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.4rem 0.875rem;
    transition: border-color 0.15s, color 0.15s;
  }

  .btn-signout:hover {
    border-color: #c8842a;
    color: #c8842a;
  }

  .main {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 65px);
    padding: 2rem;
  }

  .welcome {
    text-align: center;
    max-width: 480px;
  }

  .welcome h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #3d2000;
    margin: 0 0 0.75rem;
    letter-spacing: -0.02em;
  }

  .welcome p {
    color: #9a6a2a;
    font-size: 1.05rem;
    margin: 0 0 2rem;
  }

  .btn-primary {
    display: inline-block;
    padding: 0.75rem 1.75rem;
    background: #c8842a;
    color: #fff;
    border-radius: 0.625rem;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.15s;
  }

  .btn-primary:hover {
    background: #a86b1c;
  }
</style>
