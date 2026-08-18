/*
 * `server-only` lives here rather than in `src/search/client.ts`. This module
 * is imported only by Server Components and the route handler, so the marker
 * resolves through Next and does its job: a Client Component that pulls in the
 * search stack fails at build time instead of shipping a bundle that quietly
 * cannot work. The adapter itself has to stay unmarked because the reindex CLI
 * runs under plain Node.
 */
import 'server-only'

import {
  INDEXES,
  isSearchConfigured,
  search as meiliSearch,
  SearchUnavailableError,
} from '@/search/client'
import {
  parseSearchParams,
  RESULTS_PER_PAGE,
  splitHighlights,
  stripHighlights,
  type HighlightSegment,
} from '@/search/query'

/**
 * Search reads (PRD Nº9 §37-§39, §44-§47).
 *
 * §39 puts a Next endpoint between the browser and Meilisearch rather than
 * letting the browser query it directly. The benefits the PRD lists are real —
 * rate limiting, hiding infrastructure, normalising the query, shaping the
 * response — but the one that decides it is that a browser-side client needs a
 * key, and the only safe key is a scoped search key that then has to be
 * provisioned, rotated and kept out of the bundle. Not exposing the service at
 * all is fewer moving parts than exposing it carefully.
 *
 * A failure here degrades rather than throws. PRD Nº9 §87 is about publishing
 * surviving a Meilisearch outage; the reader's side of that is a search page
 * that says search is unavailable, not a 500.
 */
export type SearchResultItem = {
  id: string
  url: string
  title: HighlightSegment[]
  plainTitle: string
  dek: string | null
  snippet: HighlightSegment[] | null
  collection: string
  contentType: string
  category: { name: string; slug: string } | null
  publishedAt: string | null
  heroImage: string | null
}

export type SearchOutcome = {
  query: string
  results: SearchResultItem[]
  total: number
  page: number
  totalPages: number
  /** True when Meilisearch could not be reached, as opposed to zero results. */
  unavailable: boolean
}

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null

function toResult(hit: Record<string, unknown>): SearchResultItem | null {
  const url = asString(hit.url)
  const plainTitle = asString(hit.title)

  if (!url || !plainTitle) return null

  const formatted = (hit._formatted ?? {}) as Record<string, unknown>

  const category = hit.category as Record<string, unknown> | undefined
  const categoryName = asString(category?.name)
  const categorySlug = asString(category?.slug)

  const publishedAt =
    typeof hit.publishedAt === 'number' && hit.publishedAt > 0
      ? new Date(hit.publishedAt).toISOString()
      : null

  /*
   * §47: a body snippet is shown only when it adds something. If the crop came
   * back with no match in it, the dek is the better summary — the snippet would
   * be an arbitrary opening sentence pretending to be a reason.
   */
  const rawSnippet = asString(formatted.bodyText)
  const snippet = rawSnippet && rawSnippet.includes('[[hl]]') ? splitHighlights(rawSnippet) : null

  return {
    id: asString(hit.id) ?? url,
    url,
    title: splitHighlights(asString(formatted.title) ?? plainTitle),
    plainTitle: stripHighlights(plainTitle),
    dek: asString(hit.dek),
    snippet,
    collection: asString(hit.collection) ?? 'articles',
    contentType: asString(hit.contentType) ?? 'article',
    category: categoryName && categorySlug ? { name: categoryName, slug: categorySlug } : null,
    publishedAt,
    heroImage: asString(hit.heroImage),
  }
}

export async function runSearch(
  params: Record<string, string | string[] | undefined>,
): Promise<SearchOutcome> {
  const parsed = parseSearchParams(params)

  const empty: SearchOutcome = {
    query: parsed.q,
    results: [],
    total: 0,
    page: parsed.page,
    totalPages: 0,
    unavailable: false,
  }

  // §42: an empty query is not a query for everything.
  if (!parsed.q || !isSearchConfigured()) {
    return { ...empty, unavailable: Boolean(parsed.q) && !isSearchConfigured() }
  }

  try {
    const response = await meiliSearch(INDEXES.editorial, {
      q: parsed.q,
      limit: RESULTS_PER_PAGE,
      offset: parsed.offset,
      filter: parsed.filter,
      attributesToHighlight: ['title'],
      attributesToCrop: ['bodyText'],
      cropLength: 30,
    })

    return {
      query: parsed.q,
      results: response.hits
        .map((hit) => toResult(hit as Record<string, unknown>))
        .filter((result): result is SearchResultItem => result !== null),
      total: response.estimatedTotalHits,
      page: parsed.page,
      totalPages: Math.ceil(response.estimatedTotalHits / RESULTS_PER_PAGE),
      unavailable: false,
    }
  } catch (error) {
    if (error instanceof SearchUnavailableError) return { ...empty, unavailable: true }

    throw error
  }
}
