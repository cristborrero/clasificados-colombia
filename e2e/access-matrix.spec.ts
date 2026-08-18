import { expect, test } from '@playwright/test'

import {
  ACCOUNTS,
  anonymous,
  authHeader as auth,
  DEV_PASSWORD,
  identity,
  login,
} from './support/api'

/**
 * Access matrix — Users slice.
 *
 * PRD Nº5 §96 and §111 require this to be exercised through the API rather
 * than the admin UI, and PRD Nº5 §4 explains why: the UI may hide, the backend
 * must deny. A hidden button proves nothing.
 *
 * Every case here is the Role × Operation grid of PRD Nº5 §111 as it applies
 * to `users`. The rows that concern Articles and Evidence arrive with those
 * collections (F4, F5, F6).
 *
 * These assertions exist because the collection previously shipped without a
 * collection-level access block: Payload's defaults applied and an author
 * could delete the administrator through this exact endpoint.
 *
 * Runs on chromium only — this is HTTP behaviour, and the server cannot tell
 * which browser engine is asking.
 */

test.describe.configure({ mode: 'serial' })

test.describe('access matrix · users', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'HTTP-level, browser-independent')

  /*
   * These two use a context that has never logged in. Reusing the shared
   * `request` would let a login from an earlier test leak its session cookie
   * in, and the assertion would keep passing for the wrong reason — or stop
   * meaning anything the day someone reorders this file.
   */
  test('anonymous cannot list users', async ({ baseURL }) => {
    const anon = await anonymous(baseURL)
    const response = await anon.get('/api/users')

    expect(response.status()).toBe(403)
    await anon.dispose()
  })

  test('anonymous cannot create a user', async ({ baseURL }) => {
    const anon = await anonymous(baseURL)
    const response = await anon.post('/api/users', {
      data: { email: 'intruso@example.test', password: 'whatever-123456', name: 'Intruso' },
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)
    await anon.dispose()
  })

  test('a disabled account cannot authenticate, and is indistinguishable from a wrong password', async ({
    request,
  }) => {
    // PRD Nº5 §82 for the refusal; §86 and §130 for the indistinguishability.
    const disabled = await request.post('/api/users/login', {
      data: { email: ACCOUNTS.disabled, password: DEV_PASSWORD },
    })

    const wrongPassword = await request.post('/api/users/login', {
      data: { email: ACCOUNTS.author, password: 'contraseña-incorrecta' },
    })

    expect(disabled.status()).toBe(401)
    expect(wrongPassword.status()).toBe(401)
    expect(await disabled.text()).toBe(await wrongPassword.text())
  })

  test('an author sees only their own account, never the roster', async ({ request }) => {
    // PRD Nº7 §9 and §106: the filter is applied in the query, so the total
    // cannot leak how many accounts exist.
    const author = await login(request, ACCOUNTS.author)

    const response = await request.get('/api/users', { headers: auth(author) })
    const body = (await response.json()) as {
      totalDocs: number
      docs: Array<{ id: number | string }>
    }

    expect(response.status()).toBe(200)
    expect(body.totalDocs).toBe(1)
    expect(body.docs[0]?.id).toBe(author.id)
  })

  test('an author cannot read another account directly', async ({ baseURL }) => {
    const admin = await identity(baseURL, ACCOUNTS.admin)
    const author = await identity(baseURL, ACCOUNTS.author)

    const response = await author.ctx.get(`/api/users/${admin.id}`)

    expect(response.status()).toBeGreaterThanOrEqual(400)

    await Promise.all([admin.dispose(), author.dispose()])
  })

  test('an author cannot create accounts', async ({ request }) => {
    const author = await login(request, ACCOUNTS.author)

    const response = await request.post('/api/users', {
      headers: auth(author),
      data: { email: 'creado.por.autor@example.test', password: 'whatever-123456', name: 'X' },
    })

    expect(response.status()).toBe(403)
  })

  test('an author cannot delete the administrator', async ({ baseURL }) => {
    // The regression this whole phase exists for. This previously returned 200
    // and removed the account.
    //
    // Separate contexts per identity: a shared one would let the author's
    // cookie speak for the administrator on the survival check below.
    const admin = await identity(baseURL, ACCOUNTS.admin)
    const author = await identity(baseURL, ACCOUNTS.author)

    const response = await author.ctx.delete(`/api/users/${admin.id}`)

    expect(response.status()).toBeGreaterThanOrEqual(400)

    /*
     * Assert survival, not just the status code: a refusal that still deletes
     * is worse than an honest failure.
     *
     * Verified through a freshly authenticated context rather than the one
     * opened at the top of the test. Payload 3 tracks a session list per user,
     * and with specs running in parallel the same account accumulates logins —
     * an older token can stop being accepted, which produced a 403 here that
     * looked exactly like a deleted record.
     */
    const verifier = await identity(baseURL, ACCOUNTS.admin)
    const stillThere = await verifier.ctx.get(`/api/users/${admin.id}`)
    expect(stillThere.status()).toBe(200)

    await Promise.all([admin.dispose(), author.dispose(), verifier.dispose()])
  })

  test('an author cannot rename the administrator', async ({ baseURL }) => {
    const admin = await identity(baseURL, ACCOUNTS.admin)
    const author = await identity(baseURL, ACCOUNTS.author)

    const before = (await (await admin.ctx.get(`/api/users/${admin.id}`)).json()) as {
      name: string
    }

    const response = await author.ctx.patch(`/api/users/${admin.id}`, {
      data: { name: 'RENOMBRADO POR UN REPORTERO' },
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)

    // Fresh session for the same reason as the delete test above.
    const verifier = await identity(baseURL, ACCOUNTS.admin)
    const after = (await (await verifier.ctx.get(`/api/users/${admin.id}`)).json()) as {
      name: string
    }
    expect(after.name).toBe(before.name)

    await Promise.all([admin.dispose(), author.dispose(), verifier.dispose()])
  })

  test('an author cannot promote itself to administrator', async ({ request }) => {
    // PRD Nº5 §17-§18. Payload drops the forbidden field rather than rejecting
    // the request, so the status code is not the assertion — the stored role is.
    const author = await login(request, ACCOUNTS.author)

    await request.patch(`/api/users/${author.id}`, {
      headers: auth(author),
      data: { role: 'admin' },
    })

    const after = (await (
      await request.get(`/api/users/${author.id}`, { headers: auth(author) })
    ).json()) as { role: string }

    expect(after.role).toBe('author')
  })

  test('an author cannot reactivate or change its own status', async ({ request }) => {
    const author = await login(request, ACCOUNTS.author)

    await request.patch(`/api/users/${author.id}`, {
      headers: auth(author),
      data: { status: 'suspended' },
    })

    const after = (await (
      await request.get(`/api/users/${author.id}`, { headers: auth(author) })
    ).json()) as { status: string }

    expect(after.status).toBe('active')
  })

  test('an author can still edit its own non-security fields', async ({ request }) => {
    // Denying everything would also be wrong. People must be able to fix their
    // own name (PRD Nº7 §9).
    const author = await login(request, ACCOUNTS.author)
    const newName = `Reportero ${Date.now()}`

    const response = await request.patch(`/api/users/${author.id}`, {
      headers: auth(author),
      data: { name: newName },
    })

    expect(response.status()).toBe(200)

    const after = (await (
      await request.get(`/api/users/${author.id}`, { headers: auth(author) })
    ).json()) as { name: string }

    expect(after.name).toBe(newName)
  })

  test('the editor in chief holds editorial authority but not account administration', async ({
    request,
  }) => {
    // PRD Nº5 §8: separation of duties. Running the newsroom is not the same
    // as handing out logins.
    const editor = await login(request, ACCOUNTS.editor)

    const created = await request.post('/api/users', {
      headers: auth(editor),
      data: { email: 'creado.por.jefe@example.test', password: 'whatever-123456', name: 'X' },
    })

    expect(created.status()).toBe(403)

    const roster = (await (
      await request.get('/api/users', { headers: auth(editor) })
    ).json()) as { totalDocs: number }

    expect(roster.totalDocs).toBe(1)
  })

  test('an administrator can administer accounts', async ({ request }) => {
    const admin = await login(request, ACCOUNTS.admin)

    const roster = (await (await request.get('/api/users', { headers: auth(admin) })).json()) as {
      totalDocs: number
    }
    expect(roster.totalDocs).toBeGreaterThanOrEqual(4)

    const email = `temporal.${Date.now()}@example.test`
    const created = await request.post('/api/users', {
      headers: auth(admin),
      data: { email, password: 'whatever-123456', name: 'Cuenta temporal', role: 'author' },
    })
    expect(created.status()).toBe(201)

    const { doc } = (await created.json()) as { doc: { id: number | string } }

    const removed = await request.delete(`/api/users/${doc.id}`, { headers: auth(admin) })
    expect(removed.status()).toBe(200)
  })
})
