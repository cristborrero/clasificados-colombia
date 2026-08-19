import { Dek } from '@/components/editorial/Typography'
import { CardMedia } from '@/components/articles/parts/CardMedia'
import { CardMeta } from '@/components/articles/parts/CardMeta'
import { CardTitle } from '@/components/articles/parts/CardTitle'
import { CardEyebrow } from '@/components/articles/parts/CardEyebrow'
import { cn } from '@/components/ui/cn'
import { investigationPath } from '@/lib/routes'

/**
 * Investigation card (PRD Nº8 §53).
 *
 * *"Debe verse diferente sin romper sistema."* The difference is three things
 * the PRD names — a red rule, a strong category marker, darker typography — and
 * not a second design language. Every part underneath is the same shared
 * subcomponent every other card uses.
 *
 * The red rule is `border-l`, not a background: a filled red block behind a
 * headline would either fail contrast or force white text, and PRD Nº8 §108
 * wants the marker to survive greyscale. A rule plus the word INVESTIGACIÓN
 * does that on its own.
 */
export type InvestigationCardArticle = {
  slug: string
  title: string
  dek?: string | null
  publishedAt?: string | null
  authors?: { name: string; slug: string }[]
  image?: { url: string; alt: string } | null
  /** Rendered as context under the byline, e.g. "12 documentos". */
  evidenceSummary?: string | null
}

export type InvestigationCardProps = {
  investigation: InvestigationCardArticle
  headingLevel?: 'h2' | 'h3' | 'h4'
  className?: string
}

export { investigationPath } from '@/lib/routes'

export function InvestigationCard({
  investigation,
  headingLevel = 'h3',
  className,
}: InvestigationCardProps) {
  const href = investigationPath(investigation.slug)

  return (
    <article
      className={cn(
        'group flex flex-col gap-3',
        'border-l-2 border-[var(--color-accent)] pl-5',
        className,
      )}
    >
      {investigation.image ? (
        <CardMedia
          href={href}
          src={investigation.image.url}
          alt={investigation.image.alt}
          aspect="3/2"
        />
      ) : null}

      <CardEyebrow label="Investigación" tone="accent" />

      <CardTitle href={href} title={investigation.title} as={headingLevel} />

      {investigation.dek ? (
        // Darker than a normal dek (§53): the piece should read as heavier.
        <Dek className="text-[color:var(--color-gray-900)]">{investigation.dek}</Dek>
      ) : null}

      <CardMeta
        authors={investigation.authors}
        date={investigation.publishedAt}
        extra={investigation.evidenceSummary}
      />
    </article>
  )
}
