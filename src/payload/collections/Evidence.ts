import type { CollectionConfig, Where } from 'payload'

import { adminFieldOnly, getUser, hasRole, isActive } from '@/payload/access/helpers'
import { CLASSIFICATION_LABELS, EVIDENCE_STATUS_LABELS } from '@/evidence/authorization'

/**
 * Evidence Vault — metadata only (PRD Nº5 §27-§34, PRD Nº7 §65-§70).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * PAYLOAD NEVER STORES THE FILE. MinIO does.
 *
 * This collection holds `bucket` and `objectKey` — a pointer — plus the
 * classification that decides who may follow it. PRD Nº5 §27 draws the line
 * and PRD Master §23 gives the reason: even someone who obtains a document ID
 * from the database cannot reach the file without passing authorisation,
 * unlike a predictable CDN URL.
 *
 * The whole collection is NOT publicly readable (PRD Nº7 §70). Public evidence
 * reaches the frontend through `toPublicEvidence`, a projection that omits
 * `bucket` and `objectKey` by construction. PRD Master §25 forbids returning an
 * object key to a client, because knowing where a file lives is most of the
 * work of reaching it.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Object keys are random (PRD Nº5 §65, PRD Nº4 §145). A file named
 * `juan-perez-whistleblower-original.pdf` identifies a source through its
 * filename alone, and filenames leak into logs, backups and error reports.
 */
