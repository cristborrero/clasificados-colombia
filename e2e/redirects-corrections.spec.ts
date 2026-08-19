import { expect, test, type APIRequestContext } from '@playwright/test'

import { ACCOUNTS, authHeader as auth, login, type Session } from './support/api'

/**
 * F17 — redirects, corrections and what a 404 says.
 *
 * The three promises: a published URL keeps working after its slug changes, a
 * correction is visible inside the piece it corrects, and a reader who lands on
 * nothing gets somewhere to go instead of Next's default page.
 */

const run = Date.now().toString(36)

async function editorialContext(
  request: APIRequestContext,
  session: Session,
): Promise<{ category: { id: number; slug: string }; author: number }> {
  const [categories, authors] = await Promise.all([
    request.get('/api/categories?limit=1', { headers: auth(session) }),
    request.get('/api/authors?limit=1', { headers: auth(session) }),
  ])

  const category = ((await categories.json()) as { docs: { id: number; slug: string }[] }).docs[0]
  const author = ((await authors.json()) as { docs: { id: number }[] }).docs[0]

  expect(category, 'la base sembrada debe tener al menos una sección').toBeTruthy()
  expect(author, 'la base sembrada debe tener al menos una autoría').toBeTruthy()

  return { category: category!, author: author!.id }
}

/** Creates a piece and walks it all the way to published. */
async function publishArticle(
  request: APIRequestContext,
  editor: Session,
  title: string,
): Promise<{ id: number; slug: string; categorySlug: string }> {
  const { category, author } = await editorialContext(request, editor)

  const created = await request.post('/api/articles', {
    headers: auth(editor),
    data: {
      title,
      dek: 'Contenido ficticio de prueba.',
      category: category.id,
      authors: [author],
    },
  })

  expect(created.status(), await created.text()).toBe(201)

  const { doc } = (await created.json()) as { doc: { id: number; slug: string } }

  // The workflow has no edge from draft straight to published.
  for (const editorialStatus of ['fact_check', 'approved'] as const) {
    const step = await request.patch(`/api/articles/${doc.id}`, {
      headers: auth(editor),
      data: {
        workflow: { editorialStatus, factCheckStatus: 'verified', legalStatus: 'not_required' },
      },
    })

    expect(step.status(), await step.text()).toBe(200)
  }

  const published = await request.patch(`/api/articles/${doc.id}`, {
    headers: auth(editor),
    data: {
      _status: 'published',
      workflow: {
        editorialStatus: 'published',
        factCheckStatus: 'verified',
        legalStatus: 'not_required',
      },
    },
  })

  expect(published.status(), await published.text()).toBe(200)

  return { id: doc.id, slug: doc.slug, categorySlug: category.slug }
}

test.describe('F17 · redirects', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'HTTP-level, browser-independent')

  test('a published URL survives a slug change', async ({ request }) => {
    const editor = await login(request, ACCOUNTS.editor)
    const admin = await login(request, ACCOUNTS.admin)

    const article = await publishArticle(request, editor, `DEMO · nota que cambia de slug ${run}`)
    const oldPath = `/${article.categorySlug}/${article.slug}`

    // It is reachable before anything moves — otherwise the assertion after the
    // rename would prove nothing.
    const before = await request.get(oldPath)
    expect(before.status()).toBe(200)

    const newSlug = `${article.slug}-corregido`
    const renamed = await request.patch(`/api/articles/${article.id}`, {
      headers: auth(editor),
      data: { slug: newSlug },
    })

    expect(renamed.status(), await renamed.text()).toBe(200)

    const newPath = `/${article.categorySlug}/${newSlug}`
    expect((await request.get(newPath)).status()).toBe(200)

    /*
     * The old address must not 404. `maxRedirects: 0` is what makes this a test
     * of the redirect rather than of the destination — following it would pass
     * even if the server had simply rendered the new page at the old URL.
     */
    const moved = await request.get(oldPath, { maxRedirects: 0 })

    expect([301, 308]).toContain(moved.status())
    expect(moved.headers()['location']).toContain(newPath)

    await request.delete(`/api/articles/${article.id}`, { headers: auth(admin) })
  })

  test('a URL that never existed gets the editorial 404, not the default page', async ({
    page,
  }) => {
    const response = await page.goto(`/no-existe-esta-seccion-${run}`)

    expect(response?.status()).toBe(404)

    await expect(page.getByRole('heading', { level: 1 })).toContainText('no existe')

    // The three ways out: search, and the two lists. Next's default page has none.
    await expect(page.getByRole('searchbox')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Últimas noticias' })).toBeVisible()
  })

  test('the 404 is not indexable', async ({ page }) => {
    await page.goto(`/no-existe-esta-seccion-${run}`)

    /*
     * There is more than one `robots` tag here, and deliberately so: the route
     * segment emits one for a URL that resolves to nothing, and the 404 page
     * emits one for URLs that match no segment at all. Neither covers the other
     * case, so what has to hold is that none of them is indexable — asserting
     * on a single tag would just be asserting on whichever came first.
     */
    const tags = await page.locator('meta[name="robots"]').all()

    expect(tags.length).toBeGreaterThan(0)

    for (const tag of tags) {
      expect(await tag.getAttribute('content')).toContain('noindex')
    }
  })
})

test.describe('F17 · corrections', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'HTTP-level, browser-independent')

  test('a correction appears inside the piece it corrects', async ({ page, request }) => {
    const editor = await login(request, ACCOUNTS.editor)
    const admin = await login(request, ACCOUNTS.admin)

    const article = await publishArticle(request, editor, `DEMO · nota con corrección ${run}`)
    const path = `/${article.categorySlug}/${article.slug}`

    // Absent before, so its appearance below is caused by the correction.
    await page.goto(path)
    await expect(page.getByRole('heading', { name: 'Correcciones y actualizaciones' })).toHaveCount(
      0,
    )

    const texto = `Se corrigió la cifra de 3.200 a 3.020 millones ${run}.`

    const correction = await request.post('/api/corrections', {
      headers: auth(editor),
      data: {
        about: { relationTo: 'articles', value: article.id },
        type: 'correction',
        summary: texto,
      },
    })

    expect(correction.status(), await correction.text()).toBe(201)

    const { doc: created } = (await correction.json()) as { doc: { id: number } }

    // No rebuild, no cache to bust: the next request renders it.
    await page.goto(path)

    await expect(
      page.getByRole('heading', { name: 'Correcciones y actualizaciones' }),
    ).toBeVisible()
    await expect(page.getByText(texto)).toBeVisible()

    // The original text is not altered — the piece still says what it said.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('nota con corrección')

    await request.delete(`/api/corrections/${created.id}`, { headers: auth(admin) })
    await request.delete(`/api/articles/${article.id}`, { headers: auth(admin) })
  })

  test('an author cannot issue a correction, and anonymous cannot either', async ({ request }) => {
    const author = await login(request, ACCOUNTS.author)

    const asAuthor = await request.post('/api/corrections', {
      headers: auth(author),
      data: { about: { relationTo: 'articles', value: 1 }, type: 'correction', summary: 'x' },
    })

    expect(asAuthor.status()).toBeGreaterThanOrEqual(400)

    const anon = await request.post('/api/corrections', {
      data: { about: { relationTo: 'articles', value: 1 }, type: 'correction', summary: 'x' },
    })

    expect(anon.status()).toBeGreaterThanOrEqual(400)
  })
})
