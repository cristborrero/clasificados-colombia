import type { HighlightSegment } from '@/search/query'

/**
 * Renders highlighted search text (PRD Nº9 §46).
 *
 * `<mark>` elements built from plain segments. Nothing here touches
 * `dangerouslySetInnerHTML`, which is the whole point: Meilisearch returns text
 * with two sentinel markers, `splitHighlights` turns it into data, and React
 * escapes every character. A headline containing a tag renders as the
 * characters an editor typed.
 *
 * `<mark>` rather than a styled span, because the semantic element is what a
 * screen reader can announce as marked text.
 */
export function HighlightedText({ segments }: { segments: readonly HighlightSegment[] }) {
  return (
    <>
      {segments.map((segment, index) =>
        segment.match ? (
          <mark
            key={index}
            className="bg-[var(--color-alert-surface)] text-[color:var(--color-ink)]"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </>
  )
}
