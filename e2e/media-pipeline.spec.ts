import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { expect, test, type APIRequestContext } from '@playwright/test'

import { ACCOUNTS, authHeader as auth, login } from './support/api'

/**
 * F15 media pipeline — the guarantees, not the plumbing.
 *
 * Four things this collection promises and that are expensive to discover are
 * broken: an SVG cannot get in, a published original carries no camera
 * metadata, an asset something is displaying cannot be deleted, and a picture
 * whose licence nobody established cannot reach the front page.
 *
 * Exercised over HTTP because that is where the promise has to hold. The admin
 * UI hiding a button proves nothing (PRD Nº5 §4).
 *
 * Runs on chromium only — this is server behaviour.
 */

test.describe.configure({ mode: 'serial' })

/**
 * A JPEG that carries EXIF, committed rather than generated.
 *
 * Generating it would mean importing sharp here, and sharp inside a Playwright
 * spec crashes the runner outright — its `semver` dependency hits a CJS/ESM
 * cycle that Playwright's loader reports as "Unexpected module status 3".
 *
 * The check is on the APP1 marker instead of a parsed metadata object. In JPEG
 * the ASCII `Exif` only appears in that segment header, so its presence and
 * absence are exactly the question being asked, and the test keeps no native
 * dependency to answer it.
 */
const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'support/fixtures/con-metadatos.jpg',
)

const EXIF_MARKER = Buffer.from('Exif')

/**
 * Makes each run's fixtures distinguishable.
 *
 * Slugs are unique, and a run that fails before its cleanup leaves documents
 * behind — without this, the next run fails on the leftovers rather than on
 * whatever it was actually testing.
 */
const run = Date.now().toString(36)

async function photograph(): Promise<Buffer> {
  return readFile(FIXTURE)
}

/**
 * A section and a byline from the seeded data.
 *
 * Articles require both, and inventing them here would duplicate the seed's
 * definition of a valid piece — this asks the database what it already has.
 */
async function editorialContext(
  request: APIRequestContext,
  session: Parameters<typeof auth>[0],
): Promise<{ category: number; author: number }> {
  const [categories, authors] = await Promise.all([
    request.get('/api/categories?limit=1', { headers: auth(session) }),
    request.get('/api/authors?limit=1', { headers: auth(session) }),
  ])

  const category = ((await categories.json()) as { docs: { id: number }[] }).docs[0]
  const author = ((await authors.json()) as { docs: { id: number }[] }).docs[0]

  expect(category, 'la base sembrada debe tener al menos una sección').toBeTruthy()
  expect(author, 'la base sembrada debe tener al menos una autoría').toBeTruthy()

  return { category: category!.id, author: author!.id }
}

