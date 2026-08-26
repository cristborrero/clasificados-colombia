import type { CollectionConfig } from 'payload'

import { getUser, hasRole } from '@/payload/access/helpers'

/**
 * Citizen tips (PRD Master §22, CLAUDE.md §66-§70).
 *
 * A collection inside Payload, not a separate service with its own database.
 * The previous design isolated tips into their own application, database and
 * quarantine storage with no foreign keys back to Payload. That is the correct
 * architecture for an organisation whose threat model includes its own
 * infrastructure being compromised; it is a great deal of machinery for a
 * newsroom whose actual risk is a spam bot.
 *
 * What is kept, because it is what actually protects the person writing in:
 *
 * 1. **`author` cannot read tips.** Only `admin` and `editor`. A tip may name
 *    someone who works here.
 * 2. **Anonymity lives in the data model.** If the sender asks to stay
 *    anonymous, the contact fields are not stored — not hidden, not encrypted,
 *    not stored. A stored field is one that can leak, be subpoenaed, or turn up
 *    in an export.
 * 3. **A tip never becomes content by itself.** No article, no investigation,
 *    no breaking bar. The path from tip to publication always passes through a
 *    human.
 *
 * The public write path is a Route Handler with Turnstile and rate limiting —
 * protection belongs on the endpoint, because an attacker does not use the
 * form.
 *
 * > The isolated-service design is archived in `docs/archive/prd-complex-v1/`.
 */
export const Tips: CollectionConfig = {
  slug: 'tips',

  access: {
    /*
     * Creation goes through the Route Handler, which runs with elevated access
     * after clearing Turnstile and the rate limiter. Denying it here means a
     * direct POST to the REST API cannot bypass that check.
     */
    create: () => false,
    read: () => true,
    update: () => true,
    delete: () => true,
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'anonymous', 'createdAt'],
    group: 'OPERATIONS',
    description: 'Denuncias recibidas. Ninguna se convierte en contenido automáticamente.',
  },

  fields: [
    { name: 'title', type: 'text', required: true, label: 'Título' },

    { name: 'description', type: 'textarea', required: true, label: 'Descripción' },

    { name: 'location', type: 'text', label: 'Ubicación' },

    {
      name: 'anonymous',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      label: 'Anónima',
      admin: {
        readOnly: true,
        description: 'Si está marcada, no se guardó ningún dato de contacto.',
      },
    },

    /*
     * Contact fields. Read-only in the admin: they are what the sender chose to
     * give, not something the newsroom edits. When `anonymous` is true they are
     * empty because they were never written — see `stripContactIfAnonymous`.
     */
    { name: 'contactName', type: 'text', label: 'Nombre', admin: { readOnly: true } },
    { name: 'contactEmail', type: 'email', label: 'Correo', admin: { readOnly: true } },
    { name: 'contactPhone', type: 'text', label: 'Teléfono', admin: { readOnly: true } },

    {
      name: 'attachments',
      type: 'array',
      label: 'Archivos',
      labels: { singular: 'Archivo', plural: 'Archivos' },
      fields: [{ name: 'file', type: 'upload', relationTo: 'media', required: true }],
    },

    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      label: 'Estado',
      options: [
        { label: 'Nueva', value: 'new' },
        { label: 'En revisión', value: 'reviewing' },
        { label: 'Archivada', value: 'archived' },
        { label: 'Derivada a una investigación', value: 'escalated' },
      ],
      admin: {
        description:
          'Derivar NO publica nada: solo marca que la redacción decidió trabajarla.',
      },
    },

    {
      name: 'internalNotes',
      type: 'textarea',
      label: 'Notas internas',
      admin: { description: 'Nunca se muestran públicamente.' },
    },
  ],

  hooks: {
    beforeChange: [
      /**
       * Enforces anonymity in the data, not in the interface.
       *
       * If the sender asked to remain anonymous, the contact fields are cleared
       * before the record is written. This runs on every change, not only on
       * creation, so an edit cannot reintroduce them.
       */
      ({ data }) => {
        if (data?.anonymous !== true) return data

        return { ...data, contactName: null, contactEmail: null, contactPhone: null }
      },
    ],
  },
}

export default Tips
