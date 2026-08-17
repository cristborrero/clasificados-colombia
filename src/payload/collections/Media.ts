import type { CollectionConfig } from 'payload'

import {
  adminFieldOnly,
  adminOnly,
  editorialStaffFieldOnly,
  editorialStaffOnly,
  getUser,
  hasRole,
} from '@/payload/access/helpers'

/**
 * Media — public editorial assets (PRD Nº10 §4).
 *
 * CRITICAL BOUNDARY (PRD Nº10 §2, §145, §149): this collection is not the
 * Evidence Vault. Media is published to the world by design; evidence carries
 * `public | internal | restricted` classifications, lives in MinIO behind
 * authorisation, and never enters this collection. An original evidence
 * document that ends up here is a source-protection failure, not a filing
 * mistake.
 *
 * SCOPE: F4 needs images that articles can point at. The full pipeline — AVIF
 * and WebP derivatives, EXIF stripping, hotspot cropping, duplicate detection,
 * regeneration — is F15. What is here is the metadata model, which is the part
 * that is expensive to add later because it means revisiting every asset.
 */
export const Media: CollectionConfig = {
  slug: 'media',

  access: {
    // Published imagery is public by nature.
    read: () => true,
    create: ({ req }) =>
      hasRole(getUser(req), [
        'administrator',
        'editor_in_chief',
        'investigative_editor',
        'editor',
        'photo_editor',
        'reporter',
      ]),
    update: editorialStaffOnly,
    /*
     * PRD Nº10 §49-§51: an asset used by published content must not be
     * deletable, and archiving is preferred over deletion. Reference checking
     * arrives with the content that creates references; until then this is an
     * administrator-only operation.
     */
    delete: adminOnly,
  },

  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'mediaType', 'credit', 'license'],
    group: 'NEWSROOM',
    description:
      'Imágenes editoriales públicas. La evidencia NO va aquí — tiene su propio almacenamiento con control de acceso.',
  },

  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*'],
    /*
     * Derivative sizes from PRD Nº10 §18-§25. Deliberately few: §26 warns
     * against generating forty sizes, and §18 requires each one to have a real
     * use. `og` matches the 1200×630 that PRD SEO §48 specifies.
     */
    imageSizes: [
      { name: 'thumbnail', width: 320, height: 180, position: 'centre' },
      { name: 'card', width: 800 },
      { name: 'article', width: 1400 },
      { name: 'hero', width: 2000 },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
  },

  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo',
      admin: {
        description:
          'Describe lo relevante de la imagen. No escribir «foto», «imagen» ni el nombre del medio (PRD Nº10 §6).',
        condition: (data) => !data?.decorative,
      },
      validate: (value: unknown, { siblingData }: { siblingData?: { decorative?: boolean } }) => {
        // PRD Nº10 §7-§8: required for editorial images, and a decorative image
        // must be marked as such rather than left with an empty alt by accident.
        if (siblingData?.decorative) return true
        if (typeof value === 'string' && value.trim() !== '') return true

        return 'El texto alternativo es obligatorio, salvo que la imagen se marque como decorativa.'
      },
    },

    {
      name: 'decorative',
      type: 'checkbox',
      defaultValue: false,
      label: 'Decorativa',
      admin: {
        description:
          'Solo para imágenes sin contenido informativo. El frontend emite alt="" (PRD Nº10 §8).',
      },
    },

    {
      name: 'caption',
      type: 'textarea',
      label: 'Pie de foto',
      admin: {
        description: 'Aporta contexto. No repetir el texto alternativo (PRD Nº10 §9).',
      },
    },

    {
      name: 'credit',
      type: 'text',
      label: 'Crédito',
      admin: {
        description: 'Ejemplo: «Foto: Juan Pérez / Clasificados Colombia» o «Cortesía: Fiscalía».',
      },
    },

    {
      name: 'photographer',
      type: 'text',
      label: 'Fotógrafo',
    },

    {
      name: 'source',
      type: 'text',
      label: 'Origen',
      admin: {
        description: 'De dónde proviene: propio, agencia, cortesía, entidad pública.',
      },
    },

    {
      name: 'mediaType',
      type: 'select',
      defaultValue: 'photo',
      label: 'Tipo',
      options: [
        { label: 'Fotografía', value: 'photo' },
        { label: 'Ilustración', value: 'illustration' },
        { label: 'Gráfico', value: 'graphic' },
        { label: 'Logo', value: 'logo' },
        { label: 'Captura de pantalla', value: 'screenshot' },
        { label: 'Vista previa de documento', value: 'document_preview' },
        { label: 'Póster de video', value: 'video_poster' },
        { label: 'Otro', value: 'other' },
      ],
    },

    {
      name: 'license',
      type: 'select',
      defaultValue: 'unknown',
      index: true,
      label: 'Licencia',
      options: [
        { label: 'Propia', value: 'owned' },
        { label: 'Licenciada', value: 'licensed' },
        { label: 'Creative Commons', value: 'creative_commons' },
        { label: 'Dominio público', value: 'public_domain' },
        { label: 'Cortesía', value: 'courtesy' },
        { label: 'Uso editorial', value: 'editorial_use' },
        { label: 'Desconocida', value: 'unknown' },
      ],
      admin: {
        description:
          'PRD Nº10 §119: una imagen con licencia desconocida no debe publicarse. No asumir que algo disponible en internet se puede usar.',
      },
    },

    {
      name: 'copyrightHolder',
      type: 'text',
      label: 'Titular de derechos',
      admin: {
        description: 'No confundir con el fotógrafo (PRD Nº10 §15).',
      },
    },

    {
      name: 'rightsExpiration',
      type: 'date',
      label: 'Vencimiento de derechos',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'Para licencias con duración limitada. Genera alerta al acercarse.',
      },
    },

    {
      name: 'syntheticMedia',
      type: 'select',
      defaultValue: 'none',
      label: 'Origen sintético',
      options: [
        { label: 'Ninguno', value: 'none' },
        { label: 'Generada por IA', value: 'ai_generated' },
        { label: 'Modificada con IA', value: 'ai_modified' },
        { label: 'Composición', value: 'composite' },
        { label: 'Ilustración', value: 'illustration' },
      ],
      admin: {
        description:
          'PRD Nº10 §43: nunca presentar una imagen generada como fotografía documental real.',
      },
    },

    {
      name: 'usageNotes',
      type: 'textarea',
      label: 'Notas de uso',
      admin: {
        description:
          'Restricciones internas. Nunca se envían al frontend público (PRD Nº10 §16, §47).',
      },
      access: {
        // Internal only — PRD Nº10 §179 forbids sending this to the browser.
        read: adminFieldOnly,
        update: editorialStaffFieldOnly,
      },
    },
  ],
}

export default Media
