# PRD MASTER — CLASIFICADOS COLOMBIA

## Plataforma Editorial Digital · Rebranding 2026

> **Este documento es la única fuente de verdad de la plataforma.**
>
> Los PRD complementarios que siguen vigentes son de detalle, no de arquitectura:
>
> | PRD | Alcance |
> | --- | --- |
> | `PRD — FRONTEND EDITORIAL DEFINITIVO.md` | Componentes, plantillas y experiencia de lectura |
> | `PRD — SEO, GOOGLE NEWS, DISCOVER Y AUTORIDAD EDITORIAL.md` | Metadatos, structured data, sitemaps |
> | `PRD — SEARCH & DISCOVERY.md` | Meilisearch: índices, ranking, UI de búsqueda |
> | `PRD — MEDIA PIPELINE & DIGITAL ASSET MANAGEMENT.md` | Imágenes, derivados, derechos |
>
> Ante cualquier contradicción, **manda este documento**.
>
> ---
>
> **Historial de versiones**
>
> - **2026-08-18 · Simplificación arquitectónica.** Se reducen los nueve roles a
>   tres (`admin`, `editor`, `author`), se retira el Evidence Vault con
>   clasificación multinivel en favor de colecciones estándar de Payload sobre
>   S3/MinIO, el servicio aislado de denuncias pasa a ser la colección `tips`
>   dentro de Payload, y la infraestructura se unifica en un solo stack. Cinco
>   PRD quedan archivados en `docs/archive/prd-complex-v1/` con la explicación
>   de qué los reemplaza. Cambian las secciones 8, 20, 22, 23, 26, 51 y 52.
>   **No cambia nada de marca, identidad visual, tipografía, UX/UI, SEO,
>   accesibilidad ni experiencia de lectura.**
> - **Versión anterior.** Reemplazo de Sanity CMS por Payload CMS self-hosted
>   como motor editorial (secciones 8, 23, 27 y 52).

### 1. Rol del agente

Actúa simultáneamente como:

* Principal Product Designer
* Senior UX/UI Designer
* Design Systems Lead
* Staff Frontend Engineer
* Senior Next.js Architect
* Technical SEO Lead
* Accessibility Specialist
* Performance Engineer
* CMS Architect
* News Product Designer

Tu misión es diseñar y construir la nueva plataforma digital de **Clasificados Colombia**, un medio colombiano de periodismo independiente, investigación, denuncia, contexto y análisis.

No estás construyendo un blog, una landing page ni una plantilla genérica de noticias.

Estás construyendo un **producto editorial premium de nivel internacional**.

La referencia cualitativa debe estar más cerca de:

Reuters
Financial Times
The Guardian
BBC
Bloomberg
Monocle

que de un portal de noticias convencional.

No copies ninguno de estos medios.

Toma de ellos únicamente principios de:

* jerarquía informativa;
* autoridad editorial;
* legibilidad;
* navegación;
* densidad controlada;
* fotografía;
* experiencia de lectura;
* credibilidad;
* performance.

---

# 2. MARCA

## Nombre

CLASIFICADOS COLOMBIA

## Posicionamiento

Medio independiente dedicado a investigación, denuncia, análisis y contexto.

## Principio editorial

**La verdad no se negocia.**

## Línea institucional

**Investigamos. Informamos. No callamos.**

## Personalidad

La marca debe sentirse:

* rigurosa;
* independiente;
* sobria;
* investigativa;
* valiente;
* contemporánea;
* creíble;
* humana;
* institucional sin parecer gubernamental.

Nunca debe sentirse:

* sensacionalista;
* amarillista;
* partidista;
* activista visualmente;
* corporativa genérica;
* tecnológica tipo SaaS;
* tabloide;
* sobrecargada.

---

# 3. PRINCIPIO CENTRAL DE DISEÑO

## INFORMATION FIRST

La información tiene prioridad sobre la decoración.

Cada decisión visual debe ayudar a responder una de estas preguntas:

1. ¿Qué ocurrió?
2. ¿Por qué importa?
3. ¿Quién lo investigó?
4. ¿Qué evidencia existe?
5. ¿Cuándo ocurrió?
6. ¿Dónde ocurrió?
7. ¿Qué debería leer después?

