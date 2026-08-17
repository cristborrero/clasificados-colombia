# PRD MASTER — CLASIFICADOS COLOMBIA

## Plataforma Editorial Digital · Rebranding 2026

> **Nota de versión:** este documento es una actualización del PRD Master original. Se mantiene idéntico en todo lo relativo a marca, identidad visual, UX, componentes, SEO, accesibilidad y experiencia de lectura. Los únicos cambios están en las secciones 8, 23, 27 y 52, donde se reemplaza Sanity CMS por **Payload CMS self-hosted** como motor editorial, según lo definido en el PRD de Arquitectura CMS v2.

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
* MinIO (S3-compatible, self-hosted) para documentos de evidencia clasificados
* Server Components por defecto
* Server Actions cuando correspondan
* Route Handlers únicamente cuando sean necesarios
* Zod para validaciones
* Lucide para iconos funcionales

Infraestructura: Contabo (VPS) + Coolify (self-hosted PaaS).

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

Crear componente:

`EvidenceDocument`

Mostrar:

* nombre;
* institución;
* fecha;
* tipo;
* páginas;
* archivo;
* contexto;
* descargar;
* abrir.

También:

`DocumentViewer`

No ocultar documentos probatorios al final del artículo.

La evidencia forma parte de la narrativa.

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

Crear `/denunciar`.

Debe inspirar seguridad.

Explicar claramente:

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

No almacenar secretos ni fuentes sensibles sin definir previamente una arquitectura de seguridad apropiada.

---

# 23. CMS — PAYLOAD (self-hosted)

*(Actualizado — reemplaza la sección original "CMS — SANITY")*

El detalle completo de collections, globals, roles, workflow editorial y estrategia de seguridad de documentos vive en el **PRD de Arquitectura CMS v2 (Payload)**. Este PRD Master solo referencia el inventario de alto nivel:

```txt
articles
investigations
authors
categories
topics
sources
evidenceDocuments
organizations
people
timelineEvents
videoStories
dataStories
opinions
breakingNews
corrections
users

homepage        (global)
navigation       (global)
siteSettings     (global)
```

Ver el PRD de Arquitectura CMS v2 para campos, workflow (`Draft → Editing → Fact Check → Legal Review → Approved → Scheduled → Published → Archived`), roles y control de acceso.

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

Estados:

```txt
Draft
Review
Fact Check
Legal Review
Scheduled
Published
Updated
Archived
```

Cuando sea posible, modelarlos mediante metadata editorial.

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

Aplicar:

* CSP;
* secure headers;
* sanitización;
* validación server-side;
* rate limiting donde corresponda;
* protección de forms;
* secretos únicamente server-side.

Nunca exponer:

```txt
DATABASE_URL
API_KEYS
PRIVATE_KEYS
MINIO_SECRET_KEY
```

al cliente.

---

# 52. ARQUITECTURA DEL PROYECTO

*(Actualizado)*

Propuesta:

```txt
src/
├── app/
├── collections/
│   ├── articles/
│   ├── investigations/
│   ├── authors/
│   ├── categories/
│   ├── topics/
│   ├── sources/
│   ├── evidenceDocuments/
│   ├── organizations/
│   ├── people/
│   ├── timelineEvents/
│   ├── breakingNews/
│   ├── corrections/
│   └── users/
├── globals/
│   ├── homepage/
│   ├── navigation/
│   └── siteSettings/
├── access/
├── hooks/
├── components/
│   ├── article/
│   ├── breaking/
│   ├── cards/
│   ├── data/
│   ├── documents/
│   ├── editorial/
│   ├── forms/
│   ├── investigation/
│   ├── layout/
│   ├── media/
│   └── ui/
├── lib/
│   └── queries/
├── styles/
├── types/
└── utils/
```

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
