import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  PayloadRequest,
} from 'payload'

/**
 * Keeps published URLs alive when a slug changes (PRD SEO §15, PRD Nº7 §24).
 *
 * Two hooks that work together:
 *
 *   `lockSlugOnPublish`   sets `slugLocked` the first time a piece goes public
 *   `createSlugRedirect`  writes a permanent redirect when a locked slug moves
 *
 * The lock is what makes the redirect meaningful. Before first publication a
 * slug is still a draft decision and can change freely; afterwards it is an
 * address other people have written down.
 */

type SluggedDoc = {
  id: string | number
  slug?: string
  slugLocked?: boolean
  _status?: 'draft' | 'published'
}

/**
 * Marks the slug as locked once the piece is publicly visible.
 *
 * Uses `_status` rather than `editorialStatus` on purpose: per ADR-001,
 * `_status` is what actually determines whether anyone outside could have seen
 * — and therefore written down — this URL.
 */
export const lockSlugOnPublish: CollectionBeforeChangeHook = ({ data }) => {
  const incoming = data as SluggedDoc

  if (incoming._status === 'published' && !incoming.slugLocked) {
    return { ...data, slugLocked: true }
  }

  return data
}

export type SlugRedirectOptions = {
  /**
   * Builds the public path for a slug.
   *
   * Passed in rather than derived, because the same slug means different URLs
   * per collection — `/politica/x` and `/investigacion/x` — and this hook has
   * no business knowing the route table.
   *
   * It receives the document too, and may be async. An article's URL contains
   * its category, which is not derivable from the slug: a builder that ignored
   * the document would write a redirect from a URL shape the site does not
   * serve, to another one it does not serve either — a redirect that is wrong
   * at both ends and reports no error.
   */
  buildPath: (
    slug: string,
    doc: Record<string, unknown>,
    req: PayloadRequest,
  ) => Promise<string> | string
}

/**
 * Creates a redirect when a previously published slug changes.
 *
 * Runs in `afterChange` because the new value must already be committed: a
 * redirect pointing at a URL that a later validation error rolled back would
 * send readers to a 404 (PRD Nº7 §91).
 *
 * Never blocks the write. PRD Nº7 §168 classifies this kind of work as
 * non-critical — losing a redirect is a problem worth logging and repairing,
 * not a reason to refuse an editor's correction.
 */
export function createSlugRedirect({ buildPath }: SlugRedirectOptions): CollectionAfterChangeHook {
  return async ({ doc, previousDoc, req, operation }) => {
    if (operation !== 'update') return doc

    const current = doc as SluggedDoc
    const previous = previousDoc as SluggedDoc | undefined

    const previousSlug = previous?.slug
    const currentSlug = current.slug

    if (!previousSlug || !currentSlug || previousSlug === currentSlug) return doc

    // Only URLs that were actually reachable deserve a redirect. A slug that
    // changed twice before first publication never had an audience.
    if (!previous?.slugLocked) return doc

    const [from, to] = await Promise.all([
      buildPath(previousSlug, previousDoc as Record<string, unknown>, req),
      buildPath(currentSlug, doc as Record<string, unknown>, req),
    ])

    /*
     * A builder that cannot resolve a path says so by returning an empty
     * string, and no redirect is written. Recording one from `/` or to `/` is
     * worse than recording none: the first shadows the homepage, the second
     * sends a reader looking for one article to the front page as if that were
     * the same thing.
     */
    if (!from || !to || from === to) return doc

    try {
      const existing = await req.payload.find({
        collection: 'redirects',
        where: { from: { equals: from } },
        limit: 1,
        overrideAccess: true,
        req,
      })

      if (existing.totalDocs > 0) {
        // The old address already redirects somewhere. Repoint it rather than
        // leaving readers on a stale hop or violating the uniqueness of `from`.
        const first = existing.docs[0]
        if (first) {
          await req.payload.update({
            collection: 'redirects',
            id: first.id,
            data: { to, active: true },
            overrideAccess: true,
            req,
          })
        }

        return doc
      }

      await req.payload.create({
        collection: 'redirects',
        data: {
          from,
          to,
          statusCode: '308',
          reason: 'Cambio de slug en contenido publicado',
          active: true,
          automatic: true,
        },
        overrideAccess: true,
        req,
      })
    } catch (error) {
      req.payload.logger.error(
        { err: error, from, to },
        'No se pudo crear el redirect automático tras cambiar un slug publicado',
      )
    }

    return doc
  }
}
