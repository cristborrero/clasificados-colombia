import { ArticleCard } from '@/components/articles/ArticleCard'
import type { CardArticle } from '@/components/articles/types'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { cn } from '@/components/ui/cn'

/**
 * Related reading (PRD Nº8 §75).
 *
 * At the end of the article and nowhere else. §75 is explicit about not
 * inserting "te puede interesar" every three paragraphs, and the reason is that
 * an article interrupted by recommendations is an article the newsroom is
 * telling the reader to abandon halfway through.
 */
export function RelatedContent({
  articles,
  title = 'Seguí leyendo',
  className,
}: {
  articles: readonly CardArticle[]
  title?: string
  className?: string
}) {
  if (articles.length === 0) return null

  return (
    <section className={cn('mt-20', className)} aria-labelledby="relacionados">
      <SectionHeader title={title} id="relacionados" />

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} headingLevel="h3" showDek={false} />
        ))}
      </div>
    </section>
  )
}
