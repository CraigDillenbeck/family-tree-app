export type ActivityAction = 'created' | 'updated' | 'deleted' | 'uploaded' | 'tagged' | 'invited'

export async function logActivity(params: {
  supabase: unknown
  treeId: string
  profileId: string
  action: ActivityAction
  entityType: string
  entityId: string
  diff?: Record<string, unknown>
}) {
  // Implementation coming in Phase 3
  console.log('[activity]', params.action, params.entityType, params.entityId)
}
