import { cn } from '@/components/ui/cn'

/**
 * Chapter navigation (PRD Nº8 §78).
 *
 * *"Sticky en desktop cuando aporte."* It aids when there are chapters to move
 * between, so the component renders nothing below two — a table of contents
 * with one entry is furniture.
 *
 * Anchors within the page rather than routes. PRD SEO §60 is explicit that a
 * chapter which is not substantial should be an internal anchor rather than its
 * own thin URL, and a long investigation read as one document is also how a
 * reader actually reads it.
 *
 * No scroll-spy. Highlighting the current chapter needs a scroll observer, a
 * client component and a decision about what "current" means when two headings
 * share the viewport — for a list a reader glances at twice. The anchors work
 * without any of it.
 */
export type Chapter = { title: string; slug: string }

export function InvestigationContents({
  chapters,
  title = 'Capítulos',
  className,
}: {
  chapters: readonly Chapter[]
  title?: string
  className?: string
}) {
  if (chapters.length < 2) return null

  return (
    <nav
      aria-label={title}
      className={cn('lg:sticky lg:top-24 lg:self-start', className)}
    >
      <p className="font-[family-name:var(--font-sans)] text-[length:var(--text-label)] tracking-[var(--text-label--letter-spacing)] text-[color:var(--color-text-muted)] uppercase">
        {title}
      </p>

      <ol className="mt-4 flex flex-col gap-3 border-l border-[var(--color-border)] pl-4">
        {chapters.map((chapter, index) => (
          <li key={chapter.slug}>
            <a
              href={`#${chapter.slug}`}
              className={cn(
                'font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)]',
                'no-underline underline-offset-4 hover:underline',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
              )}
            >
              <span aria-hidden className="text-[color:var(--color-text-muted)] tabular-nums">
                {String(index + 1).padStart(2, '0')}{' '}
              </span>
              {chapter.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
