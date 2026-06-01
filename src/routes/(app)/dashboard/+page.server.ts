import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import type { Json } from '$lib/supabase/types'

export type ActivityEntry = {
  id: string
  action: string
  target_type: string | null
  metadata: Json | null
  created_at: string
  actor: { full_name: string | null } | null
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

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const { user } = await safeGetSession()
  if (!user) error(401, 'Not authenticated')

  // Load profile and owned trees together
  const [profileRes, ownedTreesRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, plan, storage_used_bytes, storage_limit_bytes')
      .eq('id', user.id)
      .single(),
    supabase
      .from('trees')
      .select('id, name, description')
      .eq('owner_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
  ])

  const ownedTrees = ownedTreesRes.data ?? []

  // Fetch collaborated trees separately to avoid join type complexity
  const collabRes = await supabase
    .from('tree_collaborators')
    .select('tree_id')
    .eq('user_id', user.id)

  const collabTreeIds = (collabRes.data ?? []).map((r) => r.tree_id)
  let collabTrees: typeof ownedTrees = []
  if (collabTreeIds.length > 0) {
    const res = await supabase
      .from('trees')
      .select('id, name, description')
      .in('id', collabTreeIds)
      .eq('is_active', true)
    collabTrees = res.data ?? []
  }

  const allTreeRows = [...ownedTrees, ...collabTrees]

  if (allTreeRows.length === 0) {
    return {
      user,
      profile: profileRes.data ?? null,
      trees: [] as TreeSummary[],
      primaryTree: null,
      recentActivity: [] as ActivityEntry[],
      latestMemory: null as MemoryEntry | null
    }
  }

  // For each tree, get person count; for primary tree also get activity + memory
  const primaryTreeId = allTreeRows[0].id

  const [personCountsRes, activityRes, memoryRes] = await Promise.all([
    // Count persons for all trees in one query, grouped by tree_id
    supabase
      .from('persons')
      .select('tree_id')
      .in('tree_id', allTreeRows.map((t) => t.id)),
    // Recent activity for primary tree
    supabase
      .from('activity_log')
      .select('id, action, target_type, metadata, created_at, actor:profiles!actor_id(full_name)')
      .eq('tree_id', primaryTreeId)
      .order('created_at', { ascending: false })
      .limit(5),
    // Latest memory for primary tree
    supabase
      .from('memories')
      .select('id, title, content, memory_date, created_at')
      .eq('tree_id', primaryTreeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  ])

  // Build per-tree person count map
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
    profile: profileRes.data ?? null,
    trees,
    primaryTree: trees[0],
    recentActivity: (activityRes.data ?? []) as ActivityEntry[],
    latestMemory: memoryRes.data as MemoryEntry | null
  }
}
