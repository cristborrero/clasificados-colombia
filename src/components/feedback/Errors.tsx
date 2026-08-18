import Link from 'next/link'

import { Body, HeadlineLG, Metadata } from '@/components/editorial/Typography'
import { Container } from '@/components/layout/Container'
import { cn } from '@/components/ui/cn'

/**
 * Error surfaces (PRD Nº8 §161-§164).
 *
 * Two rules govern both components.
 *
 * First, the message is in the reader's language and describes what happened to
 * *them*, not to the process. "No pudimos cargar los comentarios" is useful;
 * "Error 500: Internal Server Error" is a stack trace wearing a coat.
 *
 * Second, no internal detail reaches the page. A rendered exception message can
 * carry a table name, a file path or a query — and on a platform that protects
 * sources, an error page is not the place to start describing the database.
 * These components take a message the developer chose; they never render a
 * caught error.
 */
export type InlineErrorProps = {
  /** What the reader could not get. Written for a reader, not for a log. */
  message?: string
  /** A retry, when the caller has one. Omitted rather than faked. */
  action?: React.ReactNode
  className?: string
}

/** For one failed block inside an otherwise working page. */
export function InlineError({
  message = 'No pudimos cargar esta sección.',
  action,
  className,
}: InlineErrorProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start gap-3 border-l-2 border-[var(--color-danger)] py-4 pl-5',
        className,
      )}
    >
      <Body className="text-[color:var(--color-text)]">{message}</Body>

      {action}
    </div>
  )
}

export type PageErrorProps = {
  title?: string
  message?: string
  /** Rendered under the message. Defaults to a link home. */
  action?: React.ReactNode
  /**
   * Shown in small print. Intended for a support/correlation id — never an
   * exception message.
   */
  reference?: string | null
  className?: string
}

/** For a page that could not be rendered at all. */
export function PageError({
  title = 'Algo salió mal',
  message = 'No pudimos mostrar esta página. Ya estamos revisándolo.',
  action,
  reference,
  className,
}: PageErrorProps) {
  return (
    <Container width="reading" className={cn('flex flex-col gap-6 py-24', className)}>
      <HeadlineLG as="h1">{title}</HeadlineLG>

      <Body className="text-[color:var(--color-text-muted)]">{message}</Body>

      {action ?? (
        <p>
          <Link
            href="/"
            className="font-[family-name:var(--font-sans)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            Volver a la portada
          </Link>
        </p>
      )}

      {reference ? (
        <Metadata className="text-[color:var(--color-text-muted)]">
          Referencia: <span className="font-mono">{reference}</span>
        </Metadata>
      ) : null}
    </Container>
  )
}
