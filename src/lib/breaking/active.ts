/**
 * Breaking-news bar visibility (PRD Nº5 §25-§26, PRD Nº8 §26).
 *
 * Pure: takes the stored global and the current instant, returns what to
 * render. No Payload, no Date.now() — the clock is an argument so the window
 * boundaries can actually be asserted.
 *
 * `expiresAt` is mandatory in the schema and enforced again here. The failure
 * mode this prevents is specific and embarrassing: a red bar still announcing
 * an emergency from last Tuesday, on the homepage, because nobody remembered
 * to take it down.
 */

export const SEVERITIES = ['breaking', 'alert', 'developing', 'confirmed'] as const

export type Severity = (typeof SEVERITIES)[number]

export type BreakingNewsInput = {
  enabled?: boolean | null
  severity?: string | null
  headline?: string | null
  description?: string | null
  startsAt?: string | null
  expiresAt?: string | null
}

export type ActiveBreakingNews = {
  severity: Severity
  headline: string
  description: string | null
}

export function isSeverity(value: unknown): value is Severity {
  return typeof value === 'string' && (SEVERITIES as readonly string[]).includes(value)
}

/** `null` for absent or unparseable, so a bad date cannot read as "now". */
function parseInstant(value: string | null | undefined): number | null {
  if (!value) return null

  const time = Date.parse(value)

  return Number.isNaN(time) ? null : time
}

/**
 * Decides whether the bar shows, and with what.
 *
 * Every gate is a reason not to render:
 *   - switched off;
 *   - no headline (a bar with no message is a coloured stripe);
 *   - no valid expiry, or expired;
 *   - not started yet.
 *
 * An unrecognised severity falls back to `breaking` rather than disappearing:
 * losing the styling of an urgent message is bad, losing the message is worse.
 */
export function resolveBreakingNews(
  input: BreakingNewsInput | null | undefined,
  now: Date,
): ActiveBreakingNews | null {
  if (!input || input.enabled !== true) return null

  const headline = input.headline?.trim()
  if (!headline) return null

  const expiresAt = parseInstant(input.expiresAt)
  if (expiresAt === null || expiresAt <= now.getTime()) return null

  const startsAt = parseInstant(input.startsAt)
  if (startsAt !== null && startsAt > now.getTime()) return null

  return {
    severity: isSeverity(input.severity) ? input.severity : 'breaking',
    headline,
    description: input.description?.trim() || null,
  }
}

/**
 * The word printed inside the bar.
 *
 * PRD Nº8 §108: colour is never the only channel. The bar always says which
 * state it is in, so it still works in greyscale, for a colour-blind reader,
 * and in a screen reader.
 */
export const SEVERITY_LABEL: Record<Severity, string> = {
  breaking: 'ÚLTIMA HORA',
  alert: 'ALERTA',
  developing: 'EN DESARROLLO',
  confirmed: 'CONFIRMADO',
}
