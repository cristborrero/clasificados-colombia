import { describe, expect, it } from 'vitest'

import {
  buildNewsSitemap,
  escapeXml,
  isWithinNewsWindow,
  NEWS_MAX_ENTRIES,
  NEWS_WINDOW_HOURS,
} from './newsSitemap'

const NOW = new Date('2026-08-18T12:00:00.000Z')
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString()

const options = { publicationName: 'Clasificados Colombia', language: 'es', now: NOW }

describe('isWithinNewsWindow', () => {
  it('accepts something published inside the window', () => {
    expect(isWithinNewsWindow(hoursAgo(1), NOW)).toBe(true)
    expect(isWithinNewsWindow(hoursAgo(NEWS_WINDOW_HOURS - 1), NOW)).toBe(true)
  })

  it('rejects something older than the window', () => {
    // PRD SEO §22: this file is not a historical archive.
    expect(isWithinNewsWindow(hoursAgo(NEWS_WINDOW_HOURS + 1), NOW)).toBe(false)
  })

  it('rejects a future date', () => {
    // A scheduled publication leaking in would announce itself before it exists.
    expect(isWithinNewsWindow(new Date(NOW.getTime() + 3_600_000).toISOString(), NOW)).toBe(false)
  })

  it('rejects an unparseable date rather than treating it as now', () => {
    expect(isWithinNewsWindow('ayer', NOW)).toBe(false)
    expect(isWithinNewsWindow('', NOW)).toBe(false)
  })
})

/**
 * An unescaped ampersand does not degrade the file — it makes it unparseable,
 * so every article in it leaves Google News at once.
 */
describe('escapeXml', () => {
  it('escapes the characters that break a document', () => {
    expect(escapeXml('Contratos & «obras» <urgentes>')).toBe(
      'Contratos &amp; «obras» &lt;urgentes&gt;',
    )
  })

  it('escapes quotes', () => {
    expect(escapeXml(`El "caso" de Ana's`)).toBe('El &quot;caso&quot; de Ana&apos;s')
  })

  it('leaves ordinary Spanish text alone', () => {
    expect(escapeXml('Investigación en Bogotá')).toBe('Investigación en Bogotá')
  })
})

describe('buildNewsSitemap', () => {
  const entry = (title: string, hours: number) => ({
    url: `https://clasificadoscolombia.co/politica/${hours}`,
    title,
    publishedAt: hoursAgo(hours),
  })

  it('includes only what is inside the window', () => {
    const xml = buildNewsSitemap(
      [entry('Reciente', 2), entry('Vieja', NEWS_WINDOW_HOURS + 10)],
      options,
    )

    expect(xml).toContain('Reciente')
    expect(xml).not.toContain('Vieja')
  })

  it('orders newest first', () => {
    const xml = buildNewsSitemap([entry('Antigua', 10), entry('Nueva', 1)], options)

    expect(xml.indexOf('Nueva')).toBeLessThan(xml.indexOf('Antigua'))
  })

  it('carries publication name, language, date and title', () => {
    const xml = buildNewsSitemap([entry('Titular', 1)], options)

    expect(xml).toContain('<news:name>Clasificados Colombia</news:name>')
    expect(xml).toContain('<news:language>es</news:language>')
    expect(xml).toContain('<news:title>Titular</news:title>')
    expect(xml).toContain('<news:publication_date>')
  })

  it('escapes a headline that would otherwise break the file', () => {
    const xml = buildNewsSitemap([entry('Obras & <contratos>', 1)], options)

    expect(xml).toContain('Obras &amp; &lt;contratos&gt;')
    expect(xml).not.toContain('<contratos>')
  })

  it('returns a valid empty sitemap when nothing qualifies', () => {
    // A newsroom that has not published in two days is a normal state; a 500
    // here would look like a broken site to the crawler that matters most.
    const xml = buildNewsSitemap([entry('Vieja', 500)], options)

    expect(xml).toContain('<urlset')
    expect(xml).toContain('</urlset>')
    expect(xml).not.toContain('<url>')
  })

  it('caps the file at the limit Google accepts', () => {
    const many = Array.from({ length: NEWS_MAX_ENTRIES + 50 }, (_, i) => ({
      url: `https://clasificadoscolombia.co/n/${i}`,
      title: `Nota ${i}`,
      publishedAt: hoursAgo(1),
    }))

    const xml = buildNewsSitemap(many, options)

    expect((xml.match(/<url>/g) ?? []).length).toBe(NEWS_MAX_ENTRIES)
  })

  it('declares both namespaces', () => {
    const xml = buildNewsSitemap([entry('X', 1)], options)

    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
    expect(xml).toContain('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"')
  })
})
