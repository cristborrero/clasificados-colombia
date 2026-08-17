import type { ElementType, ReactNode } from 'react'

import { cn } from '@/components/ui/cn'
import { stackGaps, type SpaceStep } from '@/components/layout/Stack'

/**
 * Horizontal grouping that wraps (PRD Nº8 §23).
 *
 * For bylines, metadata rows, tag lists, share actions — anything that sits in
 * a line until it runs out of room. Wrapping is the default rather than an
 * option, because a metadata row that overflows on a 360px phone is the most
 * common way these break.
 */
const alignments = {
  start: 'items-start',
  center: 'items-center',
  baseline: 'items-baseline',
  end: 'items-end',
} as const

const justifications = {
  start: 'justify-start',
  center: 'justify-center',
  between: 'justify-between',
  end: 'justify-end',
} as const

export type ClusterProps = {
  children: ReactNode
  gap?: SpaceStep
  align?: keyof typeof alignments
  justify?: keyof typeof justifications
  as?: ElementType
  className?: string
}

export function Cluster({
  children,
  gap = 'sm',
  align = 'center',
  justify = 'start',
  as: Component = 'div',
  className,
}: ClusterProps) {
  return (
    <Component
      className={cn(
        'flex flex-wrap',
        stackGaps[gap],
        alignments[align],
        justifications[justify],
        className,
      )}
    >
      {children}
    </Component>
  )
}
