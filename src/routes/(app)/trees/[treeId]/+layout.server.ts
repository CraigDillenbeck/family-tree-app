import { error } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { isOwner } from '$lib/utils/permissions'

export type TreeLayoutData = {
  tree: {
    id: string
    name: string
    description: string | null
    owner_id: string
  }
  userRole: 'owner' | 'editor' | 'viewer'
}

export const load: LayoutServerLoad = async ({ locals: { supabase, safeGetSession }, params }) => {
  const { user } = await safeGetSession()
  if (!user) error(401, 'Not authenticated')

  const { data: tree } = await supabase
    .from('trees')
    .select('id, name, description, owner_id, is_active')
    .eq('id', params.treeId)
    .eq('is_active', true)
    .single()

  if (!tree) error(404, 'Tree not found')

  if (isOwner(tree.owner_id, user.id)) {
    return { tree, userRole: 'owner' as const }
  }

  const { data: collab } = await supabase
    .from('tree_collaborators')
    .select('role')
    .eq('tree_id', params.treeId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!collab) error(403, 'You do not have access to this tree.')

  return { tree, userRole: collab.role as 'editor' | 'viewer' }
}
