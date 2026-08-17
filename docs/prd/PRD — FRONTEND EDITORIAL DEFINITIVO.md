# PRD — FRONTEND EDITORIAL DEFINITIVO
## Design System técnico · Componentes · Templates · Responsive · Estados
### Clasificados Colombia — Documento Nº 8

---

# 1. Objetivo

Construir el frontend editorial definitivo de **Clasificados Colombia** como un producto periodístico digital premium.

La interfaz debe sentirse:

- seria;
- internacional;
- contemporánea;
- editorial;
- rigurosa;
- sobria;
- distintiva.

Nunca debe sentirse como:

- template de periódico;
- blog genérico;
- dashboard SaaS;
- revista lifestyle;
- portal sensacionalista.

El contenido debe dominar.

---

# 2. Stack de frontend

Utilizar:

```txt
Next.js
App Router
React
TypeScript strict
Tailwind CSS 4
shadcn/ui solo como primitives
Base UI cuando aporte accesibilidad
Lucide para iconos funcionales
next/font
next/image
```

Payload se consume principalmente server-side.

---

# 3. Principio de diseño

## EDITORIAL FIRST

Cada componente debe responder:

```txt
¿Qué información prioriza?
¿Qué jerarquía comunica?
¿Qué contexto aporta?
¿Qué acción permite?
```

Si no responde ninguna de estas preguntas, probablemente sobra.

---

# 4. Regla de sofisticación

Premium significa:

```txt
precisión
tipografía
ritmo
espacio
proporción
fotografía
consistencia
```

No:

```txt
gradients
glassmorphism
3D
glow
shadows grandes
animaciones llamativas
```

---

# 5. Design Tokens

Centralizar tokens en CSS variables.

```css
:root {
  --color-ink: #0A0A0A;
  --color-paper: #F7F6F2;
  --color-white: #FFFFFF;

  --color-red: #D71920;

  --color-gray-900: #222222;
  --color-gray-700: #555555;
  --color-gray-500: #7A7A7A;
  --color-gray-300: #D5D5D5;
  --color-gray-200: #E5E5E5;
  --color-gray-100: #F0F0F0;
}
```

---

# 6. Color semantics

No usar colores por preferencia estética.

Definir roles:

```txt
ink
paper
surface
muted
border
accent
danger
breaking
focus
```

---

# 7. Red

`--color-red`

Debe significar:

```txt
breaking
investigation
alert
active editorial marker
critical CTA
```

No decoración.

---

# 8. Typography

Fuentes:

```txt
Display / Editorial:
Playfair Display

Interface / Body:
Source Sans 3
```

Cargar con `next/font`.

No llamadas externas a Google Fonts en runtime.

---

# 9. Font variables

```css
--font-editorial
--font-sans
```

Aplicar vía Tailwind/theme.

---

# 10. Typographic system

Crear utility/componentes:

```txt
Display
HeadlineXL
HeadlineLG
HeadlineMD
HeadlineSM
Dek
Lead
Body
BodySmall
Metadata
Eyebrow
Caption
Quote
```

No asignar tamaños de fuente arbitrarios componente por componente.

---

# 11. Fluid typography

Usar `clamp()`.

Ejemplo conceptual:

```css
font-size: clamp(2.8rem, 5vw, 5.5rem);
```

para grandes titulares.

---

# 12. Article body typography

Objetivo:

```txt
17–20 px
line-height 1.6–1.75
```

Desktop.

Nunca usar cuerpo demasiado pequeño para parecer “elegante”.

---

# 13. Measure

Texto editorial:

```txt
65–75 caracteres por línea
```

Objetivo aproximado.

Article body:

```txt
680–760px
```

---

# 14. Grid system

Desktop:

```txt
12 columns
```

Tablet:

```txt
8 columns
```

Mobile:

```txt
4 columns
```

---

# 15. Container

Max width general:

```txt
1440px
```

Pero no todas las secciones deben ocuparlo.

---

# 16. Layout widths

Definir:

```txt
container-wide
container-editorial
container-article
container-reading
```

