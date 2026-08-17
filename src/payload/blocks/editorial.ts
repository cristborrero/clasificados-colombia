import type { Block } from 'payload'

/**
 * Editorial rich-text blocks (PRD Nº7 §31-§34, PRD Master §17).
 *
 * These are the structured components an article body may contain. PRD Nº7 §30
 * forbids storing the body as plain HTML: a pull quote has to be a pull quote
 * the frontend can style, the search indexer can skip and the structured-data
 * layer can ignore — not a `<blockquote>` someone pasted.
 *
 * PRD Nº7 §31 also says to keep the number of blocks under control. Every block
 * here appears in the approved design sheet or is named explicitly by a PRD.
 */

export const PullQuoteBlock: Block = {
  slug: 'pullQuote',
  labels: { singular: 'Cita destacada', plural: 'Citas destacadas' },
  fields: [
    { name: 'text', type: 'textarea', required: true, label: 'Cita' },
    { name: 'attribution', type: 'text', label: 'Atribución' },
    {
      name: 'source',
      type: 'text',
      label: 'Fuente',
      admin: { description: 'De dónde proviene la cita, si aporta contexto.' },
    },
  ],
}

export const FactBoxBlock: Block = {
  slug: 'factBox',
  labels: { singular: 'Caja de datos', plural: 'Cajas de datos' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Título' },
    {
      name: 'items',
      type: 'array',
      required: true,
      label: 'Datos',
      labels: { singular: 'Dato', plural: 'Datos' },
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Etiqueta' },
        { name: 'value', type: 'text', required: true, label: 'Valor' },
        { name: 'description', type: 'textarea', label: 'Detalle' },
      ],
    },
    {
      name: 'source',
      type: 'text',
      label: 'Fuente',
      admin: { description: 'Una caja de datos sin fuente es una afirmación sin respaldo.' },
    },
  ],
}

export const CalloutBlock: Block = {
  slug: 'callout',
  labels: { singular: 'Llamado', plural: 'Llamados' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'context',
      label: 'Tipo',
      options: [
        { label: 'Contexto', value: 'context' },
        { label: 'Nota del editor', value: 'editor_note' },
        { label: 'Metodología', value: 'methodology' },
      ],
      admin: {
        // PRD Nº8 §72: for context and editorial notes, never for promotions.
        description: 'No usar para promociones ni llamados comerciales.',
      },
    },
    { name: 'title', type: 'text', label: 'Título' },
    { name: 'body', type: 'textarea', required: true, label: 'Texto' },
  ],
}

export const SourceNoteBlock: Block = {
  slug: 'sourceNote',
  labels: { singular: 'Nota de fuente', plural: 'Notas de fuente' },
  fields: [{ name: 'text', type: 'textarea', required: true, label: 'Nota' }],
}

export const ImageBlock: Block = {
  slug: 'imageBlock',
  labels: { singular: 'Imagen', plural: 'Imágenes' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Imagen' },
    {
      name: 'captionOverride',
      type: 'textarea',
      label: 'Pie de foto para este uso',
      admin: {
        // PRD Nº10 §127: the same photograph may need different context in
        // different pieces, but the asset keeps its own base caption.
        description: 'Opcional. Si se deja vacío se usa el pie de la imagen.',
      },
    },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'column',
      label: 'Ancho',
      options: [
        { label: 'Columna de lectura', value: 'column' },
        { label: 'Ancho de artículo', value: 'article' },
        { label: 'Ancho completo', value: 'full' },
      ],
    },
  ],
}

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Galería', plural: 'Galerías' },
  fields: [
    {
      name: 'images',
      type: 'array',
      required: true,
      minRows: 2,
      label: 'Imágenes',
      labels: { singular: 'Imagen', plural: 'Imágenes' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'captionOverride', type: 'textarea', label: 'Pie para este uso' },
      ],
    },
  ],
}

export const EmbedBlock: Block = {
  slug: 'embed',
  labels: { singular: 'Embed', plural: 'Embeds' },
  fields: [
    {
      name: 'provider',
      type: 'select',
      required: true,
      label: 'Plataforma',
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'X', value: 'x' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'TikTok', value: 'tiktok' },
      ],
    },
    { name: 'url', type: 'text', required: true, label: 'URL' },
    {
      name: 'caption',
      type: 'text',
      label: 'Descripción',
      admin: {
        // The frontend lazy-loads these (PRD Nº8 §151), so something has to
        // occupy the space and describe what is coming.
        description: 'Se muestra mientras el embed no ha cargado.',
      },
    },
  ],
}

export const CorrectionNoticeBlock: Block = {
  slug: 'correctionNotice',
  labels: { singular: 'Corrección', plural: 'Correcciones' },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'correction',
      label: 'Tipo',
      options: [
        { label: 'Corrección', value: 'correction' },
        { label: 'Aclaración', value: 'clarification' },
        { label: 'Actualización', value: 'update' },
        { label: 'Nota del editor', value: 'editor_note' },
      ],
      admin: {
        // PRD SEO §76: these are four different things and must not be
        // presented as interchangeable.
        description: 'Una corrección no es lo mismo que una actualización.',
      },
    },
    { name: 'date', type: 'date', required: true, label: 'Fecha' },
    { name: 'text', type: 'textarea', required: true, label: 'Qué cambió' },
  ],
}

/**
 * Blocks available inside an article body.
 *
 * Timeline, DataChart and EvidenceReference are deliberately absent: the first
 * two belong with Investigations and DataStories (F5), and the third cannot
 * exist before the Evidence collection, since PRD Nº7 §34 only allows rendering
 * evidence that is both `public` and `approved` — a rule with nothing to check
 * against yet.
 */
export const editorialBlocks: Block[] = [
  ImageBlock,
  GalleryBlock,
  PullQuoteBlock,
  FactBoxBlock,
  CalloutBlock,
  SourceNoteBlock,
  CorrectionNoticeBlock,
  EmbedBlock,
]
