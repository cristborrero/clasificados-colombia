import config from '@payload-config'
import { getPayload } from 'payload'

import { isSearchConfigured } from './client'
import { reindexAll } from './indexer'

/**
 * `pnpm search:reindex` — full Meilisearch rebuild from Payload.
 *
 * Required by PRD Nº7 §152, Nº9 §3 and §90-§92, and CLAUDE.md §41.
 *
 * This command is what makes it legitimate to treat the index as a derivative
 * rather than as data: PRD Nº9 §3 says that if Meilisearch is lost entirely,
 * Payload plus a full reindex must restore search — which is also why PRD Nº4
 * §65 leaves Meilisearch out of the backup plan. If this command stops working,
 * that decision quietly stops being true.
 *
 * Idempotent (§84). Documents are written by a stable id derived from
 * collection and record id, so running it twice produces the same logical
 * state.
 */
const payload = await getPayload({ config })

if (!isSearchConfigured()) {
  payload.logger.error(
    'Meilisearch no está configurado: falta MEILI_HOST y MEILI_INDEXER_KEY (o MEILI_MASTER_KEY).',
  )

  process.exit(1)
}

const started = Date.now()

const results = await reindexAll(payload)

for (const result of results) {
  payload.logger.info(
    `${result.collection}: ${result.indexed} indexados, ${result.skipped} omitidos por no ser públicos.`,
  )
}

const total = results.reduce((sum, result) => sum + result.indexed, 0)

payload.logger.info(`Reindexación completa: ${total} documentos en ${Date.now() - started} ms.`)
