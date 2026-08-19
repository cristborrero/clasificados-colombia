import { getPayloadClient } from '@/lib/payload/client'
import { countWords } from '@/lib/format/wordCount'

import { listPublished, toSummary, type EditorialSummary } from './collections'
import { asRecord, asString, toImageRef, toNamedRef, toNamedRefs, type ImageRef, type NamedRef } from './project'

/**
 * A single article, for the article page.
 *
 * `overrideAccess: false`, so an unpublished piece is simply not found — the
 * page never has to decide whether it is allowed to show a draft, because a
 * draft never arrives.
 *
 * Returns `null` for "not found" rather than throwing, so the page owns the
 * 404. A data function that throws a 404 has decided something the route is
 * better placed to decide.
 */
export type ArticleAuthor = NamedRef & {
  jobTitle: string | null
  portrait: ImageRef | null
}

export type ArticleView = {
  id: string | number
  slug: string
  title: string
  dek: string | null
  contentType: string | null
  publishedAt: string | null
  updatedAt: string | null
  category: NamedRef | null
  topics: NamedRef[]
  authors: ArticleAuthor[]
  hero: { image: ImageRef | null; caption: string | null; credit: string | null }
  body: unknown
  wordCount: number | null
  related: EditorialSummary[]
  /**
   * Editor-supplied SEO overrides (PRD SEO §50).
   *
   * Every one is optional and every one falls back to the content itself, so a
   * piece that nobody optimised is still correctly marked up. §51 is the reason
   * these are overrides rather than the source: the default must be generated,
   * or half the archive ends up with no metadata at all.
   */
  seo: {
    metaTitle: string | null
    metaDescription: string | null
    canonical: string | null
    noIndex: boolean
  }
}

function toAuthor(value: unknown): ArticleAuthor | null {
  const record = asRecord(value as never)
  const base = toNamedRef(value as never)

  if (!base) return null

  return {
    ...base,
    jobTitle: asString(record?.jobTitle),
    portrait: toImageRef(record?.portrait as never),
  }
}

export async function getArticleBySlug(slug: string): Promise<ArticleView | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'articles',
    // depth 2 so the author's portrait and the hero image arrive populated,
    // not as ids the page would have to fetch again.
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

  const category = toNamedRef(doc.category as never)
  const hero = asRecord(doc.hero as never)
  const heroImage = toImageRef(hero?.image as never)
  const heroRecord = asRecord(hero?.image as never)

  /*
   * Related reading comes from the same section, excluding this piece. Editors
   * can also curate it on the document itself; that field wins where it is set,
   * and this is the fallback so the end of an article is never a dead end.
   */
  const curated = Array.isArray(asRecord(doc.relations as never)?.relatedArticles)
    ? (asRecord(doc.relations as never)!.relatedArticles as unknown[])
    : []

  const curatedRelated = curated
    .map((item) => {
      const record = asRecord(item as never)

      return record ? toSummary(record) : null
    })
    .filter((item): item is EditorialSummary => item !== null)

  const related =
    curatedRelated.length > 0
      ? curatedRelated.slice(0, 3)
      : await listPublished('articles', {
          limit: 3,
          categorySlug: category?.slug ?? null,
          excludeSlug: docSlug,
        })

  return {
    id: doc.id as string | number,
    slug: docSlug,
    title,
    dek: asString(doc.dek),
    contentType: asString(doc.contentType),
    publishedAt: asString(asRecord(doc.publication as never)?.publishedAt),
    updatedAt:
      asString(asRecord(doc.publication as never)?.modifiedAt) ?? asString(doc.updatedAt),
    category,
    topics: toNamedRefs(doc.topics),
    authors: (Array.isArray(doc.authors) ? doc.authors : [])
      .map(toAuthor)
      .filter((author): author is ArticleAuthor => author !== null),
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

/** Slugs for `generateStaticParams` and for the sitemap in F16. */
export async function listPublishedArticleSlugs(limit = 500): Promise<string[]> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'articles',
    depth: 0,
    limit,
    sort: '-publication.publishedAt',
    overrideAccess: false,
  })

  return result.docs
    .map((doc) => asString((doc as unknown as Record<string, unknown>).slug))
    .filter((slug): slug is string => slug !== null)
}
