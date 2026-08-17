import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

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
 * F0 ships only the smoke test that proves the harness runs.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Mobile is a first-class target, not an afterthought (PRD Master §44).
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],
})
