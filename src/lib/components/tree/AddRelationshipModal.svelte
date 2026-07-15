<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Icon from '$lib/components/ui/Icon.svelte'
  import { Plus, Search } from 'lucide-svelte'
  import { goto } from '$app/navigation'

  type CanvasPerson = {
    id: string
    first_name: string
    last_name: string | null
    birth_date: string | null
    death_date: string | null
    avatar_url: string | null
    is_living: boolean
  }

  type Action = 'parent' | 'child' | 'sibling' | 'spouse'

  let {
    open,
    treeId,
    sourcePerson,
    action,
    allPersons,
    connectedIds,
    relationships = [],
    onclose,
    onsuccess,
  }: {
    open: boolean
    treeId: string
    sourcePerson: { id: string; first_name: string; last_name: string | null }
    action: Action
    allPersons: CanvasPerson[]
    connectedIds: Set<string>
    relationships?: { person_a_id: string; person_b_id: string; type: string }[]
    onclose: () => void
    onsuccess: () => void
  } = $props()

  let query = $state('')
  let selectedPerson = $state<CanvasPerson | null>(null)
  let submitting = $state(false)
  let errorMsg = $state<string | null>(null)
  let relationshipSubtype = $state<'parent_child' | 'adopted_parent_child' | 'step_parent_child'>('parent_child')

  const actionLabel: Record<Action, string> = {
    parent: 'parent',
    child: 'child',
    sibling: 'sibling',
    spouse: 'spouse',
  }

  const title = $derived(
    `Add a ${actionLabel[action]} for ${sourcePerson.first_name}${sourcePerson.last_name ? ' ' + sourcePerson.last_name : ''}`
  )

  const candidates = $derived(
    allPersons
      .filter(p => p.id !== sourcePerson.id)
      .filter(p => {
        if (!query.trim()) return true
        const full = `${p.first_name} ${p.last_name ?? ''}`.toLowerCase()
        return full.includes(query.toLowerCase().trim())
      })
      .sort((a, b) => {
        // Unconnected persons surface first
        const aConn = connectedIds.has(a.id) ? 1 : 0
        const bConn = connectedIds.has(b.id) ? 1 : 0
        return aConn - bConn
      })
  )

  const showCreateOption = $derived(
    query.trim().length >= 2 &&
    !candidates.some(p =>
      `${p.first_name}${p.last_name ? ' ' + p.last_name : ''}`.toLowerCase() === query.toLowerCase().trim()
    )
  )

  const existingSpouse = $derived(
    action === 'spouse'
      ? relationships.find(r =>
          r.type === 'spouse' &&
          (r.person_a_id === sourcePerson.id || r.person_b_id === sourcePerson.id)
        )
      : undefined
  )

  function formatBirth(p: CanvasPerson): string | null {
    if (!p.birth_date) return null
    return `b. ${new Date(p.birth_date + 'T00:00:00').getFullYear()}`
  }

  function buildRelPayload(otherId: string): { person_a_id: string; person_b_id: string; type: string } {
    switch (action) {
      case 'parent':
        return { person_a_id: otherId, person_b_id: sourcePerson.id, type: relationshipSubtype }
      case 'child':
        return { person_a_id: sourcePerson.id, person_b_id: otherId, type: relationshipSubtype }
      case 'sibling':
        return { person_a_id: sourcePerson.id, person_b_id: otherId, type: 'sibling' }
      case 'spouse':
        return { person_a_id: sourcePerson.id, person_b_id: otherId, type: 'spouse' }
    }
  }

  async function createRelationship(otherId: string) {
    const payload = buildRelPayload(otherId)
    const res = await fetch(`/api/trees/${treeId}/relationships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error ?? 'Could not create relationship.')
    }
  }

  async function handleConnectExisting() {
    if (!selectedPerson || submitting) return
    submitting = true
    errorMsg = null
    try {
      await createRelationship(selectedPerson.id)
      handleClose()
      onsuccess()
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Something went wrong.'
    } finally {
      submitting = false
    }
  }

  async function handleCreateNew() {
    if (!query.trim() || submitting) return
    submitting = true
    errorMsg = null
    try {
      const parts = query.trim().split(/\s+/)
      const first_name = parts[0]
      const last_name = parts.slice(1).join(' ') || null

      const personRes = await fetch(`/api/trees/${treeId}/persons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name, last_name }),
      })
      if (!personRes.ok) {
        const data = await personRes.json()
        throw new Error(data.error ?? 'Could not create person.')
      }
      const newPerson = await personRes.json() as { id: string }
      await createRelationship(newPerson.id)
      handleClose()
      onsuccess()
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Something went wrong.'
    } finally {
      submitting = false
    }
  }

  function handleClose() {
    query = ''
    selectedPerson = null
    errorMsg = null
    relationshipSubtype = 'parent_child'
    onclose()
  }

  function selectPerson(p: CanvasPerson) {
    selectedPerson = selectedPerson?.id === p.id ? null : p
  }

  function goToProfile() {
    handleClose()
    goto(`/trees/${treeId}/persons/${sourcePerson.id}`)
  }
