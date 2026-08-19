import type { Metadata } from 'next'
import { redirectOrNotFound } from '@/lib/navigation/notFound'

import { Breadcrumbs } from '@/components/articles/Breadcrumbs'
import { Byline } from '@/components/articles/Byline'
import { PublicationMeta } from '@/components/articles/PublicationMeta'
import { CorrectionsNotice } from '@/components/articles/CorrectionsNotice'
import { RelatedContent } from '@/components/articles/RelatedContent'
import { ShareActions } from '@/components/articles/ShareActions'
import { articlePath, categoryPath } from '@/lib/routes'
import { RichText } from '@/components/editorial/RichText'
import { Dek, HeadlineXL } from '@/components/editorial/Typography'
import { Container } from '@/components/layout/Container'
import { EditorialImage } from '@/components/media/EditorialImage'
import { CardEyebrow } from '@/components/articles/parts/CardEyebrow'
import { getArticleBySlug } from '@/data/article'
import { getCorrectionsFor } from '@/data/corrections'
import { getSiteSettings } from '@/data/site'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { breadcrumbJsonLd, newsArticleJsonLd } from '@/lib/seo/structuredData'

/**
 * Article template (PRD Nº8 §57-§75).
 *
 * The running order §57 fixes: breadcrumbs, eyebrow, headline, dek, byline,
 * metadata, share, hero, caption, body, related.
 *
 * §58 — the header is not inside a card. It sits on the page, at the page's own
 * margins, and reads as an editorial cover rather than as a component.
 *
 * §59 — the headline does not span 1440px. It lives in the article column, and
 * the body lives in the narrower reading measure, because those are two
 * different jobs: a headline is scanned, a paragraph is read.
 *
 * The full metadata layer — canonical, Open Graph, JSON-LD — is F16. What is
 * here is the title and description a page needs to be shareable at all.
 */
type Params = { params: Promise<{ categoria: string; articulo: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { articulo } = await params
  const article = await getArticleBySlug(articulo)

  if (!article) return { title: 'Contenido no encontrado', robots: { index: false } }

  return buildPageMetadata({
    /*
     * The SEO title may differ from the headline — an editor writes for the
     * search result there — but the headline is the fallback, never a generated
     * variation of it (PRD SEO §7).
     */
    title: article.seo.metaTitle ?? article.title,
    description: article.seo.metaDescription ?? article.dek,
    path: articlePath(article.category?.slug, article.slug),
    image: article.hero.image,
    noindex: article.seo.noIndex,
    publishedAt: article.publishedAt,
    modifiedAt: article.updatedAt,
    authors: article.authors.map((author) => author.name),
    section: article.category?.name,
    type: 'article',
  })
}

export default async function ArticlePage({ params }: Params) {
  const { categoria, articulo } = await params

  const [article, settings] = await Promise.all([getArticleBySlug(articulo), getSiteSettings()])

  /*
   * One answer covers both "no such article" and "not published". The data
   * layer queries with `overrideAccess: false`, so a draft never arrives here
   * and the two cases are indistinguishable from the outside — which is the
   * point: an unpublished investigation must not be discoverable by the
   * difference between a 404 and a 403.
   *
   * `redirectOrNotFound` consults the redirect table first, so a slug that
   * changed after publication still resolves instead of losing the old URL.
   */
  if (!article) return redirectOrNotFound(articlePath(categoria, articulo))

  /*
   * The category in the path has to match the article's own, or the same piece
   * would be reachable at every category — duplicate content that PRD SEO §9
   * exists to prevent. A mismatch is a 404 here; a genuine re-filing writes a
   * redirect through the Redirects collection.
   */
  if (article.category && article.category.slug !== categoria)
    return redirectOrNotFound(articlePath(categoria, articulo))

  const path = articlePath(article.category?.slug, article.slug)
  const shareUrl = path

  /*
   * Fetched after the article, not alongside it: the id to query by is the
   * article's, and there is nothing to look up if the piece does not exist.
   */
  const corrections = await getCorrectionsFor('articles', article.id)

  /*
   * Structured data is generated from the content, never written by an editor
   * (PRD SEO §51). Hand-typed JSON-LD drifts from the page the moment either
   * changes, and the drift is invisible — it surfaces only as a rich result
   * that quietly stops appearing.
   */
  const articleLd = newsArticleJsonLd({
    headline: article.title,
    description: article.dek,
    path,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    authors: article.authors,
    image: article.hero.image ? { url: article.hero.image.url } : null,
    section: article.category?.name,
    keywords: article.topics.map((topic) => topic.name),
    organizationName: settings.siteName,
  })

  const trail = breadcrumbJsonLd([
    { name: settings.siteName, path: '/' },
    ...(article.category ? [{ name: article.category.name, path: categoryPath(article.category.slug) }] : []),
    { name: article.title },
  ])

  return (
    <article>
      <JsonLd data={articleLd} />
      <JsonLd data={trail} />

      <Container width="article" className="pt-8 pb-6">
        <Breadcrumbs
          items={[
            { label: settings.siteName, href: '/' },
            ...(article.category
              ? [{ label: article.category.name, href: categoryPath(article.category.slug) }]
              : []),
            { label: article.title },
          ]}
          className="mb-8"
        />

        {article.category ? (
          <CardEyebrow
            label={article.category.name}
            href={categoryPath(article.category.slug)}
            className="mb-3"
          />
        ) : null}

        {/* §59: the headline is limited to the article column, not the canvas. */}
        <HeadlineXL>{article.title}</HeadlineXL>

        {article.dek ? (
          <Dek className="mt-5 max-w-[52ch] text-[color:var(--color-text-muted)]">
            {article.dek}
          </Dek>
        ) : null}

        <div className="mt-8 flex flex-col gap-4 border-t border-[var(--color-border)] pt-6">
          <Byline authors={article.authors} />

          <PublicationMeta
            publishedAt={article.publishedAt}
            updatedAt={article.updatedAt}
            wordCount={article.wordCount}
          />

          <ShareActions url={shareUrl} title={article.title} className="mt-2" />
        </div>
      </Container>

      {article.hero.image ? (
        <Container width="article" className="pb-10">
          {/* §63: the story's own ratio, no aggressive crop. The image keeps
              its intrinsic dimensions and the column decides the width. */}
          <EditorialImage
            src={article.hero.image.url}
            alt={article.hero.image.alt}
            width={1600}
            height={1067}
            caption={article.hero.caption}
            credit={article.hero.credit}
            sizes="(min-width: 900px) 900px, 100vw"
            priority
          />
        </Container>
      ) : null}

      <Container width="reading" className="pb-16">
        <RichText data={article.body} />

        {/*
          After the body, inside the reading column. A correction belongs to the
          piece, not to the page furniture around it, and putting it out at
          editorial width would read as a site-wide notice.
        */}
        <CorrectionsNotice corrections={corrections} className="mt-12" />
      </Container>

      <Container width="editorial" className="pb-24">
        <RelatedContent
          articles={article.related.map((item) => ({
            slug: item.slug,
            title: item.title,
            dek: item.dek,
            publishedAt: item.publishedAt,
            category: item.category,
            authors: item.authors,
            image: item.image,
          }))}
        />
      </Container>
    </article>
  )
}
