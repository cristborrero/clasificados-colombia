/**
 * `pnpm search:reindex` — full Meilisearch rebuild from Payload.
 *
 * Required by PRD Nº7 §152, Nº9 §90-§92 and CLAUDE.md §41. Implemented in F14.
 *
 * The command exists now, and fails loudly, for a specific reason: a documented
 * command that silently does nothing is worse than a missing one. Anyone who
 * runs this before F14 gets told exactly where it stands.
 *
 * Target flow (PRD Nº9 §91):
 *   create new index → apply settings → batch documents (500–1000)
 *                    → validate counts → swap index
 *
 * Invariants it must honour:
 *   - only `published` + `public` content enters the index (§4)
 *   - Payload stays the canonical source; Meilisearch is derived (§2)
 *   - running it twice must produce the same logical state (§153 / §84)
 */
export default async function reindex(): Promise<never> {
  throw new Error(
    'search:reindex is not implemented yet — it lands in F14 (Search). ' +
      'See docs/implementation/MASTER-IMPLEMENTATION-PLAN.md §5 (F14).',
  )
}
