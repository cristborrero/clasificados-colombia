import { describe, expect, it } from 'vitest'

import { ROLES, type Role } from '@/payload/access/roles'
import {
  BUCKET_BY_CLASSIFICATION,
  CLASSIFICATIONS,
  decideEvidenceAccess,
  hasValidGrant,
  isGrantValid,
  isOnInvestigationTeam,
  toPublicEvidence,
  URL_TTL_SECONDS,
  type Classification,
  type EvidenceDescriptor,
} from './authorization'

const requester = (role: Role, id: number | string = 10, status = 'active') => ({
  id,
  role,
  status,
})

const evidence = (
  classification: Classification,
  status: EvidenceDescriptor['status'] = 'approved',
  relatedInvestigation: number | null = null,
): EvidenceDescriptor => ({ id: 1, classification, status, relatedInvestigation })

describe('classification mapping', () => {
  it('maps each classification to its own bucket', () => {
    // PRD Nº4 §21: separation lives in storage policy, not only in metadata.
    expect(BUCKET_BY_CLASSIFICATION).toEqual({
      public: 'evidence-public',
      internal: 'evidence-internal',
      restricted: 'evidence-restricted',
    })

    expect(new Set(Object.values(BUCKET_BY_CLASSIFICATION)).size).toBe(CLASSIFICATIONS.length)
  })

  it('gives restricted material the shortest URL lifetime', () => {
    // PRD Nº5 §39: a presigned URL cannot be revoked, so expiry is the only
    // control that exists. PRD Nº5 §40 caps restricted at 60–300 seconds.
    expect(URL_TTL_SECONDS.restricted).toBeLessThanOrEqual(300)
    expect(URL_TTL_SECONDS.restricted).toBeLessThan(URL_TTL_SECONDS.internal)
    expect(URL_TTL_SECONDS.internal).toBeLessThan(URL_TTL_SECONDS.public)
  })
})

describe('grant validity', () => {
  const future = new Date(Date.now() + 86_400_000).toISOString()
  const past = new Date(Date.now() - 86_400_000).toISOString()

  it('accepts an unexpired, unrevoked grant', () => {
    expect(isGrantValid({ evidence: 1, user: 10, expiresAt: future })).toBe(true)
  })

  it('accepts a grant with no expiry', () => {
    expect(isGrantValid({ evidence: 1, user: 10 })).toBe(true)
  })

  it('rejects an expired grant', () => {
    expect(isGrantValid({ evidence: 1, user: 10, expiresAt: past })).toBe(false)
  })

  it('rejects a revoked grant even if it has not expired', () => {
    // Revocation must win: that is the whole point of revoking.
    expect(isGrantValid({ evidence: 1, user: 10, expiresAt: future, revokedAt: past })).toBe(false)
  })

  it('matches on both evidence and user, never one alone', () => {
    const grants = [{ evidence: 1, user: 10, expiresAt: future }]

    expect(hasValidGrant(grants, 1, 10)).toBe(true)
    expect(hasValidGrant(grants, 2, 10)).toBe(false)
    expect(hasValidGrant(grants, 1, 99)).toBe(false)
  })

  it('compares ids as strings, so 1 and "1" are the same person', () => {
    expect(hasValidGrant([{ evidence: '1', user: '10' }], 1, 10)).toBe(true)
  })
})

describe('investigation teams', () => {
  const team = { investigation: 5, members: [10, 11] }

  it('grants membership only for the matching investigation', () => {
    expect(isOnInvestigationTeam([team], 5, 10)).toBe(true)
    expect(isOnInvestigationTeam([team], 6, 10)).toBe(false)
  })

  it('ignores an inactive team', () => {
    // PRD Nº5 §44: access ends when the work does.
    expect(isOnInvestigationTeam([{ ...team, active: false }], 5, 10)).toBe(false)
  })

  it('returns false when the evidence belongs to no investigation', () => {
    expect(isOnInvestigationTeam([team], null, 10)).toBe(false)
    expect(isOnInvestigationTeam([team], undefined, 10)).toBe(false)
  })
})

