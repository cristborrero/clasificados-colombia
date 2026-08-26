import type { GlobalConfig } from 'payload'

import { revalidateGlobal } from '@/payload/hooks/revalidate/revalidateGlobal'

import { newsroomStaffOnly } from '@/payload/access/helpers'

/**
 * Site-wide configuration and publisher identity (PRD SEO §40).
 *
 * Emitted as the `Organization` or `NewsMediaOrganization` node in structured
 * data on every page, so a search engine has a single canonical entity to
 * attribute authorship to.
 *
 * Single document, managed from the admin panel rather than in code so the
 * newsroom can update social handles, logos and contact addresses without a
 * deployment.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',

  hooks: { afterChange: [revalidateGlobal('site-settings')] },

  access: {
    read: () => true,
    update: newsroomStaffOnly,
  },

  admin: {
    group: 'OPERATIONS',
    description: 'Identidad del sitio y datos del publisher para structured data.',
  },

  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Clasificados Colombia',
      label: 'Nombre del sitio',
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      defaultValue: 'Investigamos. Informamos. No callamos.',
      label: 'Descripción',
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Contacto',
      admin: {
        description:
          'PRD SEO §67: datos reales y visibles. Un medio sin contacto parece una entidad anónima.',
      },
      fields: [
        { name: 'email', type: 'email', label: 'Correo' },
        { name: 'phone', type: 'text', label: 'Teléfono' },
        { name: 'address', type: 'text', label: 'Dirección' },
      ],
    },
    {
      name: 'organization',
      type: 'group',
      label: 'Organización (structured data)',
      admin: {
        description:
          'Alimenta el Organization de schema.org. PRD SEO §37: logo oficial, URL permanente, sin mockups.',
      },
      fields: [
        { name: 'legalName', type: 'text', label: 'Razón social' },
        { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo oficial' },
        {
          name: 'sameAs',
          type: 'array',
          label: 'Perfiles oficiales',
          labels: { singular: 'Perfil', plural: 'Perfiles' },
          admin: { description: 'Solo perfiles verificables (PRD SEO §35).' },
          fields: [{ name: 'url', type: 'text', required: true }],
        },
      ],
    },
  ],
}

export default SiteSettings
