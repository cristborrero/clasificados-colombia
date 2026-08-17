import type { CollectionConfig } from 'payload'

import { adminOnly, editorialStaffOnly, publicActiveOrEditorial } from '@/payload/access/helpers'
import { seoFields } from '@/payload/fields/seo'
import { slugField } from '@/payload/fields/slug'

/**
 * Authors — public bylines (PRD Nº7 §11-§13).
 *
 * Deliberately separate from `Users` (PRD Nº7 §11). Not every byline needs a
 * CMS login — a columnist may never touch the admin — and not every internal
 * account should appear as an author. Merging them would either hand logins to
 * people who do not need them or hide contributors who do not have one.
 *
 * PRD SEO §31-§34 make this collection load-bearing for authority: every
 * article carries a real byline linking to `/autor/[slug]`, and that page is
 * what tells both a reader and a search engine who is answerable for the work.
 *
 * PRD Nº7 §13 forbids storing `articles[]` here. The relationship is canonical
 * in one direction only — `article.authors[]` — and the inverse is derived by
 * query (§117). Two hand-maintained sides of one relationship drift apart.
 */
export const Authors: CollectionConfig = {
  slug: 'authors',

  access: {
    read: publicActiveOrEditorial,
    create: editorialStaffOnly,
    update: editorialStaffOnly,
    /*
     * PRD Nº7 §118: deleting an author orphans every published byline they
     * carry. Retiring a journalist is `active = false`, which keeps the
     * historical record intact — which for a byline is the entire point.
     */
    delete: adminOnly,
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'jobTitle', 'active'],
    group: 'NEWSROOM',
    description:
      'Firmas públicas. Al retirar a alguien del equipo, desactivar — nunca borrar, o se pierden las firmas publicadas.',
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nombre',
      admin: {
        description: 'Como debe aparecer en la firma.',
      },
    },

    ...slugField({ sourceField: 'name' }),

    {
      name: 'jobTitle',
      type: 'text',
      label: 'Cargo',
      admin: {
        description: 'Ejemplo: «Periodista de investigación». Aparece bajo la firma.',
      },
    },

    {
      name: 'shortBio',
      type: 'textarea',
      label: 'Biografía breve',
      admin: {
        description: 'Una o dos líneas, para la ficha al pie del artículo.',
      },
    },

    {
      name: 'bio',
      type: 'textarea',
      label: 'Biografía completa',
      admin: {
        description:
          'Para la página de autor. PRD SEO §32 pide trayectoria real, no un párrafo vago.',
      },
    },

    {
      name: 'expertise',
      type: 'array',
      label: 'Áreas de especialidad',
      labels: { singular: 'Área', plural: 'Áreas' },
      fields: [
        {
          name: 'area',
          type: 'text',
          required: true,
        },
      ],
    },

    {
      name: 'emailPublic',
      type: 'email',
      label: 'Correo público',
      admin: {
        description: 'Opcional y público. No usar el correo interno de la cuenta del CMS.',
      },
    },

    {
      name: 'socialLinks',
      type: 'array',
      label: 'Perfiles profesionales',
      labels: { singular: 'Perfil', plural: 'Perfiles' },
      admin: {
        description:
          'Solo perfiles oficiales verificables: PRD SEO §33 los emite como `sameAs` en structured data.',
      },
      fields: [
        {
          name: 'platform',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },

    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      label: 'Activo',
      admin: {
        description: 'Desactivar al salir del equipo. Las firmas publicadas se conservan.',
      },
    },

    seoFields(),

    /*
     * `portrait` (relationship to Media) is deferred until the Media collection
     * exists. PRD Nº7 §12 lists it and PRD Nº10 §101-§102 specify how author
     * portraits are cropped and sized.
     */
  ],
}

export default Authors
