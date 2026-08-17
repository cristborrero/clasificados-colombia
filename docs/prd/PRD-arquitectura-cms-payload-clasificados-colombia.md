# PRD — ARQUITECTURA EDITORIAL Y CMS (v2)
## Clasificados Colombia · Payload CMS (self-hosted) + Next.js

> Este documento reemplaza al PRD de arquitectura CMS basado en Sanity. Mantiene la misma lógica editorial (redacción real: fact-check, revisión legal, publicación) pero la implementa sobre **Payload CMS**, self-hosted en el servidor propio (Contabo + Coolify), con control de acceso escrito en código en lugar de depender de un tier pago de un CMS SaaS.

---

## 1. Objetivo

El mismo del PRD original: el sistema no es un editor de páginas, es el modelo de una redacción periodística real — noticias, investigaciones, análisis, opinión, denuncias, documentos, fuentes, autores, cronologías, temas, breaking news, correcciones, SEO, homepage.

Lo que cambia respecto a la v1: **el control de acceso, el workflow editorial y el audit trail ya no son features que se compran por plan — son código que el equipo escribe y controla por completo.**

---

## 2. Cambio de arquitectura de fondo

### Antes (Sanity)

```
Next.js (frontend) ──HTTP──> Sanity Content Lake (hosted, externo)
                              └── RBAC granular = plan Growth/Enterprise
                              └── Assets en CDN de Sanity
                              └── Revalidación vía webhook
```

### Ahora (Payload)

```
Contabo VPS (Coolify)
│
├── App Next.js + Payload (mismo proceso, mismo deploy)
│     └── Payload corre como plugin de Next.js (v3)
│     └── Access control = funciones TypeScript, no un plan
│     └── Revalidación = revalidatePath/revalidateTag directo en hooks (sin webhook)
│
├── Postgres (contenido editorial + audit log)
├── MinIO (S3-compatible) — documentos de evidencia clasificados
├── Meilisearch — índice de búsqueda
└── Servicio de Denuncias (app + DB separadas, aislado del resto)
```

Consecuencia directa: el problema que identificamos en la v1 (RBAC solo enforceable pagando Enterprise, `editorialStatus` custom chocando con el draft/published nativo, auditoría dependiente del historial de un tercero) desaparece porque ya no hay un tercero — todo vive en su propia base de datos, bajo su propio código.

Lo que se pierde y hay que aceptar conscientemente: ya no hay Visual Editing tan pulido como el de Sanity (Payload tiene live preview, comparable pero no idéntico), y el ops (backups, updates, uptime) pasa a ser responsabilidad del equipo — mitigado en buena parte por Coolify (SSL automático, redeploys, backups a S3-compatible).

---

## 3. Colecciones principales (equivalente a los "documentos" de Sanity)

En Payload esto se llama `collections`. Mismo inventario que la v1:

```txt
articles
investigations
opinions
dataStories
videoStories

authors
categories
topics

sources
evidenceDocuments
organizations
people

timelineEvents

breakingNews

corrections

users            (nuevo: no existía como colección editorial en Sanity;
                  en Payload los usuarios y sus roles son una collection normal)
```

Singletons (homepage, navigation, siteSettings) se modelan como **Globals** en Payload — el equivalente directo a los singleton documents de Sanity.

---

## 4. ARTICLE

Collection: `articles`

Los mismos campos que la v1, sin cambios conceptuales:

```txt
title, slug, dek, contentType, category, topics[], authors[]
heroImage, heroCaption, heroCredit
publishedAt, updatedAt
body (rich text)
sources[], documents[], relatedArticles[]
location, featured, breaking
seo (grupo reutilizable)
editorialStatus, factCheckStatus, legalStatus
```

Diferencia real: `editorialStatus` deja de ser "un campo que en teoría gatea la publicación" y pasa a ser **la única fuente de verdad**, porque la función `access.update` y `access.read` de la collection se escriben para respetarlo literalmente:

```ts
// articles/access.ts (pseudocódigo real de Payload)
export const canPublish: Access = ({ req: { user } }) => {
  if (!user) return false
  return ['editorInChief', 'administrator'].includes(user.role)
}

export const canTransitionToLegalReview: Access = ({ req: { user }, data }) => {
  if (!user) return false
  if (data?.factCheckStatus !== 'verified') return false // no salta pasos
  return ['editor', 'editorInChief'].includes(user.role)
}
```

