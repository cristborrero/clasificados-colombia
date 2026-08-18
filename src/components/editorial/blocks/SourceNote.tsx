import { Metadata } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'

/**
 * Source note (PRD Nº8 §73).
 *
 * *"Visual discreto. No competir con texto."* It is there for the reader who
 * wants to know where a figure came from, not to interrupt the reader who does
 * not. Small, muted, and set apart by a rule rather than by a box.
 */
export function SourceNote({ text, className }: { text: string; className?: string }) {
  return (
    <p
      className={cn(
        'my-8 border-t border-[var(--color-border-subtle)] pt-3',
        className,
      )}
    >
      <Metadata as="span" className="block text-[color:var(--color-text-muted)]">
        {text}
      </Metadata>
    </p>
  )
}
