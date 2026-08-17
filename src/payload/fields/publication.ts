import type { Field } from 'payload'

/**
 * Publication dates (PRD Nº7 §35-§37).
 *
 * The distinction that matters is between `updatedAt` and `modifiedAt`.
 * Payload writes `updatedAt` on every save — including autosave, including a
 * fixed typo. PRD Nº7 §37 forbids using it as the editorial date, and PRD SEO
 * §29 explains the consequence: `dateModified` must change only on a material
 * update. Bumping it on every deploy or whitespace change is exactly what PRD
 * SEO §74 calls out as faking freshness.
 *
 * `firstPublishedAt` is written once and never again (PRD Nº7 §36). It is what
 * lets an article be corrected years later without appearing to be new.
 */
export function publicationFields(): Field {
  return {
    name: 'publication',
    type: 'group',
    label: 'Publicación',
    fields: [
      {
        name: 'publishedAt',
        type: 'date',
        index: true, // PRD Nº7 §114 — sorted on constantly.
        label: 'Fecha de publicación',
        admin: {
          date: { pickerAppearance: 'dayAndTime' },
          description: 'Fecha visible al lector. Debe coincidir con el structured data.',
        },
      },
      {
        name: 'firstPublishedAt',
        type: 'date',
        label: 'Primera publicación',
        admin: {
          readOnly: true,
          date: { pickerAppearance: 'dayAndTime' },
          description: 'Se registra una sola vez, en la primera publicación. No se modifica.',
        },
        access: {
          // Immutable once set (PRD Nº7 §36).
          update: () => false,
        },
      },
      {
        name: 'modifiedAt',
        type: 'date',
        label: 'Última actualización material',
        admin: {
          date: { pickerAppearance: 'dayAndTime' },
          description:
            'Solo cuando el contenido cambia de forma sustantiva. No se toca por correcciones de forma (PRD SEO §29).',
        },
      },
      {
        name: 'scheduledAt',
        type: 'date',
        label: 'Programado para',
        admin: {
          date: { pickerAppearance: 'dayAndTime' },
          description: 'Debe ser una fecha futura.',
        },
        validate: (value: unknown) => {
          if (!value) return true

          const scheduled = new Date(value as string)

          if (Number.isNaN(scheduled.getTime())) return 'Fecha inválida.'

          // PRD Arquitectura §36: scheduledAt > currentTime.
          return scheduled.getTime() > Date.now()
            ? true
            : 'La fecha programada debe ser posterior al momento actual.'
        },
      },
    ],
  }
}
