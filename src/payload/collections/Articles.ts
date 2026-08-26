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
import { articleRedirectPath } from '@/payload/hooks/redirects/paths'
import { syncSearchAfterChange, syncSearchAfterDelete } from '@/payload/hooks/search/syncSearch'

/**
 * Articles (PRD Nº7 §19-§49).
 *
 * The public read rule is the single most consequential line in this file. Per
 * ADR-001 it filters on `_status` alone, which is what guarantees that a piece
 * sitting in legal review is unreachable from the internet no matter what its
 * editorial status says.
 *
 * Investigations are NOT modelled here. PRD Nº7 §50 is explicit that they get
 * their own collection rather than becoming `Article + contentType=investigation`,
 * because chapters, key findings, timelines, entities, evidence and methodology
 * are a different domain, not a variant. They arrive in F5.
 */
export const Articles: CollectionConfig = {
  slug: 'articles',

  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { _status: { equals: 'published' } }
    },
    create: () => true,
    update: () => true,
    delete: () => true,
  },

  admin: {
    /*
     * Shown beside Save/Publish. The server refuses a publish that is not
     * ready either way; this is so the editor learns it before pressing the
     * button rather than from the error afterwards.
     */
    components: {
      edit: { beforeDocumentControls: ['@/payload/components/PublicationChecklist#PublicationChecklist'] },
    },
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'workflow', 'publication'],
    group: 'EDITORIAL',
    description:
      'Noticias, análisis, perfiles y crónicas. Las investigaciones tienen su propia colección.',
  },

  // PRD Nº7 §126-§127: native drafts and versions, with editorialStatus on top.
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },

  hooks: {
    afterDelete: [syncSearchAfterDelete('articles')],
    beforeChange: [enforceStatusContract, lockSlugOnPublish, recordFirstPublication],
    afterChange: [createSlugRedirect({ buildPath: articleRedirectPath }), syncSearchAfterChange('articles')],
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Titular',
      admin: {
        description:
          'El titular visible. PRD SEO §27 exige que coincida con el headline del structured data.',
      },
    },

    ...slugField({ sourceField: 'title' }),

    {
      name: 'dek',
      type: 'textarea',
      label: 'Bajada',
      admin: {
        description:
          'Resume y aporta contexto. Se usa como meta description cuando no hay override.',
      },
    },

    {
      name: 'contentType',
      type: 'select',
      required: true,
      defaultValue: 'news',
      index: true,
      label: 'Tipo de contenido',
      options: [
        { label: 'Noticia', value: 'news' },
        { label: 'Reportaje', value: 'reportage' },
        { label: 'Análisis', value: 'analysis' },
        { label: 'Explicador', value: 'explainer' },
        { label: 'Entrevista', value: 'interview' },
        { label: 'Perfil', value: 'profile' },
        { label: 'Crónica', value: 'chronicle' },
      ],
      admin: {
        // PRD Nº7 §25: not the same axis as category.
        description: 'Qué clase de pieza es. Distinto de la sección.',
      },
    },

    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      index: true,
      label: 'Sección',
      admin: { description: 'Una sola sección principal (PRD Nº7 §28).' },
    },

    {
      name: 'topics',
      type: 'relationship',
      relationTo: 'topics',
      hasMany: true,
      label: 'Temas',
    },

    {
      name: 'authors',
      type: 'relationship',
      relationTo: 'authors',
      hasMany: true,
      required: true,
      label: 'Autoría',
      admin: {
        description: 'Toda pieza publicada lleva firma responsable (PRD SEO §31).',
      },
    },

    {
      name: 'hero',
      type: 'group',
      label: 'Imagen principal',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Imagen' },
        {
          name: 'captionOverride',
          type: 'textarea',
          label: 'Pie para este uso',
          admin: { description: 'Opcional. Si se deja vacío se usa el pie de la imagen.' },
        },
      ],
      admin: {
        description:
          'PRD SEO §44: debe representar la historia. No usar el logo ni una placa de texto si existe fotografía editorial.',
      },
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
      name: 'relations',
      type: 'group',
      label: 'Relaciones',
      admin: {
        description:
          'Alimentan la navegación contextual. PRD SEO §55 prioriza la selección manual sobre lo automático.',
      },
      fields: [
        {
          name: 'relatedArticles',
          type: 'relationship',
          relationTo: 'articles',
          hasMany: true,
          label: 'Contenido relacionado',
          filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
        },
        {
          name: 'people',
          type: 'relationship',
          relationTo: 'people',
          hasMany: true,
          label: 'Personas mencionadas',
          admin: {
            description:
              'Relacionar a alguien aquí no implica imputación. El contexto va en el texto.',
          },
        },
        {
          name: 'organizations',
          type: 'relationship',
          relationTo: 'organizations',
          hasMany: true,
          label: 'Organizaciones mencionadas',
        },
        {
          name: 'sources',
          type: 'relationship',
          relationTo: 'sources',
          hasMany: true,
          label: 'Fuentes',
          admin: {
            description:
              'Base documental. Las fuentes internas no se muestran al público (ver visibilidad en Fuentes).',
          },
        },
      ],
    },

    ...ownershipFields(),
    workflowFields(),
    publicationFields(),
    seoFields(),

    /*
     * Still deferred, with the phase that unblocks each:
     *   evidence[]   → F6, once the Evidence Vault exists
     *   corrections  → F17
     */
  ],
}

export default Articles
