import Link from 'next/link'

import { ArticleCard } from '@/components/articles/ArticleCard'
import { DataCard } from '@/components/articles/DataCard'
import { HomepageHero } from '@/components/articles/HomepageHero'
import { OpinionCard } from '@/components/articles/OpinionCard'
import { SecondaryStoryGrid } from '@/components/articles/SecondaryStoryGrid'
import { articlePath, categoryPath, type CardArticle } from '@/components/articles/types'
import { Body } from '@/components/editorial/Typography'
import { InvestigationCard, investigationPath } from '@/components/investigations/InvestigationCard'
import { Container } from '@/components/layout/Container'
import { searchPath } from '@/lib/routes'
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
              /*
                A sangre, no dentro del contenedor: el panel oscuro de la guía
                visual llega a los bordes de la pantalla. El texto de adentro
                sigue teniendo su propio margen.
              */
              <section key={key}>
                <HomepageHero
                  href={
                    isInvestigation
                      ? investigationPath(item.slug)
                      : articlePath(item.category?.slug, item.slug)
                  }
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
                  ctaLabel={isInvestigation ? 'Leer investigación' : 'Leer la nota'}
                />
              </section>
            )
          }

          case 'secondary':
            return (
              <Container key={key} width="wide" as="section" className="py-12">
                {band.title ? <SectionHeader title={band.title} /> : null}
                <SecondaryStoryGrid
                  articles={band.items.map(toCard)}
                  leadCount={band.leadCount}
                />
              </Container>
            )

          case 'latest':
            /*
             * Tarjetas con foto, no una lista de texto (guía visual §02).
             *
             * La lista se leía como un índice: fecha, sección, titular, y nada
             * que mirar. En un medio visual la portada se recorre con los ojos
             * antes que con la atención, y una banda sin imágenes se salta.
             *
             * Sin bajada a propósito: la guía muestra sección, titular y fecha.
             * Agregar el sumario alarga cada tarjeta y rompe la fila.
             */
            return (
              <Container key={key} width="wide" as="section" className="py-12">
                {band.title ? (
                  <SectionHeader
                    title={band.title}
                    action={
                      <Link
                        href={searchPath()}
                        className="text-label font-semibold tracking-[0.08em] text-[color:var(--color-text-muted)] uppercase no-underline hover:text-[color:var(--color-accent)]"
                      >
                        Ver todas <span aria-hidden>→</span>
                      </Link>
                    }
                  />
                ) : null}

                {/*
                  Sigue siendo una lista ordenada aunque se dibuje como
                  rejilla. Un flujo de noticias es una lista y su orden es
                  información: un lector con lector de pantalla oye «lista de
                  ocho elementos» y sabe dónde está parado, cosa que una reja de
                  divs no le dice.
                */}
                <ol
                  /*
                   * Identificada porque ya no es la única lista de la portada:
                   * la banda de tres columnas trajo la suya. Las pruebas que
                   * verifican el orden del flujo apuntan acá, no a «la primera
                   * lista que aparezca».
                   */
                  data-band="latest"
                  className="mt-6 grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[var(--gutter)]"
                >
                  {band.items.map((item) => (
                    <li key={item.slug}>
                      <ArticleCard article={toCard(item)} showDek={false} />
                    </li>
                  ))}
                </ol>
              </Container>
            )

          case 'collection':
            return (
              <Container key={key} width="wide" as="section" className="py-12">
                {band.title ? (
                  <SectionHeader
                    title={band.title}
                    action={band.cta ? seeAllLink(band.cta.href, band.cta.label) : undefined}
                  />
                ) : null}
                <CollectionBandView band={band} />
              </Container>
            )

          case 'trio': {
            /*
             * Tres columnas de igual ancho, con contenido de tres naturalezas
             * distintas: investigaciones en lista, un análisis con fotografía y
             * una cifra. Cada columna se apaga si no hay material de ese tipo,
             * y la banda entera ya no llega si las tres están vacías — de eso
             * se encarga el resolutor.
             *
             * En móvil se apilan en el orden en que están escritas, que es el
             * orden de importancia editorial.
             */
            const { investigations, analysis, data } = band

            return (
              <Container key={key} width="wide" as="section" className="py-12">
                <div className="grid gap-10 lg:grid-cols-3 lg:gap-[var(--gutter)]">
                  {investigations.items.length > 0 ? (
                    <div className="flex flex-col gap-5">
                      <SectionHeader title={investigations.title} as="h2" />

                      <ol className="flex list-none flex-col gap-5 p-0">
                        {investigations.items.map((item) => (
                          <li key={item.slug}>
                            <InvestigationCard
                              investigation={{
                                slug: item.slug,
                                title: item.title,
                                dek: item.dek,
                                publishedAt: item.publishedAt,
                                authors: item.authors,
                              }}
                              headingLevel="h3"
                            />
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}

                  {analysis.item ? (
                    <div className="flex flex-col gap-5">
                      <SectionHeader title={analysis.title} as="h2" />
                      <ArticleCard article={toCard(analysis.item)} headingLevel="h3" />
                    </div>
                  ) : null}

                  {data.item ? (
                    <div className="flex flex-col gap-5">
                      <SectionHeader title={data.title} as="h2" />
                      <DataCard
                        story={{
                          slug: data.item.slug,
                          title: data.item.title,
                          dek: data.item.dek,
                          publishedAt: data.item.publishedAt,
                          authors: data.item.authors,
                          figure: data.item.figure,
                          figureContext: data.item.figureContext,
                        }}
                        headingLevel="h3"
                      />
                    </div>
                  ) : null}
                </div>
              </Container>
            )
          }

          case 'newsletter': {
            /*
             * La banda oscura de cierre (guía visual §02).
             *
             * Tres cosas que un medio de investigación pide en el mismo sitio:
             * que le manden material, que lo sigan y que lo lean por correo.
             * Estaban en tres lugares distintos —o en ninguno— y la guía las
             * junta al pie de la portada, que es donde el lector termina.
             *
             * La columna de denuncias va primera a propósito: es la única que
             * pide algo al lector en vez de ofrecerle algo.
             */
            const titulo =
              'text-label font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-inverse-muted)]'

            return (
              <section
                key={key}
                className="mt-16 bg-[var(--color-surface-inverse)] text-[color:var(--color-text-inverse)]"
              >
                <Container width="wide" className="py-14">
                  <div className="grid gap-10 lg:grid-cols-3 lg:gap-[var(--gutter)]">
                    <div className="flex flex-col gap-3">
                      <p className={titulo}>Denuncias ciudadanas</p>

                      <Body className="text-[color:var(--color-text-inverse-muted)]">
                        Tu información puede cambiar la historia. Puedes enviarla de forma anónima.
                      </Body>

                      <Link
                        href="/denunciar"
                        className="mt-1 inline-flex w-fit items-center gap-2 bg-[var(--color-accent)] px-5 py-3 text-label font-semibold tracking-[0.08em] text-[color:var(--color-white)] uppercase no-underline transition-colors hover:bg-[var(--color-red-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-white)]"
                      >
                        Enviar denuncia
                        <span aria-hidden>→</span>
                      </Link>
                    </div>

                    {band.social.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        <p className={titulo}>Síguenos</p>

                        <ul className="flex list-none flex-wrap gap-x-5 gap-y-2 p-0">
                          {band.social.map((red) => (
                            <li key={red.platform}>
                              <a
                                href={red.url}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="font-[family-name:var(--font-sans)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-white)]"
                              >
                                {red.platform}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-3">
                      <p className={titulo}>{band.title}</p>

                      {band.description ? (
                        <Body className="text-[color:var(--color-text-inverse-muted)]">
                          {band.description}
                        </Body>
                      ) : null}

                      {/*
                        Un enlace a una página, no un formulario aquí.
                        El proveedor de boletines sigue sin decidirse (hueco
                        G-08), y un formulario que no envía a ningún lado
                        recoge direcciones a las que no puede escribir — peor
                        que no tener formulario.
                      */}
                      <Link
                        href="/newsletter"
                        className="mt-1 inline-flex w-fit items-center gap-2 bg-[var(--color-accent)] px-5 py-3 text-label font-semibold tracking-[0.08em] text-[color:var(--color-white)] uppercase no-underline transition-colors hover:bg-[var(--color-red-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-white)]"
                      >
                        {band.ctaLabel}
                        <span aria-hidden>→</span>
                      </Link>
                    </div>
                  </div>
                </Container>
              </section>
            )
          }
        }
      })}
    </>
  )
}
