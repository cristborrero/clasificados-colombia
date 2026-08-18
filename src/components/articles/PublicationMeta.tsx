import { cn } from '@/components/ui/cn'
import { formatEditorialDateTime, readingTimeMinutes, toDateTimeAttribute } from '@/lib/format/date'

/**
 * Publication metadata (PRD Nº8 §61).
 *
 * "Publicado, Actualizado, Tiempo de lectura — sin ruido." Three facts, printed
 * only when they exist.
 *
 * The update line appears only when the piece was genuinely revised after
 * publication. Printing "Actualizado" with the same timestamp as "Publicado"
 * on every article devalues the label on the article where it matters — the one
 * that carries a correction (PRD SEO §76).
 */
export type PublicationMetaProps = {
  publishedAt?: string | null
  updatedAt?: string | null
  wordCount?: number | null
  className?: string
}

/** Below this, an "update" is a typo fix, not a revision worth announcing. */
const MEANINGFUL_UPDATE_MS = 60_000

export function PublicationMeta({
  publishedAt,
  updatedAt,
  wordCount,
  className,
}: PublicationMetaProps) {
  const published = formatEditorialDateTime(publishedAt)
  const publishedAttr = toDateTimeAttribute(publishedAt)

  const publishedMs = publishedAt ? Date.parse(publishedAt) : Number.NaN
  const updatedMs = updatedAt ? Date.parse(updatedAt) : Number.NaN

  const wasRevised =
    Number.isFinite(publishedMs) &&
    Number.isFinite(updatedMs) &&
    updatedMs - publishedMs > MEANINGFUL_UPDATE_MS

  const updated = wasRevised ? formatEditorialDateTime(updatedAt) : null
  const updatedAttr = wasRevised ? toDateTimeAttribute(updatedAt) : null

  const minutes = typeof wordCount === 'number' ? readingTimeMinutes(wordCount) : null

  if (!published && !updated && minutes === null) return null

  return (
    <p
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1',
        'font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)] text-[color:var(--color-text-muted)]',
        className,
      )}
    >
      {published && publishedAttr ? (
        <span>
          Publicado <time dateTime={publishedAttr}>{published}</time>
        </span>
      ) : null}

      {updated && updatedAttr ? (
        <span>
          Actualizado <time dateTime={updatedAttr}>{updated}</time>
        </span>
      ) : null}

      {minutes !== null ? <span>{minutes} min de lectura</span> : null}
    </p>
  )
}
