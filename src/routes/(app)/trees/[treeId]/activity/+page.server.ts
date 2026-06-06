import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase }, params, parent }) => {
  const { userRole } = await parent()
  if (userRole !== 'owner') error(403, 'Only the tree owner can view the activity log.')

  const { data: events, error: fetchError } = await supabase
    .from('activity_log')
    .select(`
      id,
      action,
      entity_type,
      entity_id,
      diff,
      created_at,
      actor:profiles!activity_log_actor_id_fkey (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('tree_id', params.treeId)
    .neq('entity_type', 'relationship')
    .order('created_at', { ascending: false })
    .limit(500)

  if (fetchError) error(500, 'Could not load activity log.')

  const allEvents = events ?? []

  const personIds = [...new Set(allEvents.filter(e => e.entity_type === 'person').map(e => e.entity_id))]
  const memoryIds = [...new Set(allEvents.filter(e => e.entity_type === 'memory').map(e => e.entity_id))]
  const mediaIds  = [...new Set(allEvents.filter(e => e.entity_type === 'media').map(e => e.entity_id))]

  const personNames: Record<string, string> = {}
  const memoryTitles: Record<string, string> = {}
  const mediaTitles: Record<string, string> = {}
  const memoryPersonId: Record<string, string> = {}
  const mediaPersonId: Record<string, string> = {}

  if (personIds.length > 0) {
    const { data } = await supabase
      .from('persons')
      .select('id, first_name, last_name')
      .in('id', personIds)
    for (const p of data ?? []) {
      personNames[p.id] = [p.first_name, p.last_name].filter(Boolean).join(' ')
    }
  }

  if (memoryIds.length > 0) {
    const [{ data: mems }, { data: memLinks }] = await Promise.all([
      supabase.from('memories').select('id, title').in('id', memoryIds),
      supabase.from('memory_persons').select('memory_id, person_id').in('memory_id', memoryIds),
    ])
    for (const m of mems ?? []) memoryTitles[m.id] = m.title
    for (const ml of memLinks ?? []) {
      if (!memoryPersonId[ml.memory_id]) memoryPersonId[ml.memory_id] = ml.person_id
    }
  }

  if (mediaIds.length > 0) {
    const [{ data: mediaItems }, { data: mediaLinks }] = await Promise.all([
      supabase.from('media').select('id, title').in('id', mediaIds),
      supabase.from('media_persons').select('media_id, person_id').in('media_id', mediaIds),
    ])
    for (const m of mediaItems ?? []) mediaTitles[m.id] = m.title ?? 'a file'
    for (const ml of mediaLinks ?? []) {
      if (!mediaPersonId[ml.media_id]) mediaPersonId[ml.media_id] = ml.person_id
    }
  }

  return { events: allEvents, personNames, memoryTitles, mediaTitles, memoryPersonId, mediaPersonId }
}
