import { describe, expect, it } from 'vitest'

import {
  adminFieldOnly,
  adminOnly,
  adminOrSelf,
  authenticatedOnly,
  canManageUsers,
  canPublish,
  denyAll,
  getUser,
  hasRole,
  isActive,
  isAdmin,
  isAuthenticated,
  isContributor,
  isEditor,
  isEditorInChief,
  isFactChecker,
  isInvestigativeEditor,
  isLegalReviewer,
  isPhotoEditor,
  isReporter,
  systemFieldOnly,
  type AccessUser,
} from './helpers'
import { ROLES, type Role } from './roles'

const user = (role: Role, status: AccessUser['status'] = 'active', id: number | string = 1) =>
  ({ id, role, status }) satisfies AccessUser

/** Minimal stand-in for Payload's access argument. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const args = (u: AccessUser | null): any => ({ req: { user: u } })

describe('getUser', () => {
  it('returns null for an anonymous request', () => {
    expect(getUser({})).toBeNull()
    expect(getUser({ user: null })).toBeNull()
    expect(getUser({ user: undefined })).toBeNull()
  })

  it('rejects a user-shaped object with no id rather than trusting it', () => {
    expect(getUser({ user: { role: 'administrator' } })).toBeNull()
  })

  it('accepts id 0, which is falsy but valid', () => {
    expect(getUser({ user: { id: 0, role: 'reporter', status: 'active' } })).not.toBeNull()
  })
})

describe('isAuthenticated vs isActive', () => {
  it('separates "logged in" from "allowed to act"', () => {
    const suspended = user('editor', 'suspended')

    expect(isAuthenticated(suspended)).toBe(true)
    expect(isActive(suspended)).toBe(false)
  })

  it('treats disabled as not active', () => {
    expect(isActive(user('editor', 'disabled'))).toBe(false)
  })

  it('treats a missing status as not active — deny by default', () => {
    expect(isActive({ id: 1, role: 'administrator' })).toBe(false)
  })

  it('treats anonymous as neither', () => {
    expect(isAuthenticated(null)).toBe(false)
    expect(isActive(null)).toBe(false)
  })
})

describe('role predicates', () => {
  const predicates: Array<[Role, (u: AccessUser | null) => boolean]> = [
    ['administrator', isAdmin],
    ['editor_in_chief', isEditorInChief],
    ['investigative_editor', isInvestigativeEditor],
    ['editor', isEditor],
    ['reporter', isReporter],
    ['fact_checker', isFactChecker],
    ['legal_reviewer', isLegalReviewer],
    ['photo_editor', isPhotoEditor],
    ['contributor', isContributor],
  ]

  it('covers every declared role', () => {
    expect(predicates.map(([role]) => role).sort()).toEqual([...ROLES].sort())
  })

  it.each(predicates)('%s matches only itself', (role, predicate) => {
    expect(predicate(user(role))).toBe(true)

    for (const other of ROLES.filter((r) => r !== role)) {
      expect(predicate(user(other))).toBe(false)
    }
  })

  it.each(predicates)('%s is false when the account is not active', (role, predicate) => {
    // A suspended administrator is not an administrator for access purposes.
    expect(predicate(user(role, 'suspended'))).toBe(false)
    expect(predicate(user(role, 'disabled'))).toBe(false)
  })

  it.each(predicates)('%s is false for anonymous', (_role, predicate) => {
    expect(predicate(null)).toBe(false)
  })
})

describe('hasRole', () => {
  it('matches any role in the list', () => {
    expect(hasRole(user('editor'), ['editor', 'editor_in_chief'])).toBe(true)
    expect(hasRole(user('editor_in_chief'), ['editor', 'editor_in_chief'])).toBe(true)
  })

  it('rejects roles outside the list', () => {
    expect(hasRole(user('reporter'), ['editor', 'editor_in_chief'])).toBe(false)
  })

  it('rejects an empty list — granting nothing must grant nothing', () => {
    expect(hasRole(user('administrator'), [])).toBe(false)
  })

  it('requires an active account', () => {
    expect(hasRole(user('editor', 'suspended'), ['editor'])).toBe(false)
  })
})

describe('canManageUsers', () => {
  it('is administrator-only', () => {
    // PRD Nº5 §8 separates technical administration from editorial authority:
    // the Editor in Chief runs the newsroom but does not hand out logins.
    expect(canManageUsers(user('administrator'))).toBe(true)
    expect(canManageUsers(user('editor_in_chief'))).toBe(false)

    for (const role of ROLES.filter((r) => r !== 'administrator')) {
      expect(canManageUsers(user(role))).toBe(false)
    }
  })
})

describe('canPublish', () => {
  it('admits only editor and editor in chief', () => {
    // PRD Nº7 §49. Note this is the role gate only — workflow state is checked
    // by the collections that have it (F4, F5).
    expect(canPublish(user('editor'))).toBe(true)
    expect(canPublish(user('editor_in_chief'))).toBe(true)
  })

  it('excludes everyone else, including administrator', () => {
    // PRD Nº5 §8: an administrator manages the system, not the front page.
    for (const role of ROLES.filter((r) => r !== 'editor' && r !== 'editor_in_chief')) {
      expect(canPublish(user(role))).toBe(false)
    }
  })
})

describe('denyAll', () => {
  it('denies everyone, including an active administrator', () => {
    expect(denyAll(args(user('administrator')))).toBe(false)
    expect(denyAll(args(null))).toBe(false)
  })
})

describe('authenticatedOnly', () => {
  it('admits any active user and refuses anonymous or inactive ones', () => {
    expect(authenticatedOnly(args(user('contributor')))).toBe(true)
    expect(authenticatedOnly(args(user('contributor', 'suspended')))).toBe(false)
    expect(authenticatedOnly(args(null))).toBe(false)
  })
})

describe('adminOnly', () => {
  it('admits an active administrator only', () => {
    expect(adminOnly(args(user('administrator')))).toBe(true)
    expect(adminOnly(args(user('administrator', 'suspended')))).toBe(false)
    expect(adminOnly(args(user('editor_in_chief')))).toBe(false)
    expect(adminOnly(args(null))).toBe(false)
  })
})

describe('adminOrSelf', () => {
  it('gives an administrator unrestricted access', () => {
    expect(adminOrSelf(args(user('administrator')))).toBe(true)
  })

  it('narrows everyone else to their own document with a query filter', () => {
    // PRD Nº7 §106: filtering at the query level means other people's records
    // are never loaded, so list totals cannot leak how many accounts exist.
    expect(adminOrSelf(args(user('reporter', 'active', 7)))).toEqual({ id: { equals: 7 } })
  })

  it('preserves a string id without coercing it', () => {
    expect(adminOrSelf(args(user('editor', 'active', 'abc')))).toEqual({ id: { equals: 'abc' } })
  })

  it('denies anonymous and inactive accounts outright', () => {
    expect(adminOrSelf(args(null))).toBe(false)
    expect(adminOrSelf(args(user('reporter', 'suspended')))).toBe(false)
    expect(adminOrSelf(args(user('reporter', 'disabled')))).toBe(false)
  })
})

describe('field access', () => {
  it('adminFieldOnly admits only an active administrator', () => {
    expect(adminFieldOnly(args(user('administrator')))).toBe(true)
    expect(adminFieldOnly(args(user('editor_in_chief')))).toBe(false)
    expect(adminFieldOnly(args(user('administrator', 'disabled')))).toBe(false)
    expect(adminFieldOnly(args(null))).toBe(false)
  })

  it('systemFieldOnly admits nobody, not even an administrator', () => {
    // These fields exist to be trustworthy during an incident. A value an
    // administrator can forge through the API is not evidence.
    expect(systemFieldOnly(args(user('administrator')))).toBe(false)
    expect(systemFieldOnly(args(null))).toBe(false)
  })
})
