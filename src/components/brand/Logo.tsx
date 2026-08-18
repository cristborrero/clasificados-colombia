import Image from 'next/image'

import { cn } from '@/components/ui/cn'

/**
 * Brand lockup (PRD Master §3, DESIGN-REFERENCE delta D-14).
 *
 * Two files rather than one recoloured by CSS: the lockup is a multi-colour
 * mark — near-black wordmark, red COLOMBIA line — so `currentColor` could never
 * express it. `public/brand/README.md` records the defect that made the dark
 * variant necessary as a separate file.
 *
 * D-14 asked for a compact variant for narrow viewports and none was delivered.
 * Resolved here with `logomark.svg`, the circular monogram that ships with the
 * brand: at 360px the full lockup would either shrink the wordmark below
 * legibility or eat the whole header row. The monogram is the brand's own
 * compact form, so this is a resolution rather than a stand-in.
 *
 * Sizing comes either from `height` (an inline style, for fixed placements) or
 * from `imageClassName` (for sizes that respond to state, like the header
 * compacting on scroll). Inline styles beat classes, so the two are mutually
 * exclusive by construction rather than by convention.
 *
 * `priority` because the logo is in the first viewport on every page, and
 * `next/image` would otherwise lazy-load it into a visible layout shift.
 */
const LOCKUP_RATIO = { width: 480, height: 108 } as const
const MARK_RATIO = { width: 500, height: 500 } as const

export type LogoProps = {
  /** Which surface it sits on. Picks the file, not a CSS filter. */
  surface?: 'light' | 'dark'
  /** `lockup` is the full mark; `mark` is the monogram; `responsive` swaps at sm. */
  variant?: 'lockup' | 'mark' | 'responsive'
  /** Rendered height in px. Ignored when `imageClassName` is given. */
  height?: number
  /** CSS-driven sizing. Takes over from `height` when present. */
  imageClassName?: string
  className?: string
}

export function Logo({
  surface = 'light',
  variant = 'lockup',
  height = 32,
  imageClassName,
  className,
}: LogoProps) {
  const sizing = imageClassName ? undefined : { height, width: 'auto' as const }
  const markSizing = imageClassName ? undefined : { height, width: height }

  return (
    <span className={cn('inline-flex items-center', className)}>
      {variant !== 'mark' ? (
        <Image
          src={surface === 'dark' ? '/brand/logo-on-dark.svg' : '/brand/logo-on-light.svg'}
          alt="Clasificados Colombia"
          width={LOCKUP_RATIO.width}
          height={LOCKUP_RATIO.height}
          priority
          style={sizing}
          className={cn(imageClassName, variant === 'responsive' && 'hidden sm:block')}
        />
      ) : null}

      {variant !== 'lockup' ? (
        <Image
          src="/brand/logomark.svg"
          alt="Clasificados Colombia"
          width={MARK_RATIO.width}
          height={MARK_RATIO.height}
          priority
          style={markSizing}
          className={cn(imageClassName, variant === 'responsive' && 'sm:hidden')}
        />
      ) : null}
    </span>
  )
}
