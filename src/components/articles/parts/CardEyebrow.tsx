import Link from 'next/link'

import { Eyebrow } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'

/**
 * Card kicker — the section, or the kind of piece (PRD Nº8 §50).
 *
 * When it names a category it links there, and that link is real: it is a
 * different destination from the headline, so §51's rule against nesting
 * secondary interactive elements inside another link is satisfied by the card
 * never being one anchor in the first place.
 *
 * `tone="accent"` is for the markers that carry weight — INVESTIGACIÓN,
 * OPINIÓN — where PRD Nº8 §53-§54 want the piece to declare what it is before
 * the reader starts reading it as news.
 */
export type CardEyebrowProps = {
  label: string
  href?: string | null
  tone?: 'default' | 'accent'
  className?: string
}

export function CardEyebrow({ label, href, tone = 'default', className }: CardEyebrowProps) {
  const toneClass =
    tone === 'accent' ? 'text-[color:var(--color-accent)]' : 'text-[color:var(--color-text-muted)]'

  if (!href) {
    return <Eyebrow className={cn(toneClass, className)}>{label}</Eyebrow>
  }

  return (
    <Eyebrow className={cn(toneClass, className)}>
      <Link
        href={href}
        className={cn(
          'no-underline underline-offset-4 hover:underline',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
        )}
      >
        {label}
      </Link>
    </Eyebrow>
  )
}
