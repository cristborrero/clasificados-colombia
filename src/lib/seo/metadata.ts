import type { Metadata } from 'next'

import { absoluteUrl } from '@/lib/routes'

/**
 * Page metadata (PRD SEO §6-§9, §41-§49).
 *
 * One builder, so canonical, Open Graph and Twitter cards cannot disagree —
 * which is how they normally break: three places, one of them updated.
 */
export type PageMetaInput = {
  title: string
  description?: string | null
  path: string
  image?: { url: string; alt?: string | null } | null
  publishedAt?: string | null
  modifiedAt?: string | null
  authors?: string[]
  section?: string | null
  /** Search results, tip forms, the workbench. */
  noindex?: boolean
  type?: 'website' | 'article'
}

/**
 * Robots directives.
 *
 * `max-image-preview: large` is what PRD SEO §43 requires and what Google
 * Discover needs to show a piece with a full-width image (§41-§42). Without it
 * a story can be eligible for Discover and still appear as a thumbnail nobody
 * taps.
 */
const INDEXABLE: Metadata['robots'] = {
  index: true,
  follow: true,
  /*
   * These belong on the generic `robots` meta, not only under `googleBot`.
   * Next emits the `googleBot` block as a separate `<meta name="googlebot">`,
   * which every other crawler ignores — and Google reads `robots` anyway, so
   * scoping the preview directives to one agent buys nothing and costs the
   * large previews everywhere else.
   */
  'max-image-preview': 'large',
  'max-snippet': -1,
  'max-video-preview': -1,
}

const NOT_INDEXABLE: Metadata['robots'] = { index: false, follow: true }

export function buildPageMetadata(input: PageMetaInput): Metadata {
  const url = absoluteUrl(input.path)
  const description = input.description ?? undefined

  const images = input.image
    ? [{ url: input.image.url, alt: input.image.alt ?? input.title }]
    : undefined

  return {
    title: input.title,
    description,

    // §9: the canonical is a path, never a URL carrying query parameters.
    alternates: { canonical: url },

    robots: input.noindex ? NOT_INDEXABLE : INDEXABLE,

    openGraph: {
      type: input.type ?? 'website',
      url,
      title: input.title,
      description,
      locale: 'es_CO',
      ...(images ? { images } : {}),
      ...(input.type === 'article'
        ? {
            publishedTime: input.publishedAt ?? undefined,
            // Only when the piece genuinely changed — same reasoning as the
            // structured data (§29).
            modifiedTime:
              input.modifiedAt && input.modifiedAt !== input.publishedAt
                ? input.modifiedAt
                : undefined,
            authors: input.authors,
            section: input.section ?? undefined,
          }
        : {}),
    },

    twitter: {
      // §49: a large card, because the image is the reason anyone stops.
      card: images ? 'summary_large_image' : 'summary',
      title: input.title,
      description,
      ...(images ? { images: images.map((image) => image.url) } : {}),
    },
  }
}