Eliminar cualquier componente que no contribuya a alguna de estas funciones.

---

# 4. IDENTIDAD VISUAL

Utilizar estrictamente el sistema aprobado.

## Paleta principal

### Negro Editorial

`#0A0A0A`

Uso:

* titulares;
* navegación;
* texto principal;
* fondos oscuros;
* secciones editoriales premium.

### Rojo Investigación

`#D71920`

Uso restringido a:

* Breaking News;
* investigaciones;
* énfasis;
* indicadores;
* CTA importantes;
* estados activos;
* líneas editoriales.

Nunca utilizar grandes superficies rojas innecesariamente.

### Paper

`#F7F6F2`

Uso:

* fondo editorial principal;
* artículos;
* secciones de lectura;
* documentos.

Evitar blanco digital excesivamente frío.

### Blanco

`#FFFFFF`

### Gris información

`#6B6B6B`

### Gris oscuro

`#333333`

### Gris claro

`#E5E5E5`

### Gris ultraclaro

`#F0F0F0`

---

# 5. REGLA DE PROPORCIÓN CROMÁTICA

Como referencia:

60 % Negro Editorial
25 % Paper / blanco
10 % escala de grises
5 % Rojo Investigación

El rojo nunca debe convertirse en decoración.

Debe significar algo.

---

# 6. TIPOGRAFÍA

## Editorial / Display

**Playfair Display**

Usar para:

* H1;
* H2 editoriales;
* titulares de investigación;
* citas;
* grandes cifras;
* portadas especiales.

## Interface / Body

**Source Sans 3**

Usar para:

* cuerpo;
* metadata;
* navegación;
* botones;
* etiquetas;
* timestamps;
* formularios;
* captions.

Implementar mediante `next/font`.

No depender de llamadas externas bloqueantes.

---

# 7. ESCALA TIPOGRÁFICA

Construir mediante `clamp()` para adaptación fluida.

Referencia desktop:

Display XXL:
72–96 px

H1:
56–72 px

H2:
40–52 px

H3:
28–36 px

Lead:
20–24 px

Body large:
19–21 px

Body:
17–19 px

Metadata:
13–14 px

Label:
11–13 px

En móvil reducir proporcionalmente sin sacrificar legibilidad.

No utilizar tamaños diminutos para simular sofisticación.

---

# 8. STACK TECNOLÓGICO

Construir con:

* Next.js
* App Router
* React
* TypeScript estricto
* Tailwind CSS 4
* shadcn/ui
* Base UI primitives
* Payload CMS (self-hosted, corre como plugin nativo de Next.js — mismo repo, mismo deploy)
* Postgres (base de datos de Payload y del contenido editorial)
* Payload Local API para data fetching en Server Components (sin round-trip HTTP a un CMS externo)
* Meilisearch (self-hosted) para búsqueda editorial
* MinIO (S3-compatible, self-hosted) para media y documentos publicados
* Server Components por defecto
* Server Actions cuando correspondan
* Route Handlers únicamente cuando sean necesarios
* Zod para validaciones
* Lucide para iconos funcionales

Infraestructura: Contabo (VPS) + Coolify (self-hosted PaaS), **un solo stack**:
app (Next.js + Payload en un proceso) + Postgres + Meilisearch + S3/MinIO.

Gestor de paquetes:

`pnpm`

No utilizar:

* Bootstrap
* Material UI
* Chakra
* jQuery
* page builders
* CSS-in-JS innecesario
* librerías gigantes para funcionalidades pequeñas.

---

# 9. FILOSOFÍA DE COMPONENTES

No utilizar shadcn como una plantilla visual.

Usar únicamente sus primitives accesibles.

Toda la apariencia debe construirse utilizando el Design System de Clasificados Colombia.

Crear componentes reutilizables.

Ejemplo:

```txt
/components
    /brand
    /navigation
    /editorial
    /articles
    /investigations
    /breaking-news
    /media
    /documents
    /data
    /forms
    /layout
    /ui
```

---

# 10. ESTRUCTURA PRINCIPAL DEL SITIO

Crear:

```txt
/
├── investigacion
├── politica
├── justicia
├── denuncia
├── analisis
├── datos
├── opinion
├── video
├── autores
├── buscar
├── nosotros
├── contacto
├── denunciar
└── newsletter
```

También:

```txt
/investigacion/[slug]
/articulo/[slug]
/autor/[slug]
/tema/[slug]
```

---

# 11. HEADER

El header debe transmitir inmediatamente autoridad editorial.

Desktop:

```txt
LOGO

Investigación
Política
Justicia
Denuncia
Análisis
Datos
Opinión

Buscar

[ÚLTIMA HORA]
```

Características:

* sticky inteligente;
* compacto durante scroll;
* borde inferior sutil;
* navegación clara;
* sin mega-menú innecesario.

Mobile:

* logo;
* menú;
* buscador;
* Breaking News accesible.

---

# 12. BREAKING NEWS BAR

Crear componente independiente:

`<BreakingNewsBar />`

Estados:

* última hora;
* alerta;
* información confirmada;
* en desarrollo.

Ejemplo:

```txt
ÚLTIMA HORA
Fiscalía allana oficinas por presunto contrato irregular
10:45 AM
Ver más →
```

Debe poder actualizarse desde el CMS.

No usar animaciones agresivas ni ticker infinito.

---

# 13. HOMEPAGE

La homepage debe sentirse editorial, no como un grid uniforme de tarjetas.

Crear jerarquía.

## Hero principal

Debe contener:

* categoría;
* titular;
* bajada;
* fotografía;
* metadata;
* CTA.

Ejemplo:

> Red de contratos millonarios salpica a funcionarios del Gobierno

No colocar cinco noticias con igual peso.

Una historia debe dominar visualmente.

---

# 14. SECCIONES DE HOMEPAGE

Orden recomendado:

Hero / Investigación principal

Últimas noticias

Investigaciones

Análisis

Noticias nacionales

Justicia

Denuncias ciudadanas

Datos

Videos

Opinión

Newsletter

Footer

La estructura debe poder modificarse desde el CMS sin modificar código.

---

# 15. TARJETAS EDITORIALES

Crear variantes:

```txt
ArticleCard
ArticleCardCompact
ArticleCardHorizontal
InvestigationCard
BreakingCard
OpinionCard
VideoCard
DataCard
DocumentCard
FeaturedCard
```

No crear una tarjeta universal gigantesca con veinte props.

Compartir primitives, no semántica editorial.

---

# 16. PÁGINA DE ARTÍCULO

La lectura es una función principal del producto.

Ancho óptimo de texto:

aprox. 680–760 px.

Estructura:

```txt
Breadcrumb

Categoría

H1

Bajada

Autor
Cargo
Fecha
Hora
Tiempo de lectura

Compartir

Hero image

Caption

Artículo
```

---

# 17. CUERPO DE ARTÍCULO

Debe soportar:

* párrafos;
* H2;
* H3;
* listas;
* citas;
* fotografías;
* galerías;
* video;
* audio;
* documentos;
* tablas;
* gráficos;
* embeds;
* cronologías;
* llamados;
* notas del editor;
* correcciones;
* actualizaciones.

Crear componentes de rich text específicos.

---

# 18. EXPERIENCIA DE LECTURA

Evitar:

* barras flotantes invasivas;
* popups inmediatos;
* interstitials;
* animaciones de entrada;
* widgets compitiendo con el artículo.

Priorizar:

* lectura;
* ritmo;
* claridad;
* contexto.

---

# 19. INVESTIGACIONES ESPECIALES

Crear un sistema visual específico para investigaciones extensas.

Ruta:

`/investigacion/[slug]`

Puede incluir:

* portada cinematográfica;
* introducción;
* autores;
* cronología;
* personas involucradas;
* organizaciones;
* documentos;
* evidencia;
* mapas;
* datos;
* capítulos;
* fuentes;
* metodología;
* actualizaciones.

Debe sentirse como un **dossier periodístico digital**.

---

# 20. DOCUMENTOS COMO PRIMERA CLASE DE CONTENIDO

*(Simplificado 2026-08-18)*

