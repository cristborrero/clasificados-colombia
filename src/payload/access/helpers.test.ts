import { describe, expect, it } from 'vitest'

import {
  adminOnly,
  adminOrSelf,
  authenticatedOnly,
  canManageUsers,
  canPublish,
  canUpdateEditorialContent,
  denyAll,
  editorialStaffOnly,
  getUser,
  hasRole,
  isActive,
  isAdmin,
  isAuthenticated,
  isAuthor,
  isEditor,
  newsroomStaffOnly,
  publicActiveOrEditorial,
  type AccessUser,
} from './helpers'
import { ROLES, type Role } from './roles'

const user = (role: Role, status: AccessUser['status'] = 'active'): AccessUser => ({
  id: 1,
  role,
  status,
})

/** Payload passes the whole request; these helpers only read `user`. */
const req = (value: AccessUser | null) => ({ req: { user: value } }) as never

describe('getUser', () => {
  it('reads a well-formed user', () => {
    expect(getUser({ user: user('editor') })?.role).toBe('editor')
  })

  it('returns null rather than trusting a malformed one', () => {
    expect(getUser({})).toBeNull()
    expect(getUser({ user: null })).toBeNull()
    expect(getUser({ user: {} })).toBeNull()
    expect(getUser({ user: { role: 'admin' } })).toBeNull()
  })
})

/**
 * The distinction between `isAuthenticated` and `isActive` is the one that
 * matters: a token minted before an account was suspended is still a valid
 * token. Login is blocked at `beforeLogin`, but that decision has to survive
 * into every request or the suspension only takes effect at the next sign-in.
 */
describe('isAuthenticated vs isActive', () => {
  it('treats any user as authenticated', () => {
    expect(isAuthenticated(user('author', 'suspended'))).toBe(true)
    expect(isAuthenticated(null)).toBe(false)
  })

  it('treats only an active user as able to operate', () => {
    expect(isActive(user('admin'))).toBe(true)
    expect(isActive(user('admin', 'suspended'))).toBe(false)
    expect(isActive(user('admin', 'disabled'))).toBe(false)
    expect(isActive(null)).toBe(false)
  })
})

describe('role predicates', () => {
  it('identifies each role', () => {
    expect(isAdmin(user('admin'))).toBe(true)
    expect(isEditor(user('editor'))).toBe(true)
    expect(isAuthor(user('author'))).toBe(true)
  })

  it('never identifies a suspended account as holding its role', () => {
    for (const role of ROLES) {
      expect(hasRole(user(role, 'suspended'), [role]), role).toBe(false)
      expect(hasRole(user(role, 'disabled'), [role]), role).toBe(false)
    }
  })

  it('is exclusive: one role, one predicate', () => {
    expect(isEditor(user('admin'))).toBe(false)
    expect(isAuthor(user('editor'))).toBe(false)
    expect(isAdmin(user('author'))).toBe(false)
  })
})

describe('canPublish', () => {
  it('admits admin and editor', () => {
    expect(canPublish(user('admin'))).toBe(true)
    expect(canPublish(user('editor'))).toBe(true)
  })

  it('refuses an author', () => {
    // The rule the whole editorial model rests on.
    expect(canPublish(user('author'))).toBe(false)
  })

  it('refuses an anonymous or suspended caller', () => {
    expect(canPublish(null)).toBe(false)
    expect(canPublish(user('editor', 'suspended'))).toBe(false)
  })
})

describe('canManageUsers', () => {
  it('is admin only', () => {
    // Running the newsroom and handing out credentials are different jobs.
    expect(canManageUsers(user('admin'))).toBe(true)
    expect(canManageUsers(user('editor'))).toBe(false)
    expect(canManageUsers(user('author'))).toBe(false)
  })
})

describe('denyAll', () => {
  it('denies everyone, including an administrator', () => {
    for (const role of ROLES) {
      expect(denyAll(req(user(role))), role).toBe(false)
    }

    expect(denyAll(req(null))).toBe(false)
  })
})

