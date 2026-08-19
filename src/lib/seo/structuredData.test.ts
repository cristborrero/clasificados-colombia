import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  breadcrumbJsonLd,
  newsArticleJsonLd,
  organizationJsonLd,
  personJsonLd,
  videoJsonLd,
} from './structuredData'

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://clasificadoscolombia.co')
})

const authors = [{ name: 'Ana Restrepo', slug: 'ana-restrepo', jobTitle: 'Editora' }]

const article = {
  headline: 'Los contratos que nadie explicó',
  path: '/politica/contratos',
  datePublished: '2026-08-18T14:00:00.000Z',
  authors,
  organizationName: 'Clasificados Colombia',
}

describe('newsArticleJsonLd', () => {
  it('emits an absolute canonical URL', () => {
    const ld = newsArticleJsonLd(article)!

    expect(ld.url).toBe('https://clasificadoscolombia.co/politica/contratos')
    expect((ld.mainEntityOfPage as Record<string, unknown>)['@id']).toBe(ld.url)
  })

  it('marks an investigation as reportage', () => {
    expect(newsArticleJsonLd({ ...article, isInvestigation: true })!['@type']).toBe(
      'ReportageNewsArticle',
    )
    expect(newsArticleJsonLd(article)!['@type']).toBe('NewsArticle')
  })

  /**
   * PRD SEO §31: journalism is attributable. Inventing an author for a crawler
   * would be worse than omitting the markup.
   */
  it('refuses to mark up a piece with no author', () => {
    expect(newsArticleJsonLd({ ...article, authors: [] })).toBeNull()
  })

  it('links each author to their page', () => {
    const author = (newsArticleJsonLd(article)!.author as Record<string, unknown>[])[0]!

    expect(author.url).toBe('https://clasificadoscolombia.co/autor/ana-restrepo')
    expect(author['@type']).toBe('Person')
  })

  /**
   * PRD SEO §29. Emitting dateModified equal to datePublished on every article
   * tells a crawler everything is constantly updated, which devalues the signal
   * exactly where it matters — the piece carrying a correction.
   */
  describe('dateModified', () => {
    it('is omitted when nothing was revised', () => {
      const ld = newsArticleJsonLd({ ...article, dateModified: article.datePublished })!

      expect(ld).not.toHaveProperty('dateModified')
    })

    it('is emitted when the piece genuinely changed', () => {
      const ld = newsArticleJsonLd({ ...article, dateModified: '2026-08-19T09:00:00.000Z' })!

      expect(ld.dateModified).toBe('2026-08-19T09:00:00.000Z')
    })

    it('is omitted when absent', () => {
      expect(newsArticleJsonLd(article)!).not.toHaveProperty('dateModified')
    })
  })

  it('points at one publisher rather than repeating it', () => {
    // A copied organisation object is one that can disagree with itself.
    expect(newsArticleJsonLd(article)!.publisher).toEqual({
      '@id': 'https://clasificadoscolombia.co/#organization',
    })
  })

  it('declares the language', () => {
    expect(newsArticleJsonLd(article)!.inLanguage).toBe('es-CO')
  })

  it('omits an image rather than emitting an empty one', () => {
    expect(newsArticleJsonLd(article)!).not.toHaveProperty('image')
    expect(newsArticleJsonLd({ ...article, image: { url: 'https://x/y.jpg' } })!).toHaveProperty(
      'image',
    )
  })
})

describe('organizationJsonLd', () => {
  it('carries a stable id every article can point at', () => {
    const ld = organizationJsonLd({ name: 'Clasificados Colombia' })

    expect(ld['@id']).toBe('https://clasificadoscolombia.co/#organization')
    expect(ld['@type']).toBe('NewsMediaOrganization')
  })

  it('omits a logo rather than inventing one', () => {
    // PRD SEO §37 wants a real logo. An absent one is better than a placeholder
    // that a crawler will fetch and reject.
    expect(organizationJsonLd({ name: 'X' })).not.toHaveProperty('logo')
  })

  it('includes contact details when there are any', () => {
    const ld = organizationJsonLd({ name: 'X', email: 'redaccion@x.co' })

    expect((ld.contactPoint as Record<string, unknown>).email).toBe('redaccion@x.co')
  })
})

describe('breadcrumbJsonLd', () => {
  it('numbers items from one', () => {
    const ld = breadcrumbJsonLd([
      { name: 'Inicio', path: '/' },
      { name: 'Política', path: '/politica' },
      { name: 'La nota' },
    ])!

    const items = ld.itemListElement as Record<string, unknown>[]
    expect(items.map((i) => i.position)).toEqual([1, 2, 3])
  })

  it('leaves the current page without a URL', () => {
    // A breadcrumb pointing at itself is the kind of detail that makes a
    // crawler discard the whole trail.
    const items = breadcrumbJsonLd([
      { name: 'Inicio', path: '/' },
      { name: 'La nota' },
    ])!.itemListElement as Record<string, unknown>[]

    expect(items[1]).not.toHaveProperty('item')
    expect(items[0]!.item).toBe('https://clasificadoscolombia.co')
  })

  it('emits nothing for a trail of one', () => {
    expect(breadcrumbJsonLd([{ name: 'Inicio', path: '/' }])).toBeNull()
  })
})

describe('personJsonLd', () => {
  it('describes an author profile tied to the organisation', () => {
    const ld = personJsonLd({
      name: 'Ana',
      slug: 'ana',
      organizationName: 'Clasificados Colombia',
    })

    const person = ld.mainEntity as Record<string, unknown>
    expect(ld['@type']).toBe('ProfilePage')
    expect(person.url).toBe('https://clasificadoscolombia.co/autor/ana')
    expect(person.worksFor).toEqual({ '@id': 'https://clasificadoscolombia.co/#organization' })
  })
})

describe('videoJsonLd', () => {
  const video = {
    name: 'Lo que encontramos',
    path: '/video/hallazgos',
    thumbnailUrl: 'https://x/thumb.jpg',
    uploadDate: '2026-08-18T14:00:00.000Z',
  }

  it('emits duration in ISO 8601', () => {
    expect(videoJsonLd({ ...video, durationSeconds: 272 })!.duration).toBe('PT272S')
  })

  it('refuses partial markup', () => {
    // Thumbnail and upload date are what a video rich result requires. Partial
    // markup earns nothing and is still one more thing to keep true.
    expect(videoJsonLd({ ...video, thumbnailUrl: null })).toBeNull()
    expect(videoJsonLd({ ...video, uploadDate: null })).toBeNull()
  })

  it('omits a duration that was never recorded', () => {
    expect(videoJsonLd(video)!).not.toHaveProperty('duration')
    expect(videoJsonLd({ ...video, durationSeconds: 0 })!).not.toHaveProperty('duration')
  })
})
