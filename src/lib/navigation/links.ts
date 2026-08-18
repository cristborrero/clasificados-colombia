/**
 * Navigation link resolution (PRD Nº7 §83, PRD Nº8 §28).
 *
 * Pure by design: no Payload imports, no React. It takes the shape a nav link
 * has after Payload populates its relationships and answers one question —
 * where does this link point, and is it safe to render?
 *
 * The rule that matters is the last one. PRD Nº7 §83 prefers relationships over
 * typed URLs so a link follows its document through a slug change instead of
 * quietly 404ing. But a relationship can also be *unpopulated* (depth 0) or
 * point at a deleted category, and a link rendered from that resolves to
 * `/seccion/undefined`. So an unresolvable link is dropped, not rendered
 * broken.
 */

/** What a populated `categories` relationship looks like from here. */
export type LinkTarget = { slug?: string | null } | string | number | null | undefined

export type NavLinkInput = {
  label?: string | null
  linkType?: 'internal' | 'external' | null
  category?: LinkTarget
  url?: string | null
  newTab?: boolean | null
}

export type ResolvedLink = {
  label: string
  href: string
  /** Drives `target` and `rel`. */
  newTab: boolean
  /** External links get `rel="noopener"` and, where relevant, an icon. */
  external: boolean
}

/** Section pages live at /seccion/<slug> (PRD Nº8 §33). */
export const sectionPath = (slug: string): string => `/seccion/${slug}`

/**
 * Protocols allowed for a hand-typed URL.
 *
 * An editor pasting `javascript:...` into a text field is the classic route to
 * stored XSS through an `href`. React does not block it. Only http, https and
 * mailto pass; anything else is treated as unresolvable and dropped.
 */
const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:'] as const

export function isSafeExternalUrl(url: string): boolean {
  try {
    return SAFE_PROTOCOLS.includes(new URL(url).protocol as (typeof SAFE_PROTOCOLS)[number])
  } catch {
    // Not absolute. A relative path is fine as long as it is a path and not a
    // protocol-relative URL, which would leave the site without saying so.
    return url.startsWith('/') && !url.startsWith('//')
  }
}

/** Reads the slug off a relationship whether or not Payload populated it. */
export function targetSlug(target: LinkTarget): string | null {
  if (!target || typeof target !== 'object') return null

  const slug = target.slug

  return typeof slug === 'string' && slug.length > 0 ? slug : null
}

/**
 * Resolves one link, or `null` if it cannot be rendered safely.
 *
 * `null` rather than a placeholder: a menu entry that goes nowhere is worse
 * than one that is absent, because the reader spends a click finding out.
 */
export function resolveNavLink(link: NavLinkInput): ResolvedLink | null {
  const label = link.label?.trim()
  if (!label) return null

  const newTab = link.newTab === true

  if (link.linkType === 'external') {
    const url = link.url?.trim()
    if (!url || !isSafeExternalUrl(url)) return null

    return { label, href: url, newTab, external: !url.startsWith('/') }
  }

  const slug = targetSlug(link.category)
  if (!slug) return null

  return { label, href: sectionPath(slug), newTab, external: false }
}

/** Resolves a list, dropping every entry that cannot be rendered. */
export function resolveNavLinks(links: readonly NavLinkInput[] | null | undefined): ResolvedLink[] {
  if (!links) return []

  return links.map(resolveNavLink).filter((link): link is ResolvedLink => link !== null)
}

/**
 * `rel` for an anchor.
 *
 * `noopener` on every new tab, always: without it the opened page gets a live
 * `window.opener` handle back to ours.
 */
export function linkRel(link: ResolvedLink): string | undefined {
  const parts: string[] = []

  if (link.newTab) parts.push('noopener')
  if (link.external) parts.push('noreferrer')

  return parts.length > 0 ? parts.join(' ') : undefined
}
