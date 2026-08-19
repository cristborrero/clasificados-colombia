import { getPayloadClient } from '@/lib/payload/client'
import { normalisePath } from '@/lib/routes'

/**
 * Redirect resolution (PRD Nº7 §80, PRD SEO §16, F17).
 *
 * The `redirects` collection was already being written — `createSlugRedirect`
 * records a row every time a published slug changes — but nothing read it, so
 * the old URL answered 404 anyway. A row nobody consults is not a redirect; it
 * is a note about one.
 *
 * Resolution happens on the way to a 404 rather than in middleware. The lookup
 * then costs nothing on a request that finds its page, which is almost all of
 * them, and everything that would have to be resolved is already being resolved
 * — the alternative is a database query in front of every request on the site
 * to serve the handful that need one.
 */

export type ResolvedRedirect = {
  to: string
  permanent: boolean
}

/**
 * `true` for the codes that pass authority to the new URL.
 *
 * The distinction is not cosmetic: a temporary redirect tells a crawler to keep
 * the old URL and re-check it, so using one for a permanent editorial move
 * leaves the ranking behind on a URL that no longer serves anything.
 */
function isPermanent(statusCode: unknown): boolean {
  return statusCode === '301' || statusCode === '308'
}

export async function resolveRedirect(path: string): Promise<ResolvedRedirect | null> {
  const from = normalisePath(path)

  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'redirects',
    where: {
      and: [{ from: { equals: from } }, { active: { equals: true } }],
    },
    limit: 1,
    depth: 0,
    pagination: false,
  })

  const redirect = result.docs[0]

  if (!redirect?.to) return null

  /*
   * A redirect pointing at itself is refused rather than followed. It is a
   * data-entry mistake that would otherwise become an infinite loop in the
   * reader's browser, and the honest answer for a URL with no destination is
   * the 404 the caller was already about to send.
   */
  if (normalisePath(redirect.to) === from) return null

  return { to: redirect.to, permanent: isPermanent(redirect.statusCode) }
}
