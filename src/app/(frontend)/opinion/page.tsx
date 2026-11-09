import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/articles/Breadcrumbs'
import { OpinionCard } from '@/components/articles/OpinionCard'
import { EmptyState } from '@/components/feedback/EmptyState'
import { HeadlineXL, Lead } from '@/components/editorial/Typography'
import { Container } from '@/components/layout/Container'
import { getSiteSettings } from '@/data/site'
import { listPublished } from '@/data/collections'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structuredData'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Opinión',
    description: 'Columnas, análisis y tribuna de debate público de Clasificados Colombia.',
    path: '/opinion',
  })
}

export default async function OpinionHubPage() {
  const [opinions, settings] = await Promise.all([
    listPublished('opinions', { limit: 20 }),
    getSiteSettings(),
  ])

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: settings.siteName, path: '/' },
          { name: 'Opinión' },
        ])}
      />

      <Container width="wide" className="py-12">
        <Breadcrumbs
          items={[{ label: settings.siteName, href: '/' }, { label: 'Opinión' }]}
          className="mb-8"
        />

        <div className="mx-auto flex max-w-3xl flex-col items-center text-center gap-4 border-b border-[var(--color-border)] pb-8">
          <HeadlineXL className="text-balance">Opinión</HeadlineXL>
          <Lead className="mx-auto text-balance whitespace-pre-line text-[color:var(--color-text-muted)]">
            Columnas, análisis y perspectivas sobre el poder, el conflicto y la realidad del país.
          </Lead>
        </div>

        {opinions.length > 0 ? (
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {opinions.map((item) => {
              const author = item.authors[0] ?? { name: 'Redacción', slug: 'redaccion' }

              return (
                <OpinionCard
                  key={item.slug}
                  opinion={{
                    slug: item.slug,
                    title: item.title,
                    publishedAt: item.publishedAt,
                    author: {
                      name: author.name,
                      slug: author.slug,
                    },
                  }}
                  className="rounded-lg border border-[var(--color-border)] p-6 transition-colors hover:border-[var(--color-ink)]"
                />
              )
            })}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl py-16">
            <EmptyState
              title="No hay columnas publicadas"
              message="Las columnas y análisis de opinión aparecerán acá tan pronto sean publicadas."
            />
          </div>
        )}
      </Container>
    </>
  )
}

