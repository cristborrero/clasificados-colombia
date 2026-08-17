# MASTER EXECUTION PROMPT — CLAUDE CODE

## Clasificados Colombia · Implementación completa

Actúa como **Staff Software Engineer + Principal Product Engineer + Technical Lead** responsable de implementar de extremo a extremo la nueva plataforma digital de **Clasificados Colombia**.

No estás diseñando una demo.

No estás creando una landing page.

No estás haciendo un prototipo visual.

Estás construyendo un **medio periodístico digital de producción**, con CMS editorial, frontend público, seguridad, búsqueda, evidencias, infraestructura y workflows reales.

---

# 1. FUENTE DE VERDAD

Antes de escribir código, localiza y lee completamente los documentos del proyecto.

La fuente de verdad debe seguir este orden:

```txt
01. PRD-MASTER-clasificados-colombia-v2.md

02. PRD-arquitectura-cms-payload-clasificados-colombia.md

03. PRD-SEO-Google-News-Discover.md

04. PRD-Infraestructura-DevOps-Seguridad-Deploy.md

05. PRD-Seguridad-RBAC-Evidence-Vault-Threat-Model.md

06. PRD-Servicio-Seguro-Denuncias.md

07. PRD-Modelo-Datos-Payload.md

08. PRD-Frontend-Editorial-Definitivo.md

09. PRD-Search-Discovery-Meilisearch.md

10. PRD-Media-Pipeline-DAM.md
```

Los nombres reales pueden variar ligeramente.

Localízalos por número/contenido.

---

# 2. PRECEDENCIA

Si dos documentos parecen contradecirse:

```txt
documento más reciente
>
documento anterior
```

Pero existe además esta regla:

```txt
PRD Master v2
+
PRD Arquitectura CMS Payload
```

reemplazan completamente las antiguas decisiones basadas en Sanity.

---

# 3. TECNOLOGÍA APROBADA

La arquitectura actual es:

```txt
Next.js
App Router

React
TypeScript strict

Payload CMS
integrado nativamente en el mismo proyecto Next.js

PostgreSQL

Tailwind CSS 4

MinIO
Evidence Vault

Meilisearch
Search

Payload Jobs
background jobs cuando corresponda

Coolify
deploy

Contabo
servidor principal
```

Servicio separado:

```txt
Denuncias App
+
Denuncias DB
+
Quarantine Storage
```

No introducir Sanity.

No introducir Algolia.

No introducir Firebase.

No introducir Supabase como reemplazo de Postgres/Payload.

No sustituir Meilisearch.

No cambiar Payload por otro CMS.

---

# 4. REGLA PRINCIPAL

## NO CONSTRUYAS TODO DE GOLPE

Trabaja en fases.

Cada fase debe terminar con:

```txt
implementation
↓
typecheck
↓
lint
↓
tests
↓
build
↓
manual verification
↓
brief implementation report
```

No continúes acumulando errores.

---

# 5. PRIMERA ACCIÓN

Antes de modificar cualquier archivo:

1. inspecciona todo el repositorio;
2. identifica stack existente;
3. identifica código reutilizable;
4. identifica código legacy;
5. localiza los PRD;
6. localiza assets de marca;
7. revisa `package.json`;
8. revisa configuración Next.js;
9. revisa TypeScript;
10. revisa Tailwind;
11. revisa Docker/Coolify si existe;
12. revisa variables de entorno existentes.

Después crea:

```txt
/docs/implementation/MASTER-IMPLEMENTATION-PLAN.md
```

---

# 6. MASTER IMPLEMENTATION PLAN

Debe contener:

```txt
Current state

Target architecture

Major gaps

Implementation phases

Dependencies

Risk areas

Migration requirements

Security boundaries

Definition of Done per phase
```

No empieces una reescritura masiva hasta completar este análisis.

---

# 7. NO DESTRUIR FUNCIONALIDAD ÚTIL

Si existe código funcional:

evalúa antes de reemplazarlo.

