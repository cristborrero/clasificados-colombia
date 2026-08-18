import type { CollectionConfig } from 'payload'

import { canUpdateEditorialContent, getUser, hasRole, isActive } from '@/payload/access/helpers'
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
 * Video stories (PRD Nº7 §61).
 *
 * `transcript` is stored whenever one exists — PRD Arquitectura §24 and PRD SEO
 * §83 both require it, and it earns its place three times over: it is what
 * makes the piece usable without sound or sight, it is the only part of a video
 * the search index can read, and it is what a `VideoObject` needs to qualify
 * for rich results (PRD SEO §82).
 *
 * Video files are not uploaded through Payload. PRD Nº10 §77 sends them to
 * object storage and §80-§83 put transcoding in a worker, because a 250 MB file
 * moving through a web request is a request that times out. The fields here
 * reference where the file lives; the pipeline is F15.
 */
export const VideoStories: CollectionConfig = {
  slug: 'video-stories',

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
        'photo_editor',
      ]),
    update: canUpdateEditorialContent,
    delete: ({ req }) => hasRole(getUser(req), ['administrator', 'editor_in_chief']),
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'duration', 'workflow'],
    group: 'EDITORIAL',
    description: 'Piezas de video. Guardar transcripción siempre que exista.',
  },

  versions: { drafts: true, maxPerDoc: 50 },

  hooks: {
    afterDelete: [syncSearchAfterDelete('video-stories')],
    beforeChange: [enforceStatusContract, lockSlugOnPublish, recordFirstPublication],
    afterChange: [createSlugRedirect({ buildPath: (slug) => `/video/${slug}` }), syncSearchAfterChange('video-stories')],
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
      name: 'streamUrl',
      type: 'text',
      label: 'URL del video',
      admin: {
        description: 'El archivo vive en almacenamiento de objetos, no en Payload (PRD Nº10 §77).',
      },
    },

    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      label: 'Póster',
      admin: {
        description: 'Debe ser nítido: es lo que se ve antes de reproducir (PRD Nº10 §142).',
      },
    },

    {
      name: 'duration',
      type: 'number',
      label: 'Duración (segundos)',
      admin: { description: 'Necesaria para el structured data de VideoObject.' },
    },

    {
      name: 'transcript',
      type: 'textarea',
      label: 'Transcripción',
      admin: {
        description:
          'Accesibilidad, búsqueda interna y SEO. Si la generó una IA, revisarla antes de publicar (PRD Nº10 §87).',
      },
    },

    {
      name: 'relatedArticles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      label: 'Contenido relacionado',
    },

    ...ownershipFields(),
    workflowFields(),
    publicationFields(),
    seoFields(),
  ],
}

export default VideoStories
