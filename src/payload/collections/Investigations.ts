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
import { syncSearchAfterChange, syncSearchAfterDelete } from '@/payload/hooks/search/syncSearch'

/**
 * Investigations (PRD Nº7 §50-§56).
 *
 * A collection of its own, not `Article + contentType=investigation`. PRD Nº7
 * §50 says so explicitly and the reason holds up: chapters, key findings, a
 * timeline, named entities, evidence and a methodology are a different domain,
 * not a variant of a news story. Modelling them as optional article fields
 * would leave every article carrying eight fields it never uses, and every
 * investigation fighting a shape built for something else.
 *
 * This is the most guarded collection in the product. Publication requires,
 * cumulatively:
 *
 *   · a role permitted to publish            (PRD Nº7 §49)
 *   · editorialStatus = approved             (PRD Nº7 §56)
 *   · factCheckStatus = verified             (PRD Nº5 §23)
 *   · legalStatus = approved                 (PRD Nº7 §56)
 *   · a documented methodology               (PRD Nº7 §54)
 *   · at least one responsible author        (PRD Nº7 §56)
 *   · explicit legal approval when it names people (PRD Arquitectura §12)
 *
 * That last one is not redundant. The general legal rule accepts
 * `not_required` as a legitimate answer — reasonable for a weather story,
 * unacceptable for a piece that names someone in a corruption investigation.
 * Without it, marking legal review as "not required" would be enough to skip
 * the review that matters most.
 */
