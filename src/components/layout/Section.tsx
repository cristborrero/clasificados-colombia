import type { ReactNode } from 'react'

import { cn } from '@/components/ui/cn'
import { Container, type ContainerWidth } from '@/components/layout/Container'

/**
 * Editorial band (PRD Nº8 §23).
 *
 * A section owns its surface and its vertical breathing room. `tone="inverse"`
 * is how the dark bands in the reference sheet are built — the hero, the
 * denuncias strip, the newsletter block, the footer.
 *
 * PRD Master §45 and PRD Nº8 §140 are firm that dark is an editorial device
 * applied per block, not a global dark mode. Nothing here toggles a theme.
 */
const tones = {
  paper: 'bg-[var(--color-surface)] text-[var(--color-text)]',
  raised: 'bg-[var(--color-surface-raised)] text-[var(--color-text)]',
  sunken: 'bg-[var(--color-surface-sunken)] text-[var(--color-text)]',
  inverse: 'bg-[var(--color-surface-inverse)] text-[var(--color-text-inverse)]',
} as const

const spacings = {
  none: 'py-0',
  sm: 'py-8', //  32px
  md: 'py-12', //  48px
  lg: 'py-16', //  64px
  xl: 'py-24', //  96px
} as const

export type SectionProps = {
  children: ReactNode
  tone?: keyof typeof tones
  spacing?: keyof typeof spacings
  /** Set false when the section supplies its own Container. */
  contained?: boolean
  width?: ContainerWidth
  className?: string
  'aria-labelledby'?: string
}

export function Section({
  children,
  tone = 'paper',
  spacing = 'lg',
  contained = true,
  width = 'wide',
  className,
  ...rest
}: SectionProps) {
  return (
    <section className={cn(tones[tone], spacings[spacing], className)} {...rest}>
      {contained ? <Container width={width}>{children}</Container> : children}
    </section>
  )
}
