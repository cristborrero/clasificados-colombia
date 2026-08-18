'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import { cn } from '@/components/ui/cn'
import { CONTENT_FILTERS, DATE_FILTERS } from '@/search/query'

/**
 * Search filters (PRD Nº9 §49-§53).
 *
 * Two rows: content type and date. §52 rules out a boolean query builder,
 * twenty filters and saved searches, and the reason is that a search UI with
 * more controls than a reader will ever use makes the two that matter harder to
 * find.
 *
 * Rendered as links, not as a form. §53 wants the state in the URL, and links
 * give that for free: the browser back button works, a filtered search is
 * shareable, and it degrades to working navigation with no JavaScript. The
 * component is a Client Component only because it reads the current URL to mark
 * the active option.
 */
function useHref() {
  const pathname = usePathname()
  const params = useSearchParams()

  return (key: string, value: string): string => {
    const next = new URLSearchParams(params.toString())

    if (value === 'all' || value === 'any') next.delete(key)
    else next.set(key, value)

    // Changing a filter returns to the first page. Staying on page 4 of a
    // result set that no longer has four pages shows an empty screen.
    next.delete('page')

    return `${pathname}?${next.toString()}`
  }
}

const optionClass = (active: boolean) =>
  cn(
    'inline-block border px-3 py-1.5 font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)] no-underline',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
    active
      ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[color:var(--color-text-inverse)]'
      : 'border-[var(--color-border)] hover:bg-[var(--color-surface-sunken)]',
  )

export function SearchFilters() {
  const params = useSearchParams()
  const href = useHref()

  const type = params.get('type') ?? 'all'
  const date = params.get('date') ?? 'any'

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Filtrar por tipo">
        <ul className="flex flex-wrap gap-2">
          {CONTENT_FILTERS.map((filter) => (
            <li key={filter.value}>
              <Link
                href={href('type', filter.value)}
                aria-current={type === filter.value ? 'true' : undefined}
                className={optionClass(type === filter.value)}
              >
                {filter.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Filtrar por fecha">
        <ul className="flex flex-wrap gap-2">
          {DATE_FILTERS.map((filter) => (
            <li key={filter.value}>
              <Link
                href={href('date', filter.value)}
                aria-current={date === filter.value ? 'true' : undefined}
                className={optionClass(date === filter.value)}
              >
                {filter.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
