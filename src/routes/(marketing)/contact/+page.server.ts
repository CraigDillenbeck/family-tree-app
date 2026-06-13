import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import { supabaseAdmin } from '$lib/server/supabase'

const VALID_REASONS = new Set([
	'General question',
	'Billing & subscription',
	'Privacy & data request',
	'Feature idea',
	'Something else'
])

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData()
		const name = ((data.get('name') as string) ?? '').trim()
		const email = ((data.get('email') as string) ?? '').trim()
		const reason = ((data.get('reason') as string) ?? '').trim()
		const message = ((data.get('message') as string) ?? '').trim()

		const values = { name, email, reason, message }

		if (!name) return fail(400, { ...values, error: 'Please include your name.' })
		if (name.length > 100) return fail(400, { ...values, error: 'Name must be 100 characters or fewer.' })
		if (!email || !email.includes('@'))
			return fail(400, { ...values, error: 'Please enter a valid email address.' })
		if (!VALID_REASONS.has(reason)) return fail(400, { ...values, error: 'Please select a topic.' })
		if (!message) return fail(400, { ...values, error: 'Please include a message.' })
		if (message.length > 2000)
			return fail(400, { ...values, error: 'Message must be 2,000 characters or fewer.' })

		// contact_submissions is not yet in generated types — cast until types are regenerated
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error: insertError } = await (supabaseAdmin as any)
			.from('contact_submissions')
			.insert({ name, email, reason, message })

		if (insertError) {
			console.error('contact_submissions insert:', insertError)
			return fail(500, {
				...values,
				error: 'Something went wrong on our end. Please email hello@prosapia.me directly.'
			})
		}

		return { success: true }
	}
}
