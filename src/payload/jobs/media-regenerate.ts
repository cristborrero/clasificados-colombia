import { access, constants } from 'node:fs/promises'
import path from 'node:path'

import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * `pnpm media:regenerate` — rebuild image derivatives from preserved originals.
 *
 * Required by PRD Nº10 §163-§165.
 *
 * The point of keeping the original untouched (§17) is that the derivative
 * configuration can change afterwards: a new size, a different crop, a codec
 * the browsers of 2028 prefer. Without this command that flexibility is
 * theoretical, because applying a new configuration would mean asking the desk
 * to re-upload years of photographs.
 *
 * Re-saving through the Local API rather than driving sharp here is deliberate:
 * derivative names, dimensions and positions live in the collection config, and
 * a second implementation of that pipeline would drift from it silently. This
 * asks Payload to redo exactly what an upload does.
 *
 * Idempotent. Running it twice produces the same files.
 */

const payload = await getPayload({ config })

const collection = payload.config.collections.find((entry) => entry.slug === 'media')
const staticDir = collection?.upload && typeof collection.upload === 'object'
  ? (collection.upload.staticDir ?? 'media')
  : 'media'

/** `staticDir` may be relative to the working directory or already absolute. */
const mediaRoot = path.isAbsolute(staticDir) ? staticDir : path.resolve(process.cwd(), staticDir)

const assets = await payload.find({
  collection: 'media',
  depth: 0,
  limit: 0,
  pagination: false,
  overrideAccess: true,
})

let rebuilt = 0
let missing = 0
let failed = 0

for (const asset of assets.docs) {
  const filename = asset.filename

  if (!filename) {
    missing += 1
    payload.logger.warn({ id: asset.id }, 'Registro de media sin nombre de archivo; se omite')
    continue
  }

  const filePath = path.join(mediaRoot, filename)

  try {
    await access(filePath, constants.R_OK)
  } catch {
    /*
     * Reported rather than fatal. One unreadable original must not stop the
     * rebuild of the rest — and a run that dies a third of the way through
     * leaves the library in a state nobody can describe.
     */
    missing += 1
    payload.logger.warn({ id: asset.id, filePath }, 'No se encuentra el original; se omite')
    continue
  }

  try {
    await payload.update({
      collection: 'media',
      id: asset.id,
      data: {},
      filePath,
      overrideAccess: true,
      /*
       * These bytes are ours and already processed. Without this the original
       * is recompressed on every run and its checksum is recomputed from the
       * processed file, so the fingerprint that identifies an asset would drift
       * every time this command ran.
       */
      context: { skipUploadProcessing: true },
    })

    rebuilt += 1
  } catch (error) {
    failed += 1
    payload.logger.error(
      { id: asset.id, error: error instanceof Error ? error.message : error },
      'No se pudieron regenerar los derivados',
    )
  }
}

payload.logger.info(
  `Derivados regenerados: ${rebuilt}. Sin original: ${missing}. Con error: ${failed}.`,
)

process.exit(failed > 0 ? 1 : 0)