</script>

<Modal {open} {title} variant="standard" onclose={handleClose}>
  {#snippet children()}
    <div class="modal-body">
      {#if existingSpouse}
        <div class="spouse-notice">
          <p class="spouse-notice-heading">{sourcePerson.first_name} already has a spouse in this tree.</p>
          <p class="spouse-notice-body">To update their relationship or record additional history, visit their profile page.</p>
        </div>
      {:else}
        <div class="search-wrap">
          <Icon icon={Search} size={16} color="var(--color-text-secondary)" />
          <input
            class="search"
            type="text"
            placeholder="Search by name or add someone new…"
            bind:value={query}
            oninput={() => { selectedPerson = null; errorMsg = null }}
            autocomplete="off"
            spellcheck="false"
          />
        </div>

        {#if action === 'parent' || action === 'child'}
          <div class="subtype-picker" role="group" aria-label="Relationship type">
            <button
              class="subtype-btn"
              class:active={relationshipSubtype === 'parent_child'}
              type="button"
              onclick={() => relationshipSubtype = 'parent_child'}
            >Biological</button>
            <button
              class="subtype-btn"
              class:active={relationshipSubtype === 'adopted_parent_child'}
              type="button"
              onclick={() => relationshipSubtype = 'adopted_parent_child'}
            >Adoptive</button>
            <button
              class="subtype-btn"
              class:active={relationshipSubtype === 'step_parent_child'}
              type="button"
              onclick={() => relationshipSubtype = 'step_parent_child'}
            >Step</button>
          </div>
          <p class="subtype-hint">Biological lines trace direct descent on your tree. Step and adoptive relationships are shown with distinct line styles.</p>
        {/if}

        {#if errorMsg}
          <p class="error">{errorMsg}</p>
        {/if}

        <ul class="list" role="listbox" aria-label="People in this tree">
          {#each candidates as p (p.id)}
            {@const birth = formatBirth(p)}
            {@const isSelected = selectedPerson?.id === p.id}
            {@const isUnconnected = !connectedIds.has(p.id)}
            <li>
              <button
                class="person-row"
                class:selected={isSelected}
                role="option"
                aria-selected={isSelected}
                type="button"
                onclick={() => selectPerson(p)}
              >
                <Avatar
                  person={{ given: p.first_name, family: p.last_name ?? '', status: p.is_living ? 'living' : 'deceased' }}
                  size={36}
                />
                <span class="person-info">
                  <span class="person-name">{p.first_name}{p.last_name ? ' ' + p.last_name : ''}</span>
                  {#if birth}
                    <span class="person-meta">{birth}</span>
                  {/if}
                </span>
                {#if isUnconnected}
                  <span class="unconnected-tag">Not yet connected</span>
                {/if}
              </button>
            </li>
          {/each}

          {#if showCreateOption}
            <li>
              <button
                class="person-row create-row"
                type="button"
                onclick={handleCreateNew}
                disabled={submitting}
              >
                <span class="create-icon">
                  <Icon icon={Plus} size={16} color="var(--color-gold)" />
                </span>
                <span class="person-info">
                  <span class="person-name">Create "{query.trim()}" as a new {actionLabel[action]}</span>
                  <span class="person-meta">Add to tree and connect</span>
                </span>
              </button>
            </li>
          {/if}

          {#if candidates.length === 0 && !showCreateOption}
            <li class="empty-state">
              <p>No people found. Type a name above to add someone new.</p>
            </li>
          {/if}
        </ul>
      {/if}
    </div>
  {/snippet}

  {#snippet footer()}
    {#if existingSpouse}
      <Button variant="ghost" onclick={handleClose}>Cancel</Button>
      <Button onclick={goToProfile}>Go to profile</Button>
    {:else}
      <Button variant="ghost" onclick={handleClose} disabled={submitting}>Cancel</Button>
      <Button
        onclick={handleConnectExisting}
        disabled={!selectedPerson || submitting}
      >
        {submitting ? 'Saving…' : `Add ${actionLabel[action]}`}
      </Button>
    {/if}
  {/snippet}
</Modal>

<style>
  .modal-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .search-wrap {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 0 var(--space-3);
    border: var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--color-bg-surface-1);
    transition: border-color var(--dur-fast) var(--ease);
  }

  .search-wrap:focus-within {
    border-color: var(--color-border-strong);
  }

  .search {
    flex: 1;
    border: none;
    background: none;
    font-family: var(--font-ui);
    font-size: var(--font-size-body);
    color: var(--color-text-primary);
    padding: var(--space-3) 0;
    outline: none;
  }

  .search::placeholder {
    color: var(--color-text-placeholder);
  }

  .error {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    color: var(--color-terra);
    margin: 0;
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 320px;
    overflow-y: auto;
    border: var(--border-subtle);
    border-radius: var(--radius-sm);
  }

  .person-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: none;
    border: none;
    border-bottom: var(--border-subtle);
    cursor: pointer;
    text-align: left;
    transition: background var(--dur-fast) var(--ease);
  }

  .person-row:last-child {
    border-bottom: none;
  }

  .person-row:hover {
    background: var(--color-bg-surface-1);
  }

  .person-row.selected {
    background: var(--color-bg-surface-2);
  }

  .person-row:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .person-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .person-name {
    font-family: var(--font-ui);
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .person-meta {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    color: var(--color-text-secondary);
  }

  .unconnected-tag {
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: var(--font-weight-medium);
    color: var(--color-gold);
    background: color-mix(in srgb, var(--color-gold) 10%, transparent);
    padding: 2px 6px;
    border-radius: var(--radius-full);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .create-row {
    border-top: var(--border-default);
  }

  .create-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: color-mix(in srgb, var(--color-gold) 10%, transparent);
    border-radius: var(--radius-full);
    flex-shrink: 0;
  }

  .empty-state {
    padding: var(--space-6) var(--space-4);
    text-align: center;
  }

  .empty-state p {
    font-family: var(--font-body);
    font-style: italic;
    font-size: var(--font-size-body-story);
    color: var(--color-text-secondary);
    margin: 0;
  }

  .subtype-picker {
    display: flex;
    border: var(--border-default);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .subtype-btn {
    flex: 1;
    padding: var(--space-2) var(--space-3);
    background: none;
    border: none;
    border-right: var(--border-default);
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
  }

  .subtype-btn:last-child {
    border-right: none;
  }

  .subtype-btn:hover {
    background: var(--color-bg-surface-1);
    color: var(--color-text-primary);
  }

  .subtype-btn.active {
    background: var(--color-bg-surface-2);
    color: var(--color-text-primary);
  }

  .subtype-hint {
    font-family: var(--font-body);
    font-style: italic;
    font-size: 14px;
    color: var(--color-text-secondary);
    line-height: 1.7;
    margin: 0;
  }

  .spouse-notice {
    padding: var(--space-6) var(--space-4);
    background: color-mix(in srgb, var(--color-gold) 8%, var(--color-bg-page));
    border: 1px solid color-mix(in srgb, var(--color-gold) 30%, transparent);
    border-radius: var(--radius-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .spouse-notice-heading {
    font-family: var(--font-ui);
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin: 0;
  }

  .spouse-notice-body {
    font-family: var(--font-body);
    font-style: italic;
    font-size: var(--font-size-body-story);
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.7;
  }
</style>
