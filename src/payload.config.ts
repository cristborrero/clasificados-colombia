import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { es } from '@payloadcms/translations/languages/es'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { serverEnv } from './env'
import { getUser, hasRole } from './payload/access/helpers'
import { syncSearchTask } from './payload/jobs/tasks/syncSearch'
import { AuditEvents } from './payload/collections/AuditEvents'
import { Authors } from './payload/collections/Authors'
import { Categories } from './payload/collections/Categories'
import { Corrections } from './payload/collections/Corrections'
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

/**
 * Outgoing mail.
 *
 * Returns `undefined` when SMTP is not configured, which makes Payload fall
 * back to printing mail to the console. That is correct in development and an
 * honest degradation in production — the alternative, refusing to boot, would
 * take the whole site down over a feature most readers never touch.
 *
 * It is not free, though: without mail there is no password reset, so every
 * forgotten password becomes a console intervention on the server. The warning
 * below exists so that shows up in the logs instead of being discovered by an
 * editor who is locked out.
 */
function buildEmailAdapter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_ADDRESS, SMTP_FROM_NAME } =
    serverEnv

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM_ADDRESS) {
    console.warn(
      '[email] SMTP sin configurar: el correo se escribirá en consola y la ' +
        'recuperación de contraseña no funcionará.',
    )

    return undefined
  }

  const port = SMTP_PORT ?? 587

  return nodemailerAdapter({
    defaultFromAddress: SMTP_FROM_ADDRESS,
    defaultFromName: SMTP_FROM_NAME ?? 'Clasificados Colombia',
    transportOptions: {
      host: SMTP_HOST,
      port,
      /*
       * 465 is implicit TLS; anything else negotiates STARTTLS. Getting this
       * backwards produces a connection that hangs rather than one that fails,
       * which is a much worse way to find out.
       */
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    },
  })
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '· Clasificados Colombia',
    },
    components: {
      /*
       * Failed background work, where the newsroom will see it. A dead
       * `syncSearch` means a published piece is missing from search, and the
       * person who notices that is an editor, not whoever reads server logs.
       * Renders nothing when the queue is healthy.
       */
      beforeDashboard: ['@/payload/components/SearchHealth#SearchHealth'],
    },
  },

  /**
   * Admin panel language (PRD Nº7 §124).
   *
   * Spanish only, and that is deliberate rather than lazy.
   *
   * The first attempt listed `{ es, en }` with `fallbackLanguage: 'es'`, on the
   * assumption that Spanish would be the default and each account could pick
   * English from its profile. Both halves were wrong, and testing against the
   * running panel is what showed it:
   *
   *   · `fallbackLanguage` is a *fallback* — the language used when nothing
   *     else resolves — not a default. With English listed as supported, a
   *     browser sending `Accept-Language: en` got an English panel.
   *   · Payload 3.88 does not honour a stored `locale` preference for the admin
   *     interface. Writing `payload-preferences/locale = es` succeeds, reads
   *     back correctly, and changes nothing: the header still wins.
   *
   * So the only reliable way to give a Colombian newsroom a Spanish panel is to
   * not offer anything else. An unsupported `Accept-Language` falls through to
   * `es`, which is now the only option.
   *
   * If English is ever genuinely needed, add it back here and expect the
   * browser to decide — not the user.
   *
   * This translates Payload's own interface. The field labels and descriptions
   * in this codebase were already written in Spanish, which is why the result
   * reads as one language rather than as a half-translated panel.
   */
  i18n: {
    supportedLanguages: { es },
    fallbackLanguage: 'es',
  },

  email: buildEmailAdapter(),

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
    Corrections,
    AuditEvents,
    Tips,
  ],

  globals: [SiteSettings, Navigation, Homepage, BreakingNews],

  /**
   * Background work (CLAUDE.md §56, PRD Nº7 §168, F18).
   *
   * The classification the PRD asks for is expressed by where work lives, not
   * by a label on it. Anything that must abort the operation — workflow
   * authorisation, the status contract, the rights check — runs inline in
   * `beforeChange` and throws. Anything derived — the search index, cache
   * hints, notifications — is queued here and can fail, retry and be reported
   * without an editor ever seeing it.
   *
   * `autoRun` polls this process. That is appropriate precisely because this is
   * not serverless: one long-lived Node process owns both the CMS and the
   * queue, which is the same "three containers you can reason about" the
   * architecture is built around. On a serverless platform this would have to
   * become an external scheduler hitting the run endpoint.
   */
  jobs: {
    tasks: [syncSearchTask],

    /*
     * Failed jobs are kept. Deleting on completion would also delete the record
     * of what went wrong, and "jobs that die are recorded and alerted, not lost
     * in silence" is the point of having a queue at all.
     */
    deleteJobOnComplete: false,

    autoRun: [
      {
        /*
         * Six fields: every five seconds. A newsroom publishing a story expects
         * it to be searchable in seconds, not minutes — and polling every
         * second would be a query per second for the entire life of the process
         * to serve a queue that is empty almost all of the time.
         */
        cron: '*/5 * * * * *',
        limit: 20,
        queue: 'default',
      },
    ],

    /*
     * Only staff may drive the queue by hand. The jobs themselves run as the
     * process, not as a user; this governs the admin and REST surfaces.
     */
    access: {
      run: ({ req }) => hasRole(getUser(req), ['admin', 'editor']),
      queue: ({ req }) => hasRole(getUser(req), ['admin', 'editor']),
      cancel: ({ req }) => hasRole(getUser(req), ['admin']),
    },

    /**
     * The queue itself is not readable by everyone with an account.
     *
     * Payload's default lets any authenticated user list `payload-jobs`, and an
     * author could — verified against the running API, not assumed. A job row
     * carries the collection and id of whatever changed, so the queue is a live
     * feed of which unpublished pieces exist and when they were touched. PRD
     * Master §93 puts drafts and internal notes outside what a reader may learn
     * of; an author reading the roster of every editor's work in progress is
     * the same leak wearing a different name.
     */
    jobsCollectionOverrides: ({ defaultJobsCollection }) => ({
      ...defaultJobsCollection,
      admin: {
        ...defaultJobsCollection.admin,
        group: 'OPERATIONS',
      },
      access: {
        ...defaultJobsCollection.access,
        read: ({ req }) => hasRole(getUser(req), ['admin', 'editor']),
        create: ({ req }) => hasRole(getUser(req), ['admin', 'editor']),
        update: ({ req }) => hasRole(getUser(req), ['admin', 'editor']),
        delete: ({ req }) => hasRole(getUser(req), ['admin']),
      },
    }),
  },

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
