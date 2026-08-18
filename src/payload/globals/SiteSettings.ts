import type { GlobalConfig } from 'payload'

import { revalidateGlobal } from '@/payload/hooks/revalidate/revalidateGlobal'

import { adminOnly } from '@/payload/access/helpers'

/**
 * Site settings (PRD Nº7 §81).
 *
 * Update is administrator-only. PRD Nº7 §81 allows the editor in chief limited
 * fields, but the organisation schema and analytics configuration feed
 * structured data and third-party scripts — PRD Master §51 keeps that class of
 * setting away from editorial hands, and PRD Nº7 §87 warns against turning
 * security-relevant rules into editable settings.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',

  hooks: { afterChange: [revalidateGlobal('site-settings')] },

  access: {
    read: () => true,
    update: adminOnly,
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
