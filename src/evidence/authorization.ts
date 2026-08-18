import type { Role } from '@/payload/access/roles'

/**
 * Evidence access authorisation (PRD Nº5 §27-§46, PRD Nº7 §65-§74).
 *
 * Pure functions, deliberately. This decides whether a person may obtain a
 * document that could identify a source, so it must be exercisable exhaustively
 * without a database, a storage backend or a running server.
 *
 * The rule that makes this different from ordinary RBAC is PRD Nº5 §46:
 * NEED TO KNOW. Restricted evidence is not unlocked by seniority. A technical
 * administrator runs the servers and has no business reading a journalist's
 * source material — PRD Nº5 §46 says so in as many words, and §47 calls it
 * separation of duties.
 */

export const CLASSIFICATIONS = ['public', 'internal', 'restricted'] as const
export type Classification = (typeof CLASSIFICATIONS)[number]

export const EVIDENCE_STATUSES = [
  'pending',
  'verified',
  'approved',
  'quarantined',
  'archived',
] as const
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number]

export const CLASSIFICATION_LABELS: Record<Classification, string> = {
  public: 'Pública',
  internal: 'Interna',
  restricted: 'Reservada',
}

export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, string> = {
  pending: 'Pendiente',
  verified: 'Verificada',
  approved: 'Aprobada',
  quarantined: 'En cuarentena',
  archived: 'Archivada',
}

/** Storage bucket per classification (PRD Nº5 §34, PRD Nº4 §21). */
export const BUCKET_BY_CLASSIFICATION: Record<Classification, string> = {
  public: 'evidence-public',
  internal: 'evidence-internal',
  restricted: 'evidence-restricted',
}

/**
 * Presigned URL lifetimes in seconds (PRD Nº5 §40).
 *
 * Restricted URLs are deliberately short. PRD Nº5 §39 and §131 make the reason
 * explicit: a presigned URL already handed out cannot be revoked, so its
 * expiry is the only real control. Sixty seconds is not paranoia — it is the
 * difference between a leaked link being useless and being a disclosure.
 */
export const URL_TTL_SECONDS: Record<Classification, number> = {
  public: 900,
  internal: 600,
  restricted: 60,
}

export type EvidenceDescriptor = {
  id: string | number
  classification: Classification
  status: EvidenceStatus
  relatedInvestigation?: string | number | null
}

export type AccessGrant = {
  evidence: string | number
  user: string | number
  expiresAt?: string | Date | null
  revokedAt?: string | Date | null
}

export type TeamMembership = {
  investigation: string | number
  members: Array<string | number>
  active?: boolean
}

export type Requester = {
  id: string | number
  role?: Role | null
  status?: string | null
}

export type AccessDecision =
  { allowed: true; ttlSeconds: number; reason: string } | { allowed: false; reason: string }

/** A grant only counts while it is neither revoked nor expired (PRD Nº7 §73). */
export function isGrantValid(grant: AccessGrant, now: Date = new Date()): boolean {
  if (grant.revokedAt) return false
  if (!grant.expiresAt) return true

  return new Date(grant.expiresAt).getTime() > now.getTime()
}

export function hasValidGrant(
  grants: AccessGrant[],
  evidenceId: string | number,
  userId: string | number,
  now: Date = new Date(),
): boolean {
  return grants.some(
    (grant) =>
      String(grant.evidence) === String(evidenceId) &&
      String(grant.user) === String(userId) &&
      isGrantValid(grant, now),
  )
}

export function isOnInvestigationTeam(
  teams: TeamMembership[],
  investigationId: string | number | null | undefined,
  userId: string | number,
): boolean {
  if (investigationId === null || investigationId === undefined) return false

  return teams.some(
    (team) =>
      team.active !== false &&
      String(team.investigation) === String(investigationId) &&
      team.members.some((member) => String(member) === String(userId)),
  )
}

/** Roles that may read `internal` evidence (PRD Nº5 §8, §31). */
const INTERNAL_EVIDENCE_ROLES: readonly Role[] = [
  'editor_in_chief',
  'investigative_editor',
  'editor',
  'fact_checker',
  'legal_reviewer',
  'reporter',
]

/**
 * Roles that may reach `restricted` evidence *if* they also have need-to-know.
 *
 * `administrator` is absent on purpose (PRD Nº5 §46): running the
 * infrastructure is not a reason to read a journalist's sources. An
 * administrator who genuinely needs a specific document receives an explicit
 * grant like anyone else, and that grant is auditable.
 */
const RESTRICTED_EVIDENCE_ROLES: readonly Role[] = [
  'editor_in_chief',
  'investigative_editor',
  'legal_reviewer',
  'reporter',
]

