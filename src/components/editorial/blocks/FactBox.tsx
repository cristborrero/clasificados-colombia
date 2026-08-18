import { Body, HeadlineMD, Metadata } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'

/**
 * Fact box (PRD Nº8 §71).
 *
 * *"No usar tarjeta flotante estilo SaaS."* So: a tinted band with rules top
 * and bottom, no shadow, no radius, no floating panel. It reads as part of the
 * page rather than as something pasted onto it.
 *
 * A `<dl>`, because that is what it is — labelled values. The markup earns its
 * keep the moment someone navigates it with a screen reader, which announces
 * the pairing that the visual layout only implies.
 *
 * The source line is not decoration. A fact box without one is a set of
 * assertions with no way to check them, which on an investigative outlet is the
 * opposite of the point.
 */
export type FactBoxItem = { label: string; value: string; description?: string | null }

export type FactBoxProps = {
  title: string
  items: readonly FactBoxItem[]
  source?: string | null
  className?: string
}

export function FactBox({ title, items, source, className }: FactBoxProps) {
  if (items.length === 0) return null

  return (
    <aside
      className={cn(
        'my-10 border-y border-[var(--color-border-strong)] bg-[var(--color-surface-sunken)]',
        'px-6 py-8',
        className,
      )}
    >
      <HeadlineMD as="h2" className="text-[length:var(--text-lead)]">
        {title}
      </HeadlineMD>

      <dl className="mt-6 flex flex-col gap-5">
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} className="flex flex-col gap-1">
            <dt className="font-[family-name:var(--font-sans)] text-[length:var(--text-label)] tracking-[var(--text-label--letter-spacing)] text-[color:var(--color-text-muted)] uppercase">
              {item.label}
            </dt>
            <dd className="font-[family-name:var(--font-sans)] text-[length:var(--text-body)] font-semibold">
              {item.value}
            </dd>
            {item.description ? (
              <dd>
                <Body className="text-[color:var(--color-text-muted)]">{item.description}</Body>
              </dd>
            ) : null}
          </div>
        ))}
      </dl>

      {source ? (
        <Metadata className="mt-6 text-[color:var(--color-text-muted)]">Fuente: {source}</Metadata>
      ) : null}
    </aside>
  )
}
