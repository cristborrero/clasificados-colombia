import { Playfair_Display, Source_Sans_3 } from 'next/font/google'

/**
 * Brand typefaces (PRD Master §6, PRD Nº8 §8).
 *
 * `next/font` downloads and self-hosts these at build time, so the running site
 * never makes a blocking request to a third party — PRD Master §6 requires
 * exactly that, and a font request that hangs is a first-paint that hangs.
 *
 * Both families are variable fonts, so no weight list is pinned: the full axis
 * ships in one file and the type scale can use any weight it needs without
 * adding a request.
 *
 * The `latin` subset covers Spanish — accented vowels, ñ, and the inverted
 * ¿ and ¡ that this product will print on every other headline.
 */

/** Editorial / display. Headlines, pull quotes, large figures. */
export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  // Italic is used for pull quotes and captions.
  style: ['normal', 'italic'],
})

/** Interface / body. Reading text, metadata, navigation, forms. */
export const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  display: 'swap',
  style: ['normal', 'italic'],
})

/** Applied to `<html>` so both custom properties exist document-wide. */
export const fontVariables = `${playfairDisplay.variable} ${sourceSans.variable}`
