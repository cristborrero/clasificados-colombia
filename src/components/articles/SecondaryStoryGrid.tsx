import { cn } from '@/components/ui/cn'

import { ArticleCard } from './ArticleCard'
import { ArticleCardCompact } from './ArticleCardCompact'
import type { CardArticle } from './types'

/**
 * Secondary stories (PRD Nº8 §44).
 *
 * *"No todas con mismo peso."* Four equal cards in a row is a grid, not an
 * edition — it tells the reader that the newsroom has no opinion about what
 * matters most, which on an investigative outlet is the opposite of the point.
 *
 * So the first two keep their images and deks, and the rest drop to compact
 * text. The split is `leadCount`, not a per-card prop, so the hierarchy is a
 * property of the band rather than something an editor has to remember to set
 * on each item.
 */
export type SecondaryStoryGridProps = {
  articles: readonly CardArticle[]
  /** How many keep full weight. */
  leadCount?: number
  headingLevel?: 'h3' | 'h4'
  className?: string
}

export function SecondaryStoryGrid({
  articles,
  leadCount = 2,
  headingLevel = 'h3',
  className,
}: SecondaryStoryGridProps) {
  if (articles.length === 0) return null

  const lead = articles.slice(0, leadCount)
  const rest = articles.slice(leadCount)

  return (
    <div className={cn('grid gap-10 lg:grid-cols-12 lg:gap-[var(--gutter)]', className)}>
      <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8">
        {lead.map((article) => (
          <ArticleCard key={article.slug} article={article} headingLevel={headingLevel} />
        ))}
      </div>

      {rest.length > 0 ? (
        <div className="flex flex-col gap-6 border-t border-[var(--color-border)] pt-6 lg:col-span-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          {rest.map((article) => (
            <ArticleCardCompact
              key={article.slug}
              article={article}
              headingLevel={headingLevel}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
