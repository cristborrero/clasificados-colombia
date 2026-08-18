import { cn } from '@/components/ui/cn'

/**
 * Loading placeholders (PRD Nº8 §158-§160).
 *
 * Shaped like the content they replace, so the page does not jump when the real
 * thing arrives. A generic spinner in the middle of the viewport tells the
 * reader nothing about what is coming and guarantees a layout shift when it
 * does.
 *
 * `aria-hidden` with a single polite live region for the whole block. A screen
 * reader should hear "Cargando" once, not the shape of eleven grey rectangles.
 *
 * The pulse is disabled under `prefers-reduced-motion` (PRD Nº8 §113): a
 * repeating animation is a vestibular trigger, and it is also the kind of
 * motion that never stops if the request never resolves.
 */
const shimmer = cn(
  'bg-[var(--color-surface-sunken)]',
  'animate-pulse motion-reduce:animate-none',
)

function Bar({ className }: { className?: string }) {
  return <span aria-hidden className={cn('block h-3', shimmer, className)} />
}

export type SkeletonProps = { className?: string }

/** Placeholder for one card. */
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div aria-hidden className={cn('flex flex-col gap-3', className)}>
      <span className={cn('block aspect-video w-full', shimmer)} />
      <Bar className="h-2.5 w-24" />
      <Bar className="h-5 w-full" />
      <Bar className="h-5 w-4/5" />
      <Bar className="w-40" />
    </div>
  )
}

/** Placeholder for a full page of cards. */
export function PageSkeleton({ count = 6, className }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn('flex flex-col gap-10', className)}>
      {/*
        The one thing assistive technology hears. Everything below it is
        decorative geometry.
      */}
      <p role="status" aria-live="polite" className="sr-only">
        Cargando contenido…
      </p>

      <div aria-hidden className="flex flex-col gap-4">
        <Bar className="h-2.5 w-32" />
        <Bar className="h-10 w-3/4" />
        <Bar className="h-4 w-2/3" />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