Los documentos que respaldan una investigación se publican junto a ella, no
escondidos al final. La evidencia forma parte de la narrativa.

Componente:

`EvidenceDocument`

Muestra:

* nombre;
* institución;
* fecha;
* tipo;
* páginas;
* contexto;
* enlace para ver o descargar.

## Modelo de almacenamiento

Colección estándar de Payload conectada a S3/MinIO. **Sin clasificación
multinivel, sin grants por necesidad de conocer, sin URLs prefirmadas de vida
corta.**

La regla operativa es más simple y más fácil de sostener:

```txt
si un documento se publica → es público
si no puede ser público → no se sube al CMS
```

Un documento sensible que todavía no puede publicarse vive fuera de la
plataforma hasta que pueda publicarse. Esa es una decisión editorial, no una
característica del software.

> El diseño anterior —Evidence Vault con tres niveles de clasificación, grants
> por investigación y URLs de 60 segundos— está archivado en
> `docs/archive/prd-complex-v1/`. Si el medio llega a manejar material sensible
> real, ahí está el diseño y sus razones.

---

# 21. SISTEMA "REDACTED"

Utilizar barras de censura como lenguaje visual propio.

Pero solo en:

* investigaciones;
* documentos;
* transiciones;
* elementos destacados.

No decorar toda la web con barras negras.

Debe comunicar:

información reservada → información revelada.

---

# 22. DENUNCIA CIUDADANA

*(Simplificado 2026-08-18)*

Crear `/denunciar`.

Debe inspirar seguridad. Explicar claramente:

* qué información enviar;
* qué ocurre después;
* privacidad;
* archivos permitidos;
* posibilidad de anonimato.

Formulario:

```txt
Nombre opcional
Email opcional
Teléfono opcional
Título
Descripción
Ubicación
Archivos
¿Desea permanecer anónimo?
```

## Arquitectura

Colección interna de Payload: `tips`.

```txt
formulario público
↓
Turnstile + rate limiting
↓
colección `tips` (Payload)
↓
lectura solo para admin y editor
```

Reglas de acceso:

| Operación | Quién |
| --- | --- |
| `create` | público, a través del endpoint con protección anti-abuso |
| `read` | `admin`, `editor` |
| `update` | `admin`, `editor` (solo el estado de gestión) |
| `delete` | `admin` |

`author` **no** lee denuncias.

## Lo que sigue siendo obligatorio

* **Una denuncia nunca genera contenido automáticamente.** Ni artículo, ni
  investigación, ni barra de última hora. El paso de denuncia a publicación
  siempre pasa por una decisión humana.
* **El anonimato se respeta en el modelo, no solo en la interfaz.** Si quien
  denuncia marca la casilla, los campos de contacto no se guardan — no se
  guardan ocultos, no se guardan.
* **Rate limiting y captcha en el endpoint público**, no solo en el formulario:
  un formulario protegido con un endpoint abierto no está protegido.

> El diseño anterior —app, base de datos y almacenamiento de cuarentena
> separados, sin claves foráneas hacia Payload, con worker de escaneo— está
> archivado en `docs/archive/prd-complex-v1/`.

---

# 23. CMS — PAYLOAD (self-hosted)

*(Actualizado 2026-08-18 — este PRD Master es la única fuente de verdad del CMS)*

Payload CMS v3 corre como plugin nativo de Next.js: mismo repositorio, mismo
proceso, mismo deploy. No hay un CMS externo al que hacer round-trip.

## Roles

Tres roles. No nueve.

| Rol | Puede |
| --- | --- |
| `admin` | Control total: contenido, usuarios, configuración global. |
| `editor` | Revisa, aprueba, programa y publica contenido. Lee denuncias. |
| `author` | Crea y edita **únicamente sus propios borradores**. No publica. |

Las reglas que se derivan de esto:

* Solo `editor` y `admin` publican. Un `author` que intente publicar por la API
  recibe un rechazo del backend, no solo un botón oculto.
* Un `author` edita lo suyo mientras esté en borrador. Una pieza publicada es
  un registro público, no un documento personal.
* Administrar usuarios es de `admin`. Ser editor en jefe del medio no es lo
  mismo que repartir credenciales.

