import { expect, test, type APIRequestContext } from '@playwright/test'

import {
  ACCOUNTS,
  anonymous,
  authHeader as auth,
  identity,
  login,
  type Session,
} from './support/api'

/**
 * ADR-001 verification, through the REST API.
 *
 * These are the five tests the ADR lists as the condition for considering the
 * invariant implemented. The ADR says which one actually matters:
 *
 *   "El punto 4 es el que importa de verdad: es la afirmación de que ninguna
 *    investigación en revisión legal es alcanzable desde Internet."
 *
 * Exercised over HTTP rather than through the Local API on purpose. PRD Nº5 §21
 * requires an invalid transition to be rejected "incluso vía REST", and a guard
 * that only holds when called politely from inside the process is not a guard.
 */

async function referenceIds(request: APIRequestContext, session: Session) {
  // See the note in access-matrix.spec.ts: bracketed query syntax must be
  // encoded, or it matches nothing without complaining.
  const [categories, authors] = await Promise.all([
    request.get('/api/categories', {
      headers: auth(session),
      params: { 'where[slug][equals]': 'demo-politica' },
    }),
    request.get('/api/authors', {
      headers: auth(session),
      params: { 'where[slug][equals]': 'demo-periodista' },
    }),
  ])

  const category = (await categories.json()) as { docs: Array<{ id: number | string }> }
  const author = (await authors.json()) as { docs: Array<{ id: number | string }> }

  expect(category.docs[0], 'seed category must exist').toBeTruthy()
  expect(author.docs[0], 'seed author must exist').toBeTruthy()

  return { categoryId: category.docs[0]!.id, authorId: author.docs[0]!.id }
}

let counter = 0
const uniqueTitle = (label: string) => `DEMO ${label} ${Date.now()}-${counter++}`

test.describe.configure({ mode: 'serial' })

