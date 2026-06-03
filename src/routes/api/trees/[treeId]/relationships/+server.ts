import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { logActivity } from '$lib/utils/activity'

const VALID_TYPES = [
  'parent_child', 'adopted_parent_child', 'step_parent_child',
  'spouse', 'divorced', 'partner',
  'sibling', 'half_sibling', 'step_sibling',
]
const SYMMETRIC_TYPES = ['spouse', 'divorced', 'partner', 'sibling', 'half_sibling', 'step_sibling']

export const POST: RequestHandler = async ({ request, params, locals: { supabase, safeGetSession } }) => {
  const { user } = await safeGetSession()
  if (!user) return json({ error: 'Not authenticated.' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!profile) return json({ error: 'Profile not found.' }, { status: 401 })

  // Permission: must be owner or editor
  const { data: tree } = await supabase
    .from('trees')
    .select('owner_id')
    .eq('id', params.treeId)
    .single()
  if (!tree) return json({ error: 'Tree not found.' }, { status: 404 })

  if (tree.owner_id !== profile.id) {
    const { data: collab } = await supabase
      .from('tree_collaborators')
      .select('role')
      .eq('tree_id', params.treeId)
      .eq('profile_id', profile.id)
      .single()
    if (!collab || collab.role !== 'editor') {
      return json({ error: 'You do not have permission to edit this tree.' }, { status: 403 })
    }
  }

  const body = await request.json() as { person_a_id?: string; person_b_id?: string; type?: string }
  const { person_a_id, person_b_id, type } = body

  if (!person_a_id || !person_b_id || !type) {
    return json({ error: 'person_a_id, person_b_id, and type are required.' }, { status: 400 })
  }
  if (person_a_id === person_b_id) {
    return json({ error: 'A person cannot have a relationship with themselves.' }, { status: 400 })
  }
  if (!VALID_TYPES.includes(type)) {
    return json({ error: `Invalid relationship type: ${type}` }, { status: 400 })
  }

  type RelType = 'parent_child' | 'adopted_parent_child' | 'step_parent_child' | 'spouse' | 'divorced' | 'partner' | 'sibling' | 'half_sibling' | 'step_sibling'
  const relType = type as RelType

  // Both persons must exist in this tree
  const { data: persons } = await supabase
    .from('persons')
    .select('id')
    .eq('tree_id', params.treeId)
    .in('id', [person_a_id, person_b_id])
  if (!persons || persons.length < 2) {
    return json({ error: 'One or both persons not found in this tree.' }, { status: 400 })
  }

  // Duplicate check (order-insensitive for symmetric types)
  let dupQuery = supabase
    .from('relationships')
    .select('id')
    .eq('tree_id', params.treeId)
    .eq('type', relType)

  if (SYMMETRIC_TYPES.includes(type)) {
    dupQuery = dupQuery.or(
      `and(person_a_id.eq.${person_a_id},person_b_id.eq.${person_b_id}),and(person_a_id.eq.${person_b_id},person_b_id.eq.${person_a_id})`
    )
  } else {
    dupQuery = dupQuery.eq('person_a_id', person_a_id).eq('person_b_id', person_b_id)
  }

  const { data: dup } = await dupQuery.maybeSingle()
  if (dup) return json({ error: 'This relationship already exists.' }, { status: 409 })

  const { data: rel, error: insertErr } = await supabase
    .from('relationships')
    .insert({ tree_id: params.treeId, person_a_id, person_b_id, type: relType, is_current: true })
    .select('id, person_a_id, person_b_id, type, is_current')
    .single()

  if (insertErr || !rel) {
    return json({ error: 'Could not create relationship. Please try again.' }, { status: 500 })
  }

  await logActivity({
    supabase,
    treeId: params.treeId,
    profileId: profile.id,
    action: 'created',
    entityType: 'relationship',
    entityId: rel.id,
  })

  return json(rel, { status: 201 })
}

export const DELETE: RequestHandler = async ({ url, params, locals: { supabase, safeGetSession } }) => {
  const { user } = await safeGetSession()
  if (!user) return json({ error: 'Not authenticated.' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!profile) return json({ error: 'Profile not found.' }, { status: 401 })

  const { data: tree } = await supabase
    .from('trees')
    .select('owner_id')
    .eq('id', params.treeId)
    .single()
  if (!tree) return json({ error: 'Tree not found.' }, { status: 404 })

  if (tree.owner_id !== profile.id) {
    const { data: collab } = await supabase
      .from('tree_collaborators')
      .select('role')
      .eq('tree_id', params.treeId)
      .eq('profile_id', profile.id)
      .single()
    if (!collab || collab.role !== 'editor') {
      return json({ error: 'You do not have permission to edit this tree.' }, { status: 403 })
    }
  }

  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'Relationship id is required.' }, { status: 400 })

  const { data: rel } = await supabase
    .from('relationships')
    .select('id')
    .eq('id', id)
    .eq('tree_id', params.treeId)
    .maybeSingle()
  if (!rel) return json({ error: 'Relationship not found.' }, { status: 404 })

  const { error: deleteErr } = await supabase.from('relationships').delete().eq('id', id)
  if (deleteErr) return json({ error: 'Could not delete relationship. Please try again.' }, { status: 500 })

  await logActivity({
    supabase,
    treeId: params.treeId,
    profileId: profile.id,
    action: 'deleted',
    entityType: 'relationship',
    entityId: id,
  })

  return json({ deleted: true })
}
