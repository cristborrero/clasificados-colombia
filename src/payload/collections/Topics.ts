import type { CollectionConfig } from 'payload'

import { adminOnly, newsroomStaffOnly, publicActiveOrEditorial } from '@/payload/access/helpers'
import { seoFields } from '@/payload/fields/seo'
import { slugField } from '@/payload/fields/slug'

/**
 * Topics — thematic threads that cut across sections (PRD Nº7 §16).
 *
 * A category is where a piece lives; a topic is what it is part of.
 * "Contratación pública" spans Política, Justicia and Datos at once, and PRD
 * SEO §56 turns each one into a hub page — which is how a newsroom builds
 * authority on a subject rather than publishing isolated notes.
 */
export const Topics: CollectionConfig = {
  slug: 'topics',

  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'active'],
    group: 'NEWSROOM',
    description: 'Temas transversales. Alimentan las páginas de tema (/tema/[slug]).',
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nombre',
    },

    ...slugField({ sourceField: 'name' }),

    {
      name: 'description',
      type: 'textarea',
      label: 'Descripción',
      admin: {
        description: 'Contexto del tema. Encabeza la página del hub.',
      },
    },

    {
      name: 'relatedTopics',
      type: 'relationship',
      relationTo: 'topics',
      hasMany: true,
      label: 'Temas relacionados',
      admin: {
        description: 'Para navegación contextual. No incluir este mismo tema.',
      },
      filterOptions: ({ id }) => {
        // A topic related to itself is a dead link in the UI.
        if (!id) return true
        return { id: { not_equals: id } }
      },
    },

    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen',
      admin: { description: 'Encabeza la página del tema.' },
    },

    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      label: 'Activo',
    },

    seoFields(),
  ],
}

export default Topics
