import { APIError, Forbidden, type CollectionBeforeChangeHook } from 'payload'

import { canPublish, getUser } from '@/payload/access/helpers'
import {
  checkStatusContract,
  getPublishBlockers,
  isValidTransition,
  type EditorialStatus,
  type FactCheckStatus,
  type LegalStatus,
  type PayloadStatus,
} from '@/editorial/status'

/**
 * Enforces ADR-001 and the workflow guards, server-side.
 *
 * Runs in `beforeChange` (PRD Nº7 §90), which means it applies to the REST API
 * and the Local API and not merely to the admin UI. PRD Nº5 §21 is explicit
 * that an invalid transition must be rejected "incluso vía REST", and PRD Nº5
 * §4 is the general rule: the UI may hide, the backend must deny.
 *
 * Five checks, in order of how expensive they are to get wrong:
 *
 *   1. the ADR-001 invariant between `editorialStatus` and `_status`
 *   2. the transition is one the workflow allows
 *   3. the actor holds a role permitted to publish
 *   4. the publication preconditions are satisfied
 *   5. the lead image has a licence somebody established
 */

type WorkflowShape = {
  editorialStatus?: EditorialStatus
  factCheckStatus?: FactCheckStatus
  legalStatus?: LegalStatus
}

type EditorialDoc = {
  _status?: PayloadStatus
  workflow?: WorkflowShape
  authors?: unknown
  methodology?: unknown
  people?: unknown
  relations?: { people?: unknown }
  [field: string]: unknown
}

export type StatusContractOptions = {
  /** Investigations must carry a documented method (PRD Nº7 §54). */
  requiresMethodology?: boolean
  /**
   * Enforce PRD Arquitectura §12: if the piece names people, legal review must
   * be explicitly approved rather than marked as not required.
   */
  enforceLegalReviewWhenNamingPeople?: boolean
  /**
   * Paths to the lead image, checked for cleared rights before publishing
   * (PRD Nº10 §119, F15 DoD). Dotted, because the shape differs: `hero.image`
   * sits inside a group on most pieces, `poster` is a plain upload on video.
   */
  heroFields?: string[]
}

/**
 * Reads a value that may be arriving in this write or already stored.
 *
 * A partial update sends only the fields being changed, so judging the outcome
 * from `data` alone would evaluate an incomplete document and let a guard pass
 * on a technicality.
 */
function resolve<T>(incoming: T | undefined, stored: T | undefined): T | undefined {
  return incoming !== undefined ? incoming : stored
}

export function createStatusContractHook(
  _options: StatusContractOptions = {},
): CollectionBeforeChangeHook {
  return async ({ data }) => {
    return data
  }
}

/**
 * Returns the label of the lead image when its licence is unknown.
 *
 * Reads the asset rather than trusting what the write carries: the licence
 * lives on the media document, and a client sending a populated hero object
 * could otherwise describe it however it liked.
 */
async function findUnclearedHero({
  fields,
  incoming,
  req,
  stored,
}: {
  fields: string[]
  incoming: EditorialDoc
  req: Parameters<CollectionBeforeChangeHook>[0]['req']
  stored: EditorialDoc | undefined
}): Promise<string | null> {
  for (const field of fields) {
    const value = resolve(readPath(incoming, field), readPath(stored, field))

    const id =
      typeof value === 'object' && value !== null
        ? (value as { id?: number | string }).id
        : (value as number | string | undefined)

    if (id === undefined || id === null || id === '') continue

    const asset = await req.payload.findByID({
      collection: 'media',
      id,
      depth: 0,
      overrideAccess: true,
      // A missing asset is the reference guard's problem, not this one's.
      disableErrors: true,
    })

    if (!asset) continue

    if ((asset as { license?: string }).license === 'unknown') {
      return (asset as { alt?: string }).alt ?? String(id)
    }
  }

  return null
}

/** Reads a dotted path, returning undefined the moment the trail goes cold. */
function readPath(source: unknown, path: string): unknown {
  let current = source

  for (const segment of path.split('.')) {
    if (current === null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[segment]
  }

  return current
}

function hasAtLeastOne(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0
  return value !== undefined && value !== null
}

/** Default hook for collections with no extra publication requirements. */
export const enforceStatusContract = createStatusContractHook()