describe('public evidence', () => {
  it('is reachable without an account once approved', () => {
    const decision = decideEvidenceAccess({ requester: null, evidence: evidence('public') })

    expect(decision.allowed).toBe(true)
  })

  it('is NOT reachable while still pending approval', () => {
    // PRD Nº7 §70 and PRD Nº5 §30: public means declassified, not merely
    // labelled. Marking a document public is a request, not a release.
    for (const status of ['pending', 'verified', 'archived'] as const) {
      expect(
        decideEvidenceAccess({ requester: null, evidence: evidence('public', status) }).allowed,
      ).toBe(false)
    }
  })
})

describe('internal evidence', () => {
  it('is unreachable anonymously', () => {
    expect(decideEvidenceAccess({ requester: null, evidence: evidence('internal') }).allowed).toBe(
      false,
    )
  })

  it('is unreachable by a suspended account holding a valid token', () => {
    const decision = decideEvidenceAccess({
      requester: requester('editor', 10, 'suspended'),
      evidence: evidence('internal'),
    })

    expect(decision.allowed).toBe(false)
  })

  it('is reachable by newsroom roles', () => {
    for (const role of ['editor_in_chief', 'investigative_editor', 'editor', 'reporter'] as const) {
      expect(
        decideEvidenceAccess({ requester: requester(role), evidence: evidence('internal') })
          .allowed,
      ).toBe(true)
    }
  })

  it('is not reachable by a photo editor or a contributor', () => {
    // PRD Nº5 §8: a photo editor manages imagery, not source material.
    for (const role of ['photo_editor', 'contributor'] as const) {
      expect(
        decideEvidenceAccess({ requester: requester(role), evidence: evidence('internal') })
          .allowed,
      ).toBe(false)
    }
  })
})

/**
 * The rules that protect sources. PRD Nº5 §42 and §46: role is necessary and
 * never sufficient.
 */
describe('restricted evidence · need to know', () => {
  it('refuses every role without a grant or team membership', () => {
    for (const role of ROLES) {
      const decision = decideEvidenceAccess({
        requester: requester(role),
        evidence: evidence('restricted'),
      })

      expect(decision.allowed, `${role} must not reach restricted evidence by role alone`).toBe(
        false,
      )
    }
  })

  it('refuses an administrator even with a team and a grant for someone else', () => {
    // PRD Nº5 §46 is explicit: a technical administrator does not need to read
    // journalistic evidence. Running the servers is not need-to-know.
    const decision = decideEvidenceAccess({
      requester: requester('administrator', 10),
      evidence: evidence('restricted', 'approved', 5),
      grants: [{ evidence: 1, user: 99 }],
      teams: [{ investigation: 5, members: [11] }],
    })

    expect(decision.allowed).toBe(false)
  })

  it('refuses an administrator holding a grant, because the role is not permitted at all', () => {
    const decision = decideEvidenceAccess({
      requester: requester('administrator', 10),
      evidence: evidence('restricted'),
      grants: [{ evidence: 1, user: 10 }],
    })

    expect(decision.allowed).toBe(false)
  })

  it('allows a permitted role holding a valid grant', () => {
    const decision = decideEvidenceAccess({
      requester: requester('reporter', 10),
      evidence: evidence('restricted'),
      grants: [{ evidence: 1, user: 10 }],
    })

    expect(decision.allowed).toBe(true)
    expect(decision.allowed && decision.ttlSeconds).toBe(URL_TTL_SECONDS.restricted)
  })

  it('allows a permitted role on the investigation team', () => {
    const decision = decideEvidenceAccess({
      requester: requester('reporter', 10),
      evidence: evidence('restricted', 'approved', 5),
      teams: [{ investigation: 5, members: [10] }],
    })

    expect(decision.allowed).toBe(true)
  })

  it('refuses a permitted role on a DIFFERENT investigation team', () => {
    // The case PRD Nº5 §96 names: an editor must not reach restricted evidence
    // from an investigation they are not part of.
    const decision = decideEvidenceAccess({
      requester: requester('reporter', 10),
      evidence: evidence('restricted', 'approved', 5),
      teams: [{ investigation: 6, members: [10] }],
    })

    expect(decision.allowed).toBe(false)
  })

  it('refuses once the grant has expired', () => {
    const decision = decideEvidenceAccess({
      requester: requester('reporter', 10),
      evidence: evidence('restricted'),
      grants: [{ evidence: 1, user: 10, expiresAt: new Date(Date.now() - 1000).toISOString() }],
    })

    expect(decision.allowed).toBe(false)
  })

  it('refuses once the grant has been revoked', () => {
    const decision = decideEvidenceAccess({
      requester: requester('reporter', 10),
      evidence: evidence('restricted'),
      grants: [{ evidence: 1, user: 10, revokedAt: new Date().toISOString() }],
    })

    expect(decision.allowed).toBe(false)
  })
})

