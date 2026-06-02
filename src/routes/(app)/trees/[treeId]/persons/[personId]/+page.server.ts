import { error, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { logActivity } from '$lib/utils/activity'
import { signedDownloadUrls } from '$lib/server/storage'

export type ProfilePerson = {
  id: string
  first_name: string
  last_name: string | null
  birth_date: string | null
  death_date: string | null
  birth_place: string | null
  bio: string | null
  avatar_url: string | null
  is_living: boolean
}

export type ProfileMemory = {
  id: string
  title: string
  content: string | null
  excerpt: string | null
  memory_date: string | null
  memory_date_precision: string
  tags: string[]
}

export type ProfileMedia = {
  id: string
  media_type: 'image' | 'video' | 'audio' | 'document'
  storage_path: string
  title: string | null
  caption: string | null
  signedUrl: string | null
}

export type ProfileRelationship = {
  id: string
  label: string
  person: {
    id: string
    first_name: string
    last_name: string | null
    avatar_url: string | null
    is_living: boolean
  }
  dates: string | null
  is_current: boolean
}

type RawRelatedPerson = {
  id: string
  first_name: string
  last_name: string | null
  birth_date: string | null
  death_date: string | null
  avatar_url: string | null
  is_living: boolean
}

type RawRelationship = {
  id: string
  person_a_id: string
  person_b_id: string
  relationship_type: string
  is_current: boolean
  person_a: RawRelatedPerson
  person_b: RawRelatedPerson
}

type RawMemory = {
  id: string
  title: string
  content: string | null
  memory_date: string | null
  memory_date_precision: string
}

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
  const personRes = await supabase
    .from('persons')
    .select('id, first_name, last_name, birth_date, death_date, birth_place, bio, avatar_url, is_living')
    .eq('id', params.personId)
    .eq('tree_id', params.treeId)
    .single()

  if (!personRes.data) error(404, 'Person not found')

  const [memPersonRes, mediaPersonRes, relsRes] = await Promise.all([
    supabase
      .from('memory_persons')
      .select('memory_id')
      .eq('person_id', params.personId),
    supabase
      .from('media_persons')
      .select('media_id')
      .eq('person_id', params.personId),
    supabase
      .from('relationships')
      .select(
        'id, person_a_id, person_b_id, relationship_type, is_current,' +
        'person_a:persons!relationships_person_a_id_fkey(id, first_name, last_name, birth_date, death_date, avatar_url, is_living),' +
        'person_b:persons!relationships_person_b_id_fkey(id, first_name, last_name, birth_date, death_date, avatar_url, is_living)'
      )
      .eq('tree_id', params.treeId)
      .or(`person_a_id.eq.${params.personId},person_b_id.eq.${params.personId}`)
  ])

  const memoryIds = (memPersonRes.data ?? []).map((r) => r.memory_id)
  const mediaIds = (mediaPersonRes.data ?? []).map((r) => r.media_id)

  const [memoriesRes, mediaRes] = await Promise.all([
    memoryIds.length > 0
      ? supabase
          .from('memories')
          .select('id, title, content, memory_date, memory_date_precision')
          .in('id', memoryIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as RawMemory[] }),
    mediaIds.length > 0
      ? supabase
          .from('media')
          .select('id, media_type, storage_path, title, caption')
          .in('id', mediaIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as ProfileMedia[] })
  ])

  const memories: ProfileMemory[] = ((memoriesRes.data ?? []) as unknown as RawMemory[]).map(
    (m) => ({
      id: m.id,
      title: m.title,
      content: m.content,
      excerpt: m.content ? m.content.slice(0, 160) : null,
      memory_date: m.memory_date,
      memory_date_precision: m.memory_date_precision ?? 'full',
      tags: []
    })
  )

  type RawMedia = { id: string; media_type: string; storage_path: string; title: string | null; caption: string | null }
  const rawMedia = (mediaRes.data ?? []) as RawMedia[]
  const urlMap = await signedDownloadUrls(rawMedia.map((m) => m.storage_path))
  const media: ProfileMedia[] = rawMedia.map((m) => ({
    id: m.id,
    media_type: m.media_type as ProfileMedia['media_type'],
    storage_path: m.storage_path,
    title: m.title,
    caption: m.caption,
    signedUrl: urlMap.get(m.storage_path) ?? null,
  }))

  const relationships: ProfileRelationship[] = (
    (relsRes.data ?? []) as unknown as RawRelationship[]
  ).map((row) => {
    const isPersonA = row.person_a_id === params.personId
    const other = isPersonA ? row.person_b : row.person_a
    const birthYear = other.birth_date
      ? new Date(other.birth_date + 'T00:00:00').getFullYear().toString()
      : null
    const deathYear = other.death_date
      ? new Date(other.death_date + 'T00:00:00').getFullYear().toString()
      : null
    const dates = [birthYear, deathYear].filter(Boolean).join('–') || null

    return {
      id: row.id,
      label: relLabel(row.relationship_type, isPersonA),
      person: {
        id: other.id,
        first_name: other.first_name,
        last_name: other.last_name,
        avatar_url: other.avatar_url,
        is_living: other.is_living
      },
      dates,
      is_current: row.is_current
    }
  })

  return {
    person: personRes.data as ProfilePerson,
    memories,
    media,
    relationships
  }
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
    const personId = form.get('personId') as string | null

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

    if (personId) {
      await supabase
        .from('memory_persons')
        .insert({ memory_id: memory.id, person_id: personId })
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
  }
}

function relLabel(type: string, isPersonA: boolean): string {
  switch (type) {
    case 'spouse':
      return 'Spouse'
    case 'divorced':
      return 'Former spouse'
    case 'parent_child':
      return isPersonA ? 'Child' : 'Parent'
    case 'adopted':
      return isPersonA ? 'Adopted child' : 'Adoptive parent'
    case 'step':
      return isPersonA ? 'Step-child' : 'Step-parent'
    case 'uncertain':
      return 'Family relation'
    default:
      return type
  }
}
