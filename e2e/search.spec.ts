import { expect, test } from '@playwright/test'

/**
 * F14 — search.
 *
 * The assertion that carries the most weight is the leak test. Meilisearch has
 * no access control of its own, so anything that reaches the index is public in
 * practice — PRD Nº9 §4 lists what must never get there, and an end-to-end run
 * against a real index is the only place that can actually be checked.
 */
test.describe('F14 search', () => {
  test('the search page is not indexable', async ({ page }) => {
    // PRD Nº9 §54: result pages are infinite, generated on demand and near
    // duplicates. Indexing them spends crawl budget on pages nobody linked to.
    await page.goto('/buscar')

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /follow/)
  })

  test('an empty query asks for one instead of returning the whole index', async ({ page }) => {
    // PRD Nº9 §42.
    await page.goto('/buscar')

    await expect(page.getByText('Escribí qué estás buscando')).toBeVisible()
    await expect(page.locator('main ol li')).toHaveCount(0)
  })

  test('finds published content', async ({ page }) => {
    await page.goto('/buscar?q=contratos')

    await expect(page.getByText(/Resultados para/)).toBeVisible()
    await expect(page.locator('main ol > li').first()).toBeVisible()
  })

  test('highlights the match as text, never as markup', async ({ page }) => {
    // PRD Nº9 §46. The markers cross the boundary as data; the UI builds the
    // elements. A headline containing a tag must render as characters.
    await page.goto('/buscar?q=contratos')

    await expect(page.locator('main mark').first()).toBeVisible()

    const html = await page.content()
    expect(html).not.toContain('[[hl]]')
    expect(html).not.toContain('[[/hl]]')
  })

  test('the search form works without JavaScript state, through the URL', async ({ page }) => {
    await page.goto('/buscar')

    await page.getByLabel('Buscar en Clasificados Colombia').fill('contratos')
    await page.getByRole('button', { name: 'Buscar' }).click()

    await expect(page).toHaveURL(/\/buscar\?q=contratos/)
    await expect(page.getByText(/Resultados para/)).toBeVisible()
  })

  test('filters live in the URL and narrow the results', async ({ page }) => {
    // PRD Nº9 §53: shareable, and the back button works.
    await page.goto('/buscar?q=contratos')

    const unfiltered = await page.locator('main ol > li').count()

    await page.getByRole('link', { name: 'Investigaciones', exact: true }).click()

    await expect(page).toHaveURL(/type=investigation/)

    const filtered = await page.locator('main ol > li').count()
    expect(filtered).toBeLessThanOrEqual(unfiltered)
  })

  test('never returns a draft or a restricted document', async ({ page }) => {
    // The assertion this file exists for (PRD Nº9 §4).
    for (const query of ['borrador', 'reservado', 'expediente', 'DEMO']) {
      await page.goto(`/buscar?q=${encodeURIComponent(query)}`)

      const html = await page.content()

      expect(html, query).not.toContain('Expediente reservado')
      expect(html, query).not.toContain('NO DEBE APARECER')
    }
  })

  test('the endpoint refuses a query below the autocomplete threshold', async ({ request }) => {
    // PRD Nº9 §59: nothing under three characters reaches the index.
    const response = await request.get('/api/search?q=co')

    expect(response.status()).toBe(200)

    const body = (await response.json()) as { results: unknown[] }
    expect(body.results).toEqual([])
  })

  test('the endpoint returns shaped results, not raw Meilisearch', async ({ request }) => {
    // PRD Nº9 §39: response shaping. A raw payload would leak the index's field
    // names and internal scoring to anyone with the devtools open.
    const response = await request.get('/api/search?q=contratos')

    expect(response.ok()).toBe(true)

    const body = (await response.json()) as Record<string, unknown>

    expect(body).toHaveProperty('results')
    expect(body).not.toHaveProperty('hits')
    expect(body).not.toHaveProperty('_rankingScore')
    expect(JSON.stringify(body)).not.toContain('bodyText')
  })

  test('the endpoint is never cached in a shared layer', async ({ request }) => {
    const response = await request.get('/api/search?q=contratos')

    expect(response.headers()['cache-control']).toContain('no-store')
  })

  test('the header search trigger reaches the page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    await page.getByRole('link', { name: 'Buscar' }).click()

    await expect(page).toHaveURL(/\/buscar/)
  })

  test('renders without horizontal overflow at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 })
    await page.goto('/buscar?q=contratos')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )

    expect(overflow).toBeLessThanOrEqual(1)
  })
})
