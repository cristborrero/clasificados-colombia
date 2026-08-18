import { Dek } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'

import { CardEyebrow } from './parts/CardEyebrow'
import { CardMedia } from './parts/CardMedia'
import { CardMeta } from './parts/CardMeta'
import { CardTitle } from './parts/CardTitle'
import { articlePath, categoryPath, type CardArticle } from './types'

/**
 * Image beside text. For lists where a stack of vertical cards would scroll
 * forever.
 *
 * Stacks on mobile. A 4:3 thumbnail next to two lines of headline at 360px
 * leaves neither of them legible, and PRD Nº8 §14 puts the mobile reading
 * experience ahead of layout consistency.
 */
export type ArticleCardHorizontalProps = {
  article: CardArticle
  headingLevel?: 'h2' | 'h3' | 'h4'
  showDek?: boolean
  className?: string
}

export function ArticleCardHorizontal({
  article,
  headingLevel = 'h3',
  showDek = true,
  className,
}: ArticleCardHorizontalProps) {
  const href = articlePath(article.slug)

  return (
    <article className={cn('group flex flex-col gap-4 sm:flex-row sm:items-start', className)}>
      {article.image ? (
        <CardMedia
          href={href}
          src={article.image.url}
          alt={article.image.alt}
          aspect="4/3"
          sizes="(min-width: 640px) 200px, 100vw"
          className="sm:w-[200px] sm:shrink-0"
        />
      ) : null}

      <div className="flex flex-col gap-2">
        {article.category ? (
          <CardEyebrow label={article.category.name} href={categoryPath(article.category.slug)} />
        ) : null}

        <CardTitle href={href} title={article.title} as={headingLevel} />

        {showDek && article.dek ? (
          <Dek className="text-[color:var(--color-text-muted)]">{article.dek}</Dek>
        ) : null}

        <CardMeta authors={article.authors} date={article.publishedAt} />
      </div>
    </article>
  )
}
