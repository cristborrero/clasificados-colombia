import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { Breadcrumbs } from '@/components/articles/Breadcrumbs'
import { Body, HeadlineXL, Metadata as MetaText } from '@/components/editorial/Typography'
import { EmptyState } from '@/components/feedback/EmptyState'
import { InlineError } from '@/components/feedback/Errors'
import { Container } from '@/components/layout/Container'
import { SearchFilters } from '@/components/search/SearchFilters'
import { SearchForm } from '@/components/search/SearchForm'
import { SearchResultItem } from '@/components/search/SearchResultItem'
import { runSearch } from '@/data/search'
import { getSiteSettings } from '@/data/site'

/**
 * Search page (PRD Nº9 §43-§56, §54).
 *
 * Server-rendered. A reader arriving from a shared `/buscar?q=…` link gets
 * results in the first response rather than an empty shell that fetches them —
 * which also means the page works with no JavaScript at all.
 *
 * `noindex, follow` per §54 and PRD SEO: search result pages are infinite,
 * generated on demand and near-duplicates of each other. Letting a crawler
 * index them spends the site's crawl budget on pages nobody linked to. `follow`
 * keeps the links themselves useful.
 */
export const metadata: Metadata = {
  title: 'Buscar',
  robots: { index: false, follow: true },
}

export const dynamic = 'force-dynamic'

type Params = { searchParams: Promise<Record<string, string | string[] | undefined>> }

/** Preserves filters while changing only the page. */
function pageHref(
  params: Record<string, string | string[] | undefined>,
  page: number,
): string {
  const next = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (key === 'page' || value === undefined) continue

    next.set(key, Array.isArray(value) ? (value[0] ?? '') : value)
  }

  if (page > 1) next.set('page', String(page))

  return `/buscar?${next.toString()}`
}

export default async function SearchPage({ searchParams }: Params) {
  const params = await searchParams

  const [outcome, settings] = await Promise.all([runSearch(params), getSiteSettings()])

  return (
    <Container width="wide" className="py-12">
      <Breadcrumbs
        items={[{ label: settings.siteName, href: '/' }, { label: 'Buscar' }]}
        className="mb-8"
      />

      <div className="mx-auto max-w-2xl text-center">
        <HeadlineXL className="text-[length:var(--text-h2)]">Buscar</HeadlineXL>
        <p className="mt-2 text-[length:var(--text-lead)] text-[color:var(--color-text-muted)]">
          Explora artículos, investigaciones y autores
        </p>

        <div className="mt-8">
          <SearchForm defaultValue={outcome.query} />
        </div>

        <div className="mt-6">
          <Suspense fallback={null}>
            <SearchFilters />
          </Suspense>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        {outcome.unavailable ? (
          <InlineError message="La búsqueda no está disponible en este momento. El resto del sitio funciona con normalidad." />
        ) : !outcome.query ? (
          <div className="py-8 text-center">
            <Body className="text-[color:var(--color-text-muted)]">
              Escribe qué estás buscando para comenzar.
            </Body>
          </div>
        ) : outcome.results.length === 0 ? (
          <EmptyState
            title={`Sin resultados para «${outcome.query}»`}
            message="Prueba con menos palabras, o revisa los filtros de tipo y fecha."
          />
        ) : (
          <>
            <MetaText className="text-[color:var(--color-text-muted)]">
              {/* §44: the query, then the count. */}
              Resultados para «{outcome.query}» — {outcome.total}{' '}
              {outcome.total === 1 ? 'resultado' : 'resultados'}
            </MetaText>

            <ol aria-label="Resultados" className="mt-6 divide-y divide-[var(--color-border)]">
              {outcome.results.map((result) => (
                <SearchResultItem key={result.id} result={result} />
              ))}
            </ol>

            {outcome.totalPages > 1 ? (
              <nav aria-label="Paginación" className="mt-10 flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6">
                {outcome.page > 1 ? (
                  <Link
                    href={pageHref(params, outcome.page - 1)}
                    className="font-[family-name:var(--font-sans)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                  >
                    <span aria-hidden>←</span> Anterior
                  </Link>
                ) : (
                  <span />
                )}

                <MetaText className="text-[color:var(--color-text-muted)]">
                  Página {outcome.page} de {outcome.totalPages}
                </MetaText>

                {outcome.page < outcome.totalPages ? (
                  <Link
                    href={pageHref(params, outcome.page + 1)}
                    className="font-[family-name:var(--font-sans)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                  >
                    Siguiente <span aria-hidden>→</span>
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            ) : null}
          </>
        )}
      </div>
    </Container>
  )
}
