# PRD — MODELO DE DATOS DEFINITIVO PAYLOAD
## Collections · Globals · Hooks · Access · Relationships · Migrations
### Clasificados Colombia — Documento Nº 7

---

# 1. Objetivo

Traducir toda la arquitectura editorial aprobada de **Clasificados Colombia** a una especificación concreta de Payload CMS.

Este documento define:

- Collections;
- Globals;
- campos;
- relaciones;
- índices;
- hooks;
- access control;
- workflows;
- tipos TypeScript;
- slugs;
- redirects;
- publicación;
- búsqueda;
- auditoría;
- integración con MinIO;
- integración con Meilisearch;
- migraciones;
- estructura de carpetas.

Debe utilizarse como blueprint para implementación.

---

# 2. Principio arquitectónico

Payload será:

```txt
CMS editorial
+
API interna
+
Authentication editorial
+
Workflow
+
Metadata
+
RBAC
```

Payload NO será:

```txt
almacenamiento físico de evidencia
servicio de denuncias
motor de búsqueda
fuente de verdad de archivos restricted
```

Distribución:

```txt
Payload/Postgres
→ contenido y metadata

MinIO
→ evidencia física

Meilisearch
→ índice derivado público

Denuncias Service
→ sistema aislado
```

---

# 3. ESTRUCTURA DE CÓDIGO

Crear:

```txt
src/
├── app/
│   ├── (frontend)/
│   └── (payload)/
│
├── payload/
│   ├── collections/
│   ├── globals/
│   ├── fields/
│   ├── blocks/
│   ├── access/
│   ├── hooks/
│   ├── utilities/
│   ├── validations/
│   ├── jobs/
│   └── migrations/
│
├── search/
├── evidence/
├── editorial/
└── payload.config.ts
```

---

# 4. COLLECTION REGISTRY

Implementar inicialmente:

```txt
Users

Articles
Investigations
Opinions
DataStories
VideoStories

Authors
Categories
Topics

People
Organizations

Evidence
Sources

Corrections
Redirects

AuditEvents
EvidenceAccessGrants
InvestigationTeams
```

---

# 5. GLOBALS

Crear:

```txt
SiteSettings
Navigation
Homepage
EditorialSettings
BreakingNews
```

Los Globals se reservan para estructuras singleton.

No utilizar Collections singleton artificiales.

---

# 6. USERS

Slug:

```txt
users
```

Habilitar:

```ts
auth: true
```

Campos:

```txt
name
email

role
status
department

avatar

lastLoginAt
passwordChangedAt

mfaEnabled

editorialProfile
```

---

# 7. USER ROLE

Campo:

```txt
role
```

Tipo:

```txt
select
```

Valores:

```txt
administrator
editor_in_chief
investigative_editor
editor
reporter
fact_checker
legal_reviewer
photo_editor
contributor
```

Required:

```txt
true
```

Index:

```txt
true
```

---

# 8. USER STATUS

Valores:

```txt
active
suspended
disabled
```

Default:

```txt
active
```

---

# 9. USER ACCESS

`users.create`

Solo:

```txt
administrator
```

---

`users.read`

Administrator:

```txt
all
```

Usuario normal:

```txt
own document
```

Roles editoriales autorizados pueden acceder a información pública limitada de compañeros cuando el workflow lo requiera.

---

`users.update`

Administrator:

```txt
all
```

Usuario:

```txt
own non-security fields
```

---

`users.delete`

Evitar hard delete.

Preferir:

```txt
status = disabled
```

---

# 10. FIELD ACCESS — ROLE

Campo:

```txt
role
```

Read:

```txt
administrator
editor_in_chief when required
```

Update:

```txt
administrator only
```

Un usuario nunca modifica su propio rol.

---

# 11. AUTHORS

Separar:

```txt
User
```

de:

```txt
Author
```

No todos los autores necesitan acceso al CMS.

No todos los usuarios internos necesariamente aparecen como autores.

---

# 12. AUTHORS COLLECTION

Campos:

```txt
name
slug

portrait

jobTitle

shortBio
bio

expertise[]

emailPublic

socialLinks[]

active

seo
```

---

# 13. AUTHOR → ARTICLES

No almacenar:

```txt
articles[]
```

manualmente dentro de Author.

La relación principal vive desde Article:

```txt
article.authors[]
→ Authors
```

Para navegación inversa utilizar query o Join cuando corresponda.

---

# 14. CATEGORIES

Campos:

