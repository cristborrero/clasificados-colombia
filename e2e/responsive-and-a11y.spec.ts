import { expect, test } from '@playwright/test'

/**
 * F22 — QA, Responsive Breakpoints & Accessibility (A11y).
 *
 * Validates the 4 core viewport breakpoints and essential accessibility landmarks
 * across the primary editorial routes.
 */
test.describe('F22 Responsive & Accessibility QA', () => {
  const BREAKPOINTS = [
    { name: 'mobile (360px)', width: 360, height: 780 },
    { name: 'tablet (768px)', width: 768, height: 1024 },
    { name: 'desktop (1024px)', width: 1024, height: 768 },
    { name: 'wide (1440px)', width: 1440, height: 900 },
  ] as const

  const CORE_ROUTES = [
    { name: 'Portada', path: '/' },
    { name: 'Buscador', path: '/buscar' },
    { name: 'Denuncias', path: '/denunciar' },
  ] as const

  for (const bp of BREAKPOINTS) {
    test.describe(`Viewport: ${bp.name}`, () => {
      for (const route of CORE_ROUTES) {
        test(`${route.name} (${route.path}) renders with zero horizontal overflow`, async ({
          page,
        }) => {
          await page.setViewportSize({ width: bp.width, height: bp.height })
          await page.goto(route.path)

          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          )

          expect(overflow, `Overflow detected on ${route.path} at ${bp.name}`).toBeLessThanOrEqual(
            1,
          )
        })
      }
    })
  }

  test('Skip to content link is reachable and targets #contenido on all routes', async ({
    page,
  }) => {
    for (const route of CORE_ROUTES) {
      await page.goto(route.path)

      const skipLink = page.getByRole('link', { name: 'Saltar al contenido' }).first()
      await expect(skipLink).toBeAttached()
      expect(await skipLink.getAttribute('href')).toBe('#contenido')
      await expect(page.locator('#contenido')).toBeAttached()
    }
  })

  test('All primary pages maintain strict heading hierarchy (h1 present and unique)', async ({
    page,
  }) => {
    for (const route of CORE_ROUTES) {
      await page.goto(route.path)

      const h1Elements = page.getByRole('heading', { level: 1 })
      await expect(h1Elements).toHaveCount(1)
    }
  })

  test('Form controls on /denunciar carry explicit labels and accessible descriptions', async ({
    page,
  }) => {
    await page.goto('/denunciar')

    await expect(page.getByLabel('Título o resumen del caso')).toBeVisible()
    await expect(page.getByLabel('Descripción detallada de los hechos')).toBeVisible()
    await expect(page.getByLabel(/Quiero permanecer anónimo/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Enviar información de forma segura' })).toBeVisible()
  })

  test('Mobile navigation toggle has proper accessibility attributes on small screens', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 780 })
    await page.goto('/')

    const menuButton = page.getByRole('button', { name: 'Abrir menú' })
    await expect(menuButton).toBeVisible()

    await menuButton.click()
    const dialog = page.getByRole('dialog', { name: 'Menú de navegación' })
    await expect(dialog).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })
})
