import type { CollectionConfig } from 'payload'

import { adminOnly, getUser, hasRole } from '@/payload/access/helpers'

/**
 * Explicit access grants for restricted evidence (PRD Nº5 §43-§44, PRD Nº7 §72-§73).
 *
 * `reason` is required. A grant without a stated purpose is indistinguishable
 * from a mistake six months later, and the quarterly review PRD Nº5 §128 asks
 * for is only possible if each row says why it exists.
 *
 * `expiresAt` is encouraged for the same reason PRD Nº5 §44 gives: access that
 * never expires becomes access nobody remembers granting.
 */
export const EvidenceAccessGrants: CollectionConfig = {
  slug: 'evidence-access-grants',

  access: {
    read: ({ req }) =>
      hasRole(getUser(req), ['administrator', 'editor_in_chief', 'investigative_editor']),
    create: ({ req }) =>
      hasRole(getUser(req), ['administrator', 'editor_in_chief', 'investigative_editor']),
    update: ({ req }) =>
      hasRole(getUser(req), ['administrator', 'editor_in_chief', 'investigative_editor']),
    /*
     * Revoke rather than delete: `revokedAt` keeps the record that access once
     * existed, which is exactly what an incident review needs to establish.
     */
    delete: adminOnly,
  },

  admin: {
    useAsTitle: 'reason',
    defaultColumns: ['user', 'evidence', 'expiresAt', 'revokedAt'],
    group: 'SECURITY',
    description:
      'Autorizaciones puntuales sobre evidencia reservada. Para retirar acceso, registrar la revocación — no borrar.',
  },

  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      label: 'Persona autorizada',
    },
    {
      name: 'evidence',
      type: 'relationship',
      relationTo: 'evidence',
      required: true,
      index: true,
      label: 'Evidencia',
    },
    {
      name: 'grantedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Autorizado por',
      admin: { readOnly: true },
      access: { update: () => false },
      hooks: {
        beforeChange: [
          ({ operation, req, value }) => (operation === 'create' && req.user ? req.user.id : value),
        ],
      },
    },
    {
      name: 'reason',
      type: 'textarea',
      required: true,
      label: 'Motivo',
      admin: {
        description: 'Por qué esta persona necesita este documento. Obligatorio.',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Vence',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Recomendado. Un acceso sin vencimiento es un acceso que nadie recuerda.',
      },
    },
    {
      name: 'revokedAt',
      type: 'date',
      label: 'Revocado',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'revokedBy', type: 'relationship', relationTo: 'users', label: 'Revocado por' },
  ],
}

export default EvidenceAccessGrants
