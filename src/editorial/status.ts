/**
 * The editorial status contract.
 *
 * Implements ADR-001 (`docs/adr/ADR-001-contrato-status-editorial.md`), which
 * resolves conflict C-06 and mitigates risk R-01.
 *
 * Two fields, disjoint responsibilities:
 *
 *   `_status`          — public visibility. The only filter on anonymous reads.
 *   `editorialStatus`  — position in the newsroom process. Governs who may
 *                        modify and who may transition.
 *
 * Kept as pure functions, deliberately. This is the logic that decides whether
 * an investigation still under legal review can be reached from the internet,
 * so it should be exercisable without booting Payload, a database or a server.
 */

/* ── Vocabulary (PRD Nº7 §39-§41) ──────────────────────────────────────────*/

export const EDITORIAL_STATUSES = [
  'draft',
  'editing',
  'fact_check',
  'legal_review',
  'approved',
  'scheduled',
  'published',
  'archived',
] as const

export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number]

export const FACT_CHECK_STATUSES = [
  'not_required',
  'not_started',
  'in_progress',
  'verified',
  'issues_found',
] as const

export type FactCheckStatus = (typeof FACT_CHECK_STATUSES)[number]

export const LEGAL_STATUSES = ['not_required', 'pending', 'approved', 'changes_required'] as const

export type LegalStatus = (typeof LEGAL_STATUSES)[number]

/** Payload's native draft flag. */
export type PayloadStatus = 'draft' | 'published'

export const EDITORIAL_STATUS_LABELS: Record<EditorialStatus, string> = {
  draft: 'Borrador',
  editing: 'En edición',
  fact_check: 'En verificación',
  legal_review: 'En revisión legal',
  approved: 'Aprobado',
  scheduled: 'Programado',
  published: 'Publicado',
  archived: 'Archivado',
}

export const FACT_CHECK_STATUS_LABELS: Record<FactCheckStatus, string> = {
  not_required: 'No requiere',
  not_started: 'Sin iniciar',
  in_progress: 'En proceso',
  verified: 'Verificado',
  issues_found: 'Con hallazgos',
}

export const LEGAL_STATUS_LABELS: Record<LegalStatus, string> = {
  not_required: 'No requiere',
  pending: 'Pendiente',
  approved: 'Aprobado',
  changes_required: 'Requiere cambios',
}

const toOptions = <T extends string>(values: readonly T[], labels: Record<T, string>) =>
  values.map((value) => ({ label: labels[value], value }))

export const editorialStatusOptions = toOptions(EDITORIAL_STATUSES, EDITORIAL_STATUS_LABELS)
export const factCheckStatusOptions = toOptions(FACT_CHECK_STATUSES, FACT_CHECK_STATUS_LABELS)
export const legalStatusOptions = toOptions(LEGAL_STATUSES, LEGAL_STATUS_LABELS)

/* ── The invariant (ADR-001) ───────────────────────────────────────────────*/

/**
 * Statuses that must never be publicly visible.
 *
 * Everything before `published` in the workflow. `archived` is deliberately
 * absent: PRD Arquitectura §48 asks to prefer archiving over deletion and to
 * show a proper state rather than a bare 404, so an archived piece may remain
 * visible. That choice belongs to the withdrawal flow (F17), not here.
 */
export const NON_PUBLIC_STATUSES = [
  'draft',
  'editing',
  'fact_check',
  'legal_review',
  'approved',
  'scheduled',
] as const satisfies readonly EditorialStatus[]

export function isNonPublicStatus(status: EditorialStatus): boolean {
  return (NON_PUBLIC_STATUSES as readonly EditorialStatus[]).includes(status)
}

export type StatusPair = {
  editorialStatus: EditorialStatus
  _status: PayloadStatus
}

export type ContractViolation = {
  rule: 1 | 2 | 3
  message: string
}

/**
 * Checks the ADR-001 invariant.
 *
 * Returns the violated rule, or `null` when the pair is coherent. Returning the
 * rule number rather than a boolean means the error message can say which
 * guarantee broke, which matters when the answer is "an investigation in legal
 * review was about to become publicly readable".
 */
