import type { GlobalConfig } from 'payload'

import { revalidateGlobal } from '@/payload/hooks/revalidate/revalidateGlobal'

import { editorialStaffOnly } from '@/payload/access/helpers'

/**
 * Site navigation (PRD Nº7 §82-§83, PRD Nº8 §28).
 *
 * PRD Nº8 §28 forbids hard-coding navigation in components, and PRD Nº7 §14
 * says the same about sections. A menu baked into JSX is a menu only a
 * developer can change — which in a newsroom means the menu stops reflecting
 * the newsroom.
 *
 * PRD Nº7 §83 prefers relationships over hand-typed URLs so the link follows
 * the document when its slug changes, rather than quietly 404ing.
 */
const linkFields = [
  { name: 'label', type: 'text' as const, required: true, label: 'Etiqueta' },
  {
    name: 'linkType',
    type: 'radio' as const,
    defaultValue: 'internal',
    label: 'Tipo',
    options: [
      { label: 'Sección del sitio', value: 'internal' },
      { label: 'URL externa', value: 'external' },
    ],
  },
  {
    name: 'category',
    type: 'relationship' as const,
    relationTo: 'categories' as const,
    label: 'Sección',
    admin: {
      condition: (_: unknown, siblingData: { linkType?: string }) =>
        siblingData?.linkType !== 'external',
      description: 'La URL se deriva del slug, así el enlace sobrevive a un cambio de slug.',
    },
  },
  {
    name: 'url',
    type: 'text' as const,
    label: 'URL',
    admin: {
      condition: (_: unknown, siblingData: { linkType?: string }) =>
        siblingData?.linkType === 'external',
    },
  },
  { name: 'newTab', type: 'checkbox' as const, defaultValue: false, label: 'Abrir en pestaña nueva' },
]

export const Navigation: GlobalConfig = {
  slug: 'navigation',

  hooks: { afterChange: [revalidateGlobal('navigation')] },

  access: {
    read: () => true,
    update: editorialStaffOnly,
  },

  admin: {
    group: 'OPERATIONS',
    description: 'Menús del sitio. Nunca se codifican en componentes.',
  },

  fields: [
    {
      name: 'primary',
      type: 'array',
      label: 'Navegación principal',
      labels: { singular: 'Enlace', plural: 'Enlaces' },
      admin: {
        description:
          'PRD Nº8 §11: sin mega-menú. Si no cabe en una línea, la jerarquía editorial está mal.',
      },
      fields: linkFields,
    },
    {
      name: 'secondary',
      type: 'array',
      label: 'Navegación secundaria',
      labels: { singular: 'Enlace', plural: 'Enlaces' },
      fields: linkFields,
    },
    {
      name: 'footer',
      type: 'array',
      label: 'Columnas del pie',
      labels: { singular: 'Columna', plural: 'Columnas' },
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Título' },
        {
          name: 'links',
          type: 'array',
          label: 'Enlaces',
          labels: { singular: 'Enlace', plural: 'Enlaces' },
          fields: linkFields,
        },
      ],
    },
    {
      name: 'social',
      type: 'array',
      label: 'Redes',
      labels: { singular: 'Red', plural: 'Redes' },
      fields: [
        { name: 'platform', type: 'text', required: true, label: 'Plataforma' },
        { name: 'url', type: 'text', required: true, label: 'URL' },
      ],
    },
  ],
}

export default Navigation
