import { Dek } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'

import { CardEyebrow } from './parts/CardEyebrow'
import { CardMedia } from './parts/CardMedia'
import { CardMeta } from './parts/CardMeta'
import { CardTitle } from './parts/CardTitle'

/**
 * The dominant story (PRD Nº8 §38-§43).
 *
 * Takes an already-resolved `href` and `eyebrow` rather than a content type,
 * because §38 says the hero carries an Article, an Investigation *or* a
 * DataStory. Branching on a `kind` prop inside the component would be the
 * mega-card of §49 wearing a different name; the page knows what it is
 * promoting and says so.
 *
 * §39: seven columns of image, five of content, or the reverse. `imageFirst`
 * is that choice, and it is an editorial one — which is why it is a prop and
 * not a breakpoint.
 *
 * §40: the text never sits on top of the photograph. An overlay costs contrast
 * on every image that was not shot for one, and the fix is always a scrim,
 * which costs the photograph.
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
  /** §39: image on the left (default) or on the right. */
  imageFirst?: boolean
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
  imageFirst = true,
  className,
}: HomepageHeroProps) {
  return (
    <article className={cn('group grid gap-8 lg:grid-cols-12 lg:gap-[var(--gutter)]', className)}>
      {image ? (
        <CardMedia
          href={href}
          src={image.url}
          alt={image.alt}
          aspect="3/2"
          sizes="(min-width: 1024px) 58vw, 100vw"
          priority
          className={cn('lg:col-span-7', imageFirst ? 'lg:order-1' : 'lg:order-2')}
        />
      ) : null}

      <div
        className={cn(
          'flex flex-col gap-4 lg:justify-center',
          image ? 'lg:col-span-5' : 'lg:col-span-9',
          imageFirst ? 'lg:order-2' : 'lg:order-1',
        )}
      >
        <CardEyebrow label={eyebrow} href={eyebrowHref} tone={eyebrowTone} />

        {/* §42: the headline occupies the main visual space, in the editorial
            serif. It is also the page's h1 — one per page (PRD Nº8 §106). */}
        <CardTitle href={href} title={title} as="h2" size="lg" />

        {dek ? (
          // §43: a dek, not a paragraph.
          <Dek className="max-w-[48ch] text-[color:var(--color-text-muted)]">{dek}</Dek>
        ) : null}

        <CardMeta authors={authors} date={publishedAt} />
      </div>
    </article>
  )
}
