import type { ElementType, ReactNode } from 'react'

import { cn } from '@/components/ui/cn'

/**
 * Editorial grid (PRD Master §38, PRD Nº8 §14).
 *
 * 12 columns on desktop, 8 on tablet, 4 on mobile, with the 24px gutter the
 * reference sheet fixes. CSS Grid rather than flex, because PRD Master §38 asks
 * for real grid structure — editorial layouts need columns that line up across
 * sibling sections, which flex cannot give.
 *
 * Column counts are expressed as a fixed set rather than an open number so that
 * Tailwind can see the class names at build time.
 */
const columns = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-4 md:grid-cols-8 lg:grid-cols-12',
} as const

export type GridColumns = keyof typeof columns

export type GridProps = {
  children: ReactNode
  /** 12 mirrors the full editorial grid; the rest are common sub-layouts. */
  cols?: GridColumns
  as?: ElementType
  className?: string
}

export function Grid({ children, cols = 12, as: Component = 'div', className }: GridProps) {
  return (
    <Component className={cn('grid gap-[var(--gutter)]', columns[cols], className)}>
      {children}
    </Component>
  )
}
