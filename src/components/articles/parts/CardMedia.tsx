import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/components/ui/cn'

/**
 * Card image (PRD Nº8 §50, §51, §52).
 *
 * The image links to the same place the headline does (§51). Two links to one
 * destination would be announced twice by a screen reader and cost an extra Tab
 * stop, so this one is removed from the accessibility tree and the tab order:
 * `aria-hidden` plus `tabIndex={-1}`. The headline remains the single announced,
 * focusable link. The image stays clickable for a mouse, which is the whole
 * reason §51 asks for it.
 *
 * Hover is `scale-[1.02]` and nothing else (§52). The card itself never moves —
 * a list of cards that shift under the cursor is a list you cannot aim at.
 *
 * `alt=""` is passed through deliberately when the source has no alt text. It
 * marks the image decorative, which is wrong for editorial photography — but
 * the alternative is inventing a description, and an invented description is
 * worse than a silent one. The gap belongs in the CMS, and the Media collection
 * is where it is required.
 */
export type CardMediaProps = {
  href: string
  src: string
  alt: string
  /** Width/height of the box. The image covers it. */
  aspect?: '16/9' | '4/3' | '1/1' | '3/2'
  sizes?: string
  priority?: boolean
  className?: string
}

const aspects = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-4/3',
  '1/1': 'aspect-square',
  '3/2': 'aspect-3/2',
} as const

export function CardMedia({
  href,
  src,
  alt,
  aspect = '16/9',
  sizes = '(min-width: 1024px) 33vw, 100vw',
  priority = false,
  className,
}: CardMediaProps) {
  return (
    <Link
      href={href}
      aria-hidden
      tabIndex={-1}
      className={cn('block overflow-hidden bg-[var(--color-surface-sunken)]', aspects[aspect], className)}
    >
      <Image
        src={src}
        alt={alt}
        fill={false}
        width={1200}
        height={800}
        sizes={sizes}
        priority={priority}
        className={cn(
          'h-full w-full object-cover',
          'transition-transform duration-300 ease-out group-hover:scale-[1.02]',
          'motion-reduce:transition-none motion-reduce:group-hover:scale-100',
        )}
      />
    </Link>
  )
}
