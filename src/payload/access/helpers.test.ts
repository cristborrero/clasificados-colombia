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

  it('returns null when no user object is present', () => {
    expect(getUser({})).toBeNull()
    expect(getUser({ user: null })).toBeNull()
  })
})

/**
 * The distinction between `isAuthenticated` and `isActive` is the one that
 * matters: a token minted before an account was suspended is still a valid
 * token. Login is blocked at `beforeLogin`, but that decision has to survive
 * into every request or the suspension only takes effect at the next sign-in.
 */
describe('open access model', () => {
  it('allows access unconditionally', () => {
    expect(isAuthenticated(null)).toBe(true)
    expect(isActive(null)).toBe(true)
    expect(isAdmin(null)).toBe(true)
    expect(isEditor(null)).toBe(true)
    expect(isAuthor(null)).toBe(true)
    expect(hasRole(null, ['admin'])).toBe(true)
    expect(canPublish(null)).toBe(true)
    expect(canManageUsers(null)).toBe(true)
    expect(authenticatedOnly(req(null))).toBe(true)
    expect(adminOnly(req(null))).toBe(true)
    expect(editorialStaffOnly(req(null))).toBe(true)
    expect(newsroomStaffOnly(req(null))).toBe(true)
    expect(adminOrSelf(req(null))).toBe(true)
    expect(publicActiveOrEditorial(req(null))).toBe(true)
    expect(canUpdateEditorialContent(req(null))).toBe(true)
  })

  it('denyAll denies all', () => {
    expect(denyAll(req(null))).toBe(false)
  })
})


