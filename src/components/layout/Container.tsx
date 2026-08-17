import type { ElementType, ReactNode } from 'react'

import { cn } from '@/components/ui/cn'

/**
 * Horizontal container (PRD Nº8 §15-§16).
 *
 * Four widths, because the product genuinely has four: the full canvas, the
 * editorial grid, an article column, and the reading measure. PRD Nº8 §15 is
 * explicit that not every section should occupy 1440px.
 *
 * The page margin is fluid (see `--page-margin`): 120px at desktop as the
 * reference sheet specifies, collapsing to 20px on a phone, where a 120px
 * margin would leave almost no content.
 */
const widths = {
  wide: 'max-w-[var(--container-wide)]',
  editorial: 'max-w-[var(--container-editorial)]',
  article: 'max-w-[var(--container-article)]',
  reading: 'max-w-[var(--container-reading)]',
  full: 'max-w-none',
} as const

export type ContainerWidth = keyof typeof widths

export type ContainerProps = {
  children: ReactNode
  /** Defaults to the editorial grid width. */
  width?: ContainerWidth
  /** Set false for full-bleed bands that manage their own inset. */
  gutters?: boolean
  as?: ElementType
  className?: string
}

export function Container({
  children,
  width = 'editorial',
  gutters = true,
  as: Component = 'div',
  className,
}: ContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto w-full',
        widths[width],
        gutters && 'px-[var(--page-margin)]',
        className,
      )}
    >
      {children}
    </Component>
  )
}
