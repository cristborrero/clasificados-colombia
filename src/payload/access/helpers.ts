import type { Access, FieldAccess, Where } from 'payload'

import { isAdministrator, type Role, type UserStatus } from './roles'

/**
 * Access-control primitives (PRD Nº5 §2, §9, §10; PRD Nº7 §105-§106).
 *
 * DENY BY DEFAULT. Every resource assumes no access until a rule grants it.
 * The inverse — allow everything, then subtract exceptions — is how the hole
 * this phase closes appeared in the first place: `Users` shipped without a
 * collection-level `access` block, Payload's permissive defaults applied, and
 * any authenticated account could delete any other.
 *
 * PRD Nº5 §4 is the rule these functions exist to honour: the UI may hide, the
 * backend must deny. Nothing here should ever be duplicated as an
 * `admin.condition`.
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

  return user
}

/* ── Predicates ─────────────────────────────────────────────────────────────
 * Named per PRD Nº5 §10 so that `user.role === 'editor'` never gets written
 * across fifty files (PRD Nº5 §9).
 */

export const isAuthenticated = (user: AccessUser | null): boolean => user !== null

/**
 * Authenticated *and* permitted to operate.
 *
 * A suspended account that still holds a valid token must not keep working
 * (PRD Nº5 §82-§83). Login is blocked at `beforeLogin`, but a token issued
 * before suspension would otherwise outlive the decision.
 */
export const isActive = (user: AccessUser | null): boolean =>
  user !== null && user.status === 'active'

export const isAdmin = (user: AccessUser | null): boolean =>
  isActive(user) && isAdministrator(user?.role)

export const isEditorInChief = (user: AccessUser | null): boolean =>
  isActive(user) && user?.role === 'editor_in_chief'

export const isInvestigativeEditor = (user: AccessUser | null): boolean =>
  isActive(user) && user?.role === 'investigative_editor'

export const isEditor = (user: AccessUser | null): boolean =>
  isActive(user) && user?.role === 'editor'

export const isReporter = (user: AccessUser | null): boolean =>
  isActive(user) && user?.role === 'reporter'

export const isFactChecker = (user: AccessUser | null): boolean =>
  isActive(user) && user?.role === 'fact_checker'

export const isLegalReviewer = (user: AccessUser | null): boolean =>
  isActive(user) && user?.role === 'legal_reviewer'

export const isPhotoEditor = (user: AccessUser | null): boolean =>
  isActive(user) && user?.role === 'photo_editor'

export const isContributor = (user: AccessUser | null): boolean =>
  isActive(user) && user?.role === 'contributor'

/** Membership test that keeps role lists declarative. */
export const hasRole = (user: AccessUser | null, roles: readonly Role[]): boolean =>
  isActive(user) && !!user?.role && roles.includes(user.role)

/**
 * Who may administer accounts (PRD Nº7 §9).
 *
 * Administrator only. PRD Nº5 §8 deliberately separates technical
 * administration from editorial authority — an Editor in Chief runs the
 * newsroom but does not hand out logins.
 */
export const canManageUsers = (user: AccessUser | null): boolean => isAdmin(user)

/**
 * Role gate for publishing (PRD Nº5 §24, PRD Nº7 §49).
 *
 * This is only the *role* half of the decision. The full guard also requires
 * workflow state — `editorialStatus`, `factCheckStatus`, `legalStatus`,
 * required fields — and lands with the collections that have those fields
 * (F4 for Articles, F5 for Investigations). Naming it now keeps the concept in
 * one place; it must never be treated as sufficient on its own.
 */
export const canPublish = (user: AccessUser | null): boolean =>
  hasRole(user, ['editor', 'editor_in_chief'])

/* ── Reusable Access functions ─────────────────────────────────────────────*/

/**
 * Explicit denial.
 *
 * Used where an operation must be impossible through the API — append-only
 * audit events (PRD Nº7 §76), system-written fields — rather than merely
 * unimplemented. An operation with no access rule is a bug; an operation with
 * `denyAll` is a decision.
 */
export const denyAll: Access = () => false

/** Any active authenticated user. Rarely the right answer on its own. */
export const authenticatedOnly: Access = ({ req }) => isActive(getUser(req))

/** Administrator only. */
export const adminOnly: Access = ({ req }) => isAdmin(getUser(req))

/**
 * Administrator sees everything; anyone else sees only their own document.
 *
 * Returns a Payload `Where` filter rather than a boolean, per PRD Nº7 §106:
 * filtering at the query level means unauthorised documents are never loaded,
 * instead of being fetched and then hidden. It also makes list endpoints
 * report honest totals rather than leaking how many records exist.
 */
export const adminOrSelf: Access = ({ req }) => {
  const user = getUser(req)

  if (!isActive(user)) return false
  if (isAdmin(user)) return true

  return { id: { equals: user!.id } } satisfies Where
}

/* ── Field-level access ────────────────────────────────────────────────────*/

/**
 * Field access for values only an administrator may write.
 *
 * PRD Nº5 §19 lists the fields that need this: `role`, `status`,
 * `classification`, `legalStatus`, `factCheckStatus`, `publishedAt`,
 * `securityMetadata`. PRD Nº5 §98 is the reason — without field access, a
 * mass-assignment payload sets whatever it likes.
 */
export const adminFieldOnly: FieldAccess = ({ req }) => isAdmin(getUser(req))

/**
 * Fields written by the system and by nothing else.
 *
 * Not even an administrator can forge these through the API, which is what
 * makes them worth reading during an incident (PRD Nº5 §53-§56).
 */
export const systemFieldOnly: FieldAccess = () => false
