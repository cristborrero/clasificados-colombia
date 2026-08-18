# PRD — SEARCH & DISCOVERY
## Meilisearch · Ranking editorial · Autocomplete · Indexación
### Clasificados Colombia — Documento Nº 9

---

# 1. Objetivo

Construir un sistema de búsqueda y descubrimiento editorial que permita encontrar rápidamente:

- noticias;
- investigaciones;
- análisis;
- opinión;
- videos;
- datos;
- autores;
- temas;
- personas;
- organizaciones.

El sistema debe ser:

```txt
rápido
tolerante a errores
comprensible
editorialmente relevante
seguro
reconstruible
```

No debe convertirse en una simple búsqueda de coincidencias literales.

---

# 2. Arquitectura

Fuente canónica:

```txt
Payload CMS
+
Postgres
```

Motor derivado:

```txt
Meilisearch
```

Flujo:

```txt
Payload
↓
transformador
↓
job de indexación
↓
Meilisearch
↓
Search UI
```

Meilisearch nunca será fuente de verdad.

---

# 3. Principio crítico

Si Meilisearch se pierde completamente:

```txt
Payload
↓
full reindex
↓
Meilisearch reconstruido
```

debe restaurar la búsqueda.

---

# 4. Indexación permitida

Indexar únicamente:

```txt
published
public
```

Nunca:

```txt
drafts
preview
internal
restricted
audit
usuarios internos
denuncias
contact data
review notes
```

---

# 5. Índices

No comenzar con 20 índices.

Crear inicialmente:

```txt
editorial_content
entities
authors
```

---

# 6. editorial_content

Incluye:

```txt
Articles
Investigations
Opinions
DataStories
VideoStories
```

La diferencia vive en:

```txt
contentType
```

---

# 7. entities

Incluye entidades públicas:

```txt
Topics
People
Organizations
Categories
```

---

# 8. authors

Índice independiente para perfiles públicos de autor.

---

# 9. Search document

DTO de contenido:

```ts
type EditorialSearchDocument = {
  id: string

  title: string
  dek?: string

  bodyText: string

  slug: string
  url: string

  collection: string
  contentType: string

  category?: {
    id: string
    name: string
    slug: string
  }

  topics: string[]
  topicSlugs: string[]

  authors: {
    id: string
    name: string
    slug: string
  }[]

  people: string[]
  organizations: string[]

  publishedAt: number

  heroImage?: string

  featured: boolean
  breaking: boolean

  searchPriority: number
}
```

---

# 10. No Payload raw document

Nunca enviar el documento completo de Payload.

Crear explícitamente:

```txt
toSearchDocument()
```

---

# 11. Texto indexable

`bodyText` se deriva desde Rich Text.

Eliminar:

- HTML;
- componentes decorativos;
- URLs técnicas;
- metadata interna.

Mantener:

- párrafos;
- headings;
- captions útiles;
- nombres;
- contenido factual.

---

# 12. Searchable attributes

Orden recomendado inicial:

```txt
title
dek
authors.name
topics
people
organizations
bodyText
```

El orden importa.

El titular debe pesar más que el cuerpo.

Meilisearch permite configurar explícitamente `searchableAttributes`.

---

# 13. No body-first ranking

Una noticia donde la consulta aparece una vez en el titular debe normalmente superar una donde solo aparece varias veces en el cuerpo.

---

# 14. Filterable attributes

Configurar:

```txt
contentType
category.slug
topicSlugs
authors.id
publishedAt
featured
breaking
collection
```

Meilisearch requiere declarar los atributos filtrables antes de utilizarlos en filtros.

---

# 15. Sortable attributes

Inicialmente:

```txt
publishedAt
searchPriority
```

Meilisearch permite configurar atributos específicamente ordenables.

---

# 16. Default sort

La búsqueda principal NO debe ordenarse simplemente por fecha.

Debe priorizar relevancia.

La fecha actúa como señal secundaria.

---

# 17. Ranking editorial

Objetivo conceptual:

```txt
textual relevance
+
title match
+
proximity
+
editorial importance
+
freshness
```

---

# 18. Search Priority

Campo derivado:

```txt
searchPriority
```

Valores orientativos:

```txt
0 standard
10 featured
20 major analysis
30 investigation
40 active breaking
```

No permitir al periodista escribir cualquier número arbitrario.

Derivar automáticamente.

---

# 19. Breaking boost

Una historia Breaking activa puede recibir boost temporal.

Cuando deja de ser breaking:

el boost desaparece.

No conservar prioridad artificial permanente.

---

# 20. Investigation boost

Las investigaciones originales pueden recibir un ligero boost editorial cuando varias piezas son igualmente relevantes.

No deben superar resultados claramente más relevantes.

---

# 21. Freshness

Las búsquedas noticiosas necesitan sensibilidad temporal.

Pero no aplicar:

```txt
newer always wins
```

Una investigación histórica muy relevante puede ser mejor resultado que una nota reciente tangencial.

---

# 22. Ranking rules

Configurar las reglas nativas de Meilisearch conscientemente.

No modificar ranking sin medir resultados.

Documentar cada cambio de ranking.

---

# 23. Relevance test set

Crear un dataset editorial de queries esperadas.

Ejemplo:

```txt
Petro
Fiscalía
contratos salud
corrupción contratación pública
Bogotá seguridad
reforma pensional
```

Y definir resultados esperados.

---

# 24. Golden queries

Mantener:

```txt
/search-tests/golden-queries.json
```

Cada entrada:

```json
{
  "query": "contratación pública",
  "expectedTopResults": [
    "investigation-x",
    "article-y"
  ]
}
```

---

# 25. Ranking regression

Antes de cambiar:

```txt
searchableAttributes
rankingRules
synonyms
typoTolerance
```

ejecutar golden queries.

---

# 26. Typo tolerance

Mantener habilitada para búsquedas humanas.

Meilisearch dispone de configuración específica de typo tolerance.

Ejemplos:

```txt
fiscalia → fiscalía
contratacion → contratación
bogta → Bogotá
```

---

# 27. Disable typo tolerance selectively

Deshabilitar donde tenga sentido:

```txt
IDs
URLs
document codes
```

Meilisearch permite deshabilitar typo tolerance por atributos específicos.

---

# 28. Accents

La búsqueda debe funcionar correctamente para:

```txt
fiscalia
fiscalía

contratacion
contratación
```

Probar explícitamente español.

---

# 29. Colombian names

Probar:

```txt
Gustavo Petro
Álvaro Uribe
Bogotá
Medellín
Cúcuta
```

sin asumir comportamiento lingüístico perfecto.

---

# 30. Localized attributes

Evaluar configuración específica para:

```txt
es
es-CO
```

cuando la versión desplegada de Meilisearch lo justifique.

Meilisearch dispone actualmente de configuración de atributos localizados para tokenización por idioma.

---

# 31. Synonyms

Crear diccionario editorial controlado.

Ejemplos:

```txt
Fiscalía
Fiscalía General de la Nación

Procuraduría
Procuraduría General

Bogotá
Bogota
```

---

# 32. Synonym governance

No crear sinónimos automáticamente mediante AI.

Toda equivalencia debe revisarse.

Porque:

```txt
FARC
guerrilla
```

no necesariamente debe considerarse una equivalencia bidireccional en todo contexto.

---

# 33. Synonym directionality

Cuando una relación no sea realmente equivalente:

no configurarla como synonym bidireccional.

---

# 34. Synonym file

Mantener configuración versionada:

```txt
search/config/synonyms.ts
```

o JSON equivalente.

Meilisearch ofrece settings específicos para sinónimos.

---

# 35. Stop words

Evaluar español:

```txt
el
la
los
las
de
para
```

pero no ajustar prematuramente.

Medir primero.

---

# 36. Acronyms

Agregar equivalencias útiles:

```txt
FGN
Fiscalía General de la Nación
```

solo cuando aporte.

---

# 37. Search endpoint

Preferir servidor:

```txt
/search
```

o Route Handler que actúe como capa controlada.

No exponer Master Key.

---

# 38. Public Search Key

Si se consulta directamente desde browser:

solo key con permiso:

```txt
search
```

sobre índices públicos.

---

# 39. Recomendación inicial

Para mayor control:

```txt
Browser
↓
Next.js search endpoint
↓
Meilisearch
```

Beneficios:

- rate limiting;
- ocultar infraestructura;
- normalizar query;
- analytics propios;
- response shaping.

---

# 40. Query normalization

Antes de buscar:

```txt
trim
collapse whitespace
limit length
```

No alterar intención.

---

# 41. Query max length

Ejemplo:

```txt
200 chars
```

No permitir consultas gigantes innecesarias.

---

# 42. Empty query

No mandar:

```txt
q=""
```

para obtener todo el índice en search dialog.

Crear contenido sugerido desde Payload.

