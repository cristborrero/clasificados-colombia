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

type SeedCollection = 'categories' | 'authors' | 'people' | 'organizations' | 'topics'

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

  await upsert('topics', 'demo-contratacion', {
    name: 'DEMO · Contratación pública',
    slug: 'demo-contratacion',
    description: 'Tema de prueba. Todo el contenido asociado es ficticio.',
    active: true,
  })
}

/**
 * Globals the frontend shell reads (F8).
 *
 * A fresh install has no `navigation` document, and the header is written to
 * survive that — it renders the logo and nothing else. But "renders nothing"
 * and "renders the wrong thing" look identical in a test, so the seed puts real
 * links in place and the E2E asserts against them.
 *
 * `breaking-news` is seeded switched off. A demo emergency banner shipping
 * enabled is exactly the failure the mandatory `expiresAt` exists to prevent.
 */
/**
 * Demo articles (PRD Nº7 §145-§146).
 *
 * Six published pieces, so the homepage has a hero, a secondary band and a
 * stream to render — an empty front page and a broken front page look the same
 * in a test.
 *
 * §146 requires demo content to be unmistakably fictional. Every headline is
 * prefixed DEMO and none could be mistaken for published journalism.
 *
 * They are created already published, which means passing the F4 publication
 * guards rather than going around them: `factCheckStatus: 'verified'`,
 * `legalStatus: 'not_required'` (none of them names anyone), a byline, and both
 * halves of the ADR-001 status pair set together.
 */
export async function seedArticles(payload: Payload): Promise<void> {
  assertNotProduction()

  const [category, author, editors] = await Promise.all([
    payload.find({
      collection: 'categories',
      where: { slug: { equals: 'demo-politica' } },
      limit: 1,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'authors',
      where: { slug: { equals: 'demo-periodista' } },
      limit: 1,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'users',
      where: { email: { equals: 'editor.jefe@clasificadoscolombia.test' } },
      limit: 1,
      overrideAccess: true,
    }),
  ])

  const categoryId = category.docs[0]?.id
  const authorId = author.docs[0]?.id

  /*
   * The seed publishes *as* the editor in chief, rather than as nobody.
   *
   * `overrideAccess` bypasses access rules but not hooks, and the publication
   * guard in `enforceStatusContract` is a hook on purpose: PRD Nº7 §49 limits
   * publication to editor and editor in chief, and a seed with no user is
   * neither. Making the guard tolerate an absent user would have opened exactly
   * the hole the guard exists to close — every unauthenticated path becomes a
   * publishing path. Passing a real, authorised user keeps the rule intact and
   * proves it works.
   */
  const editorInChief = editors.docs[0]

  if (!categoryId || !authorId) {
    throw new Error('Seed editorial incompleto: faltan la categoría o el autor de demostración.')
  }

  if (!editorInChief) {
    throw new Error('Seed editorial incompleto: falta la editora en jefe que publica las notas.')
  }

  /*
   * A Lexical body with prose and three of the editorial blocks.
   *
   * The first article gets one so the rich-text pipeline is exercised by an
   * end-to-end run rather than only by inspection: a converter that silently
   * renders nothing looks exactly like an article that has no body.
   */
  const paragraph = (text: string) => ({
    type: 'paragraph',
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr',
    children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }],
  })

  const block = (blockType: string, fields: Record<string, unknown>) => ({
    type: 'block',
    version: 2,
    format: '',
    fields: { blockType, ...fields },
  })

  const demoBody = {
    root: {
      type: 'root',
      version: 1,
      format: '',
      indent: 0,
      direction: 'ltr',
      children: [
        paragraph(
          'Este es un cuerpo de demostración. Todo lo que aparece acá es ficticio y existe únicamente para ejercitar el renderizado del texto enriquecido.',
        ),
        block('pullQuote', {
          text: 'Una cita destacada de demostración, para verificar el bloque.',
          attribution: 'Fuente ficticia',
        }),
        paragraph(
          'Un segundo párrafo, para comprobar que el ritmo vertical se aplica desde el contenedor y no bloque por bloque.',
        ),
        block('factBox', {
          title: 'Datos de demostración',
          items: [
            { label: 'Contratos revisados', value: '4.200' },
            { label: 'Periodo', value: '2024–2025' },
          ],
          source: 'Datos ficticios de prueba',
        }),
        block('correctionNotice', {
          type: 'correction',
          date: '2026-08-18T00:00:00.000Z',
          text: 'Corrección de demostración: se ajustó una cifra ficticia.',
        }),
      ],
    },
  }

  const headlines = [
    'DEMO · Los contratos de emergencia que la entidad nunca publicó en el SECOP',
    'DEMO · Renunció el secretario tras la revisión de las actas',
    'DEMO · Qué dicen los 4.200 contratos que revisamos durante ocho meses',
    'DEMO · La respuesta de la entidad, punto por punto',
    'DEMO · Cronología de una adjudicación sin licitación',
    'DEMO · Las preguntas que siguen sin respuesta',
  ]

  for (const [index, title] of headlines.entries()) {
    const slug = `demo-nota-${index + 1}`

    const existing = await payload.find({
      collection: 'articles',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) continue

    await payload.create({
      collection: 'articles',
      overrideAccess: true,
      user: editorInChief,
      data: {
        title,
        slug,
        dek: 'Contenido ficticio de demostración. No corresponde a ningún hecho real.',
        // Only the first piece carries a body: it is the one the rich-text
        // assertions read, and five more copies would slow the seed without
        // proving anything further.
        body: index === 0 ? demoBody : undefined,
        category: categoryId,
        authors: [authorId],
        publication: {
          // Spread over six hours so the chronological stream has a real order
          // rather than six identical timestamps.
          publishedAt: new Date(Date.now() - index * 3_600_000).toISOString(),
        },
        workflow: {
          editorialStatus: 'published',
          factCheckStatus: 'verified',
          legalStatus: 'not_required',
        },
        _status: 'published',
      } as never,
    })
  }
}

