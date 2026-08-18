import type { CollectionSlug, Where } from 'payload'

import { getPayloadClient } from '@/lib/payload/client'

import {
  asNumber,
  asString,
  toImageRef,
  toNamedRef,
  toNamedRefs,
  type ImageRef,
  type NamedRef,
} from './project'

/**
 * Reads across the editorial collections.
 *
 * One projector rather than one per collection, because the collections share
 * an anatomy on purpose: every published piece has a slug, a headline, a dek,
 * a byline and a date. Where they differ — a video's duration, a data story's
 * headline figure — the extra field is read alongside, not by forking the
 * function.
 *
 * `overrideAccess: false` everywhere, without exception. The published filter
 * is the collection's own rule, and this layer never restates it.
 */
export type EditorialCollection =
  | 'articles'
  | 'investigations'
  | 'opinions'
  | 'data-stories'
  | 'video-stories'

export type EditorialSummary = {
  id: string | number
  slug: string
  title: string
  dek: string | null
  publishedAt: string | null
  category: NamedRef | null
  authors: NamedRef[]
  image: ImageRef | null
  /** data-stories only. */
  figure: string | null
  figureContext: string | null
  /** video-stories only, in seconds. */
  duration: number | null
}

function toSummary(doc: Record<string, unknown>): EditorialSummary | null {
  const slug = asString(doc.slug)
  const title = asString(doc.title)

  // A published piece with no slug cannot be linked to. Dropping it beats
  // rendering a card that navigates to /undefined.
  if (!slug || !title) return null

  return {
    id: doc.id as string | number,
    slug,
    title,
    dek: asString(doc.dek),
    publishedAt: asString(doc.publishedAt),
    category: toNamedRef(doc.category as never),
    authors: toNamedRefs(doc.authors),
    image: toImageRef((doc.featuredImage ?? doc.poster ?? doc.heroImage) as never),
    figure: asString(doc.headlineFigure),
    figureContext: asString(doc.headlineFigureContext),
    duration: asNumber(doc.duration),
  }
}

export type ListOptions = {
  limit?: number
  categorySlug?: string | null
  /** Excluded from the result — used to keep the hero out of the bands below it. */
  excludeSlug?: string | null
}

export async function listPublished(
  collection: EditorialCollection,
  { limit = 6, categorySlug, excludeSlug }: ListOptions = {},
): Promise<EditorialSummary[]> {
  const payload = await getPayloadClient()

  const conditions: Where[] = []
  if (categorySlug) conditions.push({ 'category.slug': { equals: categorySlug } })
  if (excludeSlug) conditions.push({ slug: { not_equals: excludeSlug } })

  try {
    const result = await payload.find({
      collection: collection as CollectionSlug,
      depth: 1,
      // One extra is fetched so a dropped document does not silently shorten
      // the band by one.
      limit: limit + 1,
      sort: '-publishedAt',
      where: conditions.length > 0 ? { and: conditions } : undefined,
      overrideAccess: false,
    })

    return result.docs
      .map((doc) => toSummary(doc as unknown as Record<string, unknown>))
      .filter((item): item is EditorialSummary => item !== null)
      .slice(0, limit)
  } catch {
    /*
     * A failed band renders empty rather than taking the page down with it.
     * PRD Nº8 §162: one broken section must not become a blank homepage on the
     * day the newsroom most needs a homepage.
     */
    return []
  }
}

export async function findPublishedBySlug(
  collection: EditorialCollection,
  slug: string,
): Promise<EditorialSummary | null> {
  const payload = await getPayloadClient()

  try {
    const result = await payload.find({
      collection: collection as CollectionSlug,
      depth: 1,
      limit: 1,
      where: { slug: { equals: slug } },
      overrideAccess: false,
    })

    const doc = result.docs[0] as unknown as Record<string, unknown> | undefined

    return doc ? toSummary(doc) : null
  } catch {
    return null
  }
}
