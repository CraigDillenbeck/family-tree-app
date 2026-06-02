import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '$lib/supabase/types'

export type ActivityAction = 'created' | 'updated' | 'deleted' | 'uploaded' | 'tagged' | 'invited'

export async function logActivity(params: {
  supabase: SupabaseClient<Database>
  treeId: string
  profileId: string
  action: ActivityAction
  entityType: string
  entityId: string
  diff?: Record<string, unknown>
}) {
  await params.supabase.from('activity_log').insert({
    tree_id: params.treeId,
    actor_id: params.profileId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    diff: (params.diff ?? null) as import('$lib/supabase/types').Json | null,
  })
}
