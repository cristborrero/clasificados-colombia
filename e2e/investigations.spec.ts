import { expect, test, type APIRequestContext } from '@playwright/test'

import { ACCOUNTS, anonymous, authHeader as auth, identity, type Session } from './support/api'

/**
 * Investigations — the guards that matter most.
 *
 * PRD Arquitectura §12: an investigation that names people cannot be published
 * without explicit legal approval. PRD Nº7 §56 adds methodology, verification
 * and authorship. This file proves each of them refuses through the REST API,
 * because PRD Nº5 §4 is clear that the backend must deny rather than the UI
 * merely hide.
 */

let counter = 0
const uniqueTitle = (label: string) => `DEMO investigacion ${label} ${Date.now()}-${counter++}`

async function fixtures(request: APIRequestContext, session: Session) {
  const [authors, people] = await Promise.all([
    request.get('/api/authors', {
      headers: auth(session),
      params: { 'where[slug][equals]': 'demo-periodista' },
    }),
    request.get('/api/people', {
      headers: auth(session),
      params: { 'where[slug][equals]': 'demo-persona' },
    }),
  ])

  const author = (await authors.json()) as { docs: Array<{ id: number | string }> }
  const person = (await people.json()) as { docs: Array<{ id: number | string }> }

  expect(author.docs[0], 'seed author must exist').toBeTruthy()
  expect(person.docs[0], 'seed person must exist').toBeTruthy()

  return { authorId: author.docs[0]!.id, personId: person.docs[0]!.id }
}

const baseInvestigation = (title: string, authorId: number | string) => ({
  title,
  authors: [authorId],
  methodology: 'Contrastamos documentos públicos y solicitudes de información.',
})

test.describe.configure({ mode: 'serial' })

test.describe('investigations · publication guards', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'HTTP-level, browser-independent')

  test('publishing without methodology is refused', async ({ baseURL }) => {
    const editor = await identity(baseURL, ACCOUNTS.editor)
    const { authorId } = await fixtures(editor.ctx, editor)

    const response = await editor.ctx.post('/api/investigations', {
      data: {
        title: uniqueTitle('sin-metodologia'),
        authors: [authorId],
        _status: 'published',
        workflow: {
          editorialStatus: 'published',
          factCheckStatus: 'verified',
          legalStatus: 'approved',
        },
      },
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)
    expect(await response.text()).toContain('metodología')

    await editor.dispose()
  })

  test('naming people makes "legal review not required" insufficient', async ({ baseURL }) => {
    // PRD Arquitectura §12. This is the rule the whole collection exists to
    // protect: without it, marking review as not required would skip the review
    // that matters most.
    const editor = await identity(baseURL, ACCOUNTS.editor)
    const { authorId, personId } = await fixtures(editor.ctx, editor)

    const response = await editor.ctx.post('/api/investigations', {
      data: {
        ...baseInvestigation(uniqueTitle('menciona-personas'), authorId),
        people: [personId],
        _status: 'published',
        workflow: {
          editorialStatus: 'published',
          factCheckStatus: 'verified',
          legalStatus: 'not_required',
        },
      },
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)
    expect(await response.text()).toContain('menciona personas')

    await editor.dispose()
  })

  test('naming people with explicit legal approval publishes', async ({ baseURL }) => {
    const editor = await identity(baseURL, ACCOUNTS.editor)
    const { authorId, personId } = await fixtures(editor.ctx, editor)

    const response = await editor.ctx.post('/api/investigations', {
      data: {
        ...baseInvestigation(uniqueTitle('aprobada'), authorId),
        people: [personId],
        _status: 'published',
        workflow: {
          editorialStatus: 'published',
          factCheckStatus: 'verified',
          legalStatus: 'approved',
        },
      },
    })

    expect(response.status()).toBe(201)

    await editor.dispose()
  })

  test('an unpublished investigation is unreachable from the internet', async ({ baseURL }) => {
    const editor = await identity(baseURL, ACCOUNTS.editor)
    const { authorId } = await fixtures(editor.ctx, editor)
    const anon = await anonymous(baseURL)

    const title = uniqueTitle('reservada')

    const created = await editor.ctx.post('/api/investigations', {
      data: {
        ...baseInvestigation(title, authorId),
        _status: 'draft',
        workflow: { editorialStatus: 'legal_review' },
      },
    })

    expect(created.status()).toBe(201)
    const { doc } = (await created.json()) as { doc: { id: number | string; slug: string } }

    const listed = (await (await anon.get('/api/investigations?limit=100')).json()) as {
      docs: Array<{ id: number | string; title?: string }>
    }

    expect(listed.docs.some((d) => d.id === doc.id)).toBe(false)
    expect(listed.docs.some((d) => d.title === title)).toBe(false)

    const direct = await anon.get(`/api/investigations/${doc.id}`)
    expect(direct.status()).toBeGreaterThanOrEqual(400)

    await Promise.all([anon.dispose(), editor.dispose()])
  })

  test('an author cannot publish an investigation', async ({ baseURL }) => {
    const author = await identity(baseURL, ACCOUNTS.author)
    const admin = await identity(baseURL, ACCOUNTS.admin)
    const { authorId } = await fixtures(admin.ctx, admin)

    const response = await author.ctx.post('/api/investigations', {
      data: {
        ...baseInvestigation(uniqueTitle('autor'), authorId),
        _status: 'published',
        workflow: {
          editorialStatus: 'published',
          factCheckStatus: 'verified',
          legalStatus: 'approved',
        },
      },
    })

    expect(response.status()).toBe(403)

    await Promise.all([author.dispose(), admin.dispose()])
  })
})
