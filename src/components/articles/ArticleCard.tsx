import { Dek } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'

import { CardEyebrow } from './parts/CardEyebrow'
import { CardMedia } from './parts/CardMedia'
import { CardMeta } from './parts/CardMeta'
import { CardTitle } from './parts/CardTitle'
import { articlePath, categoryPath, type CardArticle } from './types'

/**
 * The default card: media above, then eyebrow, title, dek, metadata.
 *
 * PRD Nº8 §49 forbids the one card with forty props and fifteen branches. This
 * file is short because the anatomy of §50 lives in five small components that
 * every card in the family shares — the variants differ in composition and
 * layout, not in a `variant` prop threading conditionals through one blob.
 *
 * `group` is what ties the pieces together: hovering the image underlines the
 * headline, without the card being a single giant anchor (§51).
 */
export type ArticleCardProps = {
  article: CardArticle
  /** Heading level, decided by the page's outline rather than by the card. */
  headingLevel?: 'h2' | 'h3' | 'h4'
  showDek?: boolean
  priority?: boolean
  className?: string
}

export function ArticleCard({
  article,
  headingLevel = 'h3',
  showDek = true,
  priority = false,
  className,
}: ArticleCardProps) {
  const href = articlePath(article.category?.slug, article.slug)

  return (
    <article className={cn('group flex flex-col gap-3', className)}>
      {article.image ? (
        <CardMedia
          href={href}
          src={article.image.url}
          alt={article.image.alt}
          priority={priority}
        />
      ) : null}

      {article.category ? (
        <CardEyebrow label={article.category.name} href={categoryPath(article.category.slug)} />
      ) : null}

      <CardTitle href={href} title={article.title} as={headingLevel} />

      {showDek && article.dek ? (
        <Dek className="text-[color:var(--color-text-muted)]">{article.dek}</Dek>
      ) : null}

      <CardMeta authors={article.authors} date={article.publishedAt} />
    </article>
  )
}
