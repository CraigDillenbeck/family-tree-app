import { redirect, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession()
  if (session) redirect(303, '/dashboard')
  return {}
}

export const actions: Actions = {
  login: async ({ request, locals: { supabase } }) => {
    const form = await request.formData()
    const email = form.get('email') as string
    const password = form.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return fail(400, { tab: 'login' as const, error: 'Invalid email or password.' })
    }

    redirect(303, '/dashboard')
  },

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
      return fail(400, { tab: 'signup' as const, error: error.message })
    }

    redirect(303, '/onboarding')
  },

  oauth: async ({ locals: { supabase }, url }) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${url.origin}/auth/callback`
      }
    })

    if (error) return fail(500, { tab: 'signup' as const, error: 'Could not sign in with Google.' })
    if (data.url) redirect(303, data.url)
  }
}
