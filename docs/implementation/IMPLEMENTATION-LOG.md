# Implementation log

Registro cronológico de lo construido, con las decisiones que no son evidentes
en el código.

---

## 2026-08-19 · F18 · Cola de trabajos y UX de Admin

**Crítico contra no crítico, expresado por dónde vive el trabajo**

La clasificación que pide el PRD no es una etiqueta: lo que debe abortar la
operación —autorización de workflow, contrato de estados, comprobación de
derechos— corre en línea en `beforeChange` y lanza. Lo derivado —índice de
búsqueda, pistas de caché, notificaciones— se encola y puede fallar, reintentar
y reportarse sin que un editor lo vea.

**De promesa suelta a cola durable**

La sincronización con Meilisearch era una promesa desprendida con `catch`. Eso
cumplía la regla que importa —publicar no espera al buscador— pero la cumplía
olvidando: un envío fallido se registraba y desaparecía, y el índice quedaba mal
hasta que alguien reindexara entero.

Ahora el hook escribe un job y vuelve. La fila se escribe en el mismo `req`, así
que se confirma con el cambio editorial o con nada: una publicación revertida no
puede dejar atrás un job que indexaría una versión que nadie publicó.

**El guardián de versión**

PRD Nº9 §89 describe el fallo con precisión: publicar v5, actualizar v6, y el
job de v5 terminando último sobrescribe v6 en el índice. Por eso el documento
**no viaja en el job**: viaja la versión que tenía al encolarse. La tarea
relee el documento y, si ya avanzó, no escribe nada.

Verificado contra el servidor: una publicación encola cuatro jobs —creación, dos
pasos de workflow y publicación— y el resultado es un `upserted` y tres
`superseded`. El guardián no es teórico.

**Un agujero de seguridad que encontró la prueba**

`/api/payload-jobs` respondía **200 a un `author`**. Un registro de la cola
lleva la colección y el id de lo que cambió, así que la cola es una lista en
vivo de qué piezas sin publicar existen y cuándo las tocaron. PRD Master §93
deja los borradores fuera de lo que un lector puede llegar a saber; un autor
leyendo el trabajo en curso de toda la redacción es la misma fuga con otro
nombre. La colección se restringe ahora a admin y editor.

**Recursión de hooks, y un defecto de F15 que cerró**

`media:regenerate` reprocesaba el original en cada pasada: recomprimía el JPEG
un poco más y **recalculaba la huella a partir del archivo ya procesado**, así
que el identificador de contenido de cada imagen cambiaba cada vez que corría el
mantenimiento y la detección de duplicados dejaba de funcionar en silencio.
Ahora esa escritura viaja con `context: { skipUploadProcessing: true }` —
normalizar y hashear son para lo que llega de fuera, no para nuestra propia
salida.

**Admin**

- `PublicationChecklist`, junto a Guardar/Publicar en los cinco tipos que se
  publican. Reutiliza `getPublishBlockers`, la misma función pura que llama el
  guardián del servidor: una segunda lista de reglas escrita para la interfaz
  derivaría, y derivaría en la dirección que menos se nota —el panel diciendo
  «listo» para algo que el backend después rechaza—. La licencia de la imagen se
  le pregunta al servidor, porque el formulario solo tiene el id.
- `SearchHealth`, en el escritorio. No dibuja nada cuando la cola está sana: un
  panel que siempre muestra un estado enseña a no leerlo.
- `pnpm jobs:health` para el mismo dato desde la terminal, con salida distinta
  de cero si algo agotó sus reintentos.

**Lo que no se implementó, y por qué**

- **`EvidenceClassificationWarning`.** El plan lo pide para avisar antes de
  publicar una investigación con evidencia `internal` o `restricted`. Esa
  clasificación multinivel se retiró en la simplificación del 2026-08-18: hoy un
  documento publicado es público y uno que no puede serlo no se sube. No queda
  nada de qué advertir.
- **`SEOPreview` y `WorkflowPanel`.** Sin equivalente en el DoD y con menos valor
  que lo anterior. El primero duplica lo que ya muestra el propio buscador; el
  segundo, lo que el checklist y el campo de estado ya dicen.
- **Notificaciones.** No hay destinatario definido —ni canal ni política— y una
  tarea que envía correos a nadie es infraestructura sin uso.

