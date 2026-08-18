/*
 * NOTE ON `server-only`: this module is deliberately *not* marked with it.
 *
 * `server-only` throws unless it is resolved through Next's `react-server`
 * export condition, and `pnpm search:reindex` runs under plain Node via the
 * Payload CLI — where the marker turns a maintenance command into a crash.
 *
 * The guard lives one layer up, in `src/data/search.ts`, which only Next ever
 * imports. What protects the key here is that it is read from a non-`PUBLIC`
 * environment variable, so a client bundle would receive `undefined` rather
 * than a credential — and it is read inside a function, never at module scope,
 * so importing this file has no side effect at all.
 */

import type { Payload } from 'payload'

import { addDocuments, deleteDocument, ensureIndex, applySettings } from './client'
import {
  deriveSearchPriority,
  isIndexable,
  normaliseBodyText,
  searchDocumentId,
  searchUrl,
  toBodyText,
  type EditorialSearchDocument,
  type SearchAuthor,
} from './document'
import { INDEXES } from './settings'

/**
 * Turns Payload documents into index documents and pushes them.
 *
 * The gate is `isIndexable`, applied to every record without exception, before
 * anything is built. PRD Nº9 §42 and §4 are the requirement; the reason it is
 * enforced here rather than only in the query that fetched the records is that
 * a `where` clause is one edit away from being wrong, and the consequence of it
 * being wrong is a draft investigation appearing in public search results.
 *
 * `toSearchDocument` is likewise an allowlist (§10). A field that is not named
 * cannot reach Meilisearch, whatever gets added to the collection later.
 */

const INDEXED_COLLECTIONS = [
  'articles',
  'investigations',
  'opinions',
  'data-stories',
  'video-stories',
] as const

export type IndexedCollection = (typeof INDEXED_COLLECTIONS)[number]

export const isIndexedCollection = (value: string): value is IndexedCollection =>
  (INDEXED_COLLECTIONS as readonly string[]).includes(value)

type Raw = Record<string, unknown>

const asRecord = (value: unknown): Raw | null =>
  value && typeof value === 'object' ? (value as Raw) : null

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined

const names = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        const name = asString(asRecord(item)?.name)

        return name ? [name] : []
      })
    : []

function toAuthors(value: unknown): SearchAuthor[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((raw) => {
    const record = asRecord(raw)
    const name = asString(record?.name)
    const slug = asString(record?.slug)

    return name && slug && record?.id != null
      ? [{ id: String(record.id), name, slug }]
      : []
  })
}

export type ToSearchDocumentOptions = {
  /** True only while the breaking bar actually points at this piece (§19). */
  breaking?: boolean
}

/**
 * Builds the index document, or `null` when the record must not be indexed.
 *
 * `publishedAt` is emitted as a number: Meilisearch cannot sort or filter on an
 * ISO string, and a date stored as text silently sorts lexicographically —
 * which happens to look correct for ISO dates until a timezone offset appears.
 */
