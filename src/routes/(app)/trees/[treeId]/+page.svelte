<script lang="ts">
  import { fade, fly } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import { goto, invalidateAll } from '$app/navigation'
  import type { PageProps } from './$types'
  import Badge from '$lib/components/ui/Badge.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Icon from '$lib/components/ui/Icon.svelte'
  import TreeCanvas from '$lib/components/tree/TreeCanvas.svelte'
  import AddRelationshipModal from '$lib/components/tree/AddRelationshipModal.svelte'
  import { X, Plus, GitBranch, List, ChevronLeft, ChevronRight, Activity, Search } from 'lucide-svelte'

  const { data }: PageProps = $props()

  const canEdit = $derived(data.userRole === 'owner' || data.userRole === 'editor')

  let selectedId = $state<string | null>(null)
  let listView = $state(false)
  let stagingOpen = $state(false)
  const selected = $derived(data.persons.find(p => p.id === selectedId) ?? null)

  // Relationship modal
  let deletingRelId = $state<string | null>(null)
  let deletingPerson = $state(false)
  let deleteRelLoading = $state(false)
  let deletePersonLoading = $state(false)

  type RelAction = 'parent' | 'child' | 'sibling' | 'partner'
  let modalAction = $state<RelAction | null>(null)
  const modalOpen = $derived(modalAction !== null)

  // Which persons have at least one relationship (used by staging tray + modal)
  const connectedIds = $derived(
    new Set<string>(
      data.relationships.flatMap(r => [r.person_a_id, r.person_b_id])
    )
  )
  const unconnectedCount = $derived(data.persons.filter(p => !connectedIds.has(p.id)).length)
  const unconnectedPersons = $derived(data.persons.filter(p => !connectedIds.has(p.id)))

  const selectedConnections = $derived(
    selected
      ? data.relationships
          .filter(r => r.person_a_id === selected.id || r.person_b_id === selected.id)
          .map(r => {
            const isPersonA = r.person_a_id === selected.id
            const otherId = isPersonA ? r.person_b_id : r.person_a_id
            const other = data.persons.find(p => p.id === otherId)
            return { relId: r.id, relType: r.type, isPersonA, other }
          })
          .filter((c): c is { relId: string; relType: string; isPersonA: boolean; other: NonNullable<typeof c.other> } => c.other !== undefined)
      : []
  )

  function relLabel(type: string, isPersonA: boolean): string {
    switch (type) {
      case 'spouse': return 'Spouse'
      case 'divorced': return 'Former spouse'
      case 'partner': return 'Partner'
      case 'parent_child': return isPersonA ? 'Child' : 'Parent'
      case 'adopted_parent_child': return isPersonA ? 'Adopted child' : 'Adoptive parent'
      case 'step_parent_child': return isPersonA ? 'Step-child' : 'Step-parent'
      case 'sibling': return 'Sibling'
      case 'half_sibling': return 'Half-sibling'
      case 'step_sibling': return 'Step-sibling'
      default: return type
    }
  }

  // Search
  let searchQuery = $state('')
  let searchOpen  = $state(false)
  const searchResults = $derived(
    searchQuery.trim().length < 2
      ? []
      : data.persons
          .filter(p => {
            const full = `${p.first_name} ${p.last_name ?? ''}`.toLowerCase()
            return full.includes(searchQuery.toLowerCase().trim())
          })
          .slice(0, 8)
  )

  function selectSearchResult(personId: string) {
    searchQuery = ''
    searchOpen  = false
    listView    = false
    stagingOpen = false
    selectedId  = personId
  }

  const dur = 280

  // Auto-open staging tray when a new unconnected person is added; auto-close when all are connected
  let _prevUnconnectedCount = 0
  $effect(() => {
    const current = unconnectedCount
    if (current > _prevUnconnectedCount) stagingOpen = true
    if (current === 0) stagingOpen = false
    _prevUnconnectedCount = current
  })

  function openStaging() {
    selectedId = null
    stagingOpen = true
  }

  function closeDrawer() {
    selectedId = null
    deletingRelId = null
    deletingPerson = false
  }

  function handleNodeClick(id: string) {
    if (id) stagingOpen = false
    selectedId = id || null
    deletingRelId = null
    deletingPerson = false
  }

  async function deleteRelationship(relId: string) {
    deleteRelLoading = true
    await fetch(`/api/trees/${data.tree.id}/relationships?id=${relId}`, { method: 'DELETE' })
    deletingRelId = null
    deleteRelLoading = false
    await invalidateAll()
  }

  async function deletePerson() {
    if (!selected) return
    deletePersonLoading = true
    await fetch(`/api/trees/${data.tree.id}/persons?personId=${selected.id}`, { method: 'DELETE' })
    deletePersonLoading = false
    deletingPerson = false
    selectedId = null
    await invalidateAll()
  }

  function openModal(action: RelAction) {
    modalAction = action
  }

  function closeModal() {
    modalAction = null
  }

  async function onRelationshipSuccess() {
    modalAction = null
    await invalidateAll()
  }

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
        <Badge variant="warm">
          {data.persons.length} {data.persons.length === 1 ? 'person' : 'people'}
          {#if unconnectedCount > 0}· {unconnectedCount} unconnected{/if}
        </Badge>
      {/if}
    </div>

    {#if data.persons.length > 0}
      <div class="toolbar-search">
        <div
          class="search-wrap"
          role="combobox"
          aria-expanded={searchOpen && (searchResults.length > 0 || searchQuery.trim().length >= 2)}
          aria-haspopup="listbox"
          aria-controls="search-listbox"
        >
          <Icon icon={Search} size={14} color="var(--color-text-secondary)" />
          <input
            class="search-input"
            type="search"
            placeholder="Search people…"
            bind:value={searchQuery}
            onfocus={() => searchOpen = true}
            onblur={() => setTimeout(() => { searchOpen = false }, 150)}
            onkeydown={(e) => {
              if (e.key === 'Escape') { searchQuery = ''; searchOpen = false }
            }}
            aria-label="Search family members"
            aria-autocomplete="list"
          />
        </div>
        {#if searchOpen && searchResults.length > 0}
          <ul id="search-listbox" class="search-dropdown" role="listbox" aria-label="Search results">
            {#each searchResults as p (p.id)}
              <li role="option" aria-selected={selectedId === p.id}>
                <button
                  type="button"
                  class="search-result"
                  class:is-selected={selectedId === p.id}
                  onclick={() => selectSearchResult(p.id)}
                >
                  <Avatar
                    person={{ given: p.first_name, family: p.last_name ?? '', status: p.is_living ? 'living' : 'deceased' }}
                    size={28}
                  />
                  <span class="result-name">{p.first_name}{p.last_name ? ' ' + p.last_name : ''}</span>
                  <Badge variant={p.is_living ? 'sage' : 'terra'} dot>{p.is_living ? 'Living' : 'Deceased'}</Badge>
                </button>
              </li>
            {/each}
          </ul>
        {:else if searchOpen && searchQuery.trim().length >= 2 && searchResults.length === 0}
          <div class="search-empty" role="status">
            No one found —
            <button type="button" class="search-add-link" onclick={() => goto(`/trees/${data.tree.id}/persons/new`)}>
              Add {searchQuery.trim()}?
            </button>
          </div>
        {/if}
      </div>
    {/if}

    <div class="toolbar-right">
      {#if data.persons.length > 0}
        <button
          class="view-toggle"
          class:active={listView}
          type="button"
          onclick={() => { listView = !listView }}
          aria-label={listView ? 'Switch to canvas view' : 'Switch to list view'}
          title={listView ? 'Canvas view' : 'List view'}
        >
          <Icon icon={List} size={16} color="currentColor" />
        </button>
      {/if}
      {#if data.userRole === 'owner'}
        <a
          class="view-toggle"
          href="/trees/{data.tree.id}/activity"
          aria-label="Activity log"
          title="Activity log"
        >
          <Icon icon={Activity} size={16} color="currentColor" />
        </a>
      {/if}
      {#if canEdit}
        <Button variant="secondary" size="sm" onclick={() => goto(`/trees/${data.tree.id}/persons/new`)}>
          {#snippet icon()}<Icon icon={Plus} size={16} color="currentColor" />{/snippet}
          Add person
        </Button>
      {/if}
    </div>
  </div>

  <!-- ── Canvas ── -->
  <div class="canvas-wrap">

    <div
      class="canvas"
      class:has-drawer={!!selectedId}
      class:has-staging={stagingOpen}
    >

      {#if data.persons.length === 0}
        <div class="empty" transition:fade={{ duration: dur, easing: cubicOut }}>
          <div class="empty-icon">
            <Icon icon={GitBranch} size={32} color="var(--color-warm-light)" />
          </div>
          <p class="empty-title">Begin with yourself.</p>
          <p class="empty-body">Add the first person to your tree and watch your family's story take shape.</p>
          {#if canEdit}
            <Button onclick={() => goto(`/trees/${data.tree.id}/persons/new`)}>
              {#snippet icon()}<Icon icon={Plus} size={16} color="currentColor" />{/snippet}
              Add a person
            </Button>
          {/if}
        </div>
      {:else if listView}
        <!-- Accessible list-view alternative -->
        <div class="list-view" role="list" aria-label="Family members">
          {#each data.persons as p (p.id)}
            {@const birthYear = formatDate(p.birth_date)}
            {@const deathYear = formatDate(p.death_date)}
            <a
              class="list-row"
              href="/trees/{data.tree.id}/persons/{p.id}"
            >
              <Avatar
                person={{ given: p.first_name, family: p.last_name ?? '', status: p.is_living ? 'living' : 'deceased' }}
                size={36}
              />
              <span class="list-name">{p.first_name}{p.last_name ? ' ' + p.last_name : ''}</span>
              {#if birthYear || deathYear}
                <span class="list-dates">
                  {p.is_living && birthYear ? `b. ${birthYear}` : birthYear && deathYear ? `${birthYear}–${deathYear}` : birthYear ? `b. ${birthYear}` : `d. ${deathYear}`}
                </span>
              {/if}
              <Badge variant={p.is_living ? 'sage' : 'terra'} dot>{p.is_living ? 'Living' : 'Deceased'}</Badge>
            </a>
          {/each}
        </div>
      {:else}
        <!-- Interactive tree canvas -->
        <TreeCanvas
          persons={data.persons}
          relationships={data.relationships}
          {selectedId}
          onNodeClick={handleNodeClick}
        />
      {/if}
    </div>

    <!-- ── Staging pull-tab (visible when tray is closed and unconnected persons exist) ── -->
    {#if unconnectedCount > 0 && !stagingOpen && !selectedId}
      <button
        class="staging-pull-tab"
        type="button"
        onclick={openStaging}
        aria-label="Open staging area — {unconnectedCount} {unconnectedCount === 1 ? 'person' : 'people'} waiting to connect"
        title="Waiting to connect"
      >
        <Icon icon={ChevronLeft} size={14} color="currentColor" />
        <span class="tab-count">{unconnectedCount}</span>
      </button>
    {/if}

    <!-- ── Staging tray (right panel — unconnected persons) ── -->
    {#if stagingOpen}
      <aside
        class="staging-tray"
        transition:fly={{ x: 220, duration: dur, easing: cubicOut }}
      >
        <div class="staging-head">
          <span class="panel-label">Waiting to connect</span>
          <button class="close" type="button" onclick={() => stagingOpen = false} aria-label="Close staging area">
            <Icon icon={ChevronRight} size={16} color="var(--color-text-secondary)" />
          </button>
        </div>
        <p class="staging-intro">Add a connection from their profile to place them on your tree.</p>
        <div class="staging-body">
          {#each unconnectedPersons as p (p.id)}
            <a class="staging-row" href="/trees/{data.tree.id}/persons/{p.id}">
              <Avatar
                person={{ given: p.first_name, family: p.last_name ?? '', status: p.is_living ? 'living' : 'deceased' }}
                size={32}
              />
              <span class="staging-name">{p.first_name}{p.last_name ? ' ' + p.last_name : ''}</span>
              <span class="unconnected-dot" title="Not yet on the tree" aria-label="Not yet on the tree"></span>
            </a>
          {/each}
        </div>
      </aside>
    {/if}

    <!-- ── Detail drawer ── -->
    {#if selected}
      {@const birthYear = formatDate(selected.birth_date)}
      {@const deathYear = formatDate(selected.death_date)}
      <aside
        class="drawer"
        transition:fly={{ x: 380, duration: dur, easing: cubicOut }}
      >
        <div class="drawer-head">
          <span class="panel-label">Quick view</span>
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
          <Button style="flex:1;justify-content:center" onclick={() => goto(`/trees/${data.tree.id}/persons/${selected.id}`)}>View profile</Button>
          {#if canEdit}
            <Button variant="secondary" onclick={() => goto(`/trees/${data.tree.id}/persons/${selected.id}#memories`)}>Add memory</Button>
          {/if}
        </div>

        {#if canEdit}
          <div class="drawer-connections">
            <span class="connections-label">Add connection</span>
            <div class="connections-grid">
              <button class="conn-btn" type="button" onclick={() => openModal('parent')}>+ Parent</button>
              <button class="conn-btn" type="button" onclick={() => openModal('child')}>+ Child</button>
              <button class="conn-btn" type="button" onclick={() => openModal('sibling')}>+ Sibling</button>
              <button class="conn-btn" type="button" onclick={() => openModal('partner')}>+ Partner</button>
            </div>
          </div>
        {/if}

        {#if canEdit && selectedConnections.length > 0}
          <div class="existing-connections">
            <span class="connections-label">Current connections</span>
            {#each selectedConnections as conn (conn.relId)}
              <div class="econn-row">
                {#if deletingRelId === conn.relId}
                  <div class="econn-confirm">
                    <span class="econn-confirm-text">Remove this connection?</span>
                    <button class="econn-cancel" type="button" onclick={() => deletingRelId = null} disabled={deleteRelLoading}>Cancel</button>
                    <button class="econn-ok" type="button" onclick={() => deleteRelationship(conn.relId)} disabled={deleteRelLoading}>Remove</button>
                  </div>
                {:else}
                  <Avatar
                    person={{ given: conn.other.first_name, family: conn.other.last_name ?? '', status: conn.other.is_living ? 'living' : 'deceased' }}
                    size={28}
                  />
                  <span class="econn-name">{conn.other.first_name}{conn.other.last_name ? ' ' + conn.other.last_name : ''}</span>
                  <span class="econn-label">{relLabel(conn.relType, conn.isPersonA)}</span>
                  <button class="econn-delete" type="button" onclick={() => deletingRelId = conn.relId} aria-label="Remove this connection">
                    <Icon icon={X} size={12} color="currentColor" />
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        {/if}

        {#if canEdit}
          <div class="remove-section">
            {#if deletingPerson}
              <p class="remove-confirm-text">Remove {selected?.first_name} from your tree? Their connections will be removed. Memories and media stay.</p>
              <div class="remove-confirm-actions">
                <button class="remove-cancel" type="button" onclick={() => deletingPerson = false} disabled={deletePersonLoading}>Cancel</button>
                <button class="remove-ok" type="button" onclick={deletePerson} disabled={deletePersonLoading}>Remove</button>
              </div>
            {:else}
              <button class="remove-btn" type="button" onclick={() => deletingPerson = true}>Remove from tree</button>
            {/if}
          </div>
        {/if}
      </aside>
    {/if}
  </div>

</div>

<!-- Relationship modal — rendered outside canvas-wrap to avoid stacking context issues -->
{#if selected && modalAction}
  <AddRelationshipModal
    open={modalOpen}
    treeId={data.tree.id}
    sourcePerson={selected}
    action={modalAction}
    allPersons={data.persons}
    {connectedIds}
    relationships={data.relationships}
    onclose={closeModal}
    onsuccess={onRelationshipSuccess}
  />
{/if}

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

  /* ── Canvas wrap ── */
  .canvas-wrap {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .canvas {
    position: absolute;
    inset: 0;
    background-color: var(--color-bg-page);
    transition: left var(--dur-base) var(--ease), right var(--dur-base) var(--ease);
  }

  .canvas.has-drawer { right: 380px; }
  .canvas.has-staging { right: 220px; }

  /* ── Staging pull-tab ── */
  .staging-pull-tab {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    width: 28px;
    padding: var(--space-3) 0;
    background: var(--color-bg-page);
    border: var(--border-default);
    border-right: none;
    border-radius: var(--radius-sm) 0 0 var(--radius-sm);
    cursor: pointer;
    color: var(--color-text-secondary);
    z-index: 5;
    transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
  }

  .staging-pull-tab:hover {
    background: var(--color-bg-surface-1);
    color: var(--color-text-primary);
  }

  .tab-count {
    font-family: var(--font-ui);
    font-size: 10px;
    font-weight: var(--font-weight-semibold);
    color: var(--color-gold);
    line-height: 1;
  }

  /* ── Staging tray (right panel) ── */
  .staging-tray {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 220px;
    background: var(--color-bg-page);
    border-left: var(--border-default);
    display: flex;
    flex-direction: column;
    z-index: 10;
  }

  .staging-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
    border-bottom: var(--border-subtle);
    flex-shrink: 0;
  }

  .staging-intro {
    font-family: var(--font-body);
    font-style: italic;
    font-size: var(--font-size-label);
    color: var(--color-text-secondary);
    line-height: var(--line-height-story);
    padding: var(--space-3) var(--space-4);
    margin: 0;
    border-bottom: var(--border-subtle);
  }

  .staging-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-2) 0;
  }

  .staging-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    text-decoration: none;
    color: inherit;
    transition: background var(--dur-fast) var(--ease);
  }

  .staging-row:hover {
    background: var(--color-bg-surface-1);
  }

  .staging-name {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .unconnected-dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    background: var(--color-gold);
    flex-shrink: 0;
  }

  /* ── Shared panel label ── */
  .panel-label {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

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

  /* ── View toggle button ── */
  .view-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: none;
    border: var(--border-default);
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
  }

  .view-toggle:hover {
    background: var(--color-bg-surface-1);
    color: var(--color-text-primary);
    border-color: var(--color-border-strong);
  }

  .view-toggle.active {
    background: var(--color-bg-surface-2);
    color: var(--color-text-primary);
    border-color: var(--color-border-strong);
  }

  /* ── List view (accessible alternative to canvas) ── */
  .list-view {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    padding: var(--space-4) var(--space-8);
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .list-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: var(--border-subtle);
    text-decoration: none;
    color: inherit;
    transition: background var(--dur-fast) var(--ease);
    border-radius: var(--radius-sm);
  }

  .list-row:hover {
    background: var(--color-bg-surface-1);
  }

  .list-name {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-body);
    color: var(--color-text-primary);
    flex: 1;
  }

  .list-dates {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    color: var(--color-text-secondary);
    flex-shrink: 0;
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
    z-index: 10;
  }

  .drawer-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-6);
    border-bottom: var(--border-subtle);
    flex-shrink: 0;
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

  /* ── Add connection section ── */
  .drawer-connections {
    padding: var(--space-6);
    border-top: var(--border-subtle);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .connections-label {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .connections-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
  }

  .conn-btn {
    padding: var(--space-2) var(--space-3);
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-sm);
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    cursor: pointer;
    text-align: center;
    transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
  }

  .conn-btn:hover {
    background: var(--color-bg-surface-2);
    border-color: var(--color-border-strong);
  }

  /* ── Existing connections section ── */
  .existing-connections {
    padding: var(--space-6);
    border-top: var(--border-subtle);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .econn-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-height: 36px;
  }

  .econn-name {
    flex: 1;
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .econn-label {
    font-family: var(--font-ui);
    font-size: 11px;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  .econn-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    background: none;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--color-text-tertiary);
    flex-shrink: 0;
    transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
  }

  .econn-delete:hover {
    background: var(--color-bg-surface-1);
    color: var(--color-terra);
  }

  .econn-confirm {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
  }

  .econn-confirm-text {
    flex: 1;
    font-family: var(--font-ui);
    font-size: 11px;
    color: var(--color-text-secondary);
  }

  .econn-cancel,
  .econn-ok {
    padding: 2px var(--space-2);
    font-family: var(--font-ui);
    font-size: 11px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease);
    flex-shrink: 0;
  }

  .econn-cancel {
    background: none;
    border: var(--border-default);
    color: var(--color-text-secondary);
  }

  .econn-cancel:hover { background: var(--color-bg-surface-1); }

  .econn-ok {
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    color: var(--color-terra);
  }

  .econn-ok:hover { background: var(--color-bg-surface-2); }

  /* ── Remove from tree ── */
  .remove-section {
    padding: var(--space-4) var(--space-6);
    border-top: var(--border-subtle);
  }

  .remove-btn {
    background: none;
    border: none;
    padding: 0;
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    color: var(--color-terra);
    cursor: pointer;
    opacity: 0.7;
    transition: opacity var(--dur-fast) var(--ease);
  }

  .remove-btn:hover { opacity: 1; }

  .remove-confirm-text {
    font-family: var(--font-body);
    font-style: italic;
    font-size: var(--font-size-label);
    color: var(--color-text-secondary);
    line-height: var(--line-height-story);
    margin: 0 0 var(--space-3);
  }

  .remove-confirm-actions {
    display: flex;
    gap: var(--space-2);
  }

  .remove-cancel,
  .remove-ok {
    padding: var(--space-1) var(--space-3);
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease);
  }

  .remove-cancel {
    background: none;
    border: var(--border-default);
    color: var(--color-text-secondary);
  }

  .remove-cancel:hover { background: var(--color-bg-surface-1); }

  .remove-ok {
    background: var(--color-bg-surface-1);
    border: 1px solid var(--color-terra);
    color: var(--color-terra);
  }

  .remove-ok:hover { background: var(--color-bg-surface-2); }

  /* ── Toolbar search ── */
  .toolbar-search {
    position: relative;
    flex: 1;
    max-width: 260px;
    min-width: 120px;
  }

  .search-wrap {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    height: 36px;
    padding: 0 var(--space-3);
    background: var(--color-bg-page);
    border: var(--border-subtle);
    border-radius: var(--radius-md);
    transition: border-color var(--dur-fast) var(--ease);
  }

  .search-wrap:focus-within {
    border-color: var(--color-border-strong);
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    color: var(--color-text-primary);
    min-width: 0;
  }

  .search-input::placeholder {
    color: var(--color-text-tertiary);
  }

  /* hide browser search clear button */
  .search-input::-webkit-search-cancel-button { display: none; }

  .search-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--color-bg-surface-1);
    border: var(--border-subtle);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-floating);
    max-height: 280px;
    overflow-y: auto;
    z-index: 50;
    list-style: none;
    margin: 0;
    padding: var(--space-1) 0;
  }

  .search-result {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2) var(--space-3);
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background var(--dur-fast) var(--ease);
  }

  .search-result:hover,
  .search-result.is-selected {
    background: var(--color-bg-surface-2);
  }

  .result-name {
    flex: 1;
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .search-empty {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--color-bg-surface-1);
    border: var(--border-subtle);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-floating);
    padding: var(--space-3) var(--space-4);
    z-index: 50;
    font-family: var(--font-body);
    font-style: italic;
    font-size: var(--font-size-label);
    color: var(--color-text-secondary);
  }

  .search-add-link {
    background: none;
    border: none;
    padding: 0;
    font-family: var(--font-body);
    font-style: italic;
    font-size: var(--font-size-label);
    color: var(--color-gold);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .search-add-link:hover {
    color: var(--color-text-primary);
  }
</style>
