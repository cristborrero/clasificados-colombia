import type { CollectionConfig } from 'payload'

import { normalisePath } from '@/lib/routes'
import { adminOnly, editorialStaffOnly, editorialStaffFieldOnly } from '@/payload/access/helpers'

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
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
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

            /*
             * The same function the resolver uses. Two implementations of "the
             * canonical form of this path" is one more than can stay in
             * agreement — and a row written under one rule and looked up under
             * the other is a redirect that silently never fires.
             */
            return normalisePath(value)
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
        update: () => true,
      },
    },
  ],
}

export default Redirects
