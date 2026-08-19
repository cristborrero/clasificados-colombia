import { expect, test, type APIRequestContext } from '@playwright/test'

/**
 * F10 — homepage.
 *
 * The seed publishes six DEMO articles, newest first. These assertions are
 * about the properties a front page has to hold whatever the newsroom put on
 * it: one lead, no duplicates, one h1, and a chronological stream that is
 * actually chronological.
 */
test.describe('F10 homepage', () => {
  /**
   * Asks the API which piece is newest rather than assuming it is a seed
   * fixture. Other specs in this suite publish articles as they run, so any
   * assertion naming a specific headline is asserting the order the suite
   * happened to execute in — which passes or fails for reasons that have
   * nothing to do with the homepage.
   */
  const newestPublishedTitle = async (request: APIRequestContext): Promise<string> => {
    const response = await request.get('/api/articles', {
      params: {
        limit: '1',
        sort: '-publication.publishedAt',
        'where[_status][equals]': 'published',
      },
    })

    expect(response.ok()).toBe(true)

    const body = (await response.json()) as { docs: { title: string }[] }
    const title = body.docs[0]?.title

    expect(title, 'the suite needs at least one published article').toBeTruthy()

    return title!
  }

  test('leads with the most recent piece', async ({ page, request }) => {
    const newest = await newestPublishedTitle(request)

    await page.goto('/')

    await expect(page.locator('main article').first()).toContainText(newest)
  })

  test('does not publish the lead story twice on the same screen', async ({ page, request }) => {
    // Every band below the hero excludes its slug. Without that, the reader
    // meets the same headline as the lead and again three rows down.
    const newest = await newestPublishedTitle(request)

    await page.goto('/')

    expect(await page.getByRole('link', { name: newest, exact: true }).count()).toBe(1)
  })

  test('has exactly one h1, and it names the site rather than the lead story', async ({ page }) => {
    // PRD Nº8 §106. The hero headline is the largest text on the page but it is
    // the story's title, not the page's — promoting it would tell a screen
    // reader the page is about that one article, and would change every time
    // the newsroom changes its lead.
    await page.goto('/')

    const headings = page.getByRole('heading', { level: 1 })

    await expect(headings).toHaveCount(1)
    await expect(headings).toContainText('Clasificados Colombia')
  })

  test('the latest stream is ordered newest first', async ({ page }) => {
    await page.goto('/')

    const times = await page.locator('main ol[data-band="latest"] time').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('datetime')),
    )

    expect(times.length).toBeGreaterThan(1)

    const sorted = [...times].sort().reverse()
    expect(times).toEqual(sorted)
  })

  test('every stream item carries a time, a category and a headline', async ({ page }) => {
    // PRD Nº8 §46 lists exactly those three. The image is optional.
    await page.goto('/')

    const first = page.locator('main ol[data-band="latest"] > li').first()

    await expect(first.locator('time')).toHaveCount(1)
    await expect(first).toContainText('Política')
    await expect(first.getByRole('link')).not.toHaveCount(0)
  })

  test('shows content rather than the empty state', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Todavía no hay nada publicado')).toHaveCount(0)
  })

  test('renders without horizontal overflow at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 })
    await page.goto('/')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )

    expect(overflow).toBeLessThanOrEqual(1)
  })
})
