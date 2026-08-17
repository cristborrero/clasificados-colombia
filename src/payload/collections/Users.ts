import { AuthenticationError, type CollectionConfig } from 'payload'

import {
  canAuthenticate,
  isAdministrator,
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
 * SCOPE: F2 builds the model, authentication and the account-status gate. The
 * complete access-control matrix across every collection — and the Role ×
 * Resource × Operation × Status test suite — is F3.
 *
 * What is NOT deferred is privilege escalation. Shipping a writable `role`
 * field with no field-level guard would mean any authenticated account could
 * promote itself to administrator through the REST API, so the guards on
 * `role` and `status` are here rather than in F3 (PRD Nº5 §17-§18).
 */

type MaybeUser = { role?: Role; id?: string | number } | null | undefined

const isAdminUser = (user: MaybeUser): boolean => isAdministrator(user?.role)

export const Users: CollectionConfig = {
  slug: 'users',

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
     */
    beforeLogin: [
      ({ user }) => {
        const status = (user as { status?: UserStatus }).status

        if (!status || !canAuthenticate(status)) {
          throw new AuthenticationError()
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
      defaultValue: 'contributor' satisfies Role,
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
        update: ({ req }) => isAdminUser(req.user as MaybeUser),
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
        update: ({ req }) => isAdminUser(req.user as MaybeUser),
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
        update: ({ req }) => isAdminUser(req.user as MaybeUser),
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
        update: () => false,
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
        update: () => false,
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
        read: ({ req }) => isAdminUser(req.user as MaybeUser),
        update: ({ req }) => isAdminUser(req.user as MaybeUser),
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
