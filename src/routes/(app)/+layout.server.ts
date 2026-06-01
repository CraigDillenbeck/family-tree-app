import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals: { supabase, safeGetSession }, url }) => {
  const { session, user } = await safeGetSession()
  if (!session) {
    redirect(303, `/login?redirectTo=${url.pathname}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .eq('auth_user_id', user!.id)
    .single()

  return { session, user, profile }
}
