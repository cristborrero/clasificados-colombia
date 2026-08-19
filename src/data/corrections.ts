import { getPayloadClient } from '@/lib/payload/client'

/**
 * Corrections attached to a published piece (F17).
 *
 * A projection, like everything else the browser receives: the collection has
 * no internal fields today, and building the public shape here anyway means it
 * can grow one without that field reaching a reader by default (PRD Nº7 §72).
 */

export type CorrectionType = 'correction' | 'clarification' | 'update' | 'editor_note'

export type PublicCorrection = {
  id: string | number
  type: CorrectionType
  summary: string
  issuedAt: string | null
}

const TYPES: readonly CorrectionType[] = ['correction', 'clarification', 'update', 'editor_note']

function toType(value: unknown): CorrectionType {
  return TYPES.includes(value as CorrectionType) ? (value as CorrectionType) : 'correction'
}

/**
 * Ordered oldest first.
 *
 * A correction log reads as a sequence of events: what was fixed, then what was
 * fixed after that. Newest-first is right for an index of unrelated items and
 * wrong for the history of one piece.
 */
export async function getCorrectionsFor(
  collection: string,
  id: string | number,
): Promise<PublicCorrection[]> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'corrections',
    where: {
      and: [
        { 'about.relationTo': { equals: collection } },
        { 'about.value': { equals: id } },
      ],
    },
    sort: 'issuedAt',
    depth: 0,
    limit: 50,
    pagination: false,
  })

  return result.docs.map((doc) => ({
    id: doc.id,
    type: toType(doc.type),
    summary: doc.summary,
    issuedAt: doc.issuedAt ?? null,
  }))
}
