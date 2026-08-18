/**
 * Third-party embed resolution (PRD Nº8 §151).
 *
 * Pure: takes what an editor pasted and answers whether it can be embedded and
 * from where. No React, no DOM.
 *
 * The allowlist is the point. An editor pastes a URL into a text field, and
 * without this the value goes straight into an `iframe src` — an
 * arbitrary-origin frame inside the page, chosen by whoever can edit an
 * article. Each provider is matched against its own hosts, and anything else is
 * refused.
 */
export const EMBED_PROVIDERS = ['youtube', 'x', 'instagram', 'tiktok'] as const

export type EmbedProvider = (typeof EMBED_PROVIDERS)[number]

const HOSTS: Record<EmbedProvider, readonly string[]> = {
  youtube: ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'],
  x: ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'],
  instagram: ['instagram.com', 'www.instagram.com'],
  tiktok: ['tiktok.com', 'www.tiktok.com'],
}

export const PROVIDER_LABEL: Record<EmbedProvider, string> = {
  youtube: 'YouTube',
  x: 'X',
  instagram: 'Instagram',
  tiktok: 'TikTok',
}

export function isEmbedProvider(value: unknown): value is EmbedProvider {
  return typeof value === 'string' && (EMBED_PROVIDERS as readonly string[]).includes(value)
}

function parseHttpUrl(url: string): URL | null {
  try {
    const parsed = new URL(url)

    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed : null
  } catch {
    return null
  }
}

/** The YouTube video id, or `null` if this is not a recognisable video URL. */
export function youtubeVideoId(url: string): string | null {
  const parsed = parseHttpUrl(url)
  if (!parsed || !HOSTS.youtube.includes(parsed.hostname)) return null

  const id =
    parsed.hostname === 'youtu.be'
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get('v') ?? parsed.pathname.replace(/^\/(embed|shorts)\//, ''))

  // Video ids are 11 characters of the URL-safe alphabet. Anything else is a
  // channel page, a playlist, or something that should not become a frame.
  return /^[\w-]{11}$/.test(id) ? id : null
}

export type ResolvedEmbed =
  | { kind: 'iframe'; src: string; title: string }
  | { kind: 'link'; href: string; label: string }

/**
 * What to render for an embed.
 *
 * Only YouTube resolves to a frame. The others resolve to a link, deliberately:
 * X, Instagram and TikTok embeds require the platform's own script, which reads
 * and writes cookies for every reader who loads the page — including readers of
 * an investigation, whose interest in it is exactly the kind of thing this
 * platform exists not to hand over. A link costs a click and leaks nothing.
 *
 * `youtube-nocookie.com` for the same reason: it is the domain that does not
 * set tracking cookies until playback starts.
 */
export function resolveEmbed(provider: EmbedProvider, url: string): ResolvedEmbed | null {
  const parsed = parseHttpUrl(url)
  if (!parsed || !HOSTS[provider].includes(parsed.hostname)) return null

  if (provider === 'youtube') {
    const id = youtubeVideoId(url)
    if (!id) return null

    return {
      kind: 'iframe',
      src: `https://www.youtube-nocookie.com/embed/${id}`,
      title: 'Video de YouTube',
    }
  }

  return { kind: 'link', href: parsed.toString(), label: PROVIDER_LABEL[provider] }
}
