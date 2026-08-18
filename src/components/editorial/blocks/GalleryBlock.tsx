import Image from 'next/image'

import { Metadata } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'

/**
 * Image gallery (PRD Nº7 §33).
 *
 * A grid of figures, not a carousel. A carousel hides most of its content
 * behind an interaction the reader has to discover, costs a keyboard user a
 * custom widget, and is the classic place where images stop being reachable at
 * all. Photographs an editor thought worth publishing should be on the page.
 *
 * Each image keeps its own caption in its own `<figcaption>`, so a screen
 * reader can pair them. A single caption under a grid of six belongs to none
 * of them.
 */
export type GalleryImage = {
  url: string
  alt: string
  caption?: string | null
  width?: number | null
  height?: number | null
}

export function GalleryBlock({
  images,
  className,
}: {
  images: readonly GalleryImage[]
  className?: string
}) {
  if (images.length === 0) return null

  return (
    <div className={cn('my-10 grid gap-6 sm:grid-cols-2', className)}>
      {images.map((image) => (
        <figure key={image.url} className="flex flex-col gap-2">
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width ?? 1200}
            height={image.height ?? 800}
            sizes="(min-width: 640px) 50vw, 100vw"
            className="h-auto w-full bg-[var(--color-surface-sunken)]"
          />

          {image.caption ? (
            <figcaption>
              <Metadata as="span" className="block text-[color:var(--color-text-muted)]">
                {image.caption}
              </Metadata>
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  )
}
