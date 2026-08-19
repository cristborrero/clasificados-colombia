import type { JsonLd as JsonLdObject } from '@/lib/seo/structuredData'

/**
 * Renders structured data.
 *
 * `JSON.stringify` on a plain object, never a string built by a caller. That is
 * what makes this safe: every value goes through JSON escaping, so a headline
 * containing `</script>` cannot close the tag and turn an editor's typo into
 * script injection.
 *
 * The `<` replacement afterwards covers exactly that case — JSON.stringify does
 * not escape it, and inside a script element it is the one character that
 * matters.
 */
export function JsonLd({ data }: { data: JsonLdObject | null | undefined }) {
  if (!data) return null

  const json = JSON.stringify(data).replace(/</g, '\\u003c')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
