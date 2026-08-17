import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * Idempotent development seed for internal accounts (PRD Nº7 §145).
 *
 * Development only. Real accounts are created by an administrator through the
 * admin panel; these exist so the access-control behaviour can be exercised
 * without inventing users by hand every time the database is rebuilt.
 *
 * Passwords are fixed and obviously non-secret on purpose — this must never be
 * pointed at anything but a local database. PRD Nº4 §62 forbids seeding real
 * user data into non-production environments.
 */

const DEV_PASSWORD = 'clasificados-dev-password'

const seedUsers = [
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

async function seedDevUsers(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('seed-users is a development utility and must never run against production.')
  }

  const payload = await getPayload({ config })

  for (const user of seedUsers) {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: user.email } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      payload.logger.info(`· ${user.email} ya existe`)
      continue
    }

    await payload.create({
      collection: 'users',
      data: { ...user, password: DEV_PASSWORD },
      overrideAccess: true,
    })

    payload.logger.info(`✓ creado ${user.email} (${user.role}, ${user.status})`)
  }

  payload.logger.info('Seed de usuarios completado.')
}

// `payload run` executes the module rather than calling its default export.
await seedDevUsers()

export default seedDevUsers