/**
 * A demo investigation with its evidence (PRD Nº7 §145-§146).
 *
 * Publishing it exercises the guards rather than avoiding them. It names a
 * person, so PRD Arquitectura §12 requires `legalStatus: 'approved'` — not
 * `not_required` — and it carries a methodology, without which the publish
 * guard refuses outright. If either rule ever stops being enforced, this seed
 * is what starts failing.
 *
 * One piece of evidence is public and approved; one is restricted. The
 * restricted one exists so an end-to-end run can assert it never appears on the
 * public page (PRD Nº8 §88), which is not something an empty database can
 * prove.
 */
export async function seedInvestigations(payload: Payload): Promise<void> {
  assertNotProduction()

  const [author, person, organization, topic, editors] = await Promise.all([
    payload.find({ collection: 'authors', where: { slug: { equals: 'demo-periodista' } }, limit: 1, overrideAccess: true }),
    payload.find({ collection: 'people', where: { slug: { equals: 'demo-persona' } }, limit: 1, overrideAccess: true }),
    payload.find({ collection: 'organizations', where: { slug: { equals: 'demo-entidad' } }, limit: 1, overrideAccess: true }),
    payload.find({ collection: 'topics', where: { slug: { equals: 'demo-contratacion' } }, limit: 1, overrideAccess: true }),
    payload.find({ collection: 'users', where: { email: { equals: 'editor.jefe@clasificadoscolombia.test' } }, limit: 1, overrideAccess: true }),
  ])

  const authorId = author.docs[0]?.id
  const personId = person.docs[0]?.id
  const organizationId = organization.docs[0]?.id
  const topicId = topic.docs[0]?.id
  const editorInChief = editors.docs[0]

  if (!authorId || !personId || !organizationId || !topicId || !editorInChief) {
    throw new Error('Seed de investigación incompleto: faltan referencias de demostración.')
  }

  const slug = 'demo-investigacion-contratos'

  const existing = await payload.find({
    collection: 'investigations',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })

  const investigationId =
    existing.docs[0]?.id ??
    (
      await payload.create({
        collection: 'investigations',
        overrideAccess: true,
        user: editorInChief,
        data: {
          title: 'DEMO · Los contratos que nadie quiso explicar',
          slug,
          summary:
            'Investigación de demostración. Todos los hechos, cifras y nombres son ficticios y existen solo para probar la plantilla.',
          authors: [authorId],
          topics: [topicId],
          people: [personId],
          organizations: [organizationId],
          publication: { publishedAt: new Date().toISOString() },
          keyFindings: [
            {
              headline: 'Hallazgo ficticio número uno, para probar la numeración.',
              description: 'Detalle de demostración.',
            },
            { headline: 'Hallazgo ficticio número dos.' },
          ],
          chapters: [
            {
              title: 'Capítulo de demostración',
              slug: 'capitulo-demo',
              intro: 'Entrada ficticia del capítulo.',
            },
            {
              title: 'Segundo capítulo de demostración',
              slug: 'capitulo-demo-2',
            },
          ],
          timeline: [
            {
              date: '2025-03-04T00:00:00.000Z',
              title: 'Evento ficticio de la cronología',
              description: 'Detalle de demostración.',
            },
          ],
          methodology:
            'Metodología de demostración. Se describiría acá cómo se obtuvieron y verificaron los datos.',
          workflow: {
            editorialStatus: 'published',
            factCheckStatus: 'verified',
            // Menciona personas: PRD Arquitectura §12 exige aprobación explícita.
            legalStatus: 'approved',
          },
          _status: 'published',
        } as never,
      })
    ).id

  const evidenceFixtures = [
    {
      title: 'DEMO · Contrato 2025-0431',
      classification: 'public',
      status: 'approved',
      documentType: 'Contrato',
      institution: 'DEMO Entidad Pública',
      documentDate: '2025-11-03T00:00:00.000Z',
      pageCount: 18,
      description: 'Documento público de demostración.',
    },
    {
      title: 'DEMO · Expediente reservado',
      classification: 'restricted',
      status: 'approved',
      documentType: 'Expediente',
      institution: 'DEMO Entidad Pública',
      description: 'NO DEBE APARECER EN EL FRONTEND PÚBLICO.',
    },
  ] as const

  for (const fixture of evidenceFixtures) {
    const found = await payload.find({
      collection: 'evidence',
      where: { title: { equals: fixture.title } },
      limit: 1,
      overrideAccess: true,
    })

    if (found.totalDocs > 0) continue

    await payload.create({
      collection: 'evidence',
      overrideAccess: true,
      user: editorInChief,
      data: {
        ...fixture,
        objectKey: `demo/${fixture.title.replace(/\W+/g, '-').toLowerCase()}.pdf`,
        relatedInvestigation: investigationId,
      } as never,
    })
  }
}

