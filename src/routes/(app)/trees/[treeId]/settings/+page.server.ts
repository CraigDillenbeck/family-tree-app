import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { logActivity } from '$lib/utils/activity'
import { supabaseAdmin } from '$lib/server/supabase'

export const load: PageServerLoad = async ({ parent }) => {
  const { userRole } = await parent()
  if (userRole !== 'owner') error(403, 'Only the tree owner can change settings.')
  return {}
}

export const actions: Actions = {
  rename: async ({ request, params, locals: { supabase, safeGetSession } }) => {
    const { user } = await safeGetSession()
    if (!user) return fail(401, { error: 'Not authenticated.' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) return fail(401, { error: 'Could not find your profile.' })

    const { data: tree } = await supabase
      .from('trees')
      .select('owner_id')
      .eq('id', params.treeId)
      .single()

    if (!tree || tree.owner_id !== profile.id) {
      return fail(403, { error: 'Only the tree owner can rename it.' })
    }

    const form = await request.formData()
    const name = ((form.get('name') as string) ?? '').trim()
    const description = ((form.get('description') as string) ?? '').trim()

    if (!name) return fail(400, { error: 'A name keeps the tree findable.' })

    const { error: updateErr } = await supabase
      .from('trees')
      .update({ name, description: description || null })
      .eq('id', params.treeId)

    if (updateErr) return fail(500, { error: 'Could not save changes. Please try again.' })

    await logActivity({
      supabase,
      treeId: params.treeId,
      profileId: profile.id,
      action: 'updated',
      entityType: 'tree',
      entityId: params.treeId,
    })

    return { saved: true }
  },

  delete: async ({ request, params, locals: { supabase, safeGetSession } }) => {
    const { user } = await safeGetSession()
    if (!user) return fail(401, { error: 'Not authenticated.' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) return fail(401, { error: 'Could not find your profile.' })

    const { data: tree } = await supabase
      .from('trees')
      .select('owner_id, name')
      .eq('id', params.treeId)
      .single()

    if (!tree || tree.owner_id !== profile.id) {
      return fail(403, { error: 'Only the tree owner can delete it.' })
    }

    const form = await request.formData()
    const confirm = ((form.get('confirm') as string) ?? '').trim()
    if (confirm !== tree.name) {
      return fail(400, { error: 'The name you typed does not match. Please try again.' })
    }

    // Collect IDs needed to clean up junction tables (no tree_id column on them)
    const [{ data: memories }, { data: media }] = await Promise.all([
      supabaseAdmin.from('memories').select('id').eq('tree_id', params.treeId),
      supabaseAdmin.from('media').select('id').eq('tree_id', params.treeId),
    ])

    const memoryIds = (memories ?? []).map((m) => m.id)
    const mediaIds = (media ?? []).map((m) => m.id)

    await Promise.all([
      memoryIds.length > 0
        ? supabaseAdmin.from('memory_persons').delete().in('memory_id', memoryIds)
        : Promise.resolve(),
      mediaIds.length > 0
        ? supabaseAdmin.from('media_persons').delete().in('media_id', mediaIds)
        : Promise.resolve(),
    ])

    await supabaseAdmin.from('media').delete().eq('tree_id', params.treeId)
    await supabaseAdmin.from('memories').delete().eq('tree_id', params.treeId)
    await supabaseAdmin.from('relationships').delete().eq('tree_id', params.treeId)
    await supabaseAdmin.from('persons').delete().eq('tree_id', params.treeId)
    await supabaseAdmin.from('tree_collaborators').delete().eq('tree_id', params.treeId)

    const { error: deleteErr } = await supabaseAdmin
      .from('trees')
      .delete()
      .eq('id', params.treeId)

    if (deleteErr) {
      return fail(500, { error: 'Could not delete the tree. Please try again.' })
    }

    redirect(303, '/dashboard')
  },
}
