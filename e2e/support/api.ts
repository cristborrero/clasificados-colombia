import { expect, request as playwrightRequest, type APIRequestContext } from '@playwright/test'

/**
 * Helpers for exercising the API as specific identities.
 *
 * The reason this file exists: Payload sets a `payload-token` cookie on login,
 * and a Playwright `APIRequestContext` persists cookies across every request
 * it makes. So once a spec logs in, `request.get('/api/articles')` is no longer
 * anonymous — it carries that session.
 *
 * That produced a false result exactly where it was most dangerous: an
 * assertion that anonymous readers cannot see drafts appeared to fail, when in
 * fact the "anonymous" reader was the editor in chief. The inverse is the real
 * hazard — an anonymous-access test that silently passes because it ran before
 * any login, and stops meaning anything the day someone reorders the file.
 *
 * `anonymous()` returns a context that has never authenticated and never will.
 */

export const DEV_PASSWORD = 'clasificados-dev-password'

export const ACCOUNTS = {
  admin: 'admin@clasificadoscolombia.test',
  editorInChief: 'editor.jefe@clasificadoscolombia.test',
  reporter: 'reportero@clasificadoscolombia.test',
  disabled: 'deshabilitado@clasificadoscolombia.test',
} as const

export type Session = { token: string; id: number | string }

/** A request context with no cookies and no credentials, ever. */
export async function anonymous(baseURL: string | undefined): Promise<APIRequestContext> {
  return playwrightRequest.newContext({ baseURL })
}

/**
 * Logs in and returns the bearer token.
 *
 * Callers pass the token explicitly via `authHeader` rather than relying on the
 * cookie the context now holds, so that every request states which identity it
 * intends to be. Implicit auth is what made the bug above possible.
 */
export async function login(request: APIRequestContext, email: string): Promise<Session> {
  const response = await request.post('/api/users/login', {
    data: { email, password: DEV_PASSWORD },
  })

  expect(response.status(), `login should succeed for ${email}`).toBe(200)

  const body = (await response.json()) as { token: string; user: { id: number | string } }

  return { token: body.token, id: body.user.id }
}

export const authHeader = (session: Session) => ({ Authorization: `JWT ${session.token}` })

export type Identity = Session & { ctx: APIRequestContext; dispose: () => Promise<void> }

/**
 * A request context bound to exactly one account.
 *
 * Sharing one context across identities does not work. Payload sets a
 * `payload-token` cookie on login and prefers it over an `Authorization`
 * header, so after a second login every request speaks as the most recent
 * account no matter which token the caller attaches.
 *
 * That bit twice. First an anonymous-read assertion appeared to fail while the
 * product was correct, because the "anonymous" reader still held an editor's
 * cookie. Then a delete-refusal test failed on its follow-up check, because the
 * request meant to confirm the administrator survived was actually speaking as
 * the reporter — and got a correct 403 that looked like a missing record.
 *
 * One cookie jar per identity removes the entire class of problem.
 */
export async function identity(baseURL: string | undefined, email: string): Promise<Identity> {
  const ctx = await playwrightRequest.newContext({ baseURL })
  const session = await login(ctx, email)

  return {
    ...session,
    ctx,
    dispose: () => ctx.dispose(),
  }
}
