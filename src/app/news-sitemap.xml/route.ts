import { listPublished } from '@/data/collections'
import { getSiteSettings } from '@/data/site'
import { absoluteUrl, articlePath, investigationPath } from '@/lib/routes'
import { buildNewsSitemap, NEWS_WINDOW_HOURS, type NewsEntry } from '@/lib/seo/newsSitemap'

/**
 * /news-sitemap.xml (PRD SEO §21-§23).
 *
 * Separate from the ordinary sitemap on purpose: this one answers a different
 * question — what has this newsroom published in the last two days — and mixing
 * the two would either flood Google News with archive or hide new work among it.
 *
 * A Route Handler rather than a `sitemap.ts`, because Next's sitemap helper has
 * no way to emit the `news:` namespace.
 */
export const dynamic = 'force-dynamic'

/**
 * Fifteen minutes.
 *
 * Breaking news needs to reach the file quickly, but this is also the most
 * frequently fetched URL on the site once Google News is interested, and
 * rebuilding it per request would put a database query behind every crawl.
 */
export const revalidate = 900

export async function GET(): Promise<Response> {
  const [settings, articles, investigations] = await Promise.all([
    getSiteSettings(),
    listPublished('articles', { limit: 1_000 }),
    listPublished('investigations', { limit: 200 }),
  ])

  const entries: NewsEntry[] = [
    ...articles.map((piece) => ({
      url: absoluteUrl(articlePath(piece.category?.slug, piece.slug)),
      title: piece.title,
      publishedAt: piece.publishedAt ?? '',
    })),
    ...investigations.map((piece) => ({
      url: absoluteUrl(investigationPath(piece.slug)),
      title: piece.title,
      publishedAt: piece.publishedAt ?? '',
    })),
  ].filter((entry) => entry.publishedAt !== '')

  const xml = buildNewsSitemap(entries, {
    publicationName: settings.siteName,
    language: 'es',
  })

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Shorter than the window itself, so a piece never ages out of the file
      // later than it ages out of the window.
      'Cache-Control': `public, max-age=0, s-maxage=${revalidate}, stale-while-revalidate=${NEWS_WINDOW_HOURS * 60}`,
    },
  })
}
