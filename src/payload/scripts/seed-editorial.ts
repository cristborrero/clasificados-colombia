import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * Idempotent development seed for editorial reference data (PRD Nº7 §145).
 *
 * Creates the minimum an article needs to exist: a section and a byline.
 * Articles themselves are created by the tests that exercise them, so each test
 * controls the exact state it is asserting against.
 *
 * PRD Nº7 §146 requires demo content to be unmistakably fictional. Nothing here
 * is a real person or a real section slug that could be confused with published
 * journalism.
 */
async function seedEditorial(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'seed-editorial is a development utility and must never run against production.',
    )
  }

  const payload = await getPayload({ config })

  const category = await upsert('categories', 'demo-politica', {
    name: 'DEMO · Política',
    slug: 'demo-politica',
    description: 'Sección de prueba. CONTENIDO FICTICIO.',
    active: true,
  })

  const author = await upsert('authors', 'demo-periodista', {
    name: 'DEMO Periodista de Prueba',
    slug: 'demo-periodista',
    jobTitle: 'Reportero (contenido ficticio)',
    active: true,
  })

  payload.logger.info(`Seed editorial listo · categoría=${category} autor=${author}`)

  async function upsert(
    collection: 'categories' | 'authors',
    slug: string,
    data: Record<string, unknown>,
  ): Promise<string | number> {
    const existing = await payload.find({
      collection,
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })

    const found = existing.docs[0]
    if (found) return found.id

    const created = await payload.create({
      collection,
      data: data as never,
      overrideAccess: true,
    })

    return created.id
  }
}

// `payload run` executes the module rather than calling its default export.
await seedEditorial()

export default seedEditorial
