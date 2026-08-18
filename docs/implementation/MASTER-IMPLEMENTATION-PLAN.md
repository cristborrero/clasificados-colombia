# MASTER IMPLEMENTATION PLAN

## Clasificados Colombia · Plataforma Editorial Digital v2

**Fecha:** 2026-08-17
**Estado:** Repository Audit completado · Sin implementación iniciada
**Fuente de verdad:** `/docs/prd/` (10 documentos) + `CLAUDE.md`

---

# 1. CURRENT STATE

## 1.1 Inventario real del repositorio

Auditoría exhaustiva ejecutada sobre el directorio de trabajo. **17 archivos en total.**

```txt
00-clasificados-colombia-v2/
├── CLAUDE.md                          (2040 líneas)
├── .atl/
│   ├── .skill-registry.cache.json
│   └── skill-registry.md              (registro de skills, tooling agentico)
└── docs/
    ├── img/
    │   └── sistema-web-editorial-clasificados-colombia.png
    └── prd/
        ├── PRD-MASTER-clasificados-colombia-v2.md                     (1623)
        ├── PRD-arquitectura-cms-payload-clasificados-colombia.md      (509)
        ├── PRD — SEO, GOOGLE NEWS, DISCOVER Y AUTORIDAD EDITORIAL.md  (2097)
        ├── PRD — INFRAESTRUCTURA, DEVOPS, SEGURIDAD Y DEPLOY.md       (2665)
        ├── PRD — SEGURIDAD EDITORIAL, RBAC, EVIDENCE VAULT...md       (2380)
        ├── PRD — SERVICIO SEGURO DE DENUNCIAS.md                      (2049)
        ├── PRD — MODELO DE DATOS DEFINITIVO PAYLOAD.md                (3182)
        ├── PRD — FRONTEND EDITORIAL DEFINITIVO.md                     (2686)
        ├── PRD — SEARCH & DISCOVERY.md                                (2199)
        ├── PRD — MEDIA PIPELINE & DIGITAL ASSET MANAGEMENT.md         (2326)
        └── MASTER EXECUTION PROMPT — CLAUDE CODE.md                   (2038)
```

## 1.2 Conclusión del audit

**El proyecto es greenfield absoluto.** No existe:

| Elemento                            | Estado                                                               |
| ----------------------------------- | -------------------------------------------------------------------- |
| Repositorio Git                     | ❌ No inicializado                                                   |
| `package.json`                      | ❌ No existe                                                         |
| `src/`                              | ❌ No existe                                                         |
| Next.js / React / TypeScript        | ❌ No instalado                                                      |
| Payload CMS                         | ❌ No instalado                                                      |
| `payload.config.ts`                 | ❌ No existe                                                         |
| Migraciones Postgres                | ❌ No existen                                                        |
| `Dockerfile` / `docker-compose.yml` | ❌ No existen                                                        |
| Variables de entorno (`.env*`)      | ❌ No existen                                                        |
| Assets de marca (logo SVG, favicon) | ❌ No existen                                                        |
| Tests                               | ❌ No existen                                                        |
| Código legacy                       | ✅ Ninguno (no hay nada que clasificar KEEP/REFACTOR/REPLACE/REMOVE) |

**Implicación directa:** las secciones 5 y 7 de `CLAUDE.md` (identificar código reutilizable, no destruir funcionalidad útil, clasificar legacy) no aplican en esta etapa. No hay riesgo de destrucción. La Fase 0 no es "baseline de un sistema existente" sino **scaffold inicial**.

## 1.3 Toolchain local verificado

```txt
Node.js     v22.17.0     ✅ compatible con Payload 3 / Next.js
pnpm        10.28.2      ✅
corepack    0.33.0       ✅ permite fijar packageManager
Docker      29.7.1       ✅
```

## 1.4 Hallazgo sobre `CLAUDE.md`

`CLAUDE.md` es una **copia literal** de `docs/prd/MASTER EXECUTION PROMPT — CLAUDE CODE.md` (2040 vs 2038 líneas; única diferencia: un salto de línea). Es un prompt de arranque de una sola ejecución, no una guía operativa de repositorio.

Consecuencia práctica: se duplica el mismo contenido en dos ubicaciones y no existe documento que capture comandos de build, arquitectura efectiva ni convenciones del código. Se recomienda, tras la Fase 0, reemplazar `CLAUDE.md` por una guía operativa corta (comandos, estructura resuelta, invariantes de seguridad, precedencia documental) y mantener el prompt maestro únicamente en `docs/prd/`.

---

# 2. TARGET ARCHITECTURE

## 2.1 Topología de servicios (Contabo VPS 12 GB + Coolify)

```txt
Internet
   │
   ▼
Reverse Proxy / TLS (Coolify)
   │
   ├── clasificadoscolombia.com ─────────► web  (Next.js + Payload, mismo proceso)
   │                                        │
   │                                        ├──► postgres   (clasificados_prod)
   │                                        ├──► meilisearch
   │                                        └──► minio      (Evidence Vault)
   │
   └── denuncias.clasificadoscolombia.com ► denuncias-app   (AISLADO)
                                            │
                                            ├──► denuncias-db (denuncias_prod)
                                            ├──► quarantine storage
                                            └──► scanner-worker
```

## 2.2 Redes Docker (aislamiento obligatorio)

```txt
public              → web, denuncias-app
editorial-internal  → web, postgres, meilisearch
evidence-internal   → web, minio
denuncias-internal  → denuncias-app, denuncias-db, quarantine, scanner-worker
```

Nunca publicar a Internet: `5432`, `7700`, `9000`, `9001`. Host expone solo `22`, `80`, `443`.

## 2.3 Propiedad del dato (frontera inviolable)

```txt
Articles / Investigations / metadata   → Payload + Postgres   (fuente canónica)
Bytes de evidencia                     → MinIO                (nunca en Postgres)
Índice de búsqueda                     → Meilisearch          (derivado, reconstruible)
Denuncias ciudadanas                   → DB separada          (sin FK con Payload)
```

## 2.4 Stack aprobado

Next.js (App Router) · React · TypeScript strict · Tailwind CSS 4 · Payload CMS 3 self-hosted como plugin nativo de Next.js · PostgreSQL · Meilisearch · MinIO · Payload Jobs · Zod · Lucide · `next/font` · `next/image` · pnpm · Docker · Coolify.

**Prohibido introducir:** Sanity, Algolia, Firebase, Supabase como reemplazo de Postgres/Payload, otro CMS, Bootstrap, Material UI, Chakra, jQuery, page builders.

## 2.5 Estructura de código resuelta

Resuelve el conflicto entre PRD Master §52, PRD Nº7 §3 y PRD Nº8 §22 (ver §4.1). Prevalece PRD Nº7 para la capa Payload y PRD Nº8 para la capa frontend.

```txt
src/
├── app/
│   ├── (frontend)/                 rutas públicas
│   └── (payload)/                  admin + API Payload
│
├── payload/
│   ├── collections/                un archivo/módulo por Collection
│   ├── globals/
│   ├── fields/                     field factories reutilizables
│   ├── blocks/                     bloques Lexical
│   ├── access/                     roles.ts, helpers.ts, por-collection
│   ├── hooks/
│   │   ├── editorial/
│   │   ├── search/
│   │   ├── redirects/
│   │   ├── audit/
│   │   ├── publication/
│   │   ├── evidence/
│   │   └── revalidation/
│   ├── utilities/
│   ├── validations/
│   ├── jobs/
│   └── migrations/
│
├── search/                         client, config, indexes, settings,
│                                   transform, jobs, query, analytics, reindex
├── evidence/                       cliente MinIO + autorización + presigned
├── editorial/                      reglas de workflow y publicación
│
├── components/
│   ├── brand/  layout/  navigation/  editorial/  articles/
│   ├── investigations/  evidence/  media/  search/
│   ├── forms/  feedback/  ui/
│
├── data/                           getHomepage(), getArticleBySlug(), ...
├── styles/
├── types/
└── payload.config.ts
```

