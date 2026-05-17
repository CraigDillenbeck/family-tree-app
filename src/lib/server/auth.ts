import { redirect } from '@sveltejs/kit'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '$lib/supabase/types'

export async function getUser(supabase: SupabaseClient<Database>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function requireAuth(supabase: SupabaseClient<Database>, redirectPath = '/login') {
  const user = await getUser(supabase)
  if (!user) redirect(303, redirectPath)
  return user
}
