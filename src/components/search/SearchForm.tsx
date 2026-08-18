import { Search } from 'lucide-react'

import { cn } from '@/components/ui/cn'
import { MAX_QUERY_LENGTH } from '@/search/query'

/**
 * The search input on `/buscar`.
 *
 * A plain GET form, and a Server Component. Submitting navigates to
 * `/buscar?q=…`, which is the same URL a shared link uses — so the page has one
 * way of being reached rather than two, and it works with JavaScript disabled.
 *
 * `type="search"` gives the platform's clear button and the right on-screen
 * keyboard on a phone. The label is present and hidden rather than replaced by
 * a placeholder: a placeholder disappears the moment someone types, which is
 * exactly when a screen reader user needs it.
 */
export function SearchForm({ defaultValue = '' }: { defaultValue?: string }) {
  return (
    // `min-w-0` en el input: sin él, el ancho intrínseco del texto impide que
    // el flex item encoja, y a 360px la fila desborda 8px hacia la derecha.
    <form action="/buscar" method="get" role="search" className="flex flex-wrap gap-2">
      <label htmlFor="q" className="sr-only">
        Buscar en Clasificados Colombia
      </label>

      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        maxLength={MAX_QUERY_LENGTH}
        autoComplete="off"
        placeholder="Contratación pública, fiscalía, elecciones…"
        className={cn(
          'min-w-0 flex-1 border border-[var(--color-border)] bg-[var(--color-surface-raised)]',
          'px-4 py-3 font-[family-name:var(--font-sans)] text-[length:var(--text-body)]',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
        )}
      />

      <button
        type="submit"
        className={cn(
          'inline-flex shrink-0 items-center gap-2 border border-[var(--color-ink)] bg-[var(--color-ink)] px-5 py-3',
          'font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)] text-[color:var(--color-text-inverse)]',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
        )}
      >
        <Search aria-hidden size={18} strokeWidth={1.75} />
        Buscar
      </button>
    </form>
  )
}
