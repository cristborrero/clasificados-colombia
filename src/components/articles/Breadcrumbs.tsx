import Link from 'next/link'

import { cn } from '@/components/ui/cn'

/**
 * Breadcrumbs (PRD Nº8 §57, PRD SEO §54).
 *
 * A `<nav>` with an ordered list, because the order carries the meaning: this
 * page sits inside that section, which sits inside the site. A row of links
 * separated by slashes says nothing to a screen reader.
 *
 * `aria-current="page"` on the last item, which is text rather than a link —
 * a link to the page you are already on is a focus stop that goes nowhere.
 */
export type Crumb = { label: string; href?: string | null }

export function Breadcrumbs({ items, className }: { items: readonly Crumb[]; className?: string }) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Ruta de navegación" className={className}>
      <ol className="flex flex-wrap items-center gap-2 font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)] text-[color:var(--color-text-muted)]">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden>/</span> : null}

            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  'no-underline underline-offset-4 hover:underline',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
