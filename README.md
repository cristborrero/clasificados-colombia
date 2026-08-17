# Clasificados Colombia · Plataforma Editorial Digital v2

> Plataforma periodística digital de alta seguridad, rendimiento y descubrimiento editorial para Clasificados Colombia, construida con Next.js 16 (App Router) y Payload CMS 3 sobre PostgreSQL.

---

## 🏛️ Descripción General

Clasificados Colombia v2 es un medio periodístico digital y plataforma editorial de producción diseñada con estándares rigurosos de seguridad editorial, preservación de evidencias (_Evidence Vault_), optimización para Google News / Discover, motor de búsqueda en tiempo real y arquitectura de servicios desacoplados.

### Stack Tecnológico

| Capa                            | Tecnología                                                                                       |
| :------------------------------ | :----------------------------------------------------------------------------------------------- |
| **Framework / Runtime**         | [Next.js 16](https://nextjs.org/) (App Router, React 19, TypeScript strict)                      |
| **CMS Editorial**               | [Payload CMS 3](https://payloadcms.com/) (Integración nativa dentro de Next.js)                  |
| **Base de Datos**               | [PostgreSQL 17](https://www.postgresql.org/) (`@payloadcms/db-postgres`)                         |
| **Estilos & UI**                | [Tailwind CSS 4](https://tailwindcss.com/) + PostCSS                                             |
| **Búsqueda & Discovery**        | [Meilisearch](https://www.meilisearch.com/)                                                      |
| **Almacenamiento & Evidencias** | [MinIO](https://min.io/) (_Evidence Vault_ S3-compatible)                                        |
| **Testing**                     | [Vitest](https://vitest.dev/) (Unit / Integration) + [Playwright](https://playwright.dev/) (E2E) |
| **Package Manager**             | `pnpm` (v10.28.2)                                                                                |

---

## 📋 Requisitos Previos

- **Node.js**: `>=22.11.0 <23` (recomendado v22.17+)
- **pnpm**: `10.28.2` (`corepack enable pnpm`)
- **Docker & Docker Compose**: Para levantar los servicios locales de base de datos, búsqueda y almacenamiento.

---

## 🚀 Inicio Rápido (Desarrollo Local)

### 1. Clonar e instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

Copiar el archivo de variables de ejemplo y ajustar las credenciales si es necesario:

```bash
cp .env.example .env
```

### 3. Iniciar servicios auxiliares (Docker)

El proyecto incluye un `docker-compose.dev.yml` con Postgres, Meilisearch y MinIO configurados en puertos locales aislados (rango 5xxxx para evitar colisiones):

```bash
pnpm services:up
```

_Servicios expuestos en localhost:_

- **PostgreSQL**: `127.0.0.1:55432` (`clasificados_dev`)
- **Meilisearch**: `127.0.0.1:57700`
- **MinIO S3 API**: `127.0.0.1:59000`
- **MinIO Console**: `http://127.0.0.1:59001` (User: `clasificados_dev_minio` / Pass: `clasificados_dev_minio_secret`)

### 4. Generar tipos y ejecutar migraciones

```bash
pnpm generate:types
pnpm generate:importmap
pnpm migrate
```

### 5. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en:

- **Frontend Web**: [http://localhost:3000](http://localhost:3000)
- **Panel Editorial (Payload Admin)**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🛠️ Scripts Disponibles

| Script                              | Descripción                                                            |
| :---------------------------------- | :--------------------------------------------------------------------- |
| `pnpm dev`                          | Inicia el servidor de desarrollo de Next.js.                           |
| `pnpm devsafe`                      | Limpia cache `.next` y arranca el entorno de desarrollo.               |
| `pnpm build`                        | Genera importmap de Payload y compila el bundle de producción.         |
| `pnpm start`                        | Inicia la aplicación compilada en modo producción.                     |
| `pnpm lint` / `pnpm lint:fix`       | Ejecuta ESLint y corrección automática.                                |
| `pnpm format` / `pnpm format:check` | Formatea con Prettier o verifica cumplimiento de formato.              |
| `pnpm typecheck`                    | Comprobación de tipos TypeScript sin emitir archivos (`tsc --noEmit`). |
| `pnpm test` / `pnpm test:watch`     | Ejecuta suite de pruebas unitarias e integración con Vitest.           |
| `pnpm test:e2e`                     | Ejecuta pruebas End-to-End con Playwright.                             |
| `pnpm test:e2e:full`                | Compila producción e inicia suite E2E completa.                        |
| `pnpm payload`                      | CLI interactivo de Payload CMS.                                        |
| `pnpm generate:types`               | Regenera los tipos TypeScript del CMS (`src/payload-types.ts`).        |
| `pnpm generate:importmap`           | Regenera el mapa de componentes para el Admin Panel.                   |
| `pnpm migrate`                      | Ejecuta migraciones de esquema pendientes en PostgreSQL.               |
| `pnpm migrate:create`               | Crea un nuevo archivo de migración de esquema.                         |
| `pnpm migrate:status`               | Consulta el estado de las migraciones.                                 |
| `pnpm services:up`                  | Levanta contenedores Docker (Postgres, Meilisearch, MinIO).            |
| `pnpm services:down`                | Detiene los contenedores de desarrollo.                                |
| `pnpm services:reset`               | Destruye contenedores y volúmenes de desarrollo.                       |

---

## 📂 Estructura del Proyecto

```txt
.
├── docs/                      # Documentación arquitectónica, PRDs y ADRs
│   ├── adr/                   # Architecture Decision Records (ADR-001, etc.)
│   ├── implementation/        # Planes maestros de ejecución
│   └── prd/                   # PRDs de producto, seguridad, SEO, infra, datos
├── e2e/                       # Pruebas End-to-End (Playwright)
├── public/                    # Assets estáticos públicos (logos, favicon, robots.txt)
├── src/
│   ├── app/                   # Next.js App Router (rutas públicas y (payload)/admin)
│   ├── components/            # Componentes UI compartidos y modulares
│   ├── data/                  # Capas de acceso y repositorios de datos
│   ├── editorial/             # Lógica de dominio editorial y publicación
│   ├── evidence/              # Módulos de gestión segura y Evidence Vault
│   ├── payload/               # Configuración, Colecciones, Hooks, Bloques y Migraciones
│   │   ├── blocks/            # Bloques editoriales del editor Lexical
│   │   ├── collections/       # Colecciones (Articles, Media, Users, Redirects, etc.)
│   │   ├── hooks/             # Lifecycle hooks de publicación, slugs, auditoría
│   │   └── migrations/        # Migraciones versionadas de base de datos
│   ├── search/                # Pipeline de sincronización e indexación Meilisearch
│   ├── styles/                # Configuración de estilos globales y temas Tailwind
│   └── types/                 # Tipos y esquemas TypeScript globales
├── docker-compose.dev.yml     # Orquestación de servicios locales (Postgres, Meili, MinIO)
└── payload.config.ts          # Configuración raíz de Payload CMS
```

---

## 🔒 Arquitectura de Seguridad & Separación de Servicios

1. **Aislamiento del Buzón de Denuncias**: El sistema seguro de recepción de denuncias ciudadanas opera como un servicio aislado con base de datos propia y quarantine storage, desacoplado del CMS principal.
2. **Evidence Vault**: Documentos y evidencias sensibles asociadas a investigaciones periodísticas se gestionan en buckets cifrados y protegidos con firmas temporales y control de acceso estricto (RBAC).
3. **Contrato Editorial Inmutable**: Control de estados de ciclo de vida (`draft`, `in_review`, `scheduled`, `published`, `archived`) con auditoría de cambios y reglas de precedencia formalizadas en [ADR-001](docs/adr/ADR-001-contrato-status-editorial.md).

---

## 📚 Documentación de Referencia

- [Master Implementation Plan](docs/implementation/MASTER-IMPLEMENTATION-PLAN.md)
- [PRD Master v2](docs/prd/PRD-MASTER-clasificados-colombia-v2.md)
- [PRD Modelo de Datos Payload](docs/prd/PRD%20—%20MODELO%20DE%20DATOS%20DEFINITIVO%20PAYLOAD.md)
- [PRD Infraestructura, DevOps & Seguridad](docs/prd/PRD%20—%20INFRAESTRUCTURA,%20DEVOPS,%20SEGURIDAD%20Y%20DEPLOY.md)
- [PRD Seguridad Editorial & Evidence Vault](docs/prd/PRD%20—%20SEGURIDAD%20EDITORIAL,%20RBAC,%20EVIDENCE%20VAULT%20Y%20THREAT%20MODEL.md)
- [PRD SEO & Google News](docs/prd/PRD%20—%20SEO,%20GOOGLE%20NEWS,%20DISCOVER%20Y%20AUTORIDAD%20EDITORIAL.md)
- [ADR-001: Contrato de Status Editorial](docs/adr/ADR-001-contrato-status-editorial.md)
