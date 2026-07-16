import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { supabaseAdmin } from '$lib/server/supabase'
import { logActivity } from '$lib/utils/activity'

export const load: PageServerLoad = async ({ params, locals: { safeGetSession } }) => {
  const { user } = await safeGetSession()
  const sessionEmail = user?.email ?? null

  const { data: invite } = await supabaseAdmin
    .from('tree_invites')
    .select('id, tree_id, email, role, expires_at, accepted_at, invited_by')
    .eq('token', params.token)
    .maybeSingle()

  if (!invite) {
    return { state: { status: 'not_found' as const }, sessionEmail, token: params.token }
  }

  const { data: tree } = await supabaseAdmin.from('trees').select('id, name').eq('id', invite.tree_id).single()
  const treeName = tree?.name ?? 'a family tree'

  if (invite.accepted_at) {
    return {
      state: { status: 'already_accepted' as const, treeId: invite.tree_id, treeName },
      sessionEmail,
      token: params.token,
    }
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return { state: { status: 'expired' as const, treeName }, sessionEmail, token: params.token }
  }

  const { data: inviter } = await supabaseAdmin
    .from('profiles')
    .select('display_name')
    .eq('id', invite.invited_by)
    .single()

  return {
    state: {
      status: 'valid' as const,
      treeName,
      inviterName: inviter?.display_name ?? 'Someone',
      inviteEmail: invite.email,
      role: invite.role,
    },
    sessionEmail,
    token: params.token,
  }
}

export const actions: Actions = {
  accept: async ({ params, locals: { safeGetSession } }) => {
    const { user } = await safeGetSession()
    if (!user) return fail(401, { error: 'Please sign in first.' })

    const { data: invite } = await supabaseAdmin
      .from('tree_invites')
      .select('id, tree_id, email, role, invited_by, expires_at, accepted_at')
      .eq('token', params.token)
      .maybeSingle()

    if (!invite) return fail(404, { error: 'This invite is no longer valid.' })

    if (invite.accepted_at) {
      redirect(303, `/trees/${invite.tree_id}`)
    }

    if (new Date(invite.expires_at).getTime() < Date.now()) {
      return fail(410, { error: 'This invite has expired. Ask them to send a new one.' })
    }

    if ((user.email ?? '').toLowerCase() !== invite.email.toLowerCase()) {
      return fail(403, { error: `This invite was sent to ${invite.email}. Sign in with that address to accept.` })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()
    if (!profile) return fail(401, { error: 'Could not find your profile.' })

    const { data: newRow, error: insertErr } = await supabaseAdmin
      .from('tree_collaborators')
      .insert({
        tree_id: invite.tree_id,
        profile_id: profile.id,
        role: invite.role,
        invited_by: invite.invited_by,
        accepted_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertErr) {
      // Already a collaborator on this tree — treat as success rather than erroring.
      if (insertErr.code === '23505') {
        await supabaseAdmin.from('tree_invites').update({ accepted_at: new Date().toISOString() }).eq('id', invite.id)
        redirect(303, `/trees/${invite.tree_id}`)
      }
      return fail(500, { error: 'Could not accept the invite. Please try again.' })
    }

    await supabaseAdmin.from('tree_invites').update({ accepted_at: new Date().toISOString() }).eq('id', invite.id)

    await logActivity({
      supabase: supabaseAdmin,
      treeId: invite.tree_id,
      profileId: profile.id,
      action: 'updated',
      entityType: 'tree_collaborator',
      entityId: newRow.id,
      diff: { accepted: true },
    })

    redirect(303, `/trees/${invite.tree_id}`)
  },
}
