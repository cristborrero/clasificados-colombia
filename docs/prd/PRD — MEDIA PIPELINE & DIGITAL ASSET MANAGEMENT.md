# PRD — MEDIA PIPELINE & DIGITAL ASSET MANAGEMENT
## Imágenes · Video · Créditos · Licencias · Derivados · OG
### Clasificados Colombia — Documento Nº 10

---

# 1. Objetivo

Construir un sistema profesional para gestionar todos los activos multimedia públicos de **Clasificados Colombia**.

El sistema debe cubrir:

- fotografías;
- imágenes editoriales;
- video;
- audio;
- posters;
- thumbnails;
- imágenes Open Graph;
- logos;
- ilustraciones;
- gráficos;
- assets institucionales.

Debe garantizar:

```txt
calidad
consistencia
rendimiento
trazabilidad
créditos
derechos de uso
accesibilidad
```

---

# 2. Principio crítico

Media editorial y Evidence Vault son sistemas diferentes.

Nunca mezclar:

```txt
Media pública
≠
Evidence
```

Media puede distribuirse públicamente.

Evidence puede ser:

```txt
public
internal
restricted
```

y conserva políticas de seguridad independientes.

---

# 3. Arquitectura

Flujo editorial:

```txt
Editor
↓
Payload Media Collection
↓
Storage público/controlado
↓
Image processing
↓
Derivados
↓
Next.js frontend
```

Evidence:

```txt
MinIO Evidence Vault
```

fuera de este pipeline.

---

# 4. MEDIA COLLECTION

Crear Collection:

```txt
media
```

con Upload habilitado.

Campos:

```txt
alt
caption
credit
source
license
copyrightHolder
usageNotes

mediaType

photographer
location
capturedAt

rightsExpiration

editorialStatus
```

---

# 5. MEDIA TYPE

Valores:

```txt
photo
illustration
graphic
logo
screenshot
document_preview
video_poster
other
```

---

# 6. ALT TEXT

Campo:

```txt
alt
```

Debe describir lo visualmente relevante.

Ejemplo correcto:

```txt
Manifestantes frente al Congreso de Colombia durante la sesión del 17 de agosto.
```

Incorrecto:

```txt
foto noticia
imagen congreso
clasificados colombia
```

---

# 7. ALT OBLIGATORIO

Para imágenes editoriales:

```txt
required
```

salvo imágenes puramente decorativas.

---

# 8. DECORATIVE IMAGE

Debe marcarse explícitamente:

```txt
decorative = true
```

y frontend usa:

```txt
alt=""
```

No dejar el alt vacío por descuido.

---

# 9. CAPTION

Debe explicar contexto adicional.

No repetir exactamente el alt.

---

# 10. CREDIT

Campo obligatorio cuando corresponde.

Ejemplo:

```txt
Foto: Juan Pérez / Clasificados Colombia
```

o:

```txt
Cortesía: Fiscalía General
```

---

# 11. SOURCE

Guardar origen.

Ejemplos:

```txt
Clasificados Colombia
Reuters
AP
Cortesía
Entidad pública
User submitted
```

---

# 12. LICENSE

Valores posibles:

```txt
owned
licensed
creative_commons
public_domain
courtesy
editorial_use
unknown
```

`unknown` no debe ser estado aceptable para publicación final si existen dudas de derechos.

---

# 13. RIGHTS EXPIRATION

Permitir:

```txt
rightsExpiration
```

cuando una licencia tenga duración limitada.

---

# 14. RIGHTS WARNING

Payload debe mostrar warning cuando:

```txt
rightsExpiration < today
```

o próxima a vencer.

---

# 15. COPYRIGHT HOLDER

Guardar entidad/persona titular.

No confundir con fotógrafo.

---

# 16. USAGE NOTES

Campo interno:

```txt
usageNotes
```

Ejemplo:

```txt
Solo digital.
No usar en campañas pagadas.
```

No público.

---

# 17. ORIGINAL FILE

Conservar original.

No sobrescribirlo tras crop o resize.

