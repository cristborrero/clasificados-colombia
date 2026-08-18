import Link from 'next/link'

import { Metadata } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'
import { formatEditorialDate, toDateTimeAttribute } from '@/lib/format/date'

/**
 * Byline and date (PRD Nº8 §50, §60-§61; PRD SEO §24, §31).
 *
 * A byline is not decoration on an investigative outlet — §24 and §31 both tie
 * published journalism to a named, linkable author. So the authors render as
 * links to their author pages, and the date renders inside a `<time>` with a
 * machine-readable `datetime`.
 *
 * Everything is optional and everything degrades: no authors, no date, or
 * neither, and the component simply renders less rather than emitting empty
 * separators.
 */
export type CardMetaAuthor = { name: string; slug: string }

export type CardMetaProps = {
  authors?: readonly CardMetaAuthor[]
  date?: string | null
  /** Extra fragment such as "5 min de lectura". */
  extra?: string | null
  className?: string
}

const authorLinkClass = cn(
  'no-underline underline-offset-4 hover:underline',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
)

export function CardMeta({ authors = [], date, extra, className }: CardMetaProps) {
  const formatted = formatEditorialDate(date)
  const dateTime = toDateTimeAttribute(date)

  const hasAnything = authors.length > 0 || formatted !== null || Boolean(extra)
  if (!hasAnything) return null

  return (
    <Metadata className={cn('text-[color:var(--color-text-muted)]', className)}>
      {authors.length > 0 ? (
        <span>
          {authors.map((author, index) => (
            <span key={author.slug}>
              {index > 0 ? <span aria-hidden>{index === authors.length - 1 ? ' y ' : ', '}</span> : null}
              <Link href={`/autor/${author.slug}`} className={authorLinkClass} rel="author">
                {author.name}
              </Link>
            </span>
          ))}
        </span>
      ) : null}

      {authors.length > 0 && formatted ? <span aria-hidden> · </span> : null}

      {formatted && dateTime ? <time dateTime={dateTime}>{formatted}</time> : null}

      {extra ? (
        <>
          <span aria-hidden> · </span>
          <span>{extra}</span>
        </>
      ) : null}
    </Metadata>
  )
}
