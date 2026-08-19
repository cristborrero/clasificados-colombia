import type { Payload } from 'payload'

/**
 * Who is using an image (PRD Nº10 §49-§51, F15 DoD).
 *
 * An asset referenced by content must not be hard-deletable. Finding out who
 * refers to it takes two different searches, because Payload stores the two
 * kinds of reference in two different places:
 *
 * - A `hero`, a `portrait`, a `poster` is a column on the document's own table,
 *   so it is a normal query.
 * - An image dropped into an article body lives inside the Lexical `jsonb` and
 *   gets no relationship row at all — `articles_rels` has no `media_id` column.
 *   A guard that only checked the columns would report an image as unused and
 *   let an administrator delete something a published article is displaying.
 *
 * So the bodies are walked. That means loading them, which is why this runs on
 * deletion — a rare, deliberate operation — and nowhere else.
 */

export type MediaReference = {
  collection: string
  id: number | string
  label: string
  /** Payload's own draft/published flag, when the collection has versions. */
  status?: string
}

/**
 * Every media id referenced anywhere inside a Lexical document.
 *
 * Deliberately structural rather than schema-aware: it looks for the shape
 * Payload writes (`relationTo: 'media'` next to a `value`) at any depth, so a
 * new block type carrying an image is covered the day it is added instead of
 * the day someone remembers to update a list.
 */
export function collectMediaIds(node: unknown): Set<number | string> {
  const found = new Set<number | string>()

  const walk = (current: unknown): void => {
    if (Array.isArray(current)) {
      for (const item of current) walk(item)
      return
    }

    if (current === null || typeof current !== 'object') return

    const record = current as Record<string, unknown>

    if (record.relationTo === 'media' && record.value !== undefined) {
      const value = record.value
      const id =
        typeof value === 'object' && value !== null
          ? (value as { id?: number | string }).id
          : (value as number | string)

      if (id !== undefined && id !== null) found.add(id)
    }

    for (const value of Object.values(record)) walk(value)
  }

  walk(node)

  return found
}

/** Collections that hold a rich text body worth walking. */
const RICH_TEXT_SOURCES: { collection: string; fields: string[] }[] = [
  { collection: 'articles', fields: ['body'] },
  { collection: 'investigations', fields: ['chapters', 'methodology'] },
  { collection: 'opinions', fields: ['body'] },
  { collection: 'data-stories', fields: ['body'] },
  { collection: 'video-stories', fields: ['body'] },
]

/**
 * Direct upload/relationship fields pointing at `media`, taken from the running
 * config rather than from a list kept by hand — a hardcoded list is wrong the
 * first time a collection grows an image field.
 *
 * Nesting is walked, and that is not a refinement: the lead image of an article
 * is `hero.image`, inside a group. A scan of top-level fields alone finds no
 * reference to the single most-used image on the site.
 */
export function mediaFieldPaths(fields: unknown[], prefix = ''): string[] {
  const paths: string[] = []

  for (const entry of fields) {
    if (entry === null || typeof entry !== 'object') continue

    const field = entry as {
      name?: string
      type?: string
      relationTo?: string | string[]
      fields?: unknown[]
      tabs?: { name?: string; fields?: unknown[] }[]
    }

    const points =
      field.relationTo === 'media' ||
      (Array.isArray(field.relationTo) && field.relationTo.includes('media'))

    if (points && typeof field.name === 'string') {
      paths.push(prefix + field.name)
      continue
    }

    /*
     * `row` and `collapsible` group fields visually without adding a level to
     * the data, so their children keep the current prefix. `array` and `blocks`
     * do add one, but a query cannot address a specific element — those are
     * reached through the body walk instead.
     */
    if (field.type === 'group' && typeof field.name === 'string' && field.fields) {
      paths.push(...mediaFieldPaths(field.fields, `${prefix}${field.name}.`))
    } else if ((field.type === 'row' || field.type === 'collapsible') && field.fields) {
      paths.push(...mediaFieldPaths(field.fields, prefix))
    } else if (field.type === 'tabs' && field.tabs) {
      for (const tab of field.tabs) {
        const nested = tab.name ? `${prefix}${tab.name}.` : prefix
        paths.push(...mediaFieldPaths(tab.fields ?? [], nested))
      }
    }
  }

  return paths
}

function directReferenceFields(payload: Payload): { collection: string; field: string }[] {
  const found: { collection: string; field: string }[] = []

  for (const collection of payload.config.collections) {
    /*
     * Payload's own bookkeeping collections are skipped. `payload-locked-
     * documents` holds a polymorphic relationship across every collection,
     * media included, so it matches the scan — and querying it by media id is
     * not a valid query, which surfaced as a 500 on an ordinary delete. It is
     * also not a reference in the sense that matters: an edit lock is not
     * something a reader can see break.
     */
    if (collection.slug.startsWith('payload-')) continue

    for (const field of mediaFieldPaths(collection.fields)) {
      found.push({ collection: collection.slug, field })
    }
  }

  return found
}

function labelOf(doc: Record<string, unknown>): string {
  for (const key of ['title', 'name', 'alt', 'slug']) {
    const value = doc[key]
    if (typeof value === 'string' && value.trim() !== '') return value
  }

  return String(doc.id ?? 'sin título')
}

/**
 * Everything that would break if this asset disappeared.
 *
 * Returns as soon as it has the full picture rather than the first hit: an
 * administrator deciding whether to delete needs to know what they would be
 * breaking, not merely that they cannot.
 */
export async function findMediaReferences(
  payload: Payload,
  mediaId: number | string,
): Promise<MediaReference[]> {
  const references: MediaReference[] = []

  for (const { collection, field } of directReferenceFields(payload)) {
    const result = await payload.find({
      collection: collection as never,
      where: { [field]: { equals: mediaId } },
      depth: 0,
      limit: 50,
      pagination: false,
      overrideAccess: true,
    })

    for (const doc of result.docs) {
      const record = doc as Record<string, unknown>

      references.push({
        collection,
        id: record.id as number | string,
        label: labelOf(record),
        status: typeof record._status === 'string' ? record._status : undefined,
      })
    }
  }

  for (const { collection, fields } of RICH_TEXT_SOURCES) {
    const known = payload.config.collections.some((c) => c.slug === collection)
    if (!known) continue

    const result = await payload.find({
      collection: collection as never,
      depth: 0,
      limit: 0,
      pagination: false,
      overrideAccess: true,
      select: Object.fromEntries([...fields.map((f) => [f, true]), ['_status', true]]) as never,
    })

    for (const doc of result.docs) {
      const record = doc as Record<string, unknown>
      const used = fields.some((field) => collectMediaIds(record[field]).has(mediaId))

      if (!used) continue

      const already = references.some(
        (reference) => reference.collection === collection && reference.id === record.id,
      )

      if (!already) {
        references.push({
          collection,
          id: record.id as number | string,
          label: labelOf(record),
          status: typeof record._status === 'string' ? record._status : undefined,
        })
      }
    }
  }

  return references
}
