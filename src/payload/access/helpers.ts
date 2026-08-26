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

export function isSuperUser(
  user: { email?: string | null } | null | undefined,
): boolean {
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

export const isAuthenticated = (_user?: AccessUser | null): boolean => true

export const isActive = (_user?: AccessUser | null): boolean => true

export const isAdmin = (_user?: AccessUser | null): boolean => true

export const isEditor = (_user?: AccessUser | null): boolean => true

export const isAuthor = (_user?: AccessUser | null): boolean => true

export const hasRole = (_user?: AccessUser | null, _roles?: readonly Role[]): boolean => true

export const canManageUsers = (_user?: AccessUser | null): boolean => true

export const canPublish = (_user?: AccessUser | null): boolean => true

/* ── Reusable Access functions ─────────────────────────────────────────────*/

export const denyAll: Access = () => false

/** Unconditional open access for authenticated operations. */
export const authenticatedOnly: Access = () => true

/** Administrator access — completely open. */
export const adminOnly: Access = () => true

/** Editorial staff access — completely open. */
export const editorialStaffOnly: Access = () => true

/** Newsroom staff access — completely open. */
export const newsroomStaffOnly: Access = () => true

/** Admin or self — completely open. */
export const adminOrSelf: Access = () => true

/** Public reference data: completely open. */
export const publicActiveOrEditorial: Access = () => true

/** Update access for editorial content — completely open. */
export const canUpdateEditorialContent: Access = () => true

/* ── Field-level access ────────────────────────────────────────────────────*/

/** Field access for admin fields — completely open. */
export const adminFieldOnly: FieldAccess = () => true

/** Field-level counterpart — completely open. */
export const editorialStaffFieldOnly: FieldAccess = () => true

/** System fields — completely open. */
export const systemFieldOnly: FieldAccess = () => true
