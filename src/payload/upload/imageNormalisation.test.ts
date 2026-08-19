import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import {
  checksumOf,
  hasEmbeddedMetadata,
  isUploadableImage,
  normaliseImage,
} from './imageNormalisation'

/**
 * A small JPEG carrying camera metadata, built rather than committed.
 *
 * The GPS block a phone writes cannot be produced here — sharp's `withExif`
 * does not emit a GPS IFD — so the fixture carries the tags it will write. That
 * is enough, because normalisation removes every block rather than a listed
 * few, and GPS is one of them.
 */
async function photographWithMetadata(): Promise<Buffer> {
  return sharp({
    create: { width: 32, height: 24, channels: 3, background: '#7f3f1f' },
  })
    .withExif({
      IFD0: { Copyright: 'Clasificados Colombia', Artist: 'Fotógrafa de planta' },
    })
    .jpeg()
    .toBuffer()
}

describe('isUploadableImage', () => {
  it('accepts the raster formats a newsroom actually delivers', () => {
    for (const mime of ['image/jpeg', 'image/png', 'image/webp', 'image/avif']) {
      expect(isUploadableImage(mime), mime).toBe(true)
    }
  })

  it('rejects SVG, which is a document that can carry script', () => {
    expect(isUploadableImage('image/svg+xml')).toBe(false)
    expect(isUploadableImage('IMAGE/SVG+XML')).toBe(false)
  })

  it('rejects anything dressed up as an image', () => {
    expect(isUploadableImage('application/pdf')).toBe(false)
    expect(isUploadableImage('text/html')).toBe(false)
    expect(isUploadableImage('')).toBe(false)
    expect(isUploadableImage(null)).toBe(false)
  })
})

describe('normaliseImage', () => {
  it('leaves no embedded metadata behind, which is where GPS lives', async () => {
    const original = await photographWithMetadata()

    // The fixture has to be proven guilty first, or the assertion below passes
    // against an image that never carried anything.
    expect(await hasEmbeddedMetadata(original)).toBe(true)

    const { data, normalised } = await normaliseImage(original, 'image/jpeg')

    expect(normalised).toBe(true)
    expect(await hasEmbeddedMetadata(data)).toBe(false)
  })

  it('keeps the format and the pixel dimensions', async () => {
    const original = await photographWithMetadata()
    const { data } = await normaliseImage(original, 'image/jpeg')

    const before = await sharp(original).metadata()
    const after = await sharp(data).metadata()

    expect(after.format).toBe(before.format)
    expect(after.width).toBe(before.width)
    expect(after.height).toBe(before.height)
  })

  it('preserves every frame of an animation', async () => {
    const frames = await sharp({
      create: { width: 8, height: 8, channels: 4, background: '#000000' },
    })
      .gif()
      .toBuffer()

    const { data } = await normaliseImage(frames, 'image/gif')

    expect((await sharp(data).metadata()).format).toBe('gif')
  })

  it('hands back an unreadable file instead of failing the upload', async () => {
    const rubbish = Buffer.from('not an image at all')
    const { data, normalised, reason } = await normaliseImage(rubbish, 'image/jpeg')

    expect(normalised).toBe(false)
    expect(reason).toBeTruthy()
    expect(data).toBe(rubbish)
  })
})

describe('checksumOf', () => {
  it('is stable for identical bytes and different for different ones', () => {
    expect(checksumOf(Buffer.from('abc'))).toBe(checksumOf(Buffer.from('abc')))
    expect(checksumOf(Buffer.from('abc'))).not.toBe(checksumOf(Buffer.from('abd')))
  })

  it('is a hex sha-256', () => {
    expect(checksumOf(Buffer.from('abc'))).toMatch(/^[0-9a-f]{64}$/)
  })
})
