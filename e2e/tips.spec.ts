import { expect, test } from '@playwright/test'

import { ACCOUNTS, anonymous, authHeader as auth, identity, login } from './support/api'

/**
 * F21 — citizen tips.
 *
 * Two properties matter here and neither is about the form.
 *
 * The first is that the endpoint, not the form, carries the protection. A
 * submission that skips the page entirely must still be refused.
 *
 * The second is who can read what arrives. A tip may name someone who works
 * here, so `author` must not be able to read the collection — and neither may
 * an anonymous caller, whatever they ask the REST API.
 */
test.describe('F21 tips', () => {
  test('the page explains what happens and what is not stored', async ({ page }) => {
    await page.goto('/denunciar')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Cuéntanos qué está pasando')
    await expect(page.getByText(/Nada de lo que envíes se publica automáticamente/)).toBeVisible()
    await expect(page.getByText(/No los guardamos ocultos: no los guardamos/)).toBeVisible()
  })

  test('the tip page is not indexable', async ({ page }) => {
    await page.goto('/denunciar')

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })

  test('choosing anonymity removes the contact fields from the page', async ({ page }) => {
    // Not disabled, not hidden — removed. A source who asked for anonymity
    // should not watch the form keep asking for a phone number.
    await page.goto('/denunciar')

    await expect(page.getByRole('textbox', { name: 'Correo' })).toBeVisible()

    await page.getByLabel(/Quiero permanecer anónimo/).check()

    // Scoped by role: the anonymity checkbox's own label mentions "correo" and
    // "teléfono" when it explains what will not be stored.
    await expect(page.getByRole('textbox', { name: 'Correo' })).toHaveCount(0)
    await expect(page.getByRole('textbox', { name: 'Teléfono' })).toHaveCount(0)
  })

  test('the endpoint refuses a submission that never cleared Turnstile', async ({ request }) => {
    /*
     * The assertion this file exists for. Protection belongs on the endpoint,
     * because an attacker does not use the form.
     *
     * Development runs without a Turnstile secret, and the verifier fails
     * closed in that case on purpose: treating "no key" as "no check" means a
     * deploy that forgot the environment variable silently ships an open
     * endpoint and nothing looks wrong.
     */
    const response = await request.post('/api/denunciar', {
      failOnStatusCode: false,
      data: {
        title: 'Intento directo contra el endpoint',
        description: 'Esta denuncia no pasó por el formulario ni por la verificación.',
      },
    })

    expect(response.status()).toBe(400)

    const body = (await response.json()) as { ok: boolean; message: string }

    expect(body.ok).toBe(false)
    // The reason is logged, never returned: telling a caller which check failed
    // tells a script which knob to turn.
    expect(body.message).not.toContain('Turnstile')
    expect(body.message).not.toContain('unconfigured')
  })

  test('the REST API cannot be used to create a tip directly', async ({ request }) => {
    /*
     * The collection denies `create` to everyone, so `/api/denunciar` is the
     * only door — and it is mounted on its own path precisely so that it does
     * not shadow this one. A route file at `/api/tips` would have intercepted
     * Payload's own endpoint for the collection, which is how editors ended up
     * getting 405 when trying to read tips.
     */
    const editor = await login(request, ACCOUNTS.editor)

    const response = await request.post('/api/tips', {
      headers: auth(editor),
      failOnStatusCode: false,
      data: { title: 'x', description: 'y' },
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

  test('an anonymous caller cannot read tips', async ({ baseURL }) => {
    const reader = await anonymous(baseURL!)

    const response = await reader.get('/api/tips')

    expect(response.status()).toBeGreaterThanOrEqual(400)

    await reader.dispose()
  })

  test('an author cannot read tips', async ({ baseURL }) => {
    // A tip may name someone who works here.
    const author = await identity(baseURL!, ACCOUNTS.author)

    const response = await author.ctx.get('/api/tips')

    expect(response.status()).toBeGreaterThanOrEqual(400)

    await author.dispose()
  })

  test('an editor can read tips', async ({ baseURL }) => {
    const editor = await identity(baseURL!, ACCOUNTS.editor)

    const response = await editor.ctx.get('/api/tips')

    expect(response.status()).toBe(200)

    await editor.dispose()
  })

  test('the form renders without horizontal overflow at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 })
    await page.goto('/denunciar')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )

    expect(overflow).toBeLessThanOrEqual(1)
  })
})