## 2.6 Estructura de rutas públicas

```txt
/                          /investigacion          /investigacion/[slug]
/politica                  /justicia               /denuncia
/analisis                  /datos                  /opinion
/video                     /autores                /autor/[slug]
/tema/[slug]               /articulo/[slug]        /documentos/[slug]
/buscar                    /nosotros               /contacto
/denunciar  (→ redirige al servicio aislado)       /newsletter
/quienes-somos  /equipo  /principios-editoriales  /metodologia  /correcciones  /fuentes
```

## 2.7 Modelo de datos objetivo

**Collections (18):** `Users` · `Articles` · `Investigations` · `Opinions` · `DataStories` · `VideoStories` · `Authors` · `Categories` · `Topics` · `People` · `Organizations` · `Evidence` · `Sources` · `Media` · `Corrections` · `Redirects` · `AuditEvents` · `EvidenceAccessGrants` · `InvestigationTeams`

**Globals (5):** `SiteSettings` · `Navigation` · `Homepage` · `EditorialSettings` · `BreakingNews`*

*Ver conflicto C-04 (§4.4): decisión pendiente Global vs Collection.

**Roles (9, snake_case):** `administrator` · `editor_in_chief` · `investigative_editor` · `editor` · `reporter` · `fact_checker` · `legal_reviewer` · `photo_editor` · `contributor`

**Máquina de estados editorial:**

```txt
draft → editing → fact_check → legal_review → approved → scheduled → published → archived
```

Con ruta simplificada permitida para noticias que no requieren revisión legal.

---

# 3. MAJOR GAPS

Diferencia entre estado actual (nada) y arquitectura objetivo. Ordenados por criticidad de bloqueo.

## 3.1 Gaps de fundación (bloquean todo)

| #    | Gap                                           | Impacto                                  |
| ---- | --------------------------------------------- | ---------------------------------------- |
| G-01 | No existe repositorio Git                     | Sin trazabilidad, sin rollback, sin CI   |
| G-02 | No existe proyecto Next.js + Payload          | Bloquea el 100% del trabajo              |
| G-03 | No existe Postgres local ni de staging        | Bloquea Payload, migraciones, tests      |
| G-04 | Sin `packageManager` fijado ni lockfile       | Builds no reproducibles                  |
| G-05 | Sin scripts `lint`/`typecheck`/`test`/`build` | El Quality Gate del PRD no es ejecutable |

## 3.2 Gaps de assets y decisiones de negocio (bloquean fases concretas)

| #    | Gap                                                                                       | Bloquea              |
| ---- | ----------------------------------------------------------------------------------------- | -------------------- |
| G-06 | **No existen assets de marca**: logo SVG, wordmark, favicon, manifest                     | F1, F8, F16          |
| G-07 | **Dominio canónico sin decidir**: apex vs `www`                                           | F16 (SEO), F19 (TLS) |
| G-08 | **Proveedor de newsletter sin definir**: ningún PRD lo especifica                         | F10, F13             |
| G-09 | **Herramienta de analytics sin elegir** (solo "respetuosa con privacidad")                | F16                  |
| G-10 | **Proveedor SMTP sin definir** (Payload requiere email transaccional para reset password) | F2                   |
| G-11 | **Error monitoring sin elegir** (Sentry vs GlitchTip self-hosted)                         | F19                  |
| G-12 | Sin credenciales/acceso a Contabo ni Coolify                                              | F20                  |
| G-13 | Sin contenido demo periodístico redactado (prohibido lorem ipsum)                         | F9, F10, F11         |
| G-14 | Sin diccionario editorial de sinónimos ni golden queries                                  | F14                  |

## 3.3 Gaps de infraestructura

| #    | Gap                                                        |
| ---- | ---------------------------------------------------------- |
| G-15 | Sin `Dockerfile` multistage ni `docker-compose.yml`        |
| G-16 | Sin política de backups (Postgres, MinIO, offsite cifrado) |
| G-17 | Sin runbooks de disaster recovery                          |
| G-18 | Sin CI (pipeline de migraciones sobre Postgres vacío)      |
| G-19 | Sin entorno de staging                                     |

## 3.4 Gaps de seguridad

| #    | Gap                                                                                      |
| ---- | ---------------------------------------------------------------------------------------- |
| G-20 | Sin estrategia MFA definida (Payload core no la cubre nativamente para todos los flujos) |
| G-21 | Sin CSP diseñada contra integraciones reales                                             |
| G-22 | Sin política de retención de audit ni de denuncias validada legalmente                   |
| G-23 | Sin responsable de seguridad designado (PRD Nº5 §127 lo exige explícitamente)            |

---

# 4. CONFLICTOS ENTRE PRDs

Regla de precedencia aplicada (`CLAUDE.md` §2): documento más reciente > anterior; PRD Master v2 + PRD Arquitectura CMS reemplazan decisiones basadas en Sanity.

## 4.1 C-01 · Estructura de carpetas — RESUELTO

| Fuente                  | Propone                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| PRD Master §52          | `src/collections/`, `src/globals/`, `src/access/`, `src/hooks/`, `src/lib/queries/`                    |
| PRD Nº7 §3 (DEFINITIVO) | `src/payload/{collections,globals,access,hooks,...}`, `src/search/`, `src/evidence/`, `src/editorial/` |
| PRD Nº8 §22, §128       | `src/components/...`, `src/data/`                                                                      |

**Resolución:** prevalece PRD Nº7 (posterior y marcado "DEFINITIVO") para la capa Payload; PRD Nº8 para la capa frontend. Estructura consolidada en §2.5. `src/lib/queries/` queda descartado en favor de `src/data/`.

## 4.2 C-02 · Roles: cantidad y nomenclatura — RESUELTO

| Fuente                                  | Roles                                                                  |
| --------------------------------------- | ---------------------------------------------------------------------- |
| PRD Arquitectura CMS §34                | 7 roles, camelCase: `editorInChief`, `factChecker`, `legalReviewer`... |
| PRD Nº5 §6, PRD Nº7 §7, `CLAUDE.md` §15 | 9 roles, snake_case, incluye `investigative_editor` y `photo_editor`   |

**Resolución:** 9 roles en snake_case. `investigative_editor` es imprescindible (PRD Nº5 §8 le asigna autoridad sobre evidencia internal y desclasificación); `photo_editor` es imprescindible (PRD Nº10 §48 define permisos de upload).

## 4.3 C-03 · Nombre de la colección de evidencia — RESUELTO

PRD Arquitectura CMS §16 la llama `evidenceDocuments`; PRD Nº5 §28 y PRD Nº7 §65 la llaman `evidence`.

**Resolución:** `Evidence` (código) / `evidence` (slug). Documentos posteriores y coherentes entre sí.

## 4.4 C-04 · BreakingNews: Global o Collection — **DECISIÓN PENDIENTE**

| Fuente                                   | Propone                                                                                                     |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| PRD Master §23, PRD Arquitectura CMS §25 | Collection `breakingNews`                                                                                   |
| PRD Nº7 §5 y §86                         | Global `BreakingNews`, con nota: _"Si se necesita historial/editorial audit completo, utilizar Collection"_ |

**Análisis:** PRD Nº5 §54 exige registrar eventos de publicación auditables; PRD Nº9 §133 exige retirar el boost de búsqueda cuando expira una alerta, lo que implica poder identificar la alerta concreta. Un Global no conserva historial y complica la auditoría.

**Recomendación:** **Collection `BreakingNews`** con resolver de "alerta activa" (`enabled AND startsAt <= now < expiresAt`, ordenada por severidad). Cumple la condición explícita que el propio PRD Nº7 establece para preferir Collection. Requiere ADR.

## 4.5 C-05 · `timelineEvents` — **DECISIÓN PENDIENTE**

PRD Master §23 y PRD Arquitectura CMS §3 la listan como Collection. PRD Nº7 §4 (registry definitivo) **la omite**, y PRD Nº7 §51 modela `timeline[]` como array dentro de `Investigations`.

