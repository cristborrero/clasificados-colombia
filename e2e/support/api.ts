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

/**
 * Seeded accounts, one per role (PRD Master §23).
 *
 * Renamed on 2026-08-18 with the move from nine roles to three. `author` is the
 * least-privileged role and therefore the one most of the denial assertions
 * speak as: a rule that holds for an author is the rule that matters.
 */
export const ACCOUNTS = {
  admin: 'admin@clasificadoscolombia.test',
  editor: 'editor@clasificadoscolombia.test',
  author: 'autor@clasificadoscolombia.test',
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
/**
 * Sessions, memoised per account for the lifetime of the worker.
 *
 * Payload 3 keeps a bounded list of sessions per user and evicts the oldest
 * when it fills. Logging in once per test blew through that: the suite made
 * sixteen sessions for the same two accounts, and a token minted early stopped
 * being accepted while the test holding it was still running. The failure
 * surfaced as "You are not allowed to perform this action" on an operation that
 * was perfectly legal — which sends you looking at access control instead of at
 * session bookkeeping.
 *
 * One session per account per worker fixes it and is also closer to how a real
 * client behaves. Tests that specifically need a fresh session — the ones
 * verifying that a deleted or renamed account is really gone — use `identity`,
 * which always authenticates anew in its own context.
 */
const sessions = new Map<string, Promise<Session>>()

async function authenticate(request: APIRequestContext, email: string): Promise<Session> {
  const response = await request.post('/api/users/login', {
    data: { email, password: DEV_PASSWORD },
  })

  expect(response.status(), `login should succeed for ${email}`).toBe(200)

  const body = (await response.json()) as { token: string; user: { id: number | string } }

  return { token: body.token, id: body.user.id }
}

export async function login(request: APIRequestContext, email: string): Promise<Session> {
  const existing = sessions.get(email)
  if (existing) return existing

  // The promise is cached, not the result, so concurrent callers share one
  // in-flight login rather than racing to create two sessions.
  const pending = authenticate(request, email)
  sessions.set(email, pending)

  try {
    return await pending
  } catch (error) {
    sessions.delete(email)
    throw error
  }
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
  /*
   * Authenticate once, then hand the token to a fresh context as a header.
   *
   * The obvious version — a new context that logs in for itself — mints a new
   * Payload session on every call, and Payload keeps a bounded list per user.
   * With several specs each building two or three identities, tokens issued
   * early stopped being accepted while the tests holding them were still
   * running. The failure reads as a permissions bug: 403 on an operation the
   * role is plainly allowed to perform.
   *
   * The equally obvious fix — reuse the memoised token — breaks differently:
   * `login` no longer POSTs inside the new context, so that context never
   * receives the `payload-token` cookie and every request goes out
   * unauthenticated. That is the 403 this comment was written after.
   *
   * So: one session per account, carried explicitly. The context stays
   * isolated, which is the point of `identity` — a shared context lets one
   * account's cookie answer for another, and a test meant to prove the
   * administrator survived a deletion attempt ends up asking as the attacker.
   * A fresh context has no cookie, so the header is unambiguous.
   */
  const session = await login(await sharedContext(baseURL), email)

  const ctx = await playwrightRequest.newContext({
    baseURL,
    extraHTTPHeaders: { Authorization: `JWT ${session.token}` },
  })

  return {
    ...session,
    ctx,
    dispose: () => ctx.dispose(),
  }
}

/**
 * One context per worker used solely to perform logins.
 *
 * Kept apart from the identity contexts so that the cookie a login sets never
 * lands in a context a test is about to make assertions with.
 */
let loginContext: Promise<APIRequestContext> | null = null

function sharedContext(baseURL: string | undefined): Promise<APIRequestContext> {
  loginContext ??= playwrightRequest.newContext({ baseURL })

  return loginContext
}
