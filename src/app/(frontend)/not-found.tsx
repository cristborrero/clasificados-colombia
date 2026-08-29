import type { Metadata } from 'next'
import Link from 'next/link'

import { LatestNewsList } from '@/components/articles/LatestNewsList'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Stack } from '@/components/layout/Stack'
import { SearchForm } from '@/components/search/SearchForm'
import { listPublished } from '@/data/collections'
import { homePath } from '@/lib/routes'

/**
 * Editorial 404 (F17).
 *
 * A reader arrives here having been let down — a link rotted, a URL was
 * mistyped, a piece was withdrawn. Next's default page tells them the route
 * does not exist, which is true and useless. This one assumes they came looking
 * for something and offers the three ways to find it: search, the latest
 * reporting, and the investigations.
 *
 * Reached only after `redirectOrNotFound` has consulted the redirect table, so
 * by the time this renders the URL really has no destination.
 */

export const metadata: Metadata = {
  title: 'Página no encontrada',
  /*
   * A 404 must never be indexed. It carries no content of its own, and a
   * crawler that indexes it starts serving it as a search result for whatever
   * the broken URL was about.
   *
   * The dynamic segments declare the same thing for URLs that resolve to
   * nothing, so a request that reaches this page through one of them carries
   * two `robots` tags. That overlap is intentional: neither declaration covers
   * the other's case — a URL matching no segment at all reaches this page and
   * nothing else — and two tags that both say `noindex` cost nothing.
   */
  robots: { index: false, follow: true },
}

export default async function NotFound() {
  /*
   * Both lists are fetched, and neither is required. If the database is the
   * reason the reader is here at all, an empty list is a far better answer than
   * an error page inside an error page.
   */
  const [articles, investigations] = await Promise.all([
    listPublished('articles', { limit: 4 }).catch(() => []),
    listPublished('investigations', { limit: 3 }).catch(() => []),
  ])

  return (
    <Section spacing="lg" width="wide">
      <Stack gap="xl">
        <header className="mx-auto max-w-3xl text-center">
          <p className="font-[family-name:var(--font-sans)] text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-accent)]">
            Error 404
          </p>

          <h1 className="mt-2 font-[family-name:var(--font-editorial)] text-[length:var(--text-h1)] leading-tight text-[color:var(--color-text)] font-bold">
            Esta página no existe
          </h1>

          <p className="mx-auto mt-4 font-[family-name:var(--font-sans)] text-lg text-[color:var(--color-text-muted)]">
            Puede que la dirección esté mal escrita, que el enlace haya quedado viejo o que el
            contenido se haya retirado. Busca lo que necesitas o empieza por la{' '}
            <Link href={homePath()} className="underline underline-offset-4">
              portada
            </Link>
            .
          </p>

          <div className="mx-auto mt-8 max-w-lg">
            <SearchForm />
          </div>
        </header>

        {articles.length > 0 && (
          <section aria-labelledby="404-ultimas">
            <SectionHeader id="404-ultimas" title="Últimas noticias" />
            <LatestNewsList articles={articles} headingLevel="h3" />
          </section>
        )}

        {investigations.length > 0 && (
          <section aria-labelledby="404-investigaciones">
            <SectionHeader id="404-investigaciones" title="Investigaciones" />
            <LatestNewsList articles={investigations} headingLevel="h3" />
          </section>
        )}
      </Stack>
    </Section>
  )
}
