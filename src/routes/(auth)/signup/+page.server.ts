import { redirect, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession()
  if (session) redirect(303, '/dashboard')
  return {}
}

export const actions: Actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const form = await request.formData()
    const email = form.get('email') as string
    const password = form.get('password') as string
    const displayName = form.get('displayName') as string

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName }
      }
    })

    if (error) {
      return fail(400, { error: error.message })
    }

    redirect(303, '/dashboard')
  }
}
