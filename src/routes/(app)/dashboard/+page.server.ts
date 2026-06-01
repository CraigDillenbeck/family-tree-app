import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import type { Json } from '$lib/supabase/types'

export type ActivityEntry = {
  id: string
  action: string
  target_type: string | null
  metadata: Json | null
  created_at: string
  actor: { display_name: string | null } | null
}

export type MemoryEntry = {
  id: string
  title: string
  content: string | null
  memory_date: string | null
  created_at: string
}

export type TreeSummary = {
  id: string
  name: string
  description: string | null
  personCount: number
}

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession }, parent }) => {
  const { user } = await safeGetSession()
  if (!user) error(401, 'Not authenticated')

  const { profile } = await parent()
  const profileId = profile?.id

  // Load owned trees (RLS filters to current user's trees automatically)
  const ownedTreesRes = await supabase
    .from('trees')
    .select('id, name, description')
    .order('created_at', { ascending: false })

  const ownedTrees = ownedTreesRes.data ?? []

  // Fetch collaborated trees via the junction table
  let collabTrees: typeof ownedTrees = []
  if (profileId) {
    const collabRes = await supabase
      .from('tree_collaborators')
      .select('tree_id')
      .eq('profile_id', profileId)

    const collabTreeIds = (collabRes.data ?? []).map((r) => r.tree_id)
    if (collabTreeIds.length > 0) {
      const res = await supabase
        .from('trees')
        .select('id, name, description')
        .in('id', collabTreeIds)
      collabTrees = res.data ?? []
    }
  }

  // Deduplicate (owner might also appear as collaborator)
  const seen = new Set(ownedTrees.map((t) => t.id))
  const allTreeRows = [...ownedTrees, ...collabTrees.filter((t) => !seen.has(t.id))]

  if (allTreeRows.length === 0) {
    return {
      user,
      trees: [] as TreeSummary[],
      primaryTree: null,
      recentActivity: [] as ActivityEntry[],
      latestMemory: null as MemoryEntry | null
    }
  }

  const primaryTreeId = allTreeRows[0].id

  const [personCountsRes, activityRes, memoryRes] = await Promise.all([
    supabase
      .from('persons')
      .select('tree_id')
      .in('tree_id', allTreeRows.map((t) => t.id)),
    supabase
      .from('activity_log')
      .select('id, action, target_type, metadata, created_at, actor:profiles!actor_id(display_name)')
      .eq('tree_id', primaryTreeId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('memories')
      .select('id, title, content, memory_date, created_at')
      .eq('tree_id', primaryTreeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  ])

  const countMap = new Map<string, number>()
  for (const row of personCountsRes.data ?? []) {
    countMap.set(row.tree_id, (countMap.get(row.tree_id) ?? 0) + 1)
  }

  const trees: TreeSummary[] = allTreeRows.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    personCount: countMap.get(t.id) ?? 0
  }))

  return {
    user,
    trees,
    primaryTree: trees[0],
    recentActivity: (activityRes.data ?? []) as ActivityEntry[],
    latestMemory: memoryRes.data as MemoryEntry | null
  }
}
