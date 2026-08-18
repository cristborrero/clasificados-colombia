import type { ElementType, ReactNode } from 'react'

import { cn } from '@/components/ui/cn'

/**
 * Typographic system (PRD Nº8 §10).
 *
 * The point of this file is the rule in §10: no component assigns arbitrary
 * font sizes of its own. A card that wants a headline uses `Headline`, and if
 * the headline scale changes it changes in one place.
 *
 * Family assignment follows PRD Master §6 exactly — Playfair Display carries
 * editorial voice (headlines, quotes, large figures), Source Sans 3 carries
 * everything functional (body, metadata, navigation, labels, captions).
 */

type BaseProps = {
  children: ReactNode
  className?: string
  as?: ElementType
  /**
   * Needed for `aria-labelledby`: a `<section>` is only announced as a named
   * region if it points at the id of the heading that names it. Without this,
   * every landmark on a long investigation page is just "region".
   */
  id?: string
}

const editorial = 'font-[family-name:var(--font-editorial)]'
const sans = 'font-[family-name:var(--font-sans)]'

/** Largest display type. Special covers and investigation heroes only. */
export function Display({ children, className, id, as: Component = 'h1' }: BaseProps) {
  return (
    <Component id={id} className={cn(editorial, 'text-display font-black text-balance', className)}>
      {children}
    </Component>
  )
}

/** Page headline. One per page (PRD Nº8 §106). */
export function HeadlineXL({ children, className, id, as: Component = 'h1' }: BaseProps) {
  return (
    <Component id={id} className={cn(editorial, 'text-h1 font-bold text-balance', className)}>
      {children}
    </Component>
  )
}

export function HeadlineLG({ children, className, id, as: Component = 'h2' }: BaseProps) {
  return (
    <Component id={id} className={cn(editorial, 'text-h2 font-bold text-balance', className)}>
      {children}
    </Component>
  )
}

export function HeadlineMD({ children, className, id, as: Component = 'h3' }: BaseProps) {
  return (
    <Component id={id} className={cn(editorial, 'text-h3 font-semibold text-balance', className)}>
      {children}
    </Component>
  )
}

/**
 * Standfirst under a headline. Sans, per PRD Nº8 §43 — and deliberately not as
 * long as a paragraph.
 */
export function Dek({ children, className, id, as: Component = 'p' }: BaseProps) {
  return (
    <Component
      id={id}
      className={cn(sans, 'text-lead text-[var(--color-text-muted)] text-pretty', className)}
    >
      {children}
    </Component>
  )
}

/** Opening paragraph or emphasised intro. */
export function Lead({ children, className, id, as: Component = 'p' }: BaseProps) {
  return <Component id={id} className={cn(sans, 'text-lead text-pretty', className)}>{children}</Component>
}

/** Reading text. The most important size in the product (PRD Nº8 §12). */
export function Body({ children, className, id, as: Component = 'p' }: BaseProps) {
  return <Component id={id} className={cn(sans, 'text-body text-pretty', className)}>{children}</Component>
}

export function BodyLarge({ children, className, id, as: Component = 'p' }: BaseProps) {
  return (
    <Component id={id} className={cn(sans, 'text-body-lg text-pretty', className)}>{children}</Component>
  )
}

/** Dates, reading time, bylines, source notes. */
export function Metadata({ children, className, id, as: Component = 'p' }: BaseProps) {
  return (
    <Component id={id} className={cn(sans, 'text-metadata text-[var(--color-text-subtle)]', className)}>
      {children}
    </Component>
  )
}

/**
 * Category marker above a headline — "INVESTIGACIÓN", "ANÁLISIS".
 *
 * Uppercase with wide tracking. PRD Nº8 §41 asks for exactly this, and the
 * brand manual warns against uppercase in long passages — which is why this is
 * scoped to short markers and never to running text.
 */
export function Eyebrow({ children, className, id, as: Component = 'p' }: BaseProps) {
  return (
    <Component
      id={id}
      className={cn(
        sans,
        'text-label font-semibold tracking-[var(--text-label--letter-spacing)] uppercase',
        className,
      )}
    >
      {children}
    </Component>
  )
}

/** Image caption and credit (PRD Nº8 §64). Always below the image. */
export function Caption({ children, className, id, as: Component = 'figcaption' }: BaseProps) {
  return (
    <Component id={id} className={cn(sans, 'text-metadata text-[var(--color-text-subtle)]', className)}>
      {children}
    </Component>
  )
}

/**
 * Pull quote (PRD Nº8 §70).
 *
 * Large editorial serif with a thin rule, not a floating rounded card. The
 * brand manual specifies Playfair italic for quotes.
 */
export function Quote({ children, className, id, as: Component = 'blockquote' }: BaseProps) {
  return (
    <Component
      id={id}
      className={cn(
        editorial,
        'text-h3 border-l-2 border-[var(--color-accent)] pl-6 italic',
        className,
      )}
    >
      {children}
    </Component>
  )
}

/** Large figure for data stories — the "78%" in the reference sheet. */
export function DataFigure({ children, className, id, as: Component = 'p' }: BaseProps) {
  return (
    <Component
      id={id}
      className={cn(
        editorial,
        'text-display font-bold text-[var(--color-accent)] tabular-nums',
        className,
      )}
    >
      {children}
    </Component>
  )
}
