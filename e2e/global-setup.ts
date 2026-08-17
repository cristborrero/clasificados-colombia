import { execFileSync } from 'node:child_process'

/**
 * Seeds the internal accounts the access matrix asserts against.
 *
 * Runs the seed through `node node_modules/payload/bin.js` rather than the pnpm
 * script: the package-manager wrapper swallows this command's output and, in
 * some shells, the execution itself.
 *
 * The seed is idempotent, so re-running costs nothing — and it repairs the
 * database when a destructive assertion (a delete that is *supposed* to be
 * refused, but was not) leaves it short of a user.
 */
const SEEDS = ['src/payload/scripts/seed-users.ts', 'src/payload/scripts/seed-editorial.ts']

export default function globalSetup(): void {
  for (const seed of SEEDS) {
    execFileSync(process.execPath, ['node_modules/payload/bin.js', 'run', seed], {
      stdio: 'inherit',
      env: process.env,
    })
  }
}
