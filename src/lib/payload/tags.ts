/**
 * Cache tags (PRD Nº7 §98-§99).
 *
 * §99 is explicit: do not run `revalidatePath('/')` on every change. Tags are
 * how the granularity it asks for is expressed — a saved global invalidates the
 * shell and nothing else, instead of regenerating the whole site because
 * somebody fixed a typo in the footer.
 *
 * Pure strings in their own module so the hook that invalidates a tag and the
 * read that declares it cannot drift apart by a typo.
 */
export type PublicGlobalSlug = 'site-settings' | 'navigation' | 'homepage' | 'breaking-news'

export const globalTag = (slug: PublicGlobalSlug): string => `global:${slug}`

/** Everything the header and footer render. */
export const SHELL_TAG = 'site-shell'