```txt
name
slug
description

colorRole
navigationLabel

order
active

seo
```

Inicialmente:

```txt
Investigación
Política
Justicia
Denuncia
Análisis
Datos
Opinión
Colombia
```

No hard-codear IDs en frontend.

---

# 15. CATEGORY SLUG

Unique:

```txt
true
```

Indexed:

```txt
true
```

---

# 16. TOPICS

Campos:

```txt
name
slug
description

image

relatedTopics[]

active

seo
```

---

# 17. PEOPLE

Representa personas mencionadas editorialmente.

Campos:

```txt
name
slug

roleDescription

organizations[]

description

portrait

publicSources[]

status
```

No añadir campos como:

```txt
guilty
criminal
suspect
```

como simplificación estructural.

El contexto pertenece al contenido editorial.

---

# 18. ORGANIZATIONS

Campos:

```txt
name
slug

organizationType

logo
description

website
location

publicSources[]
```

Tipos:

```txt
government
company
ngo
political
international
media
other
```

---

# 19. ARTICLES

Slug:

```txt
articles
```

Versions:

habilitadas.

Drafts:

habilitados.

---

# 20. ARTICLE — CORE

Campos:

```txt
title
slug
dek

contentType

category
topics[]

authors[]

hero

body

publication

workflow

relations

seo
```

---

# 21. TITLE

```txt
type: text
required: true
```

Validation editorial:

warning o UI helper alrededor de:

```txt
110 chars
```

No bloquear únicamente por longitud.

---

# 22. SLUG

Campo:

```txt
slug
```

Required.

Unique.

Indexed.

Generar inicialmente desde title.

---

# 23. SLUG LOCK

Campo interno:

```txt
slugLocked
```

Después de primera publicación:

```txt
true
```

Cambios posteriores requieren acción explícita.

---

# 24. SLUG CHANGE

Cuando un artículo publicado cambia de:

```txt
oldSlug
```

a:

```txt
newSlug
```

crear automáticamente:

```txt
Redirect
```

desde URL anterior.

---

# 25. CONTENT TYPE

Valores:

```txt
news
reportage
analysis
explainer
interview
profile
chronicle
```

No mezclar con Category.

---

# 26. HERO GROUP

```txt
hero:
  image
  caption
  credit
  alt
```

La imagen puede provenir del sistema de medios editoriales público.

No usar Evidence como hero directamente.

---

# 27. AUTHORS RELATIONSHIP

```txt
hasMany: true
relationTo: authors
required: true
```

Permitir múltiples autores.

---

# 28. CATEGORY

```txt
relationship
relationTo: categories
required: true
```

Una categoría primaria.

---

# 29. TOPICS

```txt
relationship
relationTo: topics
hasMany: true
```

---

# 30. BODY

Utilizar Lexical / rich text estructurado de Payload.

No almacenar body como HTML plano.

Debe admitir componentes editoriales propios.

---

# 31. BODY BLOCKS

Soportar:

```txt
Image
Gallery
Video
Audio

PullQuote
FactBox
Callout

DocumentReference

Timeline
DataChart

SourceNote
CorrectionNotice

Embed
```

Mantener número de bloques controlado.

---

# 32. BLOCK — PULL QUOTE

Campos:

```txt
text
attribution
source
style
```

---

# 33. BLOCK — FACT BOX

Campos:

```txt
title

items[]
  label
  value
  description

source
```

---

# 34. BLOCK — EVIDENCE REFERENCE

No almacenar archivo.

Campos:

```txt
evidence
publicPresentationTitle
context
pageReference
```

Solo Evidence cuyo:

```txt
classification = public
AND
status = approved
```

puede renderizarse públicamente.

---

# 35. PUBLICATION GROUP

```txt
publication:
  publishedAt
  modifiedAt
  scheduledAt
  firstPublishedAt
```

---

# 36. FIRST PUBLISHED

`firstPublishedAt`

se establece una vez.

No se modifica posteriormente.

---

# 37. MODIFIED AT

No utilizar automáticamente:

```txt
updatedAt
```

como fecha editorial visible.

Crear:

```txt
modifiedAt
```

para actualización material.

---

# 38. WORKFLOW GROUP

Campos:

```txt
editorialStatus
factCheckStatus
legalStatus

assignedEditor
assignedFactChecker
assignedLegalReviewer

reviewNotes
```

---

# 39. EDITORIAL STATUS

Valores:

```txt
draft
editing
fact_check
legal_review
approved
scheduled
published
archived
```

---

# 40. FACT CHECK

```txt
not_required
not_started
in_progress
verified
issues_found
```

---

# 41. LEGAL STATUS

```txt
not_required
pending
approved
changes_required
```

---

# 42. RELATIONS GROUP

```txt
relatedArticles[]
relatedInvestigations[]

people[]
organizations[]

sources[]
evidence[]
```

---

# 43. SEO GROUP

Reusable field factory:

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

---

# 44. ARTICLE ACCESS — PUBLIC READ

Anonymous:

```txt
_status = published
```

No drafts.

No archived unpublished documents.

---

# 45. REPORTER READ

Puede leer:

```txt
published
+
own drafts
+
assigned content
```

---

# 46. EDITOR READ

Puede leer todo contenido editorial estándar.

Evidence mantiene Access Control separado.

---

# 47. ARTICLE CREATE

Permitido:

```txt
reporter
editor
investigative_editor
editor_in_chief
administrator
contributor
```

---

# 48. ARTICLE UPDATE

Basado en:

```txt
role
+
ownership
+
assignment
+
status
```

No solo rol.

---

# 49. ARTICLE PUBLISH

Solo:

```txt
editor
editor_in_chief
```

según reglas de contenido.

Investigaciones:

reglas más estrictas.

---

# 50. INVESTIGATIONS

Colección propia.

No implementar Investigations como simple:

```txt
Article + contentType=investigation
```

porque su dominio es significativamente distinto.

---

# 51. INVESTIGATION FIELDS

```txt
title
slug
dek

hero

authors[]
editors[]

summary

keyFindings[]

chapters[]

timeline[]

people[]
organizations[]

sources[]
evidence[]

methodology

updates[]

publication
workflow
seo
```

---

# 52. INVESTIGATION CHAPTER

Array:

```txt
title
slug
intro
body

sources[]
evidence[]
```

---

# 53. KEY FINDINGS

```txt
headline
description

evidence[]
sources[]

importance
```

---

# 54. METHODOLOGY

Rich text estructurado.

Requerido antes de publicación de investigaciones salvo override de Editor in Chief documentado.

---

# 55. INVESTIGATION ACCESS

Reporter:

solo investigaciones:

```txt
assigned
OR
createdBy
```

Investigative Editor:

investigaciones bajo su control.

Editor in Chief:

todas.

---

# 56. INVESTIGATION PUBLISH GUARD

Antes de publicación:

```txt
editorialStatus = approved

factCheckStatus = verified

legalStatus = approved

authors exists

methodology exists
```

Además:

revisar evidencia pública.

---

# 57. OPINIONS

Campos:

```txt
title
slug
dek

author

hero
body

publishedAt

seo
```

Solo un Author principal salvo necesidad definida.

---

# 58. OPINION PRESENTATION

Guardar explícitamente:

```txt
contentNature = opinion
```

para facilitar:

- frontend;
- structured data;
- búsqueda;
- labeling.

---

# 59. DATA STORIES

Campos:

```txt
title
slug
dek

authors[]

body

datasets[]
charts[]

methodology

sources[]

publication
workflow
seo
```

---

# 60. DATASET METADATA

```txt
title
description
source

fileReference
license

updatedAt
```

Evitar almacenar datasets sensibles públicos sin proceso editorial.

---

# 61. VIDEO STORIES

Campos:

```txt
title
slug
dek

authors[]

video
poster

duration
transcript

publication

relatedArticles[]

seo
```

---

# 62. SOURCES

Colección:

```txt
sources
```

Campos:

```txt
title

sourceType

publisher

url
archiveUrl

publishedAt
accessedAt

notes

visibility
```

---

# 63. SOURCE TYPE

```txt
official_document
public_database
interview
press_release
court_record
law
academic
news
other
```

---

# 64. SOURCE VISIBILITY

```txt
public
internal
```

No registrar identidad de fuente confidencial real en esta colección.

---

# 65. EVIDENCE

Payload almacena metadata únicamente.

Campos:

```txt
title
description

classification

bucket
objectKey

mimeType
size
checksum

status

uploadedBy
uploadedAt

relatedInvestigation

retention
legalHold
```

---

# 66. EVIDENCE CLASSIFICATION

```txt
public
internal
restricted
```

Indexar este campo en Postgres.

---

# 67. EVIDENCE STATUS

```txt
pending
verified
approved
quarantined
archived
```

---

# 68. OBJECT KEY

Nunca editable desde Admin normal.

Field access:

```txt
read = authorized
update = system only
```

---

# 69. BUCKET

Derivado por classification.

No permitir free text desde UI.

---

# 70. EVIDENCE PUBLIC READ

Importante:

La colección `evidence` NO debe ser públicamente legible completa.

Crear un endpoint/view público específico que proyecte únicamente campos seguros de evidencia:

```txt
title
description
public metadata
```

cuando:

```txt
classification = public
status = approved
```

---

# 71. RESTRICTED ACCESS

Además de rol:

requiere:

```txt
EvidenceAccessGrant
OR
InvestigationTeam membership
```

---

# 72. EVIDENCE ACCESS GRANTS

Campos:

```txt
user
evidence

grantedBy
reason

createdAt
expiresAt

revokedAt
revokedBy
```

---

# 73. GRANT VALIDATION

Grant válido si:

```txt
revokedAt is null
AND
expiresAt > now
```

o sin expiry cuando la política lo permita.

---

# 74. INVESTIGATION TEAMS

Campos:

```txt
name
investigation

members[]
lead

active
```

---

# 75. AUDIT EVENTS

Colección:

```txt
audit-events
```

No permitir create/update/delete desde APIs normales.

Solo sistema.

Campos:

```txt
timestamp

actorId
actorRole

action

resourceType
resourceId

result

requestId

metadata
```

---

# 76. AUDIT APPEND ONLY

```txt
create:
system only

update:
false

delete:
false
```

---

# 77. CORRECTIONS

Campos:

```txt
article

type

description

publishedAt

editor
```

Tipos:

```txt
correction
clarification
update
editor_note
```

---

# 78. CORRECTION HOOK

Al publicar correction:

revalidar artículo relacionado.

No modificar automáticamente texto original.

---

# 79. REDIRECTS

Campos:

```txt
from
to

statusCode

reason

createdAt

active
```

---

# 80. REDIRECT UNIQUE

`from`

debe ser:

```txt
unique
indexed
```

---

# 81. GLOBAL — SITE SETTINGS

Campos:

```txt
siteName
siteDescription

brand

contact

socialLinks[]

defaultSEO

organizationSchemaConfig

analyticsConfig
```

Acceso update:

```txt
administrator
editor_in_chief limited fields
```

---

# 82. GLOBAL — NAVIGATION

```txt
primary[]
secondary[]
footer[]
social[]
```

Cada item:

```txt
label
linkType
internalReference
externalURL
newTab
```

---

# 83. INTERNAL LINK

Preferir Relationship a URLs escritas manualmente.

Generar URL desde documento relacionado.

---

# 84. GLOBAL — HOMEPAGE

Modelo híbrido:

```txt
hero

featuredInvestigations[]
featuredAnalysis[]
featuredData[]
featuredVideo[]

latestConfiguration

newsletter
```

---

# 85. HOMEPAGE HERO

```txt
relationTo:
  Articles
  Investigations
  DataStories
```

Si Payload/config utilizada admite relación polimórfica apropiada, implementar de forma tipada.

---

# 86. GLOBAL — BREAKING NEWS

En lugar de una colección histórica si solo existe una barra activa:

```txt
enabled
severity

headline
description

relatedContent

startsAt
expiresAt
```

Si se necesita historial/editorial audit completo, utilizar Collection.

---

# 87. GLOBAL — EDITORIAL SETTINGS

Campos:

```txt
defaultTimezone
defaultLocale

requiredReviewsByContentType

slugRules

publicationRules

evidenceRules
```

Evitar hard-codear reglas editoriales triviales que deban ser configurables.

No convertir reglas de seguridad críticas en settings editables.

---

# 88. HOOK ARCHITECTURE

Separar hooks por propósito:

```txt
hooks/
├── editorial/
├── search/
├── redirects/
├── audit/
├── publication/
├── evidence/
└── revalidation/
```

---

# 89. BEFORE VALIDATE

Usar para:

```txt
slug normalization
derived simple values
input normalization
```

No para operaciones externas pesadas.

---

# 90. BEFORE CHANGE

Usar para:

```txt
workflow guards
firstPublishedAt
classification checks
protected-field enforcement
```

---

# 91. AFTER CHANGE

Usar para:

```txt
search indexing
cache revalidation
audit
async downstream events
```

Evitar trabajo bloqueante largo.

---

# 92. AFTER DELETE

Usar para:

```txt
search removal
redirect/revalidation cleanup
```

No borrar evidencia física automáticamente salvo proceso específico.

---

# 93. SEARCH HOOK

Cuando documento:

```txt
published
```

crear/update Meilisearch document.

Cuando:

```txt
unpublished
archived
deleted
```

eliminarlo del índice público.

---

# 94. SEARCH INDEX PAYLOAD

Crear DTO explícito.

Ejemplo:

```txt
id
title
dek

slug
url

contentType

category
topics

authors

publishedAt

bodyText
```

Nunca enviar objeto Payload completo a Meilisearch.

---

# 95. BODY TEXT EXTRACTION

Crear utility:

```txt
extractSearchText()
```

que convierta contenido estructurado a texto plano seguro.

---

# 96. SEARCH FAILURE

Si Meilisearch falla:

NO revertir publicación periodística.

Registrar error y reintentar.

Search es sistema derivado.

---

# 97. EVENTUAL CONSISTENCY

Aceptar:

```txt
Payload published
→ search updated seconds later
```

como comportamiento válido.

No acoplar transacción editorial a disponibilidad de Meilisearch.

---

# 98. REVALIDATION HOOK

Al publicar artículo:

revalidar:

```txt
article
homepage
category
topics
author pages
```

según relaciones afectadas.

---

# 99. TARGETED REVALIDATION

No ejecutar:

```txt
revalidatePath('/')
```

para cada cambio si fuerza regeneración innecesaria de todo el sitio.

Implementar granularidad.

---

# 100. AUDIT HOOK

Eventos críticos:

```txt
publish
unpublish
archive
role change
classification change
restricted access
grant create
grant revoke
```

---

# 101. HOOK RECURSION

Todo hook que vuelva a escribir en Payload debe prevenir ciclos.

Ejemplo conceptual:

```txt
context:
  skipAudit
  skipSearchSync
```

Usar contexto interno explícito.

---

# 102. TRANSACTIONS

Cuando varias escrituras deban ser atómicas, utilizar la misma request/transacción de Payload correctamente.

No disparar operaciones “fire and forget” que aparentemente tengan éxito mientras la transacción principal puede hacer rollback.

---

# 103. LOCAL API

Centralizar llamadas server-side.

No utilizar Local API como una forma implícita de saltarse RBAC.

Cuando una operación deba actuar como usuario:

pasar usuario/contexto apropiado y respetar Access Control.

---

# 104. OVERRIDE ACCESS

Todo uso de:

```txt
overrideAccess
```

debe ser:

- explícito;
- excepcional;
- documentado;
- probado.

---

# 105. ACCESS ARCHITECTURE

```txt
payload/access/
├── roles.ts
├── users.ts
├── articles.ts
├── investigations.ts
├── evidence.ts
├── globals.ts
└── helpers.ts
```

---

# 106. ACCESS RESPONSE

Cuando sea posible, devolver filtros Payload en vez de:

```txt
true
```

Ejemplo conceptual:

Reporter:

```txt
createdBy = currentUser
OR
assignedReporter = currentUser
```

Esto reduce exposición de documentos no autorizados.

---

# 107. FIELD FACTORIES

Crear factories reutilizables:

```txt
slugField()
seoFields()
workflowFields()
publicationFields()
heroFields()
sourceRelationship()
evidenceRelationship()
```

---

# 108. NO COPY/PASTE SCHEMA

Si 6 Collections tienen SEO:

no duplicar 6 definiciones manualmente.

Usar configuración compartida.

---

# 109. TYPE GENERATION

Generar:

```txt
payload-types.ts
```

desde Payload Config.

No mantener interfaces manuales paralelas de cada colección.

---

# 110. TYPECHECK

CI debe detectar si generated types están fuera de sincronización.

---

# 111. DOMAIN TYPES

Sí pueden existir DTOs específicos:

```txt
PublicArticle
SearchDocument
ArticleCardData
EvidencePublicMetadata
```

pero derivados explícitamente del modelo Payload.

---

# 112. RELATIONSHIP DEPTH

No solicitar:

```txt
depth: 10
```

por comodidad.

Definir profundidad mínima por query.

---

# 113. QUERY PROJECTIONS

Solicitar solo campos necesarios.

Ejemplo card:

```txt
title
slug
dek
hero
category
publishedAt
```

No cargar body completo.

---

# 114. DATABASE INDEXES

Indexar campos utilizados habitualmente para:

```txt
filter
sort
lookup
```

Iniciales:

```txt
slug

editorialStatus
_status

publishedAt

category

classification

role

status
```

Medir queries reales antes de sobreindexar.

---

# 115. COMPOSITE INDEXES

Evaluar donde existan consultas frecuentes como:

```txt
published + publishedAt
category + publishedAt
```

No crear índices complejos sin observar query plans.

---

# 116. JOIN FIELDS

Utilizar Join para relaciones inversas útiles en Admin cuando mejore UX editorial.

Ejemplo:

Author:

```txt
Related Articles
```

sin duplicar físicamente IDs en ambas direcciones.

---

# 117. RELATION SOURCE OF TRUTH

Cada relación debe tener una sola dirección canónica.

Ejemplo:

```txt
Article → Author
```

es canónica.

```txt
Author ← Articles
```

es derivada.

---

# 118. DELETE RELATION SAFETY

No permitir borrar:

```txt
Author
Category
Topic
```

si rompe contenido publicado sin tratamiento explícito.

Preferir:

```txt
active = false
```

---

# 119. MEDIA

Assets editoriales públicos pueden gestionarse mediante una Collection de Media separada si se utiliza Payload Upload.

Pero:

**Evidence nunca pertenece a Media.**

---

# 120. MEDIA COLLECTION

Campos adicionales:

```txt
alt
caption
credit
source
license
```

---

# 121. MEDIA ACCESS

Public read para imágenes publicadas.

Upload:

```txt
reporter
photo_editor
editor
```

según reglas.

Delete restringido.

---

# 122. IMAGE DERIVATIVES

Configurar tamaños editoriales necesarios:

```txt
thumbnail
card
article
hero
og
```

Evitar generar 20 tamaños sin uso.

---

# 123. ADMIN GROUPING

Organizar Admin:

```txt
EDITORIAL
  Articles
  Investigations
  Data
  Opinion
  Video

NEWSROOM
  Authors
  Categories
  Topics
  People
  Organizations

RESEARCH
  Sources
  Evidence

OPERATIONS
  Corrections
  Redirects

SECURITY
  Users
  Access Grants
  Audit
```

---

# 124. ADMIN DESCRIPTIONS

Cada campo complejo debe explicar:

- qué significa;
- cuándo usarlo;
- quién lo verá.

No depender de conocimiento tribal.

---

# 125. CONDITIONAL UI

Puede ocultar campos según:

```txt
content type
status
role
```

pero recordar:

UI conditions ≠ security.

---

# 126. DRAFTS

Activar Payload drafts/versions en contenido editorial donde corresponda.

No usar únicamente:

```txt
editorialStatus=draft
```

como sustituto de versiones.

Ambos resuelven problemas diferentes.

---

# 127. VERSIONS

Habilitar versiones especialmente en:

```txt
Articles
Investigations
Opinions
DataStories
VideoStories
```

---

# 128. VERSION RETENTION

Definir límite razonable según storage.

Investigaciones pueden requerir mayor historial.

---

# 129. AUTOSAVE

Evaluar autosave para piezas largas.

Debe probarse que no genere cargas excesivas ni eventos downstream.

---

# 130. DRAFT HOOK RULE

No indexar ni revalidar frontend público por cada autosave de draft.

Search/revalidation pública:

solo cambios de estado relevantes.

---

# 131. PREVIEW

Construir URL de preview desde:

```txt
collection
slug
document ID
```

requiriendo sesión/autorización.

---

# 132. PREVIEW NOINDEX

Toda vista de preview:

```txt
noindex
```

y autenticada.

---

# 133. MIGRATIONS

Producción usa migraciones explícitas.

No permitir schema drift automático sin control.

---

# 134. MIGRATION DIRECTORY

```txt
src/payload/migrations/
```

o directorio establecido por configuración Payload.

Mantener todas las migraciones en Git.

---

# 135. MIGRATION NAMING

Ejemplo:

```txt
20260817_001_initial_editorial_schema

20260817_002_add_evidence_classification

20260818_001_add_article_search_indexes
```

---

# 136. MIGRATION RULE

Cada cambio persistente al modelo debe preguntar:

```txt
¿requiere migration?
```

antes de deploy.

---

# 137. SAFE MIGRATION PATTERN

Preferir:

```txt
1. add nullable field
2. deploy compatible code
3. backfill
4. validate
5. make required later
```

sobre cambios destructivos instantáneos.

---

# 138. RENAME FIELD

No tratar rename como:

```txt
delete old
add new
```

si hay datos de producción.

Crear migración explícita.

---

# 139. ENUM CHANGE

Eliminar opción de select usada por datos existentes requiere:

```txt
data migration
```

previa.

---

# 140. RELATIONSHIP CHANGE

Cambiar cardinalidad:

```txt
one → many
```

requiere revisar:

- data migration;
- frontend;
- queries;
- access;
- indexes.

---

# 141. PRE-MIGRATION BACKUP

Antes de migration estructural importante:

```txt
pg_dump
```

verificado.

---

# 142. MIGRATION CI

En CI:

crear Postgres vacío.

Ejecutar todas las migrations desde cero.

Después ejecutar tests.

Esto verifica que un servidor nuevo sea reconstruible.

---

# 143. MIGRATION STAGING

Orden:

```txt
local
↓
CI
↓
staging
↓
production
```

No probar por primera vez en production.

---

# 144. MIGRATION LOGGING

Registrar:

```txt
migration name
started
completed
failed
duration
release SHA
```

---

# 145. SEED

Crear seed idempotente para desarrollo.

Contenido:

```txt
users
authors
categories
topics

demo articles
demo investigation
```

Nunca datos reales sensibles.

---

# 146. DEMO LABEL

Toda noticia seed:

```txt
DEMO
CONTENIDO FICTICIO
```

---

# 147. TEST FACTORIES

Crear factories para tests:

```txt
createReporter()
createEditor()
createArticle()
createInvestigation()
createRestrictedEvidence()
```

---

# 148. ACCESS TESTS

Matriz:

```txt
role
×
collection
×
operation
×
document status
```

---

# 149. HOOK TESTS

Testear:

```txt
slug redirect creation
firstPublishedAt
search indexing
search removal
revalidation
audit events
workflow guard
```

---

# 150. EVIDENCE TESTS

```txt
Public anonymous metadata
→ safe projection only

Restricted anonymous
→ denied

Unassigned reporter
→ denied

Authorized investigator
→ allowed
```

---

# 151. TRANSACTION TEST

Cuando un publish falla:

no debe quedar:

```txt
partial audit
broken redirect
invalid workflow
```

inconsistente.

---

# 152. MEILISEARCH REBUILD

Crear command:

```txt
pnpm search:reindex
```

Flujo:

```txt
Payload
↓
published content
↓
transform DTO
↓
Meilisearch
```

---

# 153. REINDEX IDEMPOTENCY

Ejecutarlo dos veces debe generar mismo estado lógico.

---

# 154. SEARCH VERSIONING

Guardar:

```txt
SEARCH_SCHEMA_VERSION
```

Cuando cambie estructura importante:

crear nuevo índice y efectuar switch controlado si resulta necesario.

---

# 155. PAYLOAD CONFIG

`payload.config.ts` debe ser composición, no archivo monolítico de miles de líneas.

Ejemplo:

```ts
collections: [
  Users,
  Articles,
  Investigations,
  ...
],

globals: [
  SiteSettings,
  Navigation,
  Homepage,
]
```

---

# 156. NO GIANT FILES

Cada Collection:

archivo independiente o módulo pequeño.

Compartir field factories/access helpers.

---

# 157. NAMING CONVENTION

Código:

```txt
Articles
InvestigationTeams
EvidenceAccessGrants
```

Slugs:

```txt
articles
investigation-teams
evidence-access-grants
```

Campos:

```txt
camelCase
```

---

# 158. API STABILITY

Frontend no debe depender excesivamente de la forma completa de Payload.

Crear utilities/selectors para interfaces públicas críticas.

Esto permite evolucionar schema sin romper toda la UI.

---

# 159. PUBLIC DATA BOUNDARY

Definir explícitamente qué campos pueden salir a Internet.

Especialmente para:

```txt
Users
Evidence
Sources
Audit
InvestigationTeams
```

No depender de “el frontend no los solicita”.

---

# 160. REST / GRAPHQL

Si una API no es necesaria públicamente:

restringirla.

No asumir que endpoint desconocido = seguro.

---

# 161. GRAPHQL

Evaluar si realmente se necesita.

Si frontend usa Local API server-side, GraphQL puede permanecer sin papel relevante.

No crear dos arquitecturas de consulta simultáneas sin necesidad.

---

# 162. LOCAL API FIRST

Dentro del mismo Next.js server:

preferir Local API para operaciones server-side apropiadas.

