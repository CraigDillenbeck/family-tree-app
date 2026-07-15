import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { logActivity } from '$lib/utils/activity'

export const GET: RequestHandler = async () => {
  return json([])
}

export const POST: RequestHandler = async ({ request, params, locals: { supabase, safeGetSession } }) => {
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

  const body = await request.json() as { first_name?: string; last_name?: string; is_direct_descendant?: boolean }
  const first_name = body.first_name?.trim()
  const last_name = body.last_name?.trim() || null
  const isDirectDescendant = typeof body.is_direct_descendant === 'boolean' ? body.is_direct_descendant : undefined

  if (!first_name) {
    return json({ error: 'A given name is required.' }, { status: 400 })
  }

  const { data: person, error: insertErr } = await supabase
    .from('persons')
    .insert({
      tree_id: params.treeId,
      created_by: profile.id,
      first_name,
      last_name,
      is_living: true,
      ...(isDirectDescendant !== undefined ? { is_direct_descendant: isDirectDescendant } : {}),
    })
    .select('id, first_name, last_name, is_living, birth_date, death_date, avatar_url, is_direct_descendant')
    .single()

  if (insertErr || !person) {
    return json({ error: 'Could not create person. Please try again.' }, { status: 500 })
  }

  await logActivity({
    supabase,
    treeId: params.treeId,
    profileId: profile.id,
    action: 'created',
    entityType: 'person',
    entityId: person.id,
  })

  return json(person, { status: 201 })
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

  const personId = url.searchParams.get('personId')
  if (!personId) return json({ error: 'personId is required.' }, { status: 400 })

  await supabase
    .from('relationships')
    .delete()
    .or(`person_a_id.eq.${personId},person_b_id.eq.${personId}`)

  await supabase.from('memory_persons').delete().eq('person_id', personId)
  await supabase.from('media_persons').delete().eq('person_id', personId)

  const { error: deleteError } = await supabase
    .from('persons')
    .delete()
    .eq('id', personId)
    .eq('tree_id', params.treeId)

  if (deleteError) {
    return json({ error: 'Could not remove this person. Please try again.' }, { status: 500 })
  }

  await logActivity({
    supabase,
    treeId: params.treeId,
    profileId: profile.id,
    action: 'deleted',
    entityType: 'person',
    entityId: personId,
  })

  return json({ success: true })
}

export const PATCH: RequestHandler = async ({ request, params, locals: { supabase, safeGetSession } }) => {
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

  const body = await request.json() as { personId?: string; is_direct_descendant?: boolean }
  const { personId, is_direct_descendant } = body
  if (!personId || typeof is_direct_descendant !== 'boolean') {
    return json({ error: 'personId and is_direct_descendant are required.' }, { status: 400 })
  }

  const { data: person, error: updateErr } = await supabase
    .from('persons')
    .update({ is_direct_descendant })
    .eq('id', personId)
    .eq('tree_id', params.treeId)
    .select('id, is_direct_descendant')
    .single()

  if (updateErr || !person) {
    return json({ error: 'Could not update person. Please try again.' }, { status: 500 })
  }

  await logActivity({
    supabase,
    treeId: params.treeId,
    profileId: profile.id,
    action: 'updated',
    entityType: 'person',
    entityId: personId,
  })

  return json(person)
}
