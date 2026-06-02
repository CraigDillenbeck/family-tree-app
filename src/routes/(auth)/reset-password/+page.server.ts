import { redirect, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession()
  if (!session) redirect(303, '/forgot-password?expired=1')
  return {}
}

export const actions: Actions = {
  update: async ({ request, locals: { supabase } }) => {
    const form = await request.formData()
    const password = form.get('password') as string
    const confirm = form.get('confirm') as string

    if (!password || password.length < 8) {
      return fail(400, { error: 'Password must be at least 8 characters.' })
    }
    if (password !== confirm) {
      return fail(400, { error: 'Passwords do not match.' })
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) return fail(500, { error: 'Could not update your password. Please try again.' })

    redirect(303, '/dashboard')
  }
}
