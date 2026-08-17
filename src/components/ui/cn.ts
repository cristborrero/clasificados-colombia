/**
 * Class name composition (PRD Nº8 §183).
 *
 * Intentionally dependency-free. The usual pairing is `clsx` + `tailwind-merge`,
 * and `tailwind-merge` exists to resolve conflicts when a caller overrides a
 * utility the component already sets — `max-w-full` landing on a Container that
 * already declares its own max width, where the winner is decided by stylesheet
 * order rather than intent.
 *
 * These primitives avoid that situation by design: layout decisions are made
 * through explicit props (`<Container width="reading">`), not by overriding
 * classes from outside. `className` is for incidental additions only. If real
 * conflict bugs ever appear, that is the moment to add `tailwind-merge` — not
 * before (CLAUDE.md §85: check whether the problem actually exists first).
 */
export type ClassValue = string | number | null | undefined | false | ClassValue[]

export function cn(...values: ClassValue[]): string {
  const out: string[] = []

  const walk = (value: ClassValue): void => {
    if (!value && value !== 0) return

    if (Array.isArray(value)) {
      value.forEach(walk)
      return
    }

    out.push(String(value))
  }

  values.forEach(walk)

  return out.join(' ')
}