export type AccessContext = {
  requester: Requester | null
  evidence: EvidenceDescriptor
  grants?: AccessGrant[]
  teams?: TeamMembership[]
  now?: Date
}

/**
 * The single decision point for obtaining an evidence file.
 *
 * Returns a reason in both directions so the audit trail can record *why*
 * (PRD Nº5 §53) rather than only that something was denied.
 */
export function decideEvidenceAccess({
  requester,
  evidence,
  grants = [],
  teams = [],
  now = new Date(),
}: AccessContext): AccessDecision {
  const ttl = URL_TTL_SECONDS[evidence.classification]

  /*
   * Quarantined material is unreachable for everyone, at any classification.
   * PRD Nº6 §41: if a scan did not complete, the file is not clean — it is
   * unknown, and unknown is not a state anyone should be opening.
   */
  if (evidence.status === 'quarantined') {
    return { allowed: false, reason: 'La evidencia está en cuarentena.' }
  }

  if (evidence.classification === 'public') {
    /*
     * Public still means published, not merely marked public. PRD Nº7 §70
     * requires `status = approved` before anything is served to the world, and
     * PRD Nº5 §30 requires explicit declassification.
     */
    if (evidence.status !== 'approved') {
      return { allowed: false, reason: 'La evidencia pública aún no está aprobada.' }
    }

    return { allowed: true, ttlSeconds: ttl, reason: 'Evidencia pública aprobada.' }
  }

  if (!requester || requester.status !== 'active') {
    return { allowed: false, reason: 'Requiere una cuenta activa.' }
  }

  const role = requester.role ?? null

  if (evidence.classification === 'internal') {
    if (role && INTERNAL_EVIDENCE_ROLES.includes(role)) {
      return { allowed: true, ttlSeconds: ttl, reason: 'Rol autorizado para evidencia interna.' }
    }

    return { allowed: false, reason: 'El rol no tiene acceso a evidencia interna.' }
  }

  /* restricted — role AND need-to-know (PRD Nº5 §42, §46) */

  if (!role || !RESTRICTED_EVIDENCE_ROLES.includes(role)) {
    return { allowed: false, reason: 'El rol no tiene acceso a evidencia reservada.' }
  }

  if (hasValidGrant(grants, evidence.id, requester.id, now)) {
    return { allowed: true, ttlSeconds: ttl, reason: 'Autorización explícita vigente.' }
  }

  if (isOnInvestigationTeam(teams, evidence.relatedInvestigation, requester.id)) {
    return { allowed: true, ttlSeconds: ttl, reason: 'Integrante del equipo de la investigación.' }
  }

  return {
    allowed: false,
    reason: 'Evidencia reservada: se requiere autorización explícita o pertenecer al equipo.',
  }
}

/**
 * The only shape of an evidence record that may reach the public frontend
 * (PRD Nº7 §70, PRD Nº8 §172).
 *
 * `bucket` and `objectKey` are absent by construction rather than by omission:
 * PRD Master §25 forbids returning an object key to a client, because knowing
 * where a file lives is most of the work of reaching it.
 */
export type PublicEvidence = {
  id: string | number
  title: string
  description?: string
  mimeType?: string
  size?: number
  /* The descriptive fields PRD Nº8 §84 puts on an evidence card. All of them
     are metadata a reader needs in order to judge a document — what kind of
     record it is, who issued it, when, and how long it runs. None of them
     reveals where the file lives. */
  documentType?: string
  institution?: string
  documentDate?: string
  pageCount?: number
}

export function toPublicEvidence(evidence: {
  id: string | number
  title: string
  description?: string | null
  mimeType?: string | null
  size?: number | null
  documentType?: string | null
  institution?: string | null
  documentDate?: string | null
  pageCount?: number | null
  classification: Classification
  status: EvidenceStatus
}): PublicEvidence | null {
  if (evidence.classification !== 'public' || evidence.status !== 'approved') return null

  return {
    id: evidence.id,
    title: evidence.title,
    ...(evidence.description ? { description: evidence.description } : {}),
    ...(evidence.mimeType ? { mimeType: evidence.mimeType } : {}),
    ...(evidence.size != null ? { size: evidence.size } : {}),
    ...(evidence.documentType ? { documentType: evidence.documentType } : {}),
    ...(evidence.institution ? { institution: evidence.institution } : {}),
    ...(evidence.documentDate ? { documentDate: evidence.documentDate } : {}),
    ...(evidence.pageCount != null ? { pageCount: evidence.pageCount } : {}),
  }
}
