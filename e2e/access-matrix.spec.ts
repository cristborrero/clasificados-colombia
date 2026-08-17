import { expect, test, type APIRequestContext } from '@playwright/test'

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
 * collection-level access block: Payload's defaults applied and a reporter
 * could delete the administrator through this exact endpoint.
 *
 * Runs on chromium only — this is HTTP behaviour, and the server cannot tell
 * which browser engine is asking.
 */

const PASSWORD = 'clasificados-dev-password'

const ACCOUNTS = {
  admin: 'admin@clasificadoscolombia.test',
  editorInChief: 'editor.jefe@clasificadoscolombia.test',
  reporter: 'reportero@clasificadoscolombia.test',
  disabled: 'deshabilitado@clasificadoscolombia.test',
} as const

type Session = { token: string; id: number | string }

async function login(request: APIRequestContext, email: string): Promise<Session> {
  const response = await request.post('/api/users/login', {
    data: { email, password: PASSWORD },
  })

  expect(response.status(), `login should succeed for ${email}`).toBe(200)

  const body = (await response.json()) as { token: string; user: { id: number | string } }

  return { token: body.token, id: body.user.id }
}

const auth = (session: Session) => ({ Authorization: `JWT ${session.token}` })

async function findUserId(request: APIRequestContext, admin: Session, email: string) {
  const response = await request.get(
    `/api/users?where[email][equals]=${encodeURIComponent(email)}`,
    {
      headers: auth(admin),
    },
  )

  const body = (await response.json()) as { docs: Array<{ id: number | string }> }

  expect(body.docs.length, `admin should be able to find ${email}`).toBe(1)

  return body.docs[0]!.id
}

test.describe.configure({ mode: 'serial' })

