import type { CollectionConfig } from 'payload'

import { adminOnly, denyAll } from '@/payload/access/helpers'

/**
 * Audit trail (PRD Nº5 §52-§57, PRD Nº7 §75-§76).
 *
 * APPEND ONLY. `update` and `delete` are `denyAll` — not restricted to
 * administrators, denied outright. PRD Nº5 §56 is explicit that administrators
 * must not be able to edit events from the UI either, and the reason is the
 * whole point of an audit trail: a log its most privileged user can rewrite
 * proves nothing about that user. During an incident, the first question is
 * often what an administrator did.
 *
 * `create` is denied through the API as well (PRD Nº7 §76). Events are written
 * by the system through the Local API with `overrideAccess`, which is one of
 * the narrow, documented uses PRD Nº5 §74 permits.
 *
 * What must never be written here (PRD Nº5 §55): passwords, tokens, presigned
 * URLs, document contents, complaint text, MinIO credentials, session cookies.
 * An audit trail that records secrets becomes the thing worth stealing.
 */
export const AuditEvents: CollectionConfig = {
  slug: 'audit-events',

  access: {
    // PRD Nº5 §56: even reading is privileged — the log reveals who touched what.
    read: adminOnly,
    create: denyAll,
    update: denyAll,
    delete: denyAll,
  },

  admin: {
    useAsTitle: 'action',
    defaultColumns: ['timestamp', 'action', 'actorRole', 'resourceType', 'result'],
    group: 'SECURITY',
    description:
      'Registro append-only. No se puede editar ni borrar, tampoco por un administrador.',
  },

  fields: [
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      index: true,
      label: 'Momento',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },

    {
      name: 'action',
      type: 'select',
      required: true,
      index: true,
      label: 'Acción',
      // PRD Nº5 §54 — the minimum set that must be recorded.
      options: [
        { label: 'Inicio de sesión exitoso', value: 'login_success' },
        { label: 'Inicio de sesión fallido', value: 'login_failure' },
        { label: 'Usuario creado', value: 'user_created' },
        { label: 'Usuario deshabilitado', value: 'user_disabled' },
        { label: 'Rol modificado', value: 'role_changed' },
        { label: 'Contenido publicado', value: 'content_published' },
        { label: 'Contenido despublicado', value: 'content_unpublished' },
        { label: 'Contenido eliminado', value: 'content_deleted' },
        { label: 'Configuración modificada', value: 'settings_changed' },
      ],
    },

    {
      name: 'actorId',
      type: 'text',
      index: true,
      label: 'Actor',
      admin: {
        description: 'Identificador del usuario. Vacío cuando la acción fue anónima.',
      },
    },

    {
      name: 'actorRole',
      type: 'text',
      label: 'Rol del actor',
      admin: {
        description:
          'El rol en el momento del hecho. Se guarda literal y no por relación: si después cambia, el registro debe seguir diciendo qué autoridad se ejerció entonces.',
      },
    },

    { name: 'resourceType', type: 'text', index: true, label: 'Tipo de recurso' },
    { name: 'resourceId', type: 'text', index: true, label: 'Recurso' },

    {
      name: 'result',
      type: 'select',
      required: true,
      defaultValue: 'allowed',
      index: true,
      label: 'Resultado',
      options: [
        { label: 'Permitido', value: 'allowed' },
        { label: 'Denegado', value: 'denied' },
      ],
      admin: {
        description:
          'PRD Nº5 §115: un intento denegado también se registra. Los accesos rechazados son la señal temprana.',
      },
    },

    {
      name: 'requestId',
      type: 'text',
      label: 'Request ID',
      admin: { description: 'Correlaciona el evento con los logs técnicos (PRD Nº4 §83).' },
    },

    {
      name: 'metadata',
      type: 'json',
      label: 'Metadata',
      admin: {
        description:
          'Contexto adicional. NUNCA secretos, tokens, URLs presignadas ni contenido de documentos (PRD Nº5 §55).',
      },
    },
  ],

  timestamps: true,
}

export default AuditEvents
