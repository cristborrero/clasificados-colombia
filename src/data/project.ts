/**
 * Shared projection helpers for the data layer.
 *
 * These turn a Payload document into the narrow shape a view needs. They are
 * defensive on purpose: `depth` decides whether a relationship arrives as a
 * document or as a bare id, a retired author can leave a dangling reference,
 * and a draft promoted by hand can be missing a slug. None of those should
 * reach a component as `undefined` interpolated into an href.
 */

export type Related = Record<string, unknown> | string | number | null | undefined

export const asRecord = (value: Related): Record<string, unknown> | null =>
  value && typeof value === 'object' ? value : null

export const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null

export const asNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

export type NamedRef = { name: string; slug: string }

/** A relationship that has both a name and a slug, or nothing. */
export function toNamedRef(value: Related): NamedRef | null {
  const record = asRecord(value)
  const name = asString(record?.name)
  const slug = asString(record?.slug)

  return name && slug ? { name, slug } : null
}

export function toNamedRefs(value: unknown): NamedRef[] {
  if (!Array.isArray(value)) return []

  return value.map((item) => toNamedRef(item as Related)).filter((ref): ref is NamedRef => ref !== null)
}

export type ImageRef = { url: string; alt: string }

/**
 * An uploaded image, or `null`.
 *
 * `alt` falls back to the empty string rather than to the filename or the
 * caption. An empty alt marks the image decorative, which is wrong for
 * editorial photography — but a filename read aloud
 * ("IMG_2024_final_v3_USAR_ESTA.jpg") is worse, and a caption duplicated into
 * alt makes a screen reader say everything twice. The gap belongs in the CMS.
 */
export function toImageRef(value: Related): ImageRef | null {
  const record = asRecord(value)
  const url = asString(record?.url)

  if (!url) return null

  return { url, alt: asString(record?.alt) ?? '' }
}
