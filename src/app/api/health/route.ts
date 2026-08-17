import { readinessHandler } from './readiness'

/**
 * `/api/health` — the endpoint PRD Nº4 §70 asks for by name.
 *
 * Resolves conflict C-07 (PRD Nº4 §70 asks for one endpoint, CLAUDE.md §60 asks
 * for live + ready): all three exist, and this one mirrors readiness, since
 * "app alive + db reachable" is what §70 specifies.
 */
export const dynamic = 'force-dynamic'

export const GET = readinessHandler
