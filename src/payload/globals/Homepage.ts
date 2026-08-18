import type { Block, GlobalConfig } from 'payload'

import { getUser, hasRole } from '@/payload/access/helpers'
import { revalidateGlobal } from '@/payload/hooks/revalidate/revalidateGlobal'

/**
 * Homepage composition (PRD Nº8 §37, PRD Nº7 §84).
 *
 * §37 lists what a homepage has — dominant story, secondary, latest,
 * investigations, analysis, data, video, opinion, newsletter — and the plan's
 * DoD for F10 adds the part that matters: an editor reorders it *without
 * touching code*. A homepage whose running order lives in JSX is a homepage
 * that only changes when a developer is available, which is not how a newsroom
 * runs a breaking day.
 *
 * Modelled as `blocks` rather than a fixed set of groups, because the order is
 * the editorial decision. Blocks give drag-and-drop ordering for free, and a
 * band that is not wanted today is simply absent rather than switched off.
 *
 * Each band picks its own content deliberately or automatically. Automatic is
 * the default — a homepage that requires manual curation of nine bands stops
 * being updated by the third day.
 */
const sourceFields = [
  {
    name: 'title',
    type: 'text' as const,
    label: 'Título de la banda',
    admin: { description: 'Lo que se imprime en el SectionHeader. Vacío = sin encabezado.' },
  },
  {
    name: 'limit',
    type: 'number' as const,
    defaultValue: 6,
    min: 1,
    max: 24,
    label: 'Cantidad',
  },
  {
    name: 'category',
    type: 'relationship' as const,
    relationTo: 'categories' as const,
    label: 'Limitar a una sección',
    admin: { description: 'Opcional. Vacío = todas las secciones.' },
  },
]

const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Historia dominante', plural: 'Historias dominantes' },
  fields: [
    {
      name: 'article',
      type: 'relationship',
      relationTo: ['articles', 'investigations', 'data-stories'],
      label: 'Pieza destacada',
      admin: {
        description:
          'PRD Nº8 §38: el hero admite nota, investigación o dato. Vacío = la publicación más reciente.',
      },
    },
    {
      name: 'imageFirst',
      type: 'checkbox',
      defaultValue: true,
      label: 'Imagen a la izquierda',
      admin: { description: 'PRD Nº8 §39: 7 columnas de imagen y 5 de texto, o al revés.' },
    },
  ],
}

const SecondaryBlock: Block = {
  slug: 'secondary',
  labels: { singular: 'Historias secundarias', plural: 'Historias secundarias' },
  fields: [
    ...sourceFields,
    {
      name: 'leadCount',
      type: 'number',
      defaultValue: 2,
      min: 0,
      max: 4,
      label: 'Con peso completo',
      admin: { description: 'PRD Nº8 §44: no todas con el mismo peso.' },
    },
  ],
}

const LatestBlock: Block = {
  slug: 'latest',
  labels: { singular: 'Últimas noticias', plural: 'Últimas noticias' },
  fields: sourceFields,
}

const CollectionBandBlock = (slug: string, singular: string): Block => ({
  slug,
  labels: { singular, plural: singular },
  fields: [
    ...sourceFields,
    {
      name: 'ctaLabel',
      type: 'text',
      label: 'Texto del enlace “ver todas”',
    },
    {
      name: 'ctaHref',
      type: 'text',
      label: 'Destino del enlace',
    },
  ],
})

const NewsletterBlock: Block = {
  slug: 'newsletter',
  labels: { singular: 'Newsletter', plural: 'Newsletter' },
  fields: [
    { name: 'title', type: 'text', label: 'Título' },
    { name: 'description', type: 'textarea', label: 'Texto' },
    { name: 'ctaLabel', type: 'text', label: 'Botón' },
  ],
}

export const Homepage: GlobalConfig = {
  slug: 'homepage',

  hooks: { afterChange: [revalidateGlobal('homepage')] },

  access: {
    read: () => true,
    /*
     * The front page is the newsroom's loudest editorial statement, so the
     * roles that may rearrange it are the ones accountable for it. Deliberately
     * narrower than `editorialStaffOnly`: a photo editor curates images, not
     * the running order of the edition.
     */
    update: ({ req }) => hasRole(getUser(req), ['administrator', 'editor_in_chief', 'editor']),
  },

  admin: {
    group: 'EDITORIAL',
    description: 'Orden de la portada. Se reordena arrastrando, sin tocar código.',
  },

  fields: [
    {
      name: 'bands',
      type: 'blocks',
      label: 'Bandas de la portada',
      labels: { singular: 'Banda', plural: 'Bandas' },
      blocks: [
        HeroBlock,
        SecondaryBlock,
        LatestBlock,
        CollectionBandBlock('investigations', 'Investigaciones'),
        CollectionBandBlock('analysis', 'Análisis'),
        CollectionBandBlock('data', 'Datos'),
        CollectionBandBlock('video', 'Video'),
        CollectionBandBlock('opinion', 'Opinión'),
        NewsletterBlock,
      ],
    },
  ],
}

export default Homepage