**Recomendación:** iniciar como array field dentro de `Investigations` (PRD Nº7). Promover a Collection solo si aparece necesidad real de reutilizar eventos entre investigaciones. Requiere ADR si se promueve.

## 4.6 C-06 · `editorialStatus` vs `_status` nativo de Payload — **DECISIÓN PENDIENTE (CRÍTICA)**

PRD Arquitectura CMS §4 declara `editorialStatus` como _"la única fuente de verdad"_ para publicación. PRD Nº7 §126 declara que drafts/versions nativos y `editorialStatus` _"resuelven problemas diferentes"_ y deben coexistir. PRD Nº7 §44 usa `_status = published` como criterio de lectura pública anónima.

**Riesgo:** dos fuentes de verdad de publicación produce contenido visible públicamente con `editorialStatus` en revisión, o lo contrario. Es un riesgo de seguridad editorial, no cosmético.

**Recomendación:** contrato único e invariante —

- `_status` (Payload nativo) = **visibilidad pública**. Es lo que filtra la lectura anónima.
- `editorialStatus` = **posición en el flujo de redacción**. Es lo que gobierna quién puede modificar y quién puede transicionar.
- **Invariante enforced en `beforeChange`:** `_status = published` ⟹ `editorialStatus ∈ {published, archived}`. Cualquier intento de publicar con `editorialStatus` anterior se rechaza en backend.

Requiere ADR-001 antes de la Fase 4.

## 4.7 C-07 · Health endpoints — RESUELTO

PRD Nº4 §70 pide `/api/health`; `CLAUDE.md` §60 pide `/api/health/live` y `/api/health/ready`; PRD Nº4 §71 admite separarlos si la infraestructura lo permite.

**Resolución:** implementar los tres. `/api/health/live` (proceso vivo, sin dependencias), `/api/health/ready` (DB alcanzable), `/api/health` como alias de readiness. PRD Nº9 §118: Meilisearch caído **no** debe hacer fallar readiness.

## 4.8 C-08 · shadcn/ui + Base UI simultáneos — **RESUELTO (ADR-002, 2026-08-18)**

PRD Master §8 y PRD Nº8 §2 listan ambos. shadcn/ui se apoya históricamente en Radix; sumar Base UI introduce dos librerías de primitives para el mismo propósito, en contra de la política de dependencias mínimas (PRD Master §8, `CLAUDE.md` §85).

**Resolución (ADR-002):** Radix Primitives, instalados primitive por primitive. Base UI queda habilitada como excepción puntual, no como default, en los términos condicionales del PRD (*«cuando aporte accesibilidad»*). Motivo verificado el 2026-08-18: Base UI publica `1.0.0-rc.0` — un release candidate — mientras `@radix-ui/react-dialog` publica `1.1.23` estable; y *«shadcn/ui solo como primitives»* se resuelve en la práctica a Radix, porque shadcn no es dependencia de runtime sino un generador cuyo aporte estilado prohíbe PRD Master §321. Detalle en `docs/adr/ADR-002-libreria-de-primitives.md`.

## 4.9 C-09 · Ubicación del servicio de Denuncias — **DECISIÓN PENDIENTE**

PRD Nº6 §2 exige app, DB y storage separados. `CLAUDE.md` §66 admite: _"Si actualmente vive en el mismo monorepo: mantener separación lógica/deploy/DB estricta"_.

**Análisis:** no existe código previo, por lo que no hay nada que "mantener". Se puede cumplir el PRD desde el origen sin coste de migración.

**Recomendación:** **repositorio y deploy separados** desde el día uno. Es la opción que satisface literalmente PRD Nº6 §3-§4 y elimina de raíz el riesgo de acoplamiento accidental. Requiere ADR-003.

## 4.10 C-10 · `/denuncia` (categoría) vs `/denunciar` (servicio) — ACLARACIÓN

PRD Master §10 lista `/denuncia` entre las secciones editoriales y `/denunciar` como formulario. **No son el mismo sistema.**

- `/denuncia` = categoría editorial de Payload. Contenido periodístico publicado _sobre_ denuncias ciudadanas.
- `/denunciar` = página informativa que dirige al servicio aislado en `denuncias.clasificadoscolombia.com`.

Ningún componente, query o relación puede conectar ambos. Se documenta aquí porque el parecido de los nombres es una fuente probable de acoplamiento accidental.

---

# 5. IMPLEMENTATION PHASES

23 fases agrupadas en 6 bloques. Cada fase cierra con el Quality Gate obligatorio:

```txt
implementation → typecheck → lint → tests → build → verificación manual → reporte breve
```

## BLOQUE A — FUNDACIÓN

### F0 · Baseline & Scaffold

Inicializar Git. Crear proyecto Next.js + Payload 3 con adaptador Postgres. Fijar `packageManager` (pnpm 10.28.2) y Node 22 LTS. Definir scripts `dev`, `build`, `lint`, `typecheck`, `test`, `search:reindex`, `media:regenerate`. Configurar TypeScript strict, ESLint, Prettier, Vitest, Playwright. `docker-compose.dev.yml` con Postgres + Meilisearch + MinIO locales. Validación de entorno con Zod. `.env.example`.

**DoD:** `pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm build` verde. Postgres local levanta. Commit inicial.

### F1 · Design System Foundation

Design tokens como CSS variables (paleta Ink `#0A0A0A`, Paper `#F7F6F2`, Investigation Red `#D71920`, escala de grises). Tipografía Playfair Display + Source Sans 3 vía `next/font`. Escala tipográfica fluida con `clamp()`. Sistema de espaciado base 4. Grid 12/8/4 columnas. Contenedores `wide 1440 / editorial 1200 / article 900 / reading 720`. Primitives: `Container`, `Stack`, `Cluster`, `Grid`, `Divider`, `Section`, `SectionHeader`, `VisuallyHidden`. Componentes tipográficos. Ruta `/dev/design-system` (solo development).

**Requiere:** G-06 (assets de marca), ADR-002 (C-08).
**DoD:** `/dev/design-system` renderiza toda la escala y todos los primitives en 360/768/1440. Contraste AA verificado. Cero valores mágicos fuera de tokens.

## BLOQUE B — CMS Y SEGURIDAD

### F2 · Payload Foundation

`payload.config.ts` composicional. Adaptador Postgres. Collection `Users` con `auth: true`, campos `role`, `status`, `department`, `mfaEnabled`. Generación de `payload-types.ts`. Admin panel accesible. Migración inicial. Configuración SMTP.

**Requiere:** G-10 (proveedor SMTP).
**DoD:** admin login funcional. Migración inicial reconstruye DB vacía. Types generados compilan. `/api/health/ready` verifica DB.

### F3 · RBAC & Access Control

`payload/access/roles.ts` con los 9 roles. Helpers: `isAdmin`, `isEditorInChief`, `canPublish`, `canAccessInternalEvidence`, `canAccessRestrictedEvidence`, `canManageUsers`. Access por Collection (`create`/`read`/`update`/`delete` explícitos, **deny by default**). Field access sobre `role`, `status`, `legalStatus`, `factCheckStatus`, `classification`, `publishedAt`. Prohibición de auto-escalada y auto-cambio de rol. Access functions que devuelven **filtros Payload** en lugar de `true` (PRD Nº7 §106).

**DoD — matriz de tests obligatoria (Role × Collection × Operation × Status):**

- Reporter no puede publicar (vía API REST directa, no solo UI oculta) → 403
- Reporter no puede modificar su propio `role` → 403
- Anónimo no puede leer draft → denegado
- Editor no accede a evidencia restricted no relacionada → denegado
- Contributor no edita draft de otro contributor → denegado
- Usuario `disabled` no puede autenticarse → denegado
- API key no evade access control → denegado

### F4 · Core Content Model

En orden: `Authors` → `Categories` → `Topics` → `Media` → `Articles`. Después `Opinions`, `DataStories`, `VideoStories`, `People`, `Organizations`, `Sources`.

