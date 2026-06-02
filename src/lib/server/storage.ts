import { supabaseAdmin } from '$lib/server/supabase'

const BUCKET = 'tree-media'
const SIGNED_TTL_SECONDS = 3600

export async function signedDownloadUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_TTL_SECONDS)
  return error || !data ? null : data.signedUrl
}

export async function signedDownloadUrls(
  storagePaths: string[]
): Promise<Map<string, string>> {
  if (storagePaths.length === 0) return new Map()
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrls(storagePaths, SIGNED_TTL_SECONDS)
  if (error || !data) return new Map()
  return new Map(data.map((item) => [item.path ?? '', item.signedUrl ?? '']))
}

export async function signedUploadUrl(storagePath: string): Promise<{
  signedUrl: string
  token: string
  path: string
} | null> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUploadUrl(storagePath)
  return error || !data ? null : data
}

export async function deleteStorageObject(storagePath: string): Promise<void> {
  await supabaseAdmin.storage.from(BUCKET).remove([storagePath])
}