test.describe('access matrix · users', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'HTTP-level, browser-independent')

  test('anonymous cannot list users', async ({ request }) => {
    const response = await request.get('/api/users')

    expect(response.status()).toBe(403)
  })

  test('anonymous cannot create a user', async ({ request }) => {
    const response = await request.post('/api/users', {
      data: { email: 'intruso@example.test', password: 'whatever-123456', name: 'Intruso' },
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

  test('a disabled account cannot authenticate, and is indistinguishable from a wrong password', async ({
    request,
  }) => {
    // PRD Nº5 §82 for the refusal; §86 and §130 for the indistinguishability.
    const disabled = await request.post('/api/users/login', {
      data: { email: ACCOUNTS.disabled, password: PASSWORD },
    })

    const wrongPassword = await request.post('/api/users/login', {
      data: { email: ACCOUNTS.reporter, password: 'contraseña-incorrecta' },
    })

    expect(disabled.status()).toBe(401)
    expect(wrongPassword.status()).toBe(401)
    expect(await disabled.text()).toBe(await wrongPassword.text())
  })

  test('a reporter sees only their own account, never the roster', async ({ request }) => {
    // PRD Nº7 §9 and §106: the filter is applied in the query, so the total
    // cannot leak how many accounts exist.
    const reporter = await login(request, ACCOUNTS.reporter)

    const response = await request.get('/api/users', { headers: auth(reporter) })
    const body = (await response.json()) as {
      totalDocs: number
      docs: Array<{ id: number | string }>
    }

    expect(response.status()).toBe(200)
    expect(body.totalDocs).toBe(1)
    expect(body.docs[0]?.id).toBe(reporter.id)
  })

  test('a reporter cannot read another account directly', async ({ request }) => {
    const admin = await login(request, ACCOUNTS.admin)
    const adminId = await findUserId(request, admin, ACCOUNTS.admin)
    const reporter = await login(request, ACCOUNTS.reporter)

    const response = await request.get(`/api/users/${adminId}`, { headers: auth(reporter) })

    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

  test('a reporter cannot create accounts', async ({ request }) => {
    const reporter = await login(request, ACCOUNTS.reporter)

    const response = await request.post('/api/users', {
      headers: auth(reporter),
      data: { email: 'creado.por.reportero@example.test', password: 'whatever-123456', name: 'X' },
    })

    expect(response.status()).toBe(403)
  })

  test('a reporter cannot delete the administrator', async ({ request }) => {
    // The regression this whole phase exists for. This previously returned 200
    // and removed the account.
    const admin = await login(request, ACCOUNTS.admin)
    const adminId = await findUserId(request, admin, ACCOUNTS.admin)
    const reporter = await login(request, ACCOUNTS.reporter)

    const response = await request.delete(`/api/users/${adminId}`, { headers: auth(reporter) })

    expect(response.status()).toBeGreaterThanOrEqual(400)

    // Assert survival, not just the status code: a refusal that still deletes
    // is worse than an honest failure.
    const stillThere = await request.get(`/api/users/${adminId}`, { headers: auth(admin) })
    expect(stillThere.status()).toBe(200)
  })

  test('a reporter cannot rename the administrator', async ({ request }) => {
    const admin = await login(request, ACCOUNTS.admin)
    const adminId = await findUserId(request, admin, ACCOUNTS.admin)
    const before = (await (
      await request.get(`/api/users/${adminId}`, { headers: auth(admin) })
    ).json()) as {
      name: string
    }

    const reporter = await login(request, ACCOUNTS.reporter)
    const response = await request.patch(`/api/users/${adminId}`, {
      headers: auth(reporter),
      data: { name: 'RENOMBRADO POR UN REPORTERO' },
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)

    const after = (await (
      await request.get(`/api/users/${adminId}`, { headers: auth(admin) })
    ).json()) as {
      name: string
    }
    expect(after.name).toBe(before.name)
  })

  test('a reporter cannot promote itself to administrator', async ({ request }) => {
    // PRD Nº5 §17-§18. Payload drops the forbidden field rather than rejecting
    // the request, so the status code is not the assertion — the stored role is.
    const reporter = await login(request, ACCOUNTS.reporter)

    await request.patch(`/api/users/${reporter.id}`, {
      headers: auth(reporter),
      data: { role: 'administrator' },
    })

    const after = (await (
      await request.get(`/api/users/${reporter.id}`, { headers: auth(reporter) })
    ).json()) as { role: string }

    expect(after.role).toBe('reporter')
  })

  test('a reporter cannot reactivate or change its own status', async ({ request }) => {
    const reporter = await login(request, ACCOUNTS.reporter)

    await request.patch(`/api/users/${reporter.id}`, {
      headers: auth(reporter),
      data: { status: 'suspended' },
    })

    const after = (await (
      await request.get(`/api/users/${reporter.id}`, { headers: auth(reporter) })
    ).json()) as { status: string }

    expect(after.status).toBe('active')
  })

  test('a reporter can still edit its own non-security fields', async ({ request }) => {
    // Denying everything would also be wrong. People must be able to fix their
    // own name (PRD Nº7 §9).
    const reporter = await login(request, ACCOUNTS.reporter)
    const newName = `Reportero ${Date.now()}`

    const response = await request.patch(`/api/users/${reporter.id}`, {
      headers: auth(reporter),
      data: { name: newName },
    })

    expect(response.status()).toBe(200)

    const after = (await (
      await request.get(`/api/users/${reporter.id}`, { headers: auth(reporter) })
    ).json()) as { name: string }

    expect(after.name).toBe(newName)
  })

  test('the editor in chief holds editorial authority but not account administration', async ({
    request,
  }) => {
    // PRD Nº5 §8: separation of duties. Running the newsroom is not the same
    // as handing out logins.
    const editorInChief = await login(request, ACCOUNTS.editorInChief)

    const created = await request.post('/api/users', {
      headers: auth(editorInChief),
      data: { email: 'creado.por.jefe@example.test', password: 'whatever-123456', name: 'X' },
    })

    expect(created.status()).toBe(403)

    const roster = (await (
      await request.get('/api/users', { headers: auth(editorInChief) })
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
      data: { email, password: 'whatever-123456', name: 'Cuenta temporal', role: 'contributor' },
    })
    expect(created.status()).toBe(201)

    const { doc } = (await created.json()) as { doc: { id: number | string } }

    const removed = await request.delete(`/api/users/${doc.id}`, { headers: auth(admin) })
    expect(removed.status()).toBe(200)
  })
})
