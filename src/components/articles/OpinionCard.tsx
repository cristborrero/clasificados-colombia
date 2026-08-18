import Image from 'next/image'
import Link from 'next/link'

import { Metadata } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'
import { formatEditorialDate, toDateTimeAttribute } from '@/lib/format/date'

import { CardEyebrow } from './parts/CardEyebrow'
import { CardTitle } from './parts/CardTitle'

/**
 * Opinion card (PRD Nº8 §54).
 *
 * Two requirements, both non-negotiable on a newsroom that publishes
 * investigations: the word OPINIÓN, explicitly, and the author prominently.
 * A reader who cannot tell a column from a report at a glance will attribute
 * the column's claims to the newsroom.
 *
 * So the author is not metadata here — it sits above the headline with a
 * portrait, and OPINIÓN is the first thing in the reading order, not a badge in
 * a corner.
 */
export type OpinionCardAuthor = {
  name: string
  slug: string
  jobTitle?: string | null
  portrait?: { url: string; alt: string } | null
}

export type OpinionCardProps = {
  opinion: {
    slug: string
    title: string
    publishedAt?: string | null
    author: OpinionCardAuthor
  }
  headingLevel?: 'h2' | 'h3' | 'h4'
  className?: string
}

export const opinionPath = (slug: string): string => `/opinion/${slug}`

export function OpinionCard({ opinion, headingLevel = 'h3', className }: OpinionCardProps) {
  const href = opinionPath(opinion.slug)
  const { author } = opinion

  const formatted = formatEditorialDate(opinion.publishedAt)
  const dateTime = toDateTimeAttribute(opinion.publishedAt)

  return (
    <article className={cn('group flex flex-col gap-3', className)}>
      <CardEyebrow label="Opinión" tone="accent" />

      <div className="flex items-center gap-3">
        {author.portrait ? (
          <Image
            src={author.portrait.url}
            alt={author.portrait.alt}
            width={96}
            height={96}
            sizes="48px"
            className="size-12 shrink-0 rounded-full object-cover"
          />
        ) : null}

        <div className="flex flex-col">
          <Link
            href={`/autor/${author.slug}`}
            rel="author"
            className={cn(
              'font-[family-name:var(--font-sans)] font-semibold no-underline underline-offset-4 hover:underline',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
            )}
          >
            {author.name}
          </Link>

          {author.jobTitle ? (
            <Metadata className="text-[color:var(--color-text-muted)]">{author.jobTitle}</Metadata>
          ) : null}
        </div>
      </div>

      <CardTitle href={href} title={opinion.title} as={headingLevel} />

      {formatted && dateTime ? (
        <Metadata className="text-[color:var(--color-text-muted)]">
          <time dateTime={dateTime}>{formatted}</time>
        </Metadata>
      ) : null}
    </article>
  )
}
