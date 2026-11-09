import { getPayloadClient } from '@/lib/payload/client'
import { countWords } from '@/lib/format/wordCount'

import { listPublished, type EditorialSummary } from './collections'
import { asRecord, asString, toImageRef, toNamedRef, type ImageRef, type NamedRef } from './project'

/**
 * A single opinion piece, for the opinion page (PRD Nº7 §57-§58).
 *
 * One author per §57: an opinion is a person's argument, not a newsroom position.
 * `overrideAccess: false`, so an unpublished piece is simply not found.
 */
export type OpinionAuthor = NamedRef & {
  jobTitle: string | null
  portrait: ImageRef | null
}

export type OpinionView = {
  id: string | number
  slug: string
  title: string
  dek: string | null
  contentNature: string
  publishedAt: string | null
  updatedAt: string | null
  author: OpinionAuthor | null
  hero: { image: ImageRef | null; caption: string | null; credit: string | null }
  body: unknown
  wordCount: number | null
  related: EditorialSummary[]
  seo: {
    metaTitle: string | null
    metaDescription: string | null
    canonical: string | null
    noIndex: boolean
  }
}

function toAuthor(value: unknown): OpinionAuthor | null {
  const record = asRecord(value as never)
  const base = toNamedRef(value as never)

  if (!base) return null

  return {
    ...base,
    jobTitle: asString(record?.jobTitle),
    portrait: toImageRef(record?.portrait as never),
  }
}

export async function getOpinionBySlug(slug: string): Promise<OpinionView | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'opinions',
    depth: 2,
    limit: 1,
    where: { slug: { equals: slug } },
    overrideAccess: false,
  })

  const doc = result.docs[0] as unknown as Record<string, unknown> | undefined
  if (!doc) return null

  const title = asString(doc.title)
  const docSlug = asString(doc.slug)
  if (!title || !docSlug) return null

  const hero = asRecord(doc.hero as never)
  const heroImage = toImageRef(hero?.image as never)
  const heroRecord = asRecord(hero?.image as never)

  const related = await listPublished('opinions', {
    limit: 3,
    excludeSlug: docSlug,
  })

  return {
    id: doc.id as string | number,
    slug: docSlug,
    title,
    dek: asString(doc.dek),
    contentNature: asString(doc.contentNature) ?? 'opinion',
    publishedAt: asString(asRecord(doc.publication as never)?.publishedAt),
    updatedAt:
      asString(asRecord(doc.publication as never)?.modifiedAt) ?? asString(doc.updatedAt),
    author: toAuthor(doc.author),
    hero: {
      image: heroImage,
      caption: asString(hero?.captionOverride) ?? asString(heroRecord?.caption),
      credit: asString(heroRecord?.credit),
    },
    seo: {
      metaTitle: asString(asRecord(doc.seo as never)?.metaTitle),
      metaDescription: asString(asRecord(doc.seo as never)?.metaDescription),
      canonical: asString(asRecord(doc.seo as never)?.canonical),
      noIndex: asRecord(doc.seo as never)?.noIndex === true,
    },
    body: doc.body ?? null,
    wordCount: countWords(doc.body) || null,
    related,
  }
}

export async function listPublishedOpinionSlugs(limit = 500): Promise<string[]> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'opinions',
    depth: 0,
    limit,
    sort: '-publication.publishedAt',
    overrideAccess: false,
  })

  return result.docs
    .map((doc) => asString((doc as unknown as Record<string, unknown>).slug))
    .filter((slug): slug is string => slug !== null)
}

