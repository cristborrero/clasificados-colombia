import { describe, expect, it } from 'vitest'

import {
  canAuthenticate,
  isAdministrator,
  isValidRole,
  ROLES,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  roleOptions,
  USER_STATUSES,
  userStatusOptions,
} from './roles'

describe('role registry', () => {
  it('defines exactly the nine roles the security PRD requires', () => {
    // PRD Nº5 §6 / PRD Nº7 §7. Resolves conflict C-02 against the CMS
    // architecture PRD, which listed seven in camelCase.
    expect(ROLES).toEqual([
      'administrator',
      'editor_in_chief',
      'investigative_editor',
      'editor',
      'reporter',
      'fact_checker',
      'legal_reviewer',
      'photo_editor',
      'contributor',
    ])
  })

  it('keeps the two roles that carry evidence and media authority', () => {
    // investigative_editor governs internal evidence (PRD Nº5 §8);
    // photo_editor governs media upload (PRD Nº10 §48). Dropping either would
    // silently move that authority somewhere it does not belong.
    expect(ROLES).toContain('investigative_editor')
    expect(ROLES).toContain('photo_editor')
  })

  it('uses snake_case throughout', () => {
    for (const role of ROLES) {
      expect(role).toMatch(/^[a-z]+(_[a-z]+)*$/)
    }
  })

  it('avoids the vague names the PRD forbids for permission-bearing roles', () => {
    // PRD Nº5 §6.
    for (const forbidden of ['user', 'manager', 'staff', 'member', 'admin']) {
      expect(ROLES).not.toContain(forbidden)
    }
  })

  it('labels and describes every role, so the admin never relies on tribal knowledge', () => {
    // PRD Nº7 §124.
    for (const role of ROLES) {
      expect(ROLE_LABELS[role]).toBeTruthy()
      expect(ROLE_DESCRIPTIONS[role]).toBeTruthy()
    }
  })

  it('exposes options in the shape Payload selects expect', () => {
    expect(roleOptions).toHaveLength(ROLES.length)
    expect(roleOptions[0]).toEqual({ label: 'Administrador', value: 'administrator' })
  })
})

describe('isValidRole', () => {
  it('accepts every declared role', () => {
    for (const role of ROLES) {
      expect(isValidRole(role)).toBe(true)
    }
  })

  it('rejects anything else, including near-misses from the older PRD', () => {
    for (const value of ['editorInChief', 'factChecker', 'superadmin', '', null, undefined, 42]) {
      expect(isValidRole(value)).toBe(false)
    }
  })
})

describe('isAdministrator', () => {
  it('is true only for administrator', () => {
    expect(isAdministrator('administrator')).toBe(true)

    for (const role of ROLES.filter((r) => r !== 'administrator')) {
      expect(isAdministrator(role)).toBe(false)
    }
  })

  it('treats a missing role as not an administrator', () => {
    // An unauthenticated request has no user, and therefore no role. Defaulting
    // that to "allowed" is how deny-by-default gets lost.
    expect(isAdministrator(undefined)).toBe(false)
    expect(isAdministrator(null)).toBe(false)
  })
})

describe('account status', () => {
  it('defines the three statuses from PRD Nº7 §8', () => {
    expect(USER_STATUSES).toEqual(['active', 'suspended', 'disabled'])
  })

  it('permits authentication only when active', () => {
    // PRD Nº5 §82. Suspended is not a softer active — it also cannot log in.
    expect(canAuthenticate('active')).toBe(true)
    expect(canAuthenticate('suspended')).toBe(false)
    expect(canAuthenticate('disabled')).toBe(false)
  })

  it('exposes status options for the admin select', () => {
    expect(userStatusOptions).toHaveLength(3)
    expect(userStatusOptions.map((o) => o.value)).toEqual([...USER_STATUSES])
  })
})
