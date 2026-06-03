import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { logActivity } from '$lib/utils/activity'
import { getPlan, checkCanCreateTree } from '$lib/utils/plans'

export const load: PageServerLoad = async ({ parent }) => {
  const { profile } = await parent()
  return { profile }
}

export const actions: Actions = {
  create: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { user } = await safeGetSession()
    if (!user) return fail(401, { error: 'Not authenticated.' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) return fail(401, { error: 'Could not find your profile.' })

    const plan = getPlan({ plan_id: null }) // defaults to 'remembrance' until billing lands
    const canCreate = await checkCanCreateTree(supabase, profile.id, plan)
    if (!canCreate.allowed) return fail(403, { error: canCreate.message })

    const form = await request.formData()
    const name = ((form.get('name') as string) ?? '').trim()
    const description = ((form.get('description') as string) ?? '').trim()

    if (!name) return fail(400, { error: 'Every family tree needs a name.' })
    if (name.length > 100) return fail(400, { error: 'Tree name must be 100 characters or fewer.' })

    const { data: tree, error: insertError } = await supabase
      .from('trees')
      .insert({
        owner_id: profile.id,
        name,
        description: description || null,
        is_public: false,
      })
      .select('id')
      .single()

    if (insertError || !tree) {
      return fail(500, { error: 'Could not create this tree. Please try again.' })
    }

    await logActivity({
      supabase,
      treeId: tree.id,
      profileId: profile.id,
      action: 'created',
      entityType: 'tree',
      entityId: tree.id,
    })

    redirect(303, `/trees/${tree.id}`)
  },
}