**Estado verificado**

```txt
typecheck  limpio
lint       limpio
unit       321 tests
e2e        226 pasan · 3 nuevos de F18 · 40 saltados a propósito
migración  base vacía → 4 migraciones → correcto
build      limpio
```

---

## 2026-08-19 · F17 · Redirects, correcciones y estados HTTP

**Los redirects se escribían y nadie los leía**

`createSlugRedirect` venía guardando una fila cada vez que cambiaba el slug de
una pieza publicada, desde F4. Ninguna página consultaba esa tabla, así que la
URL anterior devolvía 404 igual. Una fila que nadie consulta no es un redirect:
es una nota sobre uno.

La resolución ocurre camino del 404, no en middleware. Así la consulta no cuesta
nada en las peticiones que sí encuentran su página —casi todas— y solo se paga
donde de todas formas había que resolver algo. La alternativa era una consulta a
la base delante de cada petición del sitio para servir el puñado que la necesita.

**Dos defectos que esto destapó**

1. **El redirect de artículos apuntaba a una URL que no existe.** Construía
   `/articulo/${slug}`, forma que F16 retiró al mover los artículos a
   `/[categoria]/[articulo]`. Estaba mal en los dos extremos y no reportaba
   nada. El constructor recibe ahora el documento y resuelve la sección; si no
   puede, no escribe redirect — una fila hacia `/undefined/slug` es peor que
   ninguna, porque parece deliberada.
2. **La normalización de rutas estaba duplicada**: una copia en el hook de la
   colección y otra en el resolutor. Dos definiciones de «la forma canónica de
   esta ruta» es una más de las que pueden mantenerse de acuerdo, y una fila
   escrita con una regla y buscada con la otra es un redirect que sencillamente
   nunca dispara. Vive en `src/lib/routes.ts`, que ya es la fuente de verdad de
   las URL.

**Correcciones**

Colección propia, no un array en cada tipo de contenido: los cinco tipos
llevarían una copia del mismo campo, y un índice de correcciones —todas las que
ha emitido el medio, en un sitio— es práctica estándar en una publicación seria
e imposible de construir con los datos repartidos en cinco tablas.

Cuatro tipos, y no son intercambiables: llamar «aclaración» a un error de dato
es la forma más antigua de aparentar que se corrige algo sin hacerlo. Solo la
corrección se marca en rojo — gastarlo en una actualización, donde nada estaba
mal, lo convertiría en «algo cambió» en vez de «nos equivocamos».

El texto original no se toca. Lo que se publica es el registro, junto a lo que
corrige.

Borrar una corrección borra la constancia de un error, que es justo lo que la
colección existe para impedir: solo admin, y la forma prevista de retractarse es
emitir otra.

**404 editorial**

Quien llega ahí llega defraudado. La página por defecto de Next le dice que la
ruta no existe, lo cual es cierto e inútil. Esta asume que venía buscando algo y
ofrece las tres salidas: búsqueda, últimas noticias e investigaciones. Las dos
listas se piden con `catch`: si la base es la razón por la que el lector está
ahí, una lista vacía es mejor respuesta que un error dentro de un error.

Lleva dos etiquetas `robots`, a propósito. El segmento dinámico declara una para
las URL que no resuelven, y la 404 otra para las que no encajan en ningún
segmento; ninguna cubre el caso de la otra.

**Un defecto de F16 que salió aquí: el sitemap se horneaba en el build**

`sitemap.ts` declaraba `export const revalidate = 3600`, y eso hace que Next lo
prerenderice durante la compilación y sirva esa copia la primera hora después de
cada despliegue. La imagen de producción se construye sin base de datos, así que
lo que horneaba era un sitemap con la portada y nada más: una invitación a
rastrear un sitio de una sola página, publicada en cada redespliegue.

Es exactamente el fallo del que ya avisa el layout del frontend —el build no
sabe qué contendrá la base—. Ahora es `force-dynamic`. Comprobado que la ruta
sigue emitiéndose: con `robots.ts` el mismo cambio hizo que Next no la generara
en absoluto, y el síntoma fue un 404 que parecía específico de robots.

**Los tests de WebKit no fallaban por el código**

