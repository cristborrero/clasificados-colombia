import { AuthenticationError, type CollectionConfig } from 'payload'

import {
  adminFieldOnly,
  adminOnly,
  adminOrSelf,
  getUser,
  isActive,
  systemFieldOnly,
} from '@/payload/access/helpers'
import {
  canAuthenticate,
  roleOptions,
  userStatusOptions,
  type Role,
  type UserStatus,
} from '@/payload/access/roles'

/**
 * Users — internal accounts (PRD Nº7 §6-§10, PRD Nº5 §5).
 *
 * Deliberately separate from `Authors` (PRD Nº7 §11): not every byline needs a
 * CMS login, and not every internal account should appear as an author.
 * `Authors` arrives in F4.
 *
 * Access control is complete for this collection as of F3. The rows of the
 * Role × Resource × Operation × Status matrix that concern `Articles` and
 * `Evidence` arrive with those collections (F4, F5, F6), because a matrix
 * cannot assert against resources that do not exist yet.
 *
 * Verified through the REST API rather than the admin UI, per PRD Nº5 §96 and
 * §111 — see `e2e/access-matrix.spec.ts`.
 */

export const Users: CollectionConfig = {
  slug: 'users',

  /**
   * DENY BY DEFAULT (PRD Nº5 §2, PRD Nº7 §11).
   *
   * Every operation is declared. Payload's defaults let any authenticated user
   * read, update and delete — which meant a reporter could delete the
   * administrator through the REST API. Relying on defaults for a collection
   * that holds accounts and roles is not an oversight to fix later; it is the
   * whole vulnerability.
   */
  access: {
    /** PRD Nº7 §9: only an administrator creates accounts. */
    create: adminOnly,

    /**
     * PRD Nº7 §9: administrator reads all, everyone else reads their own
     * document. Returns a filter rather than a boolean (PRD Nº7 §106) so that
     * other people's records are never loaded — a list endpoint that fetches
     * everything and then hides it still leaks how many accounts exist.
     *
     * The PRD also anticipates editorial roles needing limited public
     * information about colleagues "cuando el workflow lo requiera". That
     * carve-out arrives with the assignment fields in F4; inventing its shape
     * now would mean guessing.
     */
    read: adminOrSelf,

    /**
     * Administrator updates anyone; everyone else only themselves — and only
     * the non-security fields, which the field-level rules below enforce.
     */
    update: adminOrSelf,

    /**
     * PRD Nº7 §9 and PRD Nº5 §15: avoid hard deletes, prefer
     * `status = disabled`. Restricted to administrators, and even then it is
     * the wrong tool — disabling preserves the audit trail that deletion
     * destroys.
     */
    delete: adminOnly,

    /**
     * Who may open the admin panel at all.
     *
     * Checks `isActive`, not merely authentication: a token issued before an
     * account was suspended must stop working (PRD Nº5 §82-§83). `beforeLogin`
     * blocks new sessions; this blocks surviving ones.
     */
    admin: ({ req }) => isActive(getUser(req)),

    /** PRD Nº5 §75: API keys are subject to the same rules, never above them. */
    unlock: adminOnly,
  },

  auth: {
    /*
     * PRD Nº5 §77 / PRD Nº4 §99: authentication needs rate limiting, lockouts
     * and secure cookies. `maxLoginAttempts` and `lockTime` are Payload's
     * native brute-force control (PRD Nº5 §103).
     */
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // 10 minutes
    tokenExpiration: 8 * 60 * 60, // 8 hours — PRD Nº5 §79
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'status'],
    // Admin grouping per PRD Nº7 §123.
    group: 'SECURITY',
    description:
      'Cuentas internas del sistema editorial. Cada persona debe tener su propia cuenta; nunca se comparten (PRD Nº4 §96).',
  },

  hooks: {
    /**
     * PRD Nº5 §82: a disabled account must not be able to log in.
     *
     * Payload has no native notion of an inactive account, so without this the
     * `status` field would be decoration — someone leaves the newsroom, an
     * editor marks them disabled, and their session still works.
     *
     * Throws `AuthenticationError`, not a bare `Error`. A bare throw surfaces as
     * HTTP 500 "Something went wrong", which is wrong twice over: it tells the
     * operator the server broke when nothing did, and it makes a disabled
     * account distinguishable from a wrong password by status code alone —
     * precisely the enumeration signal PRD Nº5 §86 and §130 warn about.
     *
     * `AuthenticationError` maps to 401 with the same body a failed password
     * produces, so from outside the two cases are indistinguishable.
     *
     * It is constructed with `req.t` — the same translator the login operation
     * itself uses — and not bare. Bare, it resolves through a different path and
     * answered in Spanish while a genuine wrong password answered in English:
     * two identical 401s whose bodies differed, which is exactly the
     * enumeration signal this hook exists to deny. Sharing the translator makes
     * the two bodies identical whatever language is negotiated.
     */
    beforeLogin: [
      ({ req, user }) => {
        const status = (user as { status?: UserStatus }).status

        if (!status || !canAuthenticate(status)) {
          throw new AuthenticationError(req.t)
        }

        return user
      },
    ],

    /**
     * Security telemetry (PRD Nº5 §5). Never blocks the login itself.
     *
     * `req` is passed deliberately, and it is load-bearing. Omitting it makes
     * Payload open a *second* transaction for this write, which then waits on
     * the row lock the in-flight login transaction is still holding on the very
     * same user — the login hangs until something times out.
     *
     * This is exactly the situation PRD Nº7 §102 describes: writes that must be
     * atomic have to travel on the same request/transaction rather than being
     * issued alongside it.
     */
    afterLogin: [
      async ({ req, user }) => {
        try {
          await req.payload.update({
            collection: 'users',
            id: user.id,
            data: { lastLoginAt: new Date().toISOString() },
            overrideAccess: true,
            req,
            // Prevents this write from re-entering hooks (PRD Nº7 §101).
            context: { skipUserAudit: true },
          })
        } catch (error) {
          // A failed timestamp write must not cost someone their session.
          req.payload.logger.error({ err: error }, 'Failed to record lastLoginAt')
        }

        return user
      },
    ],

    beforeChange: [
      ({ data, operation }) => {
        // `password` is only present on the incoming payload when it is being set.
        if (data.password && operation === 'update') {
          return { ...data, passwordChangedAt: new Date().toISOString() }
        }

        return data
      },
    ],
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nombre completo',
      admin: {
        description: 'Nombre de la persona tal como aparecerá en el panel.',
      },
    },

    {
      name: 'role',
      type: 'select',
      required: true,
      index: true, // PRD Nº7 §7
      options: roleOptions,
      // The least-privileged role, so a mis-clicked "save" on a new account
      // cannot create a publisher.
      defaultValue: 'author' satisfies Role,
      label: 'Rol',
      admin: {
        description:
          'Determina qué puede hacer esta persona. Solo un administrador puede modificarlo.',
      },
      access: {
        /*
         * PRD Nº7 §10 and PRD Nº5 §18: a user never changes their own role, and
         * PRD Nº5 §17 forbids assigning a role above your own. The UI hiding
         * the field is not the control — this is (PRD Nº5 §4).
         */
        update: adminFieldOnly,
      },
    },

    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      options: userStatusOptions,
      defaultValue: 'active' satisfies UserStatus,
      label: 'Estado de la cuenta',
      admin: {
        description:
          'Deshabilitado impide el inicio de sesión. Al salir del equipo, deshabilitar de inmediato (PRD Nº4 §96).',
      },
      access: {
        update: adminFieldOnly,
      },
    },

    {
      name: 'department',
      type: 'text',
      label: 'Área',
      admin: {
        description: 'Área o mesa de trabajo. Informativo; no otorga permisos.',
      },
    },

    {
      name: 'mfaEnabled',
      type: 'checkbox',
      defaultValue: false,
      label: 'MFA activado',
      admin: {
        description:
          'Indicador de estado. La implementación de MFA es posterior (ver gap G-20); este campo no activa nada por sí solo.',
      },
      access: {
        update: adminFieldOnly,
      },
    },

    /*
     * Read-only security telemetry. `update: () => false` means not even an
     * administrator can forge these through the API — they are written by hooks
     * only, which is what makes them worth reading during an incident.
     */
    {
      name: 'lastLoginAt',
      type: 'date',
      label: 'Último inicio de sesión',
      admin: {
        readOnly: true,
        description: 'Lo escribe el sistema al iniciar sesión.',
      },
      access: {
        update: systemFieldOnly,
      },
    },

    {
      name: 'passwordChangedAt',
      type: 'date',
      label: 'Último cambio de contraseña',
      admin: {
        readOnly: true,
        description: 'Lo escribe el sistema al cambiar la contraseña.',
      },
      access: {
        update: systemFieldOnly,
      },
    },

    {
      name: 'securityNotes',
      type: 'textarea',
      label: 'Notas de seguridad',
      admin: {
        description:
          'Notas internas de administración. No registrar aquí secretos, contraseñas ni códigos de recuperación (PRD Nº5 §5).',
      },
      access: {
        read: adminFieldOnly,
        update: adminFieldOnly,
      },
    },

    /*
     * Deferred on purpose, to avoid inventing shapes for collections that do
     * not exist yet:
     *   avatar           → relationship to Media   (F4 / F15)
     *   editorialProfile → relationship to Authors (F4)
     * Both are listed in PRD Nº7 §6.
     */
  ],
}

export default Users
