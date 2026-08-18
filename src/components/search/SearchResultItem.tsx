import Link from 'next/link'

import { Dek, Metadata } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'
import { formatEditorialDate, toDateTimeAttribute } from '@/lib/format/date'
import type { SearchResultItem as SearchResult } from '@/data/search'

import { HighlightedText } from './HighlightedText'

/**
 * One search result (PRD Nº9 §45, PRD Nº8 §93).
 *
 * Category, title, dek, date, content type. The image is optional and omitted
 * here entirely: a results list is scanned, and a column of thumbnails at
 * different aspect ratios makes it harder to scan, not easier.
 *
 * The snippet appears only when the crop actually contains the match (§47) —
 * otherwise the dek is shown, because an arbitrary opening sentence pretending
 * to explain why a result appeared is worse than no explanation.
 */
const CONTENT_TYPE_LABEL: Record<string, string> = {
  articles: 'Noticia',
  investigations: 'Investigación',
  opinions: 'Opinión',
  'data-stories': 'Datos',
  'video-stories': 'Video',
  analysis: 'Análisis',
}

export function SearchResultItem({ result }: { result: SearchResult }) {
  const label =
    CONTENT_TYPE_LABEL[result.contentType] ?? CONTENT_TYPE_LABEL[result.collection] ?? 'Noticia'

  const formatted = formatEditorialDate(result.publishedAt)
  const dateTime = toDateTimeAttribute(result.publishedAt)

  return (
    <li className="border-b border-[var(--color-border-subtle)] py-6">
      <article className="group flex flex-col gap-2">
        <Metadata className="flex flex-wrap items-center gap-2 text-[color:var(--color-text-muted)]">
          <span className="tracking-[var(--text-label--letter-spacing)] uppercase">{label}</span>

          {result.category ? (
            <>
              <span aria-hidden>·</span>
              <span>{result.category.name}</span>
            </>
          ) : null}

          {formatted && dateTime ? (
            <>
              <span aria-hidden>·</span>
              <time dateTime={dateTime}>{formatted}</time>
            </>
          ) : null}
        </Metadata>

        <h2 className="font-[family-name:var(--font-editorial)] text-[length:var(--text-h3)] font-semibold text-balance">
          <Link
            href={result.url}
            className={cn(
              'no-underline underline-offset-[3px] group-hover:underline',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
            )}
          >
            <HighlightedText segments={result.title} />
          </Link>
        </h2>

        {result.snippet ? (
          <p className="font-[family-name:var(--font-sans)] text-[length:var(--text-body)] text-[color:var(--color-text-muted)]">
            <HighlightedText segments={result.snippet} />…
          </p>
        ) : result.dek ? (
          <Dek className="text-[color:var(--color-text-muted)]">{result.dek}</Dek>
        ) : null}
      </article>
    </li>
  )
}
