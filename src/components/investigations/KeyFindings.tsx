import { Body, HeadlineMD } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'

/**
 * Key findings (PRD Nº8 §79).
 *
 * Numbered, because the numbering is the reader's entry point: an
 * investigation's findings are what someone quotes, links to and argues with,
 * and "the third finding" has to mean something stable.
 *
 * An `<ol>`, so the numbering is in the document rather than only in the
 * styling. A screen reader then says how many findings there are — which, on a
 * piece a reader may be deciding whether to trust, is the first thing worth
 * knowing.
 *
 * `sourceReference` is printed where it exists. A finding whose source cannot
 * be named is still a finding, but the reader should be able to see which is
 * which.
 */
export type KeyFinding = {
  headline: string
  description?: string | null
  sourceReference?: string | null
}

export function KeyFindings({
  findings,
  title = 'Qué encontramos',
  className,
}: {
  findings: readonly KeyFinding[]
  title?: string
  className?: string
}) {
  if (findings.length === 0) return null

  return (
    <section className={cn('my-16 mx-auto max-w-3xl', className)} aria-labelledby="hallazgos">
      <HeadlineMD as="h2" id="hallazgos">
        {title}
      </HeadlineMD>

      <ol className="mt-8 flex flex-col gap-8 max-w-[62ch]">
        {findings.map((finding, index) => (
          <li key={finding.headline} className="flex gap-5">
            <span
              aria-hidden
              className="shrink-0 font-[family-name:var(--font-editorial)] text-[length:var(--text-h3)] leading-none font-bold text-[color:var(--color-accent)] tabular-nums"
            >
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="flex flex-col gap-2">
              <p className="font-[family-name:var(--font-sans)] text-[length:var(--text-body-lg)] font-semibold">
                {finding.headline}
              </p>

              {finding.description ? (
                <Body className="text-[color:var(--color-text-muted)]">{finding.description}</Body>
              ) : null}

              {finding.sourceReference ? (
                <p className="font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)] text-[color:var(--color-text-muted)]">
                  Fuente: {finding.sourceReference}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
