import { getPayloadClient } from '@/lib/payload/client'

import { listPublished, toSummary, type EditorialSummary } from './collections'
import { asRecord, asString, toImageRef, type ImageRef } from './project'

/**
 * Author, category and topic pages (PRD Nº8 §89-§91).
 *
 * Everything here queries with `overrideAccess: false`, so a retired author or
 * a deactivated category — PRD Nº7 §118 asks for `active = false` rather than
 * deletion — stops being publicly reachable without breaking the published
 * articles that still reference it.
 */

export type AuthorProfile = {
  id: string | number
  name: string
  slug: string
  jobTitle: string | null
  bio: string | null
  expertise: string[]
  portrait: ImageRef | null
  articles: EditorialSummary[]
  investigations: EditorialSummary[]
}

async function byAuthor(
  collection: 'articles' | 'investigations',
  authorId: string | number,
  limit: number,
): Promise<EditorialSummary[]> {
  const payload = await getPayloadClient()

  try {
    const result = await payload.find({
      collection,
      depth: 1,
      limit,
      sort: '-publication.publishedAt',
      where: { authors: { in: [authorId] } },
      overrideAccess: false,
    })

    return result.docs
      .map((doc) => toSummary(doc as unknown as Record<string, unknown>))
      .filter((item): item is EditorialSummary => item !== null)
  } catch {
    return []
  }
}

export async function getAuthorBySlug(slug: string): Promise<AuthorProfile | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'authors',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
    overrideAccess: false,
  })

  const doc = result.docs[0] as unknown as Record<string, unknown> | undefined
  if (!doc) return null

  const name = asString(doc.name)
  const authorSlug = asString(doc.slug)
  if (!name || !authorSlug) return null

  const [articles, investigations] = await Promise.all([
    byAuthor('articles', doc.id as string | number, 12),
    byAuthor('investigations', doc.id as string | number, 6),
  ])

  return {
    id: doc.id as string | number,
    name,
    slug: authorSlug,
    jobTitle: asString(doc.jobTitle),
    bio: asString(doc.bio),
    expertise: Array.isArray(doc.expertise)
      ? doc.expertise
          .map((item) => asString(asRecord(item as never)?.area) ?? asString(item))
          .filter((item): item is string => item !== null)
      : [],
    portrait: toImageRef(doc.portrait as never),
    articles,
    investigations,
  }
}

export type SectionProfile = {
  id: string | number
  name: string
  slug: string
  description: string | null
  featured: EditorialSummary | null
  latest: EditorialSummary[]
  /** Child categories, for §90's "subsections". */
  subsections: { name: string; slug: string }[]
}

export async function getCategoryBySlug(slug: string): Promise<SectionProfile | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'categories',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
    overrideAccess: false,
  })

  const doc = result.docs[0] as unknown as Record<string, unknown> | undefined
  if (!doc) return null

  const name = asString(doc.name)
  const categorySlug = asString(doc.slug)
  if (!name || !categorySlug) return null

  /*
   * §90: "No simple listado plano." So the newest piece is pulled out as the
   * featured story and the rest form the stream — one extra is fetched so
   * promoting the first does not leave the stream one short.
   */
  const pieces = await listPublished('articles', { limit: 13, categorySlug })

  const children = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 20,
    sort: 'name',
    where: { parent: { equals: doc.id } },
    overrideAccess: false,
  })

  return {
    id: doc.id as string | number,
    name,
    slug: categorySlug,
    description: asString(doc.description),
    featured: pieces[0] ?? null,
    latest: pieces.slice(1),
    subsections: children.docs.flatMap((child) => {
      const record = child as unknown as Record<string, unknown>
      const childName = asString(record.name)
      const childSlug = asString(record.slug)

      return childName && childSlug ? [{ name: childName, slug: childSlug }] : []
    }),
  }
}

export type TopicProfile = {
  id: string | number
  name: string
  slug: string
  description: string | null
  articles: EditorialSummary[]
  investigations: EditorialSummary[]
}

export async function getTopicBySlug(slug: string): Promise<TopicProfile | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'topics',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
    overrideAccess: false,
  })

  const doc = result.docs[0] as unknown as Record<string, unknown> | undefined
  if (!doc) return null

  const name = asString(doc.name)
  const topicSlug = asString(doc.slug)
  if (!name || !topicSlug) return null

  const byTopic = async (collection: 'articles' | 'investigations', limit: number) => {
    try {
      const found = await payload.find({
        collection,
        depth: 1,
        limit,
        sort: '-publication.publishedAt',
        where: { topics: { in: [doc.id] } },
        overrideAccess: false,
      })

      return found.docs
        .map((item) => toSummary(item as unknown as Record<string, unknown>))
        .filter((item): item is EditorialSummary => item !== null)
    } catch {
      return []
    }
  }

  const [articles, investigations] = await Promise.all([byTopic('articles', 12), byTopic('investigations', 6)])

  return {
    id: doc.id as string | number,
    name,
    slug: topicSlug,
    description: asString(doc.description),
    articles,
    investigations,
  }
}

/**
 * Every publicly visible category.
 *
 * Used by the sitemap and by anything that needs the full section list.
 * `overrideAccess: false` keeps retired categories (`active = false`) out of it,
 * which is the same rule the hubs themselves follow — a sitemap is an
 * invitation, and inviting a crawler to a retired section is how a dead page
 * gets indexed.
 */
export async function getCategories(limit = 100): Promise<CategorySummary[]> {
  const payload = await getPayloadClient()

  try {
    const result = await payload.find({
      collection: 'categories',
      depth: 0,
      limit,
      sort: 'order',
      overrideAccess: false,
    })

    return result.docs.flatMap((doc) => {
      const record = doc as unknown as Record<string, unknown>
      const name = asString(record.name)
      const slug = asString(record.slug)

      return name && slug
        ? [{ id: record.id as string | number, name, slug, description: asString(record.description) }]
        : []
    })
  } catch {
    return []
  }
}

export type CategorySummary = {
  id: string | number
  name: string
  slug: string
  description: string | null
}
