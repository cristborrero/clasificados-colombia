import { readinessHandler } from '../readiness'

/** Readiness probe. Implementation and rationale live in `../readiness.ts`. */
export const dynamic = 'force-dynamic'

export const GET = readinessHandler
