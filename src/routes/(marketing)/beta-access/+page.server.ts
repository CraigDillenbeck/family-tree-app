import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { BETA_PASSWORD } from '$env/static/private'
import { COOKIE_NAME, COOKIE_MAX_AGE, issueBetaCookieValue } from '$lib/server/beta'

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const form = await request.formData()
    const password = ((form.get('password') as string) ?? '').trim()

    if (!password || password !== BETA_PASSWORD) {
      return fail(400, { error: 'That code doesn’t match. Give it another try.' })
    }

    cookies.set(COOKIE_NAME, issueBetaCookieValue(BETA_PASSWORD), {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE
    })

    const requested = url.searchParams.get('redirectTo') ?? '/dashboard'
    const safeRedirect = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/dashboard'
    redirect(303, safeRedirect)
  }
}
