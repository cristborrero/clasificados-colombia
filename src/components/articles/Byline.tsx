import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/components/ui/cn'

/**
 * Article byline (PRD Nº8 §60, PRD SEO §24 §31).
 *
 * "Por Nombre Apellido" and the job title, with an optional small portrait.
 *
 * The author links to their page and carries `rel="author"`. That is not
 * decoration on an investigative outlet: PRD SEO §31 ties published journalism
 * to an identifiable, traceable author, and the E-E-A-T signal a search engine
 * reads is the same one a reader uses to decide whether to believe the piece.
 */
export type BylineAuthor = {
  name: string
  slug: string
  jobTitle?: string | null
  portrait?: { url: string; alt: string } | null
}

const linkClass = cn(
  'font-semibold no-underline underline-offset-4 hover:underline',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
)

export function Byline({
  authors,
  showPortraits = true,
  className,
}: {
  authors: readonly BylineAuthor[]
  showPortraits?: boolean
  className?: string
}) {
  if (authors.length === 0) return null

  const portraits = showPortraits ? authors.filter((author) => author.portrait) : []

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {portraits.length > 0 ? (
        <div aria-hidden className="flex -space-x-2">
          {portraits.map((author) => (
            <Image
              key={author.slug}
              src={author.portrait!.url}
              alt=""
              width={80}
              height={80}
              sizes="40px"
              className="size-10 rounded-full border-2 border-[var(--color-surface)] object-cover"
            />
          ))}
        </div>
      ) : null}

      <p className="font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)]">
        <span className="text-[color:var(--color-text-muted)]">Por </span>

        {authors.map((author, index) => (
          <span key={author.slug}>
            {index > 0 ? (
              <span aria-hidden>{index === authors.length - 1 ? ' y ' : ', '}</span>
            ) : null}

            <Link href={`/autor/${author.slug}`} rel="author" className={linkClass}>
              {author.name}
            </Link>

            {author.jobTitle ? (
              <span className="text-[color:var(--color-text-muted)]">, {author.jobTitle}</span>
            ) : null}
          </span>
        ))}
      </p>
    </div>
  )
}
