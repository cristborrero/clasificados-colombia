import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Keeps Meilisearch in step with Payload (PRD Nº9 §79-§89, CLAUDE.md §40).
 *
 * THE RULE THIS EXISTS TO HONOUR is §87: publishing must succeed whether or not
 * Meilisearch is available. So the hook never awaits the index inside the
 * editorial transaction — an editor pressing Publish during a Meilisearch
 * outage must not see their work rejected because a derived system is down.
 *
 * The sync is fired and detached. `void` on the promise is deliberate, and the
 * `catch` is what makes it safe: an unhandled rejection in a detached promise
 * takes down the Node process in some configurations, which would turn a search
 * outage into a site outage — precisely the coupling §87 forbids.
 *
 * §89 warns about ordering: publish v5, update v6, and the v5 job finishing
 * last overwrites v6. Two things reduce that here. The document pushed is the
 * one the hook received, so a late v5 writes v5's content, not stale content
 * from a re-read; and because every write is a full upsert by a stable id, the
 * next change corrects it. A version-stamped job queue is the complete fix and
 * belongs with F18, where the Jobs infrastructure lands — noted rather than
 * pretended away.
 */
type SearchableDoc = Record<string, unknown> & { id: string | number }

async function pushToIndex(collection: string, doc: SearchableDoc): Promise<void> {
  // Imported lazily so that Meilisearch's adapter — and the key it reads — is
  // never pulled into a bundle that does not need it, and so a misconfigured
  // search cannot break importing the collection config.
  const { syncDocument } = await import('@/search/indexer')

  await syncDocument(collection, doc)
}

export const syncSearchAfterChange =
  (collection: string): CollectionAfterChangeHook =>
  ({ doc, req }) => {
    void pushToIndex(collection, doc as SearchableDoc).catch((error: unknown) => {
      /*
       * Logged, never thrown. PRD Nº9 §86 asks for permanent failures to be
       * recorded rather than lost silently; this is the record until the job
       * queue in F18 can retry properly.
       */
      req.payload.logger.error(
        `No se pudo sincronizar ${collection}/${(doc as SearchableDoc).id} con Meilisearch: ${
          error instanceof Error ? error.message : 'error desconocido'
        }`,
      )
    })

    return doc
  }

export const syncSearchAfterDelete =
  (collection: string): CollectionAfterDeleteHook =>
  ({ id, req }) => {
    void (async () => {
      const { removeDocument } = await import('@/search/indexer')

      await removeDocument(collection, id)
    })().catch((error: unknown) => {
      // A document deleted from Payload but left in the index is a search
      // result that 404s — worse than a missing result, because the reader
      // spends a click finding out.
      req.payload.logger.error(
        `No se pudo eliminar ${collection}/${id} de Meilisearch: ${
          error instanceof Error ? error.message : 'error desconocido'
        }`,
      )
    })
  }
