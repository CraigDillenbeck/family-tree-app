import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession()
  if (session) return { alreadySignedIn: true }
  return {}
}

export const actions: Actions = {
  request: async ({ request, locals: { supabase }, url }) => {
    const form = await request.formData()
    const email = form.get('email') as string

    if (!email) return fail(400, { error: 'Please enter your email address.' })

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${url.origin}/auth/callback?next=/reset-password`
    })

    if (error) return fail(500, { error: 'Something went wrong. Please try again.' })

    return { sent: true }
  }
}
