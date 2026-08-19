import { DataFigure, Dek } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'
import { dataStoryPath } from '@/lib/routes'

import { CardEyebrow } from './parts/CardEyebrow'
import { CardMeta } from './parts/CardMeta'
import { CardTitle } from './parts/CardTitle'

/**
 * Data story card (PRD Nº8 §55).
 *
 * The big figure — "68.000 M" — is allowed to lead, but never alone. §55 says
 * *"con contexto"*, and a number with no unit and no comparison is not
 * journalism; it is a number. So `figureContext` is required alongside it, not
 * optional.
 *
 * The figure is `aria-hidden` and the context carries the accessible text,
 * because "68.000 M" read aloud on its own is noise. The headline underneath
 * says what it means, and that is what a screen reader should reach.
 */
export type DataCardProps = {
  story: {
    slug: string
    title: string
    dek?: string | null
    publishedAt?: string | null
    authors?: { name: string; slug: string }[]
    /** The headline number, already formatted for display. */
    figure?: string | null
    /** What the number is. Required whenever `figure` is present. */
    figureContext?: string | null
  }
  headingLevel?: 'h2' | 'h3' | 'h4'
  className?: string
}

export { dataStoryPath } from '@/lib/routes'

export function DataCard({ story, headingLevel = 'h3', className }: DataCardProps) {
  const href = dataStoryPath(story.slug)

  // A figure without its context is dropped rather than shown bare.
  const showFigure = Boolean(story.figure && story.figureContext)

  return (
    <article
      className={cn(
        'group flex flex-col gap-3 bg-[var(--color-surface-raised)] p-6',
        'border border-[var(--color-border-subtle)]',
        className,
      )}
    >
      <CardEyebrow label="Datos" />

      {showFigure ? (
        <p className="flex flex-col gap-1">
          <span aria-hidden>
            <DataFigure as="span" className="text-[color:var(--color-accent)]">
              {story.figure}
            </DataFigure>
          </span>
          <span className="font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)] text-[color:var(--color-text-muted)]">
            {story.figureContext}
          </span>
        </p>
      ) : null}

      <CardTitle href={href} title={story.title} as={headingLevel} />

      {story.dek ? (
        <Dek className="text-[color:var(--color-text-muted)]">{story.dek}</Dek>
      ) : null}

      <CardMeta authors={story.authors} date={story.publishedAt} />
    </article>
  )
}