No hay forma de "publicar por error" desde la API salvo que el rol lo permita — es la puerta real, no una UI que se puede saltar.

---

## 5–8. Slug, Dek, Content Type, Category

Sin cambios respecto a la v1 (reglas de longitud, no-HTML, no cambiar slug publicado sin aviso, `contentType` distinto de `category`). Las categorías siguen viviendo en su propia collection, nunca hardcodeadas en componentes del frontend.

---

## 9. TOPIC / 10. AUTHOR / 11. EXPERTISE

Igual que v1. `articles[]` en `author` sigue derivándose por query (relación inversa), nunca almacenada manualmente.

---

## 12. INVESTIGATION

Collection: `investigations` — el más completo del sistema, igual que en v1.

```txt
title, slug, dek, heroImage, heroVideo
authors[], editors[]
publishedAt, updatedAt
summary
chapters[]        → array field con blocks (title, slug, intro, body, media[], documents[], sources[])
timeline[]        → relación a timelineEvents
documents[]       → relación a evidenceDocuments
sources[], people[], organizations[], locations[]
methodology
keyFindings[]      → array field (headline, description, sourceReference, importance)
relatedInvestigations[]
updates[]
seo
editorialStatus, legalStatus, factCheckStatus
```

Regla reforzada de v1 (sección 17 original): el schema `person` nunca debe leerse como afirmación de culpabilidad. En Payload esto se traduce en un campo obligatorio `contextNote` en la relación `person ↔ investigation`, y en que **ninguna investigación con `people[]` no vacío puede transicionar a `published` sin `legalStatus = approved`** — se aplica vía `access.update`, no como sugerencia editorial.

---

## 13. PERSON / 14. ORGANIZATION / 15. SOURCE

Igual que v1 en estructura. Cambio de fondo: `source` con `sourceType = confidential` **no existe como opción visible en el frontend público ni en el índice de Meilisearch** — se filtra en la query de sync, no solo en la UI.

---

## 16. EVIDENCE DOCUMENT — el cambio más importante de todo el documento

Collection: `evidenceDocuments`

```txt
title, slug, documentType, institution, documentDate
file            → ya NO es un asset de Payload/Media Library
pageCount, description
annotations[]   (page, label, description, coordinates)
classification  → public | internal | restricted   (antes "public/downloadAllowed" suelto)
sources[], relatedArticles[]
```

**El archivo real vive en MinIO, no en la base de datos ni en el media store por defecto de Payload.** El campo `file` en Payload guarda solo la referencia (key del objeto en MinIO), no el binario.

Por qué esto resuelve el punto 5 que discutimos antes (enforcement real, no solo un campo):

- Documentos `restricted` se suben a un bucket privado de MinIO sin acceso público.
- El frontend nunca pide la URL directa — pide al backend un **presigned URL de corta duración**, generado server-side, y solo si `access.download` autoriza según rol y `classification`.
- Documentos `public` sí pueden vivir en un bucket con lectura pública o servirse por presigned URL de larga duración — decisión editorial, no técnica.
- Esto significa que aunque alguien obtenga el ID del documento en la base de datos, no puede acceder al archivo sin pasar por la autorización — a diferencia del riesgo que señalamos con URLs de CDN predecibles.

---

## 17. DOCUMENT ANNOTATIONS

Igual que v1 — array field dentro de `evidenceDocuments`.

---

## 18. RICH TEXT (antes "Portable Text")

Payload usa **Lexical** como editor rich text. Los bloques custom equivalen 1:1 a los que pedía el PRD original:

```txt
paragraph, heading, quote, pullQuote, image, gallery, video, audio,
document (referencia a evidenceDocuments), dataChart, timeline,
callout, factBox, sourceNote, correction, embed
```

Cada uno se define como un **Lexical custom block** con su propio schema de campos — el mismo nivel de estructura que Portable Text, solo que versionado en el repo del proyecto en vez de en el Studio de un tercero.

---

## 19–22. PULL QUOTE / FACT BOX / DATA STORY / DATASET / CHART

Sin cambios de estructura respecto a v1. `chart` mantiene la regla: no gráficos decorativos que dificulten interpretación — esto es una guía editorial, no algo que el CMS pueda forzar por sí mismo; queda como checklist en el flujo de fact-check.

