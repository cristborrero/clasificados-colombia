import type { ReactNode } from 'react'

import { cn } from '@/components/ui/cn'

/**
 * Photographer or agency credit (PRD Nº10, rights metadata).
 *
 * Deliberately quieter than the caption and deliberately always present when
 * the record has one. Attribution is a licence obligation, not a design choice
 * — an agency photograph published without its credit is a breach of the terms
 * it was licensed under.
 *
 * "Foto:" is included so the string reads as an attribution rather than as an
 * unexplained name under a picture.
 */
export function MediaCredit({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'block font-[family-name:var(--font-sans)] text-[length:var(--text-label)]',
        'tracking-[var(--text-label--letter-spacing)] text-[color:var(--color-text-muted)] uppercase',
        className,
      )}
    >
      Foto: {children}
    </span>
  )
}
