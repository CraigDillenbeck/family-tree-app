<script lang="ts">
  import type { PageData } from './$types'
  import Card from '$lib/components/ui/Card.svelte'
  import Button from '$lib/components/ui/Button.svelte'

  let { data }: { data: PageData } = $props()

  const givenName = $derived(
    data.user?.user_metadata?.full_name?.split(' ')[0]
    ?? data.user?.email?.split('@')[0]
    ?? 'there'
  )

  const today = $derived(
    new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      .format(new Date())
  )
</script>

<svelte:head>
  <title>Dashboard — Prosapiam</title>
</svelte:head>

<div class="page">
  <div class="inner">

    <div class="welcome">
      <p class="dateline">{today}</p>
      <h1>Welcome back, {givenName}.</h1>
      <p class="subtext">Begin with yourself — your tree is ready to grow.</p>
    </div>

    <div class="grid">

      <div class="col-main">
        <Card style="padding: 0">
          <div class="card-head">
            <span class="section-label">Recent activity</span>
            <Button variant="ghost" size="sm">See all</Button>
          </div>
          <div class="empty-area">
            <p class="empty-text">No activity yet. Your tree's story begins here.</p>
          </div>
        </Card>

        <Card style="padding: 0">
          <div class="card-head">
            <span class="section-label">Latest memory</span>
            <Button variant="ghost" size="sm">Add memory</Button>
          </div>
          <div class="empty-area">
            <p class="empty-text">The first memory you add will live here.</p>
          </div>
        </Card>
      </div>

      <div class="col-side">
        <a href="/trees/new" class="tree-card-link">
          <Card interactive>
            <p class="section-label">Your tree</p>
            <p class="tree-count">0</p>
            <p class="tree-meta">family members</p>
            <span class="begin-cta">Begin your tree →</span>
          </Card>
        </a>

        <Card>
          <p class="section-label">Quick add</p>
          <div class="quick-add">
            <Button>Add a person</Button>
            <Button variant="secondary">Add a memory</Button>
            <Button variant="secondary">Upload media</Button>
          </div>
        </Card>
      </div>

    </div>
  </div>
</div>

<style>
  .page {
    background: var(--color-bg-page);
    min-height: calc(100vh - 52px);
    padding: var(--space-12) var(--space-20);
  }

  .inner {
    max-width: 1120px;
    margin: 0 auto;
  }

  /* ── Welcome ── */
  .welcome { margin-bottom: var(--space-8); }

  .dateline {
    font-family: var(--font-body);
    font-size: 13px;
    font-style: italic;
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-1) 0;
  }

  h1 {
    font-family: var(--font-display);
    font-size: var(--font-size-display-l);
    font-weight: var(--font-weight-light);
    letter-spacing: -0.01em;
    line-height: var(--line-height-tight);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-2) 0;
  }

  .subtext {
    font-family: var(--font-body);
    font-size: var(--font-size-body-ui);
    font-style: italic;
    line-height: var(--line-height-story);
    color: var(--color-text-body);
    max-width: 560px;
    margin: 0;
  }

  /* ── Grid ── */
  .grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--space-6);
    align-items: start;
  }

  .col-main,
  .col-side {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* ── Card internals ── */
  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px var(--space-6);
    border-bottom: var(--border-default);
  }

  .section-label {
    display: block;
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-2) 0;
  }

  .card-head .section-label { margin: 0; }

  .empty-area {
    padding: var(--space-8) var(--space-6);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-text {
    font-family: var(--font-body);
    font-size: var(--font-size-body-ui);
    font-style: italic;
    color: var(--color-text-hint);
    text-align: center;
    margin: 0;
  }

  /* ── Tree stat card ── */
  .tree-card-link { text-decoration: none; }

  .tree-count {
    font-family: var(--font-ui);
    font-size: var(--font-size-display-l);
    font-weight: var(--font-weight-light);
    color: var(--color-text-primary);
    line-height: 1;
    margin: var(--space-1) 0 0 0;
  }

  .tree-meta {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-text-secondary);
    margin: var(--space-1) 0 var(--space-4) 0;
  }

  .begin-cta {
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: var(--font-weight-medium);
    color: var(--color-accent);
  }

  /* ── Quick add ── */
  .quick-add {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .quick-add :global(button) {
    width: 100%;
    justify-content: center;
  }
</style>
