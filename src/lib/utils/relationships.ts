export const PARENT_CHILD_TYPES = new Set(['parent_child', 'adopted_parent_child', 'step_parent_child'])
export const SIBLING_TYPES = new Set(['sibling', 'half_sibling', 'step_sibling'])

export type RelRow = { person_a_id: string; person_b_id: string; type: string }

/** Parents of personId, with the parent_child subtype used for each link. */
export function parentsOf(personId: string, relationships: RelRow[]): { id: string; type: string }[] {
  return relationships
    .filter((r) => PARENT_CHILD_TYPES.has(r.type) && r.person_b_id === personId)
    .map((r) => ({ id: r.person_a_id, type: r.type }))
}

/**
 * Infer siblings of personId from shared parent_child-family rows. A candidate is a
 * "Sibling" if they share every one of personId's known parents, otherwise "Half-sibling".
 * `relationships` must include parent_child rows for personId's parents' other children,
 * not just rows involving personId directly.
 */
export function inferredSiblingsOf(
  personId: string,
  relationships: RelRow[]
): { personId: string; label: 'Sibling' | 'Half-sibling' }[] {
  const parentIds = parentsOf(personId, relationships).map((p) => p.id)
  if (parentIds.length === 0) return []

  const sharedParentsByChild = new Map<string, Set<string>>()
  for (const r of relationships) {
    if (!PARENT_CHILD_TYPES.has(r.type)) continue
    if (!parentIds.includes(r.person_a_id)) continue
    if (r.person_b_id === personId) continue
    const set = sharedParentsByChild.get(r.person_b_id) ?? new Set<string>()
    set.add(r.person_a_id)
    sharedParentsByChild.set(r.person_b_id, set)
  }

  return Array.from(sharedParentsByChild.entries()).map(([childId, sharedParents]) => ({
    personId: childId,
    label: sharedParents.size === parentIds.length ? 'Sibling' : 'Half-sibling',
  }))
}

/** Children of personId (personId as parent), with the parent_child subtype used for each link. */
export function childrenOf(personId: string, relationships: RelRow[]): { id: string; type: string }[] {
  return relationships
    .filter((r) => PARENT_CHILD_TYPES.has(r.type) && r.person_a_id === personId)
    .map((r) => ({ id: r.person_b_id, type: r.type }))
}

/**
 * Smart default for the direct-descendant confirm step. Pre-selects "direct descendant"
 * only if lastName case/whitespace-insensitively matches an existing person in the tree
 * already marked is_direct_descendant = true. Pre-selection only — callers must still
 * require explicit confirmation.
 */
export function suggestsDirectDescendant(
  lastName: string | null,
  allPersons: { last_name: string | null; is_direct_descendant: boolean }[]
): boolean {
  const normalized = lastName?.trim().toLowerCase()
  if (!normalized) return false
  return allPersons.some(
    (p) => p.is_direct_descendant && p.last_name?.trim().toLowerCase() === normalized
  )
}
