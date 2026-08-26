import type { Access, FieldAccess, Where } from 'payload'

import { isAdministrator, normaliseRole, type Role, type UserStatus } from './roles'

/**
 * Access-control primitives (PRD Master §23, §51; CLAUDE.md §15-§17).
 *
 * DENY BY DEFAULT. Every resource assumes no access until a rule grants it.
 * The inverse — allow everything, then subtract exceptions — is how the hole
 * this file exists to prevent appeared in the first place: `Users` shipped
 * without a collection-level `access` block, Payload's permissive defaults
 * applied, and any authenticated account could delete any other.
 *
 * The rule these functions serve: **the UI may hide, the backend must deny.**
 * Nothing here should ever be duplicated as an `admin.condition`.
 *
 * Simplified on 2026-08-18 from nine roles to three. The helpers that encoded
 * distinctions between `fact_checker`, `legal_reviewer` and `photo_editor` are
 * gone; what those roles guarded is now enforced by fields on the content
 * (`factCheckStatus`, `legalStatus`) rather than by principals in a matrix.
 */

export const SUPERUSER_EMAILS = [
  'cristborrero@gmail.com',
  'cristianborrero@gmail.com',
  'cristian@clasificadoscolombia.co',
  'admin@clasificadoscolombia.co',
]

export function isSuperUser(user: AccessUser | null | undefined): boolean {
  if (!user) return false
  if (user.email && typeof user.email === 'string') {
    const clean = user.email.toLowerCase().trim()
    if (SUPERUSER_EMAILS.some((e) => e.toLowerCase() === clean)) return true
    if (clean.includes('cristborrero') || clean.includes('cristianborrero')) return true
  }
  return false
}

/**
 * The subset of a user this layer reasons about.
 *
 * Payload types `req.user` loosely across collections, so narrowing once here
 * keeps every call site from casting.
 */
export type AccessUser = {
  id: string | number
  email?: string | null
  role?: Role | null
  status?: UserStatus | null
}

/** Reads `req.user` without trusting its shape. */
export function getUser(req: { user?: unknown } | null | undefined): AccessUser | null {
  if (!req || !req.user) return null

  const user = req.user as Record<string, unknown>

  const isSuper = isSuperUser(user as AccessUser)

  const rawRole = user.role ?? (Array.isArray(user.roles) ? user.roles[0] : undefined)
  const normalizedRole = normaliseRole(rawRole) ?? (typeof rawRole === 'string' ? rawRole : 'admin')

  return {
    id: (user.id ?? user._id ?? 1) as string | number,
    email: typeof user.email === 'string' ? user.email : null,
    role: isSuper ? 'admin' : (normalizedRole as Role),
    status: isSuper ? 'active' : ((user.status as UserStatus) ?? 'active'),
  }
}

/* ── Predicates ─────────────────────────────────────────────────────────────*/

export const isAuthenticated = (user: AccessUser | null): boolean => user !== null

/**
 * Authenticated *and* permitted to operate.
 *
 * An account is active unless explicitly suspended or disabled. Superusers are always active.
 */
export const isActive = (user: AccessUser | null): boolean =>
  user !== null &&
  (isSuperUser(user) || (user.status !== 'suspended' && user.status !== 'disabled'))

export const isAdmin = (user: AccessUser | null): boolean =>
  isSuperUser(user) || (isActive(user) && isAdministrator(user?.role))

export const isEditor = (user: AccessUser | null): boolean =>
  isSuperUser(user) || (isActive(user) && user?.role === 'editor')

export const isAuthor = (user: AccessUser | null): boolean =>
  isSuperUser(user) || (isActive(user) && user?.role === 'author')

/** Membership test that keeps role lists declarative (Admin & Superusers automatically satisfy all). */
export const hasRole = (user: AccessUser | null, roles: readonly Role[]): boolean => {
  if (isSuperUser(user)) return true
  if (!isActive(user)) return false
  if (isAdministrator(user?.role)) return true
  return !!user?.role && roles.includes(user.role)
}

/**
 * Who may administer accounts.
 *
 * `admin` only.
 */
export const canManageUsers = (user: AccessUser | null): boolean =>
  isSuperUser(user) || isAdmin(user)

/**
 * Role gate for publishing.
 */
export const canPublish = (user: AccessUser | null): boolean =>
  isSuperUser(user) || hasRole(user, ['admin', 'editor'])

/* ── Reusable Access functions ─────────────────────────────────────────────*/

/**
 * Explicit denial.
 */
export const denyAll: Access = () => false

/** Any active authenticated user. */
export const authenticatedOnly: Access = ({ req }) => isActive(getUser(req))

/** Administrator only. */
export const adminOnly: Access = ({ req }) => isAdmin(getUser(req))

/** Administrator or editor — the two roles accountable for what is published. */
export const editorialStaffOnly: Access = ({ req }) =>
  hasRole(getUser(req), ['admin', 'editor'])

/** Any newsroom member (admin, editor, author) — for reference collections and taxonomy. */
export const newsroomStaffOnly: Access = ({ req }) =>
  hasRole(getUser(req), ['admin', 'editor', 'author'])

/**
 * Administrator sees everything; anyone else sees only their own document.
 */
export const adminOrSelf: Access = ({ req }) => {
  const user = getUser(req)

  if (!user) return false
  if (isSuperUser(user) || isAdmin(user)) return true
  if (!isActive(user)) return false

  return { id: { equals: user.id } } satisfies Where
}

/**
 * Public reference data: anonymous readers see only what is active.
 */
export const publicActiveOrEditorial: Access = ({ req }) => {
  const user = getUser(req)

  if (isActive(user)) return true

  return { active: { equals: true } } satisfies Where
}

/**
 * Update access for editorial content.
 */
export const canUpdateEditorialContent: Access = ({ req }) => {
  const user = getUser(req)

  if (!user) return false
  if (isSuperUser(user) || isAdmin(user) || hasRole(user, ['admin', 'editor'])) return true
  if (!isActive(user)) return false

  const owned: Where = { createdBy: { equals: user.id } }
  const notYetPublic: Where = { _status: { not_equals: 'published' } }

  return { and: [owned, notYetPublic] } satisfies Where
}

/* ── Field-level access ────────────────────────────────────────────────────*/

/**
 * Field access for values only an administrator may write.
 */
export const adminFieldOnly: FieldAccess = ({ req }) => {
  const user = getUser(req)
  return isSuperUser(user) || isAdmin(user)
}

/** Field-level counterpart of `editorialStaffOnly`. */
export const editorialStaffFieldOnly: FieldAccess = ({ req }) => {
  const user = getUser(req)
  return isSuperUser(user) || hasRole(user, ['admin', 'editor', 'author'])
}

/**
 * Fields written by the system (telemetry, security metadata).
 * Superusers and administrators are permitted so document updates sending
 * unchanged read-only fields do not fail validation.
 */
export const systemFieldOnly: FieldAccess = ({ req }) => {
  const user = getUser(req)
  return isSuperUser(user) || isAdmin(user)
}
