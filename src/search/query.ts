/**
 * Query handling (PRD Nº9 §40-§42, §46, §49-§53, §56).
 *
 * Pure. Everything a search request needs decided before it touches
 * Meilisearch: normalisation, filters, pagination, and the safe handling of
 * highlighted text.
 */

/** PRD Nº9 §41. */
export const MAX_QUERY_LENGTH = 200

/** PRD Nº9 §56. */
export const RESULTS_PER_PAGE = 20

/** PRD Nº9 §61. */
export const AUTOCOMPLETE_LIMIT = 8

/**
 * Normalises a query without altering intent (§40).
 *
 * Trim, collapse whitespace, cap length. Deliberately *not* lowercasing,
 * stripping accents or removing punctuation: Meilisearch already handles case
 * and accents (§28), and doing it here as well would mean two layers disagreeing
 * about what "the same query" is. Quotation marks are left intact because a
 * reader who types them means them.
 */
export function normaliseQuery(raw: string | null | undefined): string {
  if (!raw) return ''

  return raw.replace(/\s+/g, ' ').trim().slice(0, MAX_QUERY_LENGTH)
}

/** §42: an empty query must never be sent to fetch the whole index. */
export const isSearchableQuery = (query: string): boolean => query.length > 0

/** §59: autocomplete starts after two or three characters. */
export const AUTOCOMPLETE_MIN_CHARS = 3

export const isAutocompletableQuery = (query: string): boolean =>
  query.length >= AUTOCOMPLETE_MIN_CHARS

/* ── Filters (§49-§51) ─────────────────────────────────────────────────────*/

export const CONTENT_FILTERS = [
  { value: 'all', label: 'Todo' },
  { value: 'news', label: 'Noticias' },
  { value: 'investigation', label: 'Investigaciones' },
  { value: 'analysis', label: 'Análisis' },
  { value: 'opinion', label: 'Opinión' },
  { value: 'video', label: 'Videos' },
  { value: 'data', label: 'Datos' },
] as const

export type ContentFilter = (typeof CONTENT_FILTERS)[number]['value']

export const isContentFilter = (value: unknown): value is ContentFilter =>
  typeof value === 'string' && CONTENT_FILTERS.some((filter) => filter.value === value)

/**
 * Maps a reader-facing filter onto an index filter.
 *
 * "Noticias" and "Análisis" are both articles, separated by `contentType`;
 * everything else is its own collection. Expressing that here rather than in
 * the UI keeps the URL vocabulary (`?type=investigation`) stable even if the
 * content model moves underneath it.
 */
export function contentFilterExpression(filter: ContentFilter): string[] {
  switch (filter) {
    case 'news':
      return ['collection = articles', 'contentType != analysis']
    case 'analysis':
      return ['contentType = analysis']
    case 'investigation':
      return ['collection = investigations']
    case 'opinion':
      return ['collection = opinions']
    case 'video':
      return ['collection = video-stories']
    case 'data':
      return ['collection = data-stories']
    case 'all':
    default:
      return []
  }
}

export const DATE_FILTERS = [
  { value: 'any', label: 'Cualquier fecha', days: null },
  { value: 'day', label: 'Últimas 24 horas', days: 1 },
  { value: 'week', label: 'Última semana', days: 7 },
  { value: 'month', label: 'Último mes', days: 30 },
  { value: 'year', label: 'Último año', days: 365 },
] as const

export type DateFilter = (typeof DATE_FILTERS)[number]['value']

export const isDateFilter = (value: unknown): value is DateFilter =>
  typeof value === 'string' && DATE_FILTERS.some((filter) => filter.value === value)

export function dateFilterExpression(filter: DateFilter, now: Date): string[] {
  const days = DATE_FILTERS.find((option) => option.value === filter)?.days

  if (!days) return []

  return [`publishedAt >= ${now.getTime() - days * 86_400_000}`]
}

/**
 * A category slug, sanitised for use inside a filter expression.
 *
 * Meilisearch filters are a small expression language, and a slug carrying a
 * quote or an `OR` would be parsed as syntax. Slugs are `[a-z0-9-]` by
 * construction, so anything else is rejected outright rather than escaped —
 * there is no legitimate slug this refuses.
 */
export function categoryFilterExpression(slug: string | null | undefined): string[] {
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return []

  return [`category.slug = ${slug}`]
}

export type SearchParams = {
  q: string
  type: ContentFilter
  date: DateFilter
  category: string | null
  page: number
}

/** Reads and validates the URL state (§53). Anything unrecognised falls back. */
export function parseSearchParams(
  params: Record<string, string | string[] | undefined>,
  { now = new Date() }: { now?: Date } = {},
): SearchParams & { filter: string[]; offset: number } {
  const single = (value: string | string[] | undefined): string | undefined =>
    Array.isArray(value) ? value[0] : value

  const q = normaliseQuery(single(params.q))
  const type = isContentFilter(single(params.type)) ? (single(params.type) as ContentFilter) : 'all'
  const date = isDateFilter(single(params.date)) ? (single(params.date) as DateFilter) : 'any'

  const rawCategory = single(params.category)
  const category = rawCategory && /^[a-z0-9-]+$/.test(rawCategory) ? rawCategory : null

  const parsedPage = Number.parseInt(single(params.page) ?? '1', 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 50) : 1

  return {
    q,
    type,
    date,
    category,
    page,
    filter: [
      ...contentFilterExpression(type),
      ...dateFilterExpression(date, now),
      ...categoryFilterExpression(category),
    ],
    offset: (page - 1) * RESULTS_PER_PAGE,
  }
}

/* ── Highlights (§46, §47) ─────────────────────────────────────────────────*/

export const HIGHLIGHT_OPEN = '[[hl]]'
export const HIGHLIGHT_CLOSE = '[[/hl]]'

export type HighlightSegment = { text: string; match: boolean }

/**
 * Splits highlighted text into plain segments.
 *
 * §46 allows highlighting and forbids unsafe HTML. This is how both hold: what
 * crosses the boundary is text with two sentinel markers, and the UI turns the
 * segments into real elements. Nothing is ever handed to
 * `dangerouslySetInnerHTML`, so a headline containing `<script>` renders as the
 * characters an editor typed.
 */
export function splitHighlights(text: string | null | undefined): HighlightSegment[] {
  if (!text) return []

  const segments: HighlightSegment[] = []
  let rest = text

  while (rest.length > 0) {
    const open = rest.indexOf(HIGHLIGHT_OPEN)

    if (open === -1) {
      segments.push({ text: rest, match: false })
      break
    }

    if (open > 0) segments.push({ text: rest.slice(0, open), match: false })

    const afterOpen = rest.slice(open + HIGHLIGHT_OPEN.length)
    const close = afterOpen.indexOf(HIGHLIGHT_CLOSE)

    if (close === -1) {
      // An unterminated marker means the crop cut through it. Render the rest
      // as plain text rather than as a highlight that never ends.
      segments.push({ text: afterOpen, match: false })
      break
    }

    segments.push({ text: afterOpen.slice(0, close), match: true })
    rest = afterOpen.slice(close + HIGHLIGHT_CLOSE.length)
  }

  return segments.filter((segment) => segment.text.length > 0)
}

/** Strips the markers entirely, for places that cannot carry elements. */
export const stripHighlights = (text: string | null | undefined): string =>
  (text ?? '').split(HIGHLIGHT_OPEN).join('').split(HIGHLIGHT_CLOSE).join('')
