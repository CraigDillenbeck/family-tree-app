import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { logActivity } from '$lib/utils/activity'

export const load: PageServerLoad = async ({ params, parent, locals: { supabase } }) => {
  const { userRole } = await parent()
  if (userRole === 'viewer') error(403, 'You do not have permission to edit this person.')

  const { data: person } = await supabase
    .from('persons')
    .select('id, first_name, last_name, maiden_name, birth_date, death_date, birth_place, occupation, bio, is_living')
    .eq('id', params.personId)
    .eq('tree_id', params.treeId)
    .single()

  if (!person) error(404, 'Person not found.')

  return { person }
}

export const actions: Actions = {
  update: async ({ request, params, locals: { supabase, safeGetSession } }) => {
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

    const { error: updateError } = await supabase
      .from('persons')
      .update({
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
      .eq('id', params.personId)
      .eq('tree_id', params.treeId)

    if (updateError) {
      return fail(500, { error: 'Could not save changes. Please try again.' })
    }

    await logActivity({
      supabase,
      treeId: params.treeId,
      profileId: profile.id,
      action: 'updated',
      entityType: 'person',
      entityId: params.personId,
    })

    redirect(303, `/trees/${params.treeId}/persons/${params.personId}`)
  },

  delete: async ({ params, locals: { supabase, safeGetSession } }) => {
    const { user } = await safeGetSession()
    if (!user) return fail(401, { error: 'Not authenticated.' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) return fail(401, { error: 'Could not find your profile.' })

    // Remove all edges before deleting the node
    await supabase
      .from('relationships')
      .delete()
      .or(`person_a_id.eq.${params.personId},person_b_id.eq.${params.personId}`)

    await supabase.from('memory_persons').delete().eq('person_id', params.personId)
    await supabase.from('media_persons').delete().eq('person_id', params.personId)

    const { error: deleteError } = await supabase
      .from('persons')
      .delete()
      .eq('id', params.personId)
      .eq('tree_id', params.treeId)

    if (deleteError) {
      return fail(500, { error: 'Could not remove this person. Please try again.' })
    }

    await logActivity({
      supabase,
      treeId: params.treeId,
      profileId: profile.id,
      action: 'deleted',
      entityType: 'person',
      entityId: params.personId,
    })

    redirect(303, `/trees/${params.treeId}`)
  }
}
