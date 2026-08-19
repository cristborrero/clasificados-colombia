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
 * F18 — the background queue.
 *
 * What has to hold: publishing never waits on a derived system, the work is not
 * forgotten when that system is down, and a job that dies leaves a record.
 *
 * The end-to-end proof is the third test. Search sync no longer happens in the
 * hook; if a published piece becomes findable, the job was written, the runner
 * picked it up and the task did its work — a chain that a mocked assertion
 * would not have exercised at all.
 */

const run = Date.now().toString(36)

/*
 * Serial, like the other API specs. Payload keeps a bounded session list per
 * user, and three workers logging in as the same editor at once evict each
 * other's tokens — which surfaces as a 403 on a perfectly legal operation.
 */
test.describe.configure({ mode: 'serial' })

async function editorialContext(
  request: APIRequestContext,
  session: Session,
): Promise<{ category: number; author: number }> {
  const [categories, authors] = await Promise.all([
    request.get('/api/categories?limit=1', { headers: auth(session) }),
    request.get('/api/authors?limit=1', { headers: auth(session) }),
  ])

  const category = ((await categories.json()) as { docs: { id: number }[] }).docs[0]
  const author = ((await authors.json()) as { docs: { id: number }[] }).docs[0]

  expect(category).toBeTruthy()
  expect(author).toBeTruthy()

  return { category: category!.id, author: author!.id }
}

async function publishArticle(
  request: APIRequestContext,
  editor: Session,
  title: string,
): Promise<number> {
  const { category, author } = await editorialContext(request, editor)

  const created = await request.post('/api/articles', {
    headers: auth(editor),
    data: { title, dek: 'Contenido ficticio de prueba.', category, authors: [author] },
  })

  expect(created.status(), await created.text()).toBe(201)

  const { doc } = (await created.json()) as { doc: { id: number } }

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

  return doc.id
}

test.describe('F18 · cola de trabajos', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'HTTP-level, browser-independent')

  test('publishing writes a search job instead of waiting for the index', async ({ request }) => {
    const admin = await login(request, ACCOUNTS.admin)
    const editor = await login(request, ACCOUNTS.editor)

    const id = await publishArticle(request, editor, `DEMO · nota que encola ${run}`)

    const jobs = await request.get(
      `/api/payload-jobs?limit=100&sort=-createdAt&where[taskSlug][equals]=syncSearch`,
      { headers: auth(admin) },
    )

    expect(jobs.status()).toBe(200)

    const body = (await jobs.json()) as {
      docs: { input?: { collection?: string; documentId?: string; version?: string } }[]
    }

    const mine = body.docs.filter(
      (job) => job.input?.collection === 'articles' && job.input?.documentId === String(id),
    )

    expect(mine.length, 'debería existir al menos un trabajo para este artículo').toBeGreaterThan(0)

    // The version is the idempotency key's third part: without it an older job
    // finishing last would overwrite a newer one in the index.
    expect(mine[0]?.input?.version).toBeTruthy()

    await request.delete(`/api/articles/${id}`, { headers: auth(admin) })
  })

  test('the queue is not public', async ({ baseURL }) => {
    const anon = await anonymous(baseURL)

    /*
     * `identity`, not `login` on the shared context. Payload sets a
     * `payload-token` cookie on login and prefers it over the `Authorization`
     * header, so authenticating as the author here would leave that cookie
     * behind and the next test would quietly run as an author — which is
     * exactly how this spec first failed, with a 403 on a create the editor is
     * plainly allowed to perform.
     */
    const author = await identity(baseURL, ACCOUNTS.author)

    // Job payloads name unpublished documents by id and collection.
    expect((await anon.get('/api/payload-jobs')).status()).toBeGreaterThanOrEqual(400)
    expect((await author.ctx.get('/api/payload-jobs')).status()).toBeGreaterThanOrEqual(400)

    await anon.dispose()
    await author.dispose()
  })

  test('a published piece becomes searchable through the queue', async ({ request }) => {
    const admin = await login(request, ACCOUNTS.admin)
    const editor = await login(request, ACCOUNTS.editor)

    const marker = `Retamosa${run}`
    const id = await publishArticle(request, editor, `DEMO · ${marker} en el presupuesto`)

    /*
     * Two waits, not one, and in this order on purpose.
     *
     * The queue is FIFO and the seed leaves a backlog of its own writes ahead of
     * this one, so a single "is it searchable yet" poll conflates "the runner
     * has not reached my job" with "my job ran and did nothing". Waiting for the
     * job first means a failure names which half broke.
     */
    let job: { completedAt?: string | null; hasError?: boolean; output?: unknown } | undefined

    for (let attempt = 0; attempt < 60 && !job?.completedAt; attempt += 1) {
      const response = await request.get(
        `/api/payload-jobs?limit=100&sort=-createdAt&where[taskSlug][equals]=syncSearch`,
        { headers: auth(admin) },
      )

      const body = (await response.json()) as {
        docs: {
          completedAt?: string | null
          hasError?: boolean
          input?: { documentId?: string; operation?: string }
          output?: unknown
        }[]
      }

      job = body.docs.find(
        (candidate) =>
          candidate.input?.documentId === String(id) &&
          candidate.input?.operation === 'upsert' &&
          Boolean(candidate.completedAt),
      )

      if (!job) await new Promise((resolve) => setTimeout(resolve, 1_000))
    }

    expect(job, 'el trabajo de indexación debería completarse').toBeTruthy()
    expect(job?.hasError, `el trabajo falló: ${JSON.stringify(job?.output)}`).toBeFalsy()

    // And only then: the index has its own asynchronous write after ours.
    let found = false

    for (let attempt = 0; attempt < 20 && !found; attempt += 1) {
      const response = await request.get(`/api/search?q=${encodeURIComponent(marker)}`)
      const body = (await response.json()) as { results?: { plainTitle?: string }[] }

      /*
       * `plainTitle`, not `title`. The shaped result splits the title into
       * highlight segments, so `title` is a structure — asserting `includes` on
       * it silently never matches, which is exactly how this test first failed
       * against an index that had the document all along.
       */
      found = (body.results ?? []).some((result) => result.plainTitle?.includes(marker))

      if (!found) await new Promise((resolve) => setTimeout(resolve, 1_000))
    }

    expect(
      found,
      `el trabajo terminó con ${JSON.stringify(job?.output)} pero el artículo no aparece en el índice`,
    ).toBe(true)

    await request.delete(`/api/articles/${id}`, { headers: auth(admin) })
  })
})
