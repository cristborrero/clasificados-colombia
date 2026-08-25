import Image from 'next/image'

import { Byline, type BylineAuthor } from '@/components/articles/Byline'
import { PublicationMeta } from '@/components/articles/PublicationMeta'
import { Display, Lead } from '@/components/editorial/Typography'
import { Container } from '@/components/layout/Container'
import { MediaCaption } from '@/components/media/MediaCaption'
import { MediaCredit } from '@/components/media/MediaCredit'
import { cn } from '@/components/ui/cn'

/**
 * Investigation hero (PRD Nº8 §77).
 *
 * Dark ground, large image, editorial serif, red accent — *"sin caer en
 * estética cinematográfica exagerada."* The restraint is the requirement: an
 * investigation that arrives looking like a film poster invites the reader to
 * treat it as entertainment, and the reporting is what should be doing the
 * work.
 *
 * So the dark band is flat colour, the accent is a single rule, and the image
 * sits below the text rather than behind it. No scrim, no parallax, no text
 * over photograph — which is also the only way the headline's contrast is
 * knowable rather than dependent on which picture was chosen.
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
  className,
}: InvestigationHeroProps) {
  return (
    <header className={cn('bg-[var(--color-surface-inverse)]', className)}>
      <Container width="wide" className="py-16">
        <p className="font-[family-name:var(--font-sans)] text-[length:var(--text-label)] font-semibold tracking-[var(--text-label--letter-spacing)] text-[color:var(--color-accent)] uppercase">
          {eyebrow}
        </p>

        <span
          aria-hidden
          className="mt-4 block h-[2px] w-16 bg-[var(--color-accent)]"
        />

        <Display as="h1" className="mt-6 text-[color:var(--color-text-inverse)]">
          {title}
        </Display>

        {summary ? (
          <Lead className="mt-6 max-w-[56ch] text-[color:var(--color-text-inverse-muted)]">
            {summary}
          </Lead>
        ) : null}

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--color-border-inverse)] pt-6 text-[color:var(--color-text-inverse-muted)]">
          <Byline
            authors={authors}
            className="[&_a]:text-[color:var(--color-text-inverse)] [&_span]:text-[color:var(--color-text-inverse-muted)]"
          />

          <PublicationMeta
            publishedAt={publishedAt}
            updatedAt={updatedAt}
            className="text-[color:var(--color-text-inverse-muted)]"
          />
        </div>
      </Container>

      {image ? (
        <Container width="wide" gutters={false}>
          <figure>
            <Image
              src={image.url}
              alt={image.alt}
              width={2400}
              height={1350}
              sizes="100vw"
              priority
              className="h-auto w-full"
            />

            {caption || credit ? (
              <Container width="wide">
                <figcaption className="flex flex-col gap-1 py-4 text-[color:var(--color-text-inverse-muted)]">
                  {caption ? <MediaCaption>{caption}</MediaCaption> : null}
                  {credit ? <MediaCredit>{credit}</MediaCredit> : null}
                </figcaption>
              </Container>
            ) : null}
          </figure>
        </Container>
      ) : null}
    </header>
  )
}
