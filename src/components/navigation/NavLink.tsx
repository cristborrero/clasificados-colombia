import Link from 'next/link'

import { cn } from '@/components/ui/cn'
import { linkRel, type ResolvedLink } from '@/lib/navigation/links'

/**
 * One resolved navigation link.
 *
 * Underline on hover rather than a colour change: PRD Nº8 §108 forbids colour
 * as the only channel, and an underline is the one affordance that survives
 * greyscale, colour blindness and a high-contrast mode.
 *
 * The focus ring is never removed. `focus-visible` keeps it away from mouse
 * users without taking it from keyboard users, which is the only reason
 * `outline: none` ever seemed acceptable.
 */
export type NavLinkProps = {
  link: ResolvedLink
  current?: boolean
  className?: string
  onNavigate?: () => void
}

export function NavLink({ link, current = false, className, onNavigate }: NavLinkProps) {
  return (
    <Link
      href={link.href}
      target={link.newTab ? '_blank' : undefined}
      rel={linkRel(link)}
      aria-current={current ? 'page' : undefined}
      onClick={onNavigate}
      className={cn(
        'font-[family-name:var(--font-sans)] no-underline',
        'underline-offset-4 hover:underline',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
        current && 'underline decoration-[var(--color-accent)] decoration-2',
        className,
      )}
    >
      {link.label}
    </Link>
  )
}
