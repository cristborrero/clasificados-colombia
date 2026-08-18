import type { Entity } from '@/components/investigations/EntityList'
import type { PublicEvidenceCard } from '@/components/evidence/EvidenceCard'
import { toPublicEvidence } from '@/evidence/authorization'
import { countWords } from '@/lib/format/wordCount'
import { getPayloadClient } from '@/lib/payload/client'

import {
  asNumber,
  asRecord,
  asString,
  toImageRef,
  toNamedRef,
  type ImageRef,
} from './project'

/**
 * A single investigation, for the investigation page.
 *
 * The evidence list is the part worth reading twice. It is not filtered here by
 * a `where` clause that could be forgotten or inverted — every record is run
 * through `toPublicEvidence`, the F6 projection that returns `null` for
 * anything not both `public` and `approved`, and that has no `bucket` or
 * `objectKey` field to leak in the first place.
 *
 * That is deliberately belt and braces on top of the collection's own access
 * rule. PRD Nº8 §88 is the requirement, and the consequence of getting it wrong
 * is not a broken page: the existence of a document can identify the source who
 * provided it.
 */
export type InvestigationAuthor = {
  name: string
  slug: string
  jobTitle: string | null
  portrait: ImageRef | null
}

export type InvestigationChapter = {
  title: string
  slug: string
  intro: string | null
  body: unknown
}

export type InvestigationView = {
  id: string | number
  slug: string
  title: string
  summary: string | null
  publishedAt: string | null
  updatedAt: string | null
  authors: InvestigationAuthor[]
  hero: { image: ImageRef | null; caption: string | null; credit: string | null }
  keyFindings: { headline: string; description: string | null; sourceReference: string | null }[]
  chapters: InvestigationChapter[]
  timeline: { date: string; title: string; description: string | null }[]
  entities: Entity[]
  methodology: string | null
  evidence: PublicEvidenceCard[]
  wordCount: number | null
}

function toAuthor(value: unknown): InvestigationAuthor | null {
  const base = toNamedRef(value as never)
  if (!base) return null

  const record = asRecord(value as never)

  return {
    ...base,
    jobTitle: asString(record?.jobTitle),
    portrait: toImageRef(record?.portrait as never),
  }
}

/**
 * A named entity, with the context §81 requires.
 *
 * An entity whose context is missing is dropped, not listed bare. A list of
 * names under an investigation into corruption reads as a list of the corrupt,
 * and the person who answered questions honestly would appear identically to
 * the person under investigation.
 */
function toEntity(value: unknown, kind: Entity['kind']): Entity | null {
  const base = toNamedRef(value as never)
  if (!base) return null

  const record = asRecord(value as never)

  const context =
    asString(record?.contextInInvestigation) ??
    asString(record?.roleDescription) ??
    asString(record?.description)

  if (!context) return null

  return { ...base, kind, context, role: asString(record?.roleDescription) }
}

export async function getInvestigationBySlug(slug: string): Promise<InvestigationView | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'investigations',
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
  const heroRecord = asRecord(hero?.image as never)

  const array = (value: unknown): Record<string, unknown>[] =>
    Array.isArray(value)
      ? value.map((item) => asRecord(item as never)).filter((item): item is Record<string, unknown> => item !== null)
      : []

  const chapters = array(doc.chapters).flatMap((chapter) => {
    const chapterTitle = asString(chapter.title)
    const chapterSlug = asString(chapter.slug)

    // A chapter with no slug has no anchor, so the contents nav could not link
    // to it. Dropping it beats rendering a table of contents with dead entries.
    return chapterTitle && chapterSlug
      ? [
          {
            title: chapterTitle,
            slug: chapterSlug,
            intro: asString(chapter.intro),
            body: chapter.body ?? null,
          },
        ]
      : []
  })

  const evidenceResult = await payload.find({
    collection: 'evidence',
    depth: 0,
    limit: 50,
    where: { relatedInvestigation: { equals: doc.id } },
    overrideAccess: false,
  })

  const evidence = evidenceResult.docs.flatMap((raw) => {
    const record = raw as unknown as Record<string, unknown>

    const projected = toPublicEvidence({
      id: record.id as string | number,
      title: asString(record.title) ?? '',
      description: asString(record.description),
      mimeType: asString(record.mimeType),
      size: asNumber(record.size),
      documentType: asString(record.documentType),
      institution: asString(record.institution),
      documentDate: asString(record.documentDate),
      pageCount: asNumber(record.pageCount),
      classification: record.classification as never,
      status: record.status as never,
    })

    return projected && projected.title ? [projected as PublicEvidenceCard] : []
  })

  return {
    id: doc.id as string | number,
    slug: docSlug,
    title,
    summary: asString(doc.summary),
    publishedAt: asString(asRecord(doc.publication as never)?.publishedAt),
    updatedAt:
      asString(asRecord(doc.publication as never)?.modifiedAt) ?? asString(doc.updatedAt),
    authors: (Array.isArray(doc.authors) ? doc.authors : [])
      .map(toAuthor)
      .filter((author): author is InvestigationAuthor => author !== null),
    hero: {
      image: toImageRef(hero?.image as never),
      caption: asString(hero?.captionOverride) ?? asString(heroRecord?.caption),
      credit: asString(heroRecord?.credit),
    },
    keyFindings: array(doc.keyFindings).flatMap((finding) => {
      const headline = asString(finding.headline)

      return headline
        ? [
            {
              headline,
              description: asString(finding.description),
              sourceReference: asString(finding.sourceReference),
            },
          ]
        : []
    }),
    chapters,
    timeline: array(doc.timeline).flatMap((event) => {
      const date = asString(event.date)
      const eventTitle = asString(event.title)

      return date && eventTitle
        ? [{ date, title: eventTitle, description: asString(event.description) }]
        : []
    }),
    entities: [
      ...(Array.isArray(doc.people) ? doc.people : []).map((person) => toEntity(person, 'person')),
      ...(Array.isArray(doc.organizations) ? doc.organizations : []).map((org) =>
        toEntity(org, 'organization'),
      ),
    ].filter((entity): entity is Entity => entity !== null),
    methodology: asString(doc.methodology),
    evidence,
    wordCount: chapters.reduce((total, chapter) => total + countWords(chapter.body), 0) || null,
  }
}
