/**
 * Cloudflare Turnstile verification (PRD Master §22, CLAUDE.md §68).
 *
 * Pure adapter: takes a token and answers whether Cloudflare accepts it.
 *
 * The rule this exists to serve is that protection belongs on the *endpoint*,
 * not on the form. A form with a widget and an endpoint that accepts anything
 * is not protected — the attacker does not use the form.
 *
 * Behaviour when unconfigured is a deliberate choice, and it goes the strict
 * way: if `TURNSTILE_SECRET_KEY` is absent, verification fails. The convenient
 * alternative — treat "no key" as "no check" — means a deploy that forgot the
 * environment variable silently ships an open endpoint, and nothing looks
 * wrong. Development uses Cloudflare's published test keys, which always pass.
 */
export type TurnstileOutcome =
  | { ok: true }
  | { ok: false; reason: 'unconfigured' | 'missing-token' | 'rejected' | 'unreachable' }

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

const TIMEOUT_MS = 5_000

export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileOutcome> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) return { ok: false, reason: 'unconfigured' }
  if (!token) return { ok: false, reason: 'missing-token' }

  const body = new URLSearchParams({ secret, response: token })
  if (remoteIp) body.set('remoteip', remoteIp)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      signal: controller.signal,
      cache: 'no-store',
    })

    if (!response.ok) return { ok: false, reason: 'unreachable' }

    const result = (await response.json()) as { success?: boolean }

    return result.success === true ? { ok: true } : { ok: false, reason: 'rejected' }
  } catch {
    /*
     * Cloudflare being unreachable fails closed, which costs a legitimate
     * sender their submission during an outage. That is the right side to err
     * on here: an open tip endpoint is a spam vector aimed at the inbox the
     * newsroom uses to receive sources.
     */
    return { ok: false, reason: 'unreachable' }
  } finally {
    clearTimeout(timer)
  }
}
