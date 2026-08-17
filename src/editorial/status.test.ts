import { describe, expect, it } from 'vitest'

import {
  canBePublished,
  checkStatusContract,
  derivePayloadStatus,
  EDITORIAL_STATUSES,
  getPublishBlockers,
  isNonPublicStatus,
  isStatusContractValid,
  isValidTransition,
  NON_PUBLIC_STATUSES,
  VALID_TRANSITIONS,
  type PayloadStatus,
} from './status'

const PAYLOAD_STATUSES: PayloadStatus[] = ['draft', 'published']

describe('vocabulary', () => {
  it('declares the eight workflow states from PRD Nº7 §39', () => {
    expect(EDITORIAL_STATUSES).toEqual([
      'draft',
      'editing',
      'fact_check',
      'legal_review',
      'approved',
      'scheduled',
      'published',
      'archived',
    ])
  })

  it('treats everything before publication as non-public, and archived as neither', () => {
    for (const status of EDITORIAL_STATUSES) {
      const expected = status !== 'published' && status !== 'archived'
      expect(isNonPublicStatus(status)).toBe(expected)
    }
  })
})

/**
 * ADR-001. These are the assertions that decide whether an investigation under
 * legal review can be reached from the internet.
 */
describe('ADR-001 · status contract', () => {
  it('accepts the only two fully coherent pairs', () => {
    expect(isStatusContractValid({ editorialStatus: 'draft', _status: 'draft' })).toBe(true)
    expect(isStatusContractValid({ editorialStatus: 'published', _status: 'published' })).toBe(true)
  })

  it('rule 1 — refuses to publish anything still in the workflow', () => {
    for (const status of NON_PUBLIC_STATUSES) {
      const violation = checkStatusContract({ editorialStatus: status, _status: 'published' })

      expect(violation, `${status} must not be publishable`).not.toBeNull()
      expect(violation?.rule).toBe(1)
    }
  })

  it('rule 1 — names legal review explicitly, because that is the dangerous case', () => {
    const violation = checkStatusContract({ editorialStatus: 'legal_review', _status: 'published' })

    expect(violation?.message).toContain('revisión legal'.split(' ')[1])
  })

  it('rule 2 — refuses editorially published content that stays hidden', () => {
    const violation = checkStatusContract({ editorialStatus: 'published', _status: 'draft' })

    expect(violation?.rule).toBe(2)
  })

  it('rule 3 — public visibility requires published or archived', () => {
    const violation = checkStatusContract({ editorialStatus: 'approved', _status: 'published' })

    expect(violation).not.toBeNull()
  })

  it('allows archived to be either visible or withdrawn', () => {
    // PRD Arquitectura §48: prefer archiving over deletion, and show a proper
    // state rather than a bare 404. Both are legitimate.
    for (const _status of PAYLOAD_STATUSES) {
      expect(isStatusContractValid({ editorialStatus: 'archived', _status })).toBe(true)
    }
  })

  it('leaves no combination unclassified', () => {
    // Every one of the sixteen pairs is either explicitly valid or explicitly
    // rejected. An unhandled combination is how a contract silently stops
    // holding.
    for (const editorialStatus of EDITORIAL_STATUSES) {
      for (const _status of PAYLOAD_STATUSES) {
        const result = checkStatusContract({ editorialStatus, _status })
        expect(result === null || [1, 2, 3].includes(result.rule)).toBe(true)
      }
    }
  })

  it('permits exactly the pairs the ADR permits, and no others', () => {
    const valid = EDITORIAL_STATUSES.flatMap((editorialStatus) =>
      PAYLOAD_STATUSES.filter((_status) => isStatusContractValid({ editorialStatus, _status })).map(
        (_status) => `${editorialStatus}/${_status}`,
      ),
    )

    expect(valid.sort()).toEqual(
      [
        'approved/draft',
        'archived/draft',
        'archived/published',
        'draft/draft',
        'editing/draft',
        'fact_check/draft',
        'legal_review/draft',
        'published/published',
        'scheduled/draft',
      ].sort(),
    )
  })
})

