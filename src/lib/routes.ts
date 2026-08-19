/**
 * URL architecture (PRD SEO §12-§14, §56-§57).
 *
 * One module owns every public path. Not tidiness: a canonical URL, a sitemap
 * entry, a card link and a redirect all have to agree, and the way they stop
 * agreeing is by each being built somewhere else.
 *
 * The shape follows §12 and §57: category hubs live at the root and articles
 * sit under their category.
 *
 *     /politica                     hub
 *     /politica/reforma-salud       article
 *     /investigacion/[slug]         investigation
 *     /tema/[slug]                  topic
 *     /autor/[slug]                 author
 *
 * §13 keeps dates out of paths — the date is metadata, not identity, and a
 * dated URL makes evergreen updates look like new pages.
 */

/**
 * Path segments that can never be a category.
 *
 * A category whose slug is `buscar` would shadow the search page — Next
 * resolves static segments first, so the hub would simply never render, and
 * nothing would report an error. Slugs are validated against this list when a
 * category is saved, so the collision is refused at the source rather than
 * discovered as a missing page.
 */
export const RESERVED_SEGMENTS = [
  'admin',
  'api',
  'autor',
  'buscar',
  'denunciar',
  'dev',
  'investigacion',
  'newsletter',
  'tema',
  '_next',
  'icon.svg',
  'robots.txt',
  'sitemap.xml',
  'news-sitemap.xml',
] as const

export const isReservedSegment = (slug: string): boolean =>
  (RESERVED_SEGMENTS as readonly string[]).includes(slug)

/* ── Public paths ──────────────────────────────────────────────────────────*/

export const homePath = (): string => '/'

/** Category hub. PRD SEO §57: a real editorial page, not an endless list. */
export const categoryPath = (slug: string): string => `/${slug}`

/**
 * An article, under its category.
 *
 * The category is part of the identity, which is the trade §12 asks for: a
 * stronger topical signal, at the cost of a URL that changes if the piece is
 * refiled. That cost is covered by the Redirects collection — moving a piece
 * writes a redirect from the old path.
 *
 * Falls back to the root when a piece has no category, so a card never links to
 * `/undefined/slug`.
 */
export const articlePath = (categorySlug: string | null | undefined, slug: string): string =>
  categorySlug ? `/${categorySlug}/${slug}` : `/${slug}`

export const investigationPath = (slug: string): string => `/investigacion/${slug}`
export const opinionPath = (slug: string): string => `/opinion/${slug}`
export const dataStoryPath = (slug: string): string => `/datos/${slug}`
export const videoPath = (slug: string): string => `/video/${slug}`
export const topicPath = (slug: string): string => `/tema/${slug}`
export const authorPath = (slug: string): string => `/autor/${slug}`

export const searchPath = (query?: string): string =>
  query ? `/buscar?q=${encodeURIComponent(query)}` : '/buscar'

/* ── Absolute URLs ─────────────────────────────────────────────────────────*/

/**
 * The canonical origin, without a trailing slash.
 *
 * Read from the environment rather than hardcoded, but normalised here so that
 * a value with or without a trailing slash produces the same canonical — a
 * duplicate that differs only by a slash is exactly what §9 is about.
 */
/**
 * Canonical form of a path, for comparing one against another.
 *
 * Both the `redirects` collection and the resolver that reads it need the same
 * answer, or `/a`, `/a/` and `a` become three rows that each half-work. Defined
 * here because it is route knowledge, and duplicated in two places it would
 * drift on the first edge case somebody handles in only one of them.
 */
export function normalisePath(path: string): string {
  const withoutQuery = path.trim().split('?')[0] ?? ''
  const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`

  return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, '') : withLeadingSlash
}

export function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

  return raw.replace(/\/+$/, '')
}

/**
 * An absolute URL for a path.
 *
 * Canonicals, Open Graph and structured data all need absolute URLs, and §9
 * forbids query strings in a canonical — so this takes a path and nothing else.
 */
export function absoluteUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`

  return `${siteOrigin()}${clean === '/' ? '' : clean}`
}
