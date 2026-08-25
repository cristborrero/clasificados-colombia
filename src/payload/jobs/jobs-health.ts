import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * `pnpm jobs:health` — what the queue is carrying, and what died in it.
 *
 * PRD Nº7 §168 and the F18 definition of done: a job that dies must be recorded
 * and reported, not lost in silence. Keeping failed jobs in the table is half of
 * that; this is the half that makes them visible without anyone opening a
 * database client.
 *
 * Exits non-zero when something has permanently failed, so a scheduler or a
 * deploy check can act on it. A backlog on its own is not a failure — the queue
 * having work in it is the queue working.
 */

const payload = await getPayload({ config })

const [failed, pending, total] = await Promise.all([
  payload.find({
    collection: 'payload-jobs',
    where: { hasError: { equals: true } },
    sort: '-updatedAt',
    limit: 20,
    depth: 0,
    overrideAccess: true,
  }),
  payload.find({
    collection: 'payload-jobs',
    where: { and: [{ hasError: { not_equals: true } }, { completedAt: { exists: false } }] },
    limit: 0,
    depth: 0,
    overrideAccess: true,
  }),
  payload.find({
    collection: 'payload-jobs',
    limit: 0,
    depth: 0,
    overrideAccess: true,
  }),
])

payload.logger.info(
  `Cola: ${total.totalDocs} trabajos · ${pending.totalDocs} pendientes · ${failed.totalDocs} con error.`,
)

for (const job of failed.docs) {
  const record = job as unknown as Record<string, unknown>
  const input = (record.input ?? {}) as Record<string, unknown>

  /*
   * The input is printed with the error. "syncSearch failed" is not actionable;
   * "syncSearch failed for articles/42" tells whoever reads this which document
   * is missing from the index right now.
   */
  payload.logger.error(
    `ERROR · ${String(record.taskSlug ?? record.workflowSlug ?? 'desconocido')} · ` +
      `${JSON.stringify(input)} · intentos: ${String(record.totalTried ?? '?')} · ` +
      `${String(record.error ?? 'sin detalle')}`.slice(0, 500),
  )
}

if (failed.totalDocs > 0) {
  payload.logger.error(
    'Hay trabajos que agotaron sus reintentos. El índice de búsqueda puede estar desactualizado: revisa el error y, si hace falta, ejecuta `pnpm search:reindex`.',
  )
}

process.exit(failed.totalDocs > 0 ? 1 : 0)
