import { resolveBreakingNews, type ActiveBreakingNews, type BreakingNewsInput } from '@/lib/breaking/active'
import { resolveNavLinks, type NavLinkInput, type ResolvedLink } from '@/lib/navigation/links'
import { readGlobal } from '@/lib/payload/client'

/**
 * Site-wide data: navigation, settings, breaking news.
 *
 * Every function tolerates the global never having been saved. A fresh install
 * has no `navigation` document, and the site has to be deployable before it is
 * configured — not 500 until someone opens the admin panel.
 */

export type SiteNavigation = {
  primary: ResolvedLink[]
  secondary: ResolvedLink[]
  footer: { title: string; links: ResolvedLink[] }[]
  social: { platform: string; url: string }[]
}

type NavigationGlobal = {
  primary?: NavLinkInput[] | null
  secondary?: NavLinkInput[] | null
  footer?: { title?: string | null; links?: NavLinkInput[] | null }[] | null
  social?: { platform?: string | null; url?: string | null }[] | null
}

export async function getNavigation(): Promise<SiteNavigation> {
  const navigation = await readGlobal<NavigationGlobal>('navigation')

  return {
    primary: resolveNavLinks(navigation?.primary),
    secondary: resolveNavLinks(navigation?.secondary),
    footer: (navigation?.footer ?? [])
      .map((column) => ({
        title: column.title?.trim() ?? '',
        links: resolveNavLinks(column.links),
      }))
      .filter((column) => column.title.length > 0),
    social: (navigation?.social ?? []).filter(
      (item): item is { platform: string; url: string } =>
        typeof item.platform === 'string' &&
        item.platform.length > 0 &&
        typeof item.url === 'string' &&
        item.url.length > 0,
    ),
  }
}

export type SiteSettings = {
  siteName: string
  siteDescription: string | null
  contact: { email: string | null; phone: string | null; address: string | null }
}

type SettingsGlobal = {
  siteName?: string | null
  siteDescription?: string | null
  contact?: { email?: string | null; phone?: string | null; address?: string | null } | null
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await readGlobal<SettingsGlobal>('site-settings')

  return {
    // Falls back rather than rendering an empty header: the name of the outlet
    // is not a configurable optional.
    siteName: settings?.siteName?.trim() || 'Clasificados Colombia',
    siteDescription: settings?.siteDescription?.trim() || null,
    contact: {
      email: settings?.contact?.email?.trim() || null,
      phone: settings?.contact?.phone?.trim() || null,
      address: settings?.contact?.address?.trim() || null,
    },
  }
}

export type BreakingNews = { news: ActiveBreakingNews; href: string | null } | null

type BreakingGlobal = BreakingNewsInput & {
  relatedArticle?: { slug?: string | null } | string | number | null
}

/** `now` is an argument so the visibility window stays testable. */
export async function getBreakingNews(now: Date = new Date()): Promise<BreakingNews> {
  const global = await readGlobal<BreakingGlobal>('breaking-news')
  const news = resolveBreakingNews(global, now)

  if (!news) return null

  const related = global?.relatedArticle
  const slug =
    related && typeof related === 'object' && typeof related.slug === 'string' ? related.slug : null

  return { news, href: slug ? `/${slug}` : null }
}
