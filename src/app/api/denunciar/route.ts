import config from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { RateLimiter } from '@/lib/antiabuse/rateLimit'
import { verifyTurnstile } from '@/lib/antiabuse/turnstile'
import { parseTipSubmission } from '@/lib/tips/submission'

/**
 * Public tip endpoint (PRD Master §22, CLAUDE.md §66-§68).
 *
 * MOUNTED AT `/api/denunciar`, NOT `/api/tips`, and that is not cosmetic.
 * Payload serves its REST API from a catch-all at `/api/[...slug]`, so a route
 * file at `/api/tips` shadows the collection's own endpoint — which is exactly
 * what happened: editors got 405 when reading tips, because this handler only
 * exports POST and it was intercepting every request to that path. The admin
 * panel would have been broken the same way.
 *
 * The protection lives here, on the endpoint, not on the form. A form with a
 * widget and an endpoint that accepts anything is not protected — an attacker
 * does not use the form.
 *
 * Order matters and is deliberate: rate limit first, because it is free;
 * Turnstile second, because it costs a network round trip; validation third,
 * because it touches the payload; and only then a write. Doing it the other way
 * round lets an unverified caller drive our own parser and our own database.
 *
 * The `tips` collection denies `create` to everyone, including through the REST
 * API. This handler is the only writer, and it writes with `overrideAccess`
 * *after* clearing the two checks above. That is what makes "the endpoint is
 * the protection" true rather than aspirational.
 */
export const dynamic = 'force-dynamic'

/**
 * Five submissions per address per hour.
 *
 * Generous for a person with something to report, useless for a script. It is
 * in-process and does not survive a restart — the real limiter belongs at the
 * reverse proxy, and saying so plainly matters more than the number, because a
 * limiter people believe is stronger than it is ends up being the only one.
 */
const limiter = new RateLimiter({ limit: 5, windowMs: 60 * 60 * 1000, maxKeys: 5_000 })

/** Identical for every rejection, so the response never becomes an oracle. */
const rejection = (status: number, message: string, extra?: Record<string, unknown>) =>
  NextResponse.json({ ok: false, message, ...extra }, { status, headers: { 'Cache-Control': 'no-store' } })

export async function POST(request: NextRequest): Promise<NextResponse> {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  const rate = limiter.check(clientIp, Date.now())

  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, message: 'Recibimos varias denuncias desde esta conexión. Intenta más tarde.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
    )
  }

  let payloadBody: Record<string, unknown>

  try {
    const contentType = request.headers.get('content-type') ?? ''

    if (contentType.includes('application/json')) {
      payloadBody = (await request.json()) as Record<string, unknown>
    } else {
      payloadBody = Object.fromEntries(await request.formData())
    }
  } catch {
    return rejection(400, 'No pudimos leer el formulario. Intenta de nuevo.')
  }

  const turnstile = await verifyTurnstile(
    typeof payloadBody['cf-turnstile-response'] === 'string'
      ? payloadBody['cf-turnstile-response']
      : null,
    clientIp,
  )

  if (!turnstile.ok) {
    /*
     * The reason is logged, never returned. Telling a caller the difference
     * between "no token", "rejected" and "we could not reach Cloudflare" tells
     * a script exactly which knob to turn.
     */
    console.warn(`[tips] Turnstile rechazó una denuncia: ${turnstile.reason}`)

    return rejection(400, 'No pudimos verificar que eres una persona. Recarga la página e intenta de nuevo.')
  }

  const parsed = parseTipSubmission(payloadBody)

  if (!parsed.ok) {
    return rejection(422, 'Revisa los campos marcados.', { errors: parsed.errors })
  }

  try {
    const payload = await getPayload({ config })

    await payload.create({
      collection: 'tips',
      /*
       * The only place `overrideAccess` is used on a public write path, and it
       * is reached only after the rate limit, Turnstile and validation have all
       * passed. The collection denies `create` to everyone precisely so that
       * this is the only door.
       */
      overrideAccess: true,
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        location: parsed.data.location,
        anonymous: parsed.data.anonymous,
        contactName: parsed.data.contactName,
        contactEmail: parsed.data.contactEmail,
        contactPhone: parsed.data.contactPhone,
        status: 'new',
      } as never,
    })
  } catch (error) {
    // The exception never reaches the sender: it can carry a table name or a
    // query, and this is not the place to describe the database.
    console.error('[tips] No se pudo guardar una denuncia', error)

    return rejection(500, 'No pudimos guardar tu denuncia. Intenta de nuevo en unos minutos.')
  }

  return NextResponse.json(
    { ok: true, message: 'Recibimos tu denuncia.' },
    { status: 201, headers: { 'Cache-Control': 'no-store' } },
  )
}
