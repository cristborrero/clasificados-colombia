import Link from 'next/link'

import { Body, HeadlineMD, Metadata } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'

/**
 * People and organisations named in an investigation (PRD Nº8 §81).
 *
 * THE RULE: *"Debe contextualizar. No presentar asociación como culpabilidad."*
 *
 * That is why `context` is a required field here rather than an optional one,
 * and why the component refuses to render an entity without it. A bare list of
 * names under an investigation into corruption reads as a list of the corrupt —
 * to a reader skimming, and to a search engine indexing the name next to the
 * headline. Someone who answered questions honestly and someone under
 * investigation would appear identically.
 *
 * The explanatory line above the list says so in the page, not only in this
 * comment, because the reader is the one who needs to know it.
 */
export type Entity = {
  name: string
  slug: string
  /** Why this person or organisation appears. Required — see above. */
  context: string
  role?: string | null
  kind: 'person' | 'organization'
}

const entityPath = (entity: Entity): string =>
  entity.kind === 'person' ? `/persona/${entity.slug}` : `/organizacion/${entity.slug}`

export function EntityList({
  entities,
  title = 'Quiénes aparecen',
  className,
}: {
  entities: readonly Entity[]
  title?: string
  className?: string
}) {
  // An entity with no context is omitted rather than listed bare.
  const contextualised = entities.filter((entity) => entity.context.trim().length > 0)

  if (contextualised.length === 0) return null

  return (
    <section className={cn('my-16 mx-auto max-w-3xl', className)} aria-labelledby="entidades">
      <HeadlineMD as="h2" id="entidades">
        {title}
      </HeadlineMD>

      <Metadata className="mt-2 text-[color:var(--color-text-muted)]">
        Aparecer en esta lista no implica responsabilidad penal ni disciplinaria. Se indica en cada
        caso por qué la persona u organización figura en la investigación.
      </Metadata>

      <ul className="mt-8 flex flex-col gap-6 w-full">
        {contextualised.map((entity) => (
          <li key={`${entity.kind}-${entity.slug}`} className="flex flex-col gap-1">
            <p className="font-[family-name:var(--font-sans)] text-[length:var(--text-body)] font-semibold">
              <Link
                href={entityPath(entity)}
                className="no-underline underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
              >
                {entity.name}
              </Link>

              {entity.role ? (
                <span className="font-normal text-[color:var(--color-text-muted)]">
                  {' '}
                  — {entity.role}
                </span>
              ) : null}
            </p>

            <Body className="text-[color:var(--color-text-muted)]">{entity.context}</Body>
          </li>
        ))}
      </ul>
    </section>
  )
}
