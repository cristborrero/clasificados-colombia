/**
 * Search document transformation (PRD Nº9 §9-§11, §18).
 *
 * Pure. No Payload import, no network. Given a document, it answers what should
 * go into the index — and, just as importantly, what should not.
 *
 * PRD Nº9 §10 forbids sending the raw Payload document. That is not a tidiness
 * rule: a Payload article carries workflow state, review notes, internal
 * relations and the identities of sources, and Meilisearch is a separate
 * process with its own key, its own port and no access control of its own.
 * Anything that reaches it is one misconfiguration away from being public.
 *
 * So the shape below is an allowlist. A field that is not named here cannot
 * reach the index, whatever gets added to the collection later.
 */

export type SearchAuthor = { id: string; name: string; slug: string }

export type EditorialSearchDocument = {
  id: string
  title: string
  dek?: string
  bodyText: string
  slug: string
  url: string
  collection: string
  contentType: string
  category?: { id: string; name: string; slug: string }
  topics: string[]
  topicSlugs: string[]
  authors: SearchAuthor[]
  people: string[]
  organizations: string[]
  publishedAt: number
  heroImage?: string
  featured: boolean
  breaking: boolean
  searchPriority: number
}

/* ── Indexability ──────────────────────────────────────────────────────────*/

export type IndexableInput = {
  _status?: string | null
  editorialStatus?: string | null
  /** Evidence and media classification. Anything but `public` is excluded. */
  classification?: string | null
  slug?: string | null
  title?: string | null
}

/**
 * Whether a document may enter the index at all (PRD Nº9 §4, §42).
 *
 * §4 lists what must never be indexed: drafts, previews, internal or restricted
 * material, audit records, internal users, denuncias, contact data and review
 * notes. This function is the single gate for the first several of those; the
 * rest are excluded by never being handed to the indexer in the first place.
 *
 * Deny by default: anything whose status cannot be read as `published` is out.
 * A missing `_status` is treated as not published, because the alternative —
 * assuming a document with no status is fine — is how a draft investigation
 * becomes searchable.
 */
export function isIndexable(doc: IndexableInput): boolean {
  if (doc._status !== 'published') return false
  if (doc.editorialStatus && doc.editorialStatus !== 'published') return false
  if (doc.classification && doc.classification !== 'public') return false

  // Without a slug there is no URL, so a result would be unreachable.
  return Boolean(doc.slug && doc.title)
}

/* ── Body text ─────────────────────────────────────────────────────────────*/

/** Blocks whose text is navigational or decorative rather than reporting. */
const NON_PROSE_BLOCKS = new Set(['embed', 'gallery', 'correctionNotice'])

/** Block fields that carry real, searchable reporting. */
const PROSE_BLOCK_FIELDS = ['text', 'body', 'title', 'captionOverride', 'attribution'] as const

/**
 * Flattens a Lexical body into indexable text (PRD Nº9 §11).
 *
 * Keeps paragraphs, headings, useful captions, names and factual content.
 * Drops HTML, decorative components, technical URLs and internal metadata.
 *
 * Blocks are handled selectively rather than uniformly. A pull quote and a fact
 * box contain reporting a reader might search for; an embed contains a URL and
 * a provider name, and a correction notice contains the words "corrección" and
 * a date. Indexing the latter two means a search for "corrección" returns every
 * article that ever had one, ranked by an accident of vocabulary.
 */
export function toBodyText(node: unknown, depth = 0): string {
  // Guards against a cyclic or pathological tree taking the indexer down.
  if (!node || typeof node !== 'object' || depth > 50) return ''

  const record = node as Record<string, unknown>

  if (record.type === 'block') {
    const fields = record.fields as Record<string, unknown> | undefined
    const blockType = typeof fields?.blockType === 'string' ? fields.blockType : ''

    if (!fields || NON_PROSE_BLOCKS.has(blockType)) return ''

    const parts = PROSE_BLOCK_FIELDS.map((field) =>
      typeof fields[field] === 'string' ? (fields[field] as string) : '',
    )

    // Fact box items are label/value pairs of exactly the kind people search
    // for — a name, a figure, an institution.
    if (Array.isArray(fields.items)) {
      for (const raw of fields.items) {
        const item = raw as Record<string, unknown> | null
        if (!item) continue

        for (const key of ['label', 'value', 'description']) {
          if (typeof item[key] === 'string') parts.push(item[key] as string)
        }
      }
    }

    return parts.filter(Boolean).join(' ')
  }

  const own = typeof record.text === 'string' ? record.text : ''

  const children = Array.isArray(record.children)
    ? record.children.map((child) => toBodyText(child, depth + 1))
    : []

  const root = record.root ? toBodyText(record.root, depth + 1) : ''

  return [own, ...children, root].filter(Boolean).join(' ')
}

/** Collapses whitespace and caps the length sent to the index. */
export const MAX_BODY_TEXT_CHARS = 40_000

export function normaliseBodyText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, MAX_BODY_TEXT_CHARS)
}

/* ── Search priority ───────────────────────────────────────────────────────*/

export const SEARCH_PRIORITY = {
  standard: 0,
  featured: 10,
  majorAnalysis: 20,
  investigation: 30,
  activeBreaking: 40,
} as const

export type PriorityInput = {
  collection: string
  contentType?: string | null
  featured?: boolean | null
  /** True only while the breaking bar is actually pointing at this piece. */
  breaking?: boolean | null
}

/**
 * Derives `searchPriority` (PRD Nº9 §18-§20).
 *
 * §18 is explicit that a journalist must not be able to type an arbitrary
 * number here — otherwise the field becomes a competition, and the ranking
 * stops describing the newsroom's judgement and starts describing who is most
 * willing to inflate it.
 *
 * The breaking boost is derived from live state rather than stored (§19), so it
 * disappears on its own when the story stops being breaking. A stored boost is
 * one nobody remembers to remove.
 */
export function deriveSearchPriority(input: PriorityInput): number {
  if (input.breaking) return SEARCH_PRIORITY.activeBreaking
  if (input.collection === 'investigations') return SEARCH_PRIORITY.investigation
  if (input.contentType === 'analysis') return SEARCH_PRIORITY.majorAnalysis
  if (input.featured) return SEARCH_PRIORITY.featured

  return SEARCH_PRIORITY.standard
}

/* ── URLs ──────────────────────────────────────────────────────────────────*/

const URL_PREFIX: Record<string, string> = {
  articles: '',
  investigations: '/investigacion',
  opinions: '/opinion',
  'data-stories': '/datos',
  'video-stories': '/video',
}

export function searchUrl(collection: string, slug: string): string {
  const prefix = URL_PREFIX[collection] ?? ''

  return `${prefix}/${slug}`
}

/**
 * A stable, collision-free document id across collections.
 *
 * The separator is an underscore, not a colon, and that is not cosmetic:
 * Meilisearch only accepts ids made of letters, digits, hyphens and
 * underscores. A colon is rejected — and rejected *asynchronously*, as a failed
 * task, so the write returns 202 and nothing appears in the index. This was
 * exactly that bug: eleven documents "indexed", an empty index, and no error
 * anywhere until the task queue was inspected by hand.
 */
export const searchDocumentId = (collection: string, id: string | number): string =>
  `${collection}_${id}`
