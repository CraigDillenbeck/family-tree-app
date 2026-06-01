<script lang="ts">
  import { fade, fly } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import type { PageProps } from './$types'
  import Badge from '$lib/components/ui/Badge.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Icon from '$lib/components/ui/Icon.svelte'
  import { X, Plus, GitBranch } from 'lucide-svelte'

  const { data }: PageProps = $props()

  const canEdit = $derived(data.userRole === 'owner' || data.userRole === 'editor')

  let selectedId = $state<string | null>(null)
  const selected = $derived(data.persons.find(p => p.id === selectedId) ?? null)

  const dur = 280

  function closeDrawer() { selectedId = null }

  function formatDate(iso: string | null): string | null {
    if (!iso) return null
    const d = new Date(iso + 'T00:00:00')
    return d.getFullYear().toString()
  }
</script>

<svelte:head>
  <title>{data.tree.name} — Prosapiam</title>
</svelte:head>

<div class="view">

  <!-- ── Toolbar ── -->
  <div class="toolbar">
    <div class="toolbar-left">
      <h1 class="tree-name">{data.tree.name}</h1>
      {#if data.persons.length > 0}
        <Badge variant="warm">{data.persons.length} {data.persons.length === 1 ? 'person' : 'people'}</Badge>
      {/if}
    </div>

    <div class="toolbar-right">
      <span class="legend">
        <span class="legend-line parent"></span>Parent
        <span class="legend-line spouse"></span>Spouse
      </span>
      {#if canEdit}
        <Button variant="secondary" size="sm" href="/trees/{data.tree.id}/persons/new">
          {#snippet icon()}<Icon icon={Plus} size={16} color="currentColor" />{/snippet}
          Add person
        </Button>
        <Button size="sm">Add relationship</Button>
      {/if}
    </div>
  </div>

  <!-- ── Canvas ── -->
  <div class="canvas-wrap">
    <div class="canvas" class:has-drawer={!!selectedId}>

      {#if data.persons.length === 0}
        <div class="empty" transition:fade={{ duration: dur, easing: cubicOut }}>
          <div class="empty-icon">
            <Icon icon={GitBranch} size={32} color="var(--color-warm-light)" />
          </div>
          <p class="empty-title">Begin with yourself.</p>
          <p class="empty-body">Add the first person to your tree and watch your family's story take shape.</p>
          {#if canEdit}
            <Button href="/trees/{data.tree.id}/persons/new">
              {#snippet icon()}<Icon icon={Plus} size={16} color="currentColor" />{/snippet}
              Add a person
            </Button>
          {/if}
        </div>
      {:else}
        <!-- Node layer — will be replaced by @xyflow/svelte canvas -->
        <div class="nodes">
          {#each data.persons as p (p.id)}
            {@const birthYear = formatDate(p.birth_date)}
            {@const deathYear = formatDate(p.death_date)}
            <button
              class="node"
              class:selected={selectedId === p.id}
              onclick={() => selectedId = p.id}
              type="button"
            >
              <Avatar
                person={{ given: p.first_name, family: p.last_name ?? '', status: p.is_living ? 'living' : 'deceased' }}
                size={44}
              />
              <span class="node-name">{p.first_name}{p.last_name ? ' ' + p.last_name : ''}</span>
              {#if birthYear || deathYear}
                <span class="node-dates">
                  {#if p.is_living}
                    b. {birthYear}
                  {:else if birthYear && deathYear}
                    {birthYear}–{deathYear}
                  {:else if birthYear}
                    b. {birthYear}
                  {:else if deathYear}
                    d. {deathYear}
                  {/if}
                </span>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- ── Detail drawer ── -->
    {#if selected}
      {@const birthYear = formatDate(selected.birth_date)}
      {@const deathYear = formatDate(selected.death_date)}
      <aside
        class="drawer"
        transition:fly={{ x: 380, duration: dur, easing: cubicOut }}
      >
        <div class="drawer-head">
          <span class="drawer-label">Quick view</span>
          <button class="close" type="button" onclick={closeDrawer} aria-label="Close drawer">
            <Icon icon={X} size={16} color="var(--color-text-secondary)" />
          </button>
        </div>

        <div class="drawer-body">
          <Avatar
            person={{ given: selected.first_name, family: selected.last_name ?? '', status: selected.is_living ? 'living' : 'deceased' }}
            size={96}
          />
          <p class="drawer-name">{selected.first_name}{selected.last_name ? ' ' + selected.last_name : ''}</p>
          <Badge variant={selected.is_living ? 'sage' : 'terra'} dot>
            {selected.is_living ? 'Living' : 'Deceased'}
          </Badge>
          {#if birthYear || deathYear}
            <p class="drawer-dates">
              {#if selected.is_living && birthYear}
                b. {birthYear}
              {:else if birthYear && deathYear}
                {birthYear}–{deathYear}
              {:else if birthYear}
                b. {birthYear}
              {:else if deathYear}
                d. {deathYear}
              {/if}
            </p>
          {/if}
        </div>

        <div class="drawer-actions">
          <Button style="flex:1;justify-content:center" href="/trees/{data.tree.id}/persons/{selected.id}">View profile</Button>
          {#if canEdit}
            <Button variant="secondary" href="/trees/{data.tree.id}/persons/{selected.id}#memories">Add memory</Button>
          {/if}
        </div>
      </aside>
    {/if}
  </div>

</div>

<style>
  .view {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 52px);
    background: var(--color-bg-page);
  }

  /* ── Toolbar ── */
  .toolbar {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 18px var(--space-8);
    border-bottom: var(--border-default);
    flex-shrink: 0;
  }

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .tree-name {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-h2);
    color: var(--color-text-primary);
    margin: 0;
    line-height: 1;
  }

  .toolbar-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .legend {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-text-secondary);
    margin-right: var(--space-2);
  }

  .legend-line {
    display: inline-block;
    width: 14px;
    height: 1.5px;
  }
  .legend-line.parent { background: var(--color-warm-light); }
  .legend-line.spouse { background: var(--color-gold-light); }

  /* ── Canvas ── */
  .canvas-wrap {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .canvas {
    position: absolute;
    inset: 0;
    background-color: var(--color-bg-page);
    background-image: radial-gradient(rgba(196, 185, 168, 0.35) 1px, transparent 1px);
    background-size: 18px 18px;
    overflow: auto;
    transition: right var(--dur-base) var(--ease);
  }

  .canvas.has-drawer { right: 380px; }

  /* ── Empty state ── */
  .empty {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    padding: var(--space-8);
    text-align: center;
  }

  .empty-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-full);
  }

  .empty-title {
    font-family: var(--font-ui);
    font-size: var(--font-size-h2);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin: 0;
  }

  .empty-body {
    font-family: var(--font-body);
    font-size: var(--font-size-body-story);
    font-style: italic;
    color: var(--color-text-secondary);
    line-height: var(--line-height-story);
    max-width: 340px;
    margin: 0;
  }

  /* ── Nodes (placeholder layout — replaced by @xyflow/svelte) ── */
  .nodes {
    position: absolute;
    inset: 0;
    padding: var(--space-8);
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-6);
    align-content: flex-start;
  }

  .node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    width: 160px;
    min-height: 110px;
    padding: var(--space-3);
    background: var(--color-bg-page);
    border: var(--border-default);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
  }

  .node:hover {
    background: var(--color-bg-surface-1);
    border-color: var(--color-border-strong);
  }

  .node.selected {
    background: var(--color-bg-surface-1);
    border: var(--border-featured);
  }

  .node-name {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 13px;
    color: var(--color-text-primary);
    text-align: center;
    line-height: var(--line-height-heading);
  }

  .node-dates {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    color: var(--color-text-secondary);
  }

  /* ── Drawer ── */
  .drawer {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 380px;
    background: var(--color-bg-page);
    border-left: var(--border-default);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .drawer-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-6);
    border-bottom: var(--border-subtle);
    flex-shrink: 0;
  }

  .drawer-label {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: none;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease);
  }
  .close:hover { background: var(--color-bg-surface-1); }

  .drawer-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-8) var(--space-6);
    flex: 1;
  }

  .drawer-name {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-light);
    font-size: var(--font-size-h1);
    color: var(--color-text-primary);
    text-align: center;
    margin: 0;
    line-height: var(--line-height-heading);
  }

  .drawer-dates {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    color: var(--color-text-secondary);
    margin: 0;
  }

  .drawer-actions {
    display: flex;
    gap: var(--space-2);
    padding: var(--space-6);
    border-top: var(--border-subtle);
    flex-shrink: 0;
  }
</style>
