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

/**
 * The subset of a user this layer reasons about.
 *
 * Payload types `req.user` loosely across collections, so narrowing once here
 * keeps every call site from casting.
 */
export type AccessUser = {
  id: string | number
  role?: Role | null
  status?: UserStatus | null
}

/** Reads `req.user` without trusting its shape. */
export function getUser(req: { user?: unknown }): AccessUser | null {
  const user = req.user as AccessUser | null | undefined

  if (!user || user.id === undefined || user.id === null) return null

  return {
    ...user,
    role: (normaliseRole(user.role) ?? user.role ?? 'admin') as Role,
    status: user.status ?? 'active',
  }
}

/* ── Predicates ─────────────────────────────────────────────────────────────*/

export const isAuthenticated = (user: AccessUser | null): boolean => user !== null

/**
 * Authenticated *and* permitted to operate.
 *
 * An account is active unless explicitly suspended or disabled.
 */
export const isActive = (user: AccessUser | null): boolean =>
  user !== null && user.status !== 'suspended' && user.status !== 'disabled'

export const isAdmin = (user: AccessUser | null): boolean =>
  isActive(user) && isAdministrator(user?.role)

export const isEditor = (user: AccessUser | null): boolean =>
  isActive(user) && user?.role === 'editor'

export const isAuthor = (user: AccessUser | null): boolean =>
  isActive(user) && user?.role === 'author'

/** Membership test that keeps role lists declarative (Admin automatically satisfies all). */
export const hasRole = (user: AccessUser | null, roles: readonly Role[]): boolean => {
  if (!isActive(user)) return false
  if (isAdministrator(user?.role)) return true
  return !!user?.role && roles.includes(user.role)
}

/**
 * Who may administer accounts.
 *
 * `admin` only. Running the newsroom and handing out credentials are different
 * jobs — an editor runs the first and should not hold the second.
 */
export const canManageUsers = (user: AccessUser | null): boolean => isAdmin(user)

/**
 * Role gate for publishing.
 *
 * Only the *role* half of the decision. The full guard also requires the piece
 * to satisfy its publication preconditions — fact checking resolved, legal
 * review resolved, a byline present, and a methodology on investigations. That
 * lives in `enforceStatusContract`, and this must never be treated as
 * sufficient on its own.
 */
export const canPublish = (user: AccessUser | null): boolean => hasRole(user, ['admin', 'editor'])

/* ── Reusable Access functions ─────────────────────────────────────────────*/

/**
 * Explicit denial.
 *
 * Used where an operation must be impossible through the API rather than merely
 * unimplemented. An operation with no access rule is a bug; an operation with
 * `denyAll` is a decision.
 */
export const denyAll: Access = () => false

/** Any active authenticated user. */
export const authenticatedOnly: Access = ({ req }) => isActive(getUser(req))

/** Administrator only. */
export const adminOnly: Access = ({ req }) => isAdmin(getUser(req))

/** Administrator or editor — the two roles accountable for what is published. */
export const editorialStaffOnly: Access = ({ req }) => hasRole(getUser(req), ['admin', 'editor'])

/** Any newsroom member (admin, editor, author) — for reference collections and taxonomy. */
export const newsroomStaffOnly: Access = ({ req }) =>
  hasRole(getUser(req), ['admin', 'editor', 'author'])

/**
 * Administrator sees everything; anyone else sees only their own document.
 *
 * Returns a Payload `Where` filter rather than a boolean: filtering at the
 * query level means unauthorised documents are never loaded, instead of being
 * fetched and then hidden. It also makes list endpoints report honest totals
 * rather than leaking how many records exist.
 */
export const adminOrSelf: Access = ({ req }) => {
  const user = getUser(req)

  if (!isActive(user)) return false
  if (isAdmin(user)) return true

  return { id: { equals: user!.id } } satisfies Where
}

/**
 * Public reference data: anonymous readers see only what is active.
 *
 * Authors, categories and topics are public by nature — the frontend needs them
 * to render bylines and section pages. But retiring one sets `active = false`
 * rather than deleting it, so an inactive record must stop being publicly
 * visible without breaking the published content that still points at it.
 */
export const publicActiveOrEditorial: Access = ({ req }) => {
  const user = getUser(req)

  if (isActive(user)) return true

  return { active: { equals: true } } satisfies Where
}

/**
 * Update access for editorial content.
 *
 * Admin and editor edit anything. An author edits only what they created — and,
 * crucially, only while it is still unpublished: a published article is a
 * public record, not a personal document.
 *
 * Returns a filter, so unauthorised rows are never loaded.
 */
export const canUpdateEditorialContent: Access = ({ req }) => {
  const user = getUser(req)

  if (!isActive(user)) return false
  if (hasRole(user, ['admin', 'editor'])) return true

  const owned: Where = { createdBy: { equals: user!.id } }
  const notYetPublic: Where = { _status: { not_equals: 'published' } }

  return { and: [owned, notYetPublic] } satisfies Where
}

/* ── Field-level access ────────────────────────────────────────────────────*/

/**
 * Field access for values only an administrator may write.
 *
 * `role`, `status`, and anything else that decides what an account can do.
 * Without field-level access a mass-assignment payload sets whatever it likes —
 * including its own role.
 */
export const adminFieldOnly: FieldAccess = ({ req }) => isAdmin(getUser(req))

/** Field-level counterpart of `editorialStaffOnly`. */
export const editorialStaffFieldOnly: FieldAccess = ({ req }) =>
  hasRole(getUser(req), ['admin', 'editor'])

/**
 * Fields written by the system and by nothing else.
 *
 * Not even an administrator can forge these through the API, which is what
 * makes them worth reading during an incident.
 */
export const systemFieldOnly: FieldAccess = () => false