export function toSearchDocument(
  collection: string,
  doc: Raw,
  options: ToSearchDocumentOptions = {},
): EditorialSearchDocument | null {
  const publication = asRecord(doc.publication)
  const slug = asString(doc.slug)
  const title = asString(doc.title)

  if (
    !isIndexable({
      _status: asString(doc._status) ?? null,
      editorialStatus: asString(asRecord(doc.workflow)?.editorialStatus) ?? null,
      slug: slug ?? null,
      title: title ?? null,
    })
  ) {
    return null
  }

  const publishedAtRaw = asString(publication?.publishedAt)
  const publishedAt = publishedAtRaw ? Date.parse(publishedAtRaw) : Number.NaN

  const category = asRecord(doc.category)
  const categoryName = asString(category?.name)
  const categorySlug = asString(category?.slug)

  const hero = asRecord(doc.hero)
  const heroImage = asString(asRecord(hero?.image)?.url) ?? asString(asRecord(doc.poster)?.url)

  const topics = Array.isArray(doc.topics)
    ? doc.topics.flatMap((raw) => {
        const record = asRecord(raw)
        const name = asString(record?.name)
        const topicSlug = asString(record?.slug)

        return name && topicSlug ? [{ name, slug: topicSlug }] : []
      })
    : []

  return {
    id: searchDocumentId(collection, doc.id as string | number),
    title: title!,
    ...(asString(doc.dek) ? { dek: asString(doc.dek)! } : {}),
    bodyText: normaliseBodyText(toBodyText(doc.body ?? doc.transcript ?? null)),
    slug: slug!,
    url: searchUrl(collection, slug!),
    collection,
    contentType: asString(doc.contentType) ?? collection,
    ...(categoryName && categorySlug && category?.id != null
      ? { category: { id: String(category.id), name: categoryName, slug: categorySlug } }
      : {}),
    topics: topics.map((topic) => topic.name),
    topicSlugs: topics.map((topic) => topic.slug),
    authors: toAuthors(doc.authors),
    people: names(doc.people),
    organizations: names(doc.organizations),
    // A published piece with no date sorts to the epoch rather than being
    // dropped: it is still a legitimate result, just an undated one.
    publishedAt: Number.isNaN(publishedAt) ? 0 : publishedAt,
    ...(heroImage ? { heroImage } : {}),
    featured: doc.featured === true,
    breaking: options.breaking === true,
    searchPriority: deriveSearchPriority({
      collection,
      contentType: asString(doc.contentType) ?? null,
      featured: doc.featured === true,
      breaking: options.breaking === true,
    }),
  }
}

/** Creates the three indexes and applies their versioned settings. */
export async function prepareIndexes(): Promise<void> {
  for (const index of Object.values(INDEXES)) {
    await ensureIndex(index)
    await applySettings(index)
  }
}

/**
 * Pushes one document, or removes it if it is no longer indexable.
 *
 * The removal branch is what makes unpublishing work (§78). Without it, taking
 * a piece down from the site leaves it findable in search — which, for a story
 * pulled for legal reasons, is the failure that matters.
 */
export async function syncDocument(
  collection: string,
  doc: Raw,
  options: ToSearchDocumentOptions = {},
): Promise<'upserted' | 'deleted'> {
  const searchDocument = toSearchDocument(collection, doc, options)

  if (!searchDocument) {
    await deleteDocument(INDEXES.editorial, searchDocumentId(collection, doc.id as string | number))

    return 'deleted'
  }

  await addDocuments(INDEXES.editorial, [searchDocument])

  return 'upserted'
}

export async function removeDocument(collection: string, id: string | number): Promise<void> {
  await deleteDocument(INDEXES.editorial, searchDocumentId(collection, id))
}

export type ReindexResult = { collection: string; indexed: number; skipped: number }

/**
 * Rebuilds the editorial index from Payload (PRD Nº9 §3, CLAUDE.md §41).
 *
 * §3 is the requirement this satisfies: if Meilisearch is lost entirely,
 * Payload plus a full reindex must restore search. That is what makes it
 * legitimate to treat the index as a derivative and to leave it out of backups
 * (PRD Nº4 §65).
 *
 * Reads with `overrideAccess: true` on purpose — this runs as a maintenance
 * task with no user — and then applies `isIndexable` to every record, so the
 * elevated read cannot become an elevated write into a public index.
 */
export async function reindexAll(
  payload: Payload,
  { batchSize = 100 }: { batchSize?: number } = {},
): Promise<ReindexResult[]> {
  await prepareIndexes()

  const results: ReindexResult[] = []

  for (const collection of INDEXED_COLLECTIONS) {
    let page = 1
    let indexed = 0
    let skipped = 0

    for (;;) {
      const result = await payload.find({
        collection,
        depth: 1,
        limit: batchSize,
        page,
        overrideAccess: true,
      })

      const documents = result.docs
        .map((doc) => toSearchDocument(collection, doc as unknown as Raw))
        .filter((doc): doc is EditorialSearchDocument => doc !== null)

      skipped += result.docs.length - documents.length
      indexed += documents.length

      await addDocuments(INDEXES.editorial, documents)

      if (!result.hasNextPage) break
      page += 1
    }

    results.push({ collection, indexed, skipped })
  }

  return results
}
