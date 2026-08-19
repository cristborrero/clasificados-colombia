# Implementation log

Registro cronológico de lo construido, con las decisiones que no son evidentes
en el código.

---

## 2026-08-19 · F16 · SEO, Google News y Discover

**Qué se construyó**

- `src/lib/routes.ts`: única fuente de verdad de las URL. Segmentos reservados,
  constructores de ruta y `absoluteUrl()`.
- `src/lib/seo/structuredData.ts`: constructores puros de JSON-LD —
  `NewsArticle`/`ReportageNewsArticle`, `NewsMediaOrganization`,
  `BreadcrumbList`, `Person`, `VideoObject`.
- `src/lib/seo/metadata.ts`: canonical, Open Graph, Twitter y directivas de
  robots.
- `src/lib/seo/newsSitemap.ts` y `/news-sitemap.xml`: ventana de 48 h, tope de
  1000 entradas.
- `src/app/robots.ts` y `src/app/sitemap.ts`.

**Decisiones que no se ven en el código**

- **`robots.ts` y `sitemap.ts` viven en `src/app/`, no en `(frontend)/`.** La
  ruta dinámica hermana `[categoria]` capturaba `/robots.txt` y devolvía
  "Sección no encontrada". El grupo de rutas no aísla de eso.
- **Las directivas de vista previa van en `<meta name="robots">`, no bajo
  `googleBot`.** Next emite el bloque `googleBot` como una etiqueta aparte que
  ningún otro rastreador lee, y Google lee `robots` de todas formas: acotarlas a
  un agente no compra nada y cuesta las vistas previas grandes en el resto.

**Un fallo de seguridad que destapó la suite**

Una cuenta deshabilitada respondía con el mensaje en español y una contraseña
incorrecta con el integrado de Payload en inglés. Mismo 401, cuerpos distintos:
suficiente para enumerar qué cuentas existen pero están deshabilitadas, que es
lo que PRD Nº5 §86 y §130 prohíben. El hook `beforeLogin` ya lanzaba
`AuthenticationError` con esa intención, pero sin traductor — y bare resuelve
por un camino distinto al de la operación de login. Ahora recibe `req.t`, el
mismo traductor, así los dos cuerpos son idénticos sea cual sea el idioma
negociado. Lo hizo visible el cambio a `supportedLanguages: { es }`.

**`upgrade-insecure-requests` retirado de la CSP**

Añadida en F19, rompía 15 tests de mobile-safari sin tocar producción. Sobre
HTTP plano la directiva no es inocua: reescribe todos los subrecursos a
`https://`, y el servidor de pruebas no habla TLS, así que CSS, fuentes,
imágenes y JS morían en el handshake. Chromium lo oculta porque exime a loopback
como origen confiable; WebKit no. Se manifestaba como desbordamiento horizontal
en todas las páginas a la vez.

Se retira en vez de condicionarse porque en este código no tiene trabajo que
hacer: todos los subrecursos son relativos y del mismo origen, `default-src
'self'` ya prohíbe cualquier otro, HSTS es lo que realmente fuerza TLS en el
host, y las cabeceras de producción confirman que `img-src` no lleva ningún host
externo. Ver el comentario en `next.config.mjs`.

**Dos trampas de compilación contra ejecución**

Vale la pena registrarlas porque ambas cuestan una tarde:

1. **`headers()` se evalúa en el `build`**, no en el arranque, y queda horneada
   en `.next/routes-manifest.json`. Reiniciar el servidor con otras variables de
   entorno no cambia una sola cabecera.
2. **`NEXT_PUBLIC_SERVER_URL` también se hornea** desde `.env`. Es el origen
   *canónico*, que un build local declara con toda razón mientras se sirve por
   HTTP. Origen canónico y esquema de la petición son hechos distintos.

**Estado verificado**

```txt
typecheck  limpio
lint       limpio
unit       296 tests
e2e        214 pasan · 28 saltados a propósito
build      limpio
```

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
