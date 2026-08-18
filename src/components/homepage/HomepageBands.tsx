import Link from 'next/link'

import { ArticleCard } from '@/components/articles/ArticleCard'
import { DataCard } from '@/components/articles/DataCard'
import { HomepageHero } from '@/components/articles/HomepageHero'
import { LatestNewsList } from '@/components/articles/LatestNewsList'
import { OpinionCard } from '@/components/articles/OpinionCard'
import { SecondaryStoryGrid } from '@/components/articles/SecondaryStoryGrid'
import { articlePath, categoryPath, type CardArticle } from '@/components/articles/types'
import { Body, HeadlineMD } from '@/components/editorial/Typography'
import { InvestigationCard, investigationPath } from '@/components/investigations/InvestigationCard'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { VideoCard } from '@/components/media/VideoCard'
import { cn } from '@/components/ui/cn'
import type { EditorialSummary } from '@/data/collections'
import type { CollectionBand, HomepageBand } from '@/data/homepage'
import { formatDuration } from '@/lib/format/duration'

/**
 * Renders whatever bands the editor arranged (PRD Nº8 §37, DoD F10).
 *
 * The switch is on the band kind, and each arm delegates to the F9 card family.
 * Nothing here decides *what* is on the front page — that decision lives in the
 * Homepage Global and is resolved in `src/data/homepage.ts`. This file only
 * knows how each kind of band looks.
 */
const toCard = (item: EditorialSummary): CardArticle => ({
  slug: item.slug,
  title: item.title,
  dek: item.dek,
  publishedAt: item.publishedAt,
  category: item.category,
  authors: item.authors,
  image: item.image,
})

const seeAllLink = (href: string, label: string) => (
  <Link
    href={href}
    className={cn(
      'font-[family-name:var(--font-sans)] no-underline underline-offset-4 hover:underline',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
    )}
  >
    {label} <span aria-hidden>→</span>
  </Link>
)

function CollectionBandView({ band }: { band: CollectionBand }) {
  return (
    // Static classes on purpose: Tailwind scans source text, so a class built
    // by interpolation is a class that never reaches the stylesheet.
    <div className={cn('grid gap-10 md:grid-cols-2 lg:grid-cols-3')}>
      {band.items.map((item) => {
        switch (band.block) {
          case 'investigations':
            return (
              <InvestigationCard
                key={item.slug}
                investigation={{
                  slug: item.slug,
                  title: item.title,
                  dek: item.dek,
                  publishedAt: item.publishedAt,
                  authors: item.authors,
                  image: item.image,
                }}
              />
            )

          case 'opinion':
            return (
              <OpinionCard
                key={item.slug}
                opinion={{
                  slug: item.slug,
                  title: item.title,
                  publishedAt: item.publishedAt,
                  // Opinions carry one signing columnist; the rest of the
                  // byline, if any, belongs on the piece itself.
                  author: item.authors[0] ?? { name: 'Redacción', slug: 'redaccion' },
                }}
              />
            )

          case 'data':
            return (
              <DataCard
                key={item.slug}
                story={{
                  slug: item.slug,
                  title: item.title,
                  dek: item.dek,
                  publishedAt: item.publishedAt,
                  authors: item.authors,
                  figure: item.figure,
                  figureContext: item.figureContext,
                }}
              />
            )

          case 'video':
            return (
              <VideoCard
                key={item.slug}
                video={{
                  slug: item.slug,
                  title: item.title,
                  publishedAt: item.publishedAt,
                  authors: item.authors,
                  poster: item.image,
                  durationText: formatDuration(item.duration),
                }}
              />
            )

          default:
            return <ArticleCard key={item.slug} article={toCard(item)} />
        }
      })}
    </div>
  )
}

export function HomepageBands({ bands }: { bands: readonly HomepageBand[] }) {
  return (
    <>
      {bands.map((band, index) => {
        const key = `${band.kind}-${index}`

        switch (band.kind) {
          case 'hero': {
            const { item } = band

            const isInvestigation = band.source === 'investigations'

            return (
              <Container key={key} width="editorial" as="section" className="py-12">
                <HomepageHero
                  href={isInvestigation ? investigationPath(item.slug) : articlePath(item.slug)}
                  eyebrow={
                    isInvestigation ? 'Investigación' : (item.category?.name ?? 'Última hora')
                  }
                  eyebrowHref={
                    !isInvestigation && item.category ? categoryPath(item.category.slug) : null
                  }
                  eyebrowTone={isInvestigation ? 'accent' : 'default'}
                  title={item.title}
                  dek={item.dek}
                  publishedAt={item.publishedAt}
                  authors={item.authors}
                  image={item.image}
                  imageFirst={band.imageFirst}
                />
              </Container>
            )
          }

          case 'secondary':
            return (
              <Container key={key} width="editorial" as="section" className="py-12">
                {band.title ? <SectionHeader title={band.title} /> : null}
                <SecondaryStoryGrid
                  articles={band.items.map(toCard)}
                  leadCount={band.leadCount}
                />
              </Container>
            )

          case 'latest':
            return (
              <Container key={key} width="editorial" as="section" className="py-12">
                {band.title ? <SectionHeader title={band.title} /> : null}
                <LatestNewsList articles={band.items.map(toCard)} />
              </Container>
            )

          case 'collection':
            return (
              <Container key={key} width="editorial" as="section" className="py-12">
                {band.title ? (
                  <SectionHeader
                    title={band.title}
                    action={band.cta ? seeAllLink(band.cta.href, band.cta.label) : undefined}
                  />
                ) : null}
                <CollectionBandView band={band} />
              </Container>
            )

          case 'newsletter':
            return (
              <section
                key={key}
                className="my-12 bg-[var(--color-surface-inverse)] text-[color:var(--color-text-inverse)]"
              >
                <Container width="reading" className="flex flex-col gap-4 py-14">
                  <HeadlineMD as="h2">{band.title}</HeadlineMD>

                  {band.description ? (
                    <Body className="text-[color:var(--color-text-inverse-muted)]">
                      {band.description}
                    </Body>
                  ) : null}

                  {/*
                    A link to a real page, not an inline form. The newsletter
                    provider is gap G-08 and undecided; a form posting nowhere
                    collects addresses it cannot deliver to, which is worse than
                    no form.
                  */}
                  <p>
                    <Link
                      href="/newsletter"
                      className="font-[family-name:var(--font-sans)] font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                    >
                      {band.ctaLabel}
                    </Link>
                  </p>
                </Container>
              </section>
            )
        }
      })}
    </>
  )
}
