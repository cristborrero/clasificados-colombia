import type { MetadataRoute } from 'next'

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

/**
 * XML sitemap (PRD SEO §20).
 *
 * One sitemap for now. §20 anticipates splitting it per collection later, and
 * the shape here makes that a mechanical change — but a site with a few hundred
 * URLs does not need six files, and premature splitting is six things to keep
 * in sync instead of one.
 *
 * Everything here is read with `overrideAccess: false`, so unpublished work
 * cannot reach the sitemap. That matters more than it sounds: a sitemap is an
 * invitation, and inviting a crawler to a draft is how a draft gets indexed.
 */
/*
 * Lives in `src/app/` for the same reason as robots.ts: inside the `(frontend)`
 * group the sibling `[categoria]` route matches these paths first.
 */

/**
 * Generated per request, never at build time.
 *
 * With `revalidate` alone Next prerenders this during the build and serves that
 * copy for the first hour after every deploy. The production image is built
 * without a database, so what it baked was a sitemap containing the homepage
 * and nothing else — an invitation to crawl a site of one page, published every
 * time the site is redeployed.
 *
 * This is the same failure the frontend layout carries a note about: the build
 * does not know what the database will hold. Caching belongs at the edge, in
 * front of the application, where it can be invalidated by something that knows
 * when content changed.
 */
export const dynamic = 'force-dynamic'

/** Cap per collection. Google accepts 50,000 URLs; this is well inside it. */
const LIMIT = 5_000

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, investigations, opinions, dataStories, videos, categories] = await Promise.all([
    listPublished('articles', { limit: LIMIT }),
    listPublished('investigations', { limit: LIMIT }),
    listPublished('opinions', { limit: LIMIT }),
    listPublished('data-stories', { limit: LIMIT }),
    listPublished('video-stories', { limit: LIMIT }),
    getCategories(200),
  ])

  const entry = (
    path: string,
    date: string | null,
    priority: number,
    frequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  ): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    lastModified: date ? new Date(date) : undefined,
    changeFrequency: frequency,
    priority,
  })

  const authors = new Map<string, string>()
  for (const piece of [...articles, ...investigations, ...opinions]) {
    for (const author of piece.authors) authors.set(author.slug, author.name)
  }

  return [
    entry('/', null, 1, 'hourly'),

    ...categories.map((category) => entry(categoryPath(category.slug), null, 0.8, 'daily')),

    // Investigations rank above daily news on purpose: they are the work the
    // outlet is known for and they stay relevant far longer.
    ...investigations.map((piece) =>
      entry(investigationPath(piece.slug), piece.publishedAt, 0.9, 'monthly'),
    ),

    ...articles.map((piece) =>
      entry(articlePath(piece.category?.slug, piece.slug), piece.publishedAt, 0.7, 'weekly'),
    ),

    ...opinions.map((piece) => entry(opinionPath(piece.slug), piece.publishedAt, 0.6, 'monthly')),
    ...dataStories.map((piece) => entry(dataStoryPath(piece.slug), piece.publishedAt, 0.7, 'monthly')),
    ...videos.map((piece) => entry(videoPath(piece.slug), piece.publishedAt, 0.6, 'monthly')),

    ...[...authors.keys()].map((slug) => entry(authorPath(slug), null, 0.5, 'weekly')),
  ]
}
