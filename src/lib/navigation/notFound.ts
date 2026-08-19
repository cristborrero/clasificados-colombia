import { notFound, permanentRedirect, redirect } from 'next/navigation'

import { resolveRedirect } from '@/data/redirects'

/**
 * The last thing a page does when it cannot find what was asked for.
 *
 * Every route that would call `notFound()` calls this instead, because the
 * question "does this URL exist?" is not answered until the redirect table has
 * been consulted. A published slug that changed leaves a real URL behind —
 * shared, linked, indexed — and answering 404 for it discards whatever
 * authority and traffic it had earned.
 *
 * Returns `never`: `redirect`, `permanentRedirect` and `notFound` all throw, so
 * nothing after a call to this executes.
 */
export async function redirectOrNotFound(path: string): Promise<never> {
  const target = await resolveRedirect(path)

  if (target) {
    /*
     * Permanent and temporary are different promises to a crawler, and the
     * editor chose which one this is. `permanentRedirect` answers 308, which
     * preserves the request method where 301 historically did not.
     */
    if (target.permanent) permanentRedirect(target.to)

    redirect(target.to)
  }

  notFound()
}
