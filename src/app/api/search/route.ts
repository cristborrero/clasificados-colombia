import { NextResponse, type NextRequest } from 'next/server'

import { runSearch } from '@/data/search'
import { AUTOCOMPLETE_MIN_CHARS, normaliseQuery } from '@/search/query'

/**
 * Search endpoint (PRD Nº9 §37-§41).
 *
 * The controlled layer between the browser and Meilisearch. The master key
 * never leaves the server, the query is normalised and length-capped before it
 * travels, and the response is the shaped result rather than a raw Meilisearch
 * payload — which would otherwise leak the index's field names and internal
 * scoring to anyone with the developer tools open.
 *
 * Used by the autocomplete dialog. The full search page renders server-side and
 * calls `runSearch` directly, so a reader arriving from a link never waits for
 * a second round trip.
 */
export const dynamic = 'force-dynamic'

/**
 * A crude per-process rate limit (§39).
 *
 * Deliberately simple and deliberately not distributed. It exists to stop one
 * client hammering the endpoint, not to be a security control — a real limiter
 * belongs at the reverse proxy (F19), where it can see every instance. What
 * this prevents is a single tab with a broken debounce turning into a thousand
 * Meilisearch queries a minute.
 *
 * The map is bounded, so it cannot grow into a memory leak under a spray of
 * distinct addresses.
 */
const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 60
const MAX_TRACKED_CLIENTS = 5_000

const hits = new Map<string, { count: number; resetAt: number }>()

function rateLimited(key: string, now: number): boolean {
  const entry = hits.get(key)

  if (!entry || entry.resetAt <= now) {
    if (hits.size >= MAX_TRACKED_CLIENTS) hits.clear()

    hits.set(key, { count: 1, resetAt: now + WINDOW_MS })

    return false
  }

  entry.count += 1

  return entry.count > MAX_REQUESTS_PER_WINDOW
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const now = Date.now()

  /*
   * `x-forwarded-for` is only trustworthy behind our own proxy, which F19
   * configures. Until then it is a best-effort bucket key, which is all a
   * politeness limiter needs.
   */
  const client = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (rateLimited(client, now)) {
    return NextResponse.json(
      { error: 'Demasiadas consultas. Intenta de nuevo en un momento.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  const params = Object.fromEntries(request.nextUrl.searchParams.entries())
  const query = normaliseQuery(params.q)

  // §42 and §59: no query, and no query below the autocomplete threshold,
  // reaches the index.
  if (query.length < AUTOCOMPLETE_MIN_CHARS) {
    return NextResponse.json(
      { query, results: [], total: 0, unavailable: false },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const outcome = await runSearch(params)

  return NextResponse.json(outcome, {
    headers: {
      // A reader's query is not something to cache in a shared layer, and the
      // index moves under it anyway.
      'Cache-Control': 'no-store',
      // Search responses are not for other origins.
      'X-Robots-Tag': 'noindex',
    },
  })
}
