import { error, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { supabaseAdmin } from '$lib/server/supabase'
import { getPlan } from '$lib/utils/plans'
import { logActivity } from '$lib/utils/activity'
import { sendCollaboratorInviteEmail } from '$lib/server/email'

export const load: PageServerLoad = async ({ parent, params }) => {
  const { userRole } = await parent()
  if (userRole !== 'owner') error(403, 'Only the tree owner can manage collaborators.')

  const [{ data: collaboratorRows }, { data: inviteRows }] = await Promise.all([
    supabaseAdmin
      .from('tree_collaborators')
      .select('id, role, invited_at, accepted_at, profile_id')
      .eq('tree_id', params.treeId)
      .order('invited_at', { ascending: true }),
    supabaseAdmin
      .from('tree_invites')
      .select('id, email, role, token, expires_at, created_at')
      .eq('tree_id', params.treeId)
      .is('accepted_at', null)
      .order('created_at', { ascending: true }),
  ])

  const profileIds = (collaboratorRows ?? []).map((c) => c.profile_id)
  const { data: profileRows } = profileIds.length
    ? await supabaseAdmin.from('profiles').select('id, display_name, avatar_url').in('id', profileIds)
    : { data: [] }

  const profileMap = new Map((profileRows ?? []).map((p) => [p.id, p]))
  const collaborators = (collaboratorRows ?? []).map((c) => ({
    ...c,
    profile: profileMap.get(c.profile_id) ?? null,
  }))

  const plan = getPlan({ plan_id: null })

  return {
    collaborators,
    invites: inviteRows ?? [],
    planMaxCollaborators: plan.maxCollaborators,
    planDisplayName: plan.displayName,
  }
}

async function requireOwner(
  supabase: App.Locals['supabase'],
  safeGetSession: App.Locals['safeGetSession'],
  treeId: string
) {
  const { user } = await safeGetSession()
  if (!user) return { failure: fail(401, { error: 'Not authenticated.' }) } as const

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('auth_user_id', user.id)
    .single()
  if (!profile) return { failure: fail(401, { error: 'Could not find your profile.' }) } as const

  const { data: tree } = await supabase.from('trees').select('owner_id, name').eq('id', treeId).single()
  if (!tree || tree.owner_id !== profile.id) {
    return { failure: fail(403, { error: 'Only the tree owner can manage collaborators.' }) } as const
  }

  return { profile, tree } as const
}

export const actions: Actions = {
  removeCollaborator: async ({ request, params, locals: { supabase, safeGetSession } }) => {
    const auth = await requireOwner(supabase, safeGetSession, params.treeId)
    if ('failure' in auth) return auth.failure

    const form = await request.formData()
    const collaboratorId = (form.get('collaboratorId') as string) ?? ''
    if (!collaboratorId) return fail(400, { error: 'Missing collaborator.' })

    await supabase.from('tree_collaborators').delete().eq('id', collaboratorId).eq('tree_id', params.treeId)

    await logActivity({
      supabase,
      treeId: params.treeId,
      profileId: auth.profile.id,
      action: 'deleted',
      entityType: 'tree_collaborator',
      entityId: collaboratorId,
    })

    return { removed: true }
  },

  changeRole: async ({ request, params, locals: { supabase, safeGetSession } }) => {
    const auth = await requireOwner(supabase, safeGetSession, params.treeId)
    if ('failure' in auth) return auth.failure

    const form = await request.formData()
    const collaboratorId = (form.get('collaboratorId') as string) ?? ''
    const role = form.get('role') as string
    if (role !== 'viewer' && role !== 'editor') return fail(400, { error: 'Invalid role.' })

    const { error: updateErr } = await supabase
      .from('tree_collaborators')
      .update({ role })
      .eq('id', collaboratorId)
      .eq('tree_id', params.treeId)
    if (updateErr) return fail(500, { error: 'Could not update role. Please try again.' })

    await logActivity({
      supabase,
      treeId: params.treeId,
      profileId: auth.profile.id,
      action: 'updated',
      entityType: 'tree_collaborator',
      entityId: collaboratorId,
      diff: { role },
    })

    return { roleChanged: true }
  },

  revokeInvite: async ({ request, params, locals: { supabase, safeGetSession } }) => {
    const auth = await requireOwner(supabase, safeGetSession, params.treeId)
    if ('failure' in auth) return auth.failure

    const form = await request.formData()
    const inviteId = (form.get('inviteId') as string) ?? ''
    if (!inviteId) return fail(400, { error: 'Missing invite.' })

    await supabase.from('tree_invites').delete().eq('id', inviteId).eq('tree_id', params.treeId)

    return { revoked: true }
  },

  resendInvite: async ({ request, params, locals: { supabase, safeGetSession }, url }) => {
    const auth = await requireOwner(supabase, safeGetSession, params.treeId)
    if ('failure' in auth) return auth.failure

    const form = await request.formData()
    const inviteId = (form.get('inviteId') as string) ?? ''
    if (!inviteId) return fail(400, { error: 'Missing invite.' })

    const { data: invite } = await supabase
      .from('tree_invites')
      .select('id, email, token')
      .eq('id', inviteId)
      .eq('tree_id', params.treeId)
      .single()
    if (!invite) return fail(404, { error: 'Invite not found.' })

    const newExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    await supabase.from('tree_invites').update({ expires_at: newExpiry }).eq('id', inviteId)

    await sendCollaboratorInviteEmail({
      to: invite.email,
      treeName: auth.tree.name,
      inviterName: auth.profile.display_name,
      acceptUrl: `${url.origin}/invite/${invite.token}`,
    })

    return { resent: true }
  },
}
