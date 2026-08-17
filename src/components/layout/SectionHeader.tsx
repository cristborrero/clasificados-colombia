import type { ReactNode } from 'react'

import { cn } from '@/components/ui/cn'
import { Divider } from '@/components/layout/Divider'

/**
 * Section heading with rule and optional action (PRD Nº8 §47).
 *
 * The pattern the reference sheet repeats down the homepage:
 *
 *     INVESTIGACIONES
 *     ─────────────────────────────
 *     Ver todas →
 *
 * The action is rendered as `children` so the caller decides whether it is a
 * link, and to which route — this component does not want to know about
 * routing.
 */
export type SectionHeaderProps = {
  title: string
  /** Rendered opposite the title. Typically a "Ver todas →" link. */
  action?: ReactNode
  /** Wire to the parent Section's aria-labelledby so the band is announced. */
  id?: string
  /** Heading level. Defaults to h2, which is right inside a page with one h1. */
  as?: 'h2' | 'h3'
  tone?: 'default' | 'inverse'
  className?: string
}

export function SectionHeader({
  title,
  action,
  id,
  as: Heading = 'h2',
  tone = 'default',
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn('mb-6', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <Heading
          id={id}
          className={cn(
            'font-sans text-[length:var(--text-label)] font-semibold tracking-[var(--text-label--letter-spacing)] uppercase',
            tone === 'inverse' ? 'text-[var(--color-text-inverse)]' : 'text-[var(--color-text)]',
          )}
        >
          {title}
        </Heading>

        {action ? <div className="text-[length:var(--text-metadata)]">{action}</div> : null}
      </div>

      <Divider decorative tone={tone === 'inverse' ? 'inverse' : 'strong'} className="mt-2" />
    </header>
  )
}