describe('quarantine', () => {
  it('blocks everyone, at every classification', () => {
    // PRD Nº6 §41: a scan that did not finish does not mean clean, it means
    // unknown — and unknown is not something to open.
    for (const classification of CLASSIFICATIONS) {
      const decision = decideEvidenceAccess({
        requester: requester('editor_in_chief'),
        evidence: evidence(classification, 'quarantined'),
        grants: [{ evidence: 1, user: 10 }],
      })

      expect(decision.allowed).toBe(false)
    }
  })
})

describe('toPublicEvidence', () => {
  const row = {
    id: 1,
    title: 'Contrato 2021-087',
    description: 'Documento oficial',
    mimeType: 'application/pdf',
    size: 2_100_000,
  }

  it('projects approved public evidence', () => {
    const projected = toPublicEvidence({ ...row, classification: 'public', status: 'approved' })

    expect(projected).toEqual({
      id: 1,
      title: 'Contrato 2021-087',
      description: 'Documento oficial',
      mimeType: 'application/pdf',
      size: 2_100_000,
    })
  })

  it('never leaks the storage location', () => {
    // PRD Master §25 / PRD Nº7 §68: knowing where a file lives is most of the
    // work of reaching it, so the projection has no place to put it.
    const projected = toPublicEvidence({ ...row, classification: 'public', status: 'approved' })

    expect(projected).not.toHaveProperty('bucket')
    expect(projected).not.toHaveProperty('objectKey')
    expect(projected).not.toHaveProperty('checksum')
  })

  it('returns null for anything not public and approved', () => {
    expect(toPublicEvidence({ ...row, classification: 'internal', status: 'approved' })).toBeNull()
    expect(
      toPublicEvidence({ ...row, classification: 'restricted', status: 'approved' }),
    ).toBeNull()
    expect(toPublicEvidence({ ...row, classification: 'public', status: 'pending' })).toBeNull()
  })
})

describe('toPublicEvidence · descriptive metadata (PRD Nº8 §84)', () => {
  const approved = {
    id: 7,
    title: 'Contrato 2025-0431',
    classification: 'public' as const,
    status: 'approved' as const,
  }

  it('carries the fields an evidence card needs', () => {
    expect(
      toPublicEvidence({
        ...approved,
        documentType: 'Contrato',
        institution: 'Gobernación',
        documentDate: '2025-11-03T00:00:00.000Z',
        pageCount: 18,
      }),
    ).toEqual({
      id: 7,
      title: 'Contrato 2025-0431',
      documentType: 'Contrato',
      institution: 'Gobernación',
      documentDate: '2025-11-03T00:00:00.000Z',
      pageCount: 18,
    })
  })

  it('still never carries a location', () => {
    // The point of the projection: bucket and objectKey are absent by
    // construction, and adding descriptive fields must not change that.
    const projected = toPublicEvidence({
      ...approved,
      documentType: 'Contrato',
      institution: 'Gobernación',
    })

    expect(projected).not.toHaveProperty('bucket')
    expect(projected).not.toHaveProperty('objectKey')
    expect(Object.keys(projected!)).toEqual(['id', 'title', 'documentType', 'institution'])
  })

  it('omits empty metadata rather than emitting nulls', () => {
    expect(
      toPublicEvidence({ ...approved, documentType: null, institution: '', pageCount: null }),
    ).toEqual({ id: 7, title: 'Contrato 2025-0431' })
  })

  it('refuses a restricted document however complete its metadata', () => {
    expect(
      toPublicEvidence({
        ...approved,
        classification: 'restricted',
        documentType: 'Contrato',
        institution: 'Gobernación',
      }),
    ).toBeNull()
  })

  it('refuses a public document that has not been approved', () => {
    expect(toPublicEvidence({ ...approved, status: 'pending', pageCount: 18 })).toBeNull()
  })
})
