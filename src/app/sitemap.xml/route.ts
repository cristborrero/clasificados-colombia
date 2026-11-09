import { listPublished } from '@/data/collections'
import { getCategories } from '@/data/profiles'
import {
  absoluteUrl,
  articlePath,
  authorPath,
  categoryPath,
  dataStoryPath,
  investigationPath,
  opinionPath,
  videoPath,
} from '@/lib/routes'

export const dynamic = 'force-dynamic'
export const revalidate = 900

const LIMIT = 1_000

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toIsoDate(date: string | null | undefined): string | null {
  if (!date) return null
  try {
    const d = new Date(date)
    return isNaN(d.getTime()) ? null : d.toISOString()
  } catch {
    return null
  }
}

type SitemapItem = {
  url: string
  lastModified?: string | null
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

export async function GET(): Promise<Response> {
  try {
    const [articles, investigations, opinions, dataStories, videos, categories] = await Promise.all([
      listPublished('articles', { limit: LIMIT }).catch(() => []),
      listPublished('investigations', { limit: LIMIT }).catch(() => []),
      listPublished('opinions', { limit: LIMIT }).catch(() => []),
      listPublished('data-stories', { limit: LIMIT }).catch(() => []),
      listPublished('video-stories', { limit: LIMIT }).catch(() => []),
      getCategories(200).catch(() => []),
    ])

    const items: SitemapItem[] = [
      {
        url: absoluteUrl('/'),
        changefreq: 'hourly',
        priority: 1.0,
      },
    ]

    for (const cat of categories) {
      if (cat.slug) {
        items.push({
          url: absoluteUrl(categoryPath(cat.slug)),
          changefreq: 'daily',
          priority: 0.8,
        })
      }
    }

    for (const piece of investigations) {
      items.push({
        url: absoluteUrl(investigationPath(piece.slug)),
        lastModified: toIsoDate(piece.publishedAt),
        changefreq: 'monthly',
        priority: 0.9,
      })
    }

    for (const piece of articles) {
      items.push({
        url: absoluteUrl(articlePath(piece.category?.slug, piece.slug)),
        lastModified: toIsoDate(piece.publishedAt),
        changefreq: 'weekly',
        priority: 0.7,
      })
    }

    for (const piece of opinions) {
      items.push({
        url: absoluteUrl(opinionPath(piece.slug)),
        lastModified: toIsoDate(piece.publishedAt),
        changefreq: 'monthly',
        priority: 0.6,
      })
    }

    for (const piece of dataStories) {
      items.push({
        url: absoluteUrl(dataStoryPath(piece.slug)),
        lastModified: toIsoDate(piece.publishedAt),
        changefreq: 'monthly',
        priority: 0.7,
      })
    }

    for (const piece of videos) {
      items.push({
        url: absoluteUrl(videoPath(piece.slug)),
        lastModified: toIsoDate(piece.publishedAt),
        changefreq: 'monthly',
        priority: 0.6,
      })
    }

    const authorSlugs = new Set<string>()
    for (const piece of [...articles, ...investigations, ...opinions]) {
      for (const a of piece.authors || []) {
        if (a && a.slug) authorSlugs.add(a.slug)
      }
    }

    for (const slug of authorSlugs) {
      items.push({
        url: absoluteUrl(authorPath(slug)),
        changefreq: 'weekly',
        priority: 0.5,
      })
    }

    const xmlLines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...items.map(
        (it) => `  <url>
    <loc>${escapeXml(it.url)}</loc>${it.lastModified ? `\n    <lastmod>${it.lastModified}</lastmod>` : ''}
    <changefreq>${it.changefreq}</changefreq>
    <priority>${it.priority.toFixed(1)}</priority>
  </url>`,
      ),
      '</urlset>',
    ]

    return new Response(xmlLines.join('\n'), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': `public, max-age=0, s-maxage=${revalidate}, stale-while-revalidate=86400`,
      },
    })
  } catch (err) {
    // Fallback sitemap si la base de datos no respondiera
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(absoluteUrl('/'))}</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

    return new Response(fallbackXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
      },
    })
  }
}

