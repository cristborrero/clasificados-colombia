import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { describe, expect, it } from 'vitest'

import {
  AA_LARGE_TEXT,
  AA_NON_TEXT,
  AA_TEXT,
  contrastRatio,
  extractColorTokens,
  relativeLuminance,
} from './contrast'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const tokens = extractColorTokens(readFileSync(path.join(dirname, 'globals.css'), 'utf8'))

const t = (name: string): string => {
  const value = tokens[name]
  if (!value) throw new Error(`Token ${name} is not defined in globals.css`)
  return value
}

describe('contrast maths', () => {
  it('matches the WCAG reference points', () => {
    expect(relativeLuminance('#000000')).toBe(0)
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5)
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 2)
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5)
  })

  it('is order-independent', () => {
    expect(contrastRatio('#0A0A0A', '#F7F6F2')).toBeCloseTo(contrastRatio('#F7F6F2', '#0A0A0A'), 10)
  })

  it('rejects malformed colours instead of silently scoring them', () => {
    expect(() => relativeLuminance('#GGG')).toThrow(/6-digit hex/)
  })
})

describe('token extraction', () => {
  it('resolves semantic aliases to literal colours', () => {
    // --color-text is var(--color-ink) is #0a0a0a.
    expect(t('--color-text').toLowerCase()).toBe('#0a0a0a')
    expect(t('--color-surface').toLowerCase()).toBe('#f7f6f2')
  })

  it('follows the brand palette decided on 2026-08-17, not the delivered logo values', () => {
    // The logo files shipped #000a0a / #f2f2f2. PRD Master §4 wins.
    expect(t('--color-ink').toLowerCase()).toBe('#0a0a0a')
    expect(t('--color-paper').toLowerCase()).toBe('#f7f6f2')
    expect(t('--color-red').toLowerCase()).toBe('#d71920')
  })
})

/**
 * WCAG 2.2 AA. These are the pairings the product actually renders, so a
 * failure here means a real reader cannot read something.
 */
describe('WCAG 2.2 AA — text on light surfaces', () => {
  const cases: Array<[string, string, string]> = [
    ['body text on paper', '--color-text', '--color-surface'],
    ['body text on white', '--color-text', '--color-surface-raised'],
    ['muted text on paper', '--color-text-muted', '--color-surface'],
    ['metadata on paper', '--color-text-subtle', '--color-surface'],
    ['accent text on paper', '--color-accent', '--color-surface'],
    ['visited link on paper', '--color-link-visited', '--color-surface'],
    ['disabled label on disabled surface', '--color-disabled-text', '--color-disabled-surface'],
    ['ink on the alert badge', '--color-text', '--color-alert'],
    ['ink on the alert row', '--color-text', '--color-alert-surface'],
  ]

  it.each(cases)('%s meets 4.5:1', (_label, fg, bg) => {
    expect(contrastRatio(t(fg), t(bg))).toBeGreaterThanOrEqual(AA_TEXT)
  })
})

describe('WCAG 2.2 AA — text on inverse surfaces', () => {
  const cases: Array<[string, string, string]> = [
    ['inverse text on ink', '--color-text-inverse', '--color-surface-inverse'],
    ['muted inverse text on ink', '--color-text-inverse-muted', '--color-surface-inverse'],
  ]

  it.each(cases)('%s meets 4.5:1', (_label, fg, bg) => {
    expect(contrastRatio(t(fg), t(bg))).toBeGreaterThanOrEqual(AA_TEXT)
  })
})

describe('WCAG 2.2 AA — buttons', () => {
  const states: Array<[string, string]> = [
    ['default', '--color-red'],
    ['hover', '--color-red-hover'],
    ['active', '--color-red-active'],
  ]

  it.each(states)('white label on the %s primary button meets 4.5:1', (_state, bg) => {
    expect(contrastRatio(t('--color-white'), t(bg))).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('the secondary button carries inverse text on ink', () => {
    expect(
      contrastRatio(t('--color-text-inverse'), t('--color-surface-inverse')),
    ).toBeGreaterThanOrEqual(AA_TEXT)
  })
})

describe('WCAG 2.2 SC 1.4.11 — non-text contrast', () => {
  it('the focus ring is visible on paper', () => {
    expect(contrastRatio(t('--color-focus'), t('--color-surface'))).toBeGreaterThanOrEqual(
      AA_NON_TEXT,
    )
  })

  it('the focus ring is visible on ink', () => {
    expect(contrastRatio(t('--color-focus'), t('--color-surface-inverse'))).toBeGreaterThanOrEqual(
      AA_NON_TEXT,
    )
  })

  it('borders separate from their surface', () => {
    expect(contrastRatio(t('--color-border-strong'), t('--color-surface'))).toBeGreaterThanOrEqual(
      AA_NON_TEXT,
    )
  })
})

/**
 * Constraints that are easy to violate by accident. Each one is a mistake
 * someone will otherwise make later, so it is pinned here rather than left in
 * a document nobody re-reads.
 */
describe('documented limits of the palette', () => {
  it('red on ink is large-text only — never body copy', () => {
    const ratio = contrastRatio(t('--color-accent'), t('--color-surface-inverse'))

    expect(ratio).toBeGreaterThanOrEqual(AA_LARGE_TEXT)
    expect(ratio).toBeLessThan(AA_TEXT)
  })

  it('gray-500 cannot carry normal text on paper, which is why it is not the muted token', () => {
    expect(contrastRatio(t('--color-gray-500'), t('--color-surface'))).toBeLessThan(AA_TEXT)
    expect(t('--color-text-muted')).not.toBe(t('--color-gray-500'))
    expect(t('--color-text-subtle')).not.toBe(t('--color-gray-500'))
  })

  it('the naive disabled pairing would have failed, so the tokens do not use it', () => {
    expect(contrastRatio(t('--color-gray-500'), t('--color-gray-300'))).toBeLessThan(AA_TEXT)
  })
})
