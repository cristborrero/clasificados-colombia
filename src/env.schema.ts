import { z } from 'zod'

/**
 * Environment schemas — pure, side-effect free, therefore testable.
 *
 * `src/env.ts` is what actually parses `process.env`. Keeping the schemas here
 * means a test can assert the contract without booting the app or needing a
 * real environment.
 *
 * Security boundary (PRD Nº4 §56-§59, PRD Master §51): every value below except
 * the `NEXT_PUBLIC_`-prefixed ones is server-only and must never reach the
 * browser — DATABASE_URL, PAYLOAD_SECRET, MEILI_* and MINIO_* above all.
 */

/**
 * An optional variable that may legitimately arrive as an empty string.
 *
 * `FOO=` in a `.env` file, an unset Coolify secret and a blank CI variable all
 * surface as `''`, not `undefined`. Plain `.optional()` rejects those, which
 * would block boot over a variable that is not even in use yet. Empty is
 * treated as absent; a non-empty value must still be meaningful.
 */
const optionalString = () =>
  z.preprocess((value) => (value === '' ? undefined : value), z.string().min(1).optional())

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Postgres — Payload's canonical store.
  DATABASE_URL: z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() !== ''
        ? value
        : 'postgresql://build:build@localhost:5432/build',
    z.string().min(1, 'DATABASE_URL is required'),
  ),

  // Payload session/encryption secret.
  PAYLOAD_SECRET: z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim().length >= 32
        ? value
        : 'build-time-placeholder-value-not-used-at-runtime-32chars',
    z
      .string()
      .min(32, 'PAYLOAD_SECRET must be at least 32 characters — generate a random value'),
  ),

  /*
   * Derived systems. Optional because they are not wired yet — Meilisearch
   * lands in F14, MinIO in F6. Declared now so the contract is visible from day
   * one and `.env.example` stays authoritative rather than aspirational.
   */
  MEILI_HOST: optionalString(),
  MEILI_MASTER_KEY: optionalString(),
  MEILI_INDEXER_KEY: optionalString(),
  SEARCH_SCHEMA_VERSION: z.coerce.number().int().positive().default(1),

  MINIO_ENDPOINT: optionalString(),
  MINIO_ACCESS_KEY: optionalString(),
  MINIO_SECRET_KEY: optionalString(),
  MINIO_REGION: z.string().min(1).default('us-east-1'),

  MEDIA_PIPELINE_VERSION: z.coerce.number().int().positive().default(1),

  /*
   * Outgoing mail.
   *
   * Optional on purpose: without it Payload falls back to writing mail to the
   * console, which is the right behaviour in development and an explicit,
   * visible degradation in production rather than a crash on boot.
   *
   * What it costs when absent is not cosmetic, though — password reset stops
   * working, so every forgotten password becomes a console intervention on the
   * server. `src/payload.config.ts` logs a warning when it is missing.
   */
  SMTP_HOST: optionalString(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: optionalString(),
  SMTP_PASS: optionalString(),
  SMTP_FROM_ADDRESS: optionalString(),
  SMTP_FROM_NAME: optionalString(),

  /*
   * Anti-abuse on the public tip form.
   *
   * The endpoint fails closed without the secret — see
   * `src/lib/antiabuse/turnstile.ts` for why that is the safer direction.
   */
  TURNSTILE_SECRET_KEY: optionalString(),

  /*
   * Indexación, bloqueada por defecto.
   *
   * Un sitio con material de muestra no puede rastrearse: esas piezas quedarían
   * indexadas bajo esta cabecera, y un resultado de búsqueda que atribuya a este
   * medio algo que nunca publicó es peor que un sitio vacío.
   *
   * Variable de servidor, no `NEXT_PUBLIC_`. Las públicas se hornean en el build
   * — activar la indexación exigiría recompilar y desplegar de nuevo. Así basta
   * cambiarla y reiniciar, que es lo que hace falta el día del lanzamiento.
   */
  ALLOW_INDEXING: optionalString(),
})

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SERVER_URL: z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() !== ''
        ? value
        : 'https://clasificadoscolombia.co',
    z.string().min(1, 'NEXT_PUBLIC_SERVER_URL is required'),
  ),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>
export type PublicEnv = z.infer<typeof publicEnvSchema>

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n')
}

/**
 * Parses `source` or throws with every failing key listed at once.
 *
 * Reporting all issues together is deliberate: discovering six missing
 * variables one boot at a time is a bad first-run experience.
 */
export function parseEnv<T extends z.ZodType>(
  schema: T,
  source: unknown,
  label: string,
): z.infer<T> {
  const result = schema.safeParse(source)

  if (!result.success) {
    throw new Error(`Invalid ${label} environment:\n${formatIssues(result.error)}`)
  }

  return result.data
}
