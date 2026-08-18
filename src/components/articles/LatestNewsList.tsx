import { cn } from '@/components/ui/cn'

import { ArticleListItem } from './ArticleListItem'
import type { CardArticle } from './types'

/**
 * Chronological stream (PRD Nº8 §45-§46).
 *
 * An `<ol>`, not a stack of divs: the order is the meaning here, and a screen
 * reader announcing "list, 12 items" is the difference between skimming and
 * reading everything.
 *
 * The empty case renders the empty state rather than an empty `<ol>`, because
 * an empty list is indistinguishable from a broken one.
 */
export type LatestNewsListProps = {
  articles: readonly CardArticle[]
  /** Heading level for each item, matching the section it sits in. */
  headingLevel?: 'h3' | 'h4'
  emptyMessage?: string
  className?: string
}

export function LatestNewsList({
  articles,
  headingLevel = 'h3',
  emptyMessage = 'Todavía no hay publicaciones en esta sección.',
  className,
}: LatestNewsListProps) {
  if (articles.length === 0) {
    return (
      <p
        className={cn(
          'py-8 font-[family-name:var(--font-sans)] text-[length:var(--text-body)] text-[color:var(--color-text-muted)]',
          className,
        )}
      >
        {emptyMessage}
      </p>
    )
  }

  return (
    <ol className={cn('flex flex-col', className)}>
      {articles.map((article) => (
        <ArticleListItem key={article.slug} article={article} headingLevel={headingLevel} />
      ))}
    </ol>
  )
}
