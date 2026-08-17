import { expect, test } from '@playwright/test'

/**
 * F0 smoke test.
 *
 * Proves the harness runs and the stack answers. The real critical flows are
 * fixed by PRD Nº8 §186-§188 and CLAUDE.md §82 and arrive with the pages they
 * exercise — there is nothing to click through yet.
 *
 * Requires a running server: `pnpm services:up && pnpm dev`.
 */
test.describe('F0 baseline', () => {
  test('frontend route group renders', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Clasificados Colombia')
  })

  test('liveness responds without touching the database', async ({ request }) => {
    const response = await request.get('/api/health/live')

    expect(response.status()).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ status: 'ok', check: 'liveness' })
  })

  test('readiness reports database reachability', async ({ request }) => {
    const response = await request.get('/api/health/ready')

    expect(response.status()).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      status: 'ok',
      dependencies: { database: 'ok' },
    })
  })

  test('payload admin is served', async ({ page }) => {
    const response = await page.goto('/admin')

    expect(response?.status()).toBeLessThan(400)
  })

  test('graphql is disabled, not merely undocumented', async ({ request }) => {
    // PRD Nº7 §160-§161: an API that is not needed publicly must be restricted.
    const response = await request.post('/api/graphql', {
      data: { query: '{ __typename }' },
      failOnStatusCode: false,
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)
  })
})
