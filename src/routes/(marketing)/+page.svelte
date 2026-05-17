<svelte:head>
  <title>MyNamesake — Your family's story, beautifully told</title>
</svelte:head>

<div class="page">
  <header class="header">
    <span class="wordmark">🌳 MyNamesake</span>
    <nav>
      <a href="/login">Sign in</a>
      <a href="/signup" class="btn-cta">Get started</a>
    </nav>
  </header>

  <main class="hero">
    <h1>Your family's story,<br />beautifully told.</h1>
    <p>Build a visual family tree, preserve memories, and share your heritage with the people who matter most.</p>
    <a href="/signup" class="btn-primary">Start for free</a>
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
  }

  .wordmark {
    font-size: 1.1rem;
    font-weight: 700;
    color: #3d2000;
    letter-spacing: -0.02em;
  }

  nav {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  nav a {
    color: #9a6a2a;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
  }

  nav a:hover { color: #3d2000; }

  .btn-cta {
    background: #c8842a;
    color: #fff !important;
    padding: 0.45rem 1rem;
    border-radius: 0.5rem;
    transition: background 0.15s;
  }

  .btn-cta:hover { background: #a86b1c !important; }

  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: calc(100vh - 65px);
    padding: 2rem;
  }

  .hero h1 {
    font-size: clamp(2rem, 6vw, 3.5rem);
    font-weight: 800;
    color: #3d2000;
    margin: 0 0 1rem;
    letter-spacing: -0.03em;
    line-height: 1.15;
  }

  .hero p {
    color: #9a6a2a;
    font-size: 1.15rem;
    max-width: 480px;
    margin: 0 0 2.5rem;
    line-height: 1.6;
  }

  .btn-primary {
    display: inline-block;
    padding: 0.875rem 2rem;
    background: #c8842a;
    color: #fff;
    border-radius: 0.625rem;
    font-size: 1.05rem;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.15s;
  }

  .btn-primary:hover { background: #a86b1c; }
</style>