Field factories: `slugField()`, `seoFields()`, `workflowFields()`, `publicationFields()`, `heroFields()`. Bloques Lexical: Image, Gallery, Video, Audio, PullQuote, FactBox, Callout, DocumentReference, Timeline, DataChart, SourceNote, CorrectionNotice, Embed. Drafts y versions habilitados. Sistema de slug con normalización, unicidad, `slugLocked` tras primera publicación y creación automática de `Redirect` al cambiar. Grupo `publication` (`publishedAt`, `modifiedAt`, `scheduledAt`, `firstPublishedAt` inmutable). Guards de workflow en `beforeChange`. Índices Postgres: `slug`, `editorialStatus`, `_status`, `publishedAt`, `category`, `classification`, `role`, `status`.

**Requiere:** ADR-001 (C-06), decisiones C-04 y C-05.
**DoD:** contrato `_status`/`editorialStatus` enforced y testeado. Cambio de slug publicado genera redirect automático. `firstPublishedAt` no se modifica. Transición inválida rechazada vía API. Seed idempotente con contenido marcado `DEMO / CONTENIDO FICTICIO`.

### F5 · Investigations

Collection independiente (**no** `Article + contentType=investigation`). Campos: `keyFindings[]`, `chapters[]` (array con blocks), `timeline[]`, `people[]`, `organizations[]`, `sources[]`, `evidence[]`, `methodology`, `updates[]`, `editors[]`. Publish guard estricto.

**DoD:** publicación bloqueada backend-side si falta cualquiera de: `editorialStatus=approved`, `factCheckStatus=verified`, `legalStatus=approved`, `authors`, `methodology`. Investigación con `people[]` no vacío no publica sin `legalStatus=approved`. Reporter solo ve investigaciones asignadas o creadas por él.

### F6 · Evidence Vault + MinIO

Collections `Evidence`, `EvidenceAccessGrants`, `InvestigationTeams`. Payload almacena **solo metadata**: `bucket`, `objectKey`, `mimeType`, `size`, `checksum` (SHA-256), `classification`, `status`, `retention`, `legalHold`. Buckets `evidence-public` / `evidence-internal` / `evidence-restricted` con políticas MinIO de mínimo privilegio (nunca root credentials desde la app). Object keys UUID. Flujo de acceso: request → auth → authorization → classification check → grant/team check → audit event → presigned URL de expiración corta (restricted 60–300 s). Proyección pública `toPublicEvidence()` que expone únicamente campos seguros de evidencia `classification=public AND status=approved`. Versioning en buckets sensibles. Historial de clasificación con `oldClassification`/`newClassification`/`changedBy`/`approvedBy`/`reason`. Four-eyes para `restricted → public`.

**DoD:** `objectKey` nunca llega al cliente. Anónimo sobre restricted → denegado (404, no 403, cuando revelar existencia sea sensible). Reporter no relacionado → denegado. Investigador autorizado → presigned URL temporal. Cada descarga restricted genera audit event. Colección `evidence` no es legible completa públicamente.

### F7 · Audit

Collection `AuditEvents` append-only: `create` solo sistema, `update: false`, `delete: false` — incluido para administradores desde UI. Campos: `timestamp`, `actorId`, `actorRole`, `action`, `resourceType`, `resourceId`, `result`, `requestId`, `metadata`. Eventos mínimos: `login_success`, `login_failure`, `user_created`, `user_disabled`, `role_changed`, `article_published`, `article_unpublished`, `article_deleted`, `evidence_uploaded`, `evidence_downloaded`, `evidence_access_denied`, `classification_changed`, `access_granted`, `access_revoked`, `legal_hold_changed`, `settings_changed`. Redaction en logger.

**DoD:** update/delete de audit event rechazado por API y por Admin. Acción denegada registra `result = denied`. Ningún log contiene passwords, tokens, presigned URLs, credenciales MinIO ni contenido de documentos.

## BLOQUE C — FRONTEND EDITORIAL

### F8 · Frontend Foundation

`SiteHeader` (sticky inteligente, compacto en scroll), `PrimaryNav` (items desde Global `Navigation`, nunca hard-coded), `MobileNav` (accesible, Escape, bloqueo de scroll, targets ≥44 px), `BreakingNewsBar` (variantes breaking/alert/developing/confirmed, sin ticker ni marquee), `SiteFooter`. Skip link. Landmarks semánticos. Capa `src/data/` con `getHomepage()`, `getArticleBySlug()`, etc.

**DoD:** navegación completa por teclado sin ratón. Validado en 360/390/430/768/1024/1280/1440/1920. Mobile verificado antes de continuar.

### F9 · Editorial Components

Familia de cards: `ArticleCard`, `ArticleCardCompact`, `ArticleCardHorizontal`, `ArticleCardFeatured`, `ArticleListItem`, `InvestigationCard`, `OpinionCard`, `DataCard`, `VideoCard`, `EvidenceCard`. Subcomponentes compartidos, **prohibida la mega-card con 40 props**. `SectionHeader`, `LatestNewsList`, `EditorialImage`, `MediaCredit`, `MediaCaption`. Estados: `PageSkeleton`, `CardSkeleton`, `InlineError`, `PageError`, empty states editoriales.

**Requiere:** G-13 (contenido demo).
**DoD:** cada card probada con titular de 120–160 caracteres, titular corto, sin imagen, múltiples autores, y en mobile. Hover sutil (subrayado + escala ≤1.02). Cero componentes de presentación consultando Payload directamente.

### F10 · Homepage

Jerarquía real: hero dominante → secundarias → últimas → investigaciones → análisis → nacional/secciones → datos → video → opinión → newsletter. Estructura configurable desde Global `Homepage` sin tocar código. Máximo **una** historia visual dominante por viewport inicial.

**Requiere:** G-08 (newsletter).
**DoD:** ninguna sección muestra veinte tarjetas del mismo peso. Hero usa `priority`; ninguna otra imagen lo usa. LCP < 2.5 s en medición local.

### F11 · Article Page

`ArticlePage`: Breadcrumbs, Eyebrow, Headline, Dek, Byline, PublicationMeta, Share, Hero, Caption, ArticleBody, Sources, Corrections, Related. Ancho de lectura 680–760 px, cuerpo 17–20 px, `line-height` 1.6–1.75, 65–75 caracteres por línea. Renderer completo de rich text Lexical con todos los bloques de F4. `CorrectionNotice` claramente visible.

**DoD:** los 13 tipos de bloque renderizan. Sin barras flotantes invasivas, popups, interstitials ni "te puede interesar" intercalado. Jerarquía de headings correcta (un solo H1).

### F12 · Investigation Frontend

`InvestigationHero` (fondo oscuro permitido), `InvestigationContents` (sticky desktop), `KeyFindings`, `InvestigationChapter`, `EditorialTimeline`, `EntityList`, `EvidenceSection`, `PublicEvidenceViewer`, `Methodology`, `RedactedAccent` (uso restringido a investigaciones, títulos especiales y revelación de documentos).

**DoD:** evidencia restricted **jamás** aparece en frontend público, ni siquiera como placeholder que revele su existencia. `EntityList` contextualiza sin presentar asociación como culpabilidad. Se siente especial sin romper el Design System.

### F13 · Author / Category / Topic

`AuthorPage` (`/autor/[slug]`), `CategoryPage` (`/investigacion`, `/politica`, `/justicia`, `/denuncia`, `/analisis`, `/datos`, `/opinion`), `TopicPage` (`/tema/[slug]`). Páginas institucionales: `/quienes-somos`, `/equipo`, `/principios-editoriales`, `/metodologia`, `/correcciones`, `/fuentes`, `/contacto`. Paginación crawlable con links HTML reales.

**DoD:** ningún hub es un listado plano. Todas las páginas institucionales existen e indexables.

## BLOQUE D — SISTEMAS DERIVADOS

### F14 · Search (Meilisearch)

