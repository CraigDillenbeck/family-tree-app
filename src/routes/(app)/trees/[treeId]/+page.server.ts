import type { PageServerLoad } from './$types'

export type CanvasPerson = {
  id: string
  first_name: string
  last_name: string | null
  birth_date: string | null
  death_date: string | null
  avatar_url: string | null
  is_living: boolean
}

export type CanvasRelationship = {
  id: string
  person_a_id: string
  person_b_id: string
  type: string
}

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
  const [personsRes, relationshipsRes] = await Promise.all([
    supabase
      .from('persons')
      .select('id, first_name, last_name, birth_date, death_date, avatar_url, is_living')
      .eq('tree_id', params.treeId)
      .order('created_at', { ascending: true }),
    supabase
      .from('relationships')
      .select('id, person_a_id, person_b_id, type')
      .eq('tree_id', params.treeId)
      .eq('is_current', true)
  ])

  return {
    persons: (personsRes.data ?? []) as CanvasPerson[],
    relationships: (relationshipsRes.data ?? []) as CanvasRelationship[]
  }
}