Ocho de doce pruebas de `article.spec` en mobile-safari agotaban los 90 s, de
forma reproducible, sobre una página que el servidor entrega en 30 ms. Medido:
la primera navegación de un WebKit en frío tarda ~25 s en esta máquina —los
binarios del navegador viven en el mismo disco externo— y 256 ms con la caché
caliente. Con cuatro workers arrancando a la vez, la primera tanda siempre se
pasaba del límite.

El proyecto `mobile-safari` tiene ahora 180 s. Subir el techo en vez de bajar los
workers mantiene la suite en cuatro minutos en lugar de ocho; se paga con un
informe más lento ante un cuelgue real, que es lo barato de los dos.

**Lo que no se implementó, y por qué**

- **410 Gone.** El plan lo menciona. Devolverlo desde un componente de página no
  es posible en el App Router: `notFound()` da 404 y no hay forma soportada de
  cambiarlo. Requeriría middleware, que este proyecto no tiene. La diferencia
  frente al 404 es que Google desindexa antes; no está en el DoD.
- **Rutas `/opinion`, `/datos` y `/video`.** `src/lib/routes.ts` las declara,
  pero esas páginas no existen todavía — hueco anterior a F17, no una regresión.
  Sus redirects automáticos apuntarán a un 404 mientras siga así.

**Estado verificado**

```txt
typecheck  limpio
lint       limpio
unit       321 tests
e2e        223 pasan · 5 nuevos de F17 · 37 saltados a propósito
migración  base vacía → 3 migraciones → correcto
build      limpio
```

---

## 2026-08-19 · F15 · Media Pipeline

F4 dejó el modelo de metadatos —derechos, crédito, licencia, origen sintético—
porque es la parte cara de añadir después. F15 pone encima el procesamiento y
las garantías.

**Lo que entra y lo que no**

- **SVG rechazado.** `mimeTypes` era `image/*`, que admite `image/svg+xml`. Un
  SVG es un documento que puede llevar `<script>`, y se serviría desde nuestro
  propio origen, donde una CSP construida sobre `'self'` no protege de nada. No
  se sanea, se rechaza: sanear SVG es una carrera contra las diferencias entre
  parsers, y aquí no hay nada que ganar — las marcas del sitio salen de
  `public/brand/`.
- **Formatos permitidos**: JPEG, PNG, WebP, AVIF, GIF, TIFF.

**Metadatos y color**

Los derivados ya salían limpios: Payload los pasa por sharp y sharp descarta
metadatos salvo que se le pida conservarlos. El agujero era **el original**, que
se guardaba tal cual y se sirve público. Una fotografía recién salida de un
teléfono lleva las coordenadas GPS de donde se tomó, que para esta redacción
puede ser la casa de una fuente.

Ahora el original pasa por sharp en `beforeOperation` —el único punto que ve los
bytes cuando todavía son solo bytes— con tres pasos: hornear la orientación EXIF
en los píxeles (si no, al quitar el bloque la foto vertical queda tumbada para
siempre), convertir a sRGB y descartar todo lo demás.

**Huella y duplicados**

SHA-256 de los bytes **tal como se subieron**, no del resultado normalizado:
hashear la salida ataría la identidad de una imagen a la versión de sharp que la
procesó, y la misma fotografía resubida tras actualizar una dependencia
parecería otra distinta.

**Borrado**

Un asset que algo está mostrando no se borra. Restringirlo a administradores
nunca fue la protección: un administrador que borra la imagen principal rompe un
artículo publicado igual de bien que cualquiera.

La comprobación tiene dos mitades porque Payload guarda las referencias en dos
sitios. La imagen principal es una columna (`hero_image_id`), consultable. Una
imagen soltada dentro del cuerpo vive en el `jsonb` de Lexical y **no genera fila
de relación** — `articles_rels` no tiene columna `media_id`. Un guardián que
mirara solo las columnas la daría por no usada. Se recorren ambas.

Dos defectos que esto destapó, ambos silenciosos:

1. El recorrido de campos solo miraba el primer nivel, y la imagen principal es
   `hero.image`, dentro de un grupo. Es decir: no encontraba la imagen más usada
   del sitio.
2. Recorría también las colecciones internas de Payload.
   `payload-locked-documents` tiene una relación polimórfica que incluye `media`,
   y consultarla por id de imagen no es una consulta válida — salía como 500 en
   un borrado corriente.