Índices `editorial_content_v1`, `entities_v1`, `authors_v1`. DTOs explícitos (`toSearchDocument()`, nunca el documento Payload completo). `extractSearchText()`. Settings as code versionados: `searchableAttributes` (orden: title, dek, authors.name, topics, people, organizations, bodyText), `filterableAttributes`, `sortableAttributes`, `rankingRules`, `synonyms`, `typoTolerance`. `applySearchSettings()` idempotente. Sync vía `afterChange → payload.jobs.queue() → search sync job` con reintentos 3–5 y backoff. `searchPriority` derivado (0 standard / 10 featured / 20 análisis mayor / 30 investigación / 40 breaking activo), nunca editable a mano. Comando `pnpm search:reindex` con create → settings → batch (500–1000) → validate → swap. Endpoint `/search` server-side (Master Key nunca en browser) con rate limit y normalización de query. UI: `SearchDialog`, `SearchAutocomplete` (debounce 150–250 ms, umbral 2–3 caracteres, 6–10 resultados, navegación por teclado, patrón ARIA combobox), `SearchPage` (`/buscar?q=`), `SearchResultItem`, `SearchFilters`.

**Requiere:** G-14 (sinónimos y golden queries).
**DoD:** drafts, internal, restricted, audit y denuncias **nunca** entran al índice — testeado. Publicar funciona con Meilisearch caído. Título pesa más que cuerpo. Typo tolerance funciona en español con acentos (`fiscalia`→`fiscalía`, `bogta`→`Bogotá`). Reindex completo idempotente y validado por conteo. Golden queries pasan. `/buscar` emite `noindex,follow`.

### F15 · Media Pipeline

Collection `Media` con `alt` (obligatorio salvo `decorative=true`), `caption`, `credit`, `source`, `license`, `copyrightHolder`, `rightsExpiration`, `usageNotes`, `mediaType`, `photographer`, `syntheticMedia`, `editorialStatus`, `processingStatus`. Original preservado. Derivados: thumbnail, card, article, hero, og, square, portrait. AVIF/WebP con fallback. Normalización sRGB. **Eliminación de EXIF sensible en derivados públicos, especialmente GPS.** Hotspot/crop editorial. Hash SHA-256 para duplicados. Procesamiento pesado asíncrono (Payload Jobs / worker). OG dinámico 1200×630 vía `next/og` con fallback tipográfico. `pnpm media:regenerate`. Bloqueo de SVG no confiable o sanitización.

**DoD:** Media completamente separada de Evidence. Media con `license=unknown` no seleccionable para publicación salvo override auditado. `rightsExpiration` vencida genera alerta y listado de contenido publicado afectado. Fallo de OG no impide publicar. Assets en uso no se pueden borrar en duro. EXIF GPS no se expone.

### F16 · SEO & Structured Data

Metadata API dinámica por ruta con fallbacks (`metaTitle→title`, `metaDescription→dek`, `ogImage→heroImage`). Canonical en toda página indexable. JSON-LD server-side: `NewsArticle`, `Article`, `OpinionNewsArticle`, `ReportageNewsArticle`, `Person`, `Organization`, `BreadcrumbList`, `VideoObject`, `ProfilePage`. `robots.txt`. Sitemap index + `/sitemaps/{articles,investigations,categories,topics,authors,videos}.xml`. **`/news-sitemap.xml` separado**, solo contenido reciente elegible, máximo 1000 entradas. `max-image-preview:large`. Páginas de documento `/documentos/[slug]`. Reglas de indexación: publicado `index`; draft, preview, `/buscar`, staging → `noindex`. Preview siempre autenticado y `noindex`.

**Requiere:** G-06, G-07, G-09.
**DoD:** tests de structured data en CI (JSON válido, campos obligatorios, URLs, fechas ISO 8601). Test canonical (URL con UTM → canonical limpio). Test robots (artículo publicado→index, preview→noindex, search→noindex, admin→inaccesible). Documentos internal/restricted nunca en sitemap ni en structured data. Fecha visible y `datePublished` consistentes.

### F17 · Redirects, Corrections & HTTP Status

Collection `Redirects` (`from` unique+indexed, `to`, `statusCode`, `reason`, `active`) resuelta **antes** de devolver 404. Collection `Corrections` con tipos `correction` / `clarification` / `update` / `editor_note`, visibles en el artículo, sin modificar el texto original. Página 404 editorial con búsqueda, últimas noticias e investigaciones. Uso correcto de 200/301/308/404/410/500/503.

**DoD:** cambio de slug publicado no rompe la URL anterior. Corrección publicada revalida el artículo. 404 no es la página genérica de Next.js.

### F18 · Payload Jobs & Admin UX

Formalizar jobs: search sync, media processing, revalidation, notificaciones. Clasificación **critical** (aborta la operación: autorización de workflow, validación de seguridad, integridad DB) vs **non-critical** (nunca aborta la publicación: sync Meilisearch, notificaciones, webhooks no esenciales). Idempotency keys (`documentId` + `operation` + `version`). Prevención de recursión de hooks con contexto explícito (`skipAudit`, `skipSearchSync`). Componentes Admin: `PublicationChecklist`, `SEOPreview`, `WorkflowPanel`, `EvidenceClassificationWarning`, `SearchHealth`, `RightsWarning`. Agrupación del Admin: EDITORIAL / NEWSROOM / RESEARCH / OPERATIONS / SECURITY.

**DoD:** publicación no se bloquea por fallo de sistema derivado. Jobs muertos se registran y alertan, no se pierden en silencio. Advertencia visible antes de publicar investigación con evidencia internal/restricted. Revalidación granular (no `revalidatePath('/')` en cada cambio).

## BLOQUE E — INFRAESTRUCTURA

### F19 · Docker & Compose

`Dockerfile` multistage (Next.js standalone, Node 22 LTS pinneado, `pnpm install --frozen-lockfile`, sin dev deps en runtime). `docker-compose.yml` con las 4 redes de §2.2. Sin `ports:` en servicios internos. Health checks por servicio. Volúmenes con nombre explícito (`clasificados_postgres_data`, `clasificados_minio_data`, `clasificados_meili_data`). Presupuesto de memoria por servicio. Security headers y CSP específica. Graceful shutdown (SIGTERM). Logging estructurado con `requestId`. Log rotation.

**Requiere:** G-11, G-21.
**Riesgo conocido:** `sharp` sobre Alpine/musl es fuente habitual de fallos de build. Evaluar `node:22-bookworm-slim` frente a `node:22-alpine` antes de fijar la imagen base.
**DoD:** `docker compose config` válido. Postgres/Meilisearch/MinIO inaccesibles desde fuera del host. Los tres health endpoints responden correctamente. CSP probada contra funcionalidad real, no copiada.

### F20 · Coolify Deploy, Backups & Runbooks

Documentación exacta de deploy: servicios, dominios, variables de entorno, volúmenes persistentes, health checks, orden de despliegue, estrategia de migración. Migraciones explícitas como parte del deploy (`backup → migration → health → traffic`). CI que crea Postgres vacío, ejecuta todas las migraciones desde cero y hace build. Backups: `pg_dump` diario (retención 7/4/6), MinIO con versioning, copia offsite cifrada. Test de restore mensual. `/docs/infrastructure/` y `/docs/security/` completos.

**Requiere:** G-07, G-12, G-16, G-17, G-19.
**DoD:** un servidor nuevo es reconstruible desde repo + secrets + backups + documentación, sin depender de la memoria del administrador. Restore probado al menos una vez. Staging con DB, Meilisearch, bucket y secrets propios, y `noindex`.

## BLOQUE F — SERVICIO AISLADO Y CIERRE

### F21 · Denuncias (servicio separado)