---

# 18. DERIVATIVES

Generar versiones derivadas.

Inicialmente:

```txt
thumbnail
card
article
hero
og
square
portrait
```

---

# 19. THUMBNAIL

Ejemplo:

```txt
320 × 180
```

o proporción equivalente.

Uso:

```txt
admin
search
compact cards
```

---

# 20. CARD

Referencia:

```txt
640–900 px
```

según layout.

---

# 21. ARTICLE

Referencia:

```txt
1200–1600 px
```

---

# 22. HERO

Referencia:

```txt
1800–2400 px
```

según calidad del original.

---

# 23. OG

Formato:

```txt
1200 × 630
```

---

# 24. SQUARE

Formato:

```txt
1:1
```

para redes y componentes puntuales.

---

# 25. PORTRAIT

Formato:

```txt
4:5
```

o:

```txt
9:16
```

según uso social.

---

# 26. NO OVERGENERATION

No generar 40 tamaños automáticamente.

Cada derivado debe tener un uso real.

---

# 27. IMAGE FORMAT

Preferir formatos modernos:

```txt
AVIF
WebP
```

cuando el pipeline lo soporte.

Mantener fallback adecuado.

---

# 28. ORIGINAL FORMAT

Preservar original.

Ejemplo:

```txt
JPEG original
→ WebP derivatives
→ AVIF derivatives
```

---

# 29. QUALITY

No definir calidad única para todo.

Ejemplo orientativo:

```txt
AVIF 50–65
WebP 70–80
JPEG 80–85
```

Ajustar visualmente.

---

# 30. COLOR PROFILE

Normalizar imágenes web a:

```txt
sRGB
```

para consistencia.

---

# 31. EXIF

Eliminar EXIF innecesario en derivados públicos.

Puede contener:

- ubicación;
- dispositivo;
- metadata personal.

---

# 32. ORIGINAL EXIF

Si es relevante editorialmente:

puede conservarse internamente en original.

No exponer automáticamente.

---

# 33. GPS METADATA

No publicar coordenadas EXIF automáticamente.

Especialmente peligroso en:

- fuentes;
- hogares;
- víctimas;
- menores;
- periodistas.

---

# 34. IMAGE HOTSPOT

Permitir punto focal.

Ejemplo:

```txt
hotspot:
  x
  y
```

Payload debe permitir editor seleccionar foco.

---

# 35. CROP

Guardar crop por uso cuando sea necesario.

No destruir original.

---

# 36. CROP MODES

Ejemplos:

```txt
hero
card
portrait
social
```

---

# 37. SMART CROP

No depender totalmente de crop automático.

Las fotografías periodísticas necesitan criterio humano.

---

# 38. FACE CROPPING

No usar detección automática como autoridad final.

Puede cortar contexto o introducir sesgo.

---

# 39. EDITORIAL CROP RULE

Nunca cortar:

- evidencia visual importante;
- texto relevante;
- contexto fundamental;
- personas de manera engañosa.

---

# 40. IMAGE MANIPULATION POLICY

Prohibido alterar de forma que cambie el significado factual de una fotografía.

Permitido:

```txt
crop
exposure correction
white balance
minor contrast
resize
compression
```

---

# 41. AI IMAGE POLICY

Si se utilizan imágenes generadas o manipuladas por AI:

deben identificarse internamente.

Crear campo:

```txt
syntheticMedia
```

---

# 42. SYNTHETIC MEDIA VALUES

```txt
none
ai_generated
ai_modified
composite
illustration
```

---

# 43. AI DISCLOSURE

Cuando la naturaleza sintética sea material para el usuario:

mostrar disclosure.

No presentar una imagen generada como fotografía documental real.

---

# 44. EDITORIAL IMAGE STATUS

```txt
draft
approved
restricted_use
expired
archived
```

---

# 45. APPROVAL

Media usada como hero debe estar:

```txt
approved
```

---

# 46. RESTRICTED USE

Ejemplo:

```txt
Uso únicamente en investigación X
```

