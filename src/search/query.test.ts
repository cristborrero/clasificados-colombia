import { describe, expect, it } from 'vitest'

import {
  categoryFilterExpression,
  contentFilterExpression,
  dateFilterExpression,
  isAutocompletableQuery,
  isSearchableQuery,
  MAX_QUERY_LENGTH,
  normaliseQuery,
  parseSearchParams,
  RESULTS_PER_PAGE,
  splitHighlights,
  stripHighlights,
} from './query'

describe('normaliseQuery', () => {
  it('trims and collapses whitespace', () => {
    expect(normaliseQuery('  contratación   pública  ')).toBe('contratación pública')
  })

  it('caps the length', () => {
    expect(normaliseQuery('a'.repeat(MAX_QUERY_LENGTH + 100))).toHaveLength(MAX_QUERY_LENGTH)
  })

  it('does not alter intent', () => {
    // Case, accents and quotation marks are left alone: Meilisearch already
    // handles the first two, and a reader who types quotes means them.
    expect(normaliseQuery('"Fiscalía General"')).toBe('"Fiscalía General"')
    expect(normaliseQuery('FISCALÍA')).toBe('FISCALÍA')
  })

  it('returns an empty string for nothing', () => {
    expect(normaliseQuery(null)).toBe('')
    expect(normaliseQuery(undefined)).toBe('')
    expect(normaliseQuery('   ')).toBe('')
  })
})

describe('query gates', () => {
  it('refuses to treat an empty query as searchable', () => {
    // PRD Nº9 §42: never send q="" to pull the whole index into a dialog.
    expect(isSearchableQuery('')).toBe(false)
    expect(isSearchableQuery('a')).toBe(true)
  })

  it('waits for three characters before autocompleting', () => {
    expect(isAutocompletableQuery('fi')).toBe(false)
    expect(isAutocompletableQuery('fis')).toBe(true)
  })
})

describe('contentFilterExpression', () => {
  it('separates news from analysis, which share a collection', () => {
    expect(contentFilterExpression('news')).toEqual([
      'collection = articles',
      'contentType != analysis',
    ])
    expect(contentFilterExpression('analysis')).toEqual(['contentType = analysis'])
  })

  it('maps the rest onto their own collections', () => {
    expect(contentFilterExpression('investigation')).toEqual(['collection = investigations'])
    expect(contentFilterExpression('opinion')).toEqual(['collection = opinions'])
    expect(contentFilterExpression('video')).toEqual(['collection = video-stories'])
    expect(contentFilterExpression('data')).toEqual(['collection = data-stories'])
  })

  it('filters nothing for "all"', () => {
    expect(contentFilterExpression('all')).toEqual([])
  })
})

describe('dateFilterExpression', () => {
  const now = new Date('2026-08-18T12:00:00.000Z')

  it('produces a lower bound in epoch milliseconds', () => {
    expect(dateFilterExpression('day', now)).toEqual([
      `publishedAt >= ${now.getTime() - 86_400_000}`,
    ])
  })

  it('filters nothing for "any"', () => {
    expect(dateFilterExpression('any', now)).toEqual([])
  })
})

describe('categoryFilterExpression', () => {
  it('accepts a real slug', () => {
    expect(categoryFilterExpression('politica')).toEqual(['category.slug = politica'])
  })

  it('rejects anything that could be read as filter syntax', () => {
    // Meilisearch filters are an expression language. A slug carrying a quote
    // or an OR would be parsed as syntax rather than as a value.
    expect(categoryFilterExpression('politica OR 1 = 1')).toEqual([])
    expect(categoryFilterExpression("politica'")).toEqual([])
    expect(categoryFilterExpression('Política')).toEqual([])
    expect(categoryFilterExpression(null)).toEqual([])
  })
})

describe('parseSearchParams', () => {
  const now = new Date('2026-08-18T12:00:00.000Z')

  it('reads a full URL state', () => {
    const parsed = parseSearchParams(
      { q: ' fiscalía ', type: 'investigation', date: 'week', category: 'justicia', page: '2' },
      { now },
    )

    expect(parsed.q).toBe('fiscalía')
    expect(parsed.type).toBe('investigation')
    expect(parsed.offset).toBe(RESULTS_PER_PAGE)
    expect(parsed.filter).toContain('collection = investigations')
    expect(parsed.filter).toContain('category.slug = justicia')
  })

  it('falls back rather than trusting an unrecognised value', () => {
    const parsed = parseSearchParams(
      { type: 'todo-lo-que-quiera', date: 'siempre', category: '../../etc', page: '-4' },
      { now },
    )

    expect(parsed.type).toBe('all')
    expect(parsed.date).toBe('any')
    expect(parsed.category).toBeNull()
    expect(parsed.page).toBe(1)
    expect(parsed.filter).toEqual([])
  })

  it('caps the page so an arbitrary offset cannot be requested', () => {
    expect(parseSearchParams({ page: '99999' }, { now }).page).toBe(50)
  })

  it('takes the first value when a parameter is repeated', () => {
    expect(parseSearchParams({ q: ['uno', 'dos'] }, { now }).q).toBe('uno')
  })
})

/**
 * The highlight tests are the security-relevant ones. PRD Nº9 §46 allows
 * highlighting and forbids unsafe HTML; these assert that what crosses the
 * boundary is text with markers, never markup.
 */
describe('splitHighlights', () => {
  it('splits matched from unmatched text', () => {
    expect(splitHighlights('la [[hl]]fiscalía[[/hl]] respondió')).toEqual([
      { text: 'la ', match: false },
      { text: 'fiscalía', match: true },
      { text: ' respondió', match: false },
    ])
  })

  it('handles several matches', () => {
    const segments = splitHighlights('[[hl]]uno[[/hl]] y [[hl]]dos[[/hl]]')

    expect(segments.filter((segment) => segment.match).map((segment) => segment.text)).toEqual([
      'uno',
      'dos',
    ])
  })

  it('never treats markup as markup', () => {
    // A headline containing a tag must render as the characters an editor
    // typed, not as an element.
    const segments = splitHighlights('[[hl]]<script>alert(1)</script>[[/hl]]')

    expect(segments).toEqual([{ text: '<script>alert(1)</script>', match: true }])
  })

  it('degrades to plain text when a crop cut through a marker', () => {
    expect(splitHighlights('texto [[hl]]sin cierre')).toEqual([
      { text: 'texto ', match: false },
      { text: 'sin cierre', match: false },
    ])
  })

  it('returns nothing for nothing', () => {
    expect(splitHighlights(null)).toEqual([])
    expect(splitHighlights('')).toEqual([])
  })
})

describe('stripHighlights', () => {
  it('removes every marker', () => {
    expect(stripHighlights('la [[hl]]fiscalía[[/hl]] dijo')).toBe('la fiscalía dijo')
  })
})
