import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export type ProfilePerson = {
  id: string
  first_name: string
  last_name: string | null
  birth_date: string | null
  death_date: string | null
  birthplace: string | null
  biography: string | null
  avatar_url: string | null
  is_living: boolean
}

export type ProfileMemory = {
  id: string
  title: string
  excerpt: string | null
  memory_date: string | null
  tags: string[]
}

export type ProfileMedia = {
  id: string
  file_url: string
  file_type: string
  caption: string | null
}

export type ProfileRelationship = {
  id: string
  label: string
  person: {
    id: string
    first_name: string
    last_name: string | null
    avatar_url: string | null
    is_living: boolean
  }
  dates: string | null
  is_current: boolean
}

type RawRelatedPerson = {
  id: string
  first_name: string
  last_name: string | null
  birth_date: string | null
  death_date: string | null
  avatar_url: string | null
  is_living: boolean
}

type RawRelationship = {
  id: string
  person_a_id: string
  person_b_id: string
  relationship_type: string
  is_current: boolean
  person_a: RawRelatedPerson
  person_b: RawRelatedPerson
}

type RawMemory = {
  id: string
  title: string
  content: string | null
  memory_date: string | null
  memory_tags: Array<{ tags: { id: string; name: string } | null }>
}

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
  const personRes = await supabase
    .from('persons')
    .select('id, first_name, last_name, birth_date, death_date, birthplace, biography, avatar_url, is_living')
    .eq('id', params.personId)
    .eq('tree_id', params.treeId)
    .single()

  if (!personRes.data) error(404, 'Person not found')

  const [memPersonRes, mediaPersonRes, relsRes] = await Promise.all([
    supabase
      .from('memory_persons')
      .select('memory_id')
      .eq('person_id', params.personId),
    supabase
      .from('media_persons')
      .select('media_id')
      .eq('person_id', params.personId),
    supabase
      .from('relationships')
      .select(
        'id, person_a_id, person_b_id, relationship_type, is_current,' +
        'person_a:persons!relationships_person_a_id_fkey(id, first_name, last_name, birth_date, death_date, avatar_url, is_living),' +
        'person_b:persons!relationships_person_b_id_fkey(id, first_name, last_name, birth_date, death_date, avatar_url, is_living)'
      )
      .eq('tree_id', params.treeId)
      .or(`person_a_id.eq.${params.personId},person_b_id.eq.${params.personId}`)
  ])

  const memoryIds = (memPersonRes.data ?? []).map((r) => r.memory_id)
  const mediaIds = (mediaPersonRes.data ?? []).map((r) => r.media_id)

  const [memoriesRes, mediaRes] = await Promise.all([
    memoryIds.length > 0
      ? supabase
          .from('memories')
          .select('id, title, content, memory_date, memory_tags(tags(id, name))')
          .in('id', memoryIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as RawMemory[] }),
    mediaIds.length > 0
      ? supabase
          .from('media')
          .select('id, file_url, file_type, caption')
          .in('id', mediaIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as ProfileMedia[] })
  ])

  const memories: ProfileMemory[] = ((memoriesRes.data ?? []) as unknown as RawMemory[]).map(
    (m) => ({
      id: m.id,
      title: m.title,
      excerpt: m.content ? m.content.slice(0, 160) : null,
      memory_date: m.memory_date,
      tags: (m.memory_tags ?? []).flatMap((mt) => (mt.tags ? [mt.tags.name] : []))
    })
  )

  const media: ProfileMedia[] = (mediaRes.data ?? []) as ProfileMedia[]

  const relationships: ProfileRelationship[] = (
    (relsRes.data ?? []) as unknown as RawRelationship[]
  ).map((row) => {
    const isPersonA = row.person_a_id === params.personId
    const other = isPersonA ? row.person_b : row.person_a
    const birthYear = other.birth_date
      ? new Date(other.birth_date + 'T00:00:00').getFullYear().toString()
      : null
    const deathYear = other.death_date
      ? new Date(other.death_date + 'T00:00:00').getFullYear().toString()
      : null
    const dates = [birthYear, deathYear].filter(Boolean).join('–') || null

    return {
      id: row.id,
      label: relLabel(row.relationship_type, isPersonA),
      person: {
        id: other.id,
        first_name: other.first_name,
        last_name: other.last_name,
        avatar_url: other.avatar_url,
        is_living: other.is_living
      },
      dates,
      is_current: row.is_current
    }
  })

  return {
    person: personRes.data as ProfilePerson,
    memories,
    media,
    relationships
  }
}

function relLabel(type: string, isPersonA: boolean): string {
  switch (type) {
    case 'spouse':
      return 'Spouse'
    case 'divorced':
      return 'Former spouse'
    case 'parent_child':
      // person_a is the parent; person_b is the child
      return isPersonA ? 'Child' : 'Parent'
    case 'adopted':
      return isPersonA ? 'Adopted child' : 'Adoptive parent'
    case 'step':
      return isPersonA ? 'Step-child' : 'Step-parent'
    case 'uncertain':
      return 'Family relation'
    default:
      return type
  }
}
