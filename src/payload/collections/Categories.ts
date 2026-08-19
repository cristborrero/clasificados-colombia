import type { CollectionConfig } from 'payload'

import { adminOnly, editorialStaffOnly, publicActiveOrEditorial } from '@/payload/access/helpers'
import { seoFields } from '@/payload/fields/seo'
import { slugField } from '@/payload/fields/slug'

/**
 * Categories — the editorial sections (PRD Nº7 §14-§15).
 *
 * PRD Nº7 §14 is explicit that these live in their own collection and are never
 * hard-coded in frontend components, and PRD Nº8 §28 says the same about
 * navigation. A section list baked into a component is a section list only a
 * developer can change.
 *
 * Not the same thing as `contentType` (PRD Nº7 §25). A category answers "what
 * is this about" — Política, Justicia. A content type answers "what kind of
 * piece is this" — noticia, análisis, perfil. Conflating them is why so many
 * news sites end up with "Opinión" as both a section and a format.
 */
export const Categories: CollectionConfig = {
  slug: 'categories',

  access: {
    read: publicActiveOrEditorial,
    create: editorialStaffOnly,
    update: editorialStaffOnly,
    /*
     * PRD Nº7 §118: deleting a category that published content points at
     * breaks that content. Retire with `active = false` instead. Restricted to
     * administrators as a speed bump, not as a blessing — reference checking
     * arrives with the content that creates the references.
     */
    delete: adminOnly,
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order', 'active'],
    group: 'NEWSROOM',
    description: 'Secciones editoriales. Retirar con «Activa = falso», no borrando.',
  },

  defaultSort: 'order',

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nombre',
    },

    // The hub lives at the root, so its slug must not shadow a real page.
    ...slugField({ sourceField: 'name', rejectReserved: true }),

    {
      name: 'description',
      type: 'textarea',
      label: 'Descripción',
      admin: {
        description:
          'Se muestra en la página de sección. PRD SEO §57 pide páginas editoriales reales, no listados.',
      },
    },

    /*
     * Subsections (PRD Nº8 §90).
     *
     * A section page has to be an editorial page rather than a flat list, and
     * one of the things that makes it one is being able to say what lives
     * inside it. One level only, by convention: a taxonomy deep enough to need
     * a tree is a taxonomy the reader has already stopped following.
     */
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      index: true,
      label: 'Sección madre',
      admin: {
        description: 'Vacío para una sección principal. Una sola profundidad.',
      },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },

    {
      name: 'navigationLabel',
      type: 'text',
      label: 'Etiqueta en navegación',
      admin: {
        description: 'Si se deja vacío se usa el nombre. Útil cuando el nombre es largo.',
      },
    },

    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Orden',
      admin: {
        description: 'Define el orden en la navegación. Menor aparece primero.',
      },
    },

    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      label: 'Activa',
      admin: {
        description: 'Al desactivar, deja de ser visible públicamente sin romper lo publicado.',
      },
    },

    seoFields(),
  ],
}

export default Categories