---

# 43. Search page

Ruta:

```txt
/buscar?q=
```

---

# 44. Search results header

Ejemplo:

```txt
Resultados para
“contratación pública”

42 resultados
```

---

# 45. Result composition

Mostrar:

```txt
category
title
dek
date
content type
```

Imagen opcional.

---

# 46. Highlights

Puede resaltar términos relevantes.

Pero no producir HTML inseguro.

Sanitizar highlights devueltos.

---

# 47. Snippets

Usar fragmentos del body cuando ayuden a entender por qué apareció el resultado.

No reemplazar siempre el `dek`.

---

# 48. Query time

Mostrar resultados sin bloquear página completa.

Objetivo percibido:

```txt
instantáneo
```

---

# 49. Filters

Iniciales:

```txt
Todo
Noticias
Investigaciones
Análisis
Opinión
Videos
Datos
```

---

# 50. Category filters

Segundo nivel cuando sea útil:

```txt
Política
Justicia
Colombia
...
```

---

# 51. Date filters

Opciones simples:

```txt
Últimas 24 horas
Última semana
Último mes
Último año
Cualquier fecha
```

---

# 52. No advanced enterprise search UI

No crear inicialmente:

```txt
boolean query builder
20 filtros
saved searches
```

---

# 53. Filter state

Representar en URL:

```txt
/buscar?q=fiscalia&type=investigation
```

---

# 54. SEO

Search result pages:

```txt
noindex,follow
```

según PRD SEO.

---

# 55. Pagination

Usar paginación o Load More.

Si Load More:

mantener estado URL cuando corresponda.

---

# 56. Search result limit

Inicial:

```txt
20 resultados
```

por página.

---

# 57. Autocomplete

Componente:

```txt
SearchAutocomplete
```

Objetivo:

ayudar al usuario a completar intención.

No simplemente repetir resultados normales en miniatura.

---

# 58. Autocomplete sections

Puede mostrar:

```txt
Noticias
Temas
Personas
Organizaciones
Autores
```

---

# 59. Autocomplete threshold

Iniciar después de:

```txt
2–3 caracteres
```

según pruebas.

---

# 60. Debounce

Aproximadamente:

```txt
150–250 ms
```

---

# 61. Autocomplete result count

Máximo aproximado:

```txt
6–10
```

No convertir dialog en página completa.

---

# 62. Keyboard navigation

Soportar:

```txt
ArrowUp
ArrowDown
Enter
Escape
```

---

# 63. ARIA

Combobox/autocomplete debe implementar patrón accesible correcto.

---

# 64. Search shortcut

Desktop:

```txt
/
```

o:

```txt
Cmd/Ctrl + K
```

puede abrir búsqueda.

No interceptar cuando usuario escribe en input.

---

# 65. Suggested searches

Cuando dialog abre vacío:

mostrar sugerencias editoriales desde Payload:

```txt
Elecciones
Contratación pública
Justicia
Seguridad
```

No derivadas de historial individual por defecto.

---

# 66. Recent searches

Evitar inicialmente almacenamiento server-side.

Si se implementa:

localStorage opcional y claro.

No necesario v1.

---

# 67. Entity search

`entities` debe permitir encontrar:

```txt
Petro
Fiscalía
Ecopetrol
Bogotá
Contratación pública
```

---

# 68. Entity DTO

```ts
type EntitySearchDocument = {
  id: string
  entityType: 'topic' | 'person' | 'organization' | 'category'

  name: string
  slug: string
  url: string

  description?: string

  aliases?: string[]

  importance: number
}
```

---

# 69. Entity aliases

Permitir aliases editoriales.

Ejemplo:

```txt
Fiscalía General de la Nación
Fiscalía
FGN
```

---

# 70. People aliases

Evitar sobrenombres ofensivos/no verificables.

Aliases deben ser editorialmente aprobados.

---

# 71. Author search DTO

```ts
{
  id
  name
  slug
  url
  jobTitle
  expertise
  active
}
```

Solo autores públicos activos.

---

# 72. Unified search response

Endpoint puede devolver:

```json
{
  "content": [],
  "entities": [],
  "authors": []
}
```

para autocomplete.

---

# 73. Full search page

La página principal puede priorizar:

```txt
editorial_content
```

y mostrar Entities lateralmente si son relevantes.

---

# 74. Discovery ≠ search

Crear también módulos de descubrimiento basados en relaciones de Payload:

```txt
Related articles
More on this topic
More from this author
Related investigation
```