Clasifica:

```txt
KEEP
REFACTOR
REPLACE
REMOVE
```

Documenta las decisiones importantes.

---

# 8. FASE 0 — BASELINE

Antes de cambios importantes:

ejecuta:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Si alguno no existe:

identifica por qué.

Registra el estado inicial.

---

# 9. FASE 1 — FOUNDATION

Implementar primero los fundamentos.

Incluye:

```txt
Next.js project structure

TypeScript strict

environment validation

Tailwind 4

fonts

design tokens

global styles

layout primitives

container system

grid system

spacing

typography
```

No empezar homepage antes de que foundations existan.

---

# 10. DESIGN SYSTEM

Implementa exactamente la dirección visual del PRD.

Principios:

```txt
editorial
premium
serious
international
minimal
high-information
```

No SaaS.

No glassmorphism.

No gradients innecesarios.

No tarjetas redondeadas gigantes.

No sombras decorativas.

---

# 11. MARCA

Paleta principal:

```txt
Ink
#0A0A0A

Paper
#F7F6F2

Investigation Red
#D71920

White
#FFFFFF
```

Usar rojo como señal, no decoración.

---

# 12. TIPOGRAFÍA

Usar:

```txt
Playfair Display
→ display/editorial

Source Sans 3
→ body/interface
```

Cargar mediante `next/font`.

---

# 13. FASE 2 — PAYLOAD FOUNDATION

Configurar Payload dentro del mismo proyecto Next.js.

Implementar:

```txt
payload.config.ts

Postgres adapter

Users

authentication

generated types

admin panel

basic access helpers
```

No crear todavía todas las Collections sin antes comprobar que Payload + Postgres funcionan correctamente.

---

# 14. PAYLOAD TYPES

Configurar generación automática de:

```txt
payload-types.ts
```

Nunca mantener modelos duplicados manualmente si pueden derivarse de Payload.

---

# 15. FASE 3 — RBAC

Implementar primero:

```txt
roles
users
access helpers
collection access
field access
workflow guards
```

Antes de construir Evidence.

Roles:

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

---

# 16. SECURITY PRINCIPLE

Aplicar:

```txt
DENY BY DEFAULT
```

La seguridad debe vivir en backend.

Nunca confiar solo en ocultar botones del Admin.

---

# 17. ACCESS TESTS

Antes de continuar:

crear tests.

Ejemplos obligatorios:

```txt
Reporter cannot publish

Reporter cannot modify role

Anonymous cannot read draft

Editor cannot read unrelated restricted evidence

Contributor cannot edit another contributor's draft

Disabled user cannot authenticate
```

---

# 18. FASE 4 — CORE CONTENT MODEL

Implementar en este orden:

```txt
Authors

Categories

Topics

Media

Articles

Opinions

DataStories

VideoStories
```

Después:

```txt
People

Organizations

Sources
```

---

# 19. ARTICLE

Implementar completamente:

```txt
title
slug
dek
authors
category
topics
hero
body
publication
workflow
relations
seo
```

Activar:

```txt
drafts
versions
```

---

# 20. SLUG SYSTEM

Construir utilidad reutilizable.

Requisitos:

```txt
auto-generation

normalization

unique

lock after first publication

redirect creation if changed
```

---

# 21. FASE 5 — INVESTIGATIONS

Implementar Collection independiente:

```txt
Investigations
```

No convertirla en un simple Article type.

Debe soportar:

```txt
chapters
key findings
timeline
people
organizations
sources
evidence
methodology
updates
workflow
SEO
```

---

# 22. INVESTIGATION PUBLISH GUARD

No permitir publicación si faltan las condiciones requeridas.

Por ejemplo:

```txt
factCheckStatus = verified

legalStatus = approved

methodology exists

author exists

workflow approved
```

---

# 23. FASE 6 — EVIDENCE METADATA

Crear:

```txt
Evidence

EvidenceAccessGrants

InvestigationTeams

AuditEvents
```

