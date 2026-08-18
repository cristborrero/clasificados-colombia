import type { CollectionConfig } from 'payload'

import { getUser, hasRole, isActive } from '@/payload/access/helpers'

/**
 * Published documents (PRD Master §20, CLAUDE.md §23).
 *
 * Simplified on 2026-08-18. The previous design was an Evidence Vault: three
 * classification levels, per-investigation access grants, need-to-know checks,
 * 60-second presigned URLs and an append-only audit of every read.
 *
 * That design answered a question this platform does not have: how to hold
 * material that must exist in the system but must not be readable by most of
 * the people in it. The rule that replaces it is one sentence and needs no
 * machinery:
 *
 *     if a document is published, it is public
 *     if it cannot be public, it does not go in the CMS
 *
 * A sensitive document that cannot yet be published lives outside the platform
 * until it can. That is an editorial decision, and editorial decisions are
 * better made by editors than enforced by a permissions matrix nobody fully
 * understands.
 *
 * The one rule kept from the old design, because it was right independently of
 * all that: **the storage location never reaches the client**. Knowing where a
 * file lives is most of the work of reaching it, so the frontend receives a URL
 * from Payload's upload handling, never a bucket and key.
 *
 * > The Evidence Vault design is archived in `docs/archive/prd-complex-v1/`.
 */
export const EvidenceDocuments: CollectionConfig = {
  slug: 'evidence-documents',

  access: {
    /*
     * Readable by anyone: a document in this collection is, by the rule above,
     * a published document. Draft *articles* stay private through their own
     * collection; a document has no draft state because an unpublishable
     * document is not uploaded.
     */
    read: () => true,
    create: ({ req }) => isActive(getUser(req)),
    update: ({ req }) => hasRole(getUser(req), ['admin', 'editor']),
    delete: ({ req }) => hasRole(getUser(req), ['admin']),
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'documentType', 'institution', 'documentDate'],
    group: 'EDITORIAL',
    description:
      'Documentos publicados que respaldan una investigación. Si no puede ser público, no se sube.',
  },

  upload: {
    // Payload owns the storage adapter (S3/MinIO in production, disk in
    // development), so this collection never talks to a bucket directly.
    staticDir: 'media/documents',
    mimeTypes: ['application/pdf', 'image/*', 'text/csv', 'application/vnd.ms-excel'],
  },

  fields: [
    { name: 'title', type: 'text', required: true, label: 'Nombre del documento' },

    {
      name: 'description',
      type: 'textarea',
      label: 'Contexto',
      admin: {
        description: 'Por qué este documento importa. Un documento sin contexto es un archivo.',
      },
    },

    {
      name: 'documentType',
      type: 'text',
      label: 'Tipo de documento',
      admin: { description: 'Contrato, acta, resolución, oficio…' },
    },

    { name: 'institution', type: 'text', label: 'Entidad que lo emitió' },

    {
      name: 'documentDate',
      type: 'date',
      label: 'Fecha del documento',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'La fecha del documento, no la de su carga.',
      },
    },

    { name: 'pageCount', type: 'number', min: 1, label: 'Páginas' },

    {
      name: 'relatedInvestigation',
      type: 'relationship',
      relationTo: 'investigations',
      index: true,
      label: 'Investigación',
    },
  ],
}

export default EvidenceDocuments