test.describe('F15 media pipeline', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'HTTP-level, browser-independent')

  test('an SVG cannot be uploaded, whatever it claims to be', async ({ request }) => {
    const editor = await login(request, ACCOUNTS.editor)

    const response = await request.post('/api/media', {
      headers: auth(editor),
      multipart: {
        // Payload takes the document as one JSON part, not as loose fields.
        _payload: JSON.stringify({ alt: 'Intento de SVG' }),
        file: {
          name: 'payload.svg',
          mimeType: 'image/svg+xml',
          buffer: Buffer.from(
            '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
          ),
        },
      },
    })

    // An SVG is a document that can carry script, served from this origin.
    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

  test('the stored original carries no camera metadata', async ({ request }) => {
    const editor = await login(request, ACCOUNTS.editor)
    const original = await photograph()

    // Proven guilty first: otherwise the assertion below passes against a file
    // that never carried anything.
    expect(original.includes(EXIF_MARKER)).toBe(true)

    const response = await request.post('/api/media', {
      headers: auth(editor),
      multipart: {
        _payload: JSON.stringify({
          alt: 'Fotografía de prueba con metadatos',
          license: 'owned',
        }),
        file: { name: 'con-metadatos.jpg', mimeType: 'image/jpeg', buffer: original },
      },
    })

    expect(response.status(), await response.text()).toBe(201)

    const { doc } = (await response.json()) as { doc: { id: number; url: string } }
    const stored = await request.get(doc.url)

    expect(stored.status()).toBe(200)

    const served = Buffer.from(await stored.body())

    expect(served.includes(EXIF_MARKER)).toBe(false)
  })

  test('an asset a story is displaying cannot be deleted', async ({ request }) => {
    const admin = await login(request, ACCOUNTS.admin)
    const editor = await login(request, ACCOUNTS.editor)

    const upload = await request.post('/api/media', {
      headers: auth(editor),
      multipart: {
        _payload: JSON.stringify({ alt: 'Imagen en uso', license: 'owned' }),
        file: { name: 'en-uso.jpg', mimeType: 'image/jpeg', buffer: await photograph() },
      },
    })

    const { doc: media } = (await upload.json()) as { doc: { id: number } }

    const { category, author } = await editorialContext(request, editor)

    const article = await request.post('/api/articles', {
      headers: auth(editor),
      data: {
        title: `DEMO · nota que usa una imagen ${run}`,
        dek: 'Contenido ficticio de prueba.',
        category,
        authors: [author],
        hero: { image: media.id },
      },
    })

    expect(article.status(), await article.text()).toBe(201)

    const { doc: created } = (await article.json()) as { doc: { id: number } }

    // Administrator, the only role that may delete at all — and still refused.
    const refused = await request.delete(`/api/media/${media.id}`, { headers: auth(admin) })

    expect(refused.status()).toBe(400)
    expect(await refused.text()).toContain('en uso')

    // Still there, not half-deleted.
    const survives = await request.get(`/api/media/${media.id}`, { headers: auth(admin) })
    expect(survives.status()).toBe(200)

    await request.delete(`/api/articles/${created.id}`, { headers: auth(admin) })
    await request.delete(`/api/media/${media.id}`, { headers: auth(admin) })
  })

  test('a story cannot be published behind an image with an unknown licence', async ({
    request,
  }) => {
    const admin = await login(request, ACCOUNTS.admin)
    const editor = await login(request, ACCOUNTS.editor)

    const upload = await request.post('/api/media', {
      headers: auth(editor),
      multipart: {
        _payload: JSON.stringify({ alt: 'Imagen sin licencia establecida', license: 'unknown' }),
        file: { name: 'sin-licencia.jpg', mimeType: 'image/jpeg', buffer: await photograph() },
      },
    })

    const { doc: media } = (await upload.json()) as { doc: { id: number } }

    const { category, author } = await editorialContext(request, editor)

    const article = await request.post('/api/articles', {
      headers: auth(editor),
      data: {
        title: `DEMO · nota con imagen sin licencia ${run}`,
        dek: 'Contenido ficticio de prueba.',
        category,
        authors: [author],
        hero: { image: media.id },
      },
    })

    expect(article.status(), await article.text()).toBe(201)

    const { doc: created } = (await article.json()) as { doc: { id: number } }

    /*
     * The workflow has no edge from `draft` straight to `published`, so the
     * piece is walked to `approved` first. Otherwise the transition guard
     * rejects the write before the rights check is ever reached, and the test
     * would pass for the wrong reason.
     */
    for (const editorialStatus of ['fact_check', 'approved'] as const) {
      const step = await request.patch(`/api/articles/${created.id}`, {
        headers: auth(editor),
        data: {
          workflow: { editorialStatus, factCheckStatus: 'verified', legalStatus: 'not_required' },
        },
      })

      expect(step.status(), await step.text()).toBe(200)
    }

    const publish = await request.patch(`/api/articles/${created.id}`, {
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

    expect(publish.status()).toBe(400)
    expect(await publish.text()).toContain('licencia desconocida')

    await request.delete(`/api/articles/${created.id}`, { headers: auth(admin) })
    await request.delete(`/api/media/${media.id}`, { headers: auth(admin) })
  })
})
