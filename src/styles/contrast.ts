/**
 * WCAG 2.2 contrast maths and token extraction.
 *
 * Deliberately reads the real `globals.css` rather than keeping a parallel
 * copy of the palette in TypeScript. Two sources of truth for colour is how a
 * design system quietly stops being accessible: someone tweaks a hex in CSS,
 * the test keeps asserting the old value, and the suite stays green while the
 * product regresses.
 *
 * Reference: WCAG 2.2 SC 1.4.3 (text 4.5:1, large text 3:1) and SC 1.4.11
 * (non-text UI 3:1).
 */

export const AA_TEXT = 4.5
export const AA_LARGE_TEXT = 3
export const AA_NON_TEXT = 3

/** Relative luminance of an sRGB colour, per the WCAG definition. */
export function relativeLuminance(hex: string): number {
  const value = hex.trim().replace('#', '')

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error(`Expected a 6-digit hex colour, received "${hex}"`)
  }

  const channels = [0, 2, 4].map((offset) => {
    const channel = parseInt(value.slice(offset, offset + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
  }) as [number, number, number]

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

/** Contrast ratio between two colours. Order-independent, 1–21. */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Extracts custom properties from CSS source and resolves `var()` aliases to
 * literal hex, so semantic tokens can be asserted as the colours they end up
 * being rather than as the names they happen to carry.
 */
export function extractColorTokens(css: string): Record<string, string> {
  const raw: Record<string, string> = {}
  const declaration = /(--color-[a-z0-9-]+)\s*:\s*([^;]+);/gi

  for (const match of css.matchAll(declaration)) {
    const [, name, value] = match
    if (name && value) raw[name] = value.trim()
  }

  const resolve = (name: string, seen: Set<string> = new Set()): string => {
    if (seen.has(name)) {
      throw new Error(`Circular token reference at ${name}`)
    }

    const value = raw[name]
    if (value === undefined) {
      throw new Error(`Unknown token ${name}`)
    }

    const alias = value.match(/^var\(\s*(--[a-z0-9-]+)\s*\)$/i)
    if (!alias?.[1]) return value

    return resolve(alias[1], new Set(seen).add(name))
  }

  return Object.fromEntries(Object.keys(raw).map((name) => [name, resolve(name)]))
}
