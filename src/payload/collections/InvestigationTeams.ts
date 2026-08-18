import type { CollectionConfig } from 'payload'

import { adminOnly, getUser, hasRole } from '@/payload/access/helpers'

/**
 * Investigation teams (PRD Nº5 §45, PRD Nº7 §74).
 *
 * Need-to-know at team granularity. PRD Nº5 §45 prefers this over issuing
 * individual grants at scale: an investigation with six reporters should not
 * require thirty-six grant records, and a team that ends should revoke access
 * once rather than person by person.
 */
export const InvestigationTeams: CollectionConfig = {
  slug: 'investigation-teams',

  access: {
    // Team membership reveals who is working on what — itself sensitive.
    read: ({ req }) =>
      hasRole(getUser(req), ['administrator', 'editor_in_chief', 'investigative_editor']),
    create: ({ req }) =>
      hasRole(getUser(req), ['administrator', 'editor_in_chief', 'investigative_editor']),
    update: ({ req }) =>
      hasRole(getUser(req), ['administrator', 'editor_in_chief', 'investigative_editor']),
    delete: adminOnly,
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'investigation', 'active'],
    group: 'SECURITY',
    description: 'Equipos con necesidad de conocer. Desactivar al cerrar la investigación.',
  },

  fields: [
    { name: 'name', type: 'text', required: true, label: 'Nombre' },
    {
      name: 'investigation',
      type: 'relationship',
      relationTo: 'investigations',
      required: true,
      index: true,
      label: 'Investigación',
    },
    {
      name: 'members',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      required: true,
      label: 'Integrantes',
    },
    { name: 'lead', type: 'relationship', relationTo: 'users', label: 'Responsable' },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      label: 'Activo',
      admin: {
        description: 'Al desactivar, el equipo deja de dar acceso a evidencia reservada.',
      },
    },
  ],
}

export default InvestigationTeams
