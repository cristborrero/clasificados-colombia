import { readGlobal } from '@/lib/payload/client'

import {
  findPublishedBySlug,
  listPublished,
  type EditorialCollection,
  type EditorialSummary,
} from './collections'
import { asNumber, asRecord, asString } from './project'

/**
 * Homepage composition (PRD Nº8 §37, DoD F10).
 *
 * Turns the `homepage` Global — an ordered list of blocks an editor drags into
 * place — into the bands the page renders. The page walks the result; it does
 * not know which bands exist or in what order, which is the whole point of
 * making the running order editable.
 *
 * A homepage with no configuration still renders. `DEFAULT_BANDS` is what a
 * fresh install shows: the most recent piece as the hero, then the stream. A
 * front page that is blank until someone opens the admin panel is a front page
 * that cannot be deployed before it is configured.
 */

export type HeroBand = {
  kind: 'hero'
  item: EditorialSummary
  source: EditorialCollection
  imageFirst: boolean
}

export type SecondaryBand = {
  kind: 'secondary'
  title: string | null
  items: EditorialSummary[]
  leadCount: number
}

export type LatestBand = {
  kind: 'latest'
  title: string | null
  items: EditorialSummary[]
}

export type CollectionBand = {
  kind: 'collection'
  block: 'investigations' | 'analysis' | 'data' | 'video' | 'opinion'
  source: EditorialCollection
  title: string | null
  items: EditorialSummary[]
  cta: { label: string; href: string } | null
}

export type NewsletterBand = {
  kind: 'newsletter'
  title: string
  description: string | null
  ctaLabel: string
}

export type HomepageBand =
  | HeroBand
  | SecondaryBand
  | LatestBand
  | CollectionBand
  | NewsletterBand

type Block = Record<string, unknown>

type HomepageGlobal = { bands?: Block[] | null }

/**
 * Which collection each band reads from.
 *
 * `analysis` reads articles: an analysis piece is an article with a different
 * editorial intent, not a different content type (PRD Nº7 §57). The band exists
 * so the front page can group them; the model does not need a fifth table for
 * it.
 */
const BAND_SOURCE: Record<CollectionBand['block'], EditorialCollection> = {
  investigations: 'investigations',
  analysis: 'articles',
  data: 'data-stories',
  video: 'video-stories',
  opinion: 'opinions',
}

const DEFAULT_BANDS: Block[] = [
  { blockType: 'hero', imageFirst: true },
  { blockType: 'latest', title: 'Últimas noticias', limit: 8 },
]

const limitOf = (block: Block, fallback: number): number => asNumber(block.limit) ?? fallback

/** A relationship rendered by Payload as `{ relationTo, value }`. */
function polymorphicSlug(value: unknown): { collection: EditorialCollection; slug: string } | null {
  const record = asRecord(value as never)
  if (!record) return null

  const relationTo = asString(record.relationTo)
  const slug = asString(asRecord(record.value as never)?.slug)

  if (!relationTo || !slug) return null

  return { collection: relationTo as EditorialCollection, slug }
}

async function resolveHero(block: Block): Promise<HeroBand | null> {
  const imageFirst = block.imageFirst !== false
  const picked = polymorphicSlug(block.article)

  if (picked) {
    const item = await findPublishedBySlug(picked.collection, picked.slug)

    /*
     * A hand-picked hero that comes back empty means the editor chose a piece
     * that is not public — unpublished, or pulled after being chosen. Falling
     * through to the automatic hero is deliberate: a front page with no lead
     * story is worse than one leading with the newest piece, and the alternative
     * would be to render the unpublished piece, which is the one thing that must
     * never happen.
     */
    if (item) return { kind: 'hero', item, source: picked.collection, imageFirst }
  }

  const [latest] = await listPublished('articles', { limit: 1 })

  return latest ? { kind: 'hero', item: latest, source: 'articles', imageFirst } : null
}

async function resolveBand(block: Block, heroSlug: string | null): Promise<HomepageBand | null> {
  const blockType = asString(block.blockType)
  const title = asString(block.title)
  const categorySlug = asString(asRecord(block.category as never)?.slug)

  switch (blockType) {
    case 'hero':
      return resolveHero(block)

    case 'secondary': {
      const items = await listPublished('articles', {
        limit: limitOf(block, 6),
        categorySlug,
        excludeSlug: heroSlug,
      })

      return items.length > 0
        ? { kind: 'secondary', title, items, leadCount: asNumber(block.leadCount) ?? 2 }
        : null
    }

    case 'latest': {
      const items = await listPublished('articles', {
        limit: limitOf(block, 8),
        categorySlug,
        excludeSlug: heroSlug,
      })

      return items.length > 0 ? { kind: 'latest', title, items } : null
    }

    case 'newsletter':
      return {
        kind: 'newsletter',
        title: title ?? 'Recibe nuestras investigaciones',
        description: asString(block.description),
        ctaLabel: asString(block.ctaLabel) ?? 'Suscribirme',
      }

    case 'investigations':
    case 'analysis':
    case 'data':
    case 'video':
    case 'opinion': {
      const source = BAND_SOURCE[blockType]

      const items = await listPublished(source, {
        limit: limitOf(block, 3),
        categorySlug,
        excludeSlug: source === 'articles' ? heroSlug : null,
      })

      const ctaLabel = asString(block.ctaLabel)
      const ctaHref = asString(block.ctaHref)

      /*
       * An empty band is omitted, not rendered as an empty heading. "DATOS"
       * followed by nothing reads as a bug to a reader and as neglect to an
       * editor.
       */
      return items.length > 0
        ? {
            kind: 'collection',
            block: blockType,
            source,
            title,
            items,
            cta: ctaLabel && ctaHref ? { label: ctaLabel, href: ctaHref } : null,
          }
        : null
    }

    default:
      // An unknown block type is a schema that moved ahead of this file.
      // Skipping it keeps the front page up.
      return null
  }
}

export async function getHomepage(): Promise<HomepageBand[]> {
  const global = await readGlobal<HomepageGlobal>('homepage')

  const configured = global?.bands?.length ? global.bands : DEFAULT_BANDS

  /*
   * Sequential rather than Promise.all, because the hero has to resolve before
   * the bands under it: every other band excludes the hero's slug, and running
   * them in parallel would publish the lead story twice on the same screen.
   */
  const bands: HomepageBand[] = []
  let heroSlug: string | null = null

  for (const block of configured) {
    const band = await resolveBand(block, heroSlug)
    if (!band) continue

    if (band.kind === 'hero') heroSlug = band.item.slug

    bands.push(band)
  }

  return bands
}
