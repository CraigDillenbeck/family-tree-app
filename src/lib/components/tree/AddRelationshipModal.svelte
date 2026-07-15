<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Icon from '$lib/components/ui/Icon.svelte'
  import { Plus, Search } from 'lucide-svelte'
  import { goto } from '$app/navigation'
  import { parentsOf, childrenOf, suggestsDirectDescendant, PARENT_CHILD_TYPES } from '$lib/utils/relationships'

  type CanvasPerson = {
    id: string
    first_name: string
    last_name: string | null
    birth_date: string | null
    death_date: string | null
    avatar_url: string | null
    is_living: boolean
    is_direct_descendant: boolean
  }

  type Action = 'parent' | 'child' | 'sibling' | 'spouse'
  type ParentChildSubtype = 'parent_child' | 'adopted_parent_child' | 'step_parent_child'
  type SiblingStep = 'select' | 'choose-parents' | 'add-parent-first'
  type DescentChoice = 'direct' | 'married_in'
  type ParentSubStep = 'select' | 'confirm-descent'
  type SpouseSubStep = 'select' | 'confirm-descent' | 'link-children'

  let {
    open,
    treeId,
    treeName,
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
    treeName: string
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
  let relationshipSubtype = $state<ParentChildSubtype>('parent_child')

  // Sibling wizard state — siblings are always connected via a shared parent link,
  // never a raw sibling row (see AddRelationshipModal sibling rework).
  let siblingStep = $state<SiblingStep>('select')
  let siblingTargetId = $state<string | null>(null)
  let siblingDraftName = $state<{ first_name: string; last_name: string | null } | null>(null)
  let selectedParentIds = $state<Set<string>>(new Set())
  let newParentQuery = $state('')
  let newParentSelected = $state<CanvasPerson | null>(null)
  let newParentDraftName = $state<{ first_name: string; last_name: string | null } | null>(null)
  let newParentSubtype = $state<ParentChildSubtype>('parent_child')
  let newParentId = $state<string | null>(null)
  let siblingLinkedToNewParent = $state(false)

  // Direct-descendant confirm step (parent + spouse flows) and spouse-implies-parent
  // bulk-link follow-up (spouse flow only).
  let parentSubStep = $state<ParentSubStep>('select')
  let spouseSubStep = $state<SpouseSubStep>('select')
  let descentChoice = $state<DescentChoice>('married_in')
  let pendingOtherId = $state<string | null>(null)
  let pendingDraftName = $state<{ first_name: string; last_name: string | null } | null>(null)
  let pendingOtherName = $state('')
  let spouseAnchorChildren = $state<CanvasPerson[]>([])
  let selectedChildIds = $state<Set<string>>(new Set())
  let childSubtypes = $state<Map<string, ParentChildSubtype>>(new Map())

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

  const anchorParentDetails = $derived(
    action === 'sibling'
      ? parentsOf(sourcePerson.id, relationships)
          .map(p => ({ id: p.id, type: p.type, person: allPersons.find(ap => ap.id === p.id) }))
          .filter((p): p is { id: string; type: string; person: CanvasPerson } => !!p.person)
      : []
  )

  const siblingTargetName = $derived(
    siblingTargetId
      ? allPersons.find(p => p.id === siblingTargetId)?.first_name ?? 'this person'
      : siblingDraftName?.first_name ?? 'this person'
  )

  const parentCandidates = $derived(
    action === 'sibling' && siblingStep === 'add-parent-first'
      ? allPersons
          .filter(p => p.id !== sourcePerson.id && p.id !== siblingTargetId)
          .filter(p => {
            if (!newParentQuery.trim()) return true
            const full = `${p.first_name} ${p.last_name ?? ''}`.toLowerCase()
            return full.includes(newParentQuery.toLowerCase().trim())
          })
      : []
  )

  const showNewParentCreateOption = $derived(
    newParentQuery.trim().length >= 2 &&
    !parentCandidates.some(p =>
      `${p.first_name}${p.last_name ? ' ' + p.last_name : ''}`.toLowerCase() === newParentQuery.toLowerCase().trim()
    )
  )

  const canConfirmAddParentFirst = $derived(!!newParentSelected || !!newParentDraftName)

  function formatBirth(p: CanvasPerson): string | null {
    if (!p.birth_date) return null
    return `b. ${new Date(p.birth_date + 'T00:00:00').getFullYear()}`
  }

  function parseName(raw: string): { first_name: string; last_name: string | null } {
    const parts = raw.trim().split(/\s+/)
    return { first_name: parts[0], last_name: parts.slice(1).join(' ') || null }
  }

  function subtypeLabel(type: string): string {
    switch (type) {
      case 'adopted_parent_child': return 'Adoptive'
      case 'step_parent_child': return 'Step'
      default: return 'Biological'
    }
  }

  function buildRelPayload(otherId: string): { person_a_id: string; person_b_id: string; type: string } {
    switch (action) {
      case 'parent':
        return { person_a_id: otherId, person_b_id: sourcePerson.id, type: relationshipSubtype }
      case 'child':
        return { person_a_id: sourcePerson.id, person_b_id: otherId, type: relationshipSubtype }
      case 'spouse':
        return { person_a_id: sourcePerson.id, person_b_id: otherId, type: 'spouse' }
      case 'sibling':
        throw new Error('sibling relationships are built via the sibling wizard, not buildRelPayload')
    }
  }

  async function postRelationship(payload: { person_a_id: string; person_b_id: string; type: string }) {
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

  async function postPerson(first_name: string, last_name: string | null, isDirectDescendant?: boolean): Promise<string> {
    const res = await fetch(`/api/trees/${treeId}/persons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name, last_name, is_direct_descendant: isDirectDescendant }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error ?? 'Could not create person.')
    }
    const newPerson = await res.json() as { id: string }
    return newPerson.id
  }

  async function patchPersonDescent(personId: string, isDirectDescendant: boolean) {
    const res = await fetch(`/api/trees/${treeId}/persons`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId, is_direct_descendant: isDirectDescendant }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error ?? 'Could not update person.')
    }
  }

  async function createRelationship(otherId: string) {
    await postRelationship(buildRelPayload(otherId))
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
      const { first_name, last_name } = parseName(query)
      const newPersonId = await postPerson(first_name, last_name)
      await createRelationship(newPersonId)
      handleClose()
      onsuccess()
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Something went wrong.'
    } finally {
      submitting = false
    }
  }

  function beginDescentConfirm() {
    errorMsg = null
    if (selectedPerson) {
      pendingOtherId = selectedPerson.id
      pendingDraftName = null
      pendingOtherName = `${selectedPerson.first_name}${selectedPerson.last_name ? ' ' + selectedPerson.last_name : ''}`
      descentChoice = selectedPerson.is_direct_descendant ? 'direct' : 'married_in'
    } else if (query.trim()) {
      pendingOtherId = null
      pendingDraftName = parseName(query)
      pendingOtherName = `${pendingDraftName.first_name}${pendingDraftName.last_name ? ' ' + pendingDraftName.last_name : ''}`
      descentChoice = suggestsDirectDescendant(pendingDraftName.last_name, allPersons) ? 'direct' : 'married_in'
    } else {
      return
    }
    if (action === 'parent') parentSubStep = 'confirm-descent'
    else spouseSubStep = 'confirm-descent'
  }

  function handleDescentBack() {
    errorMsg = null
    parentSubStep = 'select'
    spouseSubStep = 'select'
  }

  async function confirmDescentAndConnect() {
    if (submitting) return
    submitting = true
    errorMsg = null
    try {
      const isDirect = descentChoice === 'direct'
      let otherId: string
      if (pendingOtherId) {
        await patchPersonDescent(pendingOtherId, isDirect)
        otherId = pendingOtherId
      } else {
        otherId = await postPerson(pendingDraftName!.first_name, pendingDraftName!.last_name, isDirect)
      }
      await createRelationship(otherId)

      if (action === 'spouse') {
        const candidates = childrenOf(sourcePerson.id, relationships)
          .map(c => allPersons.find(p => p.id === c.id))
          .filter((p): p is CanvasPerson => !!p)
          .filter(p => !relationships.some(r =>
            PARENT_CHILD_TYPES.has(r.type) && r.person_a_id === otherId && r.person_b_id === p.id
          ))
        if (candidates.length > 0) {
          spouseAnchorChildren = candidates
          selectedChildIds = new Set(candidates.map(c => c.id))
          childSubtypes = new Map(candidates.map(c => [c.id, 'parent_child' as ParentChildSubtype]))
          pendingOtherId = otherId
          spouseSubStep = 'link-children'
          return
        }
      }
      handleClose()
      onsuccess()
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Something went wrong.'
    } finally {
      submitting = false
    }
  }

  function toggleChild(id: string) {
    const next = new Set(selectedChildIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selectedChildIds = next
  }

  function setChildSubtype(id: string, type: ParentChildSubtype) {
    const next = new Map(childSubtypes)
    next.set(id, type)
    childSubtypes = next
  }

  async function confirmChildLinking() {
    if (submitting) return
    submitting = true
    errorMsg = null
    try {
      for (const childId of selectedChildIds) {
        await postRelationship({
          person_a_id: pendingOtherId!,
          person_b_id: childId,
          type: childSubtypes.get(childId) ?? 'parent_child',
        })
      }
      handleClose()
      onsuccess()
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Something went wrong.'
    } finally {
      submitting = false
    }
  }

  function skipChildLinking() {
    handleClose()
    onsuccess()
  }

  function advanceSiblingStep() {
    errorMsg = null
    if (anchorParentDetails.length > 0) {
      siblingStep = 'choose-parents'
      selectedParentIds = new Set(anchorParentDetails.map(p => p.id))
    } else {
      siblingStep = 'add-parent-first'
    }
  }

  function chooseSiblingTarget(p: CanvasPerson) {
    if (submitting) return
    siblingTargetId = p.id
    siblingDraftName = null
    advanceSiblingStep()
  }

  function chooseSiblingDraftName() {
    if (!query.trim() || submitting) return
    siblingTargetId = null
    siblingDraftName = parseName(query)
    advanceSiblingStep()
  }

  function handleSiblingBack() {
    errorMsg = null
    siblingStep = 'select'
    siblingTargetId = null
    siblingDraftName = null
    selectedParentIds = new Set()
    newParentQuery = ''
    newParentSelected = null
    newParentDraftName = null
    newParentSubtype = 'parent_child'
    newParentId = null
    siblingLinkedToNewParent = false
  }

  function toggleParent(id: string) {
    const next = new Set(selectedParentIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selectedParentIds = next
  }

  async function confirmChooseParents() {
    if (selectedParentIds.size === 0 || submitting) return
    submitting = true
    errorMsg = null
    try {
      if (!siblingTargetId) {
        siblingTargetId = await postPerson(siblingDraftName!.first_name, siblingDraftName!.last_name)
        siblingDraftName = null
      }
      for (const parent of anchorParentDetails) {
        if (!selectedParentIds.has(parent.id)) continue
        await postRelationship({ person_a_id: parent.id, person_b_id: siblingTargetId, type: parent.type })
        const next = new Set(selectedParentIds)
        next.delete(parent.id)
        selectedParentIds = next
      }
      handleClose()
      onsuccess()
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Something went wrong.'
    } finally {
      submitting = false
    }
  }

  async function confirmAddParentFirst() {
    if (!canConfirmAddParentFirst || submitting) return
    submitting = true
    errorMsg = null
    try {
      if (!newParentId) {
        newParentId = newParentSelected
          ? newParentSelected.id
          : await postPerson(newParentDraftName!.first_name, newParentDraftName!.last_name)
      }
      if (!siblingTargetId) {
        siblingTargetId = await postPerson(siblingDraftName!.first_name, siblingDraftName!.last_name)
        siblingDraftName = null
      }
      if (!siblingLinkedToNewParent) {
        await postRelationship({ person_a_id: newParentId, person_b_id: siblingTargetId, type: newParentSubtype })
        siblingLinkedToNewParent = true
      }
      await postRelationship({ person_a_id: newParentId, person_b_id: sourcePerson.id, type: newParentSubtype })
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
    siblingStep = 'select'
    siblingTargetId = null
    siblingDraftName = null
    selectedParentIds = new Set()
    newParentQuery = ''
    newParentSelected = null
    newParentDraftName = null
    newParentSubtype = 'parent_child'
    newParentId = null
    siblingLinkedToNewParent = false
    parentSubStep = 'select'
    spouseSubStep = 'select'
    descentChoice = 'married_in'
    pendingOtherId = null
    pendingDraftName = null
    pendingOtherName = ''
    spouseAnchorChildren = []
    selectedChildIds = new Set()
    childSubtypes = new Map()
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
      {:else if action === 'sibling' && siblingStep === 'choose-parents'}
        <p class="step-heading">Which of {sourcePerson.first_name}'s parents does {siblingTargetName} share?</p>
        {#if errorMsg}
          <p class="error">{errorMsg}</p>
        {/if}
        <ul class="checkbox-list">
          {#each anchorParentDetails as p (p.id)}
            <li>
              <label class="checkbox-row">
                <input
                  type="checkbox"
                  checked={selectedParentIds.has(p.id)}
                  onchange={() => toggleParent(p.id)}
                />
                <Avatar
                  person={{ given: p.person.first_name, family: p.person.last_name ?? '', status: p.person.is_living ? 'living' : 'deceased' }}
                  size={36}
                />
                <span class="person-info">
                  <span class="person-name">{p.person.first_name}{p.person.last_name ? ' ' + p.person.last_name : ''}</span>
                  <span class="person-meta">{subtypeLabel(p.type)}</span>
                </span>
              </label>
            </li>
          {/each}
        </ul>
      {:else if action === 'sibling' && siblingStep === 'add-parent-first'}
        <div class="spouse-notice">
          <p class="spouse-notice-heading">To connect siblings, add a parent for {sourcePerson.first_name} first.</p>
          <p class="spouse-notice-body">{siblingTargetName} will be connected as a child of this parent too.</p>
        </div>

        {#if errorMsg}
          <p class="error">{errorMsg}</p>
        {/if}

        <div class="search-wrap">
          <Icon icon={Search} size={16} color="var(--color-text-secondary)" />
          <input
            class="search"
            type="text"
            placeholder="Search by name or add someone new…"
            bind:value={newParentQuery}
            oninput={() => { newParentSelected = null; newParentDraftName = null; errorMsg = null }}
            autocomplete="off"
            spellcheck="false"
          />
        </div>

        <div class="subtype-picker" role="group" aria-label="Relationship type">
          <button
            class="subtype-btn"
            class:active={newParentSubtype === 'parent_child'}
            type="button"
            onclick={() => newParentSubtype = 'parent_child'}
          >Biological</button>
          <button
            class="subtype-btn"
            class:active={newParentSubtype === 'adopted_parent_child'}
            type="button"
            onclick={() => newParentSubtype = 'adopted_parent_child'}
          >Adoptive</button>
          <button
            class="subtype-btn"
            class:active={newParentSubtype === 'step_parent_child'}
            type="button"
            onclick={() => newParentSubtype = 'step_parent_child'}
          >Step</button>
        </div>

        <ul class="list" role="listbox" aria-label="People in this tree">
          {#each parentCandidates as p (p.id)}
            {@const birth = formatBirth(p)}
            {@const isSelected = newParentSelected?.id === p.id}
            <li>
              <button
                class="person-row"
                class:selected={isSelected}
                role="option"
                aria-selected={isSelected}
                type="button"
                onclick={() => { newParentSelected = isSelected ? null : p; newParentDraftName = null }}
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
              </button>
            </li>
          {/each}

          {#if showNewParentCreateOption}
            <li>
              <button
                class="person-row create-row"
                class:selected={!!newParentDraftName}
                type="button"
                onclick={() => { newParentDraftName = parseName(newParentQuery); newParentSelected = null }}
              >
                <span class="create-icon">
                  <Icon icon={Plus} size={16} color="var(--color-gold)" />
                </span>
                <span class="person-info">
                  <span class="person-name">Create "{newParentQuery.trim()}" as a new parent</span>
                  <span class="person-meta">Add to tree and connect</span>
                </span>
              </button>
            </li>
          {/if}

          {#if parentCandidates.length === 0 && !showNewParentCreateOption}
            <li class="empty-state">
              <p>No people found. Type a name above to add someone new.</p>
            </li>
          {/if}
        </ul>
      {:else if (action === 'parent' && parentSubStep === 'confirm-descent') || (action === 'spouse' && spouseSubStep === 'confirm-descent')}
        <p class="step-heading">Is {pendingOtherName} a direct descendant of {treeName}, or did they marry in?</p>
        {#if errorMsg}
          <p class="error">{errorMsg}</p>
        {/if}
        <div class="subtype-picker" role="group" aria-label="Descent">
          <button
            class="subtype-btn"
            class:active={descentChoice === 'direct'}
            type="button"
            onclick={() => descentChoice = 'direct'}
          >Direct descendant</button>
          <button
            class="subtype-btn"
            class:active={descentChoice === 'married_in'}
            type="button"
            onclick={() => descentChoice = 'married_in'}
          >Married in</button>
        </div>
        <p class="subtype-hint">This tracks {pendingOtherName} as part of {treeName}'s own bloodline, or as someone who joined the family by marriage.</p>
      {:else if action === 'spouse' && spouseSubStep === 'link-children'}
        <p class="step-heading">Add {pendingOtherName.split(' ')[0]} as a parent to {sourcePerson.first_name}'s children too?</p>
        {#if errorMsg}
          <p class="error">{errorMsg}</p>
        {/if}
        <ul class="checkbox-list">
          {#each spouseAnchorChildren as c (c.id)}
            <li class="child-link-row">
              <label class="checkbox-row">
                <input
                  type="checkbox"
                  checked={selectedChildIds.has(c.id)}
                  onchange={() => toggleChild(c.id)}
                />
                <Avatar
                  person={{ given: c.first_name, family: c.last_name ?? '', status: c.is_living ? 'living' : 'deceased' }}
                  size={36}
                />
                <span class="person-info">
                  <span class="person-name">{c.first_name}{c.last_name ? ' ' + c.last_name : ''}</span>
                </span>
              </label>
              <div class="subtype-picker" role="group" aria-label="Relationship type for {c.first_name}">
                <button
                  class="subtype-btn"
                  class:active={childSubtypes.get(c.id) === 'parent_child'}
                  type="button"
                  onclick={() => setChildSubtype(c.id, 'parent_child')}
                >Biological</button>
                <button
                  class="subtype-btn"
                  class:active={childSubtypes.get(c.id) === 'adopted_parent_child'}
                  type="button"
                  onclick={() => setChildSubtype(c.id, 'adopted_parent_child')}
                >Adoptive</button>
                <button
                  class="subtype-btn"
                  class:active={childSubtypes.get(c.id) === 'step_parent_child'}
                  type="button"
                  onclick={() => setChildSubtype(c.id, 'step_parent_child')}
                >Step</button>
              </div>
            </li>
          {/each}
        </ul>
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
                onclick={() => action === 'sibling' ? chooseSiblingTarget(p) : selectPerson(p)}
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
                onclick={() => action === 'sibling'
                  ? chooseSiblingDraftName()
                  : (action === 'parent' || action === 'spouse') ? beginDescentConfirm() : handleCreateNew()}
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
    {:else if action === 'sibling' && siblingStep === 'choose-parents'}
      <Button variant="ghost" onclick={handleSiblingBack} disabled={submitting}>Back</Button>
      <Button onclick={confirmChooseParents} disabled={selectedParentIds.size === 0 || submitting}>
        {submitting ? 'Saving…' : 'Add sibling'}
      </Button>
    {:else if action === 'sibling' && siblingStep === 'add-parent-first'}
      <Button variant="ghost" onclick={handleSiblingBack} disabled={submitting}>Back</Button>
      <Button onclick={confirmAddParentFirst} disabled={!canConfirmAddParentFirst || submitting}>
        {submitting ? 'Saving…' : 'Add parent & connect siblings'}
      </Button>
    {:else if action === 'sibling'}
      <Button variant="ghost" onclick={handleClose} disabled={submitting}>Cancel</Button>
    {:else if (action === 'parent' && parentSubStep === 'confirm-descent') || (action === 'spouse' && spouseSubStep === 'confirm-descent')}
      <Button variant="ghost" onclick={handleDescentBack} disabled={submitting}>Back</Button>
      <Button onclick={confirmDescentAndConnect} disabled={submitting}>
        {submitting ? 'Saving…' : `Add ${actionLabel[action]}`}
      </Button>
    {:else if action === 'spouse' && spouseSubStep === 'link-children'}
      <Button variant="ghost" onclick={skipChildLinking} disabled={submitting}>Skip</Button>
      <Button onclick={confirmChildLinking} disabled={submitting}>
        {submitting ? 'Saving…' : 'Link selected children'}
      </Button>
    {:else}
      <Button variant="ghost" onclick={handleClose} disabled={submitting}>Cancel</Button>
      <Button
        onclick={(action === 'parent' || action === 'spouse') ? beginDescentConfirm : handleConnectExisting}
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

  .step-heading {
    font-family: var(--font-ui);
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin: 0;
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

  .list,
  .checkbox-list {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 320px;
    overflow-y: auto;
    border: var(--border-subtle);
    border-radius: var(--radius-sm);
  }

  .person-row,
  .checkbox-row {
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

  .checkbox-row {
    font: inherit;
  }

  .child-link-row {
    display: flex;
    flex-direction: column;
    padding: var(--space-3) var(--space-4);
    border-bottom: var(--border-subtle);
  }

  .child-link-row:last-child {
    border-bottom: none;
  }

  .child-link-row .checkbox-row {
    padding: 0;
    border-bottom: none;
  }

  .child-link-row .subtype-picker {
    margin-top: var(--space-2);
    margin-left: calc(36px + var(--space-3));
  }

  .person-row:last-child,
  .checkbox-row:last-child {
    border-bottom: none;
  }

  .person-row:hover,
  .checkbox-row:hover {
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