## Colecciones

```txt
articles
investigations
opinions
dataStories
videoStories
authors
categories
topics
people
organizations
sources
media
evidenceDocuments
corrections
redirects
tips
users
```

## Globals

```txt
homepage
navigation
siteSettings
breakingNews
```

## Seguridad de acceso

**Deny by default.** Toda colección declara su bloque `access` de forma
explícita; ninguna hereda los valores permisivos por defecto de Payload.

La UI puede ocultar, el backend debe negar. Ninguna regla de acceso se duplica
como `admin.condition`.

---

# 24. ARTICLE SCHEMA

Campos mínimos:

```txt
title
slug
dek
category
authors[]
publishedAt
updatedAt
heroImage
heroCaption
body
tags[]
seo
featured
breaking
relatedArticles[]
sources[]
documents[]
```

---

# 25. INVESTIGATION SCHEMA

Además:

```txt
subtitle
summary
chapters[]
timeline[]
documents[]
people[]
organizations[]
sources[]
methodology
updates[]
```

---

# 26. WORKFLOW DE REDACCIÓN

*(Simplificado 2026-08-18)*

Tres estados. Sin bloqueos burocráticos intermedios.

```txt
draft → review → published
```

| Estado | Significa |
| --- | --- |
| `draft` | Se está escribiendo. Solo su autor y el equipo editorial lo ven. |
| `review` | Listo para que un editor lo lea. Sigue sin ser público. |
| `published` | Público. |

Más `archived`, que retira una pieza sin borrarla.

## La invariante que se mantiene

La visibilidad pública **se deriva** del estado editorial; no se controla por
separado. Una pieza en `draft` o `review` es imposible que sea pública, y eso lo
garantiza el backend, no la disciplina del equipo.

Esto es ADR-001 y sigue vigente: `_status` (nativo de Payload) dice si algo es
visible; `editorialStatus` dice dónde está en el proceso. Nunca pueden
contradecirse.

## Verificación y revisión legal

Dejan de ser **estados del flujo** y pasan a ser **campos de la pieza**:
`factCheckStatus` y `legalStatus`.

La diferencia importa: como estados obligaban a todo el mundo a pasar por
casillas que la mayoría de las notas no necesita. Como campos, siguen siendo
condiciones de publicación donde hacen falta —una investigación que menciona
personas no se publica sin revisión legal aprobada— sin frenar una nota de
agenda.

---

# 27. PREVIEW EDITORIAL

*(Actualizado)*

Configurar **Payload Live Preview** para Next.js.

Los editores deben poder:

* editar;
* previsualizar;
* navegar al contenido;
* revisar borradores.

Sin publicar accidentalmente.

---

# 28. SEO TÉCNICO

SEO es requisito central.

Implementar correctamente:

* Metadata API;
* canonical;
* Open Graph;
* Twitter cards;
* sitemap;
* robots.txt;
* breadcrumbs;
* structured data;
* hreflang si posteriormente existen idiomas.

---

# 29. SCHEMA.ORG

Implementar JSON-LD dinámico.

Utilizar cuando corresponda:

```txt
NewsArticle
Article
ReportageNewsArticle
OpinionNewsArticle
VideoObject
BreadcrumbList
Organization
Person
WebSite
```

No inventar propiedades.

---

# 30. GOOGLE NEWS

La arquitectura deberá poder funcionar correctamente como publisher.

Prestar especial atención a:

* fechas;
* autores;
* titulares;
* imágenes;
* canonical;
* metadata;
* URLs permanentes;
* structured data.

---

# 31. URLs

URLs humanas y permanentes.

Preferencia:

```txt
/investigacion/red-contratos-ministerio
/politica/reforma-salud-congreso
/justicia/fiscalia-investigacion-contratos
```

Evitar:

```txt
/article?id=837483
```

---

# 32. SOCIAL PREVIEWS

Generar dinámicamente imágenes Open Graph.

Cada artículo debe poder producir:

* titular;
* categoría;
* imagen;
* logo;
* branding.

Formato:

1200 × 630.

---

# 33. SEARCH

Implementar búsqueda editorial real mediante **Meilisearch (self-hosted)**.

