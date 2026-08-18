import type { Payload } from 'payload'

/**
 * Development seed (PRD Nº7 §145-§146).
 *
 * Exposed as plain functions taking a `Payload` instance rather than as scripts
 * that boot their own. Both the CLI wrappers and the E2E global setup call
 * these, so there is exactly one definition of what a seeded database contains
 * — and the test harness does not depend on spawning child processes whose
 * failure it cannot see.
 *
 * Idempotent by design: re-running costs nothing and repairs a database that a
 * destructive assertion left short of a record.
 *
 * PRD Nº7 §146 requires demo content to be unmistakably fictional. Every record
 * here is prefixed DEMO and none could be confused with published journalism.
 */

export const DEV_PASSWORD = 'clasificados-dev-password'

const SEED_USERS = [
  {
    email: 'admin@clasificadoscolombia.test',
    name: 'Administrador de desarrollo',
    role: 'administrator',
    status: 'active',
  },
  {
    email: 'editor.jefe@clasificadoscolombia.test',
    name: 'Editora en jefe de desarrollo',
    role: 'editor_in_chief',
    status: 'active',
  },
  {
    email: 'reportero@clasificadoscolombia.test',
    name: 'Reportero de desarrollo',
    role: 'reporter',
    status: 'active',
  },
  {
    email: 'deshabilitado@clasificadoscolombia.test',
    name: 'Cuenta deshabilitada de desarrollo',
    role: 'reporter',
    status: 'disabled',
  },
] as const

function assertNotProduction(): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The seed is a development utility and must never run against production.')
  }
}

export async function seedUsers(payload: Payload): Promise<void> {
  assertNotProduction()

  for (const user of SEED_USERS) {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: user.email } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) continue

    await payload.create({
      collection: 'users',
      data: { ...user, password: DEV_PASSWORD },
      overrideAccess: true,
    })
  }
}

type SeedCollection = 'categories' | 'authors' | 'people' | 'organizations'

export async function seedEditorial(payload: Payload): Promise<void> {
  assertNotProduction()

  const upsert = async (
    collection: SeedCollection,
    slug: string,
    data: Record<string, unknown>,
  ): Promise<void> => {
    const existing = await payload.find({
      collection,
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) return

    await payload.create({ collection, data: data as never, overrideAccess: true })
  }

  await upsert('categories', 'demo-politica', {
    name: 'DEMO · Política',
    slug: 'demo-politica',
    description: 'Sección de prueba. CONTENIDO FICTICIO.',
    active: true,
  })

  await upsert('authors', 'demo-periodista', {
    name: 'DEMO Periodista de Prueba',
    slug: 'demo-periodista',
    jobTitle: 'Reportero (contenido ficticio)',
    active: true,
  })

  await upsert('people', 'demo-persona', {
    name: 'DEMO Persona Mencionada',
    slug: 'demo-persona',
    roleDescription: 'Cargo ficticio (contenido de prueba)',
    active: true,
  })

  await upsert('organizations', 'demo-entidad', {
    name: 'DEMO Entidad Pública',
    slug: 'demo-entidad',
    organizationType: 'government',
    active: true,
  })
}

export async function seedAll(payload: Payload): Promise<void> {
  await seedUsers(payload)
  await seedEditorial(payload)
}

/** Fixtures the E2E suite depends on existing. */
const REQUIRED_FIXTURES = [
  { collection: 'categories', slug: 'demo-politica' },
  { collection: 'authors', slug: 'demo-periodista' },
  { collection: 'people', slug: 'demo-persona' },
  { collection: 'organizations', slug: 'demo-entidad' },
] as const

/**
 * Fails loudly when the seed did not produce what the tests need.
 *
 * Runs in the same process that did the seeding, deliberately. Verifying over
 * HTTP from the test harness looked equivalent and was not: Playwright runs
 * `globalSetup` before starting its `webServer`, so those checks were answered
 * by whatever server happened to already be listening — which is how a seed
 * that had genuinely worked could still be reported as missing.
 */
export async function verifySeed(payload: Payload): Promise<void> {
  for (const { collection, slug } of REQUIRED_FIXTURES) {
    const found = await payload.find({
      collection,
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })

    if (found.totalDocs === 0) {
      throw new Error(`Seed incompleto: falta ${collection}/${slug}.`)
    }
  }
}
