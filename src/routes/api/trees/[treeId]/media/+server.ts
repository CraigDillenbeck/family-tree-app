import { json } from '@sveltejs/kit'
import { randomUUID } from 'node:crypto'
import type { RequestHandler } from './$types'
import { signedDownloadUrl, signedDownloadUrls, signedUploadUrl, deleteStorageObject } from '$lib/server/storage'
import { makeMediaStoragePath, mimeToMediaType } from '$lib/utils/storage'
import { getPlan, checkFileAllowed, checkStorageAllowed } from '$lib/utils/plans'
import { logActivity } from '$lib/utils/activity'

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession }, params, url }) => {
  const { user } = await safeGetSession()
  if (!user) return json({ error: 'Not authenticated.' }, { status: 401 })

  const personId = url.searchParams.get('personId')

  let mediaIds: string[] | null = null
  if (personId) {
    const { data: junctions } = await supabase
      .from('media_persons')
      .select('media_id')
      .eq('person_id', personId)
    mediaIds = (junctions ?? []).map((j) => j.media_id)
    if (mediaIds.length === 0) return json([])
  }

  let query = supabase
    .from('media')
    .select('id, media_type, storage_path, title, caption, file_size_bytes, created_at')
    .eq('tree_id', params.treeId)
    .order('created_at', { ascending: false })

  if (mediaIds) query = query.in('id', mediaIds)

  const { data: rows, error: dbErr } = await query
  if (dbErr) return json({ error: 'Could not load media.' }, { status: 500 })
  if (!rows || rows.length === 0) return json([])

  const urlMap = await signedDownloadUrls(rows.map((m) => m.storage_path))

  return json(rows.map((m) => ({ ...m, signedUrl: urlMap.get(m.storage_path) ?? null })))
}

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession }, params }) => {
  const { user } = await safeGetSession()
  if (!user) return json({ error: 'Not authenticated.' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!profile) return json({ error: 'Profile not found.' }, { status: 401 })

  const body = await request.json()

  // ── Step 1: validate + return signed upload URL ────────────────────────────
  if (body.action === 'request') {
    const { mimeType, fileSizeBytes } = body as {
      mimeType: string
      fileSizeBytes: number
      filename: string
    }

    const plan = getPlan({ plan_id: null }) // defaults to 'remembrance' until billing lands

    const fileCheck = checkFileAllowed(mimeType, fileSizeBytes, plan)
    if (!fileCheck.allowed) return json({ error: fileCheck.message }, { status: 403 })

    const storageCheck = await checkStorageAllowed(supabase, profile.id, fileSizeBytes, plan)
    if (!storageCheck.allowed) return json({ error: storageCheck.message }, { status: 403 })

    const mediaId = randomUUID()
    const storagePath = makeMediaStoragePath(params.treeId, mediaId)

    const uploadData = await signedUploadUrl(storagePath)
    if (!uploadData) return json({ error: 'Could not prepare upload. Please try again.' }, { status: 500 })

    return json({ mediaId, storagePath, signedUrl: uploadData.signedUrl, token: uploadData.token })
  }

  // ── Step 2: create DB record after successful upload ───────────────────────
  if (body.action === 'confirm') {
    const { mediaId, storagePath, mimeType, fileSizeBytes, title, caption, personIds } = body as {
      mediaId: string
      storagePath: string
      mimeType: string
      fileSizeBytes: number
      title?: string | null
      caption?: string | null
      personIds?: string[]
    }

    const { data: media, error: insertErr } = await supabase
      .from('media')
      .insert({
        id: mediaId,
        tree_id: params.treeId,
        created_by: profile.id,
        media_type: mimeToMediaType(mimeType),
        storage_path: storagePath,
        title: title || null,
        caption: caption || null,
        file_size_bytes: fileSizeBytes,
      })
      .select('id, media_type, storage_path, title, caption, file_size_bytes, created_at')
      .single()

    if (insertErr || !media) {
      return json({ error: 'Could not save media. Please try again.' }, { status: 500 })
    }

    if (personIds && personIds.length > 0) {
      await supabase.from('media_persons').insert(
        personIds.map((pid) => ({ media_id: mediaId, person_id: pid }))
      )
    }

    await logActivity({
      supabase,
      treeId: params.treeId,
      profileId: profile.id,
      action: 'uploaded',
      entityType: 'media',
      entityId: mediaId,
    })

    const url = await signedDownloadUrl(storagePath)
    return json({ media: { ...media, signedUrl: url } })
  }

  return json({ error: 'Unknown action.' }, { status: 400 })
}

export const DELETE: RequestHandler = async ({ locals: { supabase, safeGetSession }, params, url }) => {
  const { user } = await safeGetSession()
  if (!user) return json({ error: 'Not authenticated.' }, { status: 401 })

  const mediaId = url.searchParams.get('mediaId')
  if (!mediaId) return json({ error: 'mediaId required.' }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!profile) return json({ error: 'Profile not found.' }, { status: 401 })

  const { data: media } = await supabase
    .from('media')
    .select('id, storage_path, created_by')
    .eq('id', mediaId)
    .eq('tree_id', params.treeId)
    .single()

  if (!media) return json({ error: 'Media not found.' }, { status: 404 })

  if (media.created_by !== profile.id) {
    const { data: tree } = await supabase
      .from('trees')
      .select('owner_id')
      .eq('id', params.treeId)
      .single()
    if (!tree || tree.owner_id !== profile.id) {
      return json({ error: 'You do not have permission to delete this media.' }, { status: 403 })
    }
  }

  await deleteStorageObject(media.storage_path)
  await supabase.from('media_persons').delete().eq('media_id', mediaId)
  await supabase.from('media').delete().eq('id', mediaId)

  await logActivity({
    supabase,
    treeId: params.treeId,
    profileId: profile.id,
    action: 'deleted',
    entityType: 'media',
    entityId: mediaId,
  })

  return json({ deleted: true })
}
