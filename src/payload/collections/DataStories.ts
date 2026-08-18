import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { canUpdateEditorialContent, getUser, hasRole, isActive } from '@/payload/access/helpers'
import { editorialBlocks } from '@/payload/blocks/editorial'
import { ownershipFields } from '@/payload/fields/ownership'
import { publicationFields } from '@/payload/fields/publication'
import { seoFields } from '@/payload/fields/seo'
import { slugField } from '@/payload/fields/slug'
import { workflowFields } from '@/payload/fields/workflow'
import { createStatusContractHook } from '@/payload/hooks/editorial/enforceStatusContract'
import { recordFirstPublication } from '@/payload/hooks/publication/recordFirstPublication'
import { createSlugRedirect, lockSlugOnPublish } from '@/payload/hooks/redirects/createSlugRedirect'

/**
 * Data stories (PRD Nº7 §59-§60).
 *
 * Methodology is required before publication, not optional. PRD SEO §84 is
 * blunt about the reason: publishing charts without context is not data
 * journalism, and a figure a reader cannot trace is a claim rather than
 * evidence. The publish guard enforces it the same way it does for
 * investigations.
 *
 * PRD Nº7 §60 also warns against publishing sensitive datasets without
 * editorial process — which is why `datasets` records provenance and licence
 * rather than just a file.
 */
export const DataStories: CollectionConfig = {
  slug: 'data-stories',

  access: {
    read: ({ req }) => {
      if (isActive(getUser(req))) return true
      return { _status: { equals: 'published' } }
    },
    create: ({ req }) =>
      hasRole(getUser(req), [
        'administrator',
        'editor_in_chief',
        'investigative_editor',
        'editor',
        'reporter',
      ]),
    update: canUpdateEditorialContent,
    delete: ({ req }) => hasRole(getUser(req), ['administrator', 'editor_in_chief']),
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'workflow', 'publication'],
    group: 'EDITORIAL',
    description: 'Reportajes de datos. No se publican sin metodología.',
  },

  versions: { drafts: true, maxPerDoc: 50 },

  hooks: {
    // Methodology is a publication precondition here, as it is for investigations.
    beforeChange: [
      createStatusContractHook({ requiresMethodology: true }),
      lockSlugOnPublish,
      recordFirstPublication,
    ],
    afterChange: [createSlugRedirect({ buildPath: (slug) => `/datos/${slug}` })],
  },

  fields: [
    { name: 'title', type: 'text', required: true, label: 'Titular' },

    ...slugField({ sourceField: 'title' }),

    { name: 'dek', type: 'textarea', label: 'Bajada' },

    {
      name: 'authors',
      type: 'relationship',
      relationTo: 'authors',
      hasMany: true,
      required: true,
      label: 'Autoría',
    },

    {
      name: 'hero',
      type: 'group',
      label: 'Imagen principal',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Imagen' },
        { name: 'captionOverride', type: 'textarea', label: 'Pie para este uso' },
      ],
    },

    {
      name: 'body',
      type: 'richText',
      label: 'Cuerpo',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({ blocks: editorialBlocks }),
        ],
      }),
    },

    {
      name: 'datasets',
      type: 'array',
      label: 'Conjuntos de datos',
      labels: { singular: 'Conjunto', plural: 'Conjuntos' },
      admin: {
        description: 'Procedencia y licencia de cada dataset usado (PRD Nº7 §60).',
      },
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Título' },
        { name: 'description', type: 'textarea', label: 'Descripción' },
        { name: 'source', type: 'text', required: true, label: 'Fuente' },
        { name: 'url', type: 'text', label: 'URL' },
        { name: 'license', type: 'text', label: 'Licencia' },
        {
          name: 'updatedAt',
          type: 'date',
          label: 'Actualizado',
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
      ],
    },

    {
      name: 'methodology',
      type: 'textarea',
      label: 'Metodología',
      admin: {
        description:
          'Cómo se obtuvieron, limpiaron y analizaron los datos. Obligatoria para publicar.',
      },
    },

    {
      name: 'sources',
      type: 'relationship',
      relationTo: 'sources',
      hasMany: true,
      label: 'Fuentes',
    },

    ...ownershipFields(),
    workflowFields(),
    publicationFields(),
    seoFields(),
  ],
}

export default DataStories
