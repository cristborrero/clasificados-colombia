/**
 * Video duration formatting (PRD Nº8 §56).
 *
 * Its own module rather than a helper inside a component, because it is pure
 * logic with edge cases worth asserting: a video whose duration was never
 * recorded, one recorded as zero, and one over an hour.
 */

/** Seconds → "4:32", or "1:05:30" past the hour. `null` when unknown. */
export function formatDuration(seconds: number | null | undefined): string | null {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return null

  const total = Math.floor(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const rest = total % 60

  const pad = (value: number): string => String(value).padStart(2, '0')

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`
}