describe('derivePayloadStatus', () => {
  it('maps published to visible and everything else in the workflow to draft', () => {
    expect(derivePayloadStatus('published')).toBe('published')

    for (const status of NON_PUBLIC_STATUSES) {
      expect(derivePayloadStatus(status)).toBe('draft')
    }
  })

  it('refuses to decide for archived, where both answers are legitimate', () => {
    expect(derivePayloadStatus('archived')).toBeNull()
  })

  it('always derives a pair the contract accepts', () => {
    for (const editorialStatus of EDITORIAL_STATUSES) {
      const derived = derivePayloadStatus(editorialStatus)
      if (derived === null) continue

      expect(isStatusContractValid({ editorialStatus, _status: derived })).toBe(true)
    }
  })
})

describe('transitions', () => {
  it('never allows jumping straight to published', () => {
    // PRD Nº5 §21: draft → published by a reporter must be rejected even
    // through the REST API. Only approved and scheduled lead to publication.
    const canReachPublished = EDITORIAL_STATUSES.filter((from) =>
      VALID_TRANSITIONS[from].includes('published'),
    )

    expect(canReachPublished.sort()).toEqual(['approved', 'scheduled'])
    expect(isValidTransition('draft', 'published')).toBe(false)
    expect(isValidTransition('fact_check', 'published')).toBe(false)
    expect(isValidTransition('legal_review', 'published')).toBe(false)
  })

  it('allows the simplified route for news that needs no legal review', () => {
    // PRD Nº5 §22 explicitly permits this.
    expect(isValidTransition('editing', 'approved')).toBe(true)
    expect(isValidTransition('fact_check', 'approved')).toBe(true)
  })

  it('allows review to send work backwards', () => {
    expect(isValidTransition('fact_check', 'editing')).toBe(true)
    expect(isValidTransition('legal_review', 'editing')).toBe(true)
    expect(isValidTransition('approved', 'editing')).toBe(true)
  })

  it('treats a no-op as valid so unrelated edits do not trip the guard', () => {
    for (const status of EDITORIAL_STATUSES) {
      expect(isValidTransition(status, status)).toBe(true)
    }
  })

  it('lets anything be archived, and archived content be revived', () => {
    for (const status of EDITORIAL_STATUSES.filter((s) => s !== 'archived')) {
      expect(isValidTransition(status, 'archived')).toBe(true)
    }

    expect(isValidTransition('archived', 'draft')).toBe(true)
  })

  it('only names declared statuses as destinations', () => {
    for (const targets of Object.values(VALID_TRANSITIONS)) {
      for (const target of targets) {
        expect(EDITORIAL_STATUSES).toContain(target)
      }
    }
  })
})

describe('publish preconditions', () => {
  it('passes when nothing is outstanding', () => {
    expect(
      canBePublished({ factCheckStatus: 'verified', legalStatus: 'approved', hasAuthors: true }),
    ).toBe(true)
  })

  it('blocks on unfinished fact checking', () => {
    for (const status of ['not_started', 'in_progress', 'issues_found'] as const) {
      expect(canBePublished({ factCheckStatus: status })).toBe(false)
    }
  })

  it('blocks on unresolved legal review', () => {
    for (const status of ['pending', 'changes_required'] as const) {
      expect(canBePublished({ legalStatus: status })).toBe(false)
    }
  })

  it('accepts not_required as a real answer, not a missing one', () => {
    // News that genuinely needs no legal review must not be held hostage.
    expect(canBePublished({ factCheckStatus: 'not_required', legalStatus: 'not_required' })).toBe(
      true,
    )
  })

  it('demands methodology from investigations only', () => {
    expect(canBePublished({ requiresMethodology: true, hasMethodology: false })).toBe(false)
    expect(canBePublished({ requiresMethodology: true, hasMethodology: true })).toBe(true)
    expect(canBePublished({ requiresMethodology: false, hasMethodology: false })).toBe(true)
  })

  it('demands a responsible author', () => {
    // PRD SEO §24 and §31: published journalism carries a byline.
    expect(canBePublished({ hasAuthors: false })).toBe(false)
  })

  it('reports every blocker at once rather than one per attempt', () => {
    const blockers = getPublishBlockers({
      factCheckStatus: 'in_progress',
      legalStatus: 'pending',
      requiresMethodology: true,
      hasMethodology: false,
      hasAuthors: false,
    })

    expect(blockers).toHaveLength(4)
    expect(blockers.map((b) => b.field)).toEqual([
      'workflow.factCheckStatus',
      'workflow.legalStatus',
      'methodology',
      'authors',
    ])
  })
})
