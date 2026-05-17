import { redirect, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession()
  if (session) redirect(303, '/dashboard')
  return {}
}

export const actions: Actions = {
  login: async ({ request, locals: { supabase }, url }) => {
    const form = await request.formData()
    const email = form.get('email') as string
    const password = form.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return fail(400, { error: 'Invalid email or password.' })
    }

    const redirectTo = url.searchParams.get('redirectTo') ?? '/dashboard'
    redirect(303, redirectTo)
  },

  oauth: async ({ locals: { supabase }, url }) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${url.origin}/auth/callback`
      }
    })

    if (error) return fail(500, { error: 'Could not sign in with Google.' })
    if (data.url) redirect(303, data.url)
  }
}
