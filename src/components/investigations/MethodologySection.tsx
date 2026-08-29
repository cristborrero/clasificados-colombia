import { Body, HeadlineMD } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'

/**
 * How we investigated (PRD Nº8 §82, PRD Nº7 §56).
 *
 * A named section rather than a footnote, and required before an investigation
 * can be published — the publish guard in `enforceStatusContract` refuses
 * without it.
 *
 * The reason is not procedural. An investigation asks the reader to believe a
 * conclusion they cannot check themselves; the methodology is the part that
 * makes that a reasonable request rather than an appeal to authority. Hiding it
 * at the bottom in small type is a way of publishing it without meaning it.
 */
export function MethodologySection({
  methodology,
  title = 'Cómo investigamos',
  className,
}: {
  methodology: string
  title?: string
  className?: string
}) {
  const paragraphs = methodology
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  if (paragraphs.length === 0) return null

  return (
    <section
      className={cn(
        'my-16 mx-auto max-w-3xl border-y border-[var(--color-border-strong)] bg-[var(--color-surface-sunken)] p-8 sm:p-10',
        className,
      )}
      aria-labelledby="metodologia"
    >
      <HeadlineMD as="h2" id="metodologia">
        {title}
      </HeadlineMD>

      <div className="mt-4 flex flex-col gap-4 w-full">
        {paragraphs.map((paragraph) => (
          <Body key={paragraph.slice(0, 40)}>{paragraph}</Body>
        ))}
      </div>
    </section>
  )
}
