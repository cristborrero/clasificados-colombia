import { expect, test } from '@playwright/test'

/**
 * F11 — article template.
 *
 * The seed publishes six DEMO articles and gives the first one a body with a
 * pull quote, a fact box and a correction notice, so the rich-text pipeline is
 * exercised here rather than only inspected. A converter that silently renders
 * nothing looks exactly like an article with no body.
 */
const ARTICLE = '/demo-nota-1'

test.describe('F11 article template', () => {
  test('the headline is the page h1, and the only one', async ({ page }) => {
    await page.goto(ARTICLE)

    const h1 = page.getByRole('heading', { level: 1 })

    await expect(h1).toHaveCount(1)
    await expect(h1).toContainText('DEMO · Los contratos de emergencia')
  })

  test('carries a byline that links to the author', async ({ page }) => {
    // PRD SEO §24 and §31: published journalism is attributable and traceable.
    await page.goto(ARTICLE)

    const author = page.getByRole('link', { name: 'DEMO Periodista de Prueba' }).first()

    await expect(author).toHaveAttribute('href', '/autor/demo-periodista')
    await expect(author).toHaveAttribute('rel', 'author')
  })

  test('publishes a machine-readable date', async ({ page }) => {
    // PRD SEO §29: a crawler reading "18 de agosto" has to guess the year.
    await page.goto(ARTICLE)

    const time = page.locator('article time').first()

    await expect(time).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}T/)
  })

  test('states a reading time', async ({ page }) => {
    await page.goto(ARTICLE)

    await expect(page.getByText(/min de lectura/)).toBeVisible()
  })

  test('does not claim an update that never happened', async ({ page }) => {
    // Printing "Actualizado" on every article devalues the label on the one
    // that carries a correction.
    await page.goto(ARTICLE)

    await expect(page.getByText('Actualizado')).toHaveCount(0)
  })

  test('renders a pull quote as a real quotation', async ({ page }) => {
    await page.goto(ARTICLE)

    const quote = page.locator('article blockquote').first()

    await expect(quote).toContainText('Una cita destacada de demostración')
    await expect(page.locator('article cite')).toContainText('Fuente ficticia')
  })

  test('renders a fact box as a definition list', async ({ page }) => {
    // The markup earns its keep the moment someone navigates it with a screen
    // reader, which announces a pairing the visual layout only implies.
    await page.goto(ARTICLE)

    const list = page.locator('article dl').first()

    await expect(list.locator('dt').first()).toContainText('Contratos revisados')
    await expect(list.locator('dd').first()).toContainText('4.200')
  })

  test('shows a correction notice, clearly', async ({ page }) => {
    // PRD Nº8 §74: a correction the reader can miss is a correction that was
    // not made.
    await page.goto(ARTICLE)

    const notice = page.getByRole('note', { name: 'Corrección' })

    await expect(notice).toBeVisible()
    await expect(notice).toContainText('se ajustó una cifra ficticia')
  })

  test('loads no third-party social script', async ({ page }) => {
    // PRD Nº8 §62 and the source-protection posture: platform share widgets and
    // embeds report who read which investigation, whether or not the reader
    // ever interacts with them.
    const thirdParty: string[] = []

    page.on('request', (request) => {
      const url = new URL(request.url())
      if (!['localhost', '127.0.0.1'].includes(url.hostname)) thirdParty.push(url.hostname)
    })

    await page.goto(ARTICLE)
    await page.waitForLoadState('networkidle')

    expect(thirdParty).toEqual([])
  })

  test('puts related reading at the end, and nowhere else', async ({ page }) => {
    // PRD Nº8 §75: no "te puede interesar" every three paragraphs.
    await page.goto(ARTICLE)

    const related = page.getByRole('heading', { name: 'Seguí leyendo' })

    await expect(related).toHaveCount(1)
  })

  test('an unknown slug is a 404, not an error page', async ({ page }) => {
    const response = await page.goto('/no-existe-esta-nota')

    expect(response?.status()).toBe(404)
  })

  test('renders without horizontal overflow at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 })
    await page.goto(ARTICLE)

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )

    expect(overflow).toBeLessThanOrEqual(1)
  })
})
