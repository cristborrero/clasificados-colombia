import type { GlobalConfig } from 'payload'

import { revalidateGlobal } from '@/payload/hooks/revalidate/revalidateGlobal'

import { getUser, hasRole } from '@/payload/access/helpers'

/**
 * Breaking news bar (PRD Nº7 §86, PRD Nº5 §25-§26).
 *
 * Modelled as a Global rather than a Collection, resolving conflict C-04 in the
 * direction PRD Nº7 §86 defaults to: only one bar is ever active. The PRD notes
 * a Collection would be needed for full editorial history — should that become
 * a requirement, the change is additive and the audit trail already records who
 * published what.
 *
 * `startsAt` and `expiresAt` are both required (PRD Nº5 §26). A banner without
 * an expiry becomes a banner nobody remembers putting up, still announcing
 * yesterday's emergency.
 *
 * Publishing here bypasses the editorial workflow by design — breaking news
 * needs speed (PRD Nº5 §25) — but not authorisation: editor and editor in chief
 * only.
 */
export const BreakingNews: GlobalConfig = {
  slug: 'breaking-news',

  hooks: { afterChange: [revalidateGlobal('breaking-news')] },

  access: {
    read: () => true,
    update: ({ req }) =>
      hasRole(getUser(req), ['administrator', 'editor_in_chief', 'editor']),
  },

  admin: {
    group: 'EDITORIAL',
    description: 'Barra de última hora. Siempre con fecha de expiración.',
  },

  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: false,
      label: 'Activa',
    },
    {
      name: 'severity',
      type: 'select',
      required: true,
      defaultValue: 'breaking',
      label: 'Severidad',
      options: [
        { label: 'Última hora', value: 'breaking' },
        { label: 'Alerta', value: 'alert' },
        { label: 'En desarrollo', value: 'developing' },
        { label: 'Confirmado', value: 'confirmed' },
      ],
      admin: {
        description:
          'Determina el color de la barra. El texto siempre acompaña al color: nunca se comunica solo con color.',
      },
    },
    { name: 'headline', type: 'text', required: true, label: 'Titular' },
    { name: 'description', type: 'textarea', label: 'Detalle' },
    {
      name: 'relatedArticle',
      type: 'relationship',
      relationTo: 'articles',
      label: 'Nota relacionada',
    },
    {
      name: 'startsAt',
      type: 'date',
      required: true,
      label: 'Desde',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      label: 'Hasta',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Obligatoria: evita banners olvidados (PRD Nº5 §26).',
      },
    },
  ],
}

export default BreakingNews
