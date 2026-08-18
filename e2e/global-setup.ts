import { execFileSync } from 'node:child_process'

import { request as playwrightRequest, type FullConfig } from '@playwright/test'

const SEEDS = ['src/payload/scripts/seed-users.ts', 'src/payload/scripts/seed-editorial.ts']

/**
 * Seeds fixtures and warms the Payload REST route before any test runs.
 *
 * The seeds are idempotent, so re-running costs nothing — and they repair the
 * database when a destructive assertion (a delete that is *supposed* to be
 * refused, but was not) leaves it short of a user.
 *
 * They run through `node node_modules/payload/bin.js` rather than the pnpm
 * script: the package-manager wrapper swallows this command's output and, in
 * some shells, the execution itself.
 *
 * The warmup exists because Payload initialises lazily on its first REST
 * request — database pool, schema, collection config. On this repository's
 * external drive that first call has exceeded 20 seconds, which surfaced as
 * three unrelated tests "failing" on timeouts while the application was
 * perfectly healthy. Paying that cost once here, with a generous budget, keeps
 * per-test timeouts meaningful: a test that times out now indicates a real
 * problem rather than a cold process.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  for (const seed of SEEDS) {
    execFileSync(process.execPath, ['node_modules/payload/bin.js', 'run', seed], {
      stdio: 'inherit',
      env: process.env,
    })
  }

  const baseURL = config.projects[0]?.use?.baseURL

  if (!baseURL) return

  const ctx = await playwrightRequest.newContext({ baseURL, timeout: 180_000 })

  try {
    // Any authenticated-or-not hit on the Payload router does the work; a 403
    // is a perfectly good sign that the stack is up and answering.
    await ctx.get('/api/users')
  } catch {
    // Never block the suite. If the route is genuinely broken the tests will
    // say so, with a better message than this would.
  } finally {
    await ctx.dispose()
  }
}
