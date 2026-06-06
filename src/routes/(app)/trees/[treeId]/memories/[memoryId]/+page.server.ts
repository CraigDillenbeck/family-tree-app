import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { logActivity } from '$lib/utils/activity'

export const load: PageServerLoad = async ({ locals: { supabase }, params, url }) => {
  const { data: memory } = await supabase
    .from('memories')
    .select('id, title, body, memory_date, memory_date_precision, created_by, created_at')
    .eq('id', params.memoryId)
    .eq('tree_id', params.treeId)
    .single()

  if (!memory) error(404, 'Memory not found')

  const { data: mpRows } = await supabase
    .from('memory_persons')
    .select('person_id')
    .eq('memory_id', params.memoryId)

  const personIds = (mpRows ?? []).map((r) => r.person_id)
  let taggedPersons: Array<{ id: string; first_name: string; last_name: string | null; avatar_url: string | null; is_living: boolean }> = []

  if (personIds.length > 0) {
    const { data } = await supabase
      .from('persons')
      .select('id, first_name, last_name, avatar_url, is_living')
      .in('id', personIds)
    taggedPersons = (data ?? []) as typeof taggedPersons
  }

  const { data: author } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', memory.created_by)
    .single()

  const fromPersonId = url.searchParams.get('from') ?? null

  return {
    memory,
    taggedPersons,
    authorName: author?.display_name ?? null,
    fromPersonId,
  }
}

export const actions: Actions = {
  updateMemory: async ({ request, params, locals: { supabase, safeGetSession } }) => {
    const { user } = await safeGetSession()
    if (!user) return fail(401, { error: 'Not authenticated.' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) return fail(401, { error: 'Could not find your profile.' })

    const form = await request.formData()
    const title = (form.get('title') as string | null)?.trim()
    const body = (form.get('content') as string | null)?.trim() || null
    const memoryDate = (form.get('memory_date') as string | null) || null
    const precision = ((form.get('memory_date_precision') as string) || 'exact') as
      'exact' | 'month' | 'year' | 'decade' | 'circa'

    if (!title) return fail(400, { error: 'A title is required.' })

    const { data: existing } = await supabase
      .from('memories')
      .select('id, created_by')
      .eq('id', params.memoryId)
      .eq('tree_id', params.treeId)
      .single()

    if (!existing) return fail(404, { error: 'Memory not found.' })

    if (existing.created_by !== profile.id) {
      const { data: tree } = await supabase
        .from('trees')
        .select('owner_id')
        .eq('id', params.treeId)
        .single()
      if (!tree || tree.owner_id !== profile.id) {
        return fail(403, { error: 'You do not have permission to edit this memory.' })
      }
    }

    const { error: updateErr } = await supabase
      .from('memories')
      .update({ title, body, memory_date: memoryDate, memory_date_precision: precision })
      .eq('id', params.memoryId)

    if (updateErr) return fail(500, { error: 'Could not save changes. Please try again.' })

    await logActivity({
      supabase,
      treeId: params.treeId,
      profileId: profile.id,
      action: 'updated',
      entityType: 'memory',
      entityId: params.memoryId,
    })

    return { updated: true }
  },

  deleteMemory: async ({ request, params, locals: { supabase, safeGetSession } }) => {
    const { user } = await safeGetSession()
    if (!user) return fail(401, { error: 'Not authenticated.' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) return fail(401, { error: 'Could not find your profile.' })

    const form = await request.formData()
    const fromPersonId = (form.get('fromPersonId') as string | null) || null

    const { data: existing } = await supabase
      .from('memories')
      .select('id, created_by')
      .eq('id', params.memoryId)
      .eq('tree_id', params.treeId)
      .single()

    if (!existing) return fail(404, { error: 'Memory not found.' })

    if (existing.created_by !== profile.id) {
      const { data: tree } = await supabase
        .from('trees')
        .select('owner_id')
        .eq('id', params.treeId)
        .single()
      if (!tree || tree.owner_id !== profile.id) {
        return fail(403, { error: 'You do not have permission to delete this memory.' })
      }
    }

    await supabase.from('memory_persons').delete().eq('memory_id', params.memoryId)

    const { error: deleteErr } = await supabase
      .from('memories')
      .delete()
      .eq('id', params.memoryId)

    if (deleteErr) return fail(500, { error: 'Could not delete the memory. Please try again.' })

    await logActivity({
      supabase,
      treeId: params.treeId,
      profileId: profile.id,
      action: 'deleted',
      entityType: 'memory',
      entityId: params.memoryId,
    })

    const backUrl = fromPersonId
      ? `/trees/${params.treeId}/persons/${fromPersonId}`
      : `/trees/${params.treeId}`

    redirect(303, backUrl)
  },
}
