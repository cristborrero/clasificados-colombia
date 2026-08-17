import { describe, expect, it } from 'vitest'

import { parseEnv, publicEnvSchema, serverEnvSchema } from './env.schema'

const validServerEnv = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  PAYLOAD_SECRET: 'a'.repeat(32),
}

describe('serverEnvSchema', () => {
  it('accepts the minimum required set and applies defaults', () => {
    const env = parseEnv(serverEnvSchema, validServerEnv, 'server')

    expect(env.NODE_ENV).toBe('development')
    expect(env.SEARCH_SCHEMA_VERSION).toBe(1)
    expect(env.MEDIA_PIPELINE_VERSION).toBe(1)
    expect(env.MINIO_REGION).toBe('us-east-1')
  })

  it('rejects a missing DATABASE_URL', () => {
    const { DATABASE_URL: _omitted, ...withoutDb } = validServerEnv

    expect(() => parseEnv(serverEnvSchema, withoutDb, 'server')).toThrow(/DATABASE_URL/)
  })

  it('rejects a PAYLOAD_SECRET that is too short to be a real secret', () => {
    expect(() =>
      parseEnv(serverEnvSchema, { ...validServerEnv, PAYLOAD_SECRET: 'short' }, 'server'),
    ).toThrow(/at least 32 characters/)
  })

  it('reports every failing key at once rather than one per boot', () => {
    let message = ''

    try {
      parseEnv(serverEnvSchema, {}, 'server')
    } catch (error) {
      message = (error as Error).message
    }

    expect(message).toMatch(/DATABASE_URL/)
    expect(message).toMatch(/PAYLOAD_SECRET/)
  })

  it('treats derived-system config as optional so F0 boots without Meilisearch or MinIO', () => {
    const env = parseEnv(serverEnvSchema, validServerEnv, 'server')

    expect(env.MEILI_HOST).toBeUndefined()
    expect(env.MINIO_ENDPOINT).toBeUndefined()
  })

  it('treats a declared-but-empty optional variable as absent, not as invalid', () => {
    // `FOO=` in .env, an unset Coolify secret and a blank CI variable all
    // arrive as '' rather than undefined. None of them should block boot.
    const env = parseEnv(
      serverEnvSchema,
      { ...validServerEnv, MEILI_INDEXER_KEY: '', MINIO_ACCESS_KEY: '' },
      'server',
    )

    expect(env.MEILI_INDEXER_KEY).toBeUndefined()
    expect(env.MINIO_ACCESS_KEY).toBeUndefined()
  })

  it('still rejects an empty value for a required variable', () => {
    expect(() =>
      parseEnv(serverEnvSchema, { ...validServerEnv, DATABASE_URL: '' }, 'server'),
    ).toThrow(/DATABASE_URL/)
  })

  it('coerces numeric versions supplied as strings, as they arrive from the environment', () => {
    const env = parseEnv(
      serverEnvSchema,
      { ...validServerEnv, SEARCH_SCHEMA_VERSION: '3' },
      'server',
    )

    expect(env.SEARCH_SCHEMA_VERSION).toBe(3)
  })
})

describe('publicEnvSchema', () => {
  it('requires the public server URL', () => {
    expect(() => parseEnv(publicEnvSchema, {}, 'public')).toThrow(/NEXT_PUBLIC_SERVER_URL/)
  })

  it('does not carry any server secret into the public surface', () => {
    const parsed = parseEnv(
      publicEnvSchema,
      { NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000', PAYLOAD_SECRET: 'leaked' },
      'public',
    )

    // Zod strips unknown keys: a secret cannot ride along into client bundles.
    expect(parsed).not.toHaveProperty('PAYLOAD_SECRET')
    expect(Object.keys(parsed)).toEqual(['NEXT_PUBLIC_SERVER_URL'])
  })
})
