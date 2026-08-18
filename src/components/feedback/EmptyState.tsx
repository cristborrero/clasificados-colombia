import type { ReactNode } from 'react'

import { Body, HeadlineMD } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'

/**
 * Editorial empty state (PRD Nº8 §165).
 *
 * The distinction this component exists to preserve: *nothing here yet* is not
 * *something broke*. A section with no published pieces is a normal state on a
 * newsroom that publishes deliberately, and rendering it as an error teaches
 * the reader to distrust the site.
 *
 * So it is a plain region, not `role="alert"`, and the copy never apologises.
 */
export type EmptyStateProps = {
  title: string
  message?: string
  /** Somewhere useful to go instead. */
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, message, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 border border-dashed border-[var(--color-border)] p-8',
        className,
      )}
    >
      <HeadlineMD as="p">{title}</HeadlineMD>

      {message ? <Body className="text-[color:var(--color-text-muted)]">{message}</Body> : null}

      {action}
    </div>
  )
}
