import type { CollectionConfig } from 'payload'

import { adminOnly, newsroomStaffOnly, publicActiveOrEditorial } from '@/payload/access/helpers'
import { slugField } from '@/payload/fields/slug'

/**
 * Organizations mentioned editorially (PRD Nº7 §18).
 *
 * Same principle as People: this is a reference record, not a verdict. An
 * organisation appearing here has been written about, nothing more.
 */
export const Organizations: CollectionConfig = {
  slug: 'organizations',

  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'organizationType', 'active'],
    group: 'NEWSROOM',
    description: 'Entidades mencionadas editorialmente.',
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
      name: 'organizationType',
      type: 'select',
      required: true,
      defaultValue: 'other',
      index: true,
      label: 'Tipo',
      options: [
        { label: 'Gobierno', value: 'government' },
        { label: 'Empresa', value: 'company' },
        { label: 'ONG', value: 'ngo' },
        { label: 'Política', value: 'political' },
        { label: 'Internacional', value: 'international' },
        { label: 'Medio de comunicación', value: 'media' },
        { label: 'Otro', value: 'other' },
      ],
    },

    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
    },

    {
      name: 'description',
      type: 'textarea',
      label: 'Descripción',
    },

    {
      name: 'website',
      type: 'text',
      label: 'Sitio web',
    },

    {
      name: 'location',
      type: 'text',
      label: 'Ubicación',
    },

    {
      name: 'publicSources',
      type: 'array',
      label: 'Fuentes públicas',
      labels: { singular: 'Fuente', plural: 'Fuentes' },
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Título' },
        { name: 'url', type: 'text', label: 'URL' },
      ],
    },

    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      label: 'Activa',
    },
  ],
}

export default Organizations
