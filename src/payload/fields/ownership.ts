import type { Field } from 'payload'

/**
 * Ownership and assignment (PRD Nº7 §13, §45, §48; PRD Nº5 §13).
 *
 * PRD Nº7 §48 is explicit that update access depends on role **and** ownership
 * **and** assignment **and** status — "No solo rol". Without a stored owner
 * there is nothing to compare against, so this field is what turns that rule
 * from prose into something enforceable.
 *
 * `createdBy` is written once by the system and never editable. If an author
 * could reassign it, "edit only your own drafts" would mean "edit anything you
 * are willing to claim".
 */
export function ownershipFields(): Field[] {
  return [
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      label: 'Creado por',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Lo registra el sistema. Determina quién puede editar el borrador.',
      },
      access: {
        update: ({ req }) => {
          const user = getUser(req)
          return isSuperUser(user) || hasRole(user, ['admin', 'editor', 'author'])
        },
      },
      hooks: {
        beforeChange: [
          ({ operation, req, value }) => {
            if (operation === 'create' && req.user) {
              return req.user.id
            }

            return value
          },
        ],
      },
    },

    {
      name: 'assignedEditor',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      label: 'Editor asignado',
      admin: {
        position: 'sidebar',
        description: 'Quién acompaña esta pieza. Da acceso de edición además del autor.',
      },
    },
  ]
}
