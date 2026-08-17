import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Stamps `firstPublishedAt` once, and never again (PRD Nº7 §36).
 *
 * This is what lets a piece be corrected years later without appearing to be
 * new. `publication.publishedAt` is the date a reader sees and an editor may
 * legitimately adjust; `firstPublishedAt` is the historical fact that the story
 * entered the world on a particular day.
 *
 * Also defaults `publishedAt` on first publication, because an article that
 * goes public with no date breaks the byline, the sitemap and the structured
 * data at once (PRD SEO §28).
 *
 * Deliberately does NOT touch `modifiedAt`. PRD SEO §29 reserves that for
 * material updates decided by a human — moving it automatically on every save
 * is exactly what §74 calls faking freshness.
 */
type PublicationShape = {
  publishedAt?: string | null
  firstPublishedAt?: string | null
}

type PublishableDoc = {
  _status?: 'draft' | 'published'
  publication?: PublicationShape
}

export const recordFirstPublication: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const incoming = data as PublishableDoc
  const stored = (originalDoc ?? undefined) as PublishableDoc | undefined

  const becomingPublic = incoming._status === 'published'

  if (!becomingPublic) return data

  const alreadyStamped =
    stored?.publication?.firstPublishedAt ?? incoming.publication?.firstPublishedAt

  const now = new Date().toISOString()

  const publication: PublicationShape = {
    ...stored?.publication,
    ...incoming.publication,
  }

  if (!publication.publishedAt) {
    publication.publishedAt = now
  }

  // Written once. A second publication after unpublishing keeps the original
  // date, which is the whole point.
  publication.firstPublishedAt = alreadyStamped ?? now

  return { ...data, publication }
}
