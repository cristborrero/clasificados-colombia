import { Dek } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'

import { CardEyebrow } from './parts/CardEyebrow'
import { CardMedia } from './parts/CardMedia'
import { CardMeta } from './parts/CardMeta'
import { CardTitle } from './parts/CardTitle'
import { articlePath, categoryPath, type CardArticle } from './types'

/**
 * The dominant card. One per viewport at most (PRD Nº8 §37).
 *
 * `priority` on the image by default: a featured card is above the fold by
 * definition, and lazy-loading the largest image on the page is how a good
 * Largest Contentful Paint becomes a bad one.
 *
 * The headline takes `h2` by default and the larger size, because on the pages
 * that use this card it is the second-most important text after the page title.
 */
export type ArticleCardFeaturedProps = {
  article: CardArticle
  headingLevel?: 'h2' | 'h3'
  className?: string
}

export function ArticleCardFeatured({
  article,
  headingLevel = 'h2',
  className,
}: ArticleCardFeaturedProps) {
  const href = articlePath(article.category?.slug, article.slug)

  return (
    <article className={cn('group flex flex-col gap-4', className)}>
      {article.image ? (
        <CardMedia
          href={href}
          src={article.image.url}
          alt={article.image.alt}
          sizes="(min-width: 1024px) 66vw, 100vw"
          priority
        />
      ) : null}

      {article.category ? (
        <CardEyebrow label={article.category.name} href={categoryPath(article.category.slug)} />
      ) : null}

      <CardTitle href={href} title={article.title} as={headingLevel} size="lg" />

      {article.dek ? (
        <Dek className="max-w-[60ch] text-[color:var(--color-text-muted)]">{article.dek}</Dek>
      ) : null}

      <CardMeta authors={article.authors} date={article.publishedAt} />
    </article>
  )
}
