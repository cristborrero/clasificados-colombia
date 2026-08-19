import type { CollectionSlug, TaskConfig } from 'payload'

/**
 * Durable Meilisearch sync (PRD Nº9 §79-§89, CLAUDE.md §40 and §56, F18).
 *
 * Replaces the detached promise the `afterChange` hooks used to fire. That one
 * honoured the rule that matters — publishing must succeed whether or not
 * search is up — but it honoured it by forgetting: a failed push was logged and
 * gone, and the index stayed wrong until somebody happened to run a full
 * reindex.
 *
 * Three things a queue gives that a detached promise cannot:
 *
 *   retries        a Meilisearch restart no longer loses the write
 *   a record       a job that exhausts its retries stays in `payload-jobs`
 *                  with its error, which is what `pnpm jobs:health` reports
 *   ordering       see the version guard below
 *
 * §89 describes the ordering failure precisely: publish v5, update v6, and the
 * v5 job finishing last overwrites v6 in the index. The document is therefore
 * NOT carried in the job. The task re-reads it at run time and compares
 * `updatedAt` against the version that was queued — a job whose document has
 * moved on since is a job whose work has already been done by a later one.
 */

export type SyncSearchInput = {
  collection: string
  documentId: string
  /**
   * `upsert` or `delete`.
   *
   * `upsert` does not mean "the document is public". The indexer decides that
   * and removes the record when it is not, so an unpublish and an edit take the
   * same path — which is why a draft cannot linger in the index because someone
   * queued the wrong operation.
   */
  operation: 'upsert' | 'delete'
  /**
   * The document's `updatedAt` at the moment the job was queued.
   *
   * Together with collection, id and operation this is the idempotency key the
   * plan asks for: running the same job twice writes the same bytes, and
   * running an older one after a newer one writes nothing at all.
   */
  version: string
}

export const syncSearchTask: TaskConfig<'syncSearch'> = {
  slug: 'syncSearch',
  label: 'Sincronizar con el buscador',

  /*
   * Retried, with Payload's backoff. Five attempts covers a service restart
   * and a short network partition; beyond that the failure is not transient and
   * a job sitting in the queue with its error is more useful than a sixth try.
   */
  retries: { attempts: 5, backoff: { type: 'exponential', delay: 5_000 } },

  inputSchema: [
    { name: 'collection', type: 'text', required: true },
    { name: 'documentId', type: 'text', required: true },
    {
      name: 'operation',
      type: 'select',
      required: true,
      options: [
        { label: 'Alta o actualización', value: 'upsert' },
        { label: 'Baja', value: 'delete' },
      ],
    },
    { name: 'version', type: 'text', required: true },
  ],

  outputSchema: [
    {
      name: 'result',
      type: 'select',
      options: [
        { label: 'Indexado', value: 'upserted' },
        { label: 'Retirado del índice', value: 'deleted' },
        { label: 'Omitido por versión posterior', value: 'superseded' },
        { label: 'Omitido: buscador no configurado', value: 'not-configured' },
      ],
    },
  ],

  handler: async ({ input, req }) => {
    const { collection, documentId, operation, version } = input as SyncSearchInput

    /*
     * Imported lazily so a misconfigured search cannot break importing the
     * config, and so the Meilisearch client stays out of bundles that never
     * touch it.
     */
    const { isSearchConfigured } = await import('@/search/client')

    if (!isSearchConfigured()) {
      /*
       * Succeeds rather than fails. A development machine with no Meilisearch
       * would otherwise accumulate a permanently failing job for every save,
       * and a health report full of noise is a health report nobody reads.
       */
      return { output: { result: 'not-configured' } }
    }

    const { removeDocument, syncDocument } = await import('@/search/indexer')

    if (operation === 'delete') {
      await removeDocument(collection, documentId)

      return { output: { result: 'deleted' } }
    }

    const doc = await req.payload.findByID({
      collection: collection as CollectionSlug,
      id: documentId,
      depth: 1,
      overrideAccess: true,
      disableErrors: true,
      req,
    })

    if (!doc) {
      // Deleted between queueing and running. The index must not keep it.
      await removeDocument(collection, documentId)

      return { output: { result: 'deleted' } }
    }

    const current = (doc as { updatedAt?: string }).updatedAt

    if (current && version && current > version) {
      /*
       * The document has changed since this job was queued, so a later job
       * carries the newer content. Writing now would put stale text in the
       * index and look like a successful sync.
       */
      return { output: { result: 'superseded' } }
    }

    const result = await syncDocument(collection, doc as unknown as Record<string, unknown> & { id: unknown })

    return { output: { result } }
  },
}