Payload debe impedir selección genérica si no corresponde.

---

# 47. MEDIA ACCESS

Public read:

solo derivados aprobados y públicos.

No exponer fields internos:

```txt
usageNotes
rightsNotes
internal identifiers
```

---

# 48. MEDIA UPLOAD ACCESS

Roles:

```txt
photo_editor
reporter
editor
editor_in_chief
```

Contributor:

opcional/restringido.

---

# 49. MEDIA DELETE

Restrictivo.

Si asset está usado en contenido publicado:

bloquear hard delete.

---

# 50. MEDIA REFERENCES

Antes de borrar:

comprobar relaciones.

Ejemplo:

```txt
Article hero
Article body
Investigation
Author portrait
Homepage
```

---

# 51. ARCHIVE

Preferir:

```txt
archived = true
```

sobre delete.

---

# 52. FILE NAMING

Storage key:

```txt
UUID
```

o nombre estable generado.

No confiar en filename original.

---

# 53. ORIGINAL FILENAME

Puede guardarse como metadata interna.

---

# 54. URL STRATEGY

URLs públicas de media deben ser:

- estables;
- cacheables;
- sin secrets;
- sin presigned URLs para contenido público.

---

# 55. CDN

Aunque inicialmente corra en servidor propio:

diseñar para poner CDN delante posteriormente.

Ejemplo:

```txt
media.clasificadoscolombia.com
```

---

# 56. MEDIA DOMAIN

Recomendación:

```txt
media.clasificadoscolombia.com
```

o path controlado.

No obligatorio en v1.

---

# 57. CACHE CONTROL

Derivados versionados:

```txt
Cache-Control: public, max-age=31536000, immutable
```

cuando URL cambie al cambiar contenido.

---

# 58. ORIGINAL CACHE

Puede requerir política distinta.

---

# 59. NEXT/IMAGE

Usar:

```txt
next/image
```

para imágenes editoriales.

---

# 60. RESPONSIVE IMAGES

Siempre definir:

```txt
sizes
```

correctamente.

---

# 61. HERO SIZES

Ejemplo conceptual:

```txt
(max-width: 768px) 100vw,
(max-width: 1440px) 70vw,
1000px
```

---

# 62. CARD SIZES

No descargar hero de 2400 px para card de 350 px.

---

# 63. LCP IMAGE

Hero principal puede usar:

```txt
priority
```

No usar priority masivamente.

---

# 64. PRELOAD

Solo imagen LCP real.

---

# 65. LAZY LOADING

Resto:

lazy.

---

# 66. BLUR PLACEHOLDER

Puede utilizarse.

No requisito.

Debe evitar peso/complexidad excesiva.

---

# 67. DOMINANT COLOR

Opcional:

guardar color dominante para placeholder.

No usarlo como color editorial.

---

# 68. BROKEN IMAGE

Crear fallback controlado.

No mostrar ícono roto del navegador.

---

# 69. MISSING IMAGE

Articles sin imagen deben tener layout válido.

No utilizar placeholder genérico de stock.

---

# 70. NO FAKE PHOTOGRAPHY

Si no hay fotografía:

mejor layout tipográfico que inventar imagen.

---

# 71. PHOTOGRAPHY STYLE

Sistema visual:

```txt
documental
humano
contextual
natural
sobrio
```

---

# 72. AVOID

Evitar:

```txt
saturación excesiva
HDR artificial
AI-looking skin
dramatic cinematic grades
```

en fotografía noticiosa.

---

# 73. IMAGE CREDIBILITY

Fotografía debe comunicar:

```txt
esto ocurrió
```

no:

```txt
esto fue diseñado para engagement
```

---

# 74. GRAPHICS

Infografías propias deben almacenarse como media.

Campos adicionales opcionales:

```txt
designer
dataSource
methodologyReference
```

---

# 75. SCREENSHOTS

Marcar:

```txt
mediaType = screenshot
```

Guardar source URL/context cuando proceda.

---

# 76. SCREENSHOT INTEGRITY

