import { describe, expect, it } from 'vitest'

import {
  canAuthenticate,
  isAdministrator,
  isValidRole,
  LEGACY_ROLE_MAP,
  normaliseRole,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  ROLES,
  roleOptions,
  USER_STATUSES,
} from './roles'

describe('vocabulary', () => {
  it('declares exactly three roles', () => {
    expect(ROLES).toEqual(['admin', 'editor', 'author'])
  })

  it('names and describes every role for the admin panel', () => {
    for (const role of ROLES) {
      expect(ROLE_LABELS[role]?.length, role).toBeGreaterThan(0)
      expect(ROLE_DESCRIPTIONS[role]?.length, role).toBeGreaterThan(0)
    }
  })

  it('offers every role as an option, and nothing else', () => {
    expect(roleOptions.map((option) => option.value)).toEqual([...ROLES])
  })
})

describe('isAdministrator', () => {
  it('is true for admin alone', () => {
    expect(isAdministrator('admin')).toBe(true)
    expect(isAdministrator('editor')).toBe(false)
    expect(isAdministrator('author')).toBe(false)
  })

  it('is false for nothing at all', () => {
    expect(isAdministrator(null)).toBe(false)
    expect(isAdministrator(undefined)).toBe(false)
  })
})

describe('isValidRole', () => {
  it('accepts the declared roles', () => {
    for (const role of ROLES) expect(isValidRole(role)).toBe(true)
  })

  it('rejects a role from the previous model', () => {
    // These are not valid roles any more. Accepting one would give an account
    // permissions nobody chose.
    expect(isValidRole('editor_in_chief')).toBe(false)
    expect(isValidRole('reporter')).toBe(false)
    expect(isValidRole('administrator')).toBe(false)
  })

  it('rejects anything that is not a string', () => {
    expect(isValidRole(null)).toBe(false)
    expect(isValidRole(undefined)).toBe(false)
    expect(isValidRole(1)).toBe(false)
    expect(isValidRole({})).toBe(false)
  })
})

/**
 * The mapping matters more than it looks: a fixture, an export or a database
 * row from before the simplification carries a role the system no longer knows,
 * and an unrecognised role that silently becomes `undefined` is an account
 * whose permissions are decided by whatever the code does with a missing value.
 */
describe('normaliseRole', () => {
  it('passes a current role through unchanged', () => {
    for (const role of ROLES) expect(normaliseRole(role)).toBe(role)
  })

  it('maps every role from the nine-role model', () => {
    const legacy = [
      'administrator',
      'editor_in_chief',
      'investigative_editor',
      'editor',
      'reporter',
      'fact_checker',
      'legal_reviewer',
      'photo_editor',
      'contributor',
    ]

    for (const role of legacy) {
      expect(normaliseRole(role), role).not.toBeNull()
      expect(ROLES, role).toContain(normaliseRole(role))
    }
  })

  it('errs downward: nobody gains permissions in the migration', () => {
    // Giving someone less than they had is a support ticket. Giving them more
    // is an incident.
    expect(normaliseRole('reporter')).toBe('author')
    expect(normaliseRole('fact_checker')).toBe('author')
    expect(normaliseRole('legal_reviewer')).toBe('author')
    expect(normaliseRole('photo_editor')).toBe('author')
    expect(normaliseRole('contributor')).toBe('author')
  })

  it('promotes only the roles that genuinely published before', () => {
    expect(normaliseRole('administrator')).toBe('admin')
    expect(normaliseRole('editor_in_chief')).toBe('editor')
    expect(normaliseRole('investigative_editor')).toBe('editor')
    expect(normaliseRole('editor')).toBe('editor')
  })

  it('creates exactly one administrator out of the old model', () => {
    const admins = Object.entries(LEGACY_ROLE_MAP).filter(([, role]) => role === 'admin')

    expect(admins.map(([legacy]) => legacy)).toEqual(['administrator'])
  })

  it('returns null for a role it has never heard of', () => {
    expect(normaliseRole('superuser')).toBeNull()
    expect(normaliseRole(null)).toBeNull()
    expect(normaliseRole(42)).toBeNull()
  })
})

describe('canAuthenticate', () => {
  it('lets only an active account in', () => {
    expect(canAuthenticate('active')).toBe(true)
    expect(canAuthenticate('suspended')).toBe(false)
    expect(canAuthenticate('disabled')).toBe(false)
  })

  it('covers every declared status', () => {
    for (const status of USER_STATUSES) {
      expect(typeof canAuthenticate(status)).toBe('boolean')
    }
  })
})