Payload almacena metadata.

Payload NO almacena el archivo físico de evidencia.

---

# 24. MINIO

Implementar integración separada.

Buckets:

```txt
evidence-public

evidence-internal

evidence-restricted
```

Nunca usar root credentials desde aplicación.

---

# 25. EVIDENCE ACCESS

Flujo obligatorio:

```txt
Request
↓
Authentication
↓
Authorization
↓
Classification
↓
Grant / team check
↓
Audit event
↓
Temporary presigned URL
```

Nunca devolver `objectKey` directamente al cliente público.

---

# 26. RESTRICTED

Restricted requiere:

```txt
role permitted
+
need-to-know
```

No basta con ser Editor.

---

# 27. PUBLIC EVIDENCE

Para publicar evidencia:

crear proyección pública explícita.

Nunca exponer el documento Payload completo.

---

# 28. FASE 7 — AUDIT

Implementar eventos append-only.

Debe registrar como mínimo:

```txt
login failure

user role change

publish

unpublish

classification change

restricted evidence access

access grant

access revoke
```

---

# 29. AUDIT SECURITY

`AuditEvents`:

```txt
update = deny
delete = deny
```

excepto proceso excepcional de mantenimiento claramente documentado.

---

# 30. FASE 8 — FRONTEND FOUNDATION

Construir:

```txt
SiteHeader
PrimaryNav
MobileNav
BreakingNewsBar
SiteFooter

Container
Grid
Stack
Section
Divider
SectionHeader
```

Validar mobile antes de continuar.

---

# 31. FASE 9 — EDITORIAL COMPONENTS

Construir:

```txt
HomepageHero

ArticleCard
ArticleCardCompact
ArticleCardHorizontal
ArticleCardFeatured

InvestigationCard
OpinionCard
DataCard
VideoCard

LatestNewsList
```

No crear una mega-card con decenas de props.

---

# 32. FASE 10 — HOMEPAGE

Construir homepage real.

Estructura:

```txt
Hero

Secondary stories

Latest

Investigations

Analysis

National / sections

Data

Video

Opinion

Newsletter

Footer
```

Debe existir jerarquía.

No mostrar veinte tarjetas con el mismo peso.

---

# 33. FASE 11 — ARTICLE PAGE

Implementar:

```txt
Breadcrumbs

Eyebrow

Headline

Dek

Byline

Publication metadata

Hero

Caption

ArticleBody

Sources

Corrections

Related content
```

---

# 34. READING EXPERIENCE

Article body:

```txt
680–760px
```

aproximadamente en desktop.

No saturarlo con widgets.

---

# 35. RICH TEXT

Payload Rich Text debe renderizar:

```txt
paragraph
H2
H3
image
gallery
quote
fact box
callout
evidence reference
timeline
chart
source note
correction
embed
```

---

# 36. FASE 12 — INVESTIGATION FRONTEND

Construir:

```txt
InvestigationHero

InvestigationContents

KeyFindings

InvestigationChapter

EditorialTimeline

EntityList

EvidenceSection

Methodology
```

Debe sentirse especial, pero parte del mismo Design System.

---

# 37. FASE 13 — AUTHOR / CATEGORY / TOPIC

Implementar:

```txt
/autor/[slug]

/politica
/justicia
/etc.

/tema/[slug]
```

No simples listados.

Deben tener jerarquía editorial.

---

# 38. FASE 14 — MEILISEARCH

Configurar Meilisearch.

Índices iniciales:

```txt
editorial_content

entities

authors
```

---

# 39. SEARCH SETTINGS AS CODE

Versionar:

```txt
searchableAttributes

filterableAttributes

sortableAttributes

rankingRules

synonyms

typoTolerance
```

No configurar exclusivamente desde dashboard.

---

# 40. SEARCH SYNC

No bloquear publicación esperando Meilisearch.

Usar:

```txt
Payload Hook
↓
Payload Job
↓
Meilisearch
```

---

# 41. SEARCH REINDEX

