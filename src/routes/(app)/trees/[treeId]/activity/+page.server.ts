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
    .order('created_at', { ascending: false })
    .limit(200)

  if (fetchError) error(500, 'Could not load activity log.')

  return { events: events ?? [] }
}
