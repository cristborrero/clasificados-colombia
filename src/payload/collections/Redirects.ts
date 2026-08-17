import type { CollectionConfig } from 'payload'

import { adminOnly, editorialStaffOnly } from '@/payload/access/helpers'

/**
 * Redirects (PRD SEO §15-§16, PRD Nº7 §79-§80).
 *
 * A published URL is a promise. PRD Master §31 asks for permanent URLs and PRD
 * SEO §15 requires a permanent redirect whenever a published slug changes —
 * otherwise every inbound link, every citation and every search result pointing
 * at the old address breaks silently.
 *
 * Rows are created automatically by the slug hook, and by hand when a URL
 * changes for editorial reasons. PRD SEO §16 requires the application to check
 * this collection *before* answering 404.
 */
export const Redirects: CollectionConfig = {
  slug: 'redirects',

  access: {
    // The resolver reads these on every unmatched request.
    read: () => true,
    create: editorialStaffOnly,
    update: editorialStaffOnly,
    /*
     * Deleting a redirect re-breaks a URL that was already broken once. The
     * usual way to retire one is `active = false`, which keeps the record of
     * why it existed.
     */
    delete: adminOnly,
  },

  admin: {
    useAsTitle: 'from',
    defaultColumns: ['from', 'to', 'statusCode', 'active'],
    group: 'OPERATIONS',
    description: 'Redirecciones permanentes. Se evalúan antes de devolver un 404.',
  },

  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      unique: true, // PRD Nº7 §80
      index: true,
      label: 'Desde',
      admin: {
        description: 'Ruta anterior, con barra inicial. Ejemplo: /articulo/titulo-viejo',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (typeof value !== 'string') return value

            // Normalise so that `/a`, `/a/` and `a` cannot become three rows
            // that each half-work.
            const path = value.trim().split('?')[0] ?? ''
            const withLeadingSlash = path.startsWith('/') ? path : `/${path}`

            return withLeadingSlash.length > 1
              ? withLeadingSlash.replace(/\/+$/, '')
              : withLeadingSlash
          },
        ],
      },
    },

    {
      name: 'to',
      type: 'text',
      required: true,
      label: 'Hacia',
      admin: {
        description: 'Ruta destino. Debe existir, o se encadena un redirect hacia un 404.',
      },
    },

    {
      name: 'statusCode',
      type: 'select',
      required: true,
      defaultValue: '308',
      label: 'Código',
      options: [
        { label: '301 — Movido permanentemente', value: '301' },
        { label: '308 — Redirección permanente', value: '308' },
        { label: '302 — Encontrado (temporal)', value: '302' },
        { label: '307 — Redirección temporal', value: '307' },
      ],
      admin: {
        description:
          'Para cambios editoriales permanentes usar 301 o 308 (PRD SEO §16). Los temporales no transfieren autoridad.',
      },
    },

    {
      name: 'reason',
      type: 'text',
      label: 'Motivo',
      admin: {
        description: 'Por qué existe. Sin esto, nadie sabrá si se puede retirar.',
      },
    },

    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      label: 'Activa',
    },

    {
      name: 'automatic',
      type: 'checkbox',
      defaultValue: false,
      label: 'Creada automáticamente',
      admin: {
        readOnly: true,
        description: 'Marca las que generó el sistema al cambiar un slug publicado.',
      },
      access: {
        update: () => false,
      },
    },
  ],
}

export default Redirects