test.describe('ADR-001 · editorial status contract', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'HTTP-level, browser-independent')

  test('1 · publishing a draft is rejected by the API, not merely hidden in the admin', async ({
    request,
  }) => {
    const editor = await login(request, ACCOUNTS.editorInChief)
    const { categoryId, authorId } = await referenceIds(request, editor)

    const response = await request.post('/api/articles', {
      headers: auth(editor),
      data: {
        title: uniqueTitle('rule-1'),
        category: categoryId,
        authors: [authorId],
        contentType: 'news',
        _status: 'published',
        workflow: { editorialStatus: 'draft' },
      },
    })

    // Rule 1 of the invariant.
    expect(response.status()).toBeGreaterThanOrEqual(400)
    expect(await response.text()).toContain('estado editorial')
  })

  test('1b · a piece in legal review cannot be made public', async ({ request }) => {
    // The case the ADR was written for.
    const editor = await login(request, ACCOUNTS.editorInChief)
    const { categoryId, authorId } = await referenceIds(request, editor)

    const response = await request.post('/api/articles', {
      headers: auth(editor),
      data: {
        title: uniqueTitle('legal-review'),
        category: categoryId,
        authors: [authorId],
        contentType: 'news',
        _status: 'published',
        workflow: { editorialStatus: 'legal_review' },
      },
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

  test('2 · editorially published content cannot stay hidden', async ({ request }) => {
    const editor = await login(request, ACCOUNTS.editorInChief)
    const { categoryId, authorId } = await referenceIds(request, editor)

    const response = await request.post('/api/articles', {
      headers: auth(editor),
      data: {
        title: uniqueTitle('rule-2'),
        category: categoryId,
        authors: [authorId],
        contentType: 'news',
        _status: 'draft',
        workflow: { editorialStatus: 'published' },
      },
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

  test('3 · a reporter cannot publish, even setting both fields at once', async ({ baseURL }) => {
    // PRD Nº7 §49 restricts publication to editor and editor in chief. The
    // reporter here supplies a fully coherent pair, so only the role check can
    // stop it.
    // Two identities, two contexts — see the note in support/api.ts.
    const reporter = await identity(baseURL, ACCOUNTS.reporter)
    const admin = await identity(baseURL, ACCOUNTS.admin)
    const { categoryId, authorId } = await referenceIds(admin.ctx, admin)

    const response = await reporter.ctx.post('/api/articles', {
      data: {
        title: uniqueTitle('rule-3'),
        category: categoryId,
        authors: [authorId],
        contentType: 'news',
        _status: 'published',
        workflow: {
          editorialStatus: 'published',
          factCheckStatus: 'verified',
          legalStatus: 'approved',
        },
      },
    })

    expect(response.status()).toBe(403)
  })

  test('3b · an administrator cannot publish either — separation of duties', async ({
    request,
  }) => {
    // PRD Nº5 §8. Running the servers does not confer the right to put
    // something on the front page.
    const admin = await login(request, ACCOUNTS.admin)
    const { categoryId, authorId } = await referenceIds(request, admin)

    const response = await request.post('/api/articles', {
      headers: auth(admin),
      data: {
        title: uniqueTitle('admin-publish'),
        category: categoryId,
        authors: [authorId],
        contentType: 'news',
        _status: 'published',
        workflow: {
          editorialStatus: 'published',
          factCheckStatus: 'verified',
          legalStatus: 'approved',
        },
      },
    })

    expect(response.status()).toBe(403)
  })

  test('4 · an anonymous reader never receives a draft, whatever its editorial status', async ({
    request,
    baseURL,
  }) => {
    // THE test. Everything else in this file exists to make this one true.
    //
    // The reads below go through a context that has never authenticated. Using
    // the same `request` would carry the editor's session cookie from the login
    // above — which is precisely how this assertion first appeared to fail
    // while the product was behaving correctly.
    const anon = await anonymous(baseURL)
    const editor = await login(request, ACCOUNTS.editorInChief)
    const { categoryId, authorId } = await referenceIds(request, editor)

    const title = uniqueTitle('unpublished')

    const created = await request.post('/api/articles', {
      headers: auth(editor),
      data: {
        title,
        category: categoryId,
        authors: [authorId],
        contentType: 'news',
        _status: 'draft',
        workflow: { editorialStatus: 'legal_review' },
      },
    })

    expect(created.status()).toBe(201)
    const { doc } = (await created.json()) as { doc: { id: number | string; slug: string } }

    // Anonymous listing must not contain it, and must not count it.
    const list = await anon.get('/api/articles?limit=100')
    expect(list.status()).toBe(200)

    const listed = (await list.json()) as {
      docs: Array<{ id: number | string; title?: string }>
    }

    expect(listed.docs.some((d) => d.id === doc.id)).toBe(false)
    expect(listed.docs.some((d) => d.title === title)).toBe(false)

    // Nor may it be fetched directly by anyone who guesses the id.
    const direct = await anon.get(`/api/articles/${doc.id}`)
    expect(direct.status()).toBeGreaterThanOrEqual(400)

    // Nor found by searching for its slug.
    const bySlug = await anon.get('/api/articles', {
      params: { 'where[slug][equals]': doc.slug },
    })
    const slugResult = (await bySlug.json()) as { totalDocs: number }
    expect(slugResult.totalDocs).toBe(0)

    await anon.dispose()
  })

  test('5 · a valid publication succeeds and becomes publicly readable', async ({
    request,
    baseURL,
  }) => {
    // The contract must not be so tight that nothing can be published.
    const anon = await anonymous(baseURL)
    const editor = await login(request, ACCOUNTS.editorInChief)
    const { categoryId, authorId } = await referenceIds(request, editor)

    const title = uniqueTitle('published')

    const created = await request.post('/api/articles', {
      headers: auth(editor),
      data: {
        title,
        category: categoryId,
        authors: [authorId],
        contentType: 'news',
        _status: 'published',
        workflow: {
          editorialStatus: 'published',
          factCheckStatus: 'verified',
          legalStatus: 'approved',
        },
      },
    })

    expect(created.status()).toBe(201)
    const { doc } = (await created.json()) as {
      doc: { id: number | string; publication?: { firstPublishedAt?: string } }
    }

    // firstPublishedAt is stamped on first publication (PRD Nº7 §36).
    expect(doc.publication?.firstPublishedAt).toBeTruthy()

    const publiclyVisible = await anon.get(`/api/articles/${doc.id}`)
    expect(publiclyVisible.status()).toBe(200)

    await anon.dispose()
  })

  test('6 · publishing is refused while fact checking is unfinished', async ({ request }) => {
    const editor = await login(request, ACCOUNTS.editorInChief)
    const { categoryId, authorId } = await referenceIds(request, editor)

    const response = await request.post('/api/articles', {
      headers: auth(editor),
      data: {
        title: uniqueTitle('unverified'),
        category: categoryId,
        authors: [authorId],
        contentType: 'news',
        _status: 'published',
        workflow: {
          editorialStatus: 'published',
          factCheckStatus: 'in_progress',
          legalStatus: 'approved',
        },
      },
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)
    expect(await response.text()).toContain('verificación')
  })

  test('7 · an invalid workflow transition is refused', async ({ request }) => {
    // PRD Nº5 §21-§22: draft → published is not a legal move; publication is
    // reachable only from approved or scheduled.
    const editor = await login(request, ACCOUNTS.editorInChief)
    const { categoryId, authorId } = await referenceIds(request, editor)

    const created = await request.post('/api/articles', {
      headers: auth(editor),
      data: {
        title: uniqueTitle('transition'),
        category: categoryId,
        authors: [authorId],
        contentType: 'news',
        _status: 'draft',
        workflow: { editorialStatus: 'draft' },
      },
    })

    expect(created.status()).toBe(201)
    const { doc } = (await created.json()) as { doc: { id: number | string } }

    const jumped = await request.patch(`/api/articles/${doc.id}`, {
      headers: auth(editor),
      data: {
        _status: 'published',
        workflow: { editorialStatus: 'published', factCheckStatus: 'verified' },
      },
    })

    expect(jumped.status()).toBeGreaterThanOrEqual(400)
    expect(await jumped.text()).toContain('Transición no permitida')
  })
})
