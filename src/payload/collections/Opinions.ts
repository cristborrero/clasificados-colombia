import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { canUpdateEditorialContent, getUser, hasRole, isActive } from '@/payload/access/helpers'
import { editorialBlocks } from '@/payload/blocks/editorial'
import { ownershipFields } from '@/payload/fields/ownership'
import { publicationFields } from '@/payload/fields/publication'
import { seoFields } from '@/payload/fields/seo'
import { slugField } from '@/payload/fields/slug'
import { workflowFields } from '@/payload/fields/workflow'
import { enforceStatusContract } from '@/payload/hooks/editorial/enforceStatusContract'
import { recordFirstPublication } from '@/payload/hooks/publication/recordFirstPublication'
import { createSlugRedirect, lockSlugOnPublish } from '@/payload/hooks/redirects/createSlugRedirect'
import { syncSearchAfterChange, syncSearchAfterDelete } from '@/payload/hooks/search/syncSearch'

/**
 * Opinion pieces (PRD Nº7 §57-§58).
 *
 * A separate collection rather than an article `contentType`, because the
 * distinction has to survive every surface. PRD SEO §68 requires opinion to be
 * unmistakable in the UI, in metadata, in structured data and in the category —
 * and PRD Master §92 lists NEWS / INVESTIGATION / ANALYSIS / OPINION as
 * categories a reader must never confuse.
 *
 * `contentNature` is stored explicitly (§58) rather than inferred from the
 * collection name, so the frontend, the search DTO and the JSON-LD emitter all
 * read the same field instead of each deciding for itself. Structured data
 * uses `OpinionNewsArticle`, not `NewsArticle` (PRD SEO §29 / Master §29).
 *
 * One author, per §57: an opinion is a person's argument, not a newsroom
 * position.
 */
export const Opinions: CollectionConfig = {
  slug: 'opinions',

  access: {
    read: ({ req }) => {
      if (isActive(getUser(req))) return true
      return { _status: { equals: 'published' } }
    },
    create: ({ req }) =>
      hasRole(getUser(req), [
        'administrator',
        'editor_in_chief',
        'editor',
        'reporter',
        'contributor',
      ]),
    update: canUpdateEditorialContent,
    delete: ({ req }) => hasRole(getUser(req), ['administrator', 'editor_in_chief']),
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'workflow'],
    group: 'EDITORIAL',
    description: 'Columnas y análisis de opinión. Siempre marcadas como opinión ante el lector.',
  },

  versions: { drafts: true, maxPerDoc: 50 },

  hooks: {
    afterDelete: [syncSearchAfterDelete('opinions')],
    beforeChange: [enforceStatusContract, lockSlugOnPublish, recordFirstPublication],
    afterChange: [createSlugRedirect({ buildPath: (slug) => `/opinion/${slug}` }), syncSearchAfterChange('opinions')],
  },

  fields: [
    { name: 'title', type: 'text', required: true, label: 'Titular' },

    ...slugField({ sourceField: 'title' }),

    { name: 'dek', type: 'textarea', label: 'Bajada' },

    {
      name: 'contentNature',
      type: 'select',
      required: true,
      defaultValue: 'opinion',
      options: [{ label: 'Opinión', value: 'opinion' }],
      label: 'Naturaleza del contenido',
      admin: {
        readOnly: true,
        description:
          'Fijo. Alimenta el frontend, el structured data y la búsqueda para que nunca se confunda con reportería.',
      },
    },

    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      required: true,
      label: 'Autor',
      admin: { description: 'Una sola firma: una opinión es de quien la escribe.' },
    },

    {
      name: 'hero',
      type: 'group',
      label: 'Imagen',
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

    ...ownershipFields(),
    workflowFields(),
    publicationFields(),
    seoFields(),
  ],
}

export default Opinions
