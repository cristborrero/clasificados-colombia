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
 * Four checks, in order of how expensive they are to get wrong:
 *
 *   1. the ADR-001 invariant between `editorialStatus` and `_status`
 *   2. the transition is one the workflow allows
 *   3. the actor holds a role permitted to publish
 *   4. the publication preconditions are satisfied
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
}

export type StatusContractOptions = {
  /** Investigations must carry a documented method (PRD Nº7 §54). */
  requiresMethodology?: boolean
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
  return ({ data, originalDoc, operation, req }) => {
    const incoming = data as EditorialDoc
    const stored = (originalDoc ?? undefined) as EditorialDoc | undefined

    const editorialStatus = resolve(
      incoming.workflow?.editorialStatus,
      stored?.workflow?.editorialStatus,
    )
    const payloadStatus = resolve(incoming._status, stored?._status) ?? 'draft'

    // Collections without the workflow group are none of this hook's business.
    if (!editorialStatus) return data

    /* 1 — ADR-001 invariant. */
    const violation = checkStatusContract({ editorialStatus, _status: payloadStatus })

    if (violation) {
      throw new APIError(violation.message, 400, undefined, true)
    }

    const previousStatus = stored?.workflow?.editorialStatus

    /* 2 — the workflow allows this move. */
    if (operation === 'update' && previousStatus && previousStatus !== editorialStatus) {
      if (!isValidTransition(previousStatus, editorialStatus)) {
        throw new APIError(
          `Transición no permitida: "${previousStatus}" → "${editorialStatus}".`,
          400,
          undefined,
          true,
        )
      }
    }

    /* Checks 3 and 4 only apply to becoming public. */
    const becomingPublic = editorialStatus === 'published' && previousStatus !== 'published'

    if (!becomingPublic) return data

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
    })

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

function hasAtLeastOne(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0
  return value !== undefined && value !== null
}

/** Default hook for collections with no extra publication requirements. */
export const enforceStatusContract = createStatusContractHook()