export async function seedGlobals(payload: Payload): Promise<void> {
  assertNotProduction()

  const category = await payload.find({
    collection: 'categories',
    where: { slug: { equals: 'demo-politica' } },
    limit: 1,
    overrideAccess: true,
  })

  const categoryId = category.docs[0]?.id

  await payload.updateGlobal({
    slug: 'site-settings',
    overrideAccess: true,
    data: {
      siteName: 'Clasificados Colombia',
      siteDescription: 'Investigamos. Informamos. No callamos.',
      contact: {
        email: 'redaccion@clasificadoscolombia.test',
        address: 'Bogotá, Colombia',
      },
    },
  })

  await payload.updateGlobal({
    slug: 'navigation',
    overrideAccess: true,
    data: {
      primary: categoryId
        ? [{ label: 'DEMO · Política', linkType: 'internal', category: categoryId }]
        : [],
      secondary: [{ label: 'Quiénes somos', linkType: 'external', url: '/quienes-somos' }],
      footer: [
        {
          title: 'El medio',
          links: [{ label: 'Quiénes somos', linkType: 'external', url: '/quienes-somos' }],
        },
      ],
      social: [{ platform: 'Bluesky', url: 'https://bsky.app' }],
    },
  })

  await payload.updateGlobal({
    slug: 'breaking-news',
    overrideAccess: true,
    data: {
      enabled: false,
      severity: 'breaking',
      headline: 'DEMO · Titular de última hora',
      startsAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    },
  })
}

export async function seedAll(payload: Payload): Promise<void> {
  await seedUsers(payload)
  await seedEditorial(payload)
  await seedArticles(payload)
  await seedInvestigations(payload)
  await seedGlobals(payload)
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

  const navigation = (await payload.findGlobal({
    slug: 'navigation',
    depth: 0,
    overrideAccess: true,
  })) as { primary?: unknown[] | null }

  if (!navigation.primary || navigation.primary.length === 0) {
    throw new Error('Seed incompleto: la navegación principal quedó vacía.')
  }

  const published = await payload.find({
    collection: 'articles',
    where: { _status: { equals: 'published' } },
    limit: 0,
    overrideAccess: true,
  })

  if (published.totalDocs === 0) {
    throw new Error('Seed incompleto: no quedó ninguna nota publicada para la portada.')
  }

  const investigations = await payload.find({
    collection: 'investigations',
    where: { slug: { equals: 'demo-investigacion-contratos' } },
    limit: 1,
    overrideAccess: true,
  })

  if (investigations.totalDocs === 0) {
    throw new Error('Seed incompleto: falta la investigación de demostración.')
  }
}
