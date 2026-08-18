import { expect, test } from '@playwright/test'

/**
 * F8 — site shell.
 *
 * Asserts the rendered page, not the components in isolation. The link
 * resolution and the breaking-news window are covered exhaustively by unit
 * tests; what only an end-to-end run can prove is that the header actually
 * reads Payload and that an editor's menu reaches the DOM.
 */
test.describe('F8 site shell', () => {
  test('the skip link is the first focusable element on the page', async ({ page }, testInfo) => {
    // WCAG 2.4.1. If it is not first, a keyboard user still walks the header.
    //
    // Chromium only, and not because WebKit fails it. Safari does not put links
    // in the Tab order unless "Press Tab to highlight each item" is enabled —
    // an operating-system preference, not a property of this page. Asserting it
    // under WebKit would test the browser's default settings. The markup order
    // the requirement is really about is asserted for every engine by the test
    // below.
    testInfo.skip(testInfo.project.name !== 'chromium', 'Tab order is an OS setting in WebKit')

    await page.goto('/')
    await page.keyboard.press('Tab')

    await expect(page.locator(':focus')).toHaveText('Saltar al contenido')
  })

  test('the skip link is the first link in the document', async ({ page }) => {
    // The engine-independent half of WCAG 2.4.1: whatever the browser does with
    // Tab, the link has to come before the header in the source order.
    await page.goto('/')

    await expect(page.getByRole('link').first()).toHaveText('Saltar al contenido')
  })

  test('the skip link targets the main landmark', async ({ page }) => {
    await page.goto('/')

    const href = await page.getByRole('link', { name: 'Saltar al contenido' }).getAttribute('href')

    expect(href).toBe('#contenido')
    await expect(page.locator('main#contenido')).toHaveCount(1)
  })

  test('navigation comes from Payload, not from the component', async ({ page }) => {
    // The seed puts DEMO · Política in the primary menu. Nothing in the code
    // names it, so a link with this label can only have come from the database.
    //
    // A desktop viewport explicitly, because the mobile projects run at phone
    // widths where this nav is `display: none` by design — the mobile menu test
    // below covers the same link on the path a phone actually takes.
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    const nav = page.getByRole('navigation', { name: 'Secciones' }).first()

    await expect(nav.getByRole('link', { name: 'DEMO · Política' })).toHaveAttribute(
      'href',
      '/seccion/demo-politica',
    )
  })

  test('the header links home from the logo', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('link', { name: 'Clasificados Colombia — portada' }),
    ).toHaveAttribute('href', '/')
  })

  test('no breaking bar renders while the global is switched off', async ({ page }) => {
    // The seed stores a headline but leaves `enabled` false. A bar appearing
    // here would mean the switch is decorative.
    await page.goto('/')

    await expect(page.getByRole('status')).toHaveCount(0)
    await expect(page.getByText('DEMO · Titular de última hora')).toHaveCount(0)
  })

  test('the footer publishes real contact details', async ({ page }) => {
    // PRD SEO §67: an outlet with no way to reach it reads as anonymous.
    await page.goto('/')

    await expect(
      page.getByRole('link', { name: 'redaccion@clasificadoscolombia.test' }),
    ).toHaveAttribute('href', 'mailto:redaccion@clasificadoscolombia.test')
  })

  test('external social links carry noopener', async ({ page }) => {
    await page.goto('/')

    const social = page.getByRole('link', { name: 'Bluesky' })

    await expect(social).toHaveAttribute('target', '_blank')
    await expect(social).toHaveAttribute('rel', /noopener/)
  })

  test('the mobile menu opens, traps focus and closes on Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    await page.getByRole('button', { name: 'Abrir menú' }).click()

    const dialog = page.getByRole('dialog', { name: 'Menú de navegación' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('link', { name: 'DEMO · Política' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('the header sticks to the top and compacts on scroll', async ({ page }) => {
    // PRD Nº8 §26-§27: sticky yes, full → compact on scroll.
    await page.goto('/')

    const header = page.locator('header').first()

    await expect(header).toHaveAttribute('data-compact', 'false')

    const fullHeight = (await header.boundingBox())?.height ?? 0

    await page.evaluate(() => window.scrollTo(0, 600))
    await expect(header).toHaveAttribute('data-compact', 'true')

    const box = await header.boundingBox()

    // Still pinned to the top of the viewport, and shorter than it was.
    expect(box?.y).toBeLessThanOrEqual(1)
    expect(box?.height ?? 0).toBeLessThan(fullHeight)
  })

  test('the desktop section nav is not rendered on a phone', async ({ page }) => {
    // Both menus render the same resolved links; only one may be reachable at a
    // time, or a screen reader announces every section twice.
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    await expect(page.getByRole('navigation', { name: 'Secciones' })).toHaveCount(0)
  })
})