Crear:

```bash
pnpm search:reindex
```

Debe reconstruir completamente Search desde Payload.

---

# 42. SEARCH SECURITY

Solo contenido:

```txt
published
+
public
```

Puede entrar al índice.

Nunca:

```txt
draft
internal
restricted
audit
denuncias
```

---

# 43. FASE 15 — SEARCH UI

Crear:

```txt
SearchDialog
SearchAutocomplete
SearchPage
SearchResultItem
SearchFilters
```

Meilisearch debe estar detrás de una capa/adapter estable.

---

# 44. FASE 16 — MEDIA PIPELINE

Implementar Collection:

```txt
Media
```

separada completamente de Evidence.

---

# 45. MEDIA METADATA

Campos:

```txt
alt
caption
credit
source
license
copyrightHolder
rightsExpiration
usageNotes
```

---

# 46. IMAGE PIPELINE

Conservar:

```txt
original
```

y generar únicamente derivados necesarios.

Ejemplos:

```txt
thumbnail
card
article
hero
og
```

---

# 47. MODERN FORMATS

Evaluar/generar:

```txt
AVIF
WebP
```

manteniendo original.

---

# 48. EXIF

No exponer EXIF sensible públicamente.

Especialmente GPS.

---

# 49. FASE 17 — SEO

Implementar todo el PRD SEO.

Incluye:

```txt
Metadata API

canonical

Open Graph

NewsArticle JSON-LD

Organization

Person

BreadcrumbList

VideoObject

sitemap

news sitemap

robots

author pages

publication dates
```

---

# 50. NEWS SITEMAP

Crear:

```txt
/news-sitemap.xml
```

desde Payload.

Solo contenido elegible reciente.

---

# 51. STRUCTURED DATA

Generar server-side.

No permitir que editores escriban JSON-LD manual.

---

# 52. GOOGLE DISCOVER

Asegurar:

```txt
large images

max-image-preview:large

>= 1200px hero when available
```

---

# 53. FASE 18 — REDIRECTS

Implementar colección:

```txt
Redirects
```

y middleware/resolver apropiado.

No romper URLs publicadas.

---

# 54. FASE 19 — CORRECTIONS

Implementar:

```txt
Corrections
```

con tipos:

```txt
correction
clarification
update
editor_note
```

Mostrar de manera visible en Article.

---

# 55. FASE 20 — ADMIN UX

Mejorar Payload Admin solo donde aporte valor.

Componentes sugeridos:

```txt
PublicationChecklist

SEOPreview

WorkflowPanel

EvidenceClassificationWarning

SearchHealth

RightsWarning
```

No reescribir todo el Admin.

---

# 56. FASE 21 — PAYLOAD JOBS

Formalizar jobs para:

```txt
search sync
media processing
revalidation
background notifications
```

Clasificar:

```txt
critical
non-critical
```

---

# 57. FASE 22 — INFRASTRUCTURE

Crear/actualizar:

```txt
Dockerfile

docker-compose.yml

health endpoints

environment validation

persistent volumes

networks
```

---

# 58. NETWORKS

Separar:

```txt
public

editorial-internal

evidence-internal

denuncias-internal
```

---

# 59. NO PUBLIC DATABASES

No publicar Internet:

```txt
5432
7700
9000
9001
```

---

# 60. HEALTH

Crear:

```txt
/api/health/live
/api/health/ready
```

cuando la arquitectura lo permita.

---

# 61. FASE 23 — COOLIFY

Preparar documentación exacta para deploy en Coolify.

Debe incluir:

```txt
services
domains
environment variables
persistent volumes
health checks
deployment order
migration strategy
```

---

# 62. MIGRATIONS

Payload/Postgres:

usar migrations explícitas.

Nunca depender de cambios automáticos de producción.

---

# 63. MIGRATION WORKFLOW

```txt
backup
↓
migration
↓
deploy
↓
health
↓
smoke test
```

---

# 64. MIGRATION TEST

CI debe poder:

```txt
create empty Postgres
↓
run all migrations
↓
build
```

---

# 65. FASE 24 — BACKUPS

Implementar/documentar:

```txt
Postgres backup

Media backup

MinIO Evidence backup

offsite backup
```

Meilisearch es reconstruible.

---

# 66. FASE 25 — DENUNCIAS

IMPORTANTE:

No construir esto dentro de Payload.

Debe estar aislado según PRD Nº 6.

Si actualmente vive en el mismo monorepo:

mantener separación lógica/deploy/DB estricta.

---

# 67. DENUNCIAS

Arquitectura:

```txt
denuncias-app

denuncias-db

quarantine storage

scanner worker
```

---

# 68. NO FOREIGN KEY

No conectar directamente con Payload.

---

# 69. TRANSFER

Solo:

```txt
human approval
↓
controlled export
↓
new Payload investigation
```

---

# 70. NO AUTO-PUBLISH

Una denuncia jamás genera automáticamente:

```txt
Article
Investigation
Breaking News
```

---

# 71. SECURITY QA

Antes de producción probar:

```txt
RBAC

field access

draft isolation

restricted evidence

MinIO access

search leaks

admin permissions

session security

uploads
```

---

# 72. PUBLIC DATA BOUNDARY

Crear mappers:

```txt
toPublicArticle()

toPublicInvestigation()

toPublicAuthor()

toPublicMedia()

toPublicEvidence()
```

No enviar objetos Payload completos al browser.

---

# 73. LOCAL API

Preferir Payload Local API server-side.

Pero respetar Access Control conscientemente.

Nunca usar `overrideAccess` como default.

---

# 74. SERVER COMPONENTS

Default:

```txt
Server Components
```

Client Components solo para:

```txt
interaction

search

dialogs

forms

browser APIs
```

---

# 75. PERFORMANCE

No sacrificar arquitectura por Lighthouse.

Pero mantener objetivos:

```txt
LCP < 2.5s

INP < 200ms

CLS < 0.1
```

---

# 76. IMAGE PERFORMANCE

Usar correctamente:

```txt
next/image
sizes
responsive derivatives
lazy loading
```

---

# 77. ACCESSIBILITY

Cumplir:

```txt
WCAG 2.2 AA
```

Implementar:

```txt
keyboard
focus
semantic HTML
skip link
ARIA where necessary
reduced motion
contrast
```

---

# 78. RESPONSIVE QA

Probar explícitamente:

```txt
360
390
430
768
1024
1280
1440
1920
```

---

# 79. CONTENT QA

Probar:

```txt
very long headline
short headline
no image
multiple authors
long investigation
empty related content
breaking news
correction
```

---

# 80. NO LOREM IPSUM

Crear datos demo periodísticos claramente marcados como:

```txt
DEMO
CONTENIDO FICTICIO
```

---

# 81. TESTING STRATEGY

Implementar:

```txt
unit

integration

E2E

authorization

accessibility
```

---

# 82. E2E CRITICAL

Como mínimo:

```txt
Homepage → Article

Homepage → Investigation

Article → Author

Search → Result

Admin → Draft → Preview

Editor → Publish

Restricted Evidence → authorized access

Restricted Evidence → unauthorized denial
```

---

# 83. QUALITY GATE

Antes de declarar cualquier fase terminada:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Todos deben pasar.

---

# 84. NO SILENCING ERRORS

No resolver TypeScript mediante:

```ts
any
```

No resolver lint mediante:

```txt
eslint-disable
```

indiscriminadamente.

No eliminar tests para conseguir green build.

---

# 85. DEPENDENCY POLICY

Antes de añadir una librería:

pregunta:

```txt
¿Next.js/Payload/CSS/platform ya resuelve esto?
```

Mantener dependencias mínimas.

---

# 86. DOCUMENTATION AS YOU BUILD

Actualizar:

```txt
/docs/
```

durante cada fase.

No esperar al final.

---

# 87. IMPLEMENTATION LOG

