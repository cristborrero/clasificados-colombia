import type { CollectionConfig, Where } from 'payload'

import { adminOnly, editorialStaffOnly, getUser, isActive } from '@/payload/access/helpers'

/**
 * Sources — the documentary basis of a piece (PRD Nº7 §62-§64).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THIS COLLECTION NEVER HOLDS THE IDENTITY OF A CONFIDENTIAL SOURCE.
 *
 * PRD Nº7 §64 states it directly, and PRD Nº5 §122 lists every place a source
 * identity must not appear: the article, an evidence title, a filename, audit
 * metadata, the search index. A whistleblower is referenced by a pseudonymous
 * code created in the complaints service (PRD Nº6 §68), never by a record here.
 *
 * The rule is not about tidiness. This collection is readable by every
 * authenticated member of the newsroom and its public rows are served to the
 * internet, so a name typed into `title` "just to remember who it was" is a
 * disclosure waiting for a database dump.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `visibility` is what keeps an internal working source out of public view.
 * PRD Arquitectura §15 requires that filtering happen in the query that feeds
 * the frontend and the search index, not merely in the UI — so `read` returns
 * a filter and internal rows are never loaded for an anonymous caller.
 */
export const Sources: CollectionConfig = {
  slug: 'sources',

  access: {
    read: ({ req }) => {
      if (isActive(getUser(req))) return true
      return { visibility: { equals: 'public' } } satisfies Where
    },
    create: editorialStaffOnly,
    update: editorialStaffOnly,
    delete: adminOnly,
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sourceType', 'visibility', 'publishedAt'],
    group: 'RESEARCH',
    description:
      'Base documental de las piezas. NUNCA registrar aquí la identidad de una fuente confidencial.',
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Título',
      admin: {
        description:
          'Descripción de la fuente documental. No escribir nombres de fuentes reservadas.',
      },
    },

    {
      name: 'sourceType',
      type: 'select',
      required: true,
      defaultValue: 'official_document',
      index: true,
      label: 'Tipo',
      options: [
        { label: 'Documento oficial', value: 'official_document' },
        { label: 'Base de datos pública', value: 'public_database' },
        { label: 'Entrevista', value: 'interview' },
        { label: 'Comunicado de prensa', value: 'press_release' },
        { label: 'Expediente judicial', value: 'court_record' },
        { label: 'Norma o ley', value: 'law' },
        { label: 'Académica', value: 'academic' },
        { label: 'Prensa', value: 'news' },
        { label: 'Otra', value: 'other' },
      ],
    },

    {
      name: 'visibility',
      type: 'select',
      required: true,
      defaultValue: 'internal',
      index: true,
      label: 'Visibilidad',
      options: [
        { label: 'Pública', value: 'public' },
        { label: 'Interna', value: 'internal' },
      ],
      admin: {
        description:
          'Interna por defecto. Solo las públicas se sirven al frontend y al índice de búsqueda.',
      },
    },

    {
      name: 'publisher',
      type: 'text',
      label: 'Entidad emisora',
      admin: { description: 'Quién produjo el documento. Ejemplo: «Contraloría General».' },
    },

    {
      name: 'url',
      type: 'text',
      label: 'URL',
    },

    {
      name: 'archiveUrl',
      type: 'text',
      label: 'URL de archivo',
      admin: {
        description:
          'Copia archivada. Las fuentes oficiales desaparecen de internet con frecuencia; sin esto, una investigación pierde su respaldo.',
      },
    },

    {
      name: 'publishedAt',
      type: 'date',
      label: 'Fecha del documento',
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },

    {
      name: 'accessedAt',
      type: 'date',
      label: 'Fecha de consulta',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'Cuándo se verificó. Importa cuando la fuente cambia o se cae.',
      },
    },

    {
      name: 'notes',
      type: 'textarea',
      label: 'Notas internas',
      admin: {
        description:
          'Nunca se envían al frontend público. Tampoco escribir aquí identidades reservadas.',
      },
      access: {
        // Internal working notes stay internal, whatever the row's visibility.
        read: ({ req }) => isActive(getUser(req)),
      },
    },
  ],
}

export default Sources
