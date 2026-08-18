# Implementation log

Registro cronológico de lo construido, con las decisiones que no son evidentes
en el código.

---

## 2026-08-18 · Simplificación arquitectónica

**Motivo:** sobreingeniería en los PRD originales. Un threat model de nueve
roles, un Evidence Vault con clasificación multinivel y un microservicio de
denuncias con base de datos propia son el diseño correcto para una organización
que maneja material clasificado, y demasiada maquinaria para un medio digital.

**Qué cambió**

| Antes | Ahora |
| --- | --- |
| 9 roles | 3: `admin`, `editor`, `author` |
| `Evidence` + `EvidenceAccessGrants` + `InvestigationTeams` + endpoint de autorización con URLs de 60 s | `evidence-documents`: colección estándar de Payload sobre S3/MinIO |
| Denuncias como servicio aislado | Colección `tips` con RBAC |
| 8 estados editoriales | `draft → review → published` (+ `archived`) |
| 4 redes Docker | Un stack: app + Postgres + Meilisearch |

**Qué NO cambió, y por qué importa**

La regla de publicación sigue intacta: una investigación que menciona personas
no se publica sin `legalStatus: 'approved'`. Verificación y revisión legal
dejaron de ser *estados del flujo* y pasaron a ser *campos de la pieza*. Como
estados obligaban a toda nota a atravesar casillas que la mayoría no necesita;
como campos siguen siendo condiciones de publicación donde hacen falta.

La invariante de ADR-001 también sigue: la visibilidad pública se deriva del
estado editorial, nunca se controla por separado.

**Decisiones tomadas**

- **El mapeo de roles yerra hacia abajo.** `reporter`, `fact_checker`,
  `legal_reviewer`, `photo_editor` y `contributor` se convierten en `author`, no
  en `editor`. Dar menos de lo que se tenía es un ticket de soporte; dar más es
  un incidente. Está en `LEGACY_ROLE_MAP` con tests.
- **`admin` ahora sí publica.** El modelo anterior se lo prohibía por separación
  de funciones. Con tres roles no queda nadie que sea "el técnico": un admin en
  una redacción de este tamaño también edita. Mantener la regla habría exigido
  dos cuentas para publicar cualquier cosa, que es como se termina con un login
  de editor compartido. El test que lo afirmaba está invertido, con el motivo
  escrito al lado.
- **El anonimato de una denuncia vive en el modelo de datos.** Si quien denuncia
  lo pide, los campos de contacto no se guardan — no ocultos, no cifrados, no se
  guardan. Un campo almacenado puede filtrarse o ser requerido judicialmente.
- **Migraciones refundidas en una inicial.** Ver
  `docs/adr/ADR-003-refundicion-de-migraciones.md`. Válido solo porque todavía
  no hay despliegue; deja de estarlo en cuanto lo haya.

**Lo que se retiró y dónde queda**

Cinco PRD en `docs/archive/prd-complex-v1/`, con un README que explica qué
reemplaza a qué. El código eliminado sigue en el historial de Git.

**Estado verificado**

```txt
typecheck  limpio
lint       limpio
unit       234 tests
esquema    74 tablas desde una migración inicial
seed       completo y verificado
```

---

## 2026-08-17 / 18 · F0–F14

Ver el historial de commits. Resumen:

- **F0–F2** scaffold, design system, Payload sobre Postgres.
- **F3** control de acceso. Cerró un agujero real: `Users` no declaraba bloque
  `access`, regían los defaults permisivos de Payload, y cualquier cuenta
  autenticada podía borrar al administrador.
- **F4–F5** modelo de contenido e investigaciones, con el contrato de estados de
  ADR-001.
- **F8–F13** shell del sitio, familia de tarjetas, portada, artículo,
  investigación y páginas de perfil.
- **F14** Meilisearch: índice, ajustes versionados en código, página de búsqueda
  y endpoint.

Dos defectos que costaron encontrar y conviene recordar:

1. **`/` se prerenderizaba en build**, así que el header quedaba horneado con la
   base vacía de un despliegue nuevo, y la barra de última hora podía seguir
   anunciando una emergencia terminada. El frontend ahora renderiza por request.
2. **Meilisearch aceptaba escrituras que fallaban después.** Los ids llevaban
   `:`, que rechaza — de forma asíncrona. La escritura devolvía 202, el comando
   informaba "11 indexados" y el índice quedaba vacío. Ahora toda escritura se
   confirma contra la cola de tareas.
