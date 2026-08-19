import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  RESERVED_SEGMENTS,
  absoluteUrl,
  articlePath,
  authorPath,
  categoryPath,
  investigationPath,
  isReservedSegment,
  normalisePath,
  searchPath,
  siteOrigin,
  topicPath,
} from './routes'

describe('article paths', () => {
  it('nests an article under its category (PRD SEO §12)', () => {
    expect(articlePath('politica', 'reforma-salud')).toBe('/politica/reforma-salud')
  })

  it('falls back to the root rather than emitting /undefined/', () => {
    // A piece with no category still has to be linkable.
    expect(articlePath(null, 'nota')).toBe('/nota')
    expect(articlePath(undefined, 'nota')).toBe('/nota')
    expect(articlePath('', 'nota')).toBe('/nota')
  })

  it('never puts a date in the path (§13)', () => {
    expect(articlePath('politica', 'reforma-salud')).not.toMatch(/\d{4}/)
  })
})

describe('other paths', () => {
  it('places hubs at the root and everything else under its prefix', () => {
    expect(categoryPath('justicia')).toBe('/justicia')
    expect(investigationPath('caso')).toBe('/investigacion/caso')
    expect(topicPath('contratacion')).toBe('/tema/contratacion')
    expect(authorPath('ana')).toBe('/autor/ana')
  })

  it('encodes a search query', () => {
    expect(searchPath('contratación pública')).toBe('/buscar?q=contrataci%C3%B3n%20p%C3%BAblica')
    expect(searchPath()).toBe('/buscar')
  })
})

/**
 * The reserved list is what stops a category slug from shadowing a real page.
 * Next resolves static segments before dynamic ones, so a category called
 * `buscar` would simply never render — and nothing would report an error.
 */
describe('reserved segments', () => {
  it('refuses the paths that already belong to something', () => {
    for (const segment of ['admin', 'api', 'buscar', 'denunciar', 'autor', 'tema', 'investigacion']) {
      expect(isReservedSegment(segment), segment).toBe(true)
    }
  })

  it('allows an ordinary category slug', () => {
    for (const slug of ['politica', 'justicia', 'datos', 'opinion', 'analisis']) {
      expect(isReservedSegment(slug), slug).toBe(false)
    }
  })

  it('covers the generated files that live at the root', () => {
    for (const file of ['robots.txt', 'sitemap.xml', 'news-sitemap.xml']) {
      expect(RESERVED_SEGMENTS).toContain(file)
    }
  })
})

describe('absolute URLs', () => {
  const original = process.env.NEXT_PUBLIC_SERVER_URL

  afterEach(() => {
    process.env.NEXT_PUBLIC_SERVER_URL = original
    vi.unstubAllEnvs()
  })

  it('builds an absolute URL from a path', () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://clasificadoscolombia.co')

    expect(absoluteUrl('/politica/reforma')).toBe('https://clasificadoscolombia.co/politica/reforma')
  })

  it('normalises a trailing slash on the origin', () => {
    // Two canonicals differing only by a slash are the duplicate PRD SEO §9 is
    // written to prevent.
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://clasificadoscolombia.co/')

    expect(siteOrigin()).toBe('https://clasificadoscolombia.co')
    expect(absoluteUrl('/x')).toBe('https://clasificadoscolombia.co/x')
  })

  it('renders the home page without a trailing slash', () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://clasificadoscolombia.co')

    expect(absoluteUrl('/')).toBe('https://clasificadoscolombia.co')
  })

  it('accepts a path missing its leading slash', () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://clasificadoscolombia.co')

    expect(absoluteUrl('politica')).toBe('https://clasificadoscolombia.co/politica')
  })
})

describe('normalisePath', () => {
  it('treats the three ways of writing the same path as one', () => {
    // Written one way in the redirect row and looked up another, a redirect
    // silently never fires — which is why both sides call this.
    expect(normalisePath('/politica/reforma')).toBe('/politica/reforma')
    expect(normalisePath('politica/reforma')).toBe('/politica/reforma')
    expect(normalisePath('/politica/reforma/')).toBe('/politica/reforma')
    expect(normalisePath('  /politica/reforma  ')).toBe('/politica/reforma')
  })

  it('drops the query string, which is not part of the address', () => {
    expect(normalisePath('/politica/reforma?utm_source=boletin')).toBe('/politica/reforma')
  })

  it('keeps the root as a single slash', () => {
    expect(normalisePath('/')).toBe('/')
    expect(normalisePath('')).toBe('/')
  })

  it('collapses a trail of slashes rather than leaving one behind', () => {
    expect(normalisePath('/politica///')).toBe('/politica')
  })
})