Aplicación independiente en `denuncias.clasificadoscolombia.com`. DB `denuncias_prod` propia, usuario `denuncias_app`, **sin foreign key, sin conexión directa, sin modelo ORM compartido y sin usuario de DB compartido con `clasificados_prod`**. Formulario con modo identificado y anónimo (sin cuenta, sin OAuth). Case ID UUID. Token de seguimiento de alta entropía almacenado hasheado. Datos de contacto cifrados en reposo, con clave fuera de la DB. Storage `denuncias-quarantine` (nunca `evidence-restricted` directamente). Flujo de upload: request slot → rate limit → presigned → quarantine → validación (extensión + MIME + magic bytes) → `scanner-worker` (ClamAV o equivalente) → revisión. Estados de scan: `pending`/`clean`/`suspicious`/`infected`/`failed` — **fallo de scanner nunca marca `clean`**. Estados de caso: `received` → `triage` → `under_review` → `needs_contact` → `rejected` / `accepted_for_investigation` → `archived` / `deleted`. Panel interno independiente de Payload Admin, con MFA obligatorio, sesión 4–8 h y acceso basado en asignación. Transferencia a editorial: revisión humana → aprobación explícita → export controlado → copia (no movimiento) al Evidence Vault → nueva investigación en Payload. Referencia pseudónima de fuente (`SOURCE-8F71`). Retención y borrado aplicables. Backups separados y cifrados. CSP más restrictiva que el sitio editorial. Sin analytics de terceros, sin social embeds, sin retención innecesaria de IP.

**Requiere:** ADR-003 (C-09), G-22.
**DoD:** los 14 criterios de PRD Nº6 §149. Ninguna denuncia genera automáticamente Article, Investigation ni Breaking News. Logs no exponen contenido de denuncias, nombres, emails, teléfonos, filenames ni tokens.

### F22 · Security QA, Accesibilidad, Performance & Launch

QA de seguridad completo: RBAC, field access, aislamiento de drafts, evidencia restricted, acceso MinIO, fugas en search, permisos de Admin, seguridad de sesión, uploads. Mappers de frontera pública: `toPublicArticle()`, `toPublicInvestigation()`, `toPublicAuthor()`, `toPublicMedia()`, `toPublicEvidence()`. Auditoría WCAG 2.2 AA con `axe` automatizado + QA de teclado + lector de pantalla. QA responsive en los 8 breakpoints. QA de contenido (titular larguísimo, sin imagen, múltiples autores, investigación extensa, related vacío, breaking, corrección). Core Web Vitals. E2E críticos. MFA para usuarios privilegiados. Rotación de secretos documentada.

**Requiere:** G-20, G-23.
**DoD:** checklist final de producción de `CLAUDE.md` §94 completo — build/TypeScript/tests/migraciones verdes; RBAC, evidencia, search, SEO, news sitemap, accesibilidad y responsive verificados; backups documentados; health checks funcionando; deploy Coolify documentado; sin puertos sensibles expuestos; sin secretos filtrados; sin indexación de drafts ni restricted; sin acoplamiento Denuncias ↔ Payload.

---

# 6. DEPENDENCIES

## 6.1 Grafo de dependencias

```txt
F0 ──┬─► F1 ──────────────────────────────────► F8 ─► F9 ─► F10 ─► F11 ─► F12 ─► F13
     │                                            ▲                ▲       ▲
     └─► F2 ─► F3 ─┬─► F4 ─┬─► F5 ────────────────┘                │       │
                   │       │                                       │       │
                   │       ├─► F15 (Media) ───────────────────────┘       │
                   │       ├─► F17 (Redirects/Corrections) ────────────────┘
                   │       └─► F14 (Search) ─────────────────────► F14-UI
                   │
                   ├─► F6 (Evidence + MinIO) ─────────────────────► F12
                   └─► F7 (Audit) ────────────────────────────────► F6, F18

F4 + F15 ─► F16 (SEO)
F4 ─► F18 (Jobs & Admin UX)
F0 ─► F19 ─► F20
F19 ─► F21 (independiente del resto del grafo editorial)
todo ─► F22
```

## 6.2 Dependencias duras (no negociables)

| Dependencia                | Razón                                                                           |
| -------------------------- | ------------------------------------------------------------------------------- |
| F3 antes de F4             | Access control debe existir antes de que haya contenido que proteger            |
| F3 antes de F6             | `CLAUDE.md` §15: RBAC antes de Evidence                                         |
| F7 antes/junto a F6        | Cada acceso a evidencia restricted debe generar audit event desde el primer día |
| F4 antes de F14            | Sin modelo de contenido no hay DTO de búsqueda                                  |
| F15 antes de F16           | OG images y `image` de structured data dependen del pipeline de media           |
| F1 antes de F8             | Sin tokens no se construyen componentes                                         |
| F2 antes de todo lo de CMS | Payload + Postgres deben estar verificados antes de crear Collections           |

## 6.3 Paralelizables

- **F1 ∥ F2/F3**: Design System y capa Payload no se tocan hasta F8.
- **F14 ∥ F15 ∥ F17**: los tres dependen de F4 pero no entre sí.
- **F21 ∥ bloques A–E**: el servicio de denuncias es independiente por diseño.
- **F19 ∥ bloques B–D**: la infraestructura puede prepararse en paralelo.

## 6.4 Dependencias externas bloqueantes

| Bloqueo                            | Bloquea       | Responsable                |
| ---------------------------------- | ------------- | -------------------------- |
| Assets de marca (G-06)             | F1, F8, F16   | Cliente / diseño           |
| Dominio canónico (G-07)            | F16, F19, F20 | Cliente                    |
| Proveedor SMTP (G-10)              | F2            | Cliente / decisión técnica |
| Proveedor newsletter (G-08)        | F10, F13      | Cliente                    |
| Analytics (G-09)                   | F16           | Cliente                    |
| Acceso Contabo + Coolify (G-12)    | F20           | Cliente                    |
| Contenido demo (G-13)              | F9, F10, F11  | Redacción                  |
| Sinónimos + golden queries (G-14)  | F14           | Redacción                  |
| Política legal de retención (G-22) | F21           | Legal                      |
| Responsable de seguridad (G-23)    | F22           | Cliente                    |

---

# 7. RISK AREAS

Ordenados por severidad. Severidad = impacto × probabilidad.

## R-01 · Doble fuente de verdad de publicación · CRÍTICO

`editorialStatus` y `_status` pueden divergir y publicar contenido en revisión, o mantener oculto contenido aprobado. Es una fuga de contenido no publicado, no un bug cosmético.
**Mitigación:** ADR-001 con el invariante de §4.6, enforced en `beforeChange` y cubierto por tests antes de cerrar F4.

## R-02 · Exposición de evidencia restricted · CRÍTICO

Superficies de fuga: `objectKey` devuelto al cliente, colección `evidence` legible completa, indexación en Meilisearch, inclusión en sitemap, presigned URL de larga duración, filename revelador, EXIF, placeholder en frontend que revela existencia.
**Mitigación:** proyección pública explícita (F6), tests de acceso (F3/F6), test de no indexación (F14), exclusión de sitemap (F16), object keys UUID, expiración 60–300 s, audit de cada generación de URL. Una presigned URL emitida **funciona hasta expirar**: la expiración corta es el control real, no la revocación.

## R-03 · Acoplamiento accidental Denuncias ↔ Payload · CRÍTICO

Una foreign key, un modelo ORM compartido o un webhook automático puede exponer la identidad de una fuente anónima si el CMS editorial se compromete. Riesgo agravado por la similitud entre `/denuncia` (categoría) y `/denunciar` (servicio) — ver C-10.
**Mitigación:** repos y deploys separados (ADR-003), redes Docker distintas, usuarios de DB distintos, transferencia solo por acción humana explícita con export controlado, test que verifique ausencia de conexión.

## R-04 · Migración destructiva en producción · ALTO

Payload/Postgres con drop de columna, rename o cambio de tipo sin plan puede perder contenido editorial irrecuperable.
**Mitigación:** migraciones explícitas siempre; patrón seguro (add nullable → deploy → backfill → validate → require); `pg_dump` verificado antes de migración estructural; CI que ejecuta todas las migraciones sobre Postgres vacío; orden local → CI → staging → production.

## R-05 · Single point of failure (un solo Contabo) · ALTO

