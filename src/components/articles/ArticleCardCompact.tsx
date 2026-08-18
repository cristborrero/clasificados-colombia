import { cn } from '@/components/ui/cn'

import { CardEyebrow } from './parts/CardEyebrow'
import { CardMeta } from './parts/CardMeta'
import { CardTitle } from './parts/CardTitle'
import { articlePath, categoryPath, type CardArticle } from './types'

/**
 * Text-only card for dense columns — sidebars, "más de esta sección".
 *
 * No image and no dek by construction, not by a prop that turns them off. A
 * compact card that could grow an image would end up with one, and the column
 * it was written for would stop being compact.
 */
export type ArticleCardCompactProps = {
  article: CardArticle
  headingLevel?: 'h2' | 'h3' | 'h4'
  showCategory?: boolean
  className?: string
}

export function ArticleCardCompact({
  article,
  headingLevel = 'h3',
  showCategory = true,
  className,
}: ArticleCardCompactProps) {
  const href = articlePath(article.slug)

  return (
    <article className={cn('group flex flex-col gap-1.5', className)}>
      {showCategory && article.category ? (
        <CardEyebrow label={article.category.name} href={categoryPath(article.category.slug)} />
      ) : null}

      <CardTitle
        href={href}
        title={article.title}
        as={headingLevel}
        className="text-[length:var(--text-lead)]"
      />

      <CardMeta date={article.publishedAt} />
    </article>
  )
}
