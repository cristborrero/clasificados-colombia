import { cn } from '@/components/ui/cn'
import { formatEditorialDate, toDateTimeAttribute } from '@/lib/format/date'

import { CardEyebrow } from './parts/CardEyebrow'
import { CardTitle } from './parts/CardTitle'
import { articlePath, categoryPath, type CardArticle } from './types'

/**
 * One row of a chronological stream (PRD Nº8 §45-§46).
 *
 * The timestamp leads on desktop, because the whole point of a "últimas" list
 * is when, not what. On mobile it moves below the headline: at 360px a
 * timestamp column takes a third of the line and the headline wraps to four.
 *
 * Rendered as `<li>` by default — a list of items should be a list, or a screen
 * reader cannot say how many there are or where the reader is in them.
 */
export type ArticleListItemProps = {
  article: CardArticle
  headingLevel?: 'h3' | 'h4'
  as?: 'li' | 'article'
  className?: string
}

export function ArticleListItem({
  article,
  headingLevel = 'h3',
  as: Component = 'li',
  className,
}: ArticleListItemProps) {
  const href = articlePath(article.slug)
  const formatted = formatEditorialDate(article.publishedAt)
  const dateTime = toDateTimeAttribute(article.publishedAt)

  return (
    <Component
      className={cn(
        'group flex flex-col gap-1 border-b border-[var(--color-border-subtle)] py-4',
        'sm:flex-row sm:items-baseline sm:gap-6',
        className,
      )}
    >
      {formatted && dateTime ? (
        <time
          dateTime={dateTime}
          className="order-2 shrink-0 font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)] text-[color:var(--color-text-muted)] tabular-nums sm:order-1 sm:w-[10rem]"
        >
          {formatted}
        </time>
      ) : null}

      <div className="order-1 flex flex-col gap-1 sm:order-2">
        {article.category ? (
          <CardEyebrow label={article.category.name} href={categoryPath(article.category.slug)} />
        ) : null}

        <CardTitle
          href={href}
          title={article.title}
          as={headingLevel}
          className="text-[length:var(--text-lead)]"
        />
      </div>
    </Component>
  )
}
