import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { serverEnv } from './env'
import { Authors } from './payload/collections/Authors'
import { Categories } from './payload/collections/Categories'
import { Topics } from './payload/collections/Topics'
import { Users } from './payload/collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '· Clasificados Colombia',
    },
  },

  /*
   * Order shapes the admin sidebar within each group. Newsroom reference data
   * before the content that points at it (PRD Nº7 §123).
   */
  collections: [Users, Authors, Categories, Topics],

  globals: [],

  editor: lexicalEditor(),

  secret: serverEnv.PAYLOAD_SECRET,

  db: postgresAdapter({
    pool: {
      connectionString: serverEnv.DATABASE_URL,
    },
    /*
     * Explicit migrations only (PRD Nº7 §133). Production must never rely on
     * automatic schema drift. `push` is disabled outside development so that a
     * missing migration fails loudly instead of silently mutating the schema.
     */
    push: serverEnv.NODE_ENV === 'development',
    migrationDir: path.resolve(dirname, 'payload/migrations'),
  }),

  /*
   * GraphQL is disabled deliberately.
   *
   * PRD Nº7 §161: "Evaluar si realmente se necesita. Si frontend usa Local API
   * server-side, GraphQL puede permanecer sin papel relevante."
   * PRD Nº7 §160: "Si una API no es necesaria públicamente: restringirla."
   *
   * The frontend consumes Payload through the Local API server-side (§162), so
   * GraphQL adds attack surface without adding capability. Re-enabling it is a
   * deliberate decision that needs an ADR, not a default.
   */
  graphQL: {
    disable: true,
  },

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  sharp,
})
