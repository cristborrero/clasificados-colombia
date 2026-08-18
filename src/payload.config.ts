import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { en } from '@payloadcms/translations/languages/en'
import { es } from '@payloadcms/translations/languages/es'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { serverEnv } from './env'
import { AuditEvents } from './payload/collections/AuditEvents'
import { Authors } from './payload/collections/Authors'
import { Categories } from './payload/collections/Categories'
import { DataStories } from './payload/collections/DataStories'
import { EvidenceDocuments } from './payload/collections/EvidenceDocuments'
import { Tips } from './payload/collections/Tips'
import { Topics } from './payload/collections/Topics'
import { Articles } from './payload/collections/Articles'
import { Investigations } from './payload/collections/Investigations'
import { Media } from './payload/collections/Media'
import { Opinions } from './payload/collections/Opinions'
import { Organizations } from './payload/collections/Organizations'
import { People } from './payload/collections/People'
import { Redirects } from './payload/collections/Redirects'
import { Sources } from './payload/collections/Sources'
import { Users } from './payload/collections/Users'
import { BreakingNews } from './payload/globals/BreakingNews'
import { Homepage } from './payload/globals/Homepage'
import { Navigation } from './payload/globals/Navigation'
import { SiteSettings } from './payload/globals/SiteSettings'
import { VideoStories } from './payload/collections/VideoStories'

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

  /**
   * Admin panel language (PRD Nº7 §124).
   *
   * Spanish by default, because the people using this panel every day are a
   * Colombian newsroom. English stays available so the interface is not a
   * barrier for anyone who prefers it — each account picks its own language
   * from their profile, and the choice is remembered.
   *
   * This only translates Payload's own interface. The field labels and
   * descriptions in this codebase were already written in Spanish, which is why
   * the result reads as one language rather than as a half-translated panel.
   */
  i18n: {
    supportedLanguages: { es, en },
    fallbackLanguage: 'es',
  },

  /*
   * Order shapes the admin sidebar within each group. Newsroom reference data
   * before the content that points at it (PRD Nº7 §123).
   */
  collections: [
    Users,
    Authors,
    Categories,
    Topics,
    People,
    Organizations,
    Media,
    Articles,
    Investigations,
    Opinions,
    DataStories,
    VideoStories,
    Sources,
    EvidenceDocuments,
    Redirects,
    AuditEvents,
    Tips,
  ],

  globals: [SiteSettings, Navigation, Homepage, BreakingNews],

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
