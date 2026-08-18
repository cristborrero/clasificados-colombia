import { Metadata } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'
import { isEmbedProvider, resolveEmbed, PROVIDER_LABEL } from '@/lib/embeds/providers'

/**
 * Third-party embed (PRD Nº8 §151).
 *
 * Server-rendered and script-free. The resolution rules live in
 * `lib/embeds/providers.ts`; what this file adds is the decision to render a
 * link where a frame would require the platform's own JavaScript.
 *
 * That decision is a source-protection one before it is a performance one. An
 * X or Instagram embed loads their script on page load, which tells them who
 * read which investigation — on a platform whose readers may have reason not to
 * want that recorded. A link costs the reader one click and tells nobody
 * anything until they take it.
 *
 * The YouTube frame is `loading="lazy"` and points at `youtube-nocookie.com`,
 * so nothing is requested until it scrolls into view and no tracking cookie is
 * set until playback starts.
 */
export type EmbedBlockProps = {
  provider: string
  url: string
  caption?: string | null
  className?: string
}

export function EmbedBlock({ provider, url, caption, className }: EmbedBlockProps) {
  if (!isEmbedProvider(provider)) return null

  const embed = resolveEmbed(provider, url)

  // An unresolvable embed renders nothing rather than an empty frame or a
  // broken box. The URL did not match the platform it claimed to be from.
  if (!embed) return null

  return (
    <figure className={cn('my-10 flex flex-col gap-2', className)}>
      {embed.kind === 'iframe' ? (
        <div className="aspect-video w-full bg-[var(--color-surface-sunken)]">
          <iframe
            src={embed.src}
            title={caption || embed.title}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      ) : (
        <a
          href={embed.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex flex-col gap-1 border border-[var(--color-border)] p-5',
            'no-underline hover:bg-[var(--color-surface-sunken)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
          )}
        >
          <span className="font-[family-name:var(--font-sans)] text-[length:var(--text-label)] tracking-[var(--text-label--letter-spacing)] text-[color:var(--color-text-muted)] uppercase">
            {PROVIDER_LABEL[provider]}
          </span>
          <span className="font-[family-name:var(--font-sans)] font-semibold underline underline-offset-4">
            {caption || `Ver publicación en ${embed.label}`}
          </span>
        </a>
      )}

      {caption && embed.kind === 'iframe' ? (
        <figcaption>
          <Metadata as="span" className="block text-[color:var(--color-text-muted)]">
            {caption}
          </Metadata>
        </figcaption>
      ) : null}
    </figure>
  )
}
