<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  import { Search } from 'lucide-svelte';

  type Link = { id: string; label: string; href?: string };

  let {
    active,
    links = [
      { id: 'dashboard', label: 'Home', href: '/dashboard' },
      { id: 'tree', label: 'Tree' },
      { id: 'memories', label: 'Memories' }
    ],
    wordmark = 'prosapia',
    onnav,
    onsearch,
    avatar
  }: {
    active?: string;
    links?: Link[];
    /** brand wordmark text; swap for the <img> lockup from assets/ when available */
    wordmark?: string;
    onnav?: (id: string) => void;
    onsearch?: () => void;
    /** avatar snippet (drop in <Avatar … /> or initials) */
    avatar?: Snippet;
  } = $props();
</script>

<header class="nav">
  <span class="wordmark">{wordmark}</span>

  <nav class="links">
    {#each links as l (l.id)}
      <a
        class="link"
        class:active={active === l.id}
        href={l.href ?? '#'}
        onclick={(e) => {
          if (!l.href) e.preventDefault();
          onnav?.(l.id);
        }}>{l.label}</a>
    {/each}
  </nav>

  <div class="right">
    <button class="search" type="button" onclick={() => onsearch?.()}>
      <Icon icon={Search} size={14} color="var(--color-text-inverse-muted)" />
      <span>Search family members…</span>
    </button>
    {#if avatar}{@render avatar()}{/if}
  </div>
</header>

<style>
  /* The one large inverse (Ink) surface in the product — chrome only. */
  .nav {
    display: flex;
    align-items: center;
    gap: var(--space-8);
    padding: 14px var(--space-8);
    background: var(--color-bg-inverse);
    color: var(--color-text-inverse);
  }

  /* Wordmark — Plus Jakarta Light, the brand's quiet voice. */
  .wordmark {
    flex-shrink: 0;
    font-family: var(--font-display);
    font-weight: var(--font-weight-light);
    font-size: 22px;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }

  .links { display: flex; gap: var(--space-6); }
  .link {
    font-family: var(--font-display);
    font-weight: var(--font-weight-medium);
    font-size: 13px;
    color: var(--color-text-inverse-muted);
    text-decoration: none;
    transition: opacity var(--dur-fast) var(--ease);
  }
  .link:hover { opacity: 0.7; }
  .link.active { color: var(--color-text-inverse); }

  .right { margin-left: auto; display: flex; align-items: center; gap: 18px; }

  .search {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    height: 32px;
    padding: 0 var(--space-3);
    background: rgba(247, 244, 238, 0.07);
    border: var(--border-inverse);
    border-radius: var(--radius-sm);
    color: var(--color-text-inverse-muted);
    font-family: var(--font-display);
    font-size: 13px;
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease);
  }
  .search:hover { background: rgba(247, 244, 238, 0.12); }
</style>
