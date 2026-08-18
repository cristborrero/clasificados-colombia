import { Quote } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'

/**
 * Pull quote (PRD Nº8 §70).
 *
 * Large serif, a thin rule, optional attribution. A `<blockquote>` with a
 * `<cite>` rather than styled text: the quotation is a semantic relationship,
 * and a screen reader that can say "quote" is doing something a large font
 * cannot.
 *
 * The rule sits on top rather than around. A bordered box would read as a card,
 * and PRD Nº8 §18 keeps the identity in lines rather than in containers.
 */
export type PullQuoteProps = {
  text: string
  attribution?: string | null
  source?: string | null
  className?: string
}

export function PullQuote({ text, attribution, source, className }: PullQuoteProps) {
  return (
    <figure className={cn('my-10 border-t border-[var(--color-border-strong)] pt-6', className)}>
      <Quote className="text-[length:var(--text-h3)]">{text}</Quote>

      {attribution || source ? (
        <figcaption className="mt-4 font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)] text-[color:var(--color-text-muted)]">
          {attribution ? <cite className="font-semibold not-italic">{attribution}</cite> : null}
          {attribution && source ? <span aria-hidden> · </span> : null}
          {source}
        </figcaption>
      ) : null}
    </figure>
  )
}
