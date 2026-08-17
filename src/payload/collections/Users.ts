import type { CollectionConfig } from 'payload'

/**
 * Users — minimal F0 shape.
 *
 * SCOPE BOUNDARY: this collection exists in F0 only so the admin panel can
 * authenticate and the stack can be proven to boot. It is deliberately
 * incomplete.
 *
 * F2 adds: role, status, department, avatar, lastLoginAt, passwordChangedAt,
 *          mfaEnabled, editorialProfile.
 * F3 adds: deny-by-default access control, field-level access on `role` and
 *          `status`, and the Role × Operation test matrix.
 *
 * Until F3 lands, Payload's defaults apply — which means any authenticated user
 * can read and update users. That is acceptable ONLY because no real data and
 * no deployment exist yet. F3 is a hard prerequisite for any environment that
 * holds real accounts.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'SECURITY',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Full name as it should appear in the admin panel.',
      },
    },
  ],
}

export default Users