Fallo de host, disco, proveedor, red o kernel derriba todo. Docker no aísla de eso.
**Mitigación:** backups offsite cifrados, restore probado mensualmente, infraestructura documentada y reconstruible, DNS bajo control propio. Riesgo aceptado conscientemente para la etapa actual; documentar umbrales de separación (§156 PRD Nº4).

## R-06 · Presupuesto de memoria en 12 GB · ALTO

Cinco servicios + builds de Next.js + indexación de Meilisearch + procesamiento de imágenes compitiendo. Un servicio sin límite puede tumbar el host.
**Mitigación:** límites de memoria por contenedor, swap razonable, full reindex fuera de picos, concurrencia limitada en procesamiento de media, evaluación de build externo si los builds compiten con producción.

## R-07 · MinIO como pérdida irrecuperable · ALTO

Los documentos de evidencia pueden ser irremplazables. Meilisearch y Postgres son reconstruibles con distinto coste; MinIO puede no serlo.
**Mitigación:** backup + versioning + offsite como prioridad máxima; evaluar Object Lock para evidencia que requiera inmutabilidad; nunca hard delete de evidencia restricted.

## R-08 · Deuda de accesibilidad acumulada · MEDIO

WCAG 2.2 AA es requisito, no aspiración. Corregir accesibilidad al final es mucho más caro que construirla desde F1.
**Mitigación:** `axe` automatizado desde F8, QA de teclado por fase, contraste verificado en F1, no aplazar a F22.

## R-09 · `sharp` en Alpine/musl · MEDIO

Fuente habitual de fallos de build y de runtime en el pipeline de imágenes.
**Mitigación:** decidir imagen base en F19 con build verificado; considerar `node:22-bookworm-slim`.

## R-10 · Sobre-ingeniería del Design System · MEDIO

El PRD advierte repetidamente contra la mega-card, las 14 variantes de botón y los 40 tamaños de imagen. Es deuda que se paga en cada componente posterior.
**Mitigación:** revisión explícita al cierre de F9; cada derivado de imagen y cada variante debe justificar un uso real.

## R-11 · Fuga de secretos en logs o build · MEDIO

`DATABASE_URL`, `MEILI_MASTER_KEY`, `MINIO_SECRET_KEY`, `PAYLOAD_SECRET`.
**Mitigación:** redaction en logger; nunca serializar env completo; prohibido pasar secretos como `ARG` de Docker; solo `NEXT_PUBLIC_` para valores realmente públicos; rotación documentada.

## R-12 · Regresión de ranking en búsqueda · BAJO

Cambiar `searchableAttributes`, `rankingRules` o `synonyms` sin medir degrada la búsqueda de forma difícil de detectar.
**Mitigación:** golden queries versionadas en `/search-tests/golden-queries.json`, ejecutadas antes de cualquier cambio de ranking; cada cambio documentado.

---

# 8. MIGRATION REQUIREMENTS

## 8.1 Situación

No existe base de datos previa, ni contenido, ni usuarios, ni URLs publicadas. **No hay migración de datos legacy.** Toda la disciplina de migraciones es preventiva: proteger el contenido editorial desde la primera publicación real.

## 8.2 Reglas

1. Producción usa **migraciones explícitas**. Prohibido el schema drift automático.
2. Todas las migraciones viven en Git, en `src/payload/migrations/`.
3. Nomenclatura: `AAAAMMDD_HHMMSS_descripcion` (ej. `20260817_145533_initial_editorial_schema`).
   Corregido en F0: el PRD Nº7 §135 sugiere una secuencia `NNN`, pero el generador de Payload
   nombra por timestamp y es él quien crea los archivos. Ordena igual y evita renombrados manuales.
4. `payload migrate:create` requiere `--force-accept-warning` en contextos sin TTY (CI, agentes).
   Sin la bandera aborta en silencio y **no genera archivo**, que es un modo de fallo especialmente
   traicionero: el comando parece exitoso.
5. Cada cambio persistente del modelo debe responder explícitamente _"¿requiere migration?"_ antes del deploy.
6. Orden obligatorio: `local → CI → staging → production`. Nunca probar por primera vez en producción.
7. Registrar por migración: nombre, inicio, fin, fallo, duración, release SHA.

## 8.3 Patrón seguro obligatorio

```txt
1. add nullable field
2. deploy código compatible
3. backfill
4. validate
5. make required later
```

**Cambios peligrosos que requieren plan explícito:** drop column · rename · type change · constraint change · eliminar opción de enum en uso · cambiar cardinalidad de relación (`one → many`).

## 8.4 Flujo de deploy con migración

```txt
CI verde
↓
backup (pg_dump verificado)
↓
deploy nueva imagen
↓
run migration
↓
readiness check
↓
switch traffic
↓
smoke test
↓
monitor errores
```

## 8.5 Verificación en CI

CI debe crear un Postgres vacío, ejecutar **todas** las migraciones desde cero y hacer build. Esto verifica que un servidor nuevo es reconstruible — no solo que la última migración funciona.

## 8.6 Limitación del rollback

Rollback de código no basta si hubo migración destructiva. Por eso las migraciones deben diseñarse compatibles hacia atrás. El rollback de imagen es el plan A; la restauración de backup es el plan B y tiene coste real de RPO.

**Objetivos iniciales:** `RTO ≤ 4 h` · `RPO ≤ 24 h` (backup diario). Para investigaciones activas puede requerirse RPO menor.

---

# 9. SECURITY BOUNDARIES

## 9.1 Principio rector

**DENY BY DEFAULT.** Todo recurso asume `NO ACCESS` hasta que exista una regla explícita que lo permita. La UI puede ocultar; **el backend debe denegar**. Ocultar un botón del Admin no es un control de seguridad.

## 9.2 Frontera 1 · Público ↔ Editorial

El usuario público **no puede conocer la existencia** de:

```txt
draft investigations · restricted evidence · internal sources
access grants · audit events · internal users · review notes
```

Mappers obligatorios antes de enviar cualquier cosa al browser:
`toPublicArticle()` · `toPublicInvestigation()` · `toPublicAuthor()` · `toPublicMedia()` · `toPublicEvidence()`

Nunca devolver un documento Payload completo al cliente por comodidad. Campos prohibidos en el frontend público: `reviewNotes`, detalles internos de `legalStatus`, access grants, `objectKey` de restricted, audit, campos de seguridad de usuario, `usageNotes`, `rightsNotes`, `originalFilename`.

## 9.3 Frontera 2 · Editorial ↔ Evidence Vault

Payload almacena **metadata**. MinIO almacena **bytes**. Payload nunca almacena el archivo físico de evidencia.

```txt
Request → Authentication → Authorization → Classification check
       → Grant / team check → Audit event → Presigned URL (expiración corta)
```

- `public` → `evidence-public` · presigned 15–60 min
- `internal` → `evidence-internal` · presigned 5–15 min
- `restricted` → `evidence-restricted` · presigned **60–300 s**

Restricted requiere **rol permitido Y need-to-know** (`EvidenceAccessGrant` o `InvestigationTeam`). Ser Editor no basta. Un Administrator técnico no necesita necesariamente leer evidencia periodística — separación de funciones.

Nunca usar root credentials de MinIO desde la aplicación. El browser nunca recibe `MINIO_ACCESS_KEY` ni `MINIO_SECRET_KEY`.

Desclasificación `restricted → public`: four-eyes (solicitante + segundo aprobador), historial de clasificación, audit event. Preferir **generar una copia pública revisada** antes que cambiar los permisos del objeto original sensible.

## 9.4 Frontera 3 · Editorial ↔ Denuncias

```txt
PROHIBIDO:  foreign key · conexión directa de DB · modelo ORM compartido
            usuario de DB compartido · red compartida · webhook automático
```

Mismo servidor **≠** misma zona de confianza.

Transferencia únicamente por: revisión humana → aprobación explícita → export controlado → **copia** (no movimiento) al Evidence Vault → nuevo registro editorial. Los datos de contacto del denunciante **no se transfieren** al CMS editorial. Se usa referencia pseudónima (`SOURCE-8F71`).

