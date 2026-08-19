import type { Payload } from 'payload'

/**
 * Failed background work, on the dashboard (F18 DoD).
 *
 * "Jobs that die are recorded and alerted, not lost in silence" needs somewhere
 * the alert actually lands. `pnpm jobs:health` covers an operator at a
 * terminal; this covers the newsroom, which is where the consequence shows up —
 * a failed `syncSearch` means a published piece is missing from search, and the
 * person who notices is an editor, not a sysadmin.
 *
 * Renders nothing when the queue is healthy. A dashboard that always shows a
 * status box teaches people to stop reading it.
 */
export async function SearchHealth({ payload }: { payload: Payload }) {
  let failed = 0

  try {
    const result = await payload.find({
      collection: 'payload-jobs',
      where: { hasError: { equals: true } },
      limit: 0,
      depth: 0,
      overrideAccess: true,
    })

    failed = result.totalDocs
  } catch {
    /*
     * The dashboard must render even when this query cannot. A health widget
     * that takes down the page it reports on is worse than no widget.
     */
    return null
  }

  if (failed === 0) return null

  return (
    <div
      role="status"
      style={{
        marginBottom: 'var(--base)',
        padding: 'var(--base)',
        borderLeft: '3px solid var(--theme-error-500, #d71920)',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <strong>
        {failed === 1
          ? 'Un trabajo en segundo plano falló definitivamente.'
          : `${failed} trabajos en segundo plano fallaron definitivamente.`}
      </strong>

      <p style={{ margin: '0.4em 0 0', fontSize: '0.85rem' }}>
        La sincronización con el buscador es lo que suele quedar pendiente: puede haber contenido
        publicado que no aparezca al buscarlo. Ejecutá <code>pnpm jobs:health</code> para ver el
        detalle y <code>pnpm search:reindex</code> para reconstruir el índice.
      </p>
    </div>
  )
}

export default SearchHealth
