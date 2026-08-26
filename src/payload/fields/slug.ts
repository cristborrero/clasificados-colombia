import type { Field } from 'payload'

import { isReservedSegment } from '@/lib/routes'
import { editorialStaffFieldOnly } from '@/payload/access/helpers'

/**
 * Slug normalisation (PRD SEO §14, PRD Nº7 §22-§24).
 *
 * Rules from PRD SEO §14: lowercase, no accents, hyphens.
 *
 * Spanish makes this non-trivial. `ñ` must become `n` and not vanish, and the
 * inverted `¿` and `¡` that open half the headlines in this product must be
 * stripped rather than turned into separators. NFD normalisation followed by
 * removing combining marks handles accents; `ñ` is handled explicitly, because
 * decomposing it and dropping the tilde is the correct outcome here but only by
 * coincidence — being explicit documents the intent.
 */
export function slugify(input: string): string {
  return (
    input
      .normalize('NFD')
      // Strip combining diacritics: á→a, é→e, ü→u, ñ→n.
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim()
      // Anything that is not a letter, digit or hyphen becomes a separator.
      .replace(/[^a-z0-9]+/g, '-')
      // Collapse runs and trim the edges.
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '')
  )
}

export type SlugFieldOptions = {
  /** Field the slug is generated from. Defaults to `title`. */
  sourceField?: string
  /**
   * Refuse slugs that collide with a top-level route.
   *
   * Only for collections whose slug becomes a root path — categories today.
   * An article slug lives under its category and cannot shadow anything.
   */
  rejectReserved?: boolean
}

/**
 * Reusable slug field (PRD Nº7 §107).
 *
 * `slugLocked` exists because PRD Nº7 §23 requires the slug to freeze after
 * first publication. A published URL is a promise: PRD SEO §15 requires a
 * permanent redirect when it changes, and PRD Master §31 asks for permanent
 * URLs. Freezing makes the change deliberate rather than a side effect of
 * someone fixing a typo in the headline.
 */
export function slugField({
  sourceField = 'title',
  rejectReserved = false,
}: SlugFieldOptions = {}): Field[] {
  return [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Slug',
      /*
       * `rejectReserved` is for slugs that become a top-level path — category
       * hubs live at the root (PRD SEO §57), so their slug competes with every
       * real page. Next resolves static routes first, so a category called
       * `buscar` would simply never render: no error, no warning, just a hub
       * nobody can reach. Refusing it at save time is the only moment the
       * person responsible can still fix it.
       */
      validate: rejectReserved
        ? (value: unknown) => {
            if (typeof value !== 'string' || value.length === 0) return true

            return isReservedSegment(value)
              ? `«${value}» ya es una ruta del sitio. Elige otro slug.`
              : true
          }
        : undefined,
      admin: {
        position: 'sidebar',
        description:
          'Parte final de la URL. Se genera desde el título y se congela al publicar; cambiarlo después crea un redirect automático.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data, siblingData }) => {
            // An explicit value always wins — an editor may want a shorter slug
            // than the headline (PRD SEO §14).
            if (typeof value === 'string' && value.trim() !== '') {
              return slugify(value)
            }

            const source = (data?.[sourceField] ?? siblingData?.[sourceField]) as unknown

            return typeof source === 'string' ? slugify(source) : value
          },
        ],
      },
    },
    {
      name: 'slugLocked',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Se activa en la primera publicación. Protege una URL ya difundida.',
      },
      access: {
        update: editorialStaffFieldOnly,
      },
    },
  ]
}
