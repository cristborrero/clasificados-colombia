import { defineConfig, devices } from '@playwright/test'

/*
 * Port 3100 rather than Next's default 3000, for the same reason the dev
 * services use a 5xxxx block: developer machines routinely already have
 * something on 3000, and a test suite that fights for a port fails in a way
 * that looks like a product bug.
 */
const port = Number(process.env.E2E_PORT ?? 3100)
const baseURL = process.env.NEXT_PUBLIC_SERVER_URL ?? `http://localhost:${port}`

/**
 * E2E configuration.
 *
 * The critical flows this must eventually cover are fixed by the PRDs and are
 * NOT optional (PRD Nº8 §186-§188, CLAUDE.md §82):
 *   homepage → article → author → category → search
 *   authenticated draft → preview → noindex
 *   public evidence → open document
 *   restricted evidence → never reachable from the public frontend
 *
 * Today it ships the smoke suite that proves the stack answers.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',

  /*
   * Generous timeouts on purpose. This repository lives on an external drive
   * and Next itself reports "Slow filesystem detected"; the first compile of a
   * route can take minutes. Tight timeouts here produce failures that read as
   * broken code when the code is fine.
   */
  timeout: 90_000,
  expect: { timeout: 20_000 },

  use: {
    baseURL,
    trace: 'on-first-retry',
    navigationTimeout: 60_000,
    actionTimeout: 20_000,
  },

  /*
   * Playwright owns the server. Previously the suite assumed someone had
   * already run `pnpm dev`, and when they had not, every test failed with a
   * connection error that looked like a regression.
   *
   * `reuseExistingServer` keeps local iteration fast when a dev server is
   * already running, while CI always gets a clean one.
   */
  /*
   * Runs against a production build, not `next dev`.
   *
   * Dev compiles each route on first request. On this repository's external
   * drive that took 177s just to answer /api/health/live from a cold cache,
   * and every subsequent first-hit route blew past the per-test timeout — so
   * the suite failed differently on every run depending on what happened to be
   * warm. A test suite whose result depends on cache state is worse than no
   * suite, because it teaches people to ignore red.
   *
   * A production build is compiled once and then answers in milliseconds, which
   * makes runs deterministic. It also means E2E exercises the artefact that
   * actually ships rather than a development-only variant.
   *
   * Building is NOT folded into this command. On this machine `pnpm build`
   * takes minutes, and burying it here makes the suite look hung and blows any
   * webServer timeout. `pnpm test:e2e` therefore expects a build to exist and
   * only starts the server (~4s); `pnpm test:e2e:full` does both.
   *
   * `reuseExistingServer` keeps local iteration quick: leave `pnpm start`
   * running and the suite attaches to it.
   */
  webServer: {
    command: 'pnpm start',
    url: `${baseURL}/api/health/live`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      PORT: String(port),
      NEXT_PUBLIC_SERVER_URL: baseURL,
    },
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Mobile is a first-class target, not an afterthought (PRD Master §44),
    // and PRD Nº8 §166 lists current iOS Safari as a support target.
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],
})
