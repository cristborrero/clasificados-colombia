import { expect, test } from '@playwright/test'

/**
 * F16 — SEO.
 *
 * The assertions that matter here are the ones a person cannot eyeball: a
 * canonical carrying a query string, structured data that disagrees with the
 * visible headline, a draft reachable from the sitemap. All of them look fine
 * on screen and are only visible in the markup.
 */
const ARTICLE = '/demo-politica/demo-nota-1'

const jsonLd = async (page: import('@playwright/test').Page) => {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()

  return blocks.map((raw) => JSON.parse(raw) as Record<string, unknown>)
}

test.describe('F16 SEO', () => {
  test('every indexable page declares a canonical without query parameters', async ({ page }) => {
    // PRD SEO §9: never ?utm_source=, ?fbclid=, ?page= in a canonical.
    for (const path of ['/', ARTICLE, '/demo-politica', '/autor/demo-periodista']) {
      await page.goto(path)

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')

      expect(canonical, path).toBeTruthy()
      expect(canonical, path).toMatch(/^https?:\/\//)
      expect(canonical, path).not.toContain('?')
    }
  })

  test('articles sit under their category (PRD SEO §12)', async ({ page }) => {
    await page.goto(ARTICLE)

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')

    expect(new URL(canonical!).pathname).toBe(ARTICLE)
  })

  test('a category that does not match the article is a 404', async ({ page }) => {
    // Otherwise the same piece is reachable at every category — the duplicate
    // content §9 exists to prevent.
    const response = await page.goto('/demo-otra-seccion/demo-nota-1')

    expect(response?.status()).toBe(404)
  })

  test('no date appears in an article path (§13)', async ({ page }) => {
    await page.goto(ARTICLE)

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')

    expect(new URL(canonical!).pathname).not.toMatch(/\/\d{4}\//)
  })

  test('the article carries NewsArticle structured data that matches the page', async ({ page }) => {
    await page.goto(ARTICLE)

    const blocks = await jsonLd(page)
    const article = blocks.find((b) => String(b['@type']).endsWith('NewsArticle'))

    expect(article).toBeTruthy()

    // §27: Google compares headline against the visible H1. A mismatch is what
    // gets a rich result dropped.
    const h1 = await page.getByRole('heading', { level: 1 }).textContent()
    expect(article!.headline).toBe(h1?.trim())

    expect(article!.publisher).toHaveProperty('@id')
    expect(article!.inLanguage).toBe('es-CO')
  })

  test('the author in structured data links to a real author page', async ({ page }) => {
    await page.goto(ARTICLE)

    const article = (await jsonLd(page)).find((b) => String(b['@type']).endsWith('NewsArticle'))!
    const author = (article.author as Record<string, unknown>[])[0]!

    expect(author['@type']).toBe('Person')

    /*
     * Navigate by pathname, not by the absolute URL in the markup.
     *
     * `NEXT_PUBLIC_SERVER_URL` is inlined at build time, so the artefact under
     * test carries the production origin — following the URL verbatim would
     * leave the server under test and ask the live site about a demo author.
     * The claim worth checking here is that the slug resolves to a real page;
     * the origin is a build input, asserted by the canonical test instead.
     */
    const response = await page.goto(new URL(String(author.url)).pathname)
    expect(response?.status()).toBe(200)
  })

  test('the publisher is declared once, site-wide', async ({ page }) => {
    await page.goto('/')

    const org = (await jsonLd(page)).find((b) => String(b['@type']).includes('Organization'))

    expect(org).toBeTruthy()
    expect(org!['@id']).toContain('#organization')
  })

  test('breadcrumbs do not point the last item at itself', async ({ page }) => {
    await page.goto(ARTICLE)

    const trail = (await jsonLd(page)).find((b) => b['@type'] === 'BreadcrumbList')!
    const items = trail.itemListElement as Record<string, unknown>[]

    expect(items.length).toBeGreaterThan(1)
    expect(items.at(-1)).not.toHaveProperty('item')
  })

  test('Discover gets a large image preview (§43)', async ({ page }) => {
    await page.goto(ARTICLE)

    const robots = await page.locator('meta[name="robots"]').getAttribute('content')

    expect(robots).toContain('max-image-preview:large')
    expect(robots).toContain('index')
  })

  test('search and the tip form are noindex', async ({ page }) => {
    for (const path of ['/buscar', '/denunciar']) {
      await page.goto(path)

      const robots = await page.locator('meta[name="robots"]').getAttribute('content')
      expect(robots, path).toContain('noindex')
    }
  })

  test('robots.txt points at both sitemaps and blocks what has no value', async ({ request }) => {
    const response = await request.get('/robots.txt')
    const body = await response.text()

    expect(response.status()).toBe(200)
    expect(body).toContain('sitemap.xml')
    expect(body).toContain('news-sitemap.xml')
    expect(body).toMatch(/Disallow: \/admin/)
    expect(body).toMatch(/Disallow: \/api\//)
  })

  test('the sitemap lists published work and never a draft', async ({ request }) => {
    const response = await request.get('/sitemap.xml')
    const body = await response.text()

    expect(response.status()).toBe(200)
    expect(body).toContain('/demo-politica/demo-nota-1')

    // A sitemap is an invitation. Inviting a crawler to a draft is how a draft
    // gets indexed.
    expect(body).not.toContain('demo-borrador')
  })

  test('the news sitemap is valid XML with the news namespace', async ({ request }) => {
    const response = await request.get('/news-sitemap.xml')
    const body = await response.text()

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('xml')
    expect(body).toContain('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"')
    expect(body).toContain('<news:publication_date>')
    expect(body).toContain('<news:name>')
  })

  test('Open Graph describes the article as an article', async ({ page }) => {
    await page.goto(ARTICLE)

    expect(await page.locator('meta[property="og:type"]').getAttribute('content')).toBe('article')
    expect(await page.locator('meta[property="og:url"]').getAttribute('content')).toMatch(/^https?:/)
    expect(await page.locator('meta[property="og:locale"]').getAttribute('content')).toBe('es_CO')
  })

  test('structured data cannot be closed by a headline', async ({ page }) => {
    // JSON.stringify does not escape `<`, and inside a script element that is
    // the one character that turns an editor's typo into script injection.
    await page.goto(ARTICLE)

    const raw = await page.locator('script[type="application/ld+json"]').first().textContent()

    expect(raw).not.toContain('</script')
  })
})