No recortar de forma que cambie sentido.

Contextualizar en caption.

---

# 77. VIDEO ARCHITECTURE

No almacenar grandes videos directamente en Postgres.

Usar storage de objetos.

Puede ser:

- storage público separado;
- proveedor externo;
- MinIO bucket de media pública.

---

# 78. VIDEO COLLECTION

Puede existir:

```txt
videos
```

o Media con tipo video.

Si workflow crece:

preferir Collection independiente.

---

# 79. VIDEO FIELDS

```txt
title
description
duration

sourceFile
streamURL

poster
captions
transcript

credit
license

publishedAt
```

---

# 80. TRANSCODING

No servir video original pesado directamente.

Generar formatos adecuados.

---

# 81. HLS

Si el volumen justifica streaming propio:

evaluar HLS.

No obligatorio para v1.

---

# 82. VIDEO PROCESSING

Worker asíncrono:

```txt
upload
↓
transcode
↓
poster
↓
metadata
↓
ready
```

---

# 83. FFMPEG

Puede usarse como worker.

No ejecutar tareas pesadas dentro del request web.

---

# 84. VIDEO POSTER

Generar automáticamente, pero permitir override editorial.

---

# 85. VIDEO CAPTIONS

Soportar:

```txt
WebVTT
```

---

# 86. TRANSCRIPT

Guardar transcript en Payload.

Debe ser editable.

---

# 87. TRANSCRIPT AI

AI puede producir borrador.

Pero debe poder revisarse.

No asumir transcripción automática perfecta.

---

# 88. AUDIO

Arquitectura similar.

Campos:

```txt
audioFile
duration
transcript
credit
```

---

# 89. AUDIO PLAYER

Accesible.

No autoplay.

---

# 90. AUTOPLAY

Prohibido por defecto:

```txt
audio
video with sound
```

---

# 91. VIDEO AUTOPLAY

Solo eventualmente:

```txt
muted
playsInline
```

para elementos decorativos claramente justificados.

No videos periodísticos principales.

---

# 92. SOCIAL ASSETS

Crear templates automáticos para:

```txt
Open Graph
X
Facebook
WhatsApp previews
```

---

# 93. OG IMAGE

Por defecto:

```txt
hero image
+
category
+
headline
+
brand
```

---

# 94. OG FALLBACK

Si article no tiene hero:

usar layout tipográfico branded.

---

# 95. OG GENERATION

Puede realizarse con:

```txt
next/og
ImageResponse
```

o pipeline equivalente.

---

# 96. OG MUST NOT BLOCK PUBLISH

Si generación OG falla:

usar fallback.

No impedir publicación.

---

# 97. OG CACHE

Cachear por contenido/version.

---

# 98. SOCIAL TITLE

Puede usar:

```txt
seo.ogTitle
```

pero no alterar materialmente significado.

---

# 99. BRAND WATERMARK

Fotografías editoriales no deben llevar watermark gigante por defecto.

Si se usa:

pequeño y discreto.

---

# 100. SOCIAL WATERMARK

En piezas para redes sí puede existir firma de marca más visible.

Separar:

```txt
article image
social creative
```

---

# 101. AUTHOR PORTRAITS

Reglas:

```txt
neutral background
consistent crop
high quality
natural
```

---

# 102. AUTHOR PORTRAIT SIZE

Generar:

```txt
avatar
profile
```

---

# 103. LOGOS

Collection/mediaType:

```txt
logo
```

No aplicar compresión destructiva.

Preferir SVG.

---

# 104. SVG

Aceptar únicamente SVG confiable.

SVG puede contener scripts/elementos peligrosos.

No permitir upload de SVG arbitrario desde usuarios no confiables.

---

# 105. SVG SANITIZATION

Si se acepta SVG:

sanitizar.

O restringir upload a roles administrativos.

---

# 106. FILE UPLOAD VALIDATION

Validar:

```txt
extension
MIME
magic bytes
size
```

según tipo.

---

# 107. FILE SIZE LIMIT

Ejemplo:

```txt
photo original: 25 MB
graphic: 15 MB
video: configurable
audio: configurable
```

---

# 108. MEDIA QUOTA

Monitorizar tamaño total.

Con servidor propio:

storage puede crecer rápidamente.

---

# 109. STORAGE METRICS

Medir:

```txt
original size
derivatives size
monthly growth
unused assets
```

---

# 110. DUPLICATES

Calcular hash opcional.

Detectar upload duplicado.

---

# 111. HASH

```txt
SHA-256
```

puede ayudar a identificar duplicados.

---

# 112. DUPLICATE UX

Warn:

```txt
Este archivo ya existe.
```

No bloquear necesariamente.

---

# 113. DAM SEARCH

Payload Admin debe permitir encontrar media por:

```txt
filename
caption
credit
photographer
date
mediaType
```

---

# 114. MEDIA TAGGING

Puede existir:

```txt
tags[]
```

pero no crear taxonomía caótica.

---

# 115. SUBJECT TAGS

No etiquetar automáticamente personas mediante reconocimiento facial.

---

# 116. FACE RECOGNITION

No implementar.

No es necesario para el producto.

---

# 117. GEOLOCATION

Location puede ser campo editorial manual.

No derivarlo automáticamente de EXIF para publicación.

---

# 118. RIGHTS WORKFLOW

Antes de uso:

```txt
upload
↓
rights known
↓
credit complete
↓
approved
```

---

# 119. UNKNOWN RIGHTS

Media con:

```txt
license = unknown
```

no debe ser seleccionable para publicación final salvo override privilegiado y auditado.

---

# 120. EXPIRED RIGHTS

Cuando expire licencia:

crear alerta.

No borrar automáticamente.

---

# 121. CONTENT USING EXPIRED MEDIA

Generar listado:

```txt
Published pages using expired asset
```

para acción editorial.

---

# 122. MEDIA REPLACEMENT

Permitir sustituir asset en un artículo.

No reemplazar físicamente archivo original bajo misma URL si altera registro histórico sin versionado.

---

# 123. ASSET VERSIONING

Si una imagen publicada cambia materialmente:

crear nueva Media item/version.

---

# 124. IMMUTABLE PUBLIC URLS

Una URL específica debe representar el mismo asset/version.

---

# 125. PUBLICATION HISTORY

Guardar:

```txt
firstUsedAt
```

opcionalmente derivado.

---

# 126. ARTICLE IMAGE RELATION

Article relaciona Media.

No copia:

```txt
URL
credit
caption
```

como campos duplicados salvo override editorial específico.

---

# 127. PER-USE CAPTION

Permitir override:

```txt
captionOverride
```

cuando misma imagen requiere contexto distinto.

---

# 128. PER-USE ALT

Puede permitirse:

```txt
altOverride
```

si contexto cambia sustancialmente.

---

# 129. DEFAULT ALT

Media conserva alt base.

---

# 130. PHOTO CREDIT COMPONENT

Crear:

```txt
MediaCredit
```

consistente en frontend.

---

# 131. CAPTION COMPONENT

Crear:

```txt
MediaCaption
```

---

# 132. FULLSCREEN GALLERY

Si se implementa:

- accesible;
- keyboard;
- focus management;
- captions;
- close;
- swipe mobile.

---

# 133. NO GALLERY LIGHTBOX BY DEFAULT

Solo para galerías reales.

No para cada foto de artículo.

---

# 134. LAZY GALLERY

No cargar 40 imágenes full-res de inmediato.

---

# 135. PERFORMANCE

Media suele ser el mayor peso del sitio.

Priorizar:

```txt
correct dimensions
modern codecs
lazy load
CDN readiness
```

---

# 136. WEB VITALS

Pipeline debe contribuir a:

```txt
LCP < 2.5s
CLS < 0.1
```

---

# 137. WIDTH/HEIGHT

Todos los derivados deben tener metadata dimensional.

---

# 138. CLS

Frontend debe reservar espacio antes de cargar.

---

# 139. RESPONSIVE SOURCE

Evitar imagen única gigante para todos los dispositivos.

---

# 140. IMAGE QUALITY QA

Comparar:

```txt
original
AVIF
WebP
```

en:

- rostros;
- texto;
- detalles;
- fotografías nocturnas.

---

# 141. COLOR QA

Verificar que perfiles no cambien colores de marca o piel.

---

# 142. POSTER QUALITY

Video poster debe ser suficientemente nítido.

---

# 143. LOGO QUALITY

SVG siempre que sea posible.

---

# 144. OPEN GRAPH QUALITY

Evitar compresión que vuelva ilegible el titular.

---

# 145. MEDIA SECURITY

Assets públicos:

no contienen secrets.

Assets internos/evidence:

no pertenecen a esta colección.

---

# 146. PRIVATE MEDIA

Si posteriormente hay media interna:

crear storage y access separado.

No reutilizar `media` pública con un boolean improvisado.

---

# 147. EVIDENCE PREVIEW

Una preview de evidence pública puede generar asset derivado:

```txt
document_preview
```

pero debe ser copia segura.

---

# 148. PUBLIC DOCUMENT PREVIEW

Ejemplo:

```txt
first page rendered as image
```

para card.

---

# 149. ORIGINAL EVIDENCE

Nunca pasa a Media pública.

---

# 150. DOCUMENT PREVIEW PIPELINE

```txt
public evidence
↓
safe renderer
↓
preview image
↓
Media
```

---

# 151. PDF RENDERING

Ejecutar en worker aislado.

No confiar en PDF como formato seguro.

---

# 152. SOCIAL EXPORTS

Para redes:

crear assets derivados:

```txt
1:1
4:5
9:16
```

pero solo cuando se soliciten.

No generar automáticamente para cada fotografía.

---

# 153. SOCIAL TEMPLATES

Sistema gráfico aprobado:

```txt
breaking
investigation
quote
data
standard news
```

---

# 154. AUTOMATED SOCIAL CREATIVE

Puede generar primera versión.

Debe permitir edición manual.

---

# 155. NO AUTO-PUBLISH SOCIAL

Generar asset:

sí.

Publicar automáticamente:

no en v1.

---

# 156. MEDIA ADMIN UX

Agrupar tabs/filtros:

```txt
All
Photos
Graphics
Video
Logos
Expiring Rights
Archived
```

---

# 157. MEDIA PREVIEW

Mostrar:

```txt
asset
dimensions
file size
format
credit
rights
usage
```

---

# 158. USAGE REFERENCES

Mostrar dónde se usa.

Ejemplo:

```txt
Used in:
Article X
Homepage Hero
Investigation Y
```

---

# 159. ORPHAN MEDIA

Job periódico puede detectar:

```txt
unused assets
```

No borrar automáticamente.

---

# 160. ORPHAN REVIEW

Permitir archivar manualmente.

---

# 161. BACKUPS

Media originals requieren backup.

Derivatives:

pueden regenerarse si pipeline es determinista.

---

# 162. BACKUP PRIORITY

Prioridad:

```txt
originals > derivatives
```

---

# 163. REBUILD DERIVATIVES

Crear comando:

```txt
pnpm media:regenerate
```

---

# 164. REGENERATION

Debe poder:

```txt
original
↓
new derivative config
↓
rebuild
```

sin reupload.

---

# 165. PIPELINE VERSION

Mantener:

```txt
MEDIA_PIPELINE_VERSION
```

para cambios importantes.

---

# 166. IMAGE PROCESSING LIBRARY

Elegir herramienta server-side estable.

Ejemplo:

```txt
sharp
```

cuando sea compatible con stack y deploy.

---

# 167. PROCESSING FAILURE

Upload original puede existir pero status:

```txt
processing_failed
```

No publicar hasta solucionar.

---

# 168. PROCESSING STATUS

```txt
uploaded
processing
ready
failed
archived
```

---

# 169. ASYNC PROCESSING

Para archivos grandes:

