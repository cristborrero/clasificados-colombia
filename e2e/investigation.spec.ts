import { expect, test } from '@playwright/test'

/**
 * F12 — investigation template, and F13 — author, section and topic pages.
 *
 * The assertion that matters most in this file is the restricted-evidence one.
 * The seed attaches two documents to the demo investigation: one public and
 * approved, one restricted. PRD Nº8 §88 forbids the restricted one appearing at
 * all — including as a "documento restringido" placeholder, because saying a
 * document exists can identify the source who provided it.
 */
const INVESTIGATION = '/investigacion/demo-investigacion-contratos'

test.describe('F12 investigation template', () => {
  test('leads with the investigation title as the page h1', async ({ page }) => {
    await page.goto(INVESTIGATION)

    const h1 = page.getByRole('heading', { level: 1 })

    await expect(h1).toHaveCount(1)
    await expect(h1).toContainText('DEMO · Los contratos que nadie quiso explicar')
  })

  test('numbers the key findings so they can be cited', async ({ page }) => {
    await page.goto(INVESTIGATION)

    const findings = page.locator('section[aria-labelledby="hallazgos"] ol > li')

    await expect(findings).toHaveCount(2)
    await expect(findings.first()).toContainText('Hallazgo ficticio número uno')
  })

  test('publishes a machine-readable chronology', async ({ page }) => {
    await page.goto(INVESTIGATION)

    const event = page.locator('section[aria-labelledby="cronologia"] time').first()

    await expect(event).toHaveAttribute('datetime', /^2025-03-04/)
  })

  test('names people only alongside their context, and says association is not guilt', async ({
    page,
  }) => {
    // PRD Nº8 §81. A bare list of names under a corruption investigation reads
    // as a list of the corrupt.
    await page.goto(INVESTIGATION)

    const entities = page.locator('section[aria-labelledby="entidades"]')

    await expect(entities).toContainText('DEMO Persona Mencionada')
    await expect(entities).toContainText('no implica responsabilidad penal')
  })

  test('states how the investigation was done', async ({ page }) => {
    // PRD Nº8 §82, and the publish guard refuses without it.
    await page.goto(INVESTIGATION)

    await expect(page.getByRole('heading', { name: 'Cómo investigamos' })).toBeVisible()
  })

  test('shows the attached document and serves it without leaking its location', async ({
    page,
  }) => {
    await page.goto(INVESTIGATION)

    const documents = page.locator('section[aria-labelledby="documentos"]')

    await expect(documents).toContainText('DEMO · Contrato 2025-0431')

    // A real, followable URL from Payload's upload handling — never a bucket
    // and key.
    const href = await documents
      .getByRole('link', { name: /Ver documento/ })
      .first()
      .getAttribute('href')

    expect(href).toBeTruthy()
    expect(href).not.toContain('bucket')
    expect(href).not.toContain('objectKey')
  })

  test('never exposes internal fields or storage paths', async ({ page }) => {
    /*
     * Rewritten on 2026-08-18. The original assertion was that a *restricted*
     * document never appeared, not even as a placeholder — the classification
     * tier that made that possible no longer exists, because the rule became
     * "if it cannot be public, it does not go in the CMS".
     *
     * The check that remains is the one that still has teeth: whatever the page
     * renders, it renders through a projection, so internal field names and
     * storage locations never reach the browser.
     */
    await page.goto(INVESTIGATION)

    const html = await page.content()

    expect(html).not.toContain('objectKey')
    expect(html).not.toContain('internalNotes')
    expect(html).not.toMatch(/evidence-(internal|restricted)/)
  })

  test('offers chapter navigation when there is more than one chapter', async ({ page }) => {
    await page.goto(INVESTIGATION)

    const contents = page.getByRole('navigation', { name: 'Capítulos' })

    await expect(contents.getByRole('link', { name: /Capítulo de demostración/ })).toBeVisible()
    await expect(page.locator('#capitulo-demo')).toHaveCount(1)
  })
})

test.describe('F13 author, section and topic pages', () => {
  test('the author page lists the work and links back to it', async ({ page }) => {
    await page.goto('/autor/demo-periodista')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('DEMO Periodista de Prueba')
    await expect(page.getByRole('heading', { name: 'Investigaciones' })).toBeVisible()
    await expect(
      page.getByRole('link', { name: /DEMO · Los contratos que nadie quiso explicar/ }),
    ).not.toHaveCount(0)
  })

  test('the section page is a page, not a flat list', async ({ page }) => {
    // PRD Nº8 §90: intro, a promoted story, then the stream.
    await page.goto('/demo-politica')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('DEMO · Política')
    await expect(page.getByText('Sección de prueba')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Lo último' })).toBeVisible()
  })

  test('the topic page leads with investigations', async ({ page }) => {
    await page.goto('/tema/demo-contratacion')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('DEMO · Contratación')
    await expect(page.getByRole('heading', { name: 'Investigaciones' })).toBeVisible()
  })

  test('an unknown author, section or topic is a 404', async ({ page }) => {
    for (const path of ['/autor/nadie', '/ninguna-seccion', '/tema/ninguno']) {
      const response = await page.goto(path)

      expect(response?.status(), path).toBe(404)
    }
  })

  test('these pages render without horizontal overflow at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 })

    for (const path of [INVESTIGATION, '/autor/demo-periodista', '/demo-politica']) {
      await page.goto(path)

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )

      expect(overflow, path).toBeLessThanOrEqual(1)
    }
  })
})