No usar Meilisearch para todo.

---

# 75. Related content source

Orden:

```txt
manual relation
→ shared topic
→ category
→ search similarity
```

---

# 76. No personalized recommendation engine v1

No construir:

```txt
user profiling
behavioral recommendation engine
```

en primera etapa.

---

# 77. Editorial discovery

Homepage y topic pages siguen siendo curaduría editorial.

Meilisearch no decide portada.

---

# 78. Index lifecycle

Estados:

```txt
publish
→ add/update

unpublish
→ remove

archive public
→ policy dependent

delete
→ remove
```

---

# 79. Payload hook

Después de cambio relevante:

```txt
afterChange
↓
queueSearchSync()
```

Payload documenta `afterChange` para acciones posteriores a creación/actualización.

---

# 80. No blocking external call

No hacer necesariamente:

```txt
afterChange
await meili.index(...)
```

antes de responder al editor.

Meilisearch puede estar caído.

---

# 81. Payload Jobs

Preferir:

```txt
afterChange
↓
payload.jobs.queue()
↓
search sync job
```

Payload dispone de Jobs Queue persistida en su base de datos.

---

# 82. Search job payload

```ts
{
  collection
  documentId
  operation
  version
}
```

---

# 83. Operation

```txt
upsert
delete
```

---

# 84. Idempotency

`upsert` del mismo documento:

debe ser seguro repetirlo.

---

# 85. Job retries

Configurar reintentos razonables.

Ejemplo:

```txt
3–5
```

con backoff.

---

# 86. Dead jobs

Si fallan permanentemente:

registrar y alertar.

No perder silenciosamente.

---

# 87. Publish must succeed without Search

Publicar contenido:

NO depende de disponibilidad de Meilisearch.

---

# 88. Search status

Internamente puede existir:

```txt
searchSyncStatus
```

pero no necesariamente como campo editorial visible.

Preferir observabilidad del job.

---

# 89. Index update ordering

Evitar race:

```txt
publish v5
update v6
job v5 finishes last
```

y sobrescribe v6.

Enviar:

```txt
version / updatedAt
```

y descartar jobs antiguos cuando sea posible.

---

# 90. Full reindex command

Crear:

```txt
pnpm search:reindex
```

---

# 91. Full reindex process

```txt
create new index
↓
apply settings
↓
batch documents
↓
validate
↓
swap index
```

Preferible a vaciar producción cuando el cambio es grande.

---

# 92. Index aliases / swap

Si la versión de Meilisearch utilizada lo permite:

usar estrategia de swap de índices para cambios sin downtime.

Verificar soporte en versión desplegada antes de implementar.

---

# 93. Index naming

Ejemplo:

```txt
editorial_content_v1
entities_v1
authors_v1
```

---

# 94. Search schema version

Environment/config:

```txt
SEARCH_SCHEMA_VERSION=1
```

---

# 95. Settings as code

Configurar:

```txt
searchableAttributes
filterableAttributes
sortableAttributes
rankingRules
synonyms
typoTolerance
```

desde código versionado.

No configurarlos únicamente manualmente en dashboard.

Meilisearch expone estos settings por API.

---

# 96. applySearchSettings()

Crear utilidad:

```txt
applySearchSettings()
```

idempotente.

---

# 97. Configuration drift

CI/deploy debe poder detectar o corregir diferencias entre configuración esperada y real.

---

# 98. Index batch size

No enviar todos los documentos en una sola request.

Usar lotes.

Ejemplo:

```txt
500–1000
```

y ajustar según memoria.

---

# 99. 12 GB server awareness

Indexación grande puede competir con:

```txt
Next.js
Postgres
MinIO
```

Programar full reindex fuera de picos.

---

# 100. Meilisearch memory

Monitorizar:

```txt
RAM
index size
indexing duration
```

---

# 101. Search analytics

Registrar únicamente datos necesarios.

Ejemplo:

```txt
query
resultCount
clickedResult
position
timestamp bucket
```

---

# 102. Privacy

No relacionar consultas con identidad personal por defecto.

No almacenar IP completa innecesariamente.

---

# 103. Zero-results queries

Muy valiosas editorialmente.

Registrar de forma agregada:

```txt
queries with zero results
```

---

# 104. Zero results dashboard

Ayuda a descubrir:

- errores de vocabulario;
- temas no cubiertos;
- sinónimos faltantes;
- demandas editoriales.

No implica automáticamente crear contenido.

---

# 105. Search CTR

Medir:

```txt
query
result clicked
position
```

para evaluar ranking.

---

# 106. Ranking decisions

No optimizar solo por CTR.

Clickbait puede elevar CTR y empeorar calidad.

---

# 107. Search quality metrics

Combinar:

```txt
CTR
zero-result rate
time to click
reformulation rate
editorial review
```

---

# 108. Query reformulation

Ejemplo:

```txt
fiscalia contratos
↓
contratos fiscalía bogotá
```

puede indicar resultados poco claros.

---

# 109. Search admin tooling

Crear página interna simple:

```txt
/admin/search-health
```

o integración Payload custom.

Mostrar:

```txt
index status
document counts
failed jobs
last full reindex
schema version
```

---

# 110. Quién toca el ranking

*(Actualizado 2026-08-18 — modelo de tres roles, ver PRD Master §23)*

Cambiar ranking o sinónimos: solo `admin`.

`author` no toca la configuración de búsqueda.

---

# 111. Synonym editor

Puede existir posteriormente en Payload.

Pero changes deben:

```txt
audit
review
apply to Meilisearch
```

---

# 112. Search settings permission

```txt
admin    configuración de búsqueda
editor   sinónimos editoriales, si llega a existir el editor en Payload
```

Nota: la configuración vive versionada en `src/search/settings.ts`
(CLAUDE.md §39). Un editor de sinónimos en Payload sería una fuente adicional,
y dos fuentes de verdad para el ranking es peor que ninguna interfaz.

---

# 113. Security

Meilisearch Master Key:

server-only.

---

# 114. Search endpoint rate limit

Aplicar limit razonable para:

```txt
autocomplete
full search
```

---

# 115. Bot searches

No permitir que search endpoint se convierta en vector DoS.

---

# 116. Query timeout

Definir timeout server-side.

Si Meilisearch falla:

responder error controlado.

---

# 117. Search outage

Sitio editorial sigue funcionando.

Search UI:

```txt
La búsqueda no está disponible temporalmente.
```

No afectar artículos.

---

# 118. Health checks

No hacer que homepage health falle solo porque Meilisearch está caído.

Separar:

```txt
app readiness
search dependency health
```

---

# 119. Meilisearch dumps/snapshots

Puede usarse como recuperación rápida, pero no sustituye Payload como fuente canónica.

---

# 120. Search backup priority

Prioridad menor que:

```txt
Postgres
Evidence
```

porque puede reconstruirse.

---

# 121. Data removal

Cuando artículo se elimina/despublica:

debe desaparecer del índice.

---

# 122. Privacy removal

Si un dato debe eliminarse urgentemente:

ofrecer job prioritario de delete.

---

# 123. Cache

Autocomplete puede cachearse brevemente.

No cachear de manera que resultados breaking queden obsoletos durante mucho tiempo.

---

# 124. Popular queries

Puede existir cache de consultas frecuentes.

No requisito inicial.

---

# 125. SEO relationship

Search interna:

no sustituye páginas indexables de:

```txt
category
topic
author
```

---

# 126. Search UX mobile

Search dialog:

full-screen en móvil.

Input grande.

Keyboard focus automático cuando sea apropiado.

---

# 127. No tiny close controls

Close target accesible.

---

# 128. Mobile result

Priorizar texto.

Imagen pequeña/opcional.

---

# 129. Search result category

Siempre claramente visible para distinguir:

```txt
INVESTIGACIÓN
OPINIÓN
ANÁLISIS
```

---

# 130. Exact phrase UX

No exponer operadores complejos inicialmente.

---

# 131. Future advanced syntax

Si se añade:

documentar.

No hacer que búsqueda normal requiera conocer syntax.

---

# 132. Content freshness job

No es necesario reindexar todos los artículos diariamente solo para cambiar score.

Si freshness depende de `publishedAt`, resolver ranking/query sin escritura masiva cuando sea posible.

---

# 133. Breaking expiry

Cuando Breaking expira:

queue update del documento para retirar boost.

---

# 134. Category rename

Cuando categoría cambia de nombre:

reindex documentos relacionados si nombre está denormalizado en Search DTO.

---

# 135. Author rename

Igual.

---

# 136. Denormalization

Search DTO puede denormalizar nombres por velocidad.

Aceptado porque Meilisearch es derivado.

---

# 137. Relationship hooks

No crear miles de jobs innecesarios.

Para cambios masivos:

usar batch reindex.

---

# 138. Search deployment

Deploy order:

```txt
code supporting new schema
↓
create/apply index settings
↓
reindex
↓
switch
```

---

# 139. Backward compatibility

Durante rolling deploy:

frontend antiguo y nuevo no deberían requerir respuestas incompatibles del search endpoint.

---

# 140. Search API response

Definir contrato estable:

```ts
type SearchResponse = {
  hits: SearchHit[]
  query: string
  page: number
  total: number
  processingTimeMs?: number
}
```

---

# 141. No raw Meili response public

No acoplar UI completamente a estructura interna de Meilisearch.

Crear adapter.

---

# 142. SearchHit

```ts
type SearchHit = {
  id: string
  url: string

  title: string
  dek?: string

  contentType: string
  category?: string

  publishedAt: string

  image?: string

  highlight?: {
    title?: string
    dek?: string
    body?: string
  }
}
```

---

# 143. Search service

```txt
src/search/
├── client.ts
├── config.ts
├── indexes.ts
├── settings.ts
├── transform.ts
├── jobs.ts
├── query.ts
├── analytics.ts
└── reindex.ts
```

---

# 144. Tests

Unit:

```txt
transform Payload → Search DTO
body text extraction
query normalization
```

---

# 145. Integration tests

```txt
publish → indexed
update → updated
unpublish → removed
```

---

# 146. Access test

Ensure:

```txt
draft never indexed
restricted evidence never indexed
```

---

# 147. Ranking tests

Golden queries.

---

# 148. Typo tests

```txt
bogta
fiscalia
contratacion
```

---

# 149. Filter tests

```txt
investigations only
category=justicia
date range
```

---

# 150. Autocomplete tests

Keyboard + screen reader.

---

# 151. Load test

Simular búsquedas concurrentes razonables.

No optimizar para millones de requests antes de necesitarlos.

---

# 152. Reindex test

DB de staging:

```txt
drop Meilisearch index
↓
run search:reindex
↓
validate counts
```

---

# 153. Search count validation

Comparar:

```txt
Payload published eligible count
vs
Meilisearch document count
```

---

# 154. Drift detector

Job periódico puede revisar diferencias básicas.

No necesidad cada minuto.

---

# 155. Failure observability

Log:

```txt
documentId
operation
jobId
attempt
error class
```

No body completo.

---

# 156. Alerts

Alertar si:

```txt
failed search jobs > threshold
Meilisearch unavailable
index drift high
```

---

# 157. Search Content Policy

No utilizar search para revelar:

```txt
unpublished titles
restricted document names
investigation codenames
internal authorship notes
```

---

# 158. Content removed from public site

Debe desaparecer también de:

```txt
autocomplete
results
entity related results
```

---

# 159. No fake zero-results

No rellenar búsqueda sin resultados con resultados irrelevantes haciéndolos parecer matches.

Separar:

```txt
No encontramos resultados
```

de:

```txt
También puede interesarte
```

---

# 160. Search corrections

Si el motor corrige typo:

puede mostrar:

```txt
Resultados para “fiscalía”
```

solo si comportamiento es claro.

No inventar cambios semánticos.

---

# 161. User trust

El usuario debe poder entender por qué un resultado pertenece a:

```txt
Investigación
Opinión
Noticia
```

---

# 162. Definition of Done

Search estará listo cuando:

1. solo contenido público se indexe;
2. Payload siga siendo fuente canónica;
3. Meilisearch pueda reconstruirse;
4. title tenga mayor relevancia que body;
5. filtros funcionen;
6. typo tolerance funcione bien en español;
7. synonyms estén versionados;
8. autocomplete sea accesible;
9. search page sea rápida;
10. publicación no dependa de Meilisearch;
11. jobs puedan reintentarse;
12. resultados despublicados desaparezcan;
13. restricted data nunca aparezca;
14. full reindex tenga comando;
15. configuración de índices esté en Git;
16. ranking tenga golden queries;
17. zero-result queries puedan analizarse;
18. search outage no derribe el medio.

---

# 163. Principio final

**La búsqueda no debe decidir qué es importante para el país.**

Eso corresponde a la redacción.

La búsqueda debe hacer otra cosa extremadamente bien:

```txt
entender qué busca el lector
↓
encontrar el contenido público correcto
↓
ordenarlo con relevancia
↓
explicar claramente qué tipo de contenido encontró
```

**Payload define qué existe.  
La redacción define qué importa.  
Meilisearch ayuda a encontrarlo.**