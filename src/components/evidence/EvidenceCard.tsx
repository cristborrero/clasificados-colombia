import { FileText } from 'lucide-react'

import { Body, Metadata } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'
import { formatEditorialDate, toDateTimeAttribute } from '@/lib/format/date'

/**
 * Evidence card (PRD Nº8 §84, §86, §88).
 *
 * THE RULE THAT MATTERS IS §88: restricted evidence must never appear in the
 * public frontend, and it must not appear as a placeholder either — no
 * "Documento restringido" card, because saying a document exists is often the
 * disclosure. The existence of a subpoena can identify the source who provided
 * it.
 *
 * This component cannot break that rule, and not because it is careful. It
 * accepts only `PublicEvidence` — the projection built in F6 that has no
 * `bucket` and no `objectKey` by construction, and that `toPublicEvidence`
 * returns `null` for whenever the classification is not public. There is no
 * prop here that could carry a restricted document, so there is no branch to
 * get wrong.
 *
 * §86: the card links to `/api/evidence/<id>/access`, which authorises, audits
 * and only then mints a short-lived URL. It never receives an object key.
 */
export type PublicEvidenceCard = {
  id: string | number
  /** Human label for the kind of document, e.g. "Contrato". */
  documentType?: string | null
  title: string
  institution?: string | null
  documentDate?: string | null
  description?: string | null
  pageCount?: number | null
}

export type EvidenceCardProps = {
  evidence: PublicEvidenceCard
  headingLevel?: 'h3' | 'h4'
  className?: string
}

/** The authorising endpoint, never the storage path (§86). */
export const evidenceAccessPath = (id: string | number): string => `/api/evidence/${id}/access`

export function EvidenceCard({ evidence, headingLevel = 'h4', className }: EvidenceCardProps) {
  const Heading = headingLevel
  const formatted = formatEditorialDate(evidence.documentDate)
  const dateTime = toDateTimeAttribute(evidence.documentDate)

  const facts = [
    evidence.institution,
    formatted,
    evidence.pageCount ? `${evidence.pageCount} páginas` : null,
  ].filter((fact): fact is string => Boolean(fact))

  return (
    <article
      className={cn(
        'flex gap-4 border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5',
        className,
      )}
    >
      <FileText
        aria-hidden
        size={24}
        strokeWidth={1.5}
        className="mt-1 shrink-0 text-[color:var(--color-text-muted)]"
      />

      <div className="flex flex-col gap-2">
        {evidence.documentType ? (
          <Metadata
            as="p"
            className="tracking-[var(--text-label--letter-spacing)] text-[color:var(--color-text-muted)] uppercase"
          >
            {evidence.documentType}
          </Metadata>
        ) : null}

        <Heading className="font-[family-name:var(--font-sans)] text-[length:var(--text-body)] font-semibold">
          {evidence.title}
        </Heading>

        {facts.length > 0 ? (
          <Metadata as="p" className="text-[color:var(--color-text-muted)]">
            {evidence.institution ? <span>{evidence.institution}</span> : null}
            {evidence.institution && formatted ? <span aria-hidden> · </span> : null}
            {formatted && dateTime ? <time dateTime={dateTime}>{formatted}</time> : null}
            {evidence.pageCount ? (
              <>
                <span aria-hidden> · </span>
                <span>{evidence.pageCount} páginas</span>
              </>
            ) : null}
          </Metadata>
        ) : null}

        {evidence.description ? (
          <Body className="text-[color:var(--color-text-muted)]">{evidence.description}</Body>
        ) : null}

        <p className="mt-1">
          <a
            href={evidenceAccessPath(evidence.id)}
            className={cn(
              'font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)] font-semibold',
              'underline underline-offset-4',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
            )}
          >
            Ver documento
            {/* The label already says what it opens; the title disambiguates it
                for anyone listing the page's links out of context. */}
            <span className="sr-only"> — {evidence.title}</span>
          </a>
        </p>
      </div>
    </article>
  )
}