**Derechos**

Una imagen con licencia desconocida no puede publicarse (§119). Es la quinta
comprobación del guardián de publicación, junto a fact-check, legal, metodología
y autoría. Lee la licencia del asset, no lo que traiga la petición.

**No hay interruptor de excepción**, y es deliberado: convertiría en una casilla
la única decisión que tiene que tomar una persona. La forma de publicar una
fotografía con derechos poco claros es establecerlos y registrarlos. Queda
anotado por si la dirección prefiere lo contrario — el PRD contempla un override
auditado y esto se aparta de esa letra.

**Formatos modernos**

AVIF y WebP se negocian por petición en el optimizador de imágenes, no se
almacenan como derivados extra. Guardar un AVIF y un WebP junto a cada tamaño
duplicaría la biblioteca sin ganar nada. Declarado explícitamente en
`next.config.mjs` en vez de heredado del valor por defecto.

**Comandos**

```txt
pnpm media:regenerate   reconstruye derivados desde los originales conservados
pnpm media:rights       licencias vencidas y qué contenido publicado las usa
```

El segundo informa, no actúa: despublicar una historia porque venció la licencia
de una foto es una decisión editorial, y un script que la tomara solo dejaría
periodismo vivo fuera de línea de madrugada sin que nadie lo decidiera. La
alerta en el Admin es F18.

**Dos trampas de método, anotadas para no repetirlas**

1. `pnpm test:e2e` **no compila**. Reutiliza el servidor existente, así que los
   arreglos en `src/` no se estaban ejecutando: el mismo 500 se repetía mientras
   la misma función, llamada desde el código fuente, funcionaba. Usar
   `pnpm test:e2e:full` o compilar antes.
2. **`sharp` no puede importarse dentro de un spec de Playwright.** Su
   dependencia `semver` entra en un ciclo CJS/ESM que el cargador reporta como
   "Unexpected module status 3" y mata la ejecución entera. La fixture con EXIF
   se genera aparte y se versiona; el test comprueba el marcador APP1 por bytes.

**Estado verificado**

```txt
typecheck  limpio
lint       limpio
unit       317 tests
e2e        218 pasan · 4 nuevos de F15 contra la API
migración  base vacía → 2 migraciones → correcto
build      limpio
```

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

---

## 2026-08-19 / 25 · F15–F22 (Pipeline de Medios, SEO, Jobs, Vitrina y QA de Lanzamiento)

- **F15 (Pipeline de Medios):** Sanitización estricta de subidas vía Sharp (conversión forzada a sRGB, eliminación total de metadatos EXIF sensibles para protección de fuentes, rechazo categórico de SVGs ejecutables, hash SHA-256 contra duplicados y guardas contra borrado de imágenes vinculadas a artículos publicados).
- **F16 (SEO & Metadatos):** Metadatos completos por sección, schema JSON-LD (`NewsArticle`, `Organization`), sitemaps dinámicos (`/sitemap.xml`, `/news-sitemap.xml`) y control de indexación vía `ALLOW_INDEXING`.
- **F17 (Routing & Redirects):** Redirecciones automáticas al mutar slugs, resolución canónica, 404 periodístico con buscador integrado y registro de correcciones editoriales.
- **F18 (Payload Jobs):** Cola durable y asíncrona para sincronización de búsqueda en Meilisearch, auditoría de derechos de autor y regeneración de derivados.
- **F19–F21 (Infraestructura y Denuncias):** Docker Compose de producción para Coolify en VPS Contabo, webhook de CI/CD automático, canal de denuncias seguras (`/denunciar`) con Cloudflare Turnstile y SMTP vía Resend.
- **F22 (QA & Go-Live Readiness):**
  - Runbook de rotación de secretos y checklist de lanzamiento en `docs/runbooks/ROTACION-SECRETOS-Y-LANZAMIENTO.md`.
  - Suite de validación de breakpoints (360px, 768px, 1024px, 1440px) y accesibilidad (landmarks, skip link, etiquetado de formularios) en `e2e/responsive-and-a11y.spec.ts`.
  - Verificación estricta de no-fuga de borradores ni denuncias en búsqueda.
