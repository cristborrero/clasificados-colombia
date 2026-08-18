/**
 * Editorial date formatting (PRD Nº8 §61, PRD SEO §29).
 *
 * Pure and locale-pinned. `toLocaleDateString()` with no locale reads the
 * *server's* locale, so the same article renders "18 de agosto de 2026" on one
 * machine and "August 18, 2026" on another — and a server-rendered page that
 * disagrees with the client hydration is a React mismatch, not just a cosmetic
 * difference.
 *
 * Colombia observes no daylight saving and sits on a fixed −05:00. Pinning the
 * time zone means a story published at 23:30 in Bogotá does not display as the
 * next day because the server runs on UTC.
 */
export const LOCALE = 'es-CO'
export const TIME_ZONE = 'America/Bogota'

/** `null` for absent or unparseable — never "Invalid Date" on a page. */
export function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

/** "18 de agosto de 2026" — the byline date. */
export function formatEditorialDate(value: string | Date | null | undefined): string | null {
  const date = parseDate(value)
  if (!date) return null

  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIME_ZONE,
  }).format(date)
}

/** "18 ago 2026, 11:30 a. m." — for updates and timelines. */
export function formatEditorialDateTime(value: string | Date | null | undefined): string | null {
  const date = parseDate(value)
  if (!date) return null

  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  }).format(date)
}

/**
 * The `datetime` attribute of a `<time>` element.
 *
 * Always the full ISO instant, never the human string. PRD SEO §29 wants
 * machine-readable dates; a crawler reading "18 de agosto" has to guess the
 * year and the offset.
 */
export function toDateTimeAttribute(value: string | Date | null | undefined): string | null {
  return parseDate(value)?.toISOString() ?? null
}

/**
 * Reading time in whole minutes (PRD Nº8 §61).
 *
 * 200 words per minute — the conservative end of the usual 200-250 range, so
 * the estimate errs towards over- rather than under-promising. Always at least
 * 1: "0 min de lectura" reads like an error.
 */
export const WORDS_PER_MINUTE = 200

export function readingTimeMinutes(wordCount: number): number {
  if (!Number.isFinite(wordCount) || wordCount <= 0) return 1

  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE))
}
