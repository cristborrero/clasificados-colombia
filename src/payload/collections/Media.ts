import { APIError, type CollectionConfig } from 'payload'

import {
  adminFieldOnly,
  adminOnly,
  editorialStaffFieldOnly,
  editorialStaffOnly,
  getUser,
  hasRole,
} from '@/payload/access/helpers'
import {
  ALLOWED_IMAGE_MIME_TYPES,
  checksumOf,
  normaliseImage,
} from '@/payload/upload/imageNormalisation'
import { findMediaReferences } from '@/payload/upload/mediaReferences'

/**
 * Media — public editorial assets (PRD Nº10 §4).
 *
 * Media is editorial imagery — photographs, illustrations, posters. Documents
 * that support an investigation live in `evidence-documents`, which keeps their
 * own metadata (issuing body, document date, page count) because a reader needs
 * that to judge a record before opening it.
 *
 * The separation survives the 2026-08-18 simplification for a plainer reason
 * than before: the two are described differently and listed differently, and
 * merging them would mean every photograph grows fields about issuing
 * institutions.
 *
 * F15 completed the pipeline on top of the F4 metadata model: metadata
 * stripping and sRGB conversion on upload, SVG refused outright, focal point
 * cropping, content hashing for duplicates, and a delete guard that refuses to
 * remove an asset something is displaying. Modern formats are negotiated per
 * request by the image optimiser rather than stored twice — see the `images`
 * block in `next.config.mjs`.
 */
export const Media: CollectionConfig = {
  slug: 'media',

  access: {
    // Published imagery is public by nature.
    read: () => true,
    create: ({ req }) =>
      hasRole(getUser(req), ['admin', 'editor', 'author']),
    update: editorialStaffOnly,
    /*
     * PRD Nº10 §49-§51. Administrator-only, and even then refused for an asset
     * something is displaying — see the `beforeDelete` hook, which is where the
     * actual protection lives.
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
    /*
     * An explicit list, not `image/*`.
     *
     * The wildcard admitted `image/svg+xml`, and an SVG is a document that can
     * carry script — served from this origin, where a CSP written around
     * `'self'` is no defence. See `ALLOWED_IMAGE_MIME_TYPES`.
     */
    mimeTypes: [...ALLOWED_IMAGE_MIME_TYPES],

    /*
     * Editorial cropping (PRD Master §46). A hero crop that decapitates the
     * subject is the normal outcome of centre-cropping a portrait into 2000×; a
     * focal point lets the desk say where the picture actually is, once, and
     * have every derivative respect it.
     */
    focalPoint: true,
    crop: true,

    /*
     * Derivative sizes from PRD Nº10 §18-§25. Deliberately few: §26 warns
     * against generating forty sizes, and §18 requires each one to have a real
     * use. `og` matches the 1200×630 that PRD SEO §48 specifies; `square` and
     * `portrait` exist because cards and vertical formats otherwise crop a
     * landscape derivative a second time.
     */
    imageSizes: [
      { name: 'thumbnail', width: 320, height: 180, position: 'centre' },
      { name: 'card', width: 800 },
      { name: 'article', width: 1400 },
      { name: 'hero', width: 2000 },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
      { name: 'square', width: 800, height: 800, position: 'centre' },
      { name: 'portrait', width: 800, height: 1200, position: 'centre' },
    ],
  },

  hooks: {
    /*
     * Normalise before anything is written (PRD Master §46-§48).
     *
     * `beforeOperation` is the only place that sees the uploaded bytes while
     * they are still only bytes. By `beforeChange` Payload has already written
     * the original and generated every derivative, so stripping there would
     * leave the published original carrying whatever the camera wrote —
     * including, for a photograph taken at a source's home, its coordinates.
     */
    beforeOperation: [
      async ({ args, operation, req }) => {
        if (operation !== 'create' && operation !== 'update') return args
        if (!req.file?.data || !req.file.mimetype) return args

        const original = Buffer.from(req.file.data)
        const { data, normalised, reason } = await normaliseImage(original, req.file.mimetype)

        if (!normalised) {
          /*
           * Logged rather than thrown. The file is still rejected by the mime
           * allowlist if it is not an image at all; something sharp cannot read
           * but the allowlist accepts is a broken upload, and a 500 during an
           * upload tells the editor nothing they can act on.
           */
          req.payload.logger.warn(
            { filename: req.file.name, reason },
            'La imagen no pudo normalizarse; se guarda tal cual',
          )
        }

        req.file.data = data
        req.file.size = data.byteLength

        /*
         * The checksum is taken from the bytes as uploaded, not from the
         * normalised output: hashing the output would tie the identity of an
         * asset to the sharp version that processed it, so the same photograph
         * re-uploaded after a dependency bump would look like a new one.
         */
        req.context.uploadChecksum = checksumOf(original)

        return args
      },
    ],

    beforeChange: [
      ({ context, data }) => {
        const checksum = context.uploadChecksum

        return typeof checksum === 'string' ? { ...data, checksum } : data
      },
    ],

    /*
     * An asset in use cannot be hard-deleted (PRD Nº10 §49-§51, F15 DoD).
     *
     * Restricting the operation to administrators was never the protection —
     * an administrator deleting a hero image breaks a published article just as
     * thoroughly as anyone else would. The error names what is using it, because
     * "cannot delete" without a list leaves the operator to guess.
     */
    beforeDelete: [
      async ({ id, req }) => {
        const references = await findMediaReferences(req.payload, id)

        if (references.length === 0) return

        const listed = references
          .slice(0, 5)
          .map((reference) => `${reference.collection}: ${reference.label}`)
          .join('; ')

        const rest = references.length > 5 ? ` y ${references.length - 5} más` : ''

        throw new APIError(
          `Esta imagen está en uso y no puede eliminarse (${listed}${rest}). Quítala de ese contenido primero.`,
          400,
        )
      },
    ],
  },

  fields: [
    {
      /*
       * Content hash of the uploaded bytes, for spotting an asset the library
       * already holds. Indexed because the only useful query against it is an
       * equality lookup at upload time.
       */
      name: 'checksum',
      type: 'text',
      index: true,
      label: 'Huella del archivo',
      admin: {
        readOnly: true,
        description: 'SHA-256 de los bytes originales. Sirve para detectar duplicados.',
        position: 'sidebar',
      },
    },

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
