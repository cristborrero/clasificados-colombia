import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload, type Payload } from 'payload'
import { cache } from 'react'

import { globalTag, SHELL_TAG, type PublicGlobalSlug } from './tags'

/**
 * Payload access for Server Components (PRD Master §291).
 *
 * The Local API, not `fetch('/api/...')`. Payload runs inside this Next process
 * — an HTTP round trip to ourselves would serialise, cross the loopback and
 * deserialise for data already sitting in the same heap.
 *
 * `cache` deduplicates within a single render pass: the header, the footer and
 * the page all ask for the client and all get the same instance.
 */
export const getPayloadClient = cache(async (): Promise<Payload> => getPayload({ config }))

/**
 * How long a cached global may be stale.
 *
 * An editor saving a global invalidates its tag immediately, so this is not the
 * path that matters for edits. It exists for the one transition no hook can
 * fire on: the breaking-news bar reaching its `expiresAt`. Nothing is saved at
 * that instant — the clock simply passes it — so without a time bound, a
 * statically rendered page would keep showing an expired emergency, which is
 * precisely the failure the mandatory expiry exists to prevent.
 */
const GLOBAL_REVALIDATE_SECONDS = 60

/**
 * Reads a public global, cached and tagged.
 *
 * Returns `null` instead of throwing when the global has never been saved. A
 * brand-new install has no `navigation` document, and the header must still
 * render — a site that 500s until someone opens the admin panel is a site that
 * cannot be deployed before it is configured.
 *
 * CACHE SAFETY: the cache key is the slug alone, with no user in it. That is
 * only sound because all three of these globals declare `read: () => true` —
 * every reader gets the same document, so there is nothing to leak between
 * them. The `PublicGlobalSlug` union is the guard: it is deliberately a closed
 * set, so a global with per-user read rules cannot be added to this path
 * without changing the type. If one ever needs to be, it does not belong here.
 */
export async function readGlobal<T>(slug: PublicGlobalSlug): Promise<T | null> {
  const read = unstable_cache(
    async () => {
      try {
        const payload = await getPayloadClient()

        return await payload.findGlobal({ slug, depth: 1, overrideAccess: false })
      } catch {
        return null
      }
    },
    ['global', slug],
    { tags: [globalTag(slug), SHELL_TAG], revalidate: GLOBAL_REVALIDATE_SECONDS },
  )

  return (await read()) as T | null
}