Crear:

```txt
/docs/implementation/IMPLEMENTATION-LOG.md
```

Registrar:

```txt
date
phase
changes
decisions
migrations
known issues
next step
```

---

# 88. ARCHITECTURE DECISIONS

Para decisiones importantes crear:

```txt
/docs/adr/
```

Ejemplo:

```txt
ADR-001-payload-local-api.md

ADR-002-evidence-storage.md

ADR-003-search-sync.md
```

---

# 89. STOP CONDITIONS

DETENTE antes de continuar si:

```txt
build fails

migration is destructive

security requirement is ambiguous

PRDs conflict materially

existing production data may be lost

Evidence could be exposed

Denuncias isolation could be broken
```

Explica el problema antes de improvisar.

---

# 90. NO REARCHITECTURE WITHOUT REASON

No reemplaces tecnología aprobada porque prefieras otra.

No digas:

```txt
“Supabase sería más fácil”
“Sanity sería más rápido”
“Algolia sería mejor”
```

La arquitectura ya fue decidida.

---

# 91. VISUAL STANDARD

La implementación final debe sentirse como:

```txt
international investigative journalism
+
modern editorial product
+
precision
+
trust
```

No como un theme de WordPress.

---

# 92. EDITORIAL STANDARD

Debe quedar claramente diferenciado:

```txt
NEWS

INVESTIGATION

ANALYSIS

OPINION

DATA

VIDEO
```

---

# 93. SECURITY STANDARD

El usuario público no puede conocer la existencia de:

```txt
draft investigations

restricted evidence

internal sources

access grants

audit events

internal users

review notes
```

---

# 94. FINAL PRODUCTION CHECKLIST

Antes de declarar production-ready:

```txt
Build green

TypeScript green

Tests green

Migrations green

RBAC verified

Evidence verified

Search verified

SEO verified

News Sitemap verified

Accessibility verified

Responsive verified

Backups documented

Health checks working

Coolify deploy documented

No sensitive ports exposed

No leaked secrets

No draft indexing

No restricted indexing

No Denuncias ↔ Payload DB coupling
```

---

# 95. FINAL DELIVERABLES

Al finalizar entrega:

```txt
working application

Payload Admin

Postgres migrations

Meilisearch search

MinIO integration

frontend

SEO

tests

Docker

Coolify configuration

documentation

runbooks
```

---

# 96. FORMA DE TRABAJAR

No me pidas autorización para cada archivo.

Trabaja autónomamente dentro de la arquitectura aprobada.

Pero:

**no tomes decisiones irreversibles silenciosamente.**

Si aparece una decisión arquitectónica realmente nueva:

1. documenta el problema;
2. presenta opciones;
3. recomienda una;
4. detente antes de introducir una ruptura importante.

---

# 97. INSTRUCCIÓN DE INICIO

Comienza ahora únicamente con:

```txt
STEP 1
Repository audit

STEP 2
Read all PRDs

STEP 3
Create MASTER-IMPLEMENTATION-PLAN.md

STEP 4
Report:
- current architecture
- gaps
- conflicts
- implementation phases
- first phase you recommend starting
```

**NO EMPIECES A REESCRIBIR TODA LA APLICACIÓN EN TU PRIMERA RESPUESTA.**

Primero comprende el sistema.

Después construye.

---

# 98. PRINCIPIO FINAL

Cuando tengas que decidir entre:

```txt
rápido pero frágil
```

y:

```txt
simple, correcto y mantenible
```

elige lo segundo.

Cuando tengas que decidir entre:

```txt
más efecto visual
```

y:

```txt
mejor jerarquía editorial
```

elige lo segundo.

Cuando tengas que decidir entre:

```txt
comodidad de implementación
```

y:

```txt
seguridad de evidencia o fuentes
```

elige lo segundo.

El objetivo no es terminar código.

El objetivo es construir **Clasificados Colombia como una plataforma periodística real, segura, rápida y de talla internacional.**

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
