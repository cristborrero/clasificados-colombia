import type { Metadata } from 'next'

import { ArticleCard } from '@/components/articles/ArticleCard'
import { ArticleCardCompact } from '@/components/articles/ArticleCardCompact'
import { ArticleCardFeatured } from '@/components/articles/ArticleCardFeatured'
import { ArticleCardHorizontal } from '@/components/articles/ArticleCardHorizontal'
import { DataCard } from '@/components/articles/DataCard'
import { LatestNewsList } from '@/components/articles/LatestNewsList'
import { OpinionCard } from '@/components/articles/OpinionCard'
import type { CardArticle } from '@/components/articles/types'
import { EvidenceCard } from '@/components/evidence/EvidenceCard'
import { EmptyState } from '@/components/feedback/EmptyState'
import { InlineError, PageError } from '@/components/feedback/Errors'
import { CardSkeleton, PageSkeleton } from '@/components/feedback/Skeletons'
import { InvestigationCard } from '@/components/investigations/InvestigationCard'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { VideoCard } from '@/components/media/VideoCard'

/**
 * F9 card showcase.
 *
 * The DoD for this phase is a list of states each card has to survive: a
 * 120–160 character headline, a very short one, no image, several authors, and
 * all of it on a phone. Those are not assertions a unit test makes well — they
 * are things you look at. This page puts every card next to every one of those
 * states on one screen so the check is a scroll rather than an archaeology
 * expedition.
 *
 * `noindex`: it is a workbench, not journalism.
 */
export const metadata: Metadata = {
  title: 'Componentes editoriales',
  robots: { index: false, follow: false },
}

const LONG_TITLE =
  'Los contratos de la gobernación que la administración firmó sin licitación durante la emergencia y que hoy nadie en la entidad quiere explicar'

const SHORT_TITLE = 'Renunció el ministro'

const authors = [
  { name: 'Ana Restrepo', slug: 'ana-restrepo' },
  { name: 'Julián Gómez', slug: 'julian-gomez' },
  { name: 'Marta Ochoa', slug: 'marta-ochoa' },
]

const image = { url: '/brand/logomark.svg', alt: 'Imagen de prueba del sistema de diseño' }

const base: CardArticle = {
  slug: 'demo-nota',
  title: LONG_TITLE,
  dek: 'La bajada explica en una frase por qué la nota importa, sin repetir el titular.',
  publishedAt: '2026-08-18T14:30:00.000Z',
  category: { name: 'Política', slug: 'demo-politica' },
  authors: [authors[0]!],
  image,
}

const variants: { label: string; article: CardArticle }[] = [
  { label: 'Titular largo (120–160 caracteres)', article: base },
  { label: 'Titular corto', article: { ...base, title: SHORT_TITLE } },
  { label: 'Sin imagen', article: { ...base, image: null } },
  { label: 'Varios autores', article: { ...base, authors } },
  { label: 'Sin bajada ni categoría', article: { ...base, dek: null, category: null } },
]

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">{children}</div>
}

function Case({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-[family-name:var(--font-sans)] text-[length:var(--text-label)] tracking-[var(--text-label--letter-spacing)] text-[color:var(--color-text-muted)] uppercase">
        {label}
      </p>
      {children}
    </div>
  )
}

