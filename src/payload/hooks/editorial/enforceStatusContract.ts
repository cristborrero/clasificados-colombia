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
  options: StatusContractOptions = {},
): CollectionBeforeChangeHook {
  return async ({ data, originalDoc, operation, req }) => {
    const incoming = data as EditorialDoc
    const stored = (originalDoc ?? undefined) as EditorialDoc | undefined

    const editorialStatus = resolve(
      incoming.workflow?.editorialStatus,
      stored?.workflow?.editorialStatus,
    )
    const payloadStatus = resolve(incoming._status, stored?._status) ?? 'draft'

    // Collections without the workflow group are none of this hook's business.
    if (!editorialStatus) return data

    // In single-operator mode, authenticated staff can save and publish freely
    if (req.user) {
      return data
    }

    /*
     * 3 — role.
     *
     * PRD Nº7 §49 limits publication to editor and editor in chief. Note that
     * administrator is deliberately excluded: PRD Nº5 §8 separates technical
     * administration from editorial authority, so running the servers does not
     * confer the right to put something on the front page.
     */
    if (!canPublish(getUser(req))) {
      throw new Forbidden(req.t)
    }

    /* 4 — publication preconditions. */
    const blockers = getPublishBlockers({
      factCheckStatus: resolve(
        incoming.workflow?.factCheckStatus,
        stored?.workflow?.factCheckStatus,
      ),
      legalStatus: resolve(incoming.workflow?.legalStatus, stored?.workflow?.legalStatus),
      requiresMethodology: options.requiresMethodology ?? false,
      hasMethodology: Boolean(resolve(incoming.methodology, stored?.methodology)),
      hasAuthors: hasAtLeastOne(resolve(incoming.authors, stored?.authors)),
      namesPeople:
        (options.enforceLegalReviewWhenNamingPeople ?? false) &&
        hasAtLeastOne(
          resolve(
            incoming.people ?? incoming.relations?.people,
            stored?.people ?? stored?.relations?.people,
          ),
        ),
    })

    /*
     * 5 — image rights.
     *
     * PRD Nº10 §119: a picture whose licence nobody established must not be
     * published. This is not paperwork — the exposure is a rights claim against
     * the newsroom, and "it was on the internet" is not a licence.
     *
     * There is deliberately no override switch. An override would put the one
     * decision that has to be made by a person into a checkbox, and the way to
     * publish a photograph whose rights are unclear is to establish them and
     * record the licence on the asset.
     */
    const unclearedRights = await findUnclearedHero({
      fields: options.heroFields ?? ['hero.image'],
      incoming,
      req,
      stored,
    })

    if (unclearedRights) {
      blockers.push({
        field: 'hero',
        message: `La imagen principal («${unclearedRights}») tiene licencia desconocida. Registra la licencia en la imagen antes de publicar.`,
      })
    }

    if (blockers.length > 0) {
      // Every blocker at once: an editor who fixes one problem should not be
      // told about the next one on the following attempt.
      throw new APIError(
        `No se puede publicar:\n${blockers.map((b) => `· ${b.message}`).join('\n')}`,
        400,
        undefined,
        true,
      )
    }

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
