// Server-side plan enforcement. Import only in +page.server.ts, +layout.server.ts, and API routes.
// plan_id column does not yet exist on profiles — getPlanId defaults to 'remembrance' until billing lands.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '$lib/supabase/types'

export type PlanId = 'remembrance' | 'heritage' | 'legacy'
export type MediaKind = 'image' | 'audio' | 'video' | 'document'

export interface PlanLimits {
  storageBytes: number        // -1 = unlimited
  maxTrees: number            // -1 = unlimited
  maxCollaborators: number    // 0 = collaborators not available
  allowedMediaKinds: MediaKind[]
  maxFileSizeBytes: number    // -1 = no per-file limit
  storageLabel: string
  displayName: string
  priceLabel: string
}

export const PLANS: Record<PlanId, PlanLimits> = {
  remembrance: {
    storageBytes: 1 * 1024 * 1024 * 1024,
    maxTrees: 1,
    maxCollaborators: 1,
    allowedMediaKinds: ['image'],
    maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB per file
    storageLabel: '1 GB',
    displayName: 'Remembrance',
    priceLabel: 'Free',
  },
  heritage: {
    storageBytes: 50 * 1024 * 1024 * 1024,
    maxTrees: 3,
    maxCollaborators: 10,
    allowedMediaKinds: ['image', 'audio', 'document'],
    maxFileSizeBytes: 50 * 1024 * 1024, // 50 MB per file
    storageLabel: '50 GB',
    displayName: 'Heritage',
    priceLabel: '$7.99/mo',
  },
  legacy: {
    storageBytes: -1,
    maxTrees: -1,
    maxCollaborators: -1,
    allowedMediaKinds: ['image', 'audio', 'video', 'document'],
    maxFileSizeBytes: -1,
    storageLabel: 'Unlimited',
    displayName: 'Legacy',
    priceLabel: '$14.99/mo',
  },
}

const MIME_KINDS: Record<string, MediaKind> = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/heic': 'image',
  'image/heif': 'image',
  'audio/mpeg': 'audio',
  'audio/mp4': 'audio',
  'audio/ogg': 'audio',
  'audio/wav': 'audio',
  'audio/aac': 'audio',
  'audio/flac': 'audio',
  'video/mp4': 'video',
  'video/quicktime': 'video',
  'video/webm': 'video',
  'video/mpeg': 'video',
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
}

export type CheckResult = { allowed: true } | { allowed: false; message: string }

// ── Pure helpers ──────────────────────────────────────────────────────────────

export function getPlanId(profile: { plan_id?: string | null }): PlanId {
  const id = profile.plan_id
  if (id === 'heritage' || id === 'legacy') return id
  return 'remembrance'
}

export function getPlan(profile: { plan_id?: string | null }): PlanLimits {
  return PLANS[getPlanId(profile)]
}

export function getMediaKind(mimeType: string): MediaKind | null {
  return MIME_KINDS[mimeType] ?? null
}

export function checkFileAllowed(
  mimeType: string,
  fileSizeBytes: number,
  plan: PlanLimits
): CheckResult {
  const kind = getMediaKind(mimeType)

  if (!kind) {
    return { allowed: false, message: 'That file type is not supported.' }
  }

  if (!plan.allowedMediaKinds.includes(kind)) {
    const kindLabel =
      kind === 'audio' ? 'audio files' :
      kind === 'video' ? 'video files' :
      kind === 'document' ? 'document uploads' :
      'photo uploads'
    const nextPlan = kind === 'video' ? 'Legacy' : 'Heritage'
    return {
      allowed: false,
      message: `${kindLabel.charAt(0).toUpperCase() + kindLabel.slice(1)} are available on the ${nextPlan} plan. Upgrade to preserve records and documents alongside your family's stories.`,
    }
  }

  if (plan.maxFileSizeBytes !== -1 && fileSizeBytes > plan.maxFileSizeBytes) {
    const limitMB = Math.round(plan.maxFileSizeBytes / (1024 * 1024))
    return {
      allowed: false,
      message: `That file is too large. Files on the ${plan.displayName} plan must be under ${limitMB} MB each.`,
    }
  }

  return { allowed: true }
}

