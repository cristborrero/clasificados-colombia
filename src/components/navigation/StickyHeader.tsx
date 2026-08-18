'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/components/ui/cn'

/**
 * Sticky header shell (PRD Nº8 §26-§27).
 *
 * §27 asks for a sticky header that does not eat the mobile viewport; §26 asks
 * it to start `full` and go `compact` on scroll, *"sin animaciones exageradas"*.
 * Those two together are the whole component: it holds one boolean and hands it
 * down as a data attribute, so every visual decision stays in CSS with the
 * design tokens.
 *
 * An `IntersectionObserver` on a one-pixel sentinel rather than a scroll
 * listener. A scroll handler fires on every frame of every scroll and forces
 * layout to read `scrollY`; the observer fires exactly twice — when the top of
 * the page leaves the viewport and when it comes back.
 *
 * It degrades to the full header if JavaScript never runs, which is the right
 * failure: a header that is slightly taller than intended, not a header that is
 * missing.
 */
export function StickyHeader({ children }: { children: ReactNode }) {
  const sentinel = useRef<HTMLDivElement>(null)
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const node = sentinel.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => setCompact(!entry?.isIntersecting),
      { threshold: 0 },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinel} aria-hidden className="h-px" />

      <header
        data-compact={compact ? 'true' : 'false'}
        className={cn(
          'group sticky top-0 z-30',
          'border-b border-[var(--color-border)] bg-[var(--color-surface)]',
        )}
      >
        {children}
      </header>
    </>
  )
}
