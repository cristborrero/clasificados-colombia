import type { Field } from 'payload'

/**
 * Reusable SEO group (PRD SEO §50, PRD Nº7 §43, §107-§108).
 *
 * Overrides only. PRD SEO §50 is explicit that the system must work correctly
 * when every field here is empty, because the fallbacks in §51 derive
 * everything from the editorial fields the journalist already filled in:
 *
 *   metaTitle       → title
 *   metaDescription → dek
 *   ogTitle         → metaTitle → title
 *   ogDescription   → metaDescription → dek
 *   ogImage         → heroImage
 *
 * Those fallbacks live in the frontend metadata layer (F16), not here. Storing
 * a copy of the title in `metaTitle` at write time would guarantee the two
 * drift apart the first time someone edits the headline.
 *
 * PRD SEO §104 also caps how much of this a journalist should ever see: title
 * override, description override, OG image, canonical override, noindex. Not
 * forty fields.
 */
export function seoFields(): Field {
  return {
    name: 'seo',
    type: 'group',
    label: 'SEO',
    admin: {
      description:
        'Todo es opcional. Si se deja vacío, el sistema deriva los valores del titular, la bajada y la imagen principal.',
    },
    fields: [
      {
        name: 'metaTitle',
        type: 'text',
        label: 'Título para buscadores',
        admin: {
          description:
            'Solo si el titular editorial no funciona bien en resultados de búsqueda. No debe cambiar el significado (PRD SEO §27).',
        },
      },
      {
        name: 'metaDescription',
        type: 'textarea',
        label: 'Descripción para buscadores',
        admin: {
          description: 'Debe describir, no ser clickbait. Si se deja vacío, se usa la bajada.',
        },
      },
      {
        name: 'canonical',
        type: 'text',
        label: 'URL canónica',
        admin: {
          description:
            'Solo para casos excepcionales. Nunca incluir parámetros de campaña como utm_source (PRD SEO §9).',
        },
      },
      {
        name: 'ogTitle',
        type: 'text',
        label: 'Título para redes',
      },
      {
        name: 'ogDescription',
        type: 'textarea',
        label: 'Descripción para redes',
      },
      {
        name: 'noIndex',
        type: 'checkbox',
        defaultValue: false,
        label: 'No indexar',
        admin: {
          description:
            'Excluye esta pieza de los buscadores. Usar con criterio: una nota publicada normalmente debe indexarse.',
        },
      },
      {
        name: 'noFollow',
        type: 'checkbox',
        defaultValue: false,
        label: 'No seguir enlaces',
      },
    ],
  }
}