// ── DB-backed checks (server-only) ────────────────────────────────────────────

export async function getStorageUsedBytes(
  supabase: SupabaseClient<Database>,
  profileId: string
): Promise<number> {
  const { data: trees } = await supabase
    .from('trees')
    .select('id')
    .eq('owner_id', profileId)

  if (!trees || trees.length === 0) return 0

  const treeIds = trees.map((t) => t.id)

  const { data: mediaRows } = await supabase
    .from('media')
    .select('file_size_bytes')
    .in('tree_id', treeIds)

  return mediaRows?.reduce((sum, m) => sum + m.file_size_bytes, 0) ?? 0
}

export async function checkCanCreateTree(
  supabase: SupabaseClient<Database>,
  profileId: string,
  plan: PlanLimits
): Promise<CheckResult> {
  if (plan.maxTrees === -1) return { allowed: true }

  const { count } = await supabase
    .from('trees')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', profileId)

  const current = count ?? 0

  if (current >= plan.maxTrees) {
    const limitLabel = plan.maxTrees === 1 ? '1 family tree' : `${plan.maxTrees} family trees`
    const nextPlan = plan.displayName === 'Remembrance' ? 'Heritage' : 'Legacy'
    return {
      allowed: false,
      message: `The ${plan.displayName} plan includes ${limitLabel}. Upgrade to ${nextPlan} to create more.`,
    }
  }

  return { allowed: true }
}

export async function checkCanAddCollaborator(
  supabase: SupabaseClient<Database>,
  treeId: string,
  plan: PlanLimits
): Promise<CheckResult> {
  if (plan.maxCollaborators === -1) return { allowed: true }

  const [{ count: collaboratorCount }, { count: pendingInviteCount }] = await Promise.all([
    supabase
      .from('tree_collaborators')
      .select('id', { count: 'exact', head: true })
      .eq('tree_id', treeId),
    supabase
      .from('tree_invites')
      .select('id', { count: 'exact', head: true })
      .eq('tree_id', treeId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString()),
  ])

  const current = (collaboratorCount ?? 0) + (pendingInviteCount ?? 0)

  if (current >= plan.maxCollaborators) {
    const nextPlan = plan.displayName === 'Remembrance' ? 'Heritage' : 'Legacy'
    return {
      allowed: false,
      message: `You've reached the ${plan.maxCollaborators}-collaborator limit on the ${plan.displayName} plan. Upgrade to ${nextPlan} for more collaborators.`,
    }
  }

  return { allowed: true }
}

export async function checkStorageAllowed(
  supabase: SupabaseClient<Database>,
  profileId: string,
  fileSizeBytes: number,
  plan: PlanLimits
): Promise<CheckResult> {
  if (plan.storageBytes === -1) return { allowed: true }

  const used = await getStorageUsedBytes(supabase, profileId)

  if (used + fileSizeBytes > plan.storageBytes) {
    const nextPlan = plan.displayName === 'Remembrance' ? 'Heritage' : 'Legacy'
    const nextStorage = nextPlan === 'Heritage' ? '50 GB' : 'unlimited storage'
    return {
      allowed: false,
      message: `You've reached your storage limit on the ${plan.displayName} plan. Upgrade to ${nextPlan} for ${nextStorage}.`,
    }
  }

  return { allowed: true }
}

export async function isNearStorageLimit(
  supabase: SupabaseClient<Database>,
  profileId: string,
  plan: PlanLimits
): Promise<boolean> {
  if (plan.storageBytes === -1) return false
  const used = await getStorageUsedBytes(supabase, profileId)
  return used / plan.storageBytes >= 0.8
}
