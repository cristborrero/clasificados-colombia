import { expect, test } from '@playwright/test'

/**
 * F9 — editorial component family.
 *
 * Asserts the structural rules PRD Nº8 §49-§56 impose, against the showcase
 * page at /dev/editorial where every card renders in every state the DoD names.
 *
 * These are the properties that are easy to break and invisible when broken: a
 * duplicated link, an interactive element nested in another, a figure printed
 * without its context. None of them look wrong on screen.
 */
const SHOWCASE = '/dev/editorial'

test.describe('F9 editorial components', () => {
  test('no interactive element is nested inside another', async ({ page }) => {
    // PRD Nº8 §51. Nested anchors are invalid HTML and leave a keyboard user
    // with a focus stop that does nothing.
    await page.goto(SHOWCASE)

    expect(await page.locator('a a').count()).toBe(0)
    expect(await page.locator('a button, button a').count()).toBe(0)
  })

  test('the card image links without duplicating the headline link', async ({ page }) => {
    // §51 wants the media clickable. Announcing it as a second link to the same
    // article is the cost this avoids.
    await page.goto(SHOWCASE)

    const title = 'Renunció el ministro'
    const announced = page.getByRole('link', { name: title })

    // Once per card that uses the short-title fixture, never twice per card.
    const announcedCount = await announced.count()
    const rendered = await page.getByText(title, { exact: true }).count()

    expect(announcedCount).toBeGreaterThan(0)
    expect(announcedCount).toBe(rendered)
  })

  test('image links are removed from the tab order', async ({ page }) => {
    await page.goto(SHOWCASE)

    const hiddenLinks = page.locator('a[aria-hidden="true"]')

    expect(await hiddenLinks.count()).toBeGreaterThan(0)
    // Every one of them must also be untabbable, or it is a focus stop that
    // announces nothing.
    expect(await hiddenLinks.locator(':scope:not([tabindex="-1"])').count()).toBe(0)
  })

  test('a data figure is not printed without its context', async ({ page }) => {
    // PRD Nº8 §55: "con contexto". A number alone is not journalism.
    await page.goto(SHOWCASE)

    const withContext = page.getByText('de pesos adjudicados sin licitación')
    await expect(withContext).toBeVisible()

    // The showcase renders the same figure twice: once with context, once
    // without. Only the first may appear.
    expect(await page.getByText('68.000 M', { exact: true }).count()).toBe(1)
  })

  test('opinion pieces declare themselves', async ({ page }) => {
    // PRD Nº8 §54. A reader who cannot tell a column from a report will
    // attribute the column to the newsroom.
    await page.goto(SHOWCASE)

    await expect(page.getByText('Opinión', { exact: true }).first()).toBeVisible()
  })

  test('video duration reaches assistive technology through the metadata', async ({ page }) => {
    // The corner badge is aria-hidden; the metadata line is what gets announced.
    await page.goto(SHOWCASE)

    await expect(page.getByText('Duración 4:32')).toBeVisible()
  })

  test('evidence links to the authorising endpoint, never to storage', async ({ page }) => {
    // PRD Nº8 §86: the UI gets a controlled URL from a secure endpoint. An
    // object key in the markup would bypass authorisation and the audit trail.
    await page.goto(SHOWCASE)

    const link = page.getByRole('link', { name: /Ver documento/ }).first()

    await expect(link).toHaveAttribute('href', '/api/evidence/1/access')

    const html = await page.content()
    expect(html).not.toContain('objectKey')
    expect(html).not.toContain('evidence-restricted')
  })

  test('an empty list says so instead of rendering an empty list', async ({ page }) => {
    await page.goto(SHOWCASE)

    await expect(
      page.getByText('Todavía no hay publicaciones en esta sección.'),
    ).toBeVisible()
  })

  test('the workbench is not indexable', async ({ page }) => {
    await page.goto(SHOWCASE)

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })

  test('cards survive a 360px viewport without horizontal overflow', async ({ page }) => {
    // The DoD for F9 asks for mobile verification explicitly. A card that
    // overflows produces a page the reader can scroll sideways for no reason.
    await page.setViewportSize({ width: 360, height: 780 })
    await page.goto(SHOWCASE)

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )

    expect(overflow).toBeLessThanOrEqual(1)
  })
})