export function checkStatusContract({
  editorialStatus,
  _status,
}: StatusPair): ContractViolation | null {
  // Rule 1 — nothing before `published` may be publicly visible.
  if (isNonPublicStatus(editorialStatus) && _status === 'published') {
    return {
      rule: 1,
      message:
        `No se puede publicar contenido en estado editorial "${EDITORIAL_STATUS_LABELS[editorialStatus]}". ` +
        'Solo el contenido publicado o archivado puede ser visible al público.',
    }
  }

  // Rule 2 — if the newsroom says published, it must actually be visible.
  if (editorialStatus === 'published' && _status !== 'published') {
    return {
      rule: 2,
      message:
        'Un contenido con estado editorial "Publicado" debe estar visible públicamente. ' +
        'Publicarlo y dejarlo oculto haría creer a la redacción que la pieza está en línea.',
    }
  }

  // Rule 3 — public visibility requires the newsroom to have published it.
  if (
    _status === 'published' &&
    editorialStatus !== 'published' &&
    editorialStatus !== 'archived'
  ) {
    return {
      rule: 3,
      message:
        'Solo el contenido con estado editorial "Publicado" o "Archivado" puede estar visible públicamente.',
    }
  }

  return null
}

export function isStatusContractValid(pair: StatusPair): boolean {
  return checkStatusContract(pair) === null
}

/**
 * The `_status` an editorial status implies.
 *
 * `archived` returns `null` because both values are legitimate there — the
 * withdrawal flow decides. Every other status has exactly one correct answer,
 * which is what makes the pair derivable rather than hand-managed.
 */
export function derivePayloadStatus(editorialStatus: EditorialStatus): PayloadStatus | null {
  if (editorialStatus === 'archived') return null
  return editorialStatus === 'published' ? 'published' : 'draft'
}

/* ── Transitions (PRD Nº5 §22-§23) ─────────────────────────────────────────*/

/**
 * Valid moves through the workflow.
 *
 * PRD Nº5 §22 allows simplified routes for news that needs no legal review,
 * which is why `editing` may reach `approved` directly and `draft` may reach
 * `fact_check`. What it does not allow is skipping to `published` from
 * anywhere — that edge exists only from `approved` and `scheduled`.
 *
 * Backward edges exist because review sends work back. `issues_found` and
 * `changes_required` are real outcomes, not exceptions.
 */
export const VALID_TRANSITIONS: Record<EditorialStatus, readonly EditorialStatus[]> = {
  draft: ['editing', 'fact_check', 'archived'],
  editing: ['draft', 'fact_check', 'legal_review', 'approved', 'archived'],
  fact_check: ['editing', 'legal_review', 'approved', 'archived'],
  legal_review: ['editing', 'fact_check', 'approved', 'archived'],
  approved: ['editing', 'scheduled', 'published', 'archived'],
  scheduled: ['approved', 'published', 'archived'],
  published: ['archived', 'editing'],
  archived: ['draft', 'editing'],
}

export function isValidTransition(from: EditorialStatus, to: EditorialStatus): boolean {
  if (from === to) return true
  return VALID_TRANSITIONS[from].includes(to)
}

/* ── Publish preconditions (PRD Nº5 §23-§24, PRD Nº7 §56) ──────────────────*/

export type PublishRequirements = {
  factCheckStatus?: FactCheckStatus | null
  legalStatus?: LegalStatus | null
  /** Investigations demand a documented method before publication (PRD Nº7 §54). */
  requiresMethodology?: boolean
  hasMethodology?: boolean
  hasAuthors?: boolean
}

export type PublishBlocker = {
  field: string
  message: string
}

/**
 * Everything that must be true before a piece may go public.
 *
 * Returns every blocker rather than the first one. An editor who fixes one
 * problem and is immediately told about the next has been made to do the same
 * work three times.
 */
export function getPublishBlockers(requirements: PublishRequirements): PublishBlocker[] {
  const blockers: PublishBlocker[] = []

  const { factCheckStatus, legalStatus, requiresMethodology, hasMethodology, hasAuthors } =
    requirements

  if (factCheckStatus && factCheckStatus !== 'verified' && factCheckStatus !== 'not_required') {
    blockers.push({
      field: 'workflow.factCheckStatus',
      message: 'La verificación de datos debe estar completa antes de publicar.',
    })
  }

  if (legalStatus && legalStatus !== 'approved' && legalStatus !== 'not_required') {
    blockers.push({
      field: 'workflow.legalStatus',
      message: 'La revisión legal debe estar aprobada antes de publicar.',
    })
  }

  if (requiresMethodology && !hasMethodology) {
    blockers.push({
      field: 'methodology',
      message: 'Una investigación no puede publicarse sin metodología documentada.',
    })
  }

  if (hasAuthors === false) {
    blockers.push({
      field: 'authors',
      message: 'El contenido publicado debe tener al menos un autor responsable.',
    })
  }

  return blockers
}

export function canBePublished(requirements: PublishRequirements): boolean {
  return getPublishBlockers(requirements).length === 0
}
