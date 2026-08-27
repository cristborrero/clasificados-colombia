import { revalidateTag } from 'next/cache'
import type { GlobalAfterChangeHook } from 'payload'

import { globalTag, SHELL_TAG, type PublicGlobalSlug } from '@/lib/payload/tags'

/**
 * Invalidates the cache for a global when an editor saves it (PRD Nº7 §98-§99).
 *
 * §99 forbids `revalidatePath('/')` on every change. This drops exactly two
 * tags: the global's own and the shell that renders it. A typo fixed in the
 * footer no longer costs a full-site regeneration.
 *
 * Failures are swallowed on purpose. `revalidateTag` throws when it runs
 * outside a request scope — a CLI seed, a migration, a job — and the editorial
 * save must not fail because a cache hint could not be delivered. The worst
 * case is a stale shell for `GLOBAL_REVALIDATE_SECONDS`; the alternative is an
 * editor seeing their save rejected for a reason that has nothing to do with
 * their content.
 */
export const revalidateGlobal =
  (slug: PublicGlobalSlug): GlobalAfterChangeHook =>
  ({ doc }) => {
    try {
      revalidateTag(globalTag(slug), { expire: 0 })
      revalidateTag(SHELL_TAG, { expire: 0 })
    } catch {
      // See above: a cache hint is never worth failing a save over.
    }

    return doc
  }
