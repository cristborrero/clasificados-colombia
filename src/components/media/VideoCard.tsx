import { Play } from 'lucide-react'

import { CardEyebrow } from '@/components/articles/parts/CardEyebrow'
import { CardMedia } from '@/components/articles/parts/CardMedia'
import { CardMeta } from '@/components/articles/parts/CardMeta'
import { CardTitle } from '@/components/articles/parts/CardTitle'
import { cn } from '@/components/ui/cn'
import { videoPath } from '@/lib/routes'

/**
 * Video card (PRD Nº8 §56).
 *
 * Duration and a play icon, *"sin overlay excesivo"*. So: a small icon badge in
 * one corner and the duration in the other, over an otherwise untouched poster.
 * No full-frame scrim — a dark wash over every video thumbnail on the page
 * costs the poster the thing it was chosen for.
 *
 * The duration is printed as text, not only implied by the badge. `durationText`
 * comes in pre-formatted so this component does not own the formatting of a
 * value the video record already knows.
 *
 * Both overlays are `aria-hidden`; the duration reaches assistive technology
 * through the metadata line, where it belongs, rather than as a floating "4:32"
 * with no antecedent.
 */
export type VideoCardProps = {
  video: {
    slug: string
    title: string
    publishedAt?: string | null
    authors?: { name: string; slug: string }[]
    poster?: { url: string; alt: string } | null
    /** Already formatted, e.g. "4:32". */
    durationText?: string | null
  }
  headingLevel?: 'h2' | 'h3' | 'h4'
  className?: string
}

export { videoPath } from '@/lib/routes'

export function VideoCard({ video, headingLevel = 'h3', className }: VideoCardProps) {
  const href = videoPath(video.slug)

  return (
    <article className={cn('group flex flex-col gap-3', className)}>
      <div className="relative">
        {video.poster ? (
          <CardMedia href={href} src={video.poster.url} alt={video.poster.alt} />
        ) : (
          <div className="aspect-video bg-[var(--color-surface-sunken)]" />
        )}

        <span
          aria-hidden
          className="absolute bottom-3 left-3 inline-flex items-center justify-center bg-[var(--color-ink)]/80 p-2 text-[var(--color-white)]"
        >
          <Play size={16} strokeWidth={2} fill="currentColor" />
        </span>

        {video.durationText ? (
          <span
            aria-hidden
            className="absolute right-3 bottom-3 bg-[var(--color-ink)]/80 px-2 py-1 font-[family-name:var(--font-sans)] text-[length:var(--text-label)] text-[var(--color-white)] tabular-nums"
          >
            {video.durationText}
          </span>
        ) : null}
      </div>

      <CardEyebrow label="Video" />

      <CardTitle href={href} title={video.title} as={headingLevel} />

      <CardMeta
        authors={video.authors}
        date={video.publishedAt}
        extra={video.durationText ? `Duración ${video.durationText}` : null}
      />
    </article>
  )
}
