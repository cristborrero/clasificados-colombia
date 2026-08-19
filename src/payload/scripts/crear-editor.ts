import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * `pnpm crear:editor` — crea una cuenta de editor si no hay ninguna.
 *
 * Existe porque publicar exige autoridad editorial y un administrador no la
 * tiene: PRD Nº5 §8 separa la administración técnica de la decisión de
 * publicar, y `enforceStatusContract` lo aplica. Un despliegue nuevo, con solo
 * la cuenta de administrador, no puede publicar nada hasta que exista un
 * editor.
 *
 * La contraseña llega por `EDITOR_PASSWORD` y nunca se escribe en el registro
 * ni en el repositorio. Quien la reciba debería cambiarla al primer ingreso.
 *
 * Idempotente: si ya hay un editor activo, no hace nada.
 */

const payload = await getPayload({ config })

const email = process.env.EDITOR_EMAIL ?? 'redaccion@clasificadoscolombia.co'
const password = process.env.EDITOR_PASSWORD

const existentes = await payload.find({
  collection: 'users',
  where: { role: { equals: 'editor' } },
  limit: 1,
  overrideAccess: true,
})

if (existentes.totalDocs > 0) {
  payload.logger.info(`Ya existe una cuenta de editor (${existentes.docs[0]?.email}). No se crea otra.`)
  process.exit(0)
}

if (!password) {
  payload.logger.error('Falta EDITOR_PASSWORD. Pasala por entorno, nunca por argumento.')
  process.exit(1)
}

await payload.create({
  collection: 'users',
  overrideAccess: true,
  data: {
    email,
    password,
    name: 'Redacción',
    role: 'editor',
    status: 'active',
  },
})

payload.logger.info(`Cuenta de editor creada: ${email}`)

process.exit(0)
