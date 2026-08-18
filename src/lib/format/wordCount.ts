/**
 * Word counting over a Lexical tree.
 *
 * Its own module, with no Payload import, for the same reason every other pure
 * rule in this codebase has one: a module that reaches for `@payload-config`
 * cannot be loaded by a unit test without booting the CMS. The reading-time
 * estimate is printed on every article and getting it wrong is invisible —
 * nobody notices that "7 min" should have said "4 min" — so it needs tests, so
 * it lives here.
 */

/**
 * Counts the words in a Lexical document.
 *
 * Walks the tree rather than serialising it to text, so that blocks can be
 * skipped: a fact box's labels and an image caption are not prose read at
 * reading speed, and counting them inflates the estimate on exactly the
 * articles that contain the most of them.
 */
export function countWords(node: unknown): number {
  if (!node || typeof node !== 'object') return 0

  const record = node as Record<string, unknown>

  if (record.type === 'block') return 0

  const own =
    typeof record.text === 'string' ? record.text.trim().split(/\s+/).filter(Boolean).length : 0

  const children = Array.isArray(record.children) ? record.children : []

  const root =
    record.root && typeof record.root === 'object' ? (record.root as Record<string, unknown>) : null

  return (
    own +
    children.reduce<number>((total, child) => total + countWords(child), 0) +
    (root ? countWords(root) : 0)
  )
}
