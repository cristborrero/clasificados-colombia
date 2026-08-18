import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload, type PayloadRequest } from 'payload'

import {
  decideEvidenceAccess,
  type AccessGrant,
  type Classification,
  type EvidenceStatus,
  type TeamMembership,
} from '@/evidence/authorization'
import { createDownloadUrl, isEvidenceStorageConfigured } from '@/evidence/storage'
import { recordAuditEvent } from '@/payload/utilities/audit'

/**
 * Evidence access endpoint (PRD Nº5 §38).
 *
 * The mandated order is authorise → audit → mint, and it is not arbitrary:
 *
 *   Request → Authentication → Authorization → Classification check
 *           → Grant / team check → Audit event → Presigned URL
 *
 * The audit event is written BEFORE the URL exists. PRD Nº4 §142 forbids
 * generating URLs "silenciosamente sin trazabilidad", and ordering it this way
 * means a crash between the two leaves a record of an attempt rather than an
 * untracked URL in the wild.
 *
 * Denials are audited too (PRD Nº5 §115). Refused attempts are the early signal
 * that something is wrong, and a log that only records successes cannot show
 * someone probing.
 *
 * The response never contains `bucket` or `objectKey` (PRD Master §25), and the
 * URL is never persisted (PRD Nº4 §26).
 */
export const dynamic = 'force-dynamic'

type EvidenceRow = {
  id: string | number
  classification: Classification
  status: EvidenceStatus
  bucket?: string | null
  objectKey?: string | null
  relatedInvestigation?: string | number | { id: string | number } | null
}

const relationId = (value: unknown): string | number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
    return (value as { id: string | number }).id
  }
  return value as string | number
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
  const payload = await getPayload({ config })

  // Payload resolves the session from the incoming request headers.
  const { user } = await payload.auth({
    headers: request.headers,
  } as unknown as Parameters<typeof payload.auth>[0])

  const requester = user
    ? {
        id: user.id,
        role: (user as { role?: string }).role as never,
        status: (user as { status?: string }).status ?? null,
      }
    : null

  const audit = (result: 'allowed' | 'denied', reason: string) =>
    recordAuditEvent(payload, {
      action: result === 'allowed' ? 'evidence_downloaded' : 'evidence_access_denied',
      actorId: requester?.id ?? null,
      actorRole: requester?.role ?? null,
      resourceType: 'evidence',
      resourceId: id,
      result,
      // `reason` only — never the URL, never the object key (PRD Nº5 §55).
      metadata: { reason },
    })

  let evidence: EvidenceRow

  try {
    evidence = (await payload.findByID({
      collection: 'evidence',
      id,
      depth: 0,
      overrideAccess: true, // Authorisation is decided below, deliberately.
    })) as unknown as EvidenceRow
  } catch {
    /*
     * PRD Nº5 §86: for restricted material, "no existe" and "no puedes verlo"
     * must be indistinguishable. A 404 here reveals nothing either way.
     */
    await audit('denied', 'Evidencia inexistente o inaccesible.')
    return NextResponse.json({ error: 'No encontrado.' }, { status: 404 })
  }

  const decision = decideEvidenceAccess({
    requester,
    evidence: {
      id: evidence.id,
      classification: evidence.classification,
      status: evidence.status,
      relatedInvestigation: relationId(evidence.relatedInvestigation),
    },
    grants: await loadGrants(payload, requester?.id, evidence.id),
    teams: await loadTeams(payload, relationId(evidence.relatedInvestigation)),
  })

  if (!decision.allowed) {
    await audit('denied', decision.reason)

    // Same shape as the not-found case: the caller learns nothing extra.
    return NextResponse.json({ error: 'No encontrado.' }, { status: 404 })
  }

  if (!isEvidenceStorageConfigured() || !evidence.bucket || !evidence.objectKey) {
    await audit('denied', 'Almacenamiento de evidencia no disponible.')
    return NextResponse.json({ error: 'Servicio no disponible.' }, { status: 503 })
  }

  // Audited before the URL exists — PRD Nº4 §142.
  await audit('allowed', decision.reason)

  try {
    const url = await createDownloadUrl(evidence.bucket, evidence.objectKey, decision.ttlSeconds)

    return NextResponse.json(
      { url, expiresInSeconds: decision.ttlSeconds },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    payload.logger.error({ err: error, evidenceId: id }, 'No se pudo generar la URL de evidencia')
    return NextResponse.json({ error: 'Servicio no disponible.' }, { status: 503 })
  }
}

async function loadGrants(
  payload: Awaited<ReturnType<typeof getPayload>>,
  userId: string | number | undefined,
  evidenceId: string | number,
): Promise<AccessGrant[]> {
  if (!userId) return []

  const result = await payload.find({
    collection: 'evidence-access-grants',
    where: { and: [{ user: { equals: userId } }, { evidence: { equals: evidenceId } }] },
    depth: 0,
    limit: 50,
    overrideAccess: true,
    req: undefined as unknown as PayloadRequest,
  })

  return result.docs.map((doc) => ({
    evidence: relationId((doc as { evidence?: unknown }).evidence) ?? evidenceId,
    user: relationId((doc as { user?: unknown }).user) ?? userId,
    expiresAt: (doc as { expiresAt?: string | null }).expiresAt ?? null,
    revokedAt: (doc as { revokedAt?: string | null }).revokedAt ?? null,
  }))
}

async function loadTeams(
  payload: Awaited<ReturnType<typeof getPayload>>,
  investigationId: string | number | null,
): Promise<TeamMembership[]> {
  if (!investigationId) return []

  const result = await payload.find({
    collection: 'investigation-teams',
    where: { investigation: { equals: investigationId } },
    depth: 0,
    limit: 50,
    overrideAccess: true,
    req: undefined as unknown as PayloadRequest,
  })

  return result.docs.map((doc) => ({
    investigation: investigationId,
    members: ((doc as { members?: unknown[] }).members ?? []).map(
      (member) => relationId(member) as string | number,
    ),
    active: (doc as { active?: boolean }).active,
  }))
}