Una denuncia **jamás** genera automáticamente Article, Investigation ni Breaking News.

## 9.5 Frontera 4 · Contenido ↔ Índice de búsqueda

Meilisearch recibe **exclusivamente** contenido `published` y `public`.

```txt
NUNCA indexar: drafts · preview · internal · restricted · audit
               usuarios internos · denuncias · contact data · review notes
               títulos no publicados · nombres de documentos restricted
               codenames de investigación · notas internas de autoría
```

Fuentes con `sourceType = confidential` se filtran en la query de sync, no solo en la UI. Master Key server-only. La key que llega al browser (si se usa) solo puede `search` sobre índices públicos.

## 9.6 Frontera 5 · Audit inmutable

`AuditEvents`: `create` solo sistema · `update: false` · `delete: false`. **Los administradores tampoco pueden editar eventos desde la UI.** Excepción únicamente mediante proceso de mantenimiento excepcional claramente documentado.

Nunca loggear: passwords · tokens · presigned URLs · documentos completos · contenido de denuncias · credenciales MinIO · session cookies.

## 9.7 Frontera 6 · Red

```txt
Host expone:        22, 443, 80
Nunca a Internet:   5432 (Postgres) · 7700 (Meilisearch) · 9000/9001 (MinIO)
Console MinIO:      nunca pública sin protección (VPN / tunnel / dominio admin-only)
Payload Admin:      auth robusta + rate limit + MFA + sesiones seguras
                    ideal: Cloudflare Access / VPN / allowlist
```

## 9.8 Uso de Local API

Preferir Payload Local API server-side. Pero **respetar Access Control conscientemente**. `overrideAccess: true` nunca por defecto: solo en jobs controlados, migraciones y mantenimiento, y siempre explícito, excepcional, documentado y probado.

## 9.9 Prioridad de implementación de seguridad (PRD Nº5 §133)

```txt
1. Authentication          6. Presigned authorization
2. RBAC                    7. Audit
3. Field Access            8. MFA usuarios privilegiados
4. Workflow enforcement    9. Backup security
5. Evidence isolation     10. Threat tests
```

---

# 10. DEFINITION OF DONE — RESUMEN POR FASE

| Fase | Criterio de cierre                                                                                              |
| ---- | --------------------------------------------------------------------------------------------------------------- |
| F0   | Quality Gate completo verde · Postgres local operativo · commit inicial                                         |
| F1   | `/dev/design-system` completo en 3 breakpoints · contraste AA · cero valores fuera de tokens                    |
| F2   | Admin login funcional · migración inicial reconstruye DB vacía · types compilan                                 |
| F3   | Matriz Role × Collection × Operation × Status pasa · los 7 tests obligatorios en verde                          |
| F4   | Invariante `_status`/`editorialStatus` enforced · redirect automático al cambiar slug · seed DEMO               |
| F5   | Publish guard bloquea backend-side las 5 condiciones · acceso por asignación                                    |
| F6   | `objectKey` nunca sale al cliente · 3 tests de evidencia pasan · toda descarga restricted auditada              |
| F7   | Audit no editable ni por admin · acción denegada registra `result=denied` · sin datos sensibles en logs         |
| F8   | Navegación completa por teclado · 8 breakpoints validados                                                       |
| F9   | Cada card probada en 6 estados de contenido · sin componente presentacional consultando Payload                 |
| F10  | Jerarquía real · un solo `priority` · LCP < 2.5 s                                                               |
| F11  | 13 tipos de bloque renderizan · sin widgets invasivos · un solo H1                                              |
| F12  | Restricted nunca visible ni insinuada · entidades contextualizadas sin imputación                               |
| F13  | Ningún hub es listado plano · páginas institucionales completas                                                 |
| F14  | Draft/internal/restricted nunca indexados (testeado) · publicar funciona sin Meilisearch · golden queries pasan |
| F15  | Media ≠ Evidence · `license=unknown` no publicable · EXIF GPS no expuesto · OG con fallback                     |
| F16  | Tests de structured data, canonical y robots en CI · news sitemap solo contenido elegible                       |
| F17  | URL publicada nunca se rompe · corrección visible sin alterar el original                                       |
| F18  | Sistema derivado caído no bloquea publicación · jobs muertos alertan · revalidación granular                    |
| F19  | `docker compose config` válido · puertos sensibles cerrados · 3 health endpoints · CSP probada                  |
| F20  | Servidor reconstruible desde repo+secrets+backups+docs · restore probado · staging aislado y noindex            |
| F21  | Los 14 criterios de PRD Nº6 §149 · sin auto-publicación · logs sin contenido de denuncias                       |
| F22  | Checklist final de producción de `CLAUDE.md` §94 completo                                                       |

---

# 11. DECISIONES REQUERIDAS ANTES DE CONTINUAR

## 11.1 ADRs a redactar

| ADR     | Tema                                                  | Requerido antes de                       |
| ------- | ----------------------------------------------------- | ---------------------------------------- |
| ADR-001 | Contrato `_status` vs `editorialStatus` (C-06)        | F4                                       |
| ADR-002 | Librería de primitives: shadcn/Radix o Base UI (C-08) | F8 — ✅ aceptado 2026-08-18 (Radix)      |
| ADR-003 | Ubicación del servicio de Denuncias (C-09)            | F21 (decidir ya, afecta layout del repo) |
| ADR-004 | BreakingNews Global vs Collection (C-04)              | F4                                       |
| ADR-005 | `timelineEvents` array vs Collection (C-05)           | F5                                       |
| ADR-006 | Imagen base Docker y estrategia `sharp` (R-09)        | F19                                      |

## 11.2 Inputs pendientes del cliente

1. Assets de marca: logo SVG (variantes dark/light/compact), favicon, manifest.
2. Dominio canónico: apex o `www`.
3. Proveedor SMTP.
4. Proveedor de newsletter.
5. Herramienta de analytics respetuosa con privacidad.
6. Error monitoring: Sentry vs GlitchTip self-hosted.
7. Acceso a Contabo y Coolify.
8. Responsable de seguridad designado.
9. Política legal de retención para denuncias y audit.
10. Contenido demo periodístico redactado (prohibido lorem ipsum; debe marcarse `DEMO / CONTENIDO FICTICIO`).

---

# 12. FASE RECOMENDADA PARA INICIAR

**F0 · Baseline & Scaffold.**

Razones:

1. Es la única fase sin ningún bloqueo externo. Los 10 inputs pendientes del cliente no la afectan.
2. Sin repositorio Git no hay trazabilidad, rollback ni CI — todo lo que se construya antes es trabajo sin red de seguridad.
3. El Quality Gate que el PRD exige al cierre de cada fase (`lint → typecheck → test → build`) **no es ejecutable hoy**. F0 lo hace ejecutable, y sin eso ninguna otra fase puede cerrarse formalmente.
4. Verifica empíricamente el supuesto arquitectónico central antes de invertir en él: que Payload 3 corre como plugin nativo dentro del mismo proceso Next.js sobre Postgres.

**Recomendación de secuencia inmediata:** F0 → (ADR-002) → F1 ∥ F2, aprovechando que Design System y capa Payload no se cruzan hasta F8.

---

# 13. PRINCIPIO OPERATIVO

Ante cualquier disyuntiva durante la implementación:

```txt
simple, correcto y mantenible   >   rápido pero frágil
mejor jerarquía editorial       >   más efecto visual
seguridad de evidencia/fuentes  >   comodidad de implementación
```

**Condiciones de parada obligatoria** (`CLAUDE.md` §89): build roto · migración destructiva · requisito de seguridad ambiguo · PRDs en conflicto material · riesgo de pérdida de datos de producción · posible exposición de evidencia · posible ruptura del aislamiento de Denuncias.

En cualquiera de esos casos: documentar el problema, presentar opciones, recomendar una, y detenerse antes de introducir una ruptura importante.
