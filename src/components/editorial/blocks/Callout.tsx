import { Body, HeadlineMD } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'

/**
 * Editorial callout (PRD Nº8 §72).
 *
 * Three uses and no others: context, an editor's note, and methodology. The
 * schema restricts it to those three, and the PRD is explicit that it is not
 * for promotions — a promotional band styled like an editor's note borrows the
 * newsroom's credibility for something the newsroom is not saying.
 *
 * Each variant prints its own label, so the reader knows which of the three
 * they are reading without inferring it from a colour.
 */
export type CalloutVariant = 'context' | 'editor_note' | 'methodology'

const LABEL: Record<CalloutVariant, string> = {
  context: 'Contexto',
  editor_note: 'Nota del editor',
  methodology: 'Metodología',
}

export type CalloutProps = {
  variant?: CalloutVariant
  title?: string | null
  body: string
  className?: string
}

export function Callout({ variant = 'context', title, body, className }: CalloutProps) {
  return (
    <aside
      className={cn(
        'my-10 border-l-2 border-[var(--color-border-strong)] py-2 pl-6',
        className,
      )}
      aria-label={LABEL[variant]}
    >
      <p className="font-[family-name:var(--font-sans)] text-[length:var(--text-label)] tracking-[var(--text-label--letter-spacing)] text-[color:var(--color-text-muted)] uppercase">
        {LABEL[variant]}
      </p>

      {title ? (
        <HeadlineMD as="h2" className="mt-2 text-[length:var(--text-lead)]">
          {title}
        </HeadlineMD>
      ) : null}

      <Body className="mt-2">{body}</Body>
    </aside>
  )
}
