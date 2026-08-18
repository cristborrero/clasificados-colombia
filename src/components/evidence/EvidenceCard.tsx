import { FileText } from 'lucide-react'

import { Body, Metadata } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'
import { formatEditorialDate, toDateTimeAttribute } from '@/lib/format/date'

/**
 * Document card (PRD Master §20, PRD Nº8 §84).
 *
 * Shows the metadata a reader needs in order to judge a document before opening
 * it: what kind of record it is, who issued it, when, and how long it runs.
 *
 * Simplified on 2026-08-18. This used to guard against restricted evidence
 * reaching the public frontend, with a projection that returned `null` for
 * anything not public. That guard is gone because what it guarded is gone: a
 * document in this collection is a published document by definition, since the
 * rule is now "if it cannot be public, it does not go in the CMS".
 *
 * What survives is the part that was right independently: the card renders a
 * URL, never a storage location. Knowing where a file lives is most of the work
 * of reaching it.
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
  /** Served by Payload's upload handling. Never a bucket and key. */
  url?: string | null
}

export type EvidenceCardProps = {
  evidence: PublicEvidenceCard
  headingLevel?: 'h3' | 'h4'
  className?: string
}


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

        {evidence.url ? (
        <p className="mt-1">
          <a
            href={evidence.url}
            target="_blank"
            rel="noopener"
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
        ) : null}
      </div>
    </article>
  )
}
