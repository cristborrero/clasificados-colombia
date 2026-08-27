import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

/**
 * Queues the Meilisearch sync (PRD Nº9 §79-§89, CLAUDE.md §40, F18).
 *
 * THE RULE THIS EXISTS TO HONOUR is §87: publishing must succeed whether or not
 * Meilisearch is available. The hook therefore never touches the index. It
 * writes a job and returns; the work happens afterwards, in
 * `src/payload/jobs/tasks/syncSearch.ts`.
 *
 * Until F18 this was a detached promise with a `catch`. That also kept
 * publishing unblocked, but by forgetting: a push that failed was logged and
 * lost, and the index stayed wrong until someone ran a full reindex. A job
 * survives the failure, retries, and — if it exhausts its retries — stays in
 * `payload-jobs` where `pnpm jobs:health` reports it.
 *
 * The job row is written on the same `req`, so it commits with the editorial
 * change or not at all. A publish that rolled back must not leave a job behind
 * that would index a version nobody published.
 */

/** Skips the sync for writes that are not editorial changes. */
export type SearchSyncContext = { skipSearchSync?: boolean }

async function enqueue(
  req: PayloadRequest,
  input: { collection: string; documentId: string; operation: 'upsert' | 'delete'; version: string },
): Promise<void> {
  try {
    if (req?.payload?.jobs?.queue) {
      void req.payload.jobs.queue({
        task: 'syncSearch',
        input,
      }).catch((err) => {
        req.payload?.logger?.error?.({ err, ...input }, 'No se pudo encolar la sincronización')
      })
    }
  } catch (error) {
    req.payload?.logger?.error?.(
      { err: error, ...input },
      'No se pudo encolar la sincronización con el buscador',
    )
  }
}

export const syncSearchAfterChange =
  (collection: string): CollectionAfterChangeHook =>
  async ({ context, doc, req }) => {
    if ((context as SearchSyncContext)?.skipSearchSync) return doc

    const record = doc as { id: string | number; updatedAt?: string }

    await enqueue(req, {
      collection,
      documentId: String(record.id),
      operation: 'upsert',
      /*
       * The document is not carried in the job — only the version it was at.
       * See the task: it re-reads and refuses to write if the document has
       * moved on, which is what stops an older job from overwriting a newer
       * one in the index (§89).
       */
      version: record.updatedAt ?? new Date().toISOString(),
    })

    return doc
  }

export const syncSearchAfterDelete =
  (collection: string): CollectionAfterDeleteHook =>
  async ({ context, doc, id, req }) => {
    if ((context as SearchSyncContext)?.skipSearchSync) return doc

    await enqueue(req, {
      collection,
      documentId: String(id),
      operation: 'delete',
      version: new Date().toISOString(),
    })

    return doc
  }
