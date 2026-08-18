import Link from 'next/link'

import { cn } from '@/components/ui/cn'
import { Container } from '@/components/layout/Container'
import { SEVERITY_LABEL, type ActiveBreakingNews } from '@/lib/breaking/active'

/**
 * Breaking-news bar (PRD Nº8 §26, PRD Nº5 §25-§26).
 *
 * Every severity prints its own word. PRD Nº8 §108: colour is never the only
 * channel — the bar has to work in greyscale, for a colour-blind reader and for
 * someone listening to it.
 *
 * `role="status"` with `aria-live="polite"`, not `alert`: `alert` interrupts a
 * screen reader mid-sentence, which is right for "your session is about to
 * expire" and wrong for a news banner that was already there when the page
 * loaded.
 *
 * ALERTA is the amber state from delta D-01. Ink on `--color-alert` is 7.37:1,
 * so it takes dark text where the other three take light.
 */
const severityClasses = {
  breaking: 'bg-[var(--color-breaking)] text-[var(--color-white)]',
  alert: 'bg-[var(--color-alert)] text-[var(--color-ink)]',
  developing: 'bg-[var(--color-ink)] text-[var(--color-text-inverse)]',
  confirmed: 'bg-[var(--color-gray-900)] text-[var(--color-text-inverse)]',
} as const

export type BreakingNewsBarProps = {
  news: ActiveBreakingNews | null
  /** Set when the bar links through to the full story. */
  href?: string | null
}

export function BreakingNewsBar({ news, href }: BreakingNewsBarProps) {
  if (!news) return null

  const body = (
    <>
      <span className="shrink-0 text-[length:var(--text-label)] font-semibold tracking-[var(--text-label--letter-spacing)] uppercase">
        {SEVERITY_LABEL[news.severity]}
      </span>
      <span aria-hidden className="shrink-0 opacity-50">
        /
      </span>
      <span className="text-[length:var(--text-metadata)] font-medium">{news.headline}</span>
      {news.description ? (
        <span className="hidden text-[length:var(--text-metadata)] opacity-80 md:inline">
          {news.description}
        </span>
      ) : null}
    </>
  )

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('w-full', severityClasses[news.severity])}
    >
      <Container width="wide" className="flex items-center gap-3 py-2">
        {href ? (
          <Link
            href={href}
            className="flex flex-1 items-center gap-3 no-underline underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          >
            {body}
          </Link>
        ) : (
          <span className="flex flex-1 items-center gap-3">{body}</span>
        )}
      </Container>
    </div>
  )
}
