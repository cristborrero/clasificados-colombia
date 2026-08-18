import Link from 'next/link'

import { HeadlineLG, HeadlineMD } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'

/**
 * Card headline — the card's one real link (PRD Nº8 §51).
 *
 * `group-hover:underline` rather than a colour change: PRD Nº8 §52 asks for a
 * headline underline on hover, and §108 forbids colour as the only channel.
 * The `group` is the card, so hovering the image underlines the headline too
 * and the whole card reads as one target without being one giant anchor.
 *
 * The heading level is a prop because it depends on the page, not on the card.
 * A card inside a section that already has an `h2` needs an `h3`, and getting
 * that wrong produces a document outline a screen reader cannot navigate.
 */
export type CardTitleProps = {
  href: string
  title: string
  size?: 'lg' | 'md'
  as?: 'h2' | 'h3' | 'h4'
  className?: string
}

export function CardTitle({ href, title, size = 'md', as = 'h3', className }: CardTitleProps) {
  const Heading = size === 'lg' ? HeadlineLG : HeadlineMD

  return (
    <Heading as={as} className={className}>
      <Link
        href={href}
        className={cn(
          'no-underline underline-offset-[3px] group-hover:underline',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
        )}
      >
        {title}
      </Link>
    </Heading>
  )
}
