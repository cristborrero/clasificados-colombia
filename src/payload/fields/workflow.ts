import type { Field } from 'payload'

import { adminFieldOnly } from '@/payload/access/helpers'
import {
  editorialStatusOptions,
  factCheckStatusOptions,
  legalStatusOptions,
} from '@/editorial/status'

/**
 * Newsroom workflow group (PRD Nº7 §38).
 *
 * `editorialStatus` is one half of the ADR-001 contract — it says where a piece
 * sits in the process, while Payload's `_status` says whether it is publicly
 * visible. The hook in `hooks/editorial/enforceStatusContract.ts` keeps them
 * consistent; neither field means anything on its own.
 *
 * PRD Nº5 §19 lists `legalStatus` and `factCheckStatus` among the fields that
 * need field-level access, and §98 explains why: without it, a mass-assignment
 * payload marks its own work as legally approved.
 */
export type WorkflowFieldOptions = {
  /** Investigations require legal review by default (PRD Nº7 §56). */
  legalReviewByDefault?: boolean
}

export function workflowFields({ legalReviewByDefault = false }: WorkflowFieldOptions = {}): Field {
  return {
    name: 'workflow',
    type: 'group',
    label: 'Flujo editorial',
    admin: {
      description:
        'Estado de la pieza dentro del proceso de redacción. La visibilidad pública se deriva de aquí, no se controla por separado.',
    },
    fields: [
      {
        name: 'editorialStatus',
        type: 'select',
        required: true,
        index: true, // PRD Nº7 §114
        options: editorialStatusOptions,
        defaultValue: 'draft',
        label: 'Estado editorial',
        admin: {
          description:
            'Publicar exige rol autorizado, verificación completa y revisión legal resuelta.',
        },
      },
      {
        name: 'factCheckStatus',
        type: 'select',
        options: factCheckStatusOptions,
        defaultValue: 'not_started',
        label: 'Verificación de datos',
        access: {
          /*
           * Restricted to administrators for now. The correct owner is the
           * fact_checker role, but that rule belongs with the assignment
           * fields that F4 has not built yet — and locking it down too far is
           * recoverable, while leaving it open is not (PRD Nº5 §2).
           */
          update: adminFieldOnly,
        },
      },
      {
        name: 'legalStatus',
        type: 'select',
        options: legalStatusOptions,
        defaultValue: legalReviewByDefault ? 'pending' : 'not_required',
        label: 'Revisión legal',
        access: {
          update: adminFieldOnly,
        },
      },
      {
        name: 'reviewNotes',
        type: 'textarea',
        label: 'Notas de revisión',
        admin: {
          description: 'Notas internas. Nunca se envían al frontend público (PRD Nº8 §170).',
        },
      },
    ],
  }
}
