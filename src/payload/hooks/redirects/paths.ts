import type { PayloadRequest } from 'payload'

import { articlePath } from '@/lib/routes'

/**
 * Path builders for the automatic redirect hook.
 *
 * They live beside the hook rather than inside each collection because an
 * article's URL is not derivable from its slug: it contains the category, and
 * the category arrives as an id about as often as it arrives populated.
 *
 * Every path ultimately comes from `@/lib/routes`, which is the point — a
 * redirect that disagreed with the router would send readers to a 404 while
 * reporting success.
 */

/**
 * Resolves a category reference to its slug, whatever shape it arrives in.
 *
 * Returns `null` rather than guessing. A redirect built without the category
 * would be `/undefined/slug`, which is worse than no redirect: it is a URL that
 * looks deliberate.
 */
async function categorySlugOf(value: unknown, req: PayloadRequest): Promise<string | null> {
  if (value === null || value === undefined) return null

  if (typeof value === 'object') {
    const slug = (value as { slug?: unknown }).slug
    if (typeof slug === 'string' && slug !== '') return slug

    const id = (value as { id?: unknown }).id
    if (id !== undefined) return categorySlugOf(id, req)

    return null
  }

  if (typeof value !== 'string' && typeof value !== 'number') return null

  try {
    const category = await req.payload.findByID({
      collection: 'categories',
      id: value,
      depth: 0,
      overrideAccess: true,
      disableErrors: true,
      req,
    })

    return category?.slug ?? null
  } catch {
    return null
  }
}

/** `/{categoria}/{slug}` — the shape the router actually serves. */
export async function articleRedirectPath(
  slug: string,
  doc: Record<string, unknown>,
  req: PayloadRequest,
): Promise<string> {
  const category = await categorySlugOf(doc.category, req)

  // Empty string tells the hook to write nothing. See `createSlugRedirect`.
  return category ? articlePath(category, slug) : ''
}
