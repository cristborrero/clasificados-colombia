import type { Payload, PayloadRequest } from 'payload'

/**
 * Writes audit events (PRD Nº5 §52-§55, PRD Nº7 §100).
 *
 * The collection denies `create` through the API, so events are written here
 * with `overrideAccess` — one of the narrow, documented exceptions PRD Nº5 §74
 * allows, alongside migrations and controlled jobs.
 *
 * Recording is best-effort and never blocks the action being recorded. PRD Nº7
 * §168 classifies this as non-critical: refusing a journalist's publish because
 * the audit write failed would trade a real editorial outcome for a log entry.
 * The failure is logged loudly instead, so a silent gap in the trail is still
 * visible in the technical logs.
 */

/**
 * Operations worth recording (PRD Master §51, CLAUDE.md §27).
 *
 * Narrowed on 2026-08-18 with the retirement of the Evidence Vault: the seven
 * events about classification, grants and per-read evidence access describe
 * machinery that no longer exists.
 *
 * What is left answers the question actually asked after an incident — who
 * published this, who took it down, who changed whose role. That is cheap to
 * keep and worth keeping. Auditing every read was neither.
 *
 * This union must stay in step with the `action` options on the AuditEvents
 * collection. It drifted once already: the collection was narrowed and this was
 * not, and `tsc --noEmit` passed because the generated Payload types had not
 * been regenerated yet. Only the production build caught it.
 */
export type AuditAction =
  | 'login_success'
  | 'login_failure'
  | 'user_created'
  | 'user_disabled'
  | 'role_changed'
  | 'content_published'
  | 'content_unpublished'
  | 'content_deleted'
  | 'settings_changed'

export type AuditEventInput = {
  action: AuditAction
  actorId?: string | number | null
  actorRole?: string | null
  resourceType?: string
  resourceId?: string | number
  result?: 'allowed' | 'denied'
  requestId?: string
  metadata?: Record<string, unknown>
}

/**
 * Keys that must never reach the audit trail (PRD Nº5 §55).
 *
 * Stripped rather than trusted to caller discipline: an audit log that records
 * secrets becomes the most valuable object in the database.
 */
const FORBIDDEN_METADATA_KEYS = [
  'password',
  'token',
  'secret',
  'url',
  'presignedurl',
  'signedurl',
  'cookie',
  'authorization',
  'accesskey',
  'secretkey',
  'content',
  'body',
]

export function sanitiseMetadata(
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!metadata) return undefined

  const safe: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(metadata)) {
    const normalised = key.toLowerCase().replace(/[^a-z]/g, '')

    if (FORBIDDEN_METADATA_KEYS.some((forbidden) => normalised.includes(forbidden))) {
      safe[key] = '[redactado]'
      continue
    }

    safe[key] = value
  }

  return safe
}

export async function recordAuditEvent(
  payload: Payload,
  event: AuditEventInput,
): Promise<void> {
  try {
    await payload.create({
      collection: 'audit-events',
      data: {
        timestamp: new Date().toISOString(),
        action: event.action,
        actorId: event.actorId != null ? String(event.actorId) : undefined,
        actorRole: event.actorRole ?? undefined,
        resourceType: event.resourceType,
        resourceId: event.resourceId != null ? String(event.resourceId) : undefined,
        result: event.result ?? 'allowed',
        requestId: event.requestId,
        metadata: sanitiseMetadata(event.metadata),
      },
      overrideAccess: true,
    })
  } catch (error) {
    payload.logger.error(
      { err: error, action: event.action },
      'No se pudo registrar evento de auditoría',
    )
  }
}
