import { describe, expect, it } from 'vitest'

import { resolveBreakingNews, SEVERITIES, SEVERITY_LABEL } from './active'

const NOW = new Date('2026-08-18T12:00:00.000Z')

const base = {
  enabled: true,
  severity: 'breaking' as const,
  headline: 'Renuncia el ministro',
  startsAt: '2026-08-18T09:00:00.000Z',
  expiresAt: '2026-08-18T18:00:00.000Z',
}

describe('resolveBreakingNews', () => {
  it('shows a bar inside its window', () => {
    expect(resolveBreakingNews(base, NOW)).toEqual({
      severity: 'breaking',
      headline: 'Renuncia el ministro',
      description: null,
    })
  })

  it('stays hidden when switched off', () => {
    expect(resolveBreakingNews({ ...base, enabled: false }, NOW)).toBeNull()
  })

  it('stays hidden with no global at all', () => {
    expect(resolveBreakingNews(null, NOW)).toBeNull()
    expect(resolveBreakingNews(undefined, NOW)).toBeNull()
  })

  it('refuses to render a coloured stripe with no message', () => {
    expect(resolveBreakingNews({ ...base, headline: '  ' }, NOW)).toBeNull()
  })

  describe('the expiry is what stops yesterday’s emergency being today’s homepage', () => {
    it('hides once expired', () => {
      expect(resolveBreakingNews({ ...base, expiresAt: '2026-08-18T11:59:59.000Z' }, NOW)).toBeNull()
    })

    it('hides exactly at the expiry instant, not one tick later', () => {
      expect(resolveBreakingNews({ ...base, expiresAt: NOW.toISOString() }, NOW)).toBeNull()
    })

    it('hides when the expiry is missing entirely', () => {
      expect(resolveBreakingNews({ ...base, expiresAt: null }, NOW)).toBeNull()
    })

    it('hides when the expiry is unparseable rather than treating it as forever', () => {
      expect(resolveBreakingNews({ ...base, expiresAt: 'mañana' }, NOW)).toBeNull()
    })
  })

  it('stays hidden before it starts, so a bar can be staged in advance', () => {
    expect(resolveBreakingNews({ ...base, startsAt: '2026-08-18T12:00:01.000Z' }, NOW)).toBeNull()
  })

  it('shows at the exact start instant', () => {
    expect(resolveBreakingNews({ ...base, startsAt: NOW.toISOString() }, NOW)).not.toBeNull()
  })

  it('shows when no start is set, treating it as already begun', () => {
    expect(resolveBreakingNews({ ...base, startsAt: null }, NOW)).not.toBeNull()
  })

  it('keeps the message when the severity is unrecognised', () => {
    // Losing the styling of an urgent message is bad. Losing the message is worse.
    const resolved = resolveBreakingNews({ ...base, severity: 'catastrofe' }, NOW)

    expect(resolved?.severity).toBe('breaking')
    expect(resolved?.headline).toBe(base.headline)
  })

  it('carries an optional description and normalises an empty one to null', () => {
    expect(resolveBreakingNews({ ...base, description: ' Detalle ' }, NOW)?.description).toBe('Detalle')
    expect(resolveBreakingNews({ ...base, description: '   ' }, NOW)?.description).toBeNull()
  })
})

describe('SEVERITY_LABEL', () => {
  it('names every severity, because colour is never the only channel', () => {
    for (const severity of SEVERITIES) {
      expect(SEVERITY_LABEL[severity].length).toBeGreaterThan(0)
    }
  })

  it('spells ALERTA, the state added by delta D-01', () => {
    expect(SEVERITY_LABEL.alert).toBe('ALERTA')
  })
})
