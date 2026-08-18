import type { Field } from 'payload'

import { editorialStaffFieldOnly } from '@/payload/access/helpers'
import {
  editorialStatusOptions,
  factCheckStatusOptions,
  legalStatusOptions,
} from '@/editorial/status'

/**
 * Newsroom workflow group (PRD Master §26).
 *
 * `editorialStatus` is one half of the ADR-001 contract — it says where a piece
 * sits in the process, while Payload's `_status` says whether it is publicly
 * visible. The hook in `hooks/editorial/enforceStatusContract.ts` keeps them
 * consistent; neither field means anything on its own.
 *
 * `legalStatus` and `factCheckStatus` carry field-level access for a specific
 * reason: without it, a mass-assignment payload marks its own work as verified
 * and legally approved, and the publication guard then waves it through.
 *
 * These two fields are what replaced the `fact_checker` and `legal_reviewer`
 * roles in the 2026-08-18 simplification. The rule they enforce is unchanged —
 * the author of a piece cannot clear it — but it is now a field permission
 * rather than two more principals in an access matrix.
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
           * Admin and editor, never author.
           *
           * This is the field that decides whether a piece may be published, so
           * the person who wrote it must not be the person who marks it
           * verified. That separation was the entire job of the old
           * `fact_checker` role; with three roles it survives as a field
           * permission instead of a principal, which is cheaper and enforces
           * the same thing.
           */
          update: editorialStaffFieldOnly,
        },
      },
      {
        name: 'legalStatus',
        type: 'select',
        options: legalStatusOptions,
        defaultValue: legalReviewByDefault ? 'pending' : 'not_required',
        label: 'Revisión legal',
        access: {
          /*
           * Same rule as fact checking: an author cannot clear their own piece
           * for legal risk. A published article that names someone is the one
           * place where "I checked it myself" is not an acceptable answer.
           */
          update: editorialStaffFieldOnly,
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
