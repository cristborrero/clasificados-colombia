import type { CollectionConfig } from 'payload'

import { adminOnly, newsroomStaffOnly, publicActiveOrEditorial } from '@/payload/access/helpers'
import { slugField } from '@/payload/fields/slug'

/**
 * People mentioned editorially (PRD Nº7 §17).
 *
 * The most important thing about this collection is what it deliberately does
 * NOT contain. PRD Nº7 §17 forbids fields like `guilty`, `criminal` or
 * `suspect`, and PRD Arquitectura §12 states the rule behind it: a `person`
 * record must never read as an assertion of guilt.
 *
 * The reason is structural, not squeamish. A boolean called `suspect` becomes
 * a filter, then a list, then a page of "suspects" that no editor ever wrote
 * and no lawyer ever reviewed. Context belongs in the editorial text, where a
 * human is answerable for the wording.
 *
 * PRD Arquitectura §12 additionally requires that an investigation with a
 * non-empty `people[]` cannot be published without `legalStatus = approved`.
 * That guard lives with Investigations in F5.
 */
export const People: CollectionConfig = {
  slug: 'people',

  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'roleDescription', 'active'],
    group: 'NEWSROOM',
    description:
      'Personas mencionadas editorialmente. Aparecer aquí no implica ninguna imputación: el contexto va en el texto periodístico.',
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
      name: 'roleDescription',
      type: 'text',
      label: 'Cargo o rol',
      admin: {
        description:
          'Función pública o cargo verificable. Ejemplo: «Ministro de Transporte (2022-2024)».',
      },
    },

    {
      name: 'organizations',
      type: 'relationship',
      relationTo: 'organizations',
      hasMany: true,
      label: 'Organizaciones',
      admin: {
        description: 'Vínculos institucionales verificables, no asociaciones sugeridas.',
      },
    },

    {
      name: 'description',
      type: 'textarea',
      label: 'Descripción',
      admin: {
        description:
          'Contexto factual y atribuible. No redactar conclusiones ni juicios: eso pertenece al artículo, con firma responsable.',
      },
    },

    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media',
      label: 'Retrato',
    },

    {
      name: 'publicSources',
      type: 'array',
      label: 'Fuentes públicas',
      labels: { singular: 'Fuente', plural: 'Fuentes' },
      admin: {
        description:
          'De dónde sale la información de esta ficha. Solo fuentes públicas y verificables.',
      },
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

export default People
