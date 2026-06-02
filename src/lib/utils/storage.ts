// Client-safe storage path helpers.
// For signed URL generation and admin ops, import from $lib/server/storage.ts (server only).

export function makeMediaStoragePath(treeId: string, mediaId: string): string {
  return `${treeId}/${mediaId}`
}

export function makeAvatarStoragePath(profileId: string): string {
  return profileId
}

export function mimeToMediaType(
  mimeType: string
): 'image' | 'video' | 'audio' | 'document' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('video/')) return 'video'
  return 'document'
}

export function mediaTypeIcon(mediaType: 'image' | 'video' | 'audio' | 'document'): string {
  switch (mediaType) {
    case 'image':   return 'image'
    case 'audio':   return 'music'
    case 'video':   return 'film'
    case 'document': return 'file-text'
  }
}
