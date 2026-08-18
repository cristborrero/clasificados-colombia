/**
 * Editorial roles (PRD Master §23, CLAUDE.md §15).
 *
 * Three roles. Simplified on 2026-08-18 from the previous nine.
 *
 * The nine-role model came from a threat model written for an organisation
 * handling classified material: it separated fact checking, legal review, photo
 * editing and investigative authority into distinct principals, each with its
 * own permissions. For a newsroom of this size that separation cost more than
 * it bought — every permission question needed a nine-row table, and roles that
 * differ only in which button they can press are roles nobody assigns
 * correctly.
 *
 * What replaced it is not "less security". Fact checking and legal review are
 * still enforced before publication; they are *fields on the piece*
 * (`factCheckStatus`, `legalStatus`) rather than principals in an access
 * matrix. The publication guard still refuses an investigation that names
 * people without approved legal review — see `src/editorial/status.ts`. The
 * rule survived; the org chart around it did not.
 *
 * Names stay explicit. A role called `user`, `manager` or `staff` tells nobody
 * what it may do, and nothing in the codebase should write a bare string like
 * `'editor'` and hope for the best.
 *
 * > The nine-role design is archived in `docs/archive/prd-complex-v1/`.
 */

export const ROLES = ['admin', 'editor', 'author'] as const

export type Role = (typeof ROLES)[number]

/**
 * Labels shown in the Payload admin.
 *
 * Spanish, because the people reading them are a Colombian newsroom.
 */
export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  author: 'Autor',
}

/** Short description of what each role is for, surfaced in the admin. */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: 'Control total: contenido, usuarios y configuración.',
  editor: 'Revisa, aprueba, programa y publica. Lee denuncias.',
  author: 'Crea y edita únicamente sus propios borradores. No publica.',
}

export const roleOptions = ROLES.map((value) => ({ label: ROLE_LABELS[value], value }))

/**
 * Account status (PRD Master §23, §51).
 *
 * `disabled` must actually prevent authentication, not merely look inactive in
 * a list — see the beforeLogin hook on the Users collection.
 */
export const USER_STATUSES = ['active', 'suspended', 'disabled'] as const

export type UserStatus = (typeof USER_STATUSES)[number]

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Activo',
  suspended: 'Suspendido',
  disabled: 'Deshabilitado',
}

export const userStatusOptions = USER_STATUSES.map((value) => ({
  label: USER_STATUS_LABELS[value],
  value,
}))

/** Only an active account may authenticate. */
export function canAuthenticate(status: UserStatus): boolean {
  return status === 'active'
}

/**
 * Who may administer other users.
 *
 * `admin` only. Running the newsroom and handing out credentials are different
 * jobs, and an editor in chief needs the first, not the second.
 */
export function isAdministrator(role: Role | undefined | null): boolean {
  return role === 'admin'
}

export function isValidRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

/**
 * Maps a role from the nine-role model onto the three-role one.
 *
 * Used by the migration, and kept afterwards because a fixture, an export or a
 * seed from before the change will otherwise carry a role the system no longer
 * knows — and an unrecognised role that silently becomes `undefined` is an
 * account whose permissions are decided by whatever the code does with a
 * missing value.
 *
 * The mapping errs downward on purpose. `reporter` becomes `author`, not
 * `editor`: giving someone less than they had is a support ticket, giving them
 * more is an incident.
 */
export const LEGACY_ROLE_MAP: Record<string, Role> = {
  administrator: 'admin',
  editor_in_chief: 'editor',
  investigative_editor: 'editor',
  editor: 'editor',
  reporter: 'author',
  fact_checker: 'author',
  legal_reviewer: 'author',
  photo_editor: 'author',
  contributor: 'author',
}

export function normaliseRole(value: unknown): Role | null {
  if (isValidRole(value)) return value
  if (typeof value === 'string' && value in LEGACY_ROLE_MAP) return LEGACY_ROLE_MAP[value]!

  return null
}
