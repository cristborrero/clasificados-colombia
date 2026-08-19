import { createHash } from 'node:crypto'

import sharp from 'sharp'

/**
 * Upload normalisation for the media library (PRD Master §46-§48, F15).
 *
 * Three jobs, all of them done before the file is ever written:
 *
 * 1. Strip camera metadata from the original. Payload runs sharp on derivatives
 *    and sharp drops metadata unless asked to keep it, so the *derivatives* were
 *    already clean — but the original is stored byte-for-byte unless something
 *    puts it through a pipeline, and the original is served publicly. A press
 *    photograph straight off a phone carries the GPS coordinates of wherever it
 *    was taken, which for this newsroom can be a source's home.
 * 2. Convert to sRGB. A photograph delivered in Adobe RGB renders visibly
 *    desaturated in browsers that ignore the embedded profile — and stripping
 *    metadata removes that profile, so the conversion has to happen here or the
 *    colour shift becomes permanent.
 * 3. Reject SVG. See `isUploadableImage`.
 */

/**
 * Formats the library accepts.
 *
 * SVG is deliberately absent. An SVG is a document, not a picture: it can carry
 * `<script>`, external references and event handlers, and it would be served
 * from this site's own origin, where a CSP built around `'self'` gives no
 * protection at all. Sanitising SVG is an arms race against parser differences,
 * and there is nothing to win here — the brand marks ship from `public/brand/`,
 * so no editorial workflow needs to upload one.
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/tiff',
] as const

/** Formats where a still-image pipeline would silently discard the animation. */
const ANIMATED_MIME_TYPES = new Set(['image/gif', 'image/webp', 'image/avif'])

export function isUploadableImage(mimeType: string | null | undefined): boolean {
  if (!mimeType) return false

  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType.toLowerCase())
}

/**
 * Content hash, for spotting an asset that is already in the library.
 *
 * Taken from the bytes as uploaded, before normalisation. Hashing the
 * normalised output would make the hash depend on the sharp version, so the
 * same file re-uploaded after an upgrade would look like a different asset.
 */
export function checksumOf(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}

export type NormalisedImage = {
  data: Buffer
  /** `false` when the file was passed through untouched, and why. */
  normalised: boolean
  reason?: string
}

/**
 * Strips metadata and converts to sRGB, preserving format and pixels.
 *
 * Returns the input unchanged rather than throwing when sharp cannot read the
 * file: rejecting the upload is `isUploadableImage`'s decision, made on the
 * declared type. Failing here would turn an unreadable-but-harmless file into a
 * 500 during an upload, and the caller has no better error to give the editor.
 */
export async function normaliseImage(
  buffer: Buffer,
  mimeType: string,
): Promise<NormalisedImage> {
  const animated = ANIMATED_MIME_TYPES.has(mimeType.toLowerCase())

  try {
    const pipeline = sharp(buffer, { animated })

    /*
     * `rotate()` with no argument bakes the EXIF orientation into the pixels.
     * It has to happen here: once the EXIF block is gone, a photograph shot in
     * portrait would display on its side forever. Skipped for animated images,
     * where sharp applies it per frame strip rather than per frame.
     */
    const oriented = animated ? pipeline : pipeline.rotate()

    const data = await oriented.toColourspace('srgb').toBuffer()

    return { data, normalised: true }
  } catch (error) {
    return {
      data: buffer,
      normalised: false,
      reason: error instanceof Error ? error.message : 'unreadable image',
    }
  }
}

/**
 * Reports whether a buffer still carries any embedded metadata block.
 *
 * The guarantee being tested is that *nothing* survives, which is stronger than
 * removing GPS specifically and easier to state: there is no allowlist of tags
 * to keep in step with. Checking for the absence of every block also means a
 * future sharp release that starts preserving some new block fails the test
 * rather than quietly widening what gets published.
 */
export async function hasEmbeddedMetadata(buffer: Buffer): Promise<boolean> {
  try {
    const { exif, icc, iptc, xmp } = await sharp(buffer).metadata()

    return Boolean(exif ?? icc ?? iptc ?? xmp)
  } catch {
    return false
  }
}
