/**
 * Editorial roles (PRD Nº5 §6, PRD Nº7 §7, CLAUDE.md §15).
 *
 * Nine roles in snake_case. This resolves conflict C-02: the CMS architecture
 * PRD lists seven roles in camelCase, but PRD Nº5, PRD Nº7 and CLAUDE.md — all
 * later — list nine in snake_case, and the two extra ones are load-bearing:
 * `investigative_editor` holds authority over internal evidence and
 * declassification (PRD Nº5 §8), and `photo_editor` governs media upload
 * permissions (PRD Nº10 §48).
 *
 * PRD Nº5 §6 is explicit that vague names like `user`, `manager` or `staff` are
 * forbidden for anything that carries permission.
 *
 * The permission logic itself is F3. This file only names the roles and
 * provides the type, so that nothing else in the codebase writes a bare string
 * like `'editor'` and hopes for the best (PRD Nº5 §9).
 */

export const ROLES = [
  'administrator',
  'editor_in_chief',
  'investigative_editor',
  'editor',
  'reporter',
  'fact_checker',
  'legal_reviewer',
  'photo_editor',
  'contributor',
] as const

export type Role = (typeof ROLES)[number]

/**
 * Labels shown in the Payload admin.
 *
 * Spanish, because the people reading them are a Colombian newsroom. PRD Nº7
 * §124 requires every non-obvious field to explain itself rather than rely on
 * tribal knowledge, which only works in the reader's language.
 */
export const ROLE_LABELS: Record<Role, string> = {
  administrator: 'Administrador',
  editor_in_chief: 'Editor en jefe',
  investigative_editor: 'Editor de investigación',
  editor: 'Editor',
  reporter: 'Reportero',
  fact_checker: 'Verificador de datos',
  legal_reviewer: 'Revisor legal',
  photo_editor: 'Editor gráfico',
  contributor: 'Colaborador',
}

/** Short description of what each role is for, surfaced in the admin. */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  administrator: 'Gestiona usuarios, roles y configuración del sistema.',
  editor_in_chief: 'Publica, despublica y aprueba. Máxima autoridad editorial.',
  investigative_editor: 'Dirige investigaciones y autoriza acceso a evidencia.',
  editor: 'Edita, asigna y programa contenido estándar.',
  reporter: 'Crea y edita sus propios borradores.',
  fact_checker: 'Verifica datos y actualiza el estado de verificación.',
  legal_reviewer: 'Revisa riesgo jurídico y emite el estado legal.',
  photo_editor: 'Gestiona imágenes editoriales, créditos y derechos.',
  contributor: 'Crea y edita únicamente sus propios borradores. No publica.',
}

export const roleOptions = ROLES.map((value) => ({ label: ROLE_LABELS[value], value }))

/**
 * Account status (PRD Nº7 §8, PRD Nº5 §82).
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
 * Roles allowed to administer other users.
 *
 * PRD Nº7 §9 restricts `users.create` to administrators. Kept as a set rather
 * than an inline comparison so F3 has one place to extend.
 */
export function isAdministrator(role: Role | undefined | null): boolean {
  return role === 'administrator'
}

export function isValidRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}
