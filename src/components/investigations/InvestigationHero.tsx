import { Breadcrumbs } from '@/components/articles/Breadcrumbs'
import { Byline, type BylineAuthor } from '@/components/articles/Byline'
import { PublicationMeta } from '@/components/articles/PublicationMeta'
import { ShareActions } from '@/components/articles/ShareActions'
import { Display, Lead } from '@/components/editorial/Typography'
import { Container } from '@/components/layout/Container'
import { EditorialImage } from '@/components/media/EditorialImage'
import { cn } from '@/components/ui/cn'

/**
 * Investigation hero (PRD Nº8 §77).
 *
 * Dark ground, large image, editorial serif, red accent — *"sin caer en
 * estética cinematográfica exagerada."* Centered editorial layout aligned
 * with the global design system.
 */
export type InvestigationHeroProps = {
  eyebrow?: string
  title: string
  summary?: string | null
  authors: readonly BylineAuthor[]
  publishedAt?: string | null
  updatedAt?: string | null
  image?: { url: string; alt: string } | null
  caption?: string | null
  credit?: string | null
  breadcrumbs?: Array<{ label: string; href?: string }>
  shareUrl?: string
  className?: string
}

export function InvestigationHero({
  eyebrow = 'Investigación',
  title,
  summary,
  authors,
  publishedAt,
  updatedAt,
  image,
  caption,
  credit,
  breadcrumbs,
  shareUrl,
  className,
}: InvestigationHeroProps) {
  return (
    <header className={cn('bg-[var(--color-surface-inverse)] text-[color:var(--color-text-inverse)]', className)}>
      <Container width="wide" className="pt-8 pb-4">
        {breadcrumbs ? (
          <Breadcrumbs
            items={breadcrumbs}
            className="mb-8 [&_a]:text-[color:var(--color-text-inverse-muted)] [&_a:hover]:text-[color:var(--color-text-inverse)] [&_li]:text-[color:var(--color-text-inverse-muted)] [&_svg]:text-[color:var(--color-text-inverse-muted)]"
          />
        ) : null}

        <div className="mx-auto max-w-3xl text-center">
          <p className="font-[family-name:var(--font-sans)] text-[length:var(--text-label)] font-semibold tracking-[var(--text-label--letter-spacing)] text-[color:var(--color-accent)] uppercase">
            {eyebrow}
          </p>

          <span
            aria-hidden
            className="mx-auto mt-4 block h-[2px] w-16 bg-[var(--color-accent)]"
          />

          <Display as="h1" className="mt-6 text-balance text-[color:var(--color-text-inverse)]">
            {title}
          </Display>

          {summary ? (
            <Lead className="mx-auto mt-6 text-balance whitespace-pre-line text-[color:var(--color-text-inverse-muted)]">
              {summary}
            </Lead>
          ) : null}

          <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-y border-[var(--color-border-inverse)] py-4 text-[color:var(--color-text-inverse-muted)]">
            <Byline
              authors={authors}
              className="[&_a]:text-[color:var(--color-text-inverse)] [&_span]:text-[color:var(--color-text-inverse-muted)]"
            />

            <PublicationMeta
              publishedAt={publishedAt}
              updatedAt={updatedAt}
              className="text-[color:var(--color-text-inverse-muted)]"
            />

            {shareUrl ? (
              <ShareActions
                url={shareUrl}
                title={title}
                className="[&_button]:border-[var(--color-border-inverse)] [&_button]:text-[color:var(--color-text-inverse)] [&_button:hover]:bg-[var(--color-surface-inverse)] [&_button:hover]:border-[var(--color-text-inverse)]"
              />
            ) : null}
          </div>
        </div>
      </Container>

      {image ? (
        <Container width="wide" className="pb-16 pt-4">
          <EditorialImage
            src={image.url}
            alt={image.alt}
            width={1600}
            height={900}
            caption={caption}
            credit={credit}
            sizes="(min-width: 1440px) 1440px, 100vw"
            priority
            className="mx-auto max-w-5xl overflow-hidden [&_figcaption]:text-[color:var(--color-text-inverse-muted)]"
          />
        </Container>
      ) : null}
    </header>
  )
}

