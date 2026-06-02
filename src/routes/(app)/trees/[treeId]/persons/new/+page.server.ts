import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { logActivity } from '$lib/utils/activity'

export const load: PageServerLoad = async ({ parent }) => {
  const { userRole } = await parent()
  if (userRole === 'viewer') error(403, 'You do not have permission to add people to this tree.')
  return {}
}

export const actions: Actions = {
  create: async ({ request, params, locals: { supabase, safeGetSession } }) => {
    const { user } = await safeGetSession()
    if (!user) return fail(401, { error: 'Not authenticated.' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) return fail(401, { error: 'Could not find your profile.' })

    const form = await request.formData()
    const firstName = ((form.get('firstName') as string) ?? '').trim()
    const lastName = ((form.get('lastName') as string) ?? '').trim()
    const maidenName = ((form.get('maidenName') as string) ?? '').trim()
    const isLiving = form.get('isLiving') !== 'false'
    const birthYear = ((form.get('birthYear') as string) ?? '').trim()
    const birthPlace = ((form.get('birthPlace') as string) ?? '').trim()
    const deathYear = ((form.get('deathYear') as string) ?? '').trim()
    const occupation = ((form.get('occupation') as string) ?? '').trim()
    const bio = ((form.get('bio') as string) ?? '').trim()

    if (!firstName) return fail(400, { error: 'A given name keeps the record theirs.' })

    if (birthYear && !/^\d{4}$/.test(birthYear)) {
      return fail(400, { error: 'Birth year should be four digits, like 1942.' })
    }

    if (!isLiving && deathYear && !/^\d{4}$/.test(deathYear)) {
      return fail(400, { error: 'Year of death should be four digits, like 2018.' })
    }

    const { data: person, error: insertError } = await supabase
      .from('persons')
      .insert({
        tree_id: params.treeId,
        created_by: profile.id,
        first_name: firstName,
        last_name: lastName || null,
        maiden_name: maidenName || null,
        birth_date: birthYear ? `${birthYear}-01-01` : null,
        birth_place: birthPlace || null,
        death_date: !isLiving && deathYear ? `${deathYear}-01-01` : null,
        occupation: occupation || null,
        bio: bio || null,
        is_living: isLiving,
      })
      .select('id')
      .single()

    if (insertError || !person) {
      return fail(500, { error: 'Could not add this person. Please try again.' })
    }

    await logActivity({
      supabase,
      treeId: params.treeId,
      profileId: profile.id,
      action: 'created',
      entityType: 'person',
      entityId: person.id,
    })

    redirect(303, `/trees/${params.treeId}`)
  }
}