---

## 23. OPINION / 24. VIDEO STORY

Igual que v1. `videoStory` sigue guardando siempre `transcript` cuando exista (accesibilidad, búsqueda, SEO). El archivo de video, igual que los documentos de evidencia, puede vivir en MinIO si el volumen lo justifica, o quedarse en el media store de Payload si son videos cortos/livianos.

---

## 25. BREAKING NEWS

Collection: `breakingNews`

```txt
headline, description, url, severity, startsAt, expiresAt, confirmed
```

Con Payload dentro del mismo proceso Next.js, retirar automáticamente las barras expiradas es más simple que en v1: un `afterRead` hook o un cron job ligero (Coolify soporta scheduled tasks) revisa `expiresAt` y llama `revalidateTag('breaking-news')` directamente — sin necesidad de webhook externo, porque CMS y frontend son la misma app.

---

## 26–28. HOMEPAGE / NAVIGATION / SITE SETTINGS

Se modelan como **Globals** de Payload (no collections, porque son singleton). Mismos campos que v1:

- `homepage`: hero, breaking, featuredInvestigations[], latestNewsConfiguration, featuredAnalysis[], featuredData[], featuredVideos[], featuredOpinions[], newsletterBlock.
- `navigation`: mainNavigation[], secondaryNavigation[], footerNavigation[], socialLinks[].
- `siteSettings`: siteName, siteDescription, logo, favicon, contact, socialLinks, defaultSeo, organizationSchema, newsletter, analytics.

---

## 29. SEO (grupo reutilizable)

Igual que v1 — `metaTitle`, `metaDescription`, `canonicalUrl`, `ogTitle/ogDescription/ogImage`, `noIndex`, con fallback automático a `title/dek/heroImage` cuando no hay override. En Payload esto se define como un **field group reutilizable** (`seoFields`) que se importa en cada collection que lo necesita.

---

## 30. STRUCTURED DATA

Igual que v1: se genera en el frontend (Next.js), nunca se le pide al editor escribir JSON-LD. `NewsArticle`, `Article`, `OpinionNewsArticle`, `ReportageNewsArticle`, `Person`, `Organization`, `BreadcrumbList`, `VideoObject`.

---

## 31. EDITORIAL STATUS / 32. FACT CHECK STATUS / 33. LEGAL STATUS

Mismos valores que v1. La diferencia central ya se explicó en la sección 4: estos campos ahora son la fuente real de autorización, no metadata decorativa.

---

## 34. WORKFLOW Y ROLES

```txt
REPORTER → Draft
EDITOR → Editing
FACT CHECKER → Verified
LEGAL REVIEWER → Approved
EDITOR → Approved final
EDITOR IN CHIEF → Published
```

Roles como collection `users` con campo `role`:

```txt
administrator
editorInChief
editor
reporter
factChecker
legalReviewer
contributor
```

Cada permiso de la v1 (secciones 45-49 del PRD original: qué puede y no puede hacer cada rol) se traduce directo a una función `access` por collection y por operación (`create`, `read`, `update`, `delete`). Ejemplo del caso Reporter:

```ts
// No puede publicar, no puede tocar settings/navegación, no puede borrar contenido publicado
export const reporterAccess: CollectionConfig['access'] = {
  update: ({ req: { user }, data }) => {
    if (user?.role !== 'reporter') return true // otros roles: regla propia
    return data?.editorialStatus === 'draft' && data?.author === user.id
  },
  delete: ({ req: { user }, data }) => {
    if (user?.role !== 'reporter') return true
    return data?.editorialStatus === 'draft'
  },
}
```

Esto es exactamente el "RBAC real" que en Sanity solo llega con Enterprise — aquí es gratis porque es código propio.

---

## 35. DRAFTS Y VERSIONES

Payload trae **Drafts & Versions** nativo (feature core, no de pago) — cada collection puede activar `versions: { drafts: true }` y Payload guarda automáticamente el historial de cambios con autor y timestamp. Esto cubre la necesidad de auditoría de cambios de contenido sin depender de retención limitada de un tercero.

Para la trazabilidad editorial específica (quién verificó, quién aprobó legalmente — no solo quién editó texto), se agregan campos explícitos en el documento, tal como acordamos:

```txt
verifiedBy, verifiedAt
approvedBy, approvedAt
legalReviewedBy, legalReviewedAt
```

poblados automáticamente vía `beforeChange` hook cuando cambia el status correspondiente — nunca editables a mano.

---

## 36. PROGRAMACIÓN (scheduled publishing)

Payload soporta scheduled publish de forma nativa (a través de un job scheduler interno) — no es un add-on de pago como en Sanity. Se valida igual que v1: `scheduledAt > currentTime`.

---

## 37. PREVIEW

Payload tiene Live Preview nativo para Next.js — el editor ve el artículo renderizado con el layout real mientras edita, incluyendo contenido en draft. No es tan "click-to-edit" como el Visual Editing de Sanity, pero cubre el caso de uso central: previsualizar antes de publicar sin usar código.

---

## 38. ESTRUCTURA DEL ADMIN (equivalente al "Desk Structure" de Sanity)

El admin panel de Payload se organiza por configuración de grupos de collections. Misma lógica que v1:

```txt
Contenido
  Últimas noticias, Investigaciones, Análisis, Opinión, Datos, Videos

Producción
  Mis borradores, En edición, Fact checking, Revisión legal, Programados
  (implementado como vistas filtradas por editorialStatus + autor actual)

Breaking News
Homepage

Biblioteca
  Autores, Temas, Personas, Organizaciones, Documentos, Fuentes

Configuración
```

Badges visuales (DRAFT, FACT CHECK, LEGAL REVIEW, SCHEDULED, BREAKING, UPDATED) se implementan como componentes custom en la lista del admin — Payload permite esto sin plugins de pago.

---

## 39. VALIDACIONES

Igual que v1 — reglas de campos obligatorios según status (`title, slug, dek, author, category, publishedAt, body` para artículo publicado; `sources, methodology` adicionales para investigación publicada). En Payload se implementan como funciones `validate` por campo o `beforeValidate` hooks a nivel de collection.

---

## 40. REFERENTIAL INTEGRITY

Igual que v1 — relaciones (`relationship` fields en Payload) en vez de copiar nombres/datos manualmente.

---

## 41. QUERIES / FETCHING

Como Payload corre en el mismo proceso que Next.js, esto se simplifica respecto a v1: no hace falta un cliente HTTP a un servicio externo. Server Components consultan directo vía la **Local API** de Payload (`payload.find(...)`), sin round-trip de red — más rápido que cualquier configuración con Sanity o incluso Payload en modo API externo.

Mantener las queries centralizadas igual que v1:

```txt
lib/
  queries/
    articles.ts
    investigations.ts
    homepage.ts
    authors.ts
    categories.ts
    search.ts
```

---

## 42. CACHING Y REVALIDACIÓN

Esto se simplifica bastante respecto a la v1. Ya no hace falta un webhook desde un CMS externo — el `afterChange` hook de la collection llama directo:

```ts
afterChange: [
  async ({ doc }) => {
    revalidateTag(`article-${doc.slug}`)
    revalidateTag(`category-${doc.category}`)
    revalidateTag('homepage')
    revalidateTag(`author-${doc.author}`)
  },
]
```

Estrategia diferenciada por tipo de contenido, igual que v1: homepage con revalidación frecuente, artículos publicados cacheables hasta el próximo cambio, breaking news con revalidación muy corta, drafts sin cache pública (protegidos además por auth en el route de preview).

---

## 43. MEDIA LIBRARY / IMAGE CROPS / IMAGE METADATA

Igual que v1: `alt`, `caption`, `credit`, `source` obligatorios en imágenes destacadas. Payload soporta `focalPoint`/crop igual que el hotspot de Sanity. EXIF sensible se limpia server-side en el hook de subida — especialmente importante en fotos enviadas por denunciantes, igual que se señaló en v1.

---

## 44. DOCUMENT SECURITY (`public / internal / restricted`)

Ya cubierto en la sección 16 de este documento — la diferencia central de esta v2 es que la clasificación se aplica en la capa de generación de URLs (MinIO presigned URLs) y no solo como un campo informativo.

---

## 45. DENUNCIAS

**Cambio de arquitectura respecto a v1**, no solo de implementación: las denuncias ciudadanas NO viven en la misma app/base de datos que el CMS editorial.

```txt
Servicio de Denuncias (aislado)
├── App mínima (Next.js API route o servicio independiente)
├── Postgres propio (schema/DB separada del CMS)
├── Campos sensibles cifrados at-rest
└── Sin relación directa/foránea con la DB del CMS
```

Workflow igual que v1 (`submission → editorial review → verification → investigation → possible publication`), pero la promoción de una denuncia a investigación es un **paso manual y explícito** — un editor copia/traslada la información relevante al CMS principal, nunca hay una foreign key automática entre ambos sistemas. Esto es intencional: si el CMS editorial se ve comprometido, la identidad de una fuente anónima no queda expuesta por una relación de base de datos.

---

## 46. SEARCH INDEX

Meilisearch, self-hosted (one-click en Coolify), sincronizado vía `afterChange` hook:

```ts
afterChange: [
  async ({ doc, operation }) => {
    if (doc.editorialStatus !== 'published') return // nunca indexar drafts
    await meilisearchClient.index('content').addDocuments([{
      id: doc.id, title: doc.title, dek: doc.dek,
      bodyText: extractPlainText(doc.body),
      authors: doc.authors, category: doc.category,
      topics: doc.topics, publishedAt: doc.publishedAt,
    }])
  },
]
```

Fuentes `confidential` y documentos `restricted`/`internal` se excluyen explícitamente del índice.

---

## 47. AUDITABILITY

Cubierto en la sección 35. Cada documento puede responder: quién lo creó, quién lo editó, quién lo verificó, quién lo aprobó legalmente, cuándo se publicó, cuándo se actualizó — como campos explícitos, no como dependencia de la retención de historial de un CMS externo.

---

## 48. ARCHIVING / UNPUBLISH

Igual que v1: preferir `archived = true` sobre borrar. Para retirar contenido, mostrar estado apropiado en el frontend en vez de 404 genérico siempre.

---

## 49. RELATED CONTENT / NEWSLETTER

Sin cambios respecto a v1: selección manual con prioridad sobre combinación automática por topics + category; campos `newsletterEligible`/`newsletterPriority` en artículos.

---

## 50. LOCALIZATION / FECHAS

Igual que v1: idioma inicial `es-CO`, timestamps estándar en base de datos, presentados al usuario en timezone `America/Bogota`.

---

## 51. INFRAESTRUCTURA EN COOLIFY — resumen de servicios

```txt
Servicio 1 — App principal (Next.js + Payload, mismo contenedor)
Servicio 2 — Postgres (contenido editorial + audit log)
Servicio 3 — Meilisearch (one-click en Coolify)
Servicio 4 — MinIO (docker-compose manual, ya no está en el catálogo one-click)
Servicio 5 — Servicio de Denuncias (app + Postgres propios, aislado de los anteriores)
```

Con 12GB de RAM en el Contabo, los cinco servicios corren cómodos en la etapa actual del proyecto. Recomendación operativa: activar backups automáticos a un bucket S3-compatible desde el día uno (Coolify lo soporta nativamente) — al ser todo self-hosted, el respaldo ya no es responsabilidad de un proveedor externo, es enteramente suya.

---

## 52. SEED CONTENT

Igual que v1: contenido de prueba claramente marcado (`DEMO`, `CONTENIDO DE PRUEBA`), nunca con apariencia de información periodística real — 6 artículos, 2 investigaciones, 2 opiniones, 2 data stories, 4 autores, 8 categorías/temas.

---

## 53. DEFINITION OF DONE

Igual que v1 — un editor debe poder, sin tocar código: crear noticia, asignar autor y categoría, añadir imágenes y documentos, añadir fuentes, enviar a revisión, fact-check, revisión legal, previsualizar, programar, publicar, actualizar, añadir corrección, retirar cuando corresponda.

Se agrega un criterio nuevo específico de esta v2: **verificar que cada transición de estado esté efectivamente bloqueada a nivel de `access control`**, no solo oculta en la UI — es decir, que un usuario con rol Reporter reciba un 403 real al intentar publicar vía API directa, no solo que no vea el botón.

---

## 54. PRINCIPIO FINAL

Igual que en la v1: el sistema debe hacer que hacer periodismo correctamente sea más fácil que hacerlo incorrectamente. La diferencia de esta versión es que ahora esa garantía no depende de lo que un proveedor externo decida ofrecer en su plan gratuito — depende únicamente del código que el equipo escribe y controla de principio a fin.
