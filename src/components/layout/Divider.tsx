import { cn } from '@/components/ui/cn'

/**
 * Editorial rule (PRD Master §41, PRD Nº8 §18).
 *
 * The identity is built from lines, blocks and contrast rather than rounded
 * cards and shadows, which makes this a load-bearing component rather than
 * decoration.
 *
 * Renders `<hr>` when it separates content, so the structure is available to a
 * screen reader. `decorative` switches it to an aria-hidden `<div>` for cases
 * where the line is purely visual and announcing a separator would be noise.
 */
const weights = {
  hairline: 'border-t',
  thick: 'border-t-2',
  heavy: 'border-t-4',
} as const

const tones = {
  subtle: 'border-[var(--color-border-subtle)]',
  default: 'border-[var(--color-border)]',
  strong: 'border-[var(--color-border-strong)]',
  accent: 'border-[var(--color-accent)]',
  inverse: 'border-[var(--color-border-inverse)]',
} as const

export type DividerProps = {
  weight?: keyof typeof weights
  tone?: keyof typeof tones
  decorative?: boolean
  className?: string
}

export function Divider({
  weight = 'hairline',
  tone = 'default',
  decorative = false,
  className,
}: DividerProps) {
  const classes = cn('w-full', weights[weight], tones[tone], className)

  if (decorative) {
    return <div aria-hidden="true" className={classes} />
  }

  return <hr className={classes} />
}
