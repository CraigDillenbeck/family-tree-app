import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { isOwner } from '$lib/utils/permissions'
import { getPlan, checkCanAddCollaborator } from '$lib/utils/plans'
import { logActivity } from '$lib/utils/activity'
import { sendCollaboratorInviteEmail } from '$lib/server/email'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const GET: RequestHandler = async () => {
  return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } })
}

export const POST: RequestHandler = async ({ request, params, locals: { supabase, safeGetSession }, url }) => {
  const { user } = await safeGetSession()
  if (!user) return json({ error: 'Not authenticated.' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('auth_user_id', user.id)
    .single()
  if (!profile) return json({ error: 'Profile not found.' }, { status: 401 })

  const { data: tree } = await supabase
    .from('trees')
    .select('owner_id, name')
    .eq('id', params.treeId)
    .single()
  if (!tree) return json({ error: 'Tree not found.' }, { status: 404 })

  if (!isOwner(tree.owner_id, profile.id)) {
    return json({ error: 'Only the tree owner can invite collaborators.' }, { status: 403 })
  }

  const body = await request.json()
  const email = ((body.email as string) ?? '').trim().toLowerCase()
  const role = body.role as string

  if (!EMAIL_RE.test(email)) {
    return json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  if (role !== 'viewer' && role !== 'editor') {
    return json({ error: 'Please choose a role.' }, { status: 400 })
  }

  const plan = getPlan({ plan_id: null }) // defaults to 'remembrance' until billing lands

  // Re-inviting an existing pending invite refreshes it rather than erroring
  // on the (tree_id, email) unique constraint.
  const { data: existingInvite } = await supabase
    .from('tree_invites')
    .select('id, token')
    .eq('tree_id', params.treeId)
    .eq('email', email)
    .is('accepted_at', null)
    .maybeSingle()

  if (!existingInvite) {
    const limitCheck = await checkCanAddCollaborator(supabase, params.treeId, plan)
    if (!limitCheck.allowed) return json({ error: limitCheck.message }, { status: 403 })
  }

  const newExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

  const { data: invite, error: upsertErr } = existingInvite
    ? await supabase
        .from('tree_invites')
        .update({ role, expires_at: newExpiry })
        .eq('id', existingInvite.id)
        .select('id, token')
        .single()
    : await supabase
        .from('tree_invites')
        .insert({ tree_id: params.treeId, invited_by: profile.id, email, role })
        .select('id, token')
        .single()

  if (upsertErr || !invite) {
    return json({ error: 'Could not send the invite. Please try again.' }, { status: 500 })
  }

  const acceptUrl = `${url.origin}/invite/${invite.token}`

  await sendCollaboratorInviteEmail({
    to: email,
    treeName: tree.name,
    inviterName: profile.display_name,
    acceptUrl,
  })

  await logActivity({
    supabase,
    treeId: params.treeId,
    profileId: profile.id,
    action: 'invited',
    entityType: 'tree_invite',
    entityId: invite.id,
  })

  return json({ invite, acceptUrl })
}
