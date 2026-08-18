import config from '@payload-config'
import { getPayload } from 'payload'

import { seedAll, verifySeed } from './seed'

/**
 * CLI seed: `pnpm payload run src/payload/scripts/seed-users.ts`.
 *
 * Verifies its own work and exits non-zero if anything is missing, so a caller
 * that only sees the exit code — the E2E global setup, for instance — cannot
 * proceed against a half-seeded database.
 */
const payload = await getPayload({ config })

await seedAll(payload)
await verifySeed(payload)

payload.logger.info('Seed de desarrollo completado y verificado.')