export const Investigations: CollectionConfig = {
  slug: 'investigations',

  access: {
    /**
     * ADR-001: anonymous readers are filtered on `_status` alone.
     *
     * This is the line that keeps an unpublished investigation off the
     * internet, and the case the whole contract was written for.
     */
    read: ({ req }) => {
      if (isActive(getUser(req))) return true
      return { _status: { equals: 'published' } }
    },

    create: ({ req }) =>
      hasRole(getUser(req), ['admin', 'editor', 'author']),

    /*
     * PRD Nº7 §55: a reporter reaches only investigations they created or were
     * assigned to. `canUpdateEditorialContent` enforces exactly that, and stops
     * at publication.
     */
    update: canUpdateEditorialContent,

    // PRD Nº5 §15: archive, never delete.
    delete: ({ req }) => hasRole(getUser(req), ['admin', 'editor']),
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'workflow', 'publication'],
    group: 'EDITORIAL',
    description:
      'Investigaciones. No se publican sin verificación completa, revisión legal aprobada y metodología documentada.',
  },

  versions: { drafts: true, maxPerDoc: 100 },

  hooks: {
    afterDelete: [syncSearchAfterDelete('investigations')],
    beforeChange: [
      createStatusContractHook({
        requiresMethodology: true,
        enforceLegalReviewWhenNamingPeople: true,
      }),
      lockSlugOnPublish,
      recordFirstPublication,
    ],
    afterChange: [createSlugRedirect({ buildPath: (slug) => `/investigacion/${slug}` }), syncSearchAfterChange('investigations')],
  },

  fields: [
    { name: 'title', type: 'text', required: true, label: 'Titular' },

    ...slugField({ sourceField: 'title' }),

    { name: 'dek', type: 'textarea', label: 'Bajada' },

    {
      name: 'hero',
      type: 'group',
      label: 'Portada',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Imagen' },
        { name: 'captionOverride', type: 'textarea', label: 'Pie para este uso' },
      ],
    },

    {
      name: 'authors',
      type: 'relationship',
      relationTo: 'authors',
      hasMany: true,
      required: true,
      label: 'Autoría',
    },

    {
      name: 'editors',
      type: 'relationship',
      relationTo: 'authors',
      hasMany: true,
      label: 'Edición',
      admin: { description: 'Quién editó la investigación, cuando corresponda acreditarlo.' },
    },

    {
      name: 'summary',
      type: 'textarea',
      label: 'Resumen',
      admin: { description: 'Qué encontramos, en pocas líneas.' },
    },

    {
      name: 'keyFindings',
      type: 'array',
      label: 'Hallazgos clave',
      labels: { singular: 'Hallazgo', plural: 'Hallazgos' },
      admin: {
        description:
          'Lo que la investigación demostró. Cada hallazgo debe poder rastrearse a una fuente.',
      },
      fields: [
        { name: 'headline', type: 'text', required: true, label: 'Hallazgo' },
        { name: 'description', type: 'textarea', label: 'Detalle' },
        {
          name: 'sources',
          type: 'relationship',
          relationTo: 'sources',
          hasMany: true,
          label: 'Fuentes que lo sustentan',
        },
        {
          name: 'importance',
          type: 'select',
          defaultValue: 'normal',
          label: 'Relevancia',
          options: [
            { label: 'Principal', value: 'primary' },
            { label: 'Normal', value: 'normal' },
            { label: 'Contexto', value: 'context' },
          ],
        },
      ],
    },

    {
      name: 'chapters',
      type: 'array',
      label: 'Capítulos',
      labels: { singular: 'Capítulo', plural: 'Capítulos' },
      admin: {
        description:
          'PRD SEO §60: si un capítulo no es sustancial, usar anclas internas en vez de crear una URL delgada.',
      },
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Título' },
        ...slugField({ sourceField: 'title' }).filter(
          (field) => 'name' in field && field.name === 'slug',
        ),
        { name: 'intro', type: 'textarea', label: 'Entrada' },
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
          name: 'sources',
          type: 'relationship',
          relationTo: 'sources',
          hasMany: true,
          label: 'Fuentes',
        },
      ],
    },

    {
      name: 'timeline',
      type: 'array',
      label: 'Cronología',
      labels: { singular: 'Evento', plural: 'Eventos' },
      admin: {
        description:
          'Modelada como array y no como colección aparte (resolución del conflicto C-05). Si en algún momento hace falta reutilizar eventos entre investigaciones, se promueve a colección.',
      },
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          label: 'Fecha',
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
        { name: 'title', type: 'text', required: true, label: 'Qué ocurrió' },
        { name: 'description', type: 'textarea', label: 'Detalle' },
        {
          name: 'sources',
          type: 'relationship',
          relationTo: 'sources',
          hasMany: true,
          label: 'Fuentes',
        },
      ],
    },

    /*
     * Topics (PRD Nº8 §91).
     *
     * A section is where a piece is filed; a topic is what it is about, and it
     * accumulates across sections over years. An investigation with no topic
     * cannot be gathered with the coverage that led to it — which is precisely
     * the reader who arrives mid-story and wants the substantial work.
     */
    {
      name: 'topics',
      type: 'relationship',
      relationTo: 'topics',
      hasMany: true,
      index: true,
      label: 'Temas',
    },

    {
      name: 'people',
      type: 'relationship',
      relationTo: 'people',
      hasMany: true,
      label: 'Personas mencionadas',
      admin: {
        description:
          'ATENCIÓN: si esta lista no está vacía, la revisión legal debe estar APROBADA para publicar. Mencionar a alguien no implica imputación; el contexto va en el texto.',
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
    },

    {
      name: 'methodology',
      type: 'textarea',
      required: false,
      label: 'Metodología',
      admin: {
        description:
          'Cómo se investigó: verificación de documentos, manejo de datos, entrevistas, solicitudes oficiales. Obligatoria para publicar.',
      },
    },

    {
      name: 'updates',
      type: 'array',
      label: 'Actualizaciones',
      labels: { singular: 'Actualización', plural: 'Actualizaciones' },
      admin: {
        description:
          'PRD SEO §75: mostrar qué cambió. Una investigación viva se actualiza; el lector debe poder ver la historia del cambio.',
      },
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          label: 'Fecha',
          admin: { date: { pickerAppearance: 'dayAndTime' } },
        },
        { name: 'summary', type: 'textarea', required: true, label: 'Qué cambió' },
      ],
    },

    ...ownershipFields(),
    // Legal review starts as pending here, not "not required" (PRD Nº7 §56).
    workflowFields({ legalReviewByDefault: true }),
    publicationFields(),
    seoFields(),

    /*
     * `evidence[]` arrives in F6 with the Evidence Vault. PRD Nº7 §34 only
     * allows rendering evidence that is both `public` and `approved`, which is
     * a rule with nothing to check against until that collection exists.
     */
  ],
}

export default Investigations