Ejemplo:

```txt
wide       1440
editorial  1200
article     900
reading     720
```

---

# 17. Spacing system

Base:

```txt
4px
```

Escala:

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
160
```

No usar valores como:

```txt
37px
53px
71px
```

salvo razón real.

---

# 18. Borders

Usar principalmente:

```txt
1px
```

Bordes editoriales sobrios.

Color:

```txt
gray-200
gray-300
ink
red
```

según contexto.

---

# 19. Border radius

General:

```txt
0
2
4px
```

Functional controls:

hasta:

```txt
6–8px
```

No usar tarjetas con radius 20–32px como lenguaje base.

---

# 20. Shadows

Mínimas.

Preferir:

```txt
spacing
border
contrast
```

para separación.

---

# 21. Iconography

Lucide:

```txt
1.5px stroke
```

o equivalente consistente.

No mezclar estilos filled/outline arbitrariamente.

---

# 22. Project structure

```txt
src/
├── components/
│   ├── brand/
│   ├── layout/
│   ├── navigation/
│   ├── editorial/
│   ├── articles/
│   ├── investigations/
│   ├── evidence/
│   ├── media/
│   ├── search/
│   ├── forms/
│   ├── feedback/
│   └── ui/
```

---

# 23. UI primitives

Crear primitives propios:

```txt
Container
Stack
Cluster
Grid
Divider
VisuallyHidden
Section
SectionHeader
```

No repetir layout logic manualmente.

---

# 24. Brand components

```txt
Logo
LogoMark
Wordmark
BrandLockup
```

Variantes:

```txt
dark
light
compact
```

No usar PNG cuando exista SVG.

---

# 25. Header

Componente:

```txt
SiteHeader
```

Desktop debe contener:

```txt
Logo
PrimaryNav
Search
Breaking trigger/status
```

---

# 26. Header behavior

Estado inicial:

```txt
full
```

En scroll:

```txt
compact
```

sin animaciones exageradas.

---

# 27. Sticky Header

Sticky:

sí.

Pero no ocupar demasiado viewport móvil.

---

# 28. PrimaryNav

Items provenientes de Payload `Navigation`.

No hard-codear.

---

# 29. Active state

Usar:

```txt
underline
weight
small red marker
```

No pill gigante.

---

# 30. Mobile navigation

Componente:

```txt
MobileNav
```

Debe:

- abrir rápido;
- ser accesible;
- permitir teclado;
- bloquear scroll apropiadamente;
- cerrar con Escape.

---

# 31. Search trigger

No mostrar input gigante permanentemente en desktop.

Usar trigger discreto.

---

# 32. Search overlay

Componente:

```txt
SearchDialog
```

Puede incluir:

```txt
input
recent/featured
results
keyboard controls
```

---

# 33. BreakingNewsBar

Variantes:

```txt
breaking
alert
developing
confirmed
```

---

# 34. Breaking layout

Ejemplo:

```txt
ÚLTIMA HORA
Fiscalía abre investigación por contratos...
10:42
```

Rojo controlado.

---

# 35. Breaking rules

No ticker continuo.

No marquee.

No flashing.

---

# 36. Footer

Componente:

```txt
SiteFooter
```

Debe contener:

```txt
Brand
Sections
Information
Participate
Newsletter
Social
Policies
```

---

# 37. Homepage architecture

Homepage no es una colección uniforme de cards.

Debe tener:

```txt
dominant story
secondary stories
latest stream
investigations
analysis
data
video
opinion
newsletter
```

---

# 38. HomepageHero

Componente:

```txt
HomepageHero
```

Soporta:

```txt
Article
Investigation
DataStory
```

---

# 39. Hero desktop

Layout preferido:

```txt
7 columns image
5 columns content
```

o inverso según dirección editorial.

---

# 40. Hero image

Debe dominar cuando la fotografía lo merece.

No superponer texto sobre imagen por defecto.

---

# 41. Hero eyebrow

Ejemplo:

```txt
INVESTIGACIÓN
```

Sans.

Uppercase.

Tracking moderado.

---

# 42. Hero title

Serif editorial.

Debe ocupar visualmente el espacio principal.

---

# 43. Hero dek

Sans.

No tan largo como un párrafo.

---

# 44. Secondary stories

Componente:

```txt
SecondaryStoryGrid
```

No todas con mismo peso.

---

# 45. LatestNewsStream

Lista cronológica.

Componente:

```txt
LatestNewsList
```

---

# 46. Latest item

Debe incluir:

```txt
time
category
headline
```

Imagen opcional.

No obligatoria.

---

# 47. SectionHeader

Patrón:

```txt
INVESTIGACIONES
────────────────
Ver todas →
```

---

# 48. Article card family

Crear:

```txt
ArticleCard
ArticleCardCompact
ArticleCardHorizontal
ArticleCardFeatured
ArticleListItem
```

---

# 49. No mega-card

No crear un único:

```txt
<ArticleCard variant="...">
```

con 40 props y 15 branches.

Compartir subcomponentes.

---

# 50. Card anatomy

```txt
Media
Eyebrow
Title
Dek optional
Metadata
```

---

# 51. Card interaction

El title y media deben enlazar.

No envolver elementos interactivos secundarios dentro de otro link.

---

# 52. Card hover

Muy sutil:

```txt
headline underline
image slight scale max ~1.02
```

No desplazamiento completo de tarjeta.

---

# 53. InvestigationCard

Debe verse diferente sin romper sistema.

Puede utilizar:

```txt
red rule
strong category marker
darker typography
```

---

# 54. OpinionCard

Debe marcar explícitamente:

```txt
OPINIÓN
```

y autor prominentemente.

---

# 55. DataCard

Puede mostrar gran cifra.

Ejemplo:

```txt
68.000 M
```

con contexto.

---

# 56. VideoCard

Debe mostrar:

```txt
duration
play icon
```

sin overlay excesivo.

---

# 57. Article template

Componente/page template:

```txt
ArticlePage
```

Estructura:

```txt
Breadcrumbs
Eyebrow
Headline
Dek
Byline
PublicationMeta
Share
Hero
Caption
Body
Sources
Corrections
Related
```

---

# 58. Article header

No encerrar dentro de card.

Debe sentirse como portada editorial.

---

# 59. Headline width

No ocupar 1440px completos.

Limitar para favorecer lectura.

---

# 60. Byline

```txt
Por Nombre Apellido
Cargo
```

Avatar pequeño opcional.

---

# 61. Metadata

Mostrar:

```txt
Publicado
Actualizado
Tiempo de lectura
```

sin ruido.

---

# 62. Share

Componente:

```txt
ShareActions
```

Desktop:

puede ser lateral discreto.

Mobile:

inline/sticky ligero si no interfiere.

---

# 63. Article hero

Ratio según historia:

```txt
16:9
3:2
```

No forzar crop agresivo.

---

# 64. Caption

Siempre debajo.

Sans small.

Incluye crédito.

---

# 65. ArticleBody

Debe renderizar Payload rich text con componentes propios.

---

# 66. Paragraph rhythm

Separación suficiente.

No usar margin-bottom diferente arbitrariamente en cada bloque.

---

# 67. H2

Serif editorial o sans bold según jerarquía definida.

Mantener coherencia global.

---

# 68. H3

Menor que H2.

Evitar más de 4 niveles editoriales.

---

# 69. Links

Subrayados visibles.

No depender únicamente de color.

---

# 70. PullQuote

Componente:

```txt
PullQuote
```

Visual:

```txt
large serif
thin rule
optional attribution
```

---

# 71. FactBox

Componente:

```txt
FactBox
```

No usar tarjeta flotante estilo SaaS.

Puede ser:

```txt
paper/darker tint
border top/bottom
```

---

# 72. Callout

Para:

```txt
context
editor note
methodology
```

No para promociones.

---

# 73. SourceNote

Visual discreto.

No competir con texto.

---

# 74. CorrectionNotice

Debe ser claramente visible.

Componente:

```txt
CorrectionNotice
```

---

# 75. Related content

Final del artículo.

No insertar bloques “Te puede interesar” cada tres párrafos.

---

# 76. Investigation template

Componente/page:

```txt
InvestigationPage
```

Debe sentirse más inmersivo.

---

# 77. Investigation hero

Puede usar:

```txt
dark background
large image
editorial serif
red accent
```

sin caer en estética cinematográfica exagerada.

---

# 78. Investigation navigation

Si tiene capítulos:

```txt
InvestigationContents
```

Sticky en desktop cuando aporte.

---

# 79. KeyFindings

Componente:

```txt
KeyFindings
```

Puede mostrar:

```txt
number
finding
source reference
```

---

# 80. Timeline

Componente:

```txt
EditorialTimeline
```

Vertical desktop/mobile.

No convertir en gráfico decorativo complejo.

---

# 81. People / Organizations

Componente:

```txt
EntityList
```

Debe contextualizar.

No presentar asociación como culpabilidad.

---

# 82. Methodology

Sección clara:

```txt
Cómo investigamos
```

---

# 83. EvidenceSection

Muestra solo evidencia pública aprobada.

---

# 84. EvidenceCard

Campos:

```txt
type
title
institution
date
description
pages
```

---

# 85. Evidence Viewer

Componente:

```txt
PublicEvidenceViewer
```

Para documentos públicos.

No reutilizar este componente para restricted.

---

# 86. Public document access

La UI obtiene URL pública/controlada desde endpoint seguro.

No object key directo.

---

# 87. Document CTA

Ejemplo:

```txt
Ver documento
Descargar copia
```

---

# 88. Restricted UI

Restricted evidence jamás debe aparecer accidentalmente en frontend público.

No renderizar placeholders como:

```txt
Documento restringido
```

si eso revela su existencia innecesariamente.

---

# 89. Author page

Template:

```txt
AuthorPage
```

Estructura:

```txt
Portrait
Name
Role
Bio
Expertise
Recent Articles
Investigations
```

---

# 90. Category page

Template:

```txt
CategoryPage
```

Debe tener:

```txt
category intro
featured story
latest
subsections
```

No simple listado plano.

---

# 91. Topic page

Similar a Category pero más contextual.

Puede incluir:

```txt
related people
organizations
investigations
```

---

# 92. Search page

Ruta:

```txt
/buscar
```

---

# 93. Search result

Componente:

```txt
SearchResultItem
```

Debe mostrar:

```txt
category
title
dek
date
```

Imagen opcional.

---

# 94. Search filters

Solo útiles:

```txt
content type
category
date
```

No llenar con filtros innecesarios.

---

# 95. Search empty state

Mostrar:

```txt
No encontramos resultados para “...”
```

más sugerencias.

---

# 96. Search loading

Usar skeleton minimalista.

No spinner grande centrado por defecto.

---

# 97. Newsletter

Componente:

```txt
NewsletterSignup
```

Sobrio.

No popup inmediato al entrar.

---

# 98. Forms

Inputs:

- altura suficiente;
- labels siempre visibles;
- error claro;
- focus fuerte.

---

# 99. Button system

Variantes limitadas:

```txt
primary
secondary
text
danger
```

No 14 variantes.

---

# 100. Primary button

Negro o rojo según semántica.

No usar rojo para toda acción.

---

# 101. Link button

Para acciones editoriales leves:

```txt
Ver todas →
Leer más →
```

---

# 102. Accessibility

WCAG 2.2 AA.

Obligatorio.

---

# 103. Focus

Focus visible consistente.

Nunca:

```css
outline: none
```

sin reemplazo.

---

# 104. Skip link

Agregar:

```txt
Saltar al contenido
```

---

# 105. Semantic landmarks

Usar:

```txt
header
nav
main
article
aside
footer
```

correctamente.

---

# 106. Heading hierarchy

Una página:

```txt
H1 principal
```

Luego:

```txt
H2
H3
```

No usar headings solo por estilo.

---

# 107. Reduced motion

Respetar:

```txt
prefers-reduced-motion
```

---

# 108. Contrast

Cumplir AA.

Especial atención a:

```txt
gray text
red on paper
metadata
```

---

# 109. Images

Todo `img` editorial:

```txt
alt
width
height
```

o ratio reservado.

---

# 110. Decorative images

Usar:

```txt
alt=""
```

cuando sea realmente decorativa.

---

# 111. Responsive breakpoints

Validar:

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

# 112. Mobile philosophy

No diseñar desktop y apilar todo.

Rediseñar jerarquía.

---

# 113. Mobile headline

Debe seguir siendo dominante.

No reducirlo excesivamente.

---

# 114. Mobile cards

No obligar siempre:

```txt
image above text
```

Compact lists pueden ser mejores.

---

# 115. Mobile nav

Objetivos táctiles:

```txt
>= 44px
```

cuando corresponda.

---

# 116. Tablet

No tratar tablet como desktop pequeño.

Revisar especialmente:

```txt
homepage
article
investigation
navigation
```

---

# 117. Wide screens

No estirar texto.

Aumentar whitespace, no line length.

---

# 118. Loading states

Definir:

```txt
PageSkeleton
CardSkeleton
SearchSkeleton
```

---

# 119. Error states

Crear:

```txt
InlineError
PageError
RetryState
```

---

# 120. Empty states

Usar lenguaje editorial.

No mensajes de sistema genéricos.

---

# 121. 404

Debe mantener branding.

Incluye:

```txt
search
homepage CTA
latest content
```

---

# 122. 500

Mensaje sobrio.

No mostrar stack.

---

# 123. Offline

No obligación de PWA completa.

Pero manejar errores de red claramente cuando existan interacciones.

---

# 124. Server Components

Por defecto.

Especialmente:

```txt
articles
homepage
category
author
investigation
```

---

# 125. Client Components

Solo:

```txt
search interaction
menu
dialogs
form state
interactive media
```

---

# 126. No hydration excess

No convertir una card editorial estática en Client Component.

---

# 127. Data fetching

Payload Local API server-side cuando sea apropiado.

No llamar REST interno desde Server Component sin necesidad.

---

# 128. Query layer

Crear:

```txt
src/data/
```

o equivalente.

Funciones:

```txt
getHomepage()
getArticleBySlug()
getInvestigationBySlug()
getCategoryPage()
getAuthorPage()
```

---

# 129. UI does not query DB

Componentes visuales reciben props.

No mezclar directamente Payload query logic dentro de cada presentational component.

---

# 130. DTOs

Crear modelos:

```txt
ArticleCardData
HomepageHeroData
ArticleHeaderData
InvestigationSummaryData
```

---

# 131. Image component

Crear wrapper:

```txt
EditorialImage
```

Responsable de:

```txt
sizes
quality
ratio
caption hooks
```

---

# 132. Image sizes

Definir correctamente:

```txt
sizes
```

No dejar `100vw` para imágenes pequeñas.

---

# 133. LCP

Homepage hero:

puede usar priority.

No marcar 12 imágenes como priority.

---

# 134. Performance budgets

Objetivo:

```txt
LCP < 2.5s
INP < 200ms
CLS < 0.1
```

---

# 135. JS budget

Minimizar JavaScript inicial.

No añadir librería de animación global si CSS resuelve el problema.

---

# 136. Motion

Duraciones:

```txt
120–250ms
```

para UI general.

---

# 137. Motion allowed

```txt
underline
opacity
small translate
image subtle zoom
drawer transitions
```

---

# 138. Motion forbidden

```txt
scroll hijacking
3D news cards
parallax heavy
animated cursors
floating particles
```

---

# 139. View transitions

Evaluar solo si mejoran navegación.

No requisito.

---

# 140. Dark surfaces

Usar principalmente en:

```txt
investigations
footer
special editorial blocks
```

No dark mode global v1.

---

# 141. Redacted language

Utilizar barras de redacción de manera controlada.

Component:

```txt
RedactedAccent
```

Solo para:

```txt
investigations
special section title
document reveal
```

---

# 142. No gimmick

No convertir cada heading en barra censurada.

---

# 143. Homepage composition rules

Máximo una historia visual dominante por viewport inicial.

No competir con 6 titulares grandes.

---

# 144. Density

Desktop puede ser denso.

Pero:

```txt
dense ≠ cramped
```

Separadores y spacing deben ordenar.

---

# 145. Editorial hierarchy

Nivel 1:

```txt
Lead story
```

Nivel 2:

```txt
Secondary
```

Nivel 3:

```txt
Latest/List
```

No igualar visualmente todo.

---

# 146. Photography

Tratamiento:

```txt
natural
documentary
high context
controlled contrast
```

---

# 147. Cropping

No cortar rostros o información importante por estética.

Usar hotspot/editorial crop metadata.

---

# 148. Image overlays

Evitar degradados oscuros sobre fotos salvo cuando un template específico lo requiera.

---

# 149. Captions

Deben funcionar también en mobile.

---

# 150. Embedded video

Lazy load.

Poster visible.

No cargar player pesado antes de interacción si no es hero.

---

# 151. Social embeds

Lazy load / user consent si procede.

Evitar degradar performance.

---

# 152. Tables

Editorial tables deben ser responsive.

Mobile:

horizontal scroll con affordance claro.

---

# 153. Data charts

Usar componentes accesibles.

Siempre proporcionar:

```txt
title
source
textual summary
```

---

# 154. Ads

No diseñar sistema publicitario v1 salvo requerimiento.

Si llega después:

definir slots explícitos.

No insertar banners arbitrariamente.

---

# 155. Editorial integrity

Ads futuros nunca deben confundirse con:

```txt
article
analysis
investigation
```

---

# 156. Component documentation

Crear documentación interna:

```txt
/docs/design-system/
```

---

# 157. Storybook

Opcional pero recomendado si el equipo crece.

No obligatorio para v1.

---

# 158. Visual test pages

Crear route/dev page:

```txt
/dev/design-system
```

solo en development.

Mostrar todos los componentes y estados.

---

# 159. Component states

Cada componente importante debe probar:

```txt
default
long title
short title
missing image
loading
error
mobile
```

---

# 160. Long headline test

Titular de prueba:

```txt
120–160 caracteres
```

para detectar overflow.

---

# 161. Real content test

No validar layout solo con:

```txt
Lorem ipsum
```

Usar contenido demo editorial realista claramente ficticio.

---

# 162. Accessibility testing

Automatizar:

```txt
axe
```

o equivalente en tests.

---

# 163. Keyboard QA

Verificar:

```txt
navigation
search
menu
dialogs
forms
```

sin mouse.

---

# 164. Screen reader QA

Revisar al menos:

```txt
article
menu
search
evidence viewer
```

---

# 165. Visual regression

Si infraestructura lo permite:

capturas de:

```txt
homepage
article
investigation
category
mobile
```

---

# 166. Browser support

Últimas versiones estables de:

```txt
Chrome
Safari
Firefox
Edge
```

y Safari iOS actual razonable.

---

# 167. SEO frontend

Cada template debe exponer correctamente:

```txt
metadata
canonical
JSON-LD
breadcrumbs
semantic HTML
```

según PRD SEO.

---

# 168. Article structured data

Frontend recibe modelo ya limpio.

No leer campos privados de Payload.

---

# 169. Noindex preview

Preview debe emitir:

```txt
noindex
```

siempre.

---

# 170. Security boundary

Frontend público no debe recibir:

```txt
reviewNotes
legalStatus internal details
access grants
object keys restricted
audit
user security fields
```

---

# 171. API response shaping

Nunca devolver documento Payload completo al cliente por comodidad.

---

# 172. Public projection

Crear funciones:

```txt
toPublicArticle()
toPublicInvestigation()
toPublicEvidence()
```

---

# 173. Cache strategy

Contenido público:

cache/revalidate según PRD infraestructura.

Preview:

no public cache.

---

# 174. Breaking data

BreakingNews puede tener revalidación más frecuente.

No hacer polling cada 2 segundos.

---

# 175. Search autocomplete

Debounce.

No request por cada tecla inmediata.

---

# 176. Client state

No introducir Redux global por defecto.

Usar:

```txt
React state
URL state
server state
```

según caso.

---

# 177. URL state

Filtros/search:

representar en URL cuando tenga sentido.

---

# 178. Component naming

Usar nombres semánticos:

```txt
InvestigationHero
ArticleMeta
EvidenceCard
```

No:

```txt
BigCard2
RedBox
Layout3
```

---

# 179. CSS

Preferir Tailwind utilities + tokens.

No generar cientos de clases ad hoc.

---

# 180. Arbitrary values

Permitidos con moderación.

No:

```txt
mt-[37px]
w-[913px]
```

repetidamente.

---

# 181. Design token enforcement

Si un valor se repite:

convertirlo en token.

---

# 182. Responsive classes

Evitar combinaciones inmanejables.

Extraer componentes/utilities cuando la clase sea demasiado compleja.

---

# 183. Conditional class utility

Utilizar:

```txt
cn()
```

para composición.

---

# 184. Variants

Puede utilizarse CVA para primitives si realmente simplifica.

No sobrearquitectar componentes editoriales.

---

# 185. Testing

Unit:

```txt
formatters
DTO mappers
utilities
```

Integration:

```txt
templates
navigation
search
```

E2E:

```txt
homepage
article
menu
search
```

---

# 186. Critical E2E flow

```txt
Open homepage
→ open article
→ author
→ category
→ search
```

---

# 187. Preview E2E

Authenticated:

```txt
draft article
→ preview
→ noindex
```

---

# 188. Evidence E2E

Public evidence:

```txt
open document
```

Restricted:

```txt
never accessible from public frontend
```

---

# 189. Build quality gate

Antes de deploy:

```txt
lint
typecheck
tests
build
```

---

# 190. Lighthouse

Usar como señal.

No optimizar únicamente para puntuación.

---

# 191. Initial pages required

MVP editorial debe incluir:

```txt
/
article
investigation
category
topic
author
search
about
editorial principles
corrections
contact
```

---

# 192. Phase 1

Foundation:

```txt
tokens
fonts
grid
layout
header
footer
primitives
```

---

# 193. Phase 2

Editorial components:

```txt
cards
metadata
images
section headers
lists
```

---

# 194. Phase 3

Homepage.

---

# 195. Phase 4

Article reading experience.

---

# 196. Phase 5

Investigations.

---

# 197. Phase 6

Categories/topics/authors/search.

---

# 198. Phase 7

Accessibility/performance refinement.

---

# 199. Phase 8

Visual polish.

Polish happens after system correctness.

---

# 200. Definition of Done

El frontend estará listo cuando:

1. todas las páginas usan el mismo Design System;
2. la homepage tiene jerarquía real;
3. article body ofrece lectura excelente;
4. investigación tiene identidad propia sin romper marca;
5. mobile está diseñado, no solo adaptado;
6. el frontend es accesible;
7. Server Components son default;
8. no hay JS cliente innecesario;
9. imágenes tienen tamaños responsive correctos;
10. estados loading/error/empty existen;
11. no se filtran datos internos;
12. metadata/structured data funcionan;
13. search utiliza Meilisearch sin acoplar el contenido;
14. evidence pública funciona mediante una capa segura;
15. restricted evidence nunca aparece en frontend;
16. Core Web Vitals se mantienen dentro de objetivos razonables;
17. los componentes pueden reutilizarse sin duplicar diseño;
18. el sitio se reconoce como Clasificados Colombia incluso si el logo no aparece en una captura.

---

# 201. Principio final

La interfaz debe conseguir que:

```txt
la noticia importante parezca importante,
la investigación parezca rigurosa,
la opinión parezca opinión,
la evidencia parezca evidencia,
y la lectura sea siempre el centro.
```

**No diseñes una web de noticias.  
Diseña el sistema editorial digital de Clasificados Colombia.**