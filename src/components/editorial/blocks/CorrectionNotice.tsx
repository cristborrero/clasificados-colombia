import { Body } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'
import { formatEditorialDate, toDateTimeAttribute } from '@/lib/format/date'

/**
 * Correction notice (PRD Nº8 §74, PRD SEO §76).
 *
 * *"Debe ser claramente visible."* This is the one editorial block that is
 * allowed to be loud, and it should be: a correction the reader can miss is a
 * correction that has not been made. It carries the red rule and the word, at
 * full weight.
 *
 * §76 insists the four types are not interchangeable, and the wording matters
 * legally as well as editorially. A correction says the outlet was wrong. An
 * update says the story moved. Presenting the second as the first invents an
 * error; presenting the first as the second hides one.
 *
 * `role="note"` rather than `alert`: it is part of the article's permanent
 * record, not something that just happened.
 */
export type CorrectionType = 'correction' | 'clarification' | 'update' | 'editor_note'

const LABEL: Record<CorrectionType, string> = {
  correction: 'Corrección',
  clarification: 'Aclaración',
  update: 'Actualización',
  editor_note: 'Nota del editor',
}

export type CorrectionNoticeProps = {
  type?: CorrectionType
  date: string
  text: string
  className?: string
}

export function CorrectionNotice({
  type = 'correction',
  date,
  text,
  className,
}: CorrectionNoticeProps) {
  const formatted = formatEditorialDate(date)
  const dateTime = toDateTimeAttribute(date)

  return (
    <aside
      role="note"
      aria-label={LABEL[type]}
      className={cn(
        'my-10 border-l-2 border-[var(--color-accent)] bg-[var(--color-surface-raised)] py-4 pl-6',
        className,
      )}
    >
      <p className="font-[family-name:var(--font-sans)] text-[length:var(--text-label)] font-semibold tracking-[var(--text-label--letter-spacing)] text-[color:var(--color-accent)] uppercase">
        {LABEL[type]}
        {formatted && dateTime ? (
          <>
            <span aria-hidden> · </span>
            <time dateTime={dateTime} className="font-normal text-[color:var(--color-text-muted)]">
              {formatted}
            </time>
          </>
        ) : null}
      </p>

      <Body className="mt-2">{text}</Body>
    </aside>
  )
}