Debe buscar:

* títulos;
* contenido;
* autores;
* categorías;
* tags;
* fechas.

No agregar infraestructura compleja antes de necesitarla.

---

# 34. PERFORMANCE

Objetivo:

Core Web Vitals excelentes.

Priorizar:

* Server Components;
* HTML generado en servidor;
* carga mínima de JavaScript;
* imágenes optimizadas;
* fuentes optimizadas;
* lazy loading;
* caching;
* streaming;
* prefetch controlado.

No convertir todo en Client Components.

`"use client"` debe ser la excepción.

---

# 35. IMÁGENES

Utilizar:

`next/image`

Crear tamaños responsive reales.

No enviar una imagen 2400 px a un teléfono cuando se visualiza a 350 px.

Mantener ratios editoriales consistentes.

---

# 36. ACCESSIBILITY

Objetivo:

WCAG 2.2 AA.

Implementar:

* navegación por teclado;
* focus visible;
* semantic HTML;
* landmarks;
* labels;
* alt text;
* contraste;
* reduced motion;
* skip links;
* formularios accesibles.

No sacrificar accesibilidad por estética.

---

# 37. MOTION

La web no debe parecer una demo de Awwwards.

Motion:

* 120–250 ms;
* discreto;
* funcional;
* editorial.

Permitido:

* hover;
* subrayados;
* pequeños desplazamientos;
* aparición contextual;
* transición de navegación.

Evitar:

* scroll hijacking;
* parallax excesivo;
* textos volando;
* animaciones 3D;
* cursores personalizados;
* loaders decorativos.

---

# 38. GRID

Desktop:

12 columnas.

Max content width:

aprox. 1440 px.

Article width:

680–760 px.

Gutters generosos.

Mobile:

4 columnas.

Tablet:

8 columnas.

Usar CSS Grid para estructura editorial.

---

# 39. ESPACIADO

Construir sistema basado en múltiplos de 4.

```txt
4
8
12
16
24
32
40
48
64
80
96
128
```

No utilizar valores aleatorios repetidamente.

---

# 40. DESIGN TOKENS

Centralizar:

```txt
--color-editorial-black
--color-investigation-red
--color-paper
--color-information-gray

--font-editorial
--font-interface

--space-*
--radius-*
--shadow-*
--border-*
```

Preferir CSS variables.

---

# 41. BORDES

La identidad debe utilizar principalmente:

* líneas;
* divisores;
* bloques;
* contraste.

No abusar de cards redondeadas.

Border-radius:

0–4 px normalmente.

8 px únicamente donde sea funcional.

Evitar estética SaaS de tarjetas flotantes redondeadas.

---

# 42. SOMBRAS

Prácticamente inexistentes.

Usar bordes, espacio y contraste para jerarquía.

Sombras solamente cuando sean necesarias para comunicar profundidad funcional.

---

# 43. ICONOGRAFÍA

Estilo:

* outline;
* 1.5 px;
* geométrico;
* sobrio.

Iconos funcionales provenientes de Lucide.

Cuando exista iconografía editorial propia, recrearla como SVG.

---

# 44. MOBILE FIRST

El producto debe ser excelente en teléfono.

No construir desktop primero y "encogerlo".

Prestar especial atención a:

* titulares;
* imágenes;
* artículo;
* navegación;
* share;
* video;
* documentos.

---

# 45. DARK MODE

No implementar dark mode global inicialmente.

Las investigaciones especiales pueden utilizar fondos negros como recurso editorial.

El artículo convencional debe permanecer principalmente sobre fondo Paper.

---

# 46. FOOTER

Debe incluir:

Marca

Secciones

Información

Participa

Newsletter

Redes

Políticas

Contacto

Correcciones

Quiénes somos

---

# 47. CONFIANZA EDITORIAL

Crear páginas permanentes:

```txt
/quienes-somos
/equipo
/principios-editoriales
/metodologia
/correcciones
/fuentes
/contacto
```

Un medio prestigioso debe explicar cómo trabaja.

---

# 48. CORRECCIONES

Los artículos deben permitir mostrar:

```txt
Corrección
Actualización
Nota del editor
```

con fecha.

