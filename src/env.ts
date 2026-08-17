import {
  parseEnv,
  publicEnvSchema,
  serverEnvSchema,
  type PublicEnv,
  type ServerEnv,
} from './env.schema'

/**
 * Validated environment. Fails at boot rather than at first use.
 *
 * Schemas live in `env.schema.ts` (pure, tested). This module is the only place
 * that touches `process.env`.
 */

/** Safe on both server and browser. */
export const publicEnv: PublicEnv = parseEnv(
  publicEnvSchema,
  { NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL },
  'public',
)

/**
 * Server-only. Importing this from a Client Component throws instead of
 * silently bundling secrets into the browser payload.
 */
export const serverEnv: ServerEnv = (() => {
  if (typeof window !== 'undefined') {
    throw new Error(
      'serverEnv was imported from client-side code. Server secrets must never reach the browser.',
    )
  }

  return parseEnv(serverEnvSchema, process.env, 'server')
})()

export type { PublicEnv, ServerEnv }
