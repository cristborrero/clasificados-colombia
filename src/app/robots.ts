import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/routes'
import { indexingAllowed } from '@/lib/seo/indexing'

/**
 * robots.txt (PRD SEO §19).
 *
 * Generated, not a static file, so the sitemap URLs follow the canonical domain
 * instead of being pasted once and forgotten.
 *
 * §19 also says what this is not: **robots.txt is not a security mechanism.**
 * Everything blocked here is blocked because crawling it is pointless — an
 * admin panel, an API, a workbench. Nothing here is secret; the things that are
 * secret are protected by access control, and a disallow line would only
 * advertise them.
 */
/*
 * LIVES IN `src/app/`, NOT IN THE `(frontend)` ROUTE GROUP.
 *
 * Inside the group it was swallowed by the sibling `[categoria]` route: the
 * root-level category hub matched `/robots.txt` and served "Sección no
 * encontrada" with a 404. A metadata file does not outrank a dynamic sibling,
 * and nothing in the build reports the collision — /sitemap.xml kept working,
 * which made it look like a robots-specific problem rather than a routing one.
 *
 * It also does not need `force-dynamic`: the canonical domain is a build
 * argument, so the origin is already fixed when the image is built.
 */
/**
 * Generado por petición, no en el build.
 *
 * Su contenido depende de `ALLOW_INDEXING`, que se lee en ejecución para que
 * activar la indexación el día del lanzamiento sea cambiar una variable y
 * reiniciar, no recompilar. Prerenderizado, quedaría congelado el valor que
 * hubiera durante la compilación — que es exactamente cómo el sitemap terminó
 * publicando un mapa de una sola página.
 */
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  /*
   * While the site carries DEMO content, nothing is crawlable. This is the
   * polite half of the answer; the metadata `noindex` is the half that actually
   * keeps a page out of an index once a crawler has it.
   */
  if (!indexingAllowed()) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  const disallowList = [
    '/admin',
    '/api/',
    '/dev/',
    '/buscar',
    '/denunciar',
  ]

  const aiAgents = [
    'GPTBot',
    'ChatGPT-User',
    'PerplexityBot',
    'ClaudeBot',
    'anthropic-ai',
    'Google-Extended',
    'Applebot-Extended',
    'cohere-ai',
  ]

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowList,
      },
      ...aiAgents.map((agent) => ({
        userAgent: agent,
        allow: '/',
        disallow: disallowList,
      })),
    ],
    sitemap: [absoluteUrl('/sitemap.xml'), absoluteUrl('/news-sitemap.xml')],
    host: absoluteUrl('/'),
  }
}
