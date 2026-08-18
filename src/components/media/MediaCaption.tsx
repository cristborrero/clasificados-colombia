import type { ReactNode } from 'react'

import { Caption } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'

/**
 * Image caption (PRD Nº8 §64).
 *
 * Renders as a `<span>`, not a `<figcaption>`: `EditorialImage` owns the
 * `<figcaption>` and this sits inside it alongside the credit. Nesting one
 * `figcaption` in another is invalid, and a figure may only have one.
 */
export function MediaCaption({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <Caption as="span" className={cn('block text-[color:var(--color-text-muted)]', className)}>
      {children}
    </Caption>
  )
}