Nunca modificar silenciosamente información material.

---

# 49. AUTORES

Cada periodista debe tener:

* fotografía;
* nombre;
* cargo;
* bio;
* expertise;
* redes profesionales;
* artículos;
* investigaciones.

Ruta:

`/autor/[slug]`

---

# 50. ANALYTICS

Preparar arquitectura para analytics respetuosa con privacidad.

Medir:

* artículos vistos;
* profundidad de scroll;
* lectura;
* búsquedas;
* newsletter;
* navegación;
* CTR interno.

No incorporar scripts de terceros indiscriminadamente.

---

# 51. SEGURIDAD

*(Simplificado 2026-08-18)*

Aplicar:

* CSP;
* secure headers;
* sanitización;
* validación server-side;
* rate limiting en endpoints públicos (búsqueda, denuncias);
* protección anti-abuso en formularios públicos (Turnstile);
* secretos únicamente server-side.

Nunca exponer al cliente:

```txt
DATABASE_URL
PAYLOAD_SECRET
MEILI_MASTER_KEY
S3_SECRET_KEY
```

## Control de acceso

Deny by default, en el backend. Tres roles (§23). La regla que decide todo:

> La interfaz puede ocultar. El backend debe negar.

Un botón oculto no es control de acceso. Toda regla se prueba contra la API,
no contra la pantalla.

## Lo que ya no está

Se retiran, por sobreingeniería para un medio digital:

* clasificación de documentos en tres niveles;
* grants de acceso por necesidad de conocer;
* URLs prefirmadas de vida corta;
* auditoría append-only de cada lectura;
* equipos de investigación como entidad de permisos.

Queda registro de las operaciones que importan —quién publicó, quién despublicó,
quién cambió un rol— porque eso es barato y responde la pregunta que de verdad
se hace después de un incidente. Lo demás era un threat model de agencia de
inteligencia aplicado a una redacción.

> Diseño anterior archivado en `docs/archive/prd-complex-v1/`.

---

# 52. ARQUITECTURA DEL PROYECTO

*(Actualizado 2026-08-18)*

## Despliegue: un solo stack

```txt
Coolify / docker-compose
├── app          Next.js + Payload CMS  (un proceso)
├── postgres     una base de datos
└── meilisearch  un índice derivado
```

Más S3/MinIO para media. Nada más.

Sin redes Docker aisladas por dominio, sin servicio de denuncias separado, sin
base de datos secundaria. Un medio digital que despliega tres contenedores puede
razonar sobre su propia infraestructura; uno que despliega nueve, no.

Sigue vigente lo que no es opcional:

* Postgres y Meilisearch **no se publican a internet**;
* migraciones explícitas, nunca push automático en producción;
* backups de Postgres y de media. Meilisearch es reconstruible con
  `pnpm search:reindex`, y por eso queda fuera del backup.

## Estructura del repositorio

```txt
src/
├── app/
│   ├── (frontend)/       páginas públicas
│   ├── (payload)/        admin de Payload
│   └── api/              route handlers
├── payload/
│   ├── collections/
│   ├── globals/
│   ├── fields/           campos reutilizables
│   ├── hooks/
│   ├── access/           helpers de control de acceso
│   ├── migrations/
│   └── scripts/          seed
├── components/
│   ├── articles/
│   ├── brand/
│   ├── editorial/        tipografía y bloques de texto enriquecido
│   ├── evidence/
│   ├── feedback/         estados de carga, error y vacío
│   ├── investigations/
│   ├── layout/
│   ├── media/
│   ├── navigation/
│   ├── search/
│   └── ui/
├── data/                 capa de acceso a datos — nadie más consulta Payload
├── lib/                  lógica pura y adaptadores
├── search/               índice Meilisearch
├── editorial/            reglas de estado editorial
└── styles/
```

## La regla que sostiene la estructura

**Ningún componente de presentación consulta Payload.** Las páginas piden datos
a `src/data/`; los componentes reciben props. Eso es lo que permite probar una
tarjeta con un objeto literal en vez de con una base de datos, y lo que mantiene
la frontera pública en un solo lugar.

---

# 53. TYPESCRIPT

