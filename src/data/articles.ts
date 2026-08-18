import { getPayloadClient } from '@/lib/payload/client'

/**
 * Public article reads.
 *
 * Every query here runs with `overrideAccess: false`. That is the entire point
 * of the file: the collection's own access rule — which reduces to
 * `{ _status: { equals: 'published' } }` for an anonymous reader — is what
 * decides what comes back. Nothing in this layer re-implements that filter,
 * because two copies of a rule are two places for it to drift, and the drift
 * that matters here publishes a draft (risk R-01).
 *
 * The return types are projections, not Payload documents. A field that is not
 * listed does not reach the browser — not by scrubbing, but because it was
 * never selected.
 */

export type ArticleSummary = {
  id: string | number
  slug: string
  title: string
  dek: string | null
  publishedAt: string | null
  category: { name: string; slug: string } | null
  authors: { name: string; slug: string }[]
  image: { url: string; alt: string } | null
}

export type ArticleDetail = ArticleSummary & {
  content: unknown
  updatedAt: string | null
}

type Related = Record<string, unknown> | string | number | null | undefined

const asRecord = (value: Related): Record<string, unknown> | null =>
  value && typeof value === 'object' ? value : null

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null

function toSummary(doc: Record<string, unknown>): ArticleSummary | null {
  const slug = asString(doc.slug)
  const title = asString(doc.title)

  // A published document with no slug cannot be linked to. Dropping it beats
  // rendering a card that navigates to /undefined.
  if (!slug || !title) return null

  const category = asRecord(doc.category as Related)
  const image = asRecord(doc.featuredImage as Related)

  const authors = Array.isArray(doc.authors)
    ? doc.authors
        .map((author) => asRecord(author as Related))
        .flatMap((author) => {
          const name = asString(author?.name)
          const authorSlug = asString(author?.slug)

          return name && authorSlug ? [{ name, slug: authorSlug }] : []
        })
    : []

  const imageUrl = asString(image?.url)

  return {
    id: doc.id as string | number,
    slug,
    title,
    dek: asString(doc.dek),
    publishedAt: asString(doc.publishedAt),
    category:
      category && asString(category.name) && asString(category.slug)
        ? { name: category.name as string, slug: category.slug as string }
        : null,
    authors,
    image: imageUrl
      ? {
          url: imageUrl,
          // PRD Nº8 §110: an image with no alt is not an image, it is a gap.
          // Empty string marks it decorative, which is wrong for editorial
          // photography — so a missing alt is surfaced, not invented.
          alt: asString(image?.alt) ?? '',
        }
      : null,
  }
}

export async function getLatestArticles(limit = 12): Promise<ArticleSummary[]> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'articles',
    depth: 1,
    limit,
    sort: '-publishedAt',
    overrideAccess: false,
  })

  return result.docs
    .map((doc) => toSummary(doc as unknown as Record<string, unknown>))
    .filter((article): article is ArticleSummary => article !== null)
}

export async function getArticlesByCategory(
  categorySlug: string,
  limit = 12,
): Promise<ArticleSummary[]> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'articles',
    depth: 1,
    limit,
    sort: '-publishedAt',
    where: { 'category.slug': { equals: categorySlug } },
    overrideAccess: false,
  })

  return result.docs
    .map((doc) => toSummary(doc as unknown as Record<string, unknown>))
    .filter((article): article is ArticleSummary => article !== null)
}

/** `null` when it does not exist *or* is not public. The page decides the 404. */
export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'articles',
    depth: 2,
    limit: 1,
    where: { slug: { equals: slug } },
    overrideAccess: false,
  })

  const doc = result.docs[0] as unknown as Record<string, unknown> | undefined
  if (!doc) return null

  const summary = toSummary(doc)
  if (!summary) return null

  return {
    ...summary,
    content: doc.content ?? null,
    updatedAt: asString(doc.updatedAt),
  }
}
