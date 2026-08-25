import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { cn } from '@/components/ui/cn'

/**
 * La historia dominante (PRD Nº8 §38-§43, guía visual §02).
 *
 * ── Un desacuerdo que conviene dejar escrito ────────────────────────────────
 *
 * PRD Nº8 §40 dice que el texto nunca va encima de la fotografía, y da una
 * razón buena: un scrim cuesta contraste en toda imagen que no fue tomada para
 * llevar uno, y termina costando la fotografía. La guía visual del medio pide
 * exactamente lo contrario — panel oscuro a sangre, foto de fondo, titular
 * blanco encima.
 *
 * Manda la guía, porque es la decisión de identidad del medio y es más reciente
 * que el PRD. Pero la objeción del §40 era real, así que se responde en vez de
 * ignorarse:
 *
 *   · El degradado es direccional, no un velo parejo. Oscurece la mitad donde
 *     va el texto y deja respirar la otra, que es donde suele estar el motivo.
 *   · Hay un color de fondo sólido debajo. Si la imagen no carga, o no hay
 *     ninguna, el panel sigue siendo legible en vez de mostrar texto blanco
 *     sobre blanco.
 *   · El titular no depende del color para leerse: el degradado llega a opacidad
 *     casi total detrás de la primera línea.
 *
 * Si una foto concreta sigue peleando con el texto, el problema es esa foto y
 * la solución es cambiarla — no volver a discutir el layout.
 */
export type HomepageHeroProps = {
  href: string
  eyebrow: string
  eyebrowHref?: string | null
  eyebrowTone?: 'default' | 'accent'
  title: string
  dek?: string | null
  publishedAt?: string | null
  authors?: { name: string; slug: string }[]
  image?: { url: string; alt: string } | null
  /**
   * Se mantiene por compatibilidad con quien ya lo pasaba. En este diseño la
   * imagen es el fondo, así que no hay lado que elegir.
   */
  imageFirst?: boolean
  /** Texto del botón. La guía usa «Leer investigación» en el ejemplo. */
  ctaLabel?: string
  className?: string
}

export function HomepageHero({
  href,
  eyebrow,
  eyebrowHref,
  eyebrowTone = 'default',
  title,
  dek,
  publishedAt,
  authors,
  image,
  ctaLabel = 'Leer la historia',
  className,
}: HomepageHeroProps) {
  const firma = authors?.length ? authors.map((a) => a.name).join(' · ') : null

  const fecha = publishedAt
    ? new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(publishedAt),
      )
    : null

  return (
    <article
      className={cn(
        'relative isolate overflow-hidden bg-[var(--color-surface-inverse)]',
        'min-h-[26rem] sm:min-h-[32rem] lg:min-h-[38rem]',
        className,
      )}
    >
      {image ? (
        <>
          <Image
            src={image.url}
            alt={image.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          {/*
            Una sola capa, diagonal, y calibrada para que la foto se vea.
            
            La primera versión llevaba dos degradados superpuestos y el
            resultado fue un panel casi negro con la fotografía apenas
            insinuada: exactamente el costo del que advierte PRD Nº8 §40. La
            respuesta no es quitar el scrim —la guía visual quiere el texto
            encima— sino que el scrim haga su trabajo donde está el texto y se
            aparte donde está la imagen.
          */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(105deg,rgba(10,10,10,0.92)_0%,rgba(10,10,10,0.78)_38%,rgba(10,10,10,0.35)_62%,rgba(10,10,10,0.15)_100%)]"
          />
        </>
      ) : null}

      <Container
        width="wide"
        className="relative flex min-h-[inherit] flex-col justify-end py-10 sm:py-14 lg:py-16"
      >
        <div className="flex max-w-[56ch] flex-col gap-5 lg:max-w-[62%]">
          {eyebrowHref ? (
            <Link
              href={eyebrowHref}
              className={cn(
                'w-fit px-3 py-1.5 text-label font-semibold uppercase tracking-[0.12em] no-underline',
                eyebrowTone === 'accent'
                  ? 'bg-[var(--color-accent)] text-[color:var(--color-white)]'
                  : 'bg-[var(--color-white)] text-[color:var(--color-ink)]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-white)]',
              )}
            >
              {eyebrow}
            </Link>
          ) : (
            <p
              className={cn(
                'w-fit px-3 py-1.5 text-label font-semibold uppercase tracking-[0.12em]',
                eyebrowTone === 'accent'
                  ? 'bg-[var(--color-accent)] text-[color:var(--color-white)]'
                  : 'bg-[var(--color-white)] text-[color:var(--color-ink)]',
              )}
            >
              {eyebrow}
            </p>
          )}

          <h2 className="max-w-[32ch] font-[family-name:var(--font-editorial)] text-[clamp(2rem,5vw,3.75rem)] leading-[1.05] font-semibold text-balance text-[color:var(--color-white)]">
            <Link
              href={href}
              className="no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-white)]"
            >
              {title}
            </Link>
          </h2>

          {dek ? (
            <p className="max-w-[52ch] text-[length:var(--text-lead)] leading-relaxed text-[color:var(--color-gray-300)]">
              {dek}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href={href}
              className={cn(
                'inline-flex items-center gap-2 bg-[var(--color-accent)] px-5 py-3',
                'text-label font-semibold tracking-[0.08em] text-[color:var(--color-white)] uppercase no-underline',
                'transition-colors hover:bg-[var(--color-red-hover)]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-white)]',
              )}
            >
              {ctaLabel}
              <span aria-hidden>→</span>
            </Link>

            {(firma ?? fecha) ? (
              <p className="text-metadata text-[color:var(--color-gray-300)]">
                {[firma, fecha].filter(Boolean).join(' · ')}
              </p>
            ) : null}
          </div>
        </div>
      </Container>
    </article>
  )
}