No utilizar:

```ts
any
```

salvo justificación excepcional.

Usar tipos derivados del CMS cuando sea posible.

---

# 54. COMPONENTES

Mantener componentes pequeños y composables.

Evitar archivos de 800 líneas.

Separar:

contenido
presentación
interacción
data fetching.

---

# 55. SERVER VS CLIENT

Por defecto:

**Server Component.**

Convertir a Client Component solo cuando sea necesario para:

* interacción;
* state;
* browser APIs;
* forms interactivos.

No hidratar contenido editorial estático innecesariamente.

---

# 56. ESTADOS

Todas las interfaces deben contemplar:

* loading;
* empty;
* error;
* success;
* disabled;
* offline cuando tenga sentido.

---

# 57. RESPONSIVE

Validar al menos:

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

No crear layouts únicamente para 1440 px.

---

# 58. CALIDAD VISUAL

Antes de considerar una página terminada, comprobar:

* jerarquía;
* alineación;
* ritmo;
* whitespace;
* contraste;
* longitud de línea;
* tamaño de titulares;
* cropping de imágenes;
* mobile.

---

# 59. REGLA CRÍTICA

No interpretar "premium" como:

* más sombras;
* más animaciones;
* glassmorphism;
* gradients;
* efectos;
* blur;
* 3D.

**Premium aquí significa precisión.**

---

# 60. FASES DE IMPLEMENTACIÓN

## Fase 1 — Foundation

Construir:

* proyecto;
* tokens;
* tipografía;
* grid;
* layout;
* header;
* footer;
* primitives.

## Fase 2 — Editorial Components

Crear:

* cards;
* labels;
* article components;
* author;
* metadata;
* image;
* quote;
* documents.

## Fase 3 — Homepage

Construir homepage completa.

## Fase 4 — Article

Construir experiencia completa de lectura.

## Fase 5 — Investigations

Construir experiencia especial de investigaciones.

## Fase 6 — CMS

Conectar Payload (collections, globals, roles, access control).

## Fase 7 — Search / Newsletter / Forms

Implementar utilidades (Meilisearch, servicio de denuncias aislado).

## Fase 8 — SEO

Metadata + structured data + sitemap.

## Fase 9 — Performance

Auditoría y optimización.

## Fase 10 — QA

Responsive + accessibility + browsers.

---

# 61. NO HACER

No improvisar nuevas paletas.

No cambiar el logo.

No introducir tipografías adicionales.

No utilizar lorem ipsum en la interfaz final.

No generar noticias falsas presentadas como reales.

No llenar cada espacio disponible.

No utilizar componentes visuales estilo dashboard SaaS.

No construir una UI genérica de Tailwind.

No diseñar cada sección de manera independiente.

Todo debe parecer parte de **un único sistema editorial**.

---

# 62. CRITERIO DE ÉXITO

Al abrir la plataforma, un usuario debe pensar:

> "Este parece un medio serio."

Después:

> "Puedo entender rápidamente qué está pasando."

Y finalmente:

> "Confío en la manera en que esta información está presentada."

La interfaz nunca debe competir con el periodismo.

Debe darle autoridad.

---

# 63. INSTRUCCIÓN AL AGENTE

No intentes construir todo de una sola vez.

Primero:

1. inspecciona el repositorio;
2. identifica qué existe;
3. no destruyas funcionalidad válida;
4. crea un plan;
5. establece foundations;
6. construye componentes;
7. integra páginas;
8. conecta CMS;
9. prueba;
10. refina.

Después de cada fase:

* ejecutar build;
* ejecutar lint;
* revisar TypeScript;
* comprobar responsive;
* verificar accesibilidad básica.

No continúes acumulando errores.

---

# 64. ENTREGA ESPERADA

La implementación final debe sentirse como un **producto periodístico digital internacional creado específicamente para Clasificados Colombia**.

No como:

"una plantilla de periódico a la que posteriormente le colocaron el logo".

La identidad debe estar integrada en:

tipografía
espacio
jerarquía
fotografía
componentes
microinteracciones
navegación
contenido
SEO
arquitectura técnica.

**El diseño es el sistema. El periodismo es el protagonista.**
