import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

/**
 * Shared readiness probe — "can this instance serve traffic?" (PRD Nº4 §70-§71)
 *
 * Lives outside the route files because Next requires route segment config such
 * as `dynamic` to be statically analysable in each `route.ts`; re-exporting a
 * handler together with its config from one route to another is rejected at
 * build time. Both `/api/health` and `/api/health/ready` import this and declare
 * their own config.
 *
 * Checks Postgres reachability only. Coolify uses readiness for routing and
 * rolling updates (§69, §72), so it must reflect the ability to serve editorial
 * content — nothing more.
 *
 * Explicitly NOT checked: Meilisearch. PRD Nº9 §118 requires separating app
 * readiness from search dependency health — a search outage must not take the
 * publication down (§117). Search health is surfaced separately in F18.
 */
export async function readinessHandler(): Promise<NextResponse> {
  try {
    const payload = await getPayload({ config })

    /*
     * overrideAccess is intentional and narrow: an unauthenticated probe must
     * verify DB connectivity without holding a session. Permitted by PRD Nº5
     * §74 as a controlled server operation; no document data reaches the
     * response. The query is bounded per §70 — no expensive work per request.
     */
    await payload.find({
      collection: 'users',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    return NextResponse.json(
      { status: 'ok', check: 'readiness', dependencies: { database: 'ok' } },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    /*
     * The error is not echoed to the client: PRD Nº5 §87 forbids returning
     * stack traces. Detail belongs in server logs.
     */
    return NextResponse.json(
      { status: 'error', check: 'readiness', dependencies: { database: 'unreachable' } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
