import { Body, HeadlineMD } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'
import { formatEditorialDate, toDateTimeAttribute } from '@/lib/format/date'

/**
 * Chronology (PRD Nº8 §80).
 *
 * Vertical on every viewport, deliberately. §80 warns against turning it into a
 * decorative graphic, and the horizontal timeline is exactly that failure: it
 * needs sideways scrolling, breaks under long labels, and stops being readable
 * on the phone where most people will meet it.
 *
 * So it is an ordered list with a rule down the side. Each entry carries a real
 * `<time>`, which is what makes the chronology a chronology to a machine as
 * well as to an eye.
 */
export type TimelineEvent = {
  date: string
  title: string
  description?: string | null
}

export function EditorialTimeline({
  events,
  title = 'Cronología',
  className,
}: {
  events: readonly TimelineEvent[]
  title?: string
  className?: string
}) {
  const dated = events
    .map((event) => ({
      ...event,
      formatted: formatEditorialDate(event.date),
      attr: toDateTimeAttribute(event.date),
    }))
    .filter((event) => event.formatted && event.attr)

  if (dated.length === 0) return null

  return (
    <section className={cn('my-16', className)} aria-labelledby="cronologia">
      <HeadlineMD as="h2" id="cronologia">
        {title}
      </HeadlineMD>

      <ol className="mt-8 flex flex-col border-l border-[var(--color-border)]">
        {dated.map((event) => (
          <li key={`${event.attr}-${event.title}`} className="relative py-5 pl-8">
            <span
              aria-hidden
              className="absolute top-7 -left-[4.5px] size-2 rounded-full bg-[var(--color-accent)]"
            />

            <time
              dateTime={event.attr!}
              className="font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)] text-[color:var(--color-text-muted)]"
            >
              {event.formatted}
            </time>

            <p className="mt-1 font-[family-name:var(--font-sans)] text-[length:var(--text-body)] font-semibold">
              {event.title}
            </p>

            {event.description ? (
              <Body className="mt-1 text-[color:var(--color-text-muted)]">{event.description}</Body>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
