import Image from 'next/image'

import { cn } from '@/components/ui/cn'

import { MediaCaption } from './MediaCaption'
import { MediaCredit } from './MediaCredit'

/**
 * Editorial photograph with caption and credit (PRD Nº8 §64, PRD Nº10 §142).
 *
 * A `<figure>` with a `<figcaption>`, so the caption is programmatically tied
 * to the image rather than merely sitting under it. Without that association a
 * screen reader reads the caption as a stray paragraph belonging to whatever
 * came before.
 *
 * The credit is required whenever the media record has one. PRD Nº10 makes
 * photographer attribution part of the rights record, and an uncredited
 * photograph on an investigative outlet is a licensing problem waiting to
 * happen.
 *
 * `alt` is passed through exactly as stored — never derived from the caption.
 * A caption says what the picture means; alt text says what it shows. Copying
 * one into the other produces a screen-reader experience where every image is
 * described twice and none is described.
 */
export type EditorialImageProps = {
  src: string
  alt: string
  width: number
  height: number
  caption?: string | null
  credit?: string | null
  sizes?: string
  priority?: boolean
  className?: string
}

export function EditorialImage({
  src,
  alt,
  width,
  height,
  caption,
  credit,
  sizes = '(min-width: 900px) 900px, 100vw',
  priority = false,
  className,
}: EditorialImageProps) {
  return (
    <figure className={cn('flex flex-col gap-2', className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className="h-auto w-full bg-[var(--color-surface-sunken)]"
      />

      {caption || credit ? (
        <figcaption className="flex flex-col gap-1">
          {caption ? <MediaCaption>{caption}</MediaCaption> : null}
          {credit ? <MediaCredit>{credit}</MediaCredit> : null}
        </figcaption>
      ) : null}
    </figure>
  )
}
