/**
 * News sitemap generation (PRD SEO §21-§23).
 *
 * Pure: takes entries and a clock, returns XML. Kept out of the route so the
 * window rule and the escaping can be asserted without booting Payload.
 */

/**
 * Google News only considers recent material, and §22 is explicit that this
 * file is not a historical archive. Two days is the conservative reading of
 * Google's current guidance; older pieces stay in the ordinary sitemap, where
 * they belong.
 */
export const NEWS_WINDOW_HOURS = 48

/** §21: Google accepts up to 1,000 `news:news` entries per file. */
export const NEWS_MAX_ENTRIES = 1_000

export type NewsEntry = {
  url: string
  title: string
  publishedAt: string
}

/**
 * Escapes text for XML.
 *
 * Headlines contain ampersands and quotation marks routinely, and an unescaped
 * one does not degrade — it makes the whole file unparseable, so every article
 * in it disappears from Google News at once.
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function isWithinNewsWindow(publishedAt: string, now: Date): boolean {
  const published = Date.parse(publishedAt)

  if (Number.isNaN(published)) return false

  const age = now.getTime() - published

  // Future-dated pieces are excluded too: a scheduled publication that leaked
  // into the sitemap would be announcing itself before it exists.
  return age >= 0 && age <= NEWS_WINDOW_HOURS * 3_600_000
}

export type NewsSitemapOptions = {
  publicationName: string
  language: string
  now?: Date
}

/**
 * Builds the news sitemap.
 *
 * Returns a valid, empty sitemap when nothing qualifies rather than an error:
 * a newsroom that has not published in two days is a normal state, and a 500
 * on that path would look like a broken site to the one crawler that matters
 * most here.
 */
export function buildNewsSitemap(
  entries: readonly NewsEntry[],
  { publicationName, language, now = new Date() }: NewsSitemapOptions,
): string {
  const recent = entries
    .filter((entry) => isWithinNewsWindow(entry.publishedAt, now))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, NEWS_MAX_ENTRIES)

  const urls = recent
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(publicationName)}</news:name>
        <news:language>${escapeXml(language)}</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(entry.publishedAt)}</news:publication_date>
      <news:title>${escapeXml(entry.title)}</news:title>
    </news:news>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`
}
