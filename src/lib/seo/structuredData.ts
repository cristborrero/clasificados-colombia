import { absoluteUrl } from '@/lib/routes'

/**
 * Structured data (PRD SEO §25-§40).
 *
 * Pure builders. §51 is the rule that shapes this file: structured data is
 * generated from the content, never typed by an editor. Hand-written JSON-LD
 * drifts from the page the moment either changes, and the drift is invisible —
 * it only surfaces as a rich result that quietly stops appearing.
 *
 * Everything returns a plain object. Serialisation happens once, in the
 * component that renders the script tag, so no builder can produce a string
 * that has to be trusted.
 */
export type JsonLd = Record<string, unknown>

export type SeoAuthor = { name: string; slug: string; jobTitle?: string | null }
export type SeoImage = { url: string; alt?: string | null; width?: number; height?: number }

export type OrganizationInput = {
  name: string
  description?: string | null
  logoUrl?: string | null
  sameAs?: string[]
  email?: string | null
  phone?: string | null
}

/**
 * The publisher (PRD SEO §35-§37).
 *
 * §36 wants a stable identity, and §37 wants a real logo — not a placeholder.
 * The `@id` is what lets every article point at one organisation rather than
 * repeating a copy that can disagree with itself.
 */
export function organizationJsonLd(input: OrganizationInput): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    '@id': absoluteUrl('/#organization'),
    name: input.name,
    url: absoluteUrl('/'),
    ...(input.description ? { description: input.description } : {}),
    ...(input.logoUrl
      ? { logo: { '@type': 'ImageObject', url: input.logoUrl } }
      : {}),
    ...(input.sameAs?.length ? { sameAs: input.sameAs } : {}),
    ...(input.email || input.phone
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'editorial',
            ...(input.email ? { email: input.email } : {}),
            ...(input.phone ? { telephone: input.phone } : {}),
          },
        }
      : {}),
  }
}

export type NewsArticleInput = {
  headline: string
  description?: string | null
  path: string
  datePublished?: string | null
  dateModified?: string | null
  authors: SeoAuthor[]
  image?: SeoImage | null
  section?: string | null
  keywords?: string[]
  organizationName: string
  /** `true` for investigations, which are reported work rather than reporting. */
  isInvestigation?: boolean
}

/**
 * A news article (PRD SEO §26-§31).
 *
 * `headline` is the article's own headline, not the SEO title (§27) — Google
 * compares it against the visible H1, and a mismatch is what gets a rich result
 * dropped.
 *
 * `dateModified` is emitted only when the piece was genuinely revised (§29).
 * Publishing it equal to `datePublished` on every article tells a crawler that
 * everything is constantly updated, which devalues the signal exactly where it
 * matters: the piece carrying a correction.
 *
 * An article with no author is not marked up at all (§31): a byline is what
 * makes journalism attributable, and inventing one for a crawler would be
 * worse than omitting the markup.
 */
export function newsArticleJsonLd(input: NewsArticleInput): JsonLd | null {
  if (input.authors.length === 0) return null

  const url = absoluteUrl(input.path)

  const modified =
    input.dateModified && input.dateModified !== input.datePublished
      ? { dateModified: input.dateModified }
      : {}

  return {
    '@context': 'https://schema.org',
    '@type': input.isInvestigation ? 'ReportageNewsArticle' : 'NewsArticle',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    headline: input.headline,
    ...(input.description ? { description: input.description } : {}),
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...modified,
    author: input.authors.map((author) => ({
      '@type': 'Person',
      name: author.name,
      url: absoluteUrl(`/autor/${author.slug}`),
      ...(author.jobTitle ? { jobTitle: author.jobTitle } : {}),
    })),
    publisher: { '@id': absoluteUrl('/#organization') },
    ...(input.image
      ? {
          image: [
            {
              '@type': 'ImageObject',
              url: input.image.url,
              ...(input.image.width ? { width: input.image.width } : {}),
              ...(input.image.height ? { height: input.image.height } : {}),
            },
          ],
        }
      : {}),
    ...(input.section ? { articleSection: input.section } : {}),
    ...(input.keywords?.length ? { keywords: input.keywords.join(', ') } : {}),
    inLanguage: 'es-CO',
  }
}

export type BreadcrumbItem = { name: string; path?: string | null }

/**
 * Breadcrumbs (PRD SEO §38).
 *
 * The last item carries no URL: it is the current page, and pointing a
 * breadcrumb at itself is the kind of detail that makes a crawler discard the
 * whole trail.
 */
export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]): JsonLd | null {
  if (items.length < 2) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  }
}

export type PersonInput = {
  name: string
  slug: string
  jobTitle?: string | null
  bio?: string | null
  image?: string | null
  sameAs?: string[]
  organizationName: string
}

/** An author page (PRD SEO §33-§34). */
export function personJsonLd(input: PersonInput): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: input.name,
      url: absoluteUrl(`/autor/${input.slug}`),
      ...(input.jobTitle ? { jobTitle: input.jobTitle } : {}),
      ...(input.bio ? { description: input.bio } : {}),
      ...(input.image ? { image: input.image } : {}),
      ...(input.sameAs?.length ? { sameAs: input.sameAs } : {}),
      worksFor: { '@id': absoluteUrl('/#organization') },
    },
  }
}

export type VideoInput = {
  name: string
  description?: string | null
  path: string
  thumbnailUrl?: string | null
  uploadDate?: string | null
  durationSeconds?: number | null
}

/**
 * A video (PRD SEO §82-§83).
 *
 * `duration` is ISO 8601. A video with no thumbnail and no upload date is not
 * marked up: those are the two fields a video rich result actually requires,
 * and partial markup earns nothing while still being one more thing to keep
 * true.
 */
export function videoJsonLd(input: VideoInput): JsonLd | null {
  if (!input.thumbnailUrl || !input.uploadDate) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    contentUrl: absoluteUrl(input.path),
    thumbnailUrl: [input.thumbnailUrl],
    uploadDate: input.uploadDate,
    ...(input.durationSeconds && input.durationSeconds > 0
      ? { duration: `PT${Math.floor(input.durationSeconds)}S` }
      : {}),
    publisher: { '@id': absoluteUrl('/#organization') },
  }
}
