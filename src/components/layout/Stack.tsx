import type { ElementType, ReactNode } from 'react'

import { cn } from '@/components/ui/cn'

/**
 * Vertical rhythm primitive (PRD Nº8 §23).
 *
 * Every gap is a step on the base-4 scale, so vertical spacing cannot drift
 * into the 37px territory PRD Nº8 §17 warns about.
 */
const gaps = {
  none: 'gap-0',
  xs: 'gap-1', //  4px
  sm: 'gap-2', //  8px
  md: 'gap-4', // 16px
  lg: 'gap-6', // 24px
  xl: 'gap-8', // 32px
  '2xl': 'gap-12', // 48px
  '3xl': 'gap-16', // 64px
  '4xl': 'gap-24', // 96px
} as const

export type SpaceStep = keyof typeof gaps

const alignments = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
} as const

export type StackProps = {
  children: ReactNode
  gap?: SpaceStep
  align?: keyof typeof alignments
  as?: ElementType
  className?: string
}

export function Stack({
  children,
  gap = 'md',
  align = 'stretch',
  as: Component = 'div',
  className,
}: StackProps) {
  return (
    <Component className={cn('flex flex-col', gaps[gap], alignments[align], className)}>
      {children}
    </Component>
  )
}

export { gaps as stackGaps }
