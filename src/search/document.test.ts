import { describe, expect, it } from 'vitest'

import {
  deriveSearchPriority,
  isIndexable,
  MAX_BODY_TEXT_CHARS,
  normaliseBodyText,
  searchDocumentId,
  searchUrl,
  SEARCH_PRIORITY,
  toBodyText,
} from './document'

/**
 * The assertions in the first block are the ones that decide whether an
 * unpublished investigation becomes searchable. Meilisearch has no access
 * control of its own, so anything that reaches it is one misconfiguration away
 * from being public — the gate has to hold here.
 */
describe('isIndexable', () => {
  const published = { _status: 'published', slug: 'nota', title: 'Titular' }

  it('accepts a published piece with a slug and a title', () => {
    expect(isIndexable(published)).toBe(true)
  })

  it('refuses a draft', () => {
    expect(isIndexable({ ...published, _status: 'draft' })).toBe(false)
  })

  it('refuses a document with no status at all', () => {
    // Deny by default. Assuming a document with no status is fine is exactly
    // how a draft investigation becomes searchable.
    expect(isIndexable({ slug: 'nota', title: 'Titular' })).toBe(false)
    expect(isIndexable({ _status: null, slug: 'nota', title: 'Titular' })).toBe(false)
  })

  it('refuses anything still moving through the newsroom', () => {
    for (const status of ['draft', 'editing', 'fact_check', 'legal_review', 'approved', 'scheduled']) {
      expect(isIndexable({ ...published, editorialStatus: status }), status).toBe(false)
    }
  })

  it('refuses internal and restricted classifications', () => {
    expect(isIndexable({ ...published, classification: 'internal' })).toBe(false)
    expect(isIndexable({ ...published, classification: 'restricted' })).toBe(false)
    expect(isIndexable({ ...published, classification: 'public' })).toBe(true)
  })

  it('refuses a document that has no reachable URL', () => {
    expect(isIndexable({ ...published, slug: null })).toBe(false)
    expect(isIndexable({ ...published, slug: '' })).toBe(false)
    expect(isIndexable({ ...published, title: null })).toBe(false)
  })
})

describe('toBodyText', () => {
  const paragraph = (text: string) => ({ type: 'paragraph', children: [{ type: 'text', text }] })

  it('flattens paragraphs into one string', () => {
    expect(toBodyText({ root: { children: [paragraph('uno dos'), paragraph('tres')] } })).toContain(
      'uno dos',
    )
  })

  it('keeps the reporting inside a pull quote', () => {
    const text = toBodyText({
      root: {
        children: [
          { type: 'block', fields: { blockType: 'pullQuote', text: 'una cita citable' } },
        ],
      },
    })

    expect(text).toContain('una cita citable')
  })

  it('keeps fact box labels and values, which are what people search for', () => {
    const text = toBodyText({
      root: {
        children: [
          {
            type: 'block',
            fields: {
              blockType: 'factBox',
              title: 'Cifras',
              items: [{ label: 'Contratos', value: '4.200' }],
            },
          },
        ],
      },
    })

    expect(text).toContain('Contratos')
    expect(text).toContain('4.200')
  })

  it('drops correction notices and embeds', () => {
    // Otherwise a search for "corrección" returns every article that ever had
    // one, ranked by an accident of vocabulary rather than by relevance.
    const text = toBodyText({
      root: {
        children: [
          paragraph('cuerpo real'),
          { type: 'block', fields: { blockType: 'correctionNotice', text: 'se corrigió una cifra' } },
          { type: 'block', fields: { blockType: 'embed', url: 'https://x.com/a/1', caption: 'mira' } },
        ],
      },
    })

    expect(text).toContain('cuerpo real')
    expect(text).not.toContain('se corrigió')
    expect(text).not.toContain('x.com')
    expect(text).not.toContain('mira')
  })

  it('returns an empty string for an absent body rather than throwing', () => {
    expect(toBodyText(null)).toBe('')
    expect(toBodyText(undefined)).toBe('')
    expect(toBodyText({})).toBe('')
  })

  it('stops descending before a pathological tree takes the indexer down', () => {
    const deep: Record<string, unknown> = { type: 'text', text: 'fondo' }
    let node: Record<string, unknown> = deep

    for (let i = 0; i < 200; i += 1) node = { type: 'paragraph', children: [node] }

    expect(() => toBodyText(node)).not.toThrow()
  })
})