Evitar:

```txt
Server Component
→ HTTP REST al mismo servidor
→ Payload
```

cuando no aporta valor.

---

# 163. CLIENT API

El navegador solo llama endpoints necesarios para interacción.

El contenido editorial inicial debe llegar server-rendered.

---

# 164. ADMIN CUSTOMIZATION

Crear componentes custom solo donde mejoren realmente workflow:

```txt
SEO Preview
Publication Checklist
Evidence Classification Warning
Workflow Status Panel
Investigation Review Panel
```

No reescribir todo Payload Admin.

---

# 165. PUBLICATION CHECKLIST

Panel:

```txt
Title ✓
Dek ✓
Author ✓
Category ✓
Hero ✓
Credit ✓
Sources ✓
Fact Check ✓
Legal ✓
SEO ✓
Evidence reviewed ✓
```

---

# 166. INVESTIGATION SECURITY WARNING

Si existen Evidence:

```txt
internal
restricted
```

mostrar advertencia antes de publicación:

```txt
This investigation references non-public evidence.
Review all public attachments before publishing.
```

---

# 167. EVIDENCE CLASSIFICATION UI

Colores pueden ayudar visualmente:

```txt
PUBLIC
INTERNAL
RESTRICTED
```

pero nunca ser único mecanismo para distinguir estado.

Usar texto/icono además.

---

# 168. HOOK FAILURE POLICY

Clasificar hooks:

## Critical

Debe abortar operación:

```txt
workflow authorization
security validation
DB integrity
```

## Non-critical

No debe abortar publicación:

```txt
Meilisearch sync
analytics notification
nonessential webhook
```

---

# 169. RETRYABLE JOBS

Operaciones no críticas externas deben poder reintentarse.

Ejemplo:

```txt
search indexing
social image generation
notifications
```

---

# 170. IDEMPOTENCY KEYS

Para jobs sensibles:

usar:

```txt
documentId
operation
version
```

para evitar duplicados.

---

# 171. OBSERVABILITY

Cada hook/job importante registra:

```txt
operation
document ID
duration
result
requestId
```

sin contenido sensible.

---

# 172. PERFORMANCE BUDGET

Evitar hooks que hagan:

```txt
5 queries por relation
×
100 documents
```

Medir N+1.

---

# 173. QUERY DESIGN

Homepage:

usar consultas específicas para homepage.

No cargar todas las relaciones posibles con `depth` alto.

---

# 174. CACHE BOUNDARY

Postgres/Payload:

source of truth.

Next cache:

delivery optimization.

Meilisearch:

search derivative.

Nunca mezclar responsabilidades.

---

# 175. DATA OWNERSHIP

```txt
Articles → Payload/Postgres

Evidence metadata → Payload/Postgres

Evidence bytes → MinIO

Search docs → Meilisearch

Complaints → Separate Denuncias DB
```

---

# 176. DEFINITION OF DONE

El modelo de Payload estará listo cuando:

1. todas las Collections estén tipadas;
2. Globals estén implementados;
3. Access Control tenga tests;
4. workflows estén enforced backend-side;
5. drafts y versions funcionen;
6. slugs publicados generen redirects cuando cambien;
7. autores/categorías/topics estén relacionados correctamente;
8. Evidence no exponga objetos restricted;
9. MinIO se acceda mediante capa autorizada;
10. Search se sincronice sin acoplar publicación;
11. Meilisearch pueda reconstruirse desde Payload;
12. hooks críticos sean transaccionalmente seguros;
13. audit events sean append-only;
14. migrations reconstruyan una DB vacía;
15. staging pueda ejecutar todas las migrations;
16. generated TypeScript compile;
17. frontend público no reciba campos internos;
18. ningún servicio de denuncias tenga relación DB con este modelo.

---

# 177. PRINCIPIO FINAL

El modelo de datos no debe reflejar solamente:

```txt
qué campos aparecen en una pantalla
```

Debe reflejar:

```txt
cómo funciona una redacción,
quién tiene autoridad,
qué contenido es público,
qué contenido está en revisión,
qué evidencia está protegida,
qué relaciones existen,
y qué acciones deben dejar trazabilidad.
```

**Payload es el sistema editorial de registro.  
Postgres conserva el estado editorial.  
MinIO conserva evidencia.  
Meilisearch distribuye búsqueda.  
El servicio de Denuncias permanece aislado.**

Ninguna de esas responsabilidades debe mezclarse por comodidad de implementación.