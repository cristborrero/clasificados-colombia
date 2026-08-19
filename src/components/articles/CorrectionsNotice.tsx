import { Body, Eyebrow, HeadlineMD } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'
import type { CorrectionType, PublicCorrection } from '@/data/corrections'
import { formatEditorialDateTime, toDateTimeAttribute } from '@/lib/format/date'

/**
 * The corrections attached to a piece, shown inside it (PRD Nº8 §120-§124).
 *
 * Placed after the body and before the related content: a reader who finishes
 * the piece meets the correction without having to look for it, and a reader
 * who never gets that far was not going to read a banner at the top either.
 *
 * The original text is never altered. What is published here is the record,
 * alongside what it corrects — a newsroom that silently rewrites its mistakes
 * is asking readers to trust a text that can change underneath them.
 */

const LABELS: Record<CorrectionType, string> = {
  correction: 'Corrección',
  clarification: 'Aclaración',
  update: 'Actualización',
  editor_note: 'Nota del editor',
}

/*
 * Only a correction is marked in red.
 *
 * The distinction is editorial, not decorative. Red is this newsroom's signal
 * colour, and spending it on an update — where nothing was wrong — would make
 * it read as "something changed" rather than "we got something wrong", which is
 * the one message it has to carry.
 */
const IS_ERROR: Record<CorrectionType, boolean> = {
  correction: true,
  clarification: false,
  update: false,
  editor_note: false,
}

export function CorrectionsNotice({
  corrections,
  className,
}: {
  corrections: PublicCorrection[]
  className?: string
}) {
  if (corrections.length === 0) return null

  return (
    <section
      aria-labelledby="correcciones"
      className={cn('border-t-2 border-[var(--color-border-strong)] pt-6', className)}
    >
      <HeadlineMD as="h2" id="correcciones">
        Correcciones y actualizaciones
      </HeadlineMD>

      <ol className="mt-4 flex flex-col gap-5">
        {corrections.map((correction) => {
          const issued = formatEditorialDateTime(correction.issuedAt)

          return (
            <li
              key={correction.id}
              className={cn(
                'border-l-2 pl-4',
                IS_ERROR[correction.type]
                  ? 'border-[var(--color-accent)]'
                  : 'border-[var(--color-border)]',
              )}
            >
              <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Eyebrow
                  as="span"
                  className={
                    IS_ERROR[correction.type] ? 'text-[color:var(--color-accent)]' : undefined
                  }
                >
                  {LABELS[correction.type]}
                </Eyebrow>

                {issued && (
                  <time
                    dateTime={toDateTimeAttribute(correction.issuedAt) ?? undefined}
                    className="text-meta text-[color:var(--color-text-muted)]"
                  >
                    {issued}
                  </time>
                )}
              </p>

              <Body className="mt-1">{correction.summary}</Body>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
