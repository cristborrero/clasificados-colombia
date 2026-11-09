import type { Metadata } from 'next'
import { redirectOrNotFound } from '@/lib/navigation/notFound'

import { Breadcrumbs } from '@/components/articles/Breadcrumbs'
import { Byline } from '@/components/articles/Byline'
import { PublicationMeta } from '@/components/articles/PublicationMeta'
import { CorrectionsNotice } from '@/components/articles/CorrectionsNotice'
import { RelatedContent } from '@/components/articles/RelatedContent'
import { ShareActions } from '@/components/articles/ShareActions'
import { opinionPath } from '@/lib/routes'
import { RichText } from '@/components/editorial/RichText'
import { Dek, HeadlineXL } from '@/components/editorial/Typography'
import { Container } from '@/components/layout/Container'
import { EditorialImage } from '@/components/media/EditorialImage'
import { CardEyebrow } from '@/components/articles/parts/CardEyebrow'
import { getOpinionBySlug } from '@/data/opinion'
import { getCorrectionsFor } from '@/data/corrections'
import { getSiteSettings } from '@/data/site'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { breadcrumbJsonLd, newsArticleJsonLd } from '@/lib/seo/structuredData'

/**
 * Opinion article template (PRD Nº7 §57-§58, PRD Nº8 §54).
 *
 * Distinct from reporting: marked as "Opinión" clearly, uses OpinionNewsArticle
 * structured data, and highlights the single responsible author.
 */
type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const opinion = await getOpinionBySlug(slug)

  if (!opinion) return { title: 'Opinión no encontrada', robots: { index: false } }

  return buildPageMetadata({
    title: opinion.seo.metaTitle ?? opinion.title,
    description: opinion.seo.metaDescription ?? opinion.dek,
    path: opinionPath(opinion.slug),
    image: opinion.hero.image,
    noindex: opinion.seo.noIndex,
    publishedAt: opinion.publishedAt,
    modifiedAt: opinion.updatedAt,
    authors: opinion.author ? [opinion.author.name] : [],
    section: 'Opinión',
    type: 'article',
  })
}

export default async function OpinionPage({ params }: Params) {
  const { slug } = await params

  const [opinion, settings] = await Promise.all([getOpinionBySlug(slug), getSiteSettings()])

  if (!opinion) return redirectOrNotFound(opinionPath(slug))

  const path = opinionPath(opinion.slug)
  const shareUrl = path

  const corrections = await getCorrectionsFor('opinions', opinion.id)

  const authors = opinion.author ? [opinion.author] : []

  const articleLd = newsArticleJsonLd({
    headline: opinion.title,
    description: opinion.dek,
    path,
    datePublished: opinion.publishedAt,
    dateModified: opinion.updatedAt,
    authors,
    image: opinion.hero.image ? { url: opinion.hero.image.url } : null,
    section: 'Opinión',
    organizationName: settings.siteName,
    isOpinion: true,
  })

  const trail = breadcrumbJsonLd([
    { name: settings.siteName, path: '/' },
    { name: 'Opinión', path: '/opinion' },
    { name: opinion.title },
  ])

  return (
    <article>
      {articleLd ? <JsonLd data={articleLd} /> : null}
      <JsonLd data={trail} />

      <Container width="wide" className="pt-8 pb-6">
        <Breadcrumbs
          items={[
            { label: settings.siteName, href: '/' },
            { label: 'Opinión', href: '/opinion' },
            { label: opinion.title },
          ]}
          className="mb-8"
        />

        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex justify-center">
            <CardEyebrow label="Opinión" href="/opinion" tone="accent" />
          </div>

          <HeadlineXL className="text-balance">{opinion.title}</HeadlineXL>

          {opinion.dek ? (
            <Dek className="mx-auto mt-5 whitespace-pre-line text-[length:var(--text-lead)] text-[color:var(--color-text-muted)]">
              {opinion.dek}
            </Dek>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-y border-[var(--color-border)] py-4">
            <Byline authors={authors} />

            <PublicationMeta
              publishedAt={opinion.publishedAt}
              updatedAt={opinion.updatedAt}
              wordCount={opinion.wordCount}
            />

            <ShareActions url={shareUrl} title={opinion.title} />
          </div>
        </header>
      </Container>

      {opinion.hero.image ? (
        <Container width="wide" className="pb-12">
          <EditorialImage
            src={opinion.hero.image.url}
            alt={opinion.hero.image.alt}
            width={1600}
            height={1067}
            caption={opinion.hero.caption}
            credit={opinion.hero.credit}
            sizes="(min-width: 1440px) 1440px, 100vw"
            priority
          />
        </Container>
      ) : null}

      <Container width="wide" className="pb-20">
        <div className="mx-auto max-w-3xl">
          <RichText data={opinion.body} />
          <CorrectionsNotice corrections={corrections} className="mt-14" />
        </div>
      </Container>

      {opinion.related.length > 0 ? (
        <Container width="wide" className="pb-24">
          <RelatedContent
            title="Más columnas de opinión"
            articles={opinion.related.map((item) => ({
              slug: item.slug,
              title: item.title,
              dek: item.dek,
              publishedAt: item.publishedAt,
              category: { name: 'Opinión', slug: 'opinion' },
              authors: item.authors,
              image: item.image,
            }))}
          />
        </Container>
      ) : null}
    </article>
  )
}

