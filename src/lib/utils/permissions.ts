export function isOwner(treeOwnerId: string, profileId: string): boolean {
  return treeOwnerId === profileId
}

export function canEdit(
  treeOwnerId: string,
  collaboratorRole: string | null,
  profileId: string
): boolean {
  if (isOwner(treeOwnerId, profileId)) return true
  return collaboratorRole === 'editor'
}

export function canView(
  treeOwnerId: string,
  collaboratorRole: string | null,
  isPublic: boolean,
  profileId: string
): boolean {
  if (isPublic) return true
  if (isOwner(treeOwnerId, profileId)) return true
  return collaboratorRole === 'viewer' || collaboratorRole === 'editor'
}
