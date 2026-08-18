import { execFileSync } from 'node:child_process'

import { request as playwrightRequest, type FullConfig } from '@playwright/test'

/**
 * Seeds fixtures and warms the Payload REST route before any test runs.
 *
 * Seeding runs as a single child process. Importing Payload directly into this
 * file does not work: Playwright's module loader conflicts with the CJS/ESM
 * interop of one of Payload's dependencies and fails with "Unexpected module
 * status 3" before any of our code executes.
 *
 * One process, not one per seed file. The previous version spawned two, and one
 * of them silently failed to run — the suite then carried on against a database
 * with no categories and no authors, and five tests reported "seed must exist"
 * as though the fixtures were wrong rather than missing.
 *
 * The seed verifies its own work and exits non-zero if anything is missing, so
 * a failure here aborts the run with one clear sentence instead of five tests
 * reporting "seed must exist". That check lives in the seed rather than here
 * because Playwright runs this file *before* starting its `webServer`, so any
 * HTTP assertion at this point would be answered by whatever server happened to
 * already be listening.
 */

const SEED_SCRIPT = 'src/payload/scripts/seed-users.ts'
const REINDEX_SCRIPT = 'src/search/reindex.ts'

export default async function globalSetup(config: FullConfig): Promise<void> {
  execFileSync(process.execPath, ['node_modules/payload/bin.js', 'run', SEED_SCRIPT], {
    stdio: 'inherit',
    env: process.env,
  })

  /*
   * Rebuild the search index from the freshly seeded database.
   *
   * Not merely convenience. `migrate:fresh` resets the sequence, so a previous
   * run's documents sit in Meilisearch under ids that now belong to different
   * records — search results pointing at content that no longer exists. A
   * reindex here makes the index a function of the database rather than of
   * whatever ran last, and doubles as a smoke test of the command PRD Nº9 §3
   * depends on for disaster recovery.
   *
   * Non-fatal: a suite that cannot run at all because Meilisearch is down would
   * contradict the very property the search tests assert — that the site works
   * without it. The search specs fail loudly on their own if the index is
   * empty.
   */
  try {
    execFileSync(process.execPath, ['node_modules/payload/bin.js', 'run', REINDEX_SCRIPT], {
      stdio: 'inherit',
      env: process.env,
    })
  } catch {
    console.warn('[global-setup] No se pudo reindexar Meilisearch; las pruebas de búsqueda lo reportarán.')
  }

  const baseURL = config.projects[0]?.use?.baseURL
  if (!baseURL) return

  const ctx = await playwrightRequest.newContext({ baseURL, timeout: 180_000 })

  try {
    /*
     * Doubles as the warmup. Payload initialises lazily on its first REST
     * request — pool, schema, collection config — and on this repository's
     * external drive that has exceeded 20 seconds, which surfaced as unrelated
     * tests timing out while the application was healthy.
     */
    await ctx.get('/api/users')
  } catch {
    // Never block the suite: the tests report a broken route better than this.
  } finally {
    await ctx.dispose()
  }
}