export default function EditorialComponentsPage() {
  return (
    <Container width="wide" className="flex flex-col gap-20 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-[family-name:var(--font-editorial)] text-[length:var(--text-h1)]">
          Componentes editoriales
        </h1>
        <p className="max-w-[60ch] text-[length:var(--text-lead)] text-[color:var(--color-text-muted)]">
          Cada tarjeta con los estados que exige el DoD de F9. Revisar también a 360, 390 y 430 px.
        </p>
      </header>

      <section>
        <SectionHeader title="ArticleCard" />
        <Grid>
          {variants.map((variant) => (
            <Case key={variant.label} label={variant.label}>
              <ArticleCard article={variant.article} />
            </Case>
          ))}
        </Grid>
      </section>

      <section>
        <SectionHeader title="ArticleCardFeatured" />
        <div className="grid gap-10 lg:grid-cols-2">
          {variants.slice(0, 3).map((variant) => (
            <Case key={variant.label} label={variant.label}>
              <ArticleCardFeatured article={variant.article} headingLevel="h3" />
            </Case>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="ArticleCardHorizontal" />
        <div className="flex flex-col gap-10">
          {variants.map((variant) => (
            <Case key={variant.label} label={variant.label}>
              <ArticleCardHorizontal article={variant.article} />
            </Case>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="ArticleCardCompact" />
        <Grid>
          {variants.map((variant) => (
            <Case key={variant.label} label={variant.label}>
              <ArticleCardCompact article={variant.article} />
            </Case>
          ))}
        </Grid>
      </section>

      <section>
        <SectionHeader title="LatestNewsList" />
        <LatestNewsList
          articles={variants.map((variant, index) => ({
            ...variant.article,
            slug: `demo-lista-${index}`,
          }))}
        />
      </section>

      <section>
        <SectionHeader title="LatestNewsList · vacía" />
        <LatestNewsList articles={[]} />
      </section>

      <section>
        <SectionHeader title="Tarjetas especializadas" />
        <Grid>
          <Case label="InvestigationCard">
            <InvestigationCard
              investigation={{
                slug: 'demo-investigacion',
                title: LONG_TITLE,
                dek: 'Ocho meses de revisión de contratos y una base de datos que la entidad nunca publicó.',
                publishedAt: base.publishedAt,
                authors,
                image,
                evidenceSummary: '12 documentos',
              }}
            />
          </Case>

          <Case label="OpinionCard">
            <OpinionCard
              opinion={{
                slug: 'demo-opinion',
                title: 'La contratación de emergencia no puede ser un cheque en blanco',
                publishedAt: base.publishedAt,
                author: {
                  name: 'Ana Restrepo',
                  slug: 'ana-restrepo',
                  jobTitle: 'Editora de investigación',
                  portrait: image,
                },
              }}
            />
          </Case>

          <Case label="DataCard">
            <DataCard
              story={{
                slug: 'demo-datos',
                title: 'Cuánto se contrató sin licitación en 2025',
                dek: 'Revisamos 4.200 contratos publicados en el SECOP.',
                publishedAt: base.publishedAt,
                authors: [authors[1]!],
                figure: '68.000 M',
                figureContext: 'de pesos adjudicados sin licitación',
              }}
            />
          </Case>

          <Case label="DataCard · cifra sin contexto (se omite)">
            <DataCard
              story={{
                slug: 'demo-datos-2',
                title: 'La cifra se oculta si no viene acompañada',
                publishedAt: base.publishedAt,
                figure: '68.000 M',
              }}
            />
          </Case>

          <Case label="VideoCard">
            <VideoCard
              video={{
                slug: 'demo-video',
                title: 'Lo que encontramos en los contratos',
                publishedAt: base.publishedAt,
                authors: [authors[2]!],
                poster: image,
                durationText: '4:32',
              }}
            />
          </Case>

          <Case label="VideoCard · sin póster ni duración">
            <VideoCard
              video={{ slug: 'demo-video-2', title: SHORT_TITLE, publishedAt: base.publishedAt }}
            />
          </Case>
        </Grid>
      </section>

      <section>
        <SectionHeader title="EvidenceCard" />
        <div className="grid gap-6 lg:grid-cols-2">
          <EvidenceCard
            evidence={{
              id: 1,
              documentType: 'Contrato',
              title: 'Contrato 2025-0431 de prestación de servicios',
              institution: 'Gobernación (entidad de prueba)',
              documentDate: '2025-11-03T00:00:00.000Z',
              description: 'Documento público de demostración. No corresponde a un caso real.',
              pageCount: 18,
            }}
          />

          <EvidenceCard
            evidence={{ id: 2, title: 'Documento con metadatos mínimos' }}
          />
        </div>
      </section>

      <section>
        <SectionHeader title="Estados" />
        <div className="flex flex-col gap-10">
          <Case label="CardSkeleton">
            <div className="max-w-sm">
              <CardSkeleton />
            </div>
          </Case>

          <Case label="InlineError">
            <InlineError />
          </Case>

          <Case label="EmptyState">
            <EmptyState
              title="Todavía no publicamos en esta sección"
              message="Cuando haya piezas nuevas aparecerán acá."
            />
          </Case>

          <Case label="PageSkeleton">
            <PageSkeleton count={3} />
          </Case>

          <Case label="PageError">
            <PageError reference="demo-0000" />
          </Case>
        </div>
      </section>
    </Container>
  )
}
