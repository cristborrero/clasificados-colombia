import type { CollectionConfig } from 'payload'

import { adminOnly, editorialStaffOnly, getUser, hasRole } from '@/payload/access/helpers'

/**
 * Corrections (PRD Nº8 §120-§124, CLAUDE.md §54, F17).
 *
 * A correction is a public record, not an edit. The original text stays as it
 * was published and the note is added beside it — that is the whole point. A
 * newsroom that silently rewrites what it got wrong is asking readers to trust
 * a text that can change underneath them, and the correction is the evidence
 * that the mistake was found and owned.
 *
 * Its own collection rather than an array on each piece, for two reasons. The
 * five content types would otherwise each carry a copy of the same field, and
 * more importantly a corrections index — every correction the outlet has
 * issued, in one place — is standard practice for a serious publication and is
 * impossible to build from data scattered across five tables.
 *
 * Public to read. A correction nobody can see is not a correction.
 */
export const Corrections: CollectionConfig = {
  slug: 'corrections',

  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },

  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'type', 'issuedAt'],
    group: 'NEWSROOM',
    description:
      'Correcciones públicas. No modifican el texto original: se muestran junto a él.',
  },

  fields: [
    {
      name: 'about',
      type: 'relationship',
      required: true,
      index: true,
      label: 'Contenido corregido',
      relationTo: ['articles', 'investigations', 'opinions', 'data-stories', 'video-stories'],
      admin: {
        description: 'La pieza a la que corresponde. Se muestra dentro de ella.',
      },
    },

    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'correction',
      index: true,
      label: 'Tipo',
      /*
       * The four are not interchangeable, and readers can tell the difference.
       * Calling a substantive factual fix a "clarification" is the oldest way
       * of appearing to correct something without doing it.
       */
      options: [
        { label: 'Corrección — un dato era incorrecto', value: 'correction' },
        { label: 'Aclaración — el texto se prestaba a confusión', value: 'clarification' },
        { label: 'Actualización — la historia avanzó', value: 'update' },
        { label: 'Nota del editor', value: 'editor_note' },
      ],
    },

    {
      name: 'summary',
      type: 'textarea',
      required: true,
      label: 'Texto',
      admin: {
        description:
          'Qué decía antes, qué dice ahora y por qué cambió. Concreto: «Se corrigió la cifra de 3.200 a 3.020 millones», no «se corrigieron errores».',
      },
    },

    {
      name: 'issuedAt',
      type: 'date',
      required: true,
      index: true,
      label: 'Fecha',
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Cuándo se emitió. El lector necesita saber si es anterior a cuando leyó.',
      },
    },
  ],

  defaultSort: '-issuedAt',
}

export default Corrections
