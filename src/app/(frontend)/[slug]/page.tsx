import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/articles/Breadcrumbs'
import { Byline } from '@/components/articles/Byline'
import { PublicationMeta } from '@/components/articles/PublicationMeta'
import { RelatedContent } from '@/components/articles/RelatedContent'
import { ShareActions } from '@/components/articles/ShareActions'
import { categoryPath } from '@/components/articles/types'
import { RichText } from '@/components/editorial/RichText'
import { Dek, HeadlineXL } from '@/components/editorial/Typography'
import { Container } from '@/components/layout/Container'
import { EditorialImage } from '@/components/media/EditorialImage'
import { CardEyebrow } from '@/components/articles/parts/CardEyebrow'
import { getArticleBySlug } from '@/data/article'
import { getSiteSettings } from '@/data/site'

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
type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) return { title: 'Contenido no encontrado' }

  return {
    title: article.title,
    description: article.dek ?? undefined,
  }
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params

  const [article, settings] = await Promise.all([getArticleBySlug(slug), getSiteSettings()])

  /*
   * `notFound()` covers both "no such article" and "not published". The data
   * layer queries with `overrideAccess: false`, so a draft never arrives here
   * and the two cases are indistinguishable from the outside — which is the
   * point: an unpublished investigation must not be discoverable by the
   * difference between a 404 and a 403.
   */
  if (!article) notFound()

  const shareUrl = `/${article.slug}`

  return (
    <article>
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
