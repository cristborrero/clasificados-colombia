import { getPayloadClient } from '@/lib/payload/client'

/**
 * Public category reads.
 *
 * `overrideAccess: false`, so `publicActiveOrEditorial` applies: a category
 * retired with `active = false` (PRD Nº7 §118) stops being publicly visible
 * without breaking the published articles that still point at it.
 */

export type CategorySummary = {
  id: string | number
  name: string
  slug: string
  description: string | null
}

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null

function toCategory(doc: Record<string, unknown>): CategorySummary | null {
  const name = asString(doc.name)
  const slug = asString(doc.slug)

  if (!name || !slug) return null

  return {
    id: doc.id as string | number,
    name,
    slug,
    description: asString(doc.description),
  }
}

export async function getCategories(limit = 50): Promise<CategorySummary[]> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit,
    sort: 'name',
    overrideAccess: false,
  })

  return result.docs
    .map((doc) => toCategory(doc as unknown as Record<string, unknown>))
    .filter((category): category is CategorySummary => category !== null)
}

export async function getCategoryBySlug(slug: string): Promise<CategorySummary | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 1,
    where: { slug: { equals: slug } },
    overrideAccess: false,
  })

  const doc = result.docs[0] as unknown as Record<string, unknown> | undefined

  return doc ? toCategory(doc) : null
}
