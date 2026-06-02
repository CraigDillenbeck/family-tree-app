import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { supabaseAdmin } from '$lib/server/supabase'
import { getPlan, getStorageUsedBytes } from '$lib/utils/plans'

export const load: PageServerLoad = async ({ locals: { supabase }, parent }) => {
  const { profile } = await parent()

  const planLimits = getPlan({ plan_id: null }) // defaults to remembrance until billing lands

  const storageUsedBytes = profile
    ? await getStorageUsedBytes(supabase, profile.id)
    : 0

  return {
    planLimits,
    storageUsedBytes,
    planName: 'Remembrance',
  }
}

export const actions: Actions = {
  updateProfile: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { user } = await safeGetSession()
    if (!user) return fail(401, { error: 'Not authenticated.' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()
    if (!profile) return fail(401, { error: 'Could not find your profile.' })

    const form = await request.formData()
    const displayName = (form.get('display_name') as string | null)?.trim()

    if (!displayName || displayName.length < 2) {
      return fail(400, { error: 'Please enter a name with at least 2 characters.' })
    }
    if (displayName.length > 80) {
      return fail(400, { error: 'Name must be 80 characters or fewer.' })
    }

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', profile.id)

    if (updateErr) return fail(500, { error: 'Could not save your name. Please try again.' })

    return { updated: true }
  },

  deleteAccount: async ({ locals: { supabase, safeGetSession } }) => {
    const { user } = await safeGetSession()
    if (!user) return fail(401, { error: 'Not authenticated.' })

    // Delete the auth user — cascades to profiles via DB trigger / FK
    const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteErr) return fail(500, { error: 'Could not delete your account. Please contact support.' })

    redirect(303, '/login?deleted=1')
  },
}
