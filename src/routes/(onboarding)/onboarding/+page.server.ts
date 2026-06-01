import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const { user } = await safeGetSession()
  if (!user) redirect(303, '/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('auth_user_id', user.id)
    .single()

  // Skip onboarding if the user already has a tree (RLS filters to their trees)
  const { data: trees } = await supabase
    .from('trees')
    .select('id')
    .limit(1)

  if (trees && trees.length > 0) redirect(303, '/dashboard')

  return { profile }
}

export const actions: Actions = {
  create: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { user } = await safeGetSession()
    if (!user) return fail(401, { error: 'Not authenticated.' })

    const form = await request.formData()
    const firstName = ((form.get('firstName') as string) ?? '').trim()
    const lastName = ((form.get('lastName') as string) ?? '').trim()
    const birthYear = ((form.get('birthYear') as string) ?? '').trim()
    const birthplace = ((form.get('birthplace') as string) ?? '').trim()

    if (!firstName) return fail(400, { error: 'A given name keeps the record yours.' })
    if (birthYear && !/^\d{4}$/.test(birthYear)) {
      return fail(400, { error: 'Please enter a four-digit year, like 1987.' })
    }

    const treeName = lastName ? `The ${lastName} Family` : `${firstName}'s Tree`

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) return fail(500, { error: 'Profile not found. Please sign out and sign in again.' })

    const { data: tree, error: treeError } = await supabase
      .from('trees')
      .insert({ owner_id: profile.id, name: treeName })
      .select('id')
      .single()

    if (treeError || !tree) {
      return fail(500, { error: 'Could not create your tree. Please try again.' })
    }

    const birthDate = birthYear ? `${birthYear}-01-01` : null

    const { data: person, error: personError } = await supabase
      .from('persons')
      .insert({
        tree_id: tree.id,
        created_by: profile.id,
        first_name: firstName,
        last_name: lastName || null,
        birth_date: birthDate,
        birth_place: birthplace || null,
        is_living: true
      })
      .select('id')
      .single()

    if (personError || !person) {
      await supabase.from('trees').delete().eq('id', tree.id)
      return fail(500, { error: 'Could not save your details. Please try again.' })
    }

    return { treeId: tree.id, firstName }
  }
}
