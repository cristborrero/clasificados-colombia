# PRD archivados — arquitectura compleja v1

Estos cinco documentos **ya no son fuente de verdad**. Se archivaron el
2026-08-18 al simplificar la arquitectura.

| Documento archivado | Qué proponía | Qué lo reemplaza |
| --- | --- | --- |
| `PRD — SEGURIDAD EDITORIAL, RBAC, EVIDENCE VAULT Y THREAT MODEL.md` | 9 roles, Evidence Vault con clasificación de tres niveles, grants por necesidad de conocer, URLs prefirmadas de 60 s, auditoría append-only | 3 roles (`admin`, `editor`, `author`) y colecciones estándar de Payload sobre S3/MinIO, en el PRD Master |
| `PRD — SERVICIO SEGURO DE DENUNCIAS.md` | App, base de datos y almacenamiento de cuarentena separados, sin claves foráneas hacia Payload, worker de escaneo | Colección `tips` dentro de Payload, protegida por RBAC, con Turnstile y rate limiting en el formulario público |
| `PRD — INFRAESTRUCTURA, DEVOPS, SEGURIDAD Y DEPLOY.md` | Cuatro redes Docker aisladas, topología multi-servicio | Un solo `docker-compose` / Coolify: Next.js + Payload en un proceso, un Postgres, un Meilisearch |
| `PRD — MODELO DE DATOS DEFINITIVO PAYLOAD.md` | Modelo de datos derivado del threat model anterior | Sección de modelo de datos del PRD Master |
| `PRD-arquitectura-cms-payload-clasificados-colombia.md` | Arquitectura CMS previa | PRD Master |

## Por qué se conservan

No por nostalgia. Tres razones concretas:

1. **Explican decisiones que siguen vigentes.** El contrato `_status` /
   `editorialStatus` (ADR-001) nació del §12 del PRD de Arquitectura, y esa
   regla —una pieza que menciona personas no se publica sin revisión legal
   aprobada— sigue siendo correcta aunque los roles se hayan reducido.

2. **Documentan el punto de partida.** Si mañana el medio crece hacia
   periodismo de investigación con material sensible real, este es el diseño
   que ya estaba pensado, con sus razones.

3. **El código que los implementaba dejó tests.** Los tests describen reglas de
   negocio, no solo implementación; sobreviven a la simplificación mejor que el
   código.

## Regla de precedencia

Ante cualquier contradicción entre un documento de esta carpeta y
`docs/prd/PRD-MASTER-clasificados-colombia-v2.md`, **manda el PRD Master**.