usar Payload Jobs o worker separado.

---

# 170. SMALL IMAGE PROCESSING

Puede hacerse inline si coste es bajo.

Medir.

---

# 171. CONCURRENCY

Limitar procesamiento simultáneo para no agotar 12 GB RAM.

---

# 172. VIDEO JOBS

Siempre background.

---

# 173. THUMBNAIL JOB

Puede background si pesado.

---

# 174. JOB PRIORITIES

Ejemplo:

```txt
hero image processing = high
social export = low
video transcoding = medium
```

---

# 175. FAILURE RETRIES

Procesamiento debe ser reintentable.

---

# 176. IDEMPOTENCY

No generar 4 copias iguales por retry.

---

# 177. ADMIN WARNING

Media no lista:

```txt
Processing...
```

No permitir seleccionar hasta ready, salvo original use explicitly supported.

---

# 178. MEDIA API

Frontend público recibe DTO seguro.

Ejemplo:

```ts
type PublicMedia = {
  url
  width
  height
  alt
  caption
  credit
  sources
}
```

---

# 179. NO INTERNAL FIELDS

Nunca enviar:

```txt
rightsNotes
originalFilename
private metadata
internal status
```

---

# 180. MEDIA URL BUILDER

Centralizar:

```txt
getMediaURL()
```

---

# 181. IMAGE COMPONENT

Centralizar:

```txt
EditorialImage
```

---

# 182. VIDEO COMPONENT

Centralizar:

```txt
EditorialVideo
```

---

# 183. AUDIO COMPONENT

Centralizar:

```txt
EditorialAudio
```

---

# 184. CONSISTENCY

No dejar cada template construir media de forma diferente.

---

# 185. ACCESSIBILITY QA

Comprobar:

```txt
alt
captions
keyboard
video subtitles
audio transcript
```

---

# 186. VIDEO ACCESSIBILITY

Video importante debe tener:

```txt
captions
```

cuando sea posible.

---

# 187. AUDIO ACCESSIBILITY

Proporcionar transcript.

---

# 188. SOCIAL ACCESSIBILITY

Texto dentro de imagen no sustituye caption accesible de la publicación.

---

# 189. DOCUMENTATION

Crear:

```txt
/docs/media/
```

con:

```txt
media-model.md
photography.md
rights.md
image-processing.md
video.md
social-assets.md
accessibility.md
backup.md
```

---

# 190. PHOTO GUIDELINES

Documentar:

```txt
composition
color treatment
cropping
credits
manipulation rules
```

---

# 191. RIGHTS GUIDELINES

Documentar:

```txt
owned
licensed
courtesy
public domain
expiration
```

---

# 192. DEFINITION OF DONE

El Media Pipeline estará listo cuando:

1. Media esté completamente separada de Evidence;
2. cada fotografía pueda guardar alt, caption, credit y derechos;
3. los originales se conserven;
4. existan derivados útiles;
5. crop/hotspot funcione;
6. AVIF/WebP estén disponibles cuando convenga;
7. frontend entregue tamaños responsive;
8. imágenes no generen CLS;
9. LCP pueda optimizarse correctamente;
10. derechos vencidos generen alertas;
11. media con derechos desconocidos no se publique accidentalmente;
12. video tenga poster/transcript/captions cuando corresponda;
13. processing pesado sea asíncrono;
14. derivados puedan regenerarse;
15. OG tenga fallback;
16. SVG no confiable esté bloqueado/sanitizado;
17. EXIF sensible no se exponga;
18. assets públicos tengan cache correcto;
19. media usada no pueda borrarse accidentalmente;
20. evidencia original nunca termine dentro de la Media Collection.

---

# 193. Principio final

Una imagen periodística no es decoración.

Debe responder:

```txt
¿Qué muestra?
¿Quién la produjo?
¿Podemos publicarla?
¿Ha sido alterada?
¿Dónde puede usarse?
¿Es accesible?
¿Se entrega eficientemente?
```

**Media debe aportar credibilidad al periodismo, no únicamente engagement.**