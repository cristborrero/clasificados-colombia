# PRD — SEO, GOOGLE NEWS, DISCOVER Y AUTORIDAD EDITORIAL
## Clasificados Colombia · Next.js + Payload CMS
### Documento Nº 3

---

# 1. Objetivo

Diseñar la arquitectura SEO de **Clasificados Colombia** para que el sitio pueda operar como un medio periodístico digital serio, rastreable, indexable y técnicamente preparado para:

- Google Search
- Google News
- Google Discover
- Google Images
- búsquedas de marca
- búsquedas temáticas
- búsquedas por periodista
- búsquedas de investigaciones
- búsquedas evergreen
- distribución social
- crecimiento orgánico a largo plazo

SEO no debe tratarse como una capa añadida después de construir el sitio.

Debe formar parte de:

```txt
Arquitectura
Contenido
CMS
URLs
Metadata
Autores
Imágenes
Performance
Structured Data
Editorial Workflow
Internal Linking
```

---

# 2. Principio SEO

La prioridad no es “posicionar palabras clave”.

La prioridad es construir:

**autoridad temática + claridad editorial + trazabilidad + contenido original + excelente infraestructura técnica.**

Cada página debe responder claramente:

```txt
Quién publica
Quién escribió
Cuándo se publicó
Cuándo se actualizó
Qué trata
Qué evidencia utiliza
Qué fuentes contiene
Cómo se relaciona con otros contenidos
```

---

# 3. Fuente de contenido SEO

Payload CMS será la fuente de verdad editorial.

El frontend Next.js debe derivar automáticamente desde Payload:

- metadata
- canonical
- Open Graph
- structured data
- fechas
- autores
- breadcrumbs
- sitemap
- news sitemap
- relaciones internas
- imágenes sociales

El editor no debe escribir manualmente JSON-LD.

---

# 4. INDEXABILIDAD

Por defecto:

```txt
Contenido publicado = index
Borrador = noindex
Preview = noindex
Contenido interno = noindex
Contenido restringido = inaccessible
Resultados internos de búsqueda = noindex
Filtros infinitos = noindex
```

Nunca permitir que previews editoriales sean indexables.

---

# 5. RENDERING

El contenido editorial crítico debe llegar en HTML generado por servidor.

Evitar arquitecturas donde:

```txt
Googlebot
→ HTML vacío
→ JavaScript
→ fetch
→ contenido
```

Preferir:

```txt
Request
→ Next.js
→ Payload
→ HTML completo
```

Server Components por defecto.

---

# 6. METADATA API

Utilizar la Metadata API nativa de Next.js.

Cada ruta editorial debe implementar metadata dinámica.

Ejemplo conceptual:

```ts
generateMetadata()
```

Derivar desde Payload:

```txt
title
dek
seo.metaTitle
seo.metaDescription
canonical
heroImage
publishedAt
authors
```

---

# 7. TITLE

Prioridad:

```txt
seo.metaTitle
→ title
```

No concatenar automáticamente cadenas excesivas.

Formato general:

```txt
Titular editorial | Clasificados Colombia
```

Pero permitir que en artículos largos Google reciba un título limpio sin sobreoptimización.

---

# 8. META DESCRIPTION

Prioridad:

```txt
seo.metaDescription
→ dek
```

Debe:

- describir el contenido;
- evitar clickbait;
- aportar contexto;
- no repetir simplemente el title.

Google puede decidir mostrar otro fragmento, por lo que la descripción se considera una señal editorial, no una garantía de snippet.

---

# 9. CANONICAL

Todas las páginas indexables deben tener canonical.

Ejemplo:

```txt
https://clasificadoscolombia.com/investigacion/red-contratos-ministerio
```

Nunca:

```txt
?utm_source=
?fbclid=
?page=
```

como canonical.

---

# 10. DOMINIO CANÓNICO

Elegir una única versión.

Ejemplo:

```txt
https://clasificadoscolombia.com
```

o:

```txt
https://www.clasificadoscolombia.com
```

No operar ambas versiones sin redirect permanente.

---

# 11. HTTPS

Todo el portal:

```txt
HTTP → HTTPS 301/308
```

Sin mixed content.

---

# 12. ARQUITECTURA DE URLS

URLs:

- legibles;
- permanentes;
- breves;
- semánticas.

Ejemplos:

```txt
/investigacion/red-contratos-ministerio

/politica/reforma-salud-congreso

/justicia/fiscalia-contratos-publicos

/analisis/crisis-confianza-instituciones

/datos/contratacion-publica-colombia
```

---

# 13. NO INCLUIR FECHA EN URL

Evitar:

```txt
/2026/08/17/politica/...
```

La fecha pertenece a metadata, no a la identidad permanente del recurso.

Esto facilita actualización y evergreen content.

---

# 14. SLUGS

Slug generado desde titular.

Reglas:

- lowercase;
- sin acentos;
- guiones;
- eliminar palabras innecesarias cuando convenga.

Ejemplo:

```txt
red-contratos-ministerio
```

---

# 15. CAMBIO DE SLUG

Una vez publicado:

no modificar automáticamente.

Si cambia:

crear redirect permanente:

```txt
old URL → new URL
```

Mantener colección en Payload:

```txt
redirects
```

Campos:

```txt
from
to
statusCode
createdAt
reason
```

---

# 16. REDIRECT MANAGER

Crear colección Payload:

`redirects`

Tipos:

```txt
301
302
307
308
```

Para cambios editoriales permanentes usar generalmente:

```txt
301 / 308
```

La aplicación debe evaluar redirects antes de devolver 404.

---

# 17. 404

Crear página 404 editorial útil.

Debe ofrecer:

- búsqueda;
- últimas noticias;
- investigaciones;
- homepage.

No mostrar página genérica de Next.js.

---

# 18. STATUS HTTP

Usar correctamente:

```txt
200
301/308
404
410
500
503
```

No devolver `200 OK` para páginas inexistentes.

---

# 19. ROBOTS.TXT

Generar mediante Next.js.

Permitir crawling de contenido público.

Bloquear únicamente áreas que no deben rastrearse.

Ejemplo conceptual:

```txt
/admin
/api/internal
/preview
```

No utilizar robots.txt como mecanismo de seguridad.

---

# 20. XML SITEMAP

Crear sitemap index.

Ejemplo:

```txt
/sitemap.xml
```

que pueda dividirse posteriormente:

```txt
/sitemaps/articles.xml
/sitemaps/investigations.xml
/sitemaps/categories.xml
/sitemaps/topics.xml
/sitemaps/authors.xml
/sitemaps/videos.xml
```

---

# 21. NEWS SITEMAP

Crear:

```txt
/news-sitemap.xml
```

Separado del sitemap normal.

Debe contener únicamente contenido periodístico reciente que cumpla los requisitos de Google News.

Google admite hasta 1.000 entradas `news:news` por sitemap; dividirlo si fuera necesario.

---

# 22. VENTANA DEL NEWS SITEMAP

No utilizar el News Sitemap como archivo histórico completo.

Añadir únicamente publicaciones recientes según los requisitos actuales de Google News.

Los artículos antiguos permanecen en sitemap convencional.

---

# 23. NEWS SITEMAP DATA

Generar desde Payload:

```txt
URL
publication name
language
publication date
title
```

No mantener manualmente.

---

# 24. GOOGLE NEWS

No asumir inclusión automática por crear News Sitemap.

El producto debe cumplir:

- transparencia;
- fechas claras;
- autores;
- identidad de la publicación;
- contacto;
- contenido original;
- URLs rastreables;
- performance.

---

# 25. STRUCTURED DATA

Utilizar preferentemente JSON-LD.

Google recomienda JSON-LD como formato estructurado.

Generarlo server-side.

Nunca depender de que un editor introduzca markup.

---

# 26. NEWS ARTICLE

Contenido periodístico:

```txt
NewsArticle
```

Cuando corresponda.

Campos:

```txt
@context
@type
headline
description
image
datePublished
dateModified
author
publisher
mainEntityOfPage
articleSection
```

Agregar únicamente propiedades válidas y sustentadas por contenido visible.

---

# 27. HEADLINE

El `headline` debe corresponder al titular visible.

No insertar un titular SEO distinto que altere materialmente el significado.

---

# 28. DATE PUBLISHED

Derivar de:

```txt
publishedAt
```

ISO 8601.

Ejemplo:

```txt
2026-08-17T10:42:00-05:00
```

---

# 29. DATE MODIFIED

Solo cambiar:

```txt
dateModified
```

cuando exista una actualización material.

No actualizarlo cada vez que:

- se ejecuta deployment;
- cambia un espacio;
- se recompila la página.

---

# 30. FECHAS VISIBLES

Mostrar claramente:

```txt
Publicado
17 AGO 2026 · 10:42 A. M.
```

Cuando corresponda:

```txt
Actualizado
17 AGO 2026 · 3:15 P. M.
```

Google recomienda que las fechas visibles y structured data sean consistentes.

---

# 31. AUTORES

Cada artículo debe mostrar byline real.

Ejemplo:

```txt
Por Juan Pablo Restrepo
Periodista de Investigación
```

El nombre debe enlazar a:

```txt
/autor/juan-pablo-restrepo
```

---

# 32. PÁGINA DE AUTOR

Ruta:

```txt
/autor/[slug]
```

Debe incluir:

- nombre;
- fotografía;
- rol;
- biografía;
- áreas de experiencia;
- trayectoria;
- artículos;
- investigaciones;
- información profesional relevante.

Esto ayuda tanto a usuarios como a motores de búsqueda a comprender la autoría.

---

# 33. AUTHOR STRUCTURED DATA

Dentro del artículo:

```txt
author: Person
```

Con:

```txt
name
url
jobTitle
```

y `sameAs` únicamente para perfiles oficiales válidos.

---

# 34. PROFILE PAGE

Las páginas de periodista pueden implementar `ProfilePage` cuando corresponda.

El contenido visible y el structured data deben coincidir.

---

# 35. PUBLISHER

Crear entidad central:

```txt
Organization
```

para:

**Clasificados Colombia**

Campos:

```txt
name
url
logo
sameAs
contactPoint
```

Usar consistentemente como publisher de artículos.

---

# 36. ORGANIZATION STRUCTURED DATA

Implementar principalmente en homepage / páginas institucionales.

No insertar objetos contradictorios en cada página.

Una identidad editorial consistente ayuda a Google a comprender la organización.

---

# 37. LOGO PARA STRUCTURED DATA

Utilizar logo oficial:

- limpio;
- accesible;
- URL permanente;
- buena resolución.

No utilizar mockups ni variantes promocionales.

---

# 38. BREADCRUMBS

Ejemplo:

```txt
Inicio
→ Investigación
→ Contratación pública
→ Red de contratos...
```

Implementar visualmente y con:

```txt
BreadcrumbList
```

---

# 39. ARTICLE SECTION

Derivar de Payload:

```txt
category.name
```

No introducir valores hard-coded contradictorios.

---

# 40. IMÁGENES EN STRUCTURED DATA

Para `image`, proporcionar versiones de alta calidad.

Idealmente ofrecer variantes aptas para diferentes proporciones cuando la pipeline lo permita.

---

# 41. GOOGLE DISCOVER

No existe un “schema Discover”.

El contenido elegible puede aparecer automáticamente si cumple los requisitos de Search.

No crear hacks específicos.

---

# 42. IMÁGENES PARA DISCOVER

Las imágenes de portada deben ser:

- relevantes;
- originales cuando sea posible;
- atractivas;
- de alta calidad;
- mínimo 1200 px de ancho para optar a grandes previews.

Google recomienda imágenes grandes para Discover.

---

# 43. MAX-IMAGE-PREVIEW

Configurar:

```html
<meta
  name="robots"
  content="max-image-preview:large"
/>
```

en contenido editorial indexable, salvo excepción justificada.

---

# 44. NO USAR LOGO COMO HERO

Para artículos:

la imagen principal debe representar la historia.

No utilizar logo, collage promocional o placa de texto como hero cuando exista fotografía editorial válida.

---

# 45. IMAGE ALT

Campos Payload:

```txt
alt
caption
credit
```

Alt:

describir el contenido relevante de la imagen.

No usar:

```txt
imagen
foto
noticia
Clasificados Colombia imagen
```

---

# 46. IMAGE FILENAMES

Cuando sea viable:

```txt
contrato-ministerio-transporte-2026.jpg
```

mejor que:

```txt
IMG_39483.jpg
```

Sin convertir el filename en spam SEO.

---

# 47. IMAGE DELIVERY

Servir imágenes optimizadas.

Utilizar:

```txt
next/image
```

donde sea adecuado.

Generar:

- width;
- height;
- srcset;
- sizes.

Evitar layout shift.

---

# 48. OG IMAGES

Generar Open Graph dinámico:

```txt
/opengraph-image
```

Formato recomendado:

```txt
1200 × 630
```

Debe contener:

- imagen editorial;
- categoría;
- titular corto;
- branding discreto.

No convertir cada OG image en un cartel saturado.

---

# 49. TWITTER / SOCIAL CARDS

Generar metadata apropiada:

```txt
summary_large_image
```

La imagen debe coincidir con la historia.

---

# 50. SEO OBJECT EN PAYLOAD

Crear group reutilizable:

```txt
seo
```

Campos:

```txt
metaTitle
metaDescription
canonical
ogTitle
ogDescription
ogImage
noIndex
noFollow
```

Solo overrides.

El sistema debe funcionar correctamente si están vacíos.

---

# 51. AUTOGENERACIÓN

Fallbacks:

```txt
metaTitle
→ title

metaDescription
→ dek

ogTitle
→ metaTitle → title

ogDescription
→ metaDescription → dek

ogImage
→ heroImage
```

---

# 52. SEO PREVIEW EN PAYLOAD

Crear UI en Admin que muestre aproximadamente:

```txt
Google title
Google description
Social preview
```

No venderlo como representación exacta de Google.

---

# 53. VALIDACIÓN DE INDEXACIÓN

Al publicar:

comprobar:

```txt
slug
canonical
title
dek
author
publishedAt
heroImage
```

Warn si faltan datos importantes.

No bloquear contenido urgente por reglas cosméticas.

---

# 54. INTERNAL LINKING

Crear sistema de relaciones.

Un artículo puede relacionarse con:

```txt
topics
people
organizations
authors
documents
other articles
investigations
```

Usar estas relaciones para navegación contextual.

---

# 55. RELATED CONTENT

Prioridad:

```txt
Selección editorial manual
↓
topic similarity
↓
category
↓
recency
```

No mostrar únicamente “últimas noticias”.

---

# 56. TOPIC HUBS

Crear:

```txt
/tema/[slug]
```

Ejemplo:

```txt
/tema/contratacion-publica
```

Página:

```txt
Descripción
Últimas noticias
Investigaciones
Análisis
Datos
Personas relacionadas
```

---

# 57. CATEGORY HUBS

Crear páginas editoriales reales para:

```txt
/investigacion
/politica
/justicia
/denuncia
/analisis
/datos
/opinion
```

No simples listados infinitos.

---

# 58. EVERGREEN

Contenido explicativo importante debe poder vivir como evergreen.

Ejemplo:

```txt
/explicadores/como-funciona-contratacion-publica-colombia
```

Actualizar manteniendo URL cuando el tema siga siendo esencialmente el mismo.

---

# 59. INVESTIGACIONES

Las investigaciones deberán tener fuerte arquitectura interna.

Ejemplo:

```txt
/investigacion/red-contratos
```

Contenido:

```txt
Overview
Capítulos
Documentos
Cronología
Personas
Organizaciones
Metodología
Actualizaciones
```

---

# 60. CHAPTER SEO

Si los capítulos son suficientemente sustanciales y necesitan URL independiente:

```txt
/investigacion/red-contratos/empresas
```

Si no:

utilizar anchors internos.

No crear páginas delgadas solo para generar URLs.

---

# 61. ORIGINAL REPORTING

Las investigaciones deben demostrar claramente qué aporta Clasificados Colombia.

Secciones recomendadas:

```txt
Qué encontramos
Cómo investigamos
Documentos
Fuentes
Metodología
```

---

# 62. AUTORIDAD EDITORIAL

Crear páginas institucionales indexables:

```txt
/quienes-somos
/equipo
/principios-editoriales
/metodologia
/correcciones
/contacto
```

---

# 63. QUIÉNES SOMOS

Debe explicar:

- qué es Clasificados Colombia;
- misión;
- independencia;
- cobertura;
- propiedad editorial cuando corresponda;
- ubicación;
- contacto.

No escribir una página corporativa vaga.

---

# 64. PRINCIPIOS EDITORIALES

Explicar públicamente:

- verificación;
- independencia;
- fuentes;
- derecho a réplica;
- correcciones;
- opinión;
- conflictos de interés.

---

# 65. METODOLOGÍA

Especialmente para investigación:

explicar:

- cómo se verifican documentos;
- manejo de datos;
- entrevistas;
- solicitudes oficiales;
- revisión editorial.

---

# 66. POLÍTICA DE CORRECCIONES

Ruta:

```txt
/correcciones
```

Explicar proceso.

Los artículos con corrección deben enlazar cuando corresponda.

---

# 67. CONTACTO

Datos reales y visibles.

Evitar que un medio parezca una entidad anónima.

---

# 68. OPINIÓN VS NOTICIA

Las páginas de opinión deben mostrar claramente:

```txt
OPINIÓN
```

En:

- UI;
- metadata;
- structured data;
- category.

No inducir a Google ni al lector a interpretarla como reportaje factual.

---

# 69. CONTENIDO GENERADO CON AI

IA puede apoyar procesos internos.

Pero no publicar material masivo de bajo valor.

Todo contenido público debe tener responsabilidad editorial definida.

Cuando IA intervenga materialmente en contenido publicado, establecer política interna/documental apropiada.

---

# 70. PEOPLE-FIRST

Priorizar historias creadas para usuarios.

Preguntas antes de publicar:

```txt
¿Aporta información nueva?
¿Aporta evidencia?
¿Explica algo mejor?
¿Tiene autor responsable?
¿Existe experiencia real detrás?
```

No producir artículos únicamente porque una keyword tenga volumen.

---

# 71. KEYWORD RESEARCH

Utilizar keyword research como instrumento de comprensión de demanda.

No como línea editorial automática.

Especialmente útil en:

- explicadores;
- servicio;
- contexto;
- elecciones;
- trámites;
- análisis de datos.

---

# 72. TITULARES SEO

El titular debe priorizar significado y precisión.

Evitar:

```txt
NO VAS A CREER...
ESTO CAMBIARÁ TODO...
URGENTE!!!
```

Incluso cuando puedan producir CTR temporal.

---

# 73. DISCOVER HEADLINES

Para Discover:

historias con:

- actualidad;
- originalidad;
- relevancia;
- buenas imágenes;
- ángulo claro.

Sin clickbait engañoso.

---

# 74. CONTENT FRESHNESS

No cambiar fechas simplemente para aparentar frescura.

Actualizar fecha solamente cuando exista modificación significativa.

---

# 75. ACTUALIZACIONES

Mostrar:

```txt
Actualizado:
```

y, cuando sea importante:

```txt
Qué cambió
```

Esto mejora transparencia.

---

# 76. CORRECTIONS VS UPDATES

Distinguir:

```txt
Update
Correction
Clarification
Editor's note
```

No tratarlos como equivalentes.

---

# 77. SEARCH INTERNA

Meilisearch se usa para usuarios, no para sustituir indexación web.

Ruta:

```txt
/buscar?q=
```

debe ser normalmente:

```txt
noindex,follow
```

Evitar indexar miles de combinaciones de queries internas.

---

# 78. MEILISEARCH INDEX

Indexar solo contenido público.

Campos:

```txt
title
dek
bodyText
authors
category
topics
publishedAt
contentType
slug
```

No enviar drafts, internal ni restricted.

---

# 79. FILTER URLs

No crear URLs indexables infinitas:

```txt
?category=
?author=
?date=
?sort=
```

Si una combinación merece indexación, construir una página editorial explícita.

---

# 80. PAGINATION

Listados extensos:

usar paginación crawlable.

Mantener links HTML reales.

No depender solo de infinite scroll.

Puede existir infinite scroll como enhancement, pero debe haber URLs navegables.

---

# 81. ARCHIVE

Crear archivos solo si aportan valor real.

Evitar:

```txt
/agosto-2026/
/17-08-2026/
```

si son simples páginas delgadas.

---

# 82. VIDEO SEO

Para contenido de video:

- página dedicada cuando corresponda;
- título;
- descripción;
- thumbnail;
- fecha;
- transcript;
- duración.

Implementar `VideoObject` cuando cumpla requisitos.

---

# 83. VIDEO TRANSCRIPTS

Guardar transcript en Payload.

Mostrarlo cuando aporte valor.

Beneficia:

- accesibilidad;
- búsqueda interna;
- comprensión semántica.

---

# 84. DATA STORIES

Para reportajes de datos:

- texto explicativo;
- fuente;
- metodología;
- fecha de actualización.

No publicar gráficos aislados sin contexto.

---

# 85. DATASET

Cuando realmente se publique un dataset como recurso:

evaluar `Dataset` structured data.

Solo cuando la página describa realmente un dataset.

---

# 86. DOCUMENTOS DE EVIDENCIA

Los documentos públicos de MinIO pueden enlazarse desde investigaciones.

No indexar automáticamente todos los objetos del bucket.

Acceso público debe realizarse mediante URLs controladas.

---

# 87. DOCUMENT LANDING PAGE

Para documentos importantes:

crear página HTML:

```txt
/documentos/[slug]
```

con:

- título;
- descripción;
- institución;
- fecha;
- contexto;
- investigación relacionada.

El PDF no debe ser el único recurso indexable.

---

# 88. INTERNAL / RESTRICTED DOCUMENTS

Nunca:

- incluir en sitemap;
- incluir en structured data;
- indexar;
- generar links permanentes públicos.

Utilizar presigned URLs de corta duración según política.

---

# 89. DENUNCIAS

El servicio separado de denuncias:

NO debe ser rastreable como contenido editorial.

Formularios:

```txt
noindex
```

cuando corresponda.

Las submissions nunca deben terminar directamente en Search.

---

# 90. CORE WEB VITALS

SEO técnico incluye rendimiento.

Objetivos prácticos:

```txt
LCP < 2.5s
INP < 200ms
CLS < 0.1
```

Trabajar hacia la categoría “Good”.

---

# 91. LCP

Normalmente:

hero image / titular.

Optimizar:

- priority solo donde corresponda;
- tamaños;
- CDN/proxy;
- caché;
- formatos modernos.

---

# 92. CLS

Todas las imágenes:

```txt
width
height
```

o aspect ratio reservado.

Evitar banners insertados inesperadamente sobre el artículo.

---

# 93. JAVASCRIPT

Reducir JS cliente.

Un artículo no necesita ser una SPA completa.

Server Components por defecto.

---

# 94. THIRD-PARTY

Auditar:

- analytics;
- ads;
- embeds;
- social widgets;
- video.

No permitir que scripts externos destruyan performance.

---

# 95. SOCIAL EMBEDS

Preferir placeholders/lazy loading cuando sea posible.

Especialmente:

- X;
- Instagram;
- TikTok;
- YouTube.

---

# 96. CRAWLABILITY

Links importantes deben usar:

```html
<a href="">
```

o `next/link`.

No crear navegación crítica únicamente mediante handlers JS.

---

# 97. ANCHOR TEXT

Usar textos descriptivos.

Mejor:

```txt
Leer la investigación sobre contratación pública
```

que:

```txt
Haz clic aquí
```

---

# 98. SEARCH CONSOLE

Configurar:

- Domain Property;
- sitemap;
- News Sitemap;
- inspección;
- performance;
- indexing.

---

# 99. MONITOREO SEO

Crear dashboard / proceso para revisar:

```txt
Indexación
CTR
Impresiones
Errores
Discover
Google News
Core Web Vitals
404
Redirects
```

---

# 100. LOGGING

Registrar errores de:

```txt
metadata
sitemap generation
search index
redirects
404 spikes
```

No guardar datos personales innecesarios.

---

# 101. WEBHOOK PAYLOAD → SEO

Después de publicar:

Payload:

```txt
afterChange
```

debe poder disparar:

```txt
revalidate article
revalidate homepage
revalidate category
revalidate topic
update Meilisearch
update sitemap-related cache
```

---

# 102. DELETE / UNPUBLISH

Cuando se retire contenido:

evaluar:

```txt
404
410
redirect
archived notice
```

según contexto.

No aplicar automáticamente un mismo comportamiento.

---

# 103. SITEMAP GENERATION

Consultar directamente Postgres/Payload.

No consultar Meilisearch para construir sitemap.

Payload es la fuente canónica.

---

# 104. SEO Y CMS

Crear una pestaña:

```txt
SEO
```

en Article / Investigation / Opinion / Video.

Pero mantenerla simple.

Campos principales:

```txt
Title override
Description override
OG image
Canonical override
Noindex
```

No mostrar 40 campos SEO al periodista.

---

# 105. SEO AUTOMATION

Automatizar todo lo posible.

El editor debe concentrarse en:

```txt
Historia
Titular
Bajada
Autor
Imagen
Fuentes
```

No en:

```txt
schema.org
XML
robots directives
Open Graph internals
```

---

# 106. EDITORIAL CHECK PANEL

Antes de publicar, mostrar estado:

```txt
Título ✓
Bajada ✓
Autor ✓
Imagen ✓
Crédito ✓
Categoría ✓
Fecha ✓
Fuentes ✓
SEO ✓
```

Warnings, no necesariamente bloqueos.

---

# 107. FEATURED IMAGE REQUIREMENT

Para contenido candidato a homepage / Discover:

recomendar:

```txt
>= 1200 px width
```

Payload debe mostrar warning si la imagen es demasiado pequeña.

---

# 108. COPYRIGHT / IMAGE RIGHTS

Guardar:

```txt
credit
source
license
```

cuando corresponda.

No asumir que una imagen disponible online puede publicarse.

---

# 109. NEWSROOM ENTITY MODEL

El grafo editorial debe conectar:

```txt
Article
↓
Author
↓
Topic
↓
Person
↓
Organization
↓
Document
↓
Investigation
```

Esto beneficia navegación, contexto y consistencia semántica.

---

# 110. SEO NO ES SCHEMA SPAM

Nunca marcar:

- testimonios inventados;
- entidades inexistentes;
- FAQs que no existen;
- ratings;
- datos ocultos.

Structured Data debe representar el contenido visible.

---

# 111. VALIDACIÓN

En CI/CD ejecutar tests sobre structured data generado.

Validar:

- JSON válido;
- campos obligatorios;
- URLs;
- fechas.

Además probar periódicamente con Google Rich Results Test.

---

# 112. OPEN GRAPH TESTS

Crear tests de snapshots / integración para asegurar que:

```txt
article
investigation
opinion
video
```

producen metadata correcta.

---

# 113. CANONICAL TESTS

Test:

```txt
UTM URL
→ canonical limpio
```

Test:

```txt
paginated content
→ canonical correcto
```

---

# 114. ROBOTS TESTS

Asegurar:

```txt
published article → index
draft preview → noindex
search → noindex
admin → inaccessible
```

---

# 115. LAUNCH SEO CHECKLIST

Antes de producción:

- dominio canónico definido;
- redirects;
- HTTPS;
- robots;
- sitemap;
- news sitemap;
- metadata;
- structured data;
- authors;
- organization;
- Search Console;
- Core Web Vitals;
- 404;
- OG;
- favicon;
- manifest;
- analytics;
- monitoring.

---

# 116. POST-LAUNCH

Primeros 90 días:

revisar semanalmente:

```txt
Coverage / indexing
404
Search queries
CTR
Google News
Discover
CWV
```

No realizar cambios masivos basados en pocos días de datos.

---

# 117. OBJETIVO DE MARCA EN SEARCH

Para una búsqueda:

```txt
Clasificados Colombia
```

el resultado ideal debe transmitir inmediatamente:

**medio periodístico  
investigación  
autores reales  
identidad clara  
confianza**

No simplemente:

“otro sitio de noticias”.

---

# 118. OBJETIVO PARA INVESTIGACIONES

Una investigación debe poder convertirse en la referencia web principal de su tema.

Esto requiere:

- contenido original;
- documentos;
- metodología;
- contexto;
- enlaces internos;
- autoría;
- actualización;
- URL permanente.

---

# 119. PRINCIPIO FINAL

No optimizar para “engañar al algoritmo”.

Optimizar para que las máquinas puedan comprender correctamente un trabajo editorial que ya es:

**original  
rastreable  
bien documentado  
útil  
rápido  
accesible  
creíble**

Si el periodismo tiene autoridad y la arquitectura la comunica correctamente, Search, News y Discover se convierten en canales de distribución del producto editorial, no en el producto editorial mismo.