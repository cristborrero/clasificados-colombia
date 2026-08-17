/**
 * `pnpm media:regenerate` — rebuild image derivatives from preserved originals.
 *
 * Required by PRD Nº10 §163-§165. Implemented in F15.
 *
 * Must be able to apply a new derivative configuration without re-uploading
 * anything (§164), which is only possible because the original is never
 * overwritten (§17). Bumping `MEDIA_PIPELINE_VERSION` is what signals that a
 * regeneration is needed (§165).
 */
export default async function regenerateMedia(): Promise<never> {
  throw new Error(
    'media:regenerate is not implemented yet — it lands in F15 (Media Pipeline). ' +
      'See docs/implementation/MASTER-IMPLEMENTATION-PLAN.md §5 (F15).',
  )
}
