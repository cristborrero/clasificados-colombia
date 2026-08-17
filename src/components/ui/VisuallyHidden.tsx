import type { ElementType, ReactNode } from 'react'

/**
 * Content for assistive technology only (PRD Nº8 §23, §102).
 *
 * Uses the clip-rect technique rather than `display: none` or
 * `visibility: hidden`, both of which remove the element from the accessibility
 * tree — which defeats the entire purpose.
 */
export type VisuallyHiddenProps = {
  children: ReactNode
  as?: ElementType
}

export function VisuallyHidden({ children, as: Component = 'span' }: VisuallyHiddenProps) {
  return (
    <Component className="absolute h-px w-px overflow-hidden border-0 p-0 whitespace-nowrap [clip-path:inset(50%)] [clip:rect(0_0_0_0)]">
      {children}
    </Component>
  )
}