describe('normaliseBodyText', () => {
  it('collapses whitespace', () => {
    expect(normaliseBodyText('  uno \n\n  dos\t tres ')).toBe('uno dos tres')
  })

  it('caps the length sent to the index', () => {
    expect(normaliseBodyText('x'.repeat(MAX_BODY_TEXT_CHARS + 500))).toHaveLength(
      MAX_BODY_TEXT_CHARS,
    )
  })
})

describe('deriveSearchPriority', () => {
  it('ranks an ordinary article at zero', () => {
    expect(deriveSearchPriority({ collection: 'articles' })).toBe(SEARCH_PRIORITY.standard)
  })

  it('boosts featured, analysis and investigations in that order', () => {
    expect(deriveSearchPriority({ collection: 'articles', featured: true })).toBe(
      SEARCH_PRIORITY.featured,
    )
    expect(deriveSearchPriority({ collection: 'articles', contentType: 'analysis' })).toBe(
      SEARCH_PRIORITY.majorAnalysis,
    )
    expect(deriveSearchPriority({ collection: 'investigations' })).toBe(
      SEARCH_PRIORITY.investigation,
    )
  })

  it('gives an active breaking story the top boost', () => {
    expect(deriveSearchPriority({ collection: 'articles', breaking: true })).toBe(
      SEARCH_PRIORITY.activeBreaking,
    )
  })

  it('drops the breaking boost the moment the story stops being breaking', () => {
    // PRD Nº9 §19: no permanent artificial priority. The boost is derived from
    // live state, never stored, so it cannot be left behind.
    expect(deriveSearchPriority({ collection: 'articles', breaking: false })).toBe(
      SEARCH_PRIORITY.standard,
    )
  })

  it('never returns a value a journalist chose', () => {
    // Every result is one of the five declared steps.
    const declared = Object.values(SEARCH_PRIORITY)

    for (const collection of ['articles', 'investigations', 'opinions']) {
      for (const featured of [true, false]) {
        for (const breaking of [true, false]) {
          expect(declared).toContain(
            deriveSearchPriority({ collection, featured, breaking, contentType: 'analysis' }),
          )
        }
      }
    }
  })
})

describe('searchUrl', () => {
  it('puts articles at the root and everything else under its prefix', () => {
    expect(searchUrl('articles', 'nota')).toBe('/nota')
    expect(searchUrl('investigations', 'caso')).toBe('/investigacion/caso')
    expect(searchUrl('opinions', 'columna')).toBe('/opinion/columna')
    expect(searchUrl('data-stories', 'cifras')).toBe('/datos/cifras')
    expect(searchUrl('video-stories', 'clip')).toBe('/video/clip')
  })

  it('falls back to the root for an unknown collection rather than emitting undefined', () => {
    expect(searchUrl('otra-cosa', 'x')).toBe('/x')
  })
})

describe('searchDocumentId', () => {
  it('cannot collide across collections', () => {
    // Two collections both have a record with id 1.
    expect(searchDocumentId('articles', 1)).not.toBe(searchDocumentId('investigations', 1))
  })

  it('only uses characters Meilisearch accepts in an id', () => {
    // Meilisearch rejects anything outside [a-zA-Z0-9_-], and it rejects it
    // asynchronously: the write returns 202 and the document never appears.
    // A colon separator produced eleven "indexed" documents and an empty index.
    for (const collection of ['articles', 'investigations', 'data-stories', 'video-stories']) {
      expect(searchDocumentId(collection, 42)).toMatch(/^[a-zA-Z0-9_-]+$/)
    }
  })
})
