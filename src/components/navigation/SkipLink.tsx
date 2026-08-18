import { cn } from '@/components/ui/cn'

/**
 * Skip to content (PRD Nº8 §110, WCAG 2.4.1).
 *
 * The first focusable element on the page. Without it, a keyboard or screen
 * reader user tabs through the entire header — logo, eight sections, search,
 * menu — on every single page before reaching the article they came for.
 *
 * Positioned off-screen rather than `display: none`, because a hidden element
 * is not focusable and the link would never appear.
 */
export function SkipLink({ href = '#contenido' }: { href?: string }) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus-visible:not-sr-only',
        'focus-visible:absolute focus-visible:top-2 focus-visible:left-2 focus-visible:z-50',
        'focus-visible:bg-[var(--color-ink)] focus-visible:px-4 focus-visible:py-2',
        'focus-visible:text-[var(--color-text-inverse)] focus-visible:no-underline',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
      )}
    >
      Saltar al contenido
    </a>
  )
}