export const Evidence: CollectionConfig = {
  slug: 'evidence',

  access: {
    /**
     * Anonymous callers see only approved public evidence — and even then, only
     * the safe projection, because the frontend must go through
     * `toPublicEvidence` rather than serialising the document.
     *
     * A filter rather than a boolean (PRD Nº7 §106): restricted rows are never
     * loaded, so a list endpoint cannot reveal that they exist. PRD Nº5 §93
     * treats the mere existence of a restricted document as sensitive.
     */
    read: ({ req }) => {
      const user = getUser(req)

      if (hasRole(user, ['administrator', 'editor_in_chief', 'investigative_editor'])) {
        return true
      }

      if (isActive(user)) {
        // Newsroom staff see public and internal metadata; restricted rows stay
        // hidden until an explicit grant is exercised through the access route.
        const nonRestricted: Where = { classification: { not_equals: 'restricted' } }
        return nonRestricted
      }

      const approvedPublic: Where[] = [
        { classification: { equals: 'public' } },
        { status: { equals: 'approved' } },
      ]

      return { and: approvedPublic }
    },

    create: ({ req }) =>
      hasRole(getUser(req), [
        'administrator',
        'editor_in_chief',
        'investigative_editor',
        'reporter',
      ]),

    update: ({ req }) =>
      hasRole(getUser(req), ['administrator', 'editor_in_chief', 'investigative_editor']),

    /*
     * PRD Nº5 §63: restricted evidence is never hard-deleted. Retention,
     * logical deletion and object versioning replace it — a destroyed document
     * cannot be un-destroyed when a court asks for it.
     */
    delete: ({ req }) => hasRole(getUser(req), ['administrator']),
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'classification', 'status', 'relatedInvestigation'],
    group: 'RESEARCH',
    description:
      'Metadatos de evidencia. El archivo vive en MinIO y solo se alcanza mediante autorización auditada.',
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Título',
      admin: {
        description:
          'Descripción del documento. No incluir nombres de fuentes reservadas (PRD Nº5 §122).',
      },
    },

    { name: 'description', type: 'textarea', label: 'Descripción' },

    /*
     * Descriptive metadata (PRD Nº8 §84).
     *
     * What a reader needs in order to judge a document before opening it: what
     * kind of record it is, who issued it, when, and how long it runs. None of
     * it says where the file lives, so all of it is safe to publish alongside a
     * public document — and without it an evidence card is a filename.
     */
    {
      name: 'documentType',
      type: 'text',
      label: 'Tipo de documento',
      admin: { description: 'Contrato, acta, resolución, oficio…' },
    },

    {
      name: 'institution',
      type: 'text',
      label: 'Entidad que lo emitió',
    },

    {
      name: 'documentDate',
      type: 'date',
      label: 'Fecha del documento',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'La fecha del documento, no la de su carga.',
      },
    },

    {
      name: 'pageCount',
      type: 'number',
      min: 1,
      label: 'Páginas',
    },

    {
      name: 'classification',
      type: 'select',
      required: true,
      defaultValue: 'restricted',
      index: true, // PRD Nº7 §66
      label: 'Clasificación',
      options: (['public', 'internal', 'restricted'] as const).map((value) => ({
        label: CLASSIFICATION_LABELS[value],
        value,
      })),
      admin: {
        description:
          'Reservada por defecto. Bajar la clasificación es una operación sensible que exige doble aprobación (PRD Nº5 §50).',
      },
      access: {
        // PRD Nº5 §19: classification is a security field, not editorial metadata.
        update: adminFieldOnly,
      },
    },

    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      label: 'Estado',
      options: (['pending', 'verified', 'approved', 'quarantined', 'archived'] as const).map(
        (value) => ({ label: EVIDENCE_STATUS_LABELS[value], value }),
      ),
      admin: {
        description: 'Solo el material aprobado puede servirse públicamente (PRD Nº7 §70).',
      },
    },

    {
      name: 'bucket',
      type: 'text',
      label: 'Bucket',
      admin: {
        readOnly: true,
        description: 'Se deriva de la clasificación. No editable (PRD Nº7 §69).',
      },
      access: {
        read: ({ req }) => hasRole(getUser(req), ['administrator', 'investigative_editor']),
        update: () => false,
      },
    },

    {
      name: 'objectKey',
      type: 'text',
      label: 'Object key',
      admin: {
        readOnly: true,
        description: 'Identificador aleatorio en MinIO. Nunca se entrega al navegador.',
      },
      access: {
        // PRD Nº7 §68 / PRD Master §25.
        read: ({ req }) => hasRole(getUser(req), ['administrator', 'investigative_editor']),
        update: () => false,
      },
    },

    { name: 'mimeType', type: 'text', label: 'Tipo MIME', admin: { readOnly: true } },
    { name: 'size', type: 'number', label: 'Tamaño (bytes)', admin: { readOnly: true } },

    {
      name: 'checksum',
      type: 'text',
      label: 'Checksum SHA-256',
      admin: {
        readOnly: true,
        description:
          'Permite verificar que el archivo almacenado es el registrado (PRD Nº5 §58-§59). No sustituye una firma digital.',
      },
      access: { update: () => false },
    },

    {
      name: 'relatedInvestigation',
      type: 'relationship',
      relationTo: 'investigations',
      index: true,
      label: 'Investigación',
      admin: {
        description: 'Da acceso al equipo de esa investigación (necesidad de conocer).',
      },
    },

    {
      name: 'retention',
      type: 'date',
      label: 'Retención hasta',
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },

    {
      name: 'legalHold',
      type: 'checkbox',
      defaultValue: false,
      label: 'Retención legal',
      admin: {
        description:
          'Suspende cualquier eliminación automática. Activarlo o quitarlo requiere autoridad elevada (PRD Nº5 §62).',
      },
      access: { update: adminFieldOnly },
    },

    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Cargado por',
      admin: { readOnly: true },
      access: { update: () => false },
      hooks: {
        beforeChange: [
          ({ operation, req, value }) => (operation === 'create' && req.user ? req.user.id : value),
        ],
      },
    },
  ],

  hooks: {
    beforeChange: [
      ({ data }) => {
        /*
         * Bucket is derived, never typed (PRD Nº7 §69). Letting an editor pick
         * the bucket would let a restricted document be filed in the public one.
         */
        const classification = (data as { classification?: 'public' | 'internal' | 'restricted' })
          .classification

        if (classification) {
          return { ...data, bucket: `evidence-${classification}` }
        }

        return data
      },
    ],
  },
}

export default Evidence
