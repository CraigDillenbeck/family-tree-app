import { error, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { logActivity } from '$lib/utils/activity'

export type MemoryItem = {
  id: string
  title: string
  content: string | null
  excerpt: string | null
  memory_date: string | null
  memory_date_precision: string
  created_at: string | null
  author_name: string | null
}

type RawMemory = {
  id: string
  title: string
  body: string | null
  memory_date: string | null
  memory_date_precision: string
  created_at: string
  profiles: { display_name: string } | null
}

export const load: PageServerLoad = async ({ locals: { supabase }, params, parent }) => {
  const { userRole } = await parent()

  const { data: person } = await supabase
    .from('persons')
    .select('id, first_name, last_name')
    .eq('id', params.personId)
    .eq('tree_id', params.treeId)
    .single()

  if (!person) error(404, 'Person not found')

  const { data: junctions } = await supabase
    .from('memory_persons')
    .select('memory_id')
    .eq('person_id', params.personId)

  const memoryIds = (junctions ?? []).map((j) => j.memory_id)

  if (memoryIds.length === 0) {
    return { person, memories: [] as MemoryItem[], canEdit: userRole === 'owner' || userRole === 'editor' }
  }

  const { data: rows } = await supabase
    .from('memories')
    .select('id, title, body, memory_date, memory_date_precision, created_at, profiles!memories_created_by_fkey(display_name)')
    .in('id', memoryIds)
    .order('created_at', { ascending: false })

  const memories: MemoryItem[] = ((rows ?? []) as unknown as RawMemory[]).map((m) => ({
    id: m.id,
    title: m.title,
    content: m.body,
    excerpt: m.body ? (m.body.length > 150 ? m.body.slice(0, 150) + '…' : m.body) : null,
    memory_date: m.memory_date,
    memory_date_precision: m.memory_date_precision ?? 'exact',
    created_at: m.created_at,
    author_name: m.profiles?.display_name ?? null,
  }))

  return { person, memories, canEdit: userRole === 'owner' || userRole === 'editor' }
}

export const actions: Actions = {
  createMemory: async ({ request, params, locals: { supabase, safeGetSession } }) => {
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

    const { data: memory, error: memErr } = await supabase
      .from('memories')
      .insert({
        tree_id: params.treeId,
        title,
        body,
        memory_date: memoryDate,
        memory_date_precision: precision,
        created_by: profile.id,
      })
      .select('id')
      .single()

    if (memErr || !memory) {
      return fail(500, { error: 'Could not save the memory. Please try again.' })
    }

    const { error: linkErr } = await supabase
      .from('memory_persons')
      .insert({ memory_id: memory.id, person_id: params.personId })

    if (linkErr) {
      await supabase.from('memories').delete().eq('id', memory.id)
      return fail(500, { error: 'Could not link the memory to this person. Please try again.' })
    }

    await logActivity({
      supabase,
      treeId: params.treeId,
      profileId: profile.id,
      action: 'created',
      entityType: 'memory',
      entityId: memory.id,
    })

    return { created: true }
  },

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
    const memoryId = form.get('memoryId') as string | null
    const title = (form.get('title') as string | null)?.trim()
    const body = (form.get('content') as string | null)?.trim() || null
    const memoryDate = (form.get('memory_date') as string | null) || null
    const precision = ((form.get('memory_date_precision') as string) || 'exact') as
      'exact' | 'month' | 'year' | 'decade' | 'circa'

    if (!memoryId) return fail(400, { error: 'Memory ID missing.' })
    if (!title) return fail(400, { error: 'A title is required.' })

    const { data: existing } = await supabase
      .from('memories')
      .select('id, created_by')
      .eq('id', memoryId)
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
      .eq('id', memoryId)

    if (updateErr) {
      return fail(500, { error: 'Could not save changes. Please try again.' })
    }

    await logActivity({
      supabase,
      treeId: params.treeId,
      profileId: profile.id,
      action: 'updated',
      entityType: 'memory',
      entityId: memoryId,
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
    const memoryId = form.get('memoryId') as string | null

    if (!memoryId) return fail(400, { error: 'Memory ID missing.' })

    const { data: existing } = await supabase
      .from('memories')
      .select('id, created_by')
      .eq('id', memoryId)
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

    await supabase.from('memory_persons').delete().eq('memory_id', memoryId)

    const { error: deleteErr } = await supabase
      .from('memories')
      .delete()
      .eq('id', memoryId)

    if (deleteErr) {
      return fail(500, { error: 'Could not delete the memory. Please try again.' })
    }

    await logActivity({
      supabase,
      treeId: params.treeId,
      profileId: profile.id,
      action: 'deleted',
      entityType: 'memory',
      entityId: memoryId,
    })

    return { deleted: true }
  },
}
