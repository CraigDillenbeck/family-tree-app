import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import { supabaseAdmin } from '$lib/server/supabase'

export const actions: Actions = {
  waitlist: async ({ request }) => {
    const form = await request.formData()
    const email = ((form.get('email') as string) ?? '').trim().toLowerCase()
    const honeypot = ((form.get('company') as string) ?? '').trim()

    if (honeypot) {
      return { success: true }
    }

    if (!email || !email.includes('@') || email.length > 254) {
      return fail(400, { email, error: 'Please enter a valid email address.' })
    }

    const { error: insertError } = await supabaseAdmin
      .from('waitlist_subscribers')
      .insert({ email, source: 'landing_hero' })

    if (insertError) {
      if (insertError.code === '23505') {
        return { success: true }
      }
      console.error('waitlist_subscribers insert:', insertError)
      return fail(500, { email, error: 'Something went wrong on our end. Please email hello@prosapia.me directly.' })
    }

    return { success: true }
  }
}
