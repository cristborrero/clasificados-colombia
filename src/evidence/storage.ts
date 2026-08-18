import { Client } from 'minio'

import { serverEnv } from '@/env'
import { BUCKET_BY_CLASSIFICATION, type Classification } from './authorization'

/**
 * MinIO adapter for the Evidence Vault (PRD Nº4 §20-§32, PRD Nº5 §35-§39).
 *
 * Thin on purpose: the decision of *whether* someone may reach a file lives in
 * `authorization.ts` as pure logic. This module only knows how to mint a
 * short-lived URL once that decision has already been made.
 *
 * Two rules this file exists to keep:
 *
 *   · Credentials never leave the server (PRD Nº5 §37). The browser receives a
 *     time-limited URL and never a key.
 *   · No presigned URL is ever stored (PRD Nº4 §26). Payload keeps `bucket` and
 *     `objectKey`; the URL is minted per request and dies shortly after.
 *
 * PRD Nº5 §39 and §131 are worth restating because they shape everything here:
 * a presigned URL that has been handed out cannot be revoked. Its expiry is the
 * only control that actually exists, which is why restricted files get sixty
 * seconds rather than an hour.
 */

let client: Client | null = null

export class EvidenceStorageUnavailable extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EvidenceStorageUnavailable'
  }
}

/**
 * Lazily builds the client.
 *
 * Lazy rather than at module load so that the rest of the application boots
 * without MinIO configured — evidence is one feature, and an unset
 * `MINIO_ENDPOINT` should disable it rather than prevent the newsroom from
 * publishing.
 */
export function getEvidenceClient(): Client {
  if (client) return client

  const { MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_REGION } = serverEnv

  if (!MINIO_ENDPOINT || !MINIO_ACCESS_KEY || !MINIO_SECRET_KEY) {
    throw new EvidenceStorageUnavailable(
      'El almacenamiento de evidencia no está configurado (MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY).',
    )
  }

  const url = new URL(MINIO_ENDPOINT)

  client = new Client({
    endPoint: url.hostname,
    port: url.port ? Number(url.port) : url.protocol === 'https:' ? 443 : 80,
    useSSL: url.protocol === 'https:',
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
    region: MINIO_REGION,
  })

  return client
}

export function isEvidenceStorageConfigured(): boolean {
  const { MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY } = serverEnv
  return Boolean(MINIO_ENDPOINT && MINIO_ACCESS_KEY && MINIO_SECRET_KEY)
}

export function bucketFor(classification: Classification): string {
  return BUCKET_BY_CLASSIFICATION[classification]
}

/**
 * Mints a short-lived download URL.
 *
 * Never call this before `decideEvidenceAccess` has allowed the request, and
 * never before the audit event has been recorded (PRD Nº5 §38 fixes that
 * order: authorise, audit, then generate).
 */
export async function createDownloadUrl(
  bucket: string,
  objectKey: string,
  ttlSeconds: number,
): Promise<string> {
  return getEvidenceClient().presignedGetObject(bucket, objectKey, ttlSeconds)
}

/**
 * Mints a short-lived upload URL (PRD Nº5 §64).
 *
 * The server verifies the object and records its checksum after the upload
 * completes; a client-supplied checksum proves nothing.
 */
export async function createUploadUrl(
  bucket: string,
  objectKey: string,
  ttlSeconds: number,
): Promise<string> {
  return getEvidenceClient().presignedPutObject(bucket, objectKey, ttlSeconds)
}

/** Confirms an object exists and returns what the server can verify about it. */
export async function statObject(
  bucket: string,
  objectKey: string,
): Promise<{ size: number; etag: string } | null> {
  try {
    const stat = await getEvidenceClient().statObject(bucket, objectKey)
    return { size: stat.size, etag: stat.etag }
  } catch {
    return null
  }
}