describe('authenticatedOnly / adminOnly / editorialStaffOnly', () => {
  it('authenticatedOnly admits any active user', () => {
    for (const role of ROLES) expect(authenticatedOnly(req(user(role))), role).toBe(true)

    expect(authenticatedOnly(req(null))).toBe(false)
    expect(authenticatedOnly(req(user('admin', 'disabled')))).toBe(false)
  })

  it('adminOnly admits only admin', () => {
    expect(adminOnly(req(user('admin')))).toBe(true)
    expect(adminOnly(req(user('editor')))).toBe(false)
    expect(adminOnly(req(user('author')))).toBe(false)
  })

  it('editorialStaffOnly admits admin and editor', () => {
    expect(editorialStaffOnly(req(user('admin')))).toBe(true)
    expect(editorialStaffOnly(req(user('editor')))).toBe(true)
    expect(editorialStaffOnly(req(user('author')))).toBe(false)
  })

  it('newsroomStaffOnly admits admin, editor and author', () => {
    expect(newsroomStaffOnly(req(user('admin')))).toBe(true)
    expect(newsroomStaffOnly(req(user('editor')))).toBe(true)
    expect(newsroomStaffOnly(req(user('author')))).toBe(true)
    expect(newsroomStaffOnly(req(null))).toBe(false)
    expect(newsroomStaffOnly(req(user('author', 'suspended')))).toBe(false)
  })
})

/**
 * These helpers return a Payload `Where` filter rather than a boolean, and that
 * is deliberate: filtering at the query level means unauthorised rows are never
 * loaded, and list endpoints report honest totals instead of leaking how many
 * records exist.
 */
describe('adminOrSelf', () => {
  it('lets an administrator see everything', () => {
    expect(adminOrSelf(req(user('admin')))).toBe(true)
  })

  it('narrows everyone else to their own record', () => {
    expect(adminOrSelf(req({ id: 7, role: 'editor', status: 'active' }))).toEqual({
      id: { equals: 7 },
    })
  })

  it('refuses an anonymous or inactive caller outright', () => {
    expect(adminOrSelf(req(null))).toBe(false)
    expect(adminOrSelf(req(user('admin', 'suspended')))).toBe(false)
  })
})

describe('publicActiveOrEditorial', () => {
  it('shows the newsroom everything', () => {
    for (const role of ROLES) {
      expect(publicActiveOrEditorial(req(user(role))), role).toBe(true)
    }
  })

  it('shows an anonymous reader only active records', () => {
    // Retiring a category sets `active = false` rather than deleting it, so it
    // has to stop being publicly visible without breaking published content
    // that still points at it.
    expect(publicActiveOrEditorial(req(null))).toEqual({ active: { equals: true } })
  })
})

describe('canUpdateEditorialContent', () => {
  it('lets admin and editor edit anything', () => {
    expect(canUpdateEditorialContent(req(user('admin')))).toBe(true)
    expect(canUpdateEditorialContent(req(user('editor')))).toBe(true)
  })

  it('narrows an author to their own unpublished work', () => {
    const filter = canUpdateEditorialContent(req({ id: 9, role: 'author', status: 'active' }))

    expect(filter).toEqual({
      and: [{ createdBy: { equals: 9 } }, { _status: { not_equals: 'published' } }],
    })
  })

  it('stops an author editing their own piece once it is published', () => {
    // A published article is a public record, not a personal document. The
    // `_status` clause is what enforces that, so it must always be present.
    const filter = canUpdateEditorialContent(
      req({ id: 9, role: 'author', status: 'active' }),
    ) as { and: { _status?: { not_equals: string } }[] }

    expect(filter.and.some((clause) => clause._status?.not_equals === 'published')).toBe(true)
  })

  it('refuses an anonymous or inactive caller', () => {
    expect(canUpdateEditorialContent(req(null))).toBe(false)
    expect(canUpdateEditorialContent(req(user('editor', 'disabled')))).toBe(false)
  })
})
