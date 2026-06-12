import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { signedDownloadUrls } from '$lib/server/storage'

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
  const { data: person } = await supabase
    .from('persons')
    .select('id, first_name, last_name')
    .eq('id', params.personId)
    .eq('tree_id', params.treeId)
    .single()

  if (!person) error(404, 'Person not found')

  const [{ data: junctions }, { data: personsRows }] = await Promise.all([
    supabase
      .from('media_persons')
      .select('media_id')
      .eq('person_id', params.personId),
    supabase
      .from('persons')
      .select('id, first_name, last_name, avatar_url')
      .eq('tree_id', params.treeId)
      .order('first_name', { ascending: true }),
  ])

  const persons = personsRows ?? []
  const mediaIds = (junctions ?? []).map((j) => j.media_id)

  if (mediaIds.length === 0) {
    return { person, persons, media: [] }
  }

  const { data: rows } = await supabase
    .from('media')
    .select('id, media_type, storage_path, title, caption, file_size_bytes, created_at')
    .in('id', mediaIds)
    .order('created_at', { ascending: false })

  const urlMap = await signedDownloadUrls((rows ?? []).map((m) => m.storage_path))

  const media = (rows ?? []).map((m) => ({
    ...m,
    signedUrl: urlMap.get(m.storage_path) ?? null,
  }))

  return { person, persons, media }
}
