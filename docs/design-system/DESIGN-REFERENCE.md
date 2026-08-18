# DESIGN REFERENCE — Sistema Web Editorial

**Fuente:** `docs/img/sistema-web-editorial-clasificados-colombia.png` (lámina aprobada, 13 paneles)
**Extraído:** 2026-08-17 · durante F0
**Consumidor:** F1 (Design System Foundation), F8, F9, F10, F11, F12

> Este documento **no reemplaza** a los PRDs. Registra lo que la lámina especifica con más precisión que los PRDs, y marca explícitamente los puntos donde **añade** o **contradice** algo. Los deltas de §9 requieren confirmación antes de F1.

---

## 1. Grid y espaciado (panel 10)

La lámina fija valores que los PRDs dejaban abiertos:

```txt
Grid:      12 columnas
Gutter:    24 px
Margin:    120 px
Baseline:  8 px
```

Coherencia con los PRDs:

| Valor               | PRD                            | Estado                                     |
| ------------------- | ------------------------------ | ------------------------------------------ |
| 12 columnas desktop | PRD Master §38, Nº8 §14        | ✅ coincide                                |
| Baseline 8 px       | PRD Master §39 (escala base 4) | ✅ compatible — 8 = 2×4                    |
| Margin 120 px       | PRD Nº8 §16 (`editorial 1200`) | ✅ coherente: 1440 − 2×120 = 1200          |
| Gutter 24 px        | —                              | ➕ **nuevo**, los PRDs no lo especificaban |

Contenedores derivados (PRD Nº8 §16): `wide 1440` · `editorial 1200` · `article 900` · `reading 720`.

---

## 2. Marca (panel izquierdo)

**Lockup:** «C» serif de gran tamaño con acento rojo en forma de coma, sobre wordmark de dos líneas:

- `CLASIFICADOS` — Ink, letterspacing amplio
- `COLOMBIA` — Investigation Red, letterspacing amplio

**Variantes requeridas** (PRD Nº8 §24): `dark` · `light` · `compact`. En SVG, nunca PNG.

**Principios editoriales** de la lámina, con iconografía outline: VERAZ · INDEPENDIENTE · TRANSPARENTE · VOCES · COLOMBIA. Alimentan `/principios-editoriales` (F13).

---

## 3. Color

Confirma la paleta del PRD Master §4:

```txt
Ink                #0A0A0A
Paper              #F7F6F2
White              #FFFFFF
Investigation Red  #D71920
```

La lámina es marcadamente oscura: header, hero, banda de denuncias, hero de investigación, footer y bloque de newsletter van todos sobre Ink. Consistente con la proporción 60% Ink del PRD Master §5.

### 3.1 Estados del botón primario (panel 12)

```txt
NORMAL        rojo
HOVER         rojo más oscuro
ACTIVO        rojo muy oscuro / casi Ink
DESACTIVADO   gris neutro
```

### 3.2 Estados de enlace (panel 12)

```txt
NORMAL        sin subrayado
HOVER         subrayado
ACTIVO        subrayado, peso mayor
VISITADO      subrayado, tono atenuado
```

`VISITADO` es un estado que **ningún PRD menciona** y que requiere un token propio.

---

## 4. Breaking News Bar (paneles 01 y 11)

Estructura: `[etiqueta de severidad] · titular · hora · Ver más →`

Estados en la lámina:

| Severidad     | Fondo etiqueta    | Fondo fila                 |
| ------------- | ----------------- | -------------------------- |
| `ÚLTIMA HORA` | Investigation Red | Ink / claro según contexto |
| `ALERTA`      | **Ámbar**         | Ámbar muy claro            |

El header además muestra **dos niveles de rótulo simultáneos**: un `BREAKING NEWS` fijo a la izquierda y la píldora de severidad `ÚLTIMA HORA` a continuación.

Sin ticker, sin marquee, sin parpadeo (PRD Nº8 §35).

---

## 5. Componentes UI (panel 06)

- **Botones:** `PRIMARIO` (rojo) · `SECUNDARIO` (Ink) · `TEXTO ENLACE >`. Tres variantes, no catorce (PRD Nº8 §99 admite hasta cuatro con `danger`).
- **Etiquetas/Tags:** `INVESTIGACIÓN` (Ink) · `DENUNCIA` (rojo) · `JUSTICIA` / `ANÁLISIS` / `DATOS` (gris). El color de la etiqueta **codifica la sección**, no es decorativo.
- **Buscador:** input con placeholder `Buscar...` y lupa a la derecha.
- **Migas de pan:** `Inicio > Investigación > Corrupción > Detalle`.
- **Paginación:** `< 1 2 3 … 10 >` con página activa en Ink. Links HTML reales (PRD SEO §80).

---

## 6. Plantillas

### 6.1 Homepage (panel 02)

Hero dominante sobre Ink con etiqueta `INVESTIGACIÓN DESTACADA`, titular serif, dek, botón outline `LEER INVESTIGACIÓN` y puntos de carrusel. Después `ÚLTIMAS NOTICIAS` (4 cards con `Ver todas →`), fila de tres columnas (`INVESTIGACIONES` como lista, `ANÁLISIS DESTACADO` con imagen, `DATOS CLAVE` con cifra grande en rojo y nota de fuente) y banda oscura final con `DENUNCIAS CIUDADANAS` + `SÍGUENOS` + `NEWSLETTER`.

### 6.2 Artículo (panel 03)

Migas · etiqueta de sección · H1 serif · dek · byline con avatar, cargo, fecha, hora e iconos de compartir · `Lectura: 8 min` · hero con caption · **capitular (drop cap)** en el primer párrafo · pull quote con comilla roja y atribución · `LOS DOCUMENTOS` con tarjetas de documento · `NOTICIAS RELACIONADAS`.

Las tarjetas de documento muestran **tipo, nombre y peso de archivo** (`Contrato No. 2021-087 · 2.1 MB`), más una tarjeta final `+ Ver todos los documentos`.

### 6.3 Investigación especial (panel 04)

Fondo Ink, etiqueta `INVESTIGACIÓN ESPECIAL`, titular serif grande, dek, fila de contadores (`5 REPORTAJES · 10 DOCUMENTOS · 11 TESTIMONIOS`), `CRONOLOGÍA CLAVE` en rejilla 2×2 con marcadores de año en rojo, y CTA rojo `VER INVESTIGACIÓN COMPLETA`.

### 6.4 Móvil (panel 05)

Hamburguesa + logo + lupa · barra `ÚLTIMA HORA` a ancho completo · etiqueta + titular serif + `LEER MÁS >` · `ÚLTIMAS NOTICIAS` como lista compacta con miniaturas pequeñas a la derecha.

Confirma PRD Nº8 §114: en móvil la lista compacta es preferible a forzar imagen sobre texto.

### 6.5 Footer (panel 09)

Sobre Ink. Logo + tagline «Investigación. Información con impacto.» y cuatro columnas: `SECCIONES` · `INFORMACIÓN` · `EXTRAS` · `NEWSLETTER`. Iconos sociales y línea legal con año y «Hecho en Colombia».

---

## 7. Fotografía

Todas las imágenes de la lámina están en **blanco y negro / muy desaturadas**. Ver delta D-06.

---

## 8. Iconografía de categorías (panel 07)

Seis fichas con icono outline: `INVESTIGACIÓN` (lupa) · `POLÍTICA` (edificio) · `JUSTICIA` (balanza) · `DENUNCIA` (megáfono) · `ANÁLISIS` (pluma) · `DATOS` (barras).

---

## 9. DELTAS CONTRA LOS PRDs

> **Resueltos el 2026-08-17** (decisión del cliente):
>
> - **D-01 · ámbar `ALERTA` → SE INCLUYE.** Criterio dado: _«si está, se hace»_ — lo que la
>   lámina muestra se construye. Tokenizado como `--color-alert` en F1.
> - **D-06 · fotografía en blanco y negro → NO es dirección de arte.** Son imágenes de relleno
>   de la lámina. No se aplica monocromo sistemático; el pipeline de media (F15) queda sin
>   restricción cromática y rige el PRD Nº10 §71-§72 (documental, natural, sobrio).
>   Para contenido demo se usan imágenes de relleno equivalentes.
> - **D-12 / D-13 · paleta de los logos → MANDA EL PRD.** Ink `#0A0A0A` y Paper `#F7F6F2`.
>   Los assets servidos en `public/brand/` fueron recoloreados; los originales del diseñador
>   quedan intactos.
>
> Siguen abiertos: D-04, D-05, D-07, D-14.

| #        | Delta                                                                                                                                                                                                                                                                                                                                                                             | Impacto                                                                                          | Propuesta                                                                                                                                                                                                                       |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D-01** | **Estado `ALERTA` en ámbar.** Ningún PRD tokeniza un ámbar; la paleta aprobada solo tiene Ink, Paper, White, rojo y grises.                                                                                                                                                                                                                                                       | F1 (tokens), F8 (BreakingNewsBar). Un color de marca nuevo no es una decisión de implementación. | Añadir token semántico `--color-alert` con valor ámbar por confirmar. Debe cumplir contraste AA sobre Paper e Ink.                                                                                                              |
| **D-02** | **Estado `VISITADO` de enlace.** No aparece en ningún PRD.                                                                                                                                                                                                                                                                                                                        | F1                                                                                               | Añadir token; verificar que no compromete el contraste AA (PRD Nº8 §108).                                                                                                                                                       |
| **D-03** | **Gutter 24 px** no estaba especificado.                                                                                                                                                                                                                                                                                                                                          | F1                                                                                               | Adoptar; es coherente con base 4 y con `editorial 1200`.                                                                                                                                                                        |
| **D-04** | **Rutas del footer no contempladas en el PRD.** La lámina añade `Código ético`, `Términos y condiciones`, `Política de privacidad`, `Archivo`, `Media kit`, `Trabaja con nosotros`, `Boletines informativos`, `Suscripciones`. El PRD Master §10/§47 solo lista `/quienes-somos`, `/equipo`, `/principios-editoriales`, `/metodologia`, `/correcciones`, `/fuentes`, `/contacto`. | F13 (alcance de páginas)                                                                         | Confirmar cuáles son v1. `Código ético` probablemente es `/principios-editoriales`; el resto son páginas nuevas. `Archivo` tiene implicaciones SEO (PRD SEO §81 advierte contra archivos de páginas delgadas).                  |
| **D-05** | **`TESTIMONIOS` como contador de investigación.** El modelo definitivo (PRD Nº7 §51) no tiene relación de testimonios; lo más cercano es `Sources` con `sourceType = interview`.                                                                                                                                                                                                  | F5 (modelo de Investigations)                                                                    | Decidir: ¿contador derivado de `sources[]` filtrando por tipo, o concepto propio? Si es propio, es un campo nuevo en el modelo definitivo.                                                                                      |
| **D-06** | **Tratamiento fotográfico en blanco y negro.** El PRD Nº10 §71-§72 pide fotografía «documental, natural, sobria» y prohíbe saturación excesiva, pero no prescribe monocromo.                                                                                                                                                                                                      | F9, F10, F15                                                                                     | Confirmar si el blanco y negro es **dirección de arte deliberada** o solo imágenes de relleno de la lámina. Es una diferencia grande: monocromo sistemático es una decisión editorial fuerte y afecta al pipeline de derivados. |
| **D-07** | **Categoría `Colombia`.** El PRD Nº7 §14 lista 8 categorías iniciales incluyendo `Colombia`; la navegación de la lámina muestra 7 y no la incluye.                                                                                                                                                                                                                                | F4 (seed de categorías), F8 (nav)                                                                | Confirmar si `Colombia` existe como categoría sin presencia en la nav principal, o si se retira.                                                                                                                                |
| **D-08** | **Capitular (drop cap)** en el arranque del artículo. No está en el PRD Nº8.                                                                                                                                                                                                                                                                                                      | F11 (renderer de rich text)                                                                      | Adoptar como estilo del primer párrafo; debe degradar bien en móvil y no romper la lectura por lector de pantalla.                                                                                                              |
| **D-09** | **Peso de archivo en tarjetas de documento.** El PRD Master §20 pide nombre, institución, fecha, tipo y páginas; la lámina muestra peso.                                                                                                                                                                                                                                          | F12 (EvidenceCard)                                                                               | Mostrar ambos cuando existan. El peso sale de `Evidence.size`, que ya está en el modelo (PRD Nº7 §65).                                                                                                                          |
| **D-10** | **Año del copyright fijo («© 2025»).**                                                                                                                                                                                                                                                                                                                                            | F8 (SiteFooter)                                                                                  | Trivial pero real: el año debe derivarse en tiempo de render, no quedar fijo.                                                                                                                                                   |

---

## 9-bis. Deltas surgidos al recibir los assets de marca (2026-08-17)

Entregados en `docs/assets/img/`: `favicon.svg`, `logo-clasificados-colombia-main.svg`,
`logo-clasificados-colombia-main-black.svg`. Cierra el gap G-06 parcialmente.

| #        | Delta                                                                                                                                                                                                                                                 | Impacto     | Estado                                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **D-11** | **Wordmark invisible sobre fondo oscuro.** 12 de 22 `<path>` no tienen `class` y caen al `fill: black` por defecto de SVG. Son las 12 letras de CLASIFICADOS. En la variante clara pasa desapercibido; en la oscura el wordmark desaparece sobre Ink. | F8, F1      | Mitigado en `public/brand/` con un `fill` heredado en el `<svg>` raíz. **Debe corregirse en origen**, o el próximo export lo reintroduce. |
| **D-12** | **Ink del logo ≠ Ink del PRD.** Los SVG usan `#000a0a`; PRD Master §4 fija `#0A0A0A`. Parece dígitos transpuestos, pero es una diferencia real (leve tinte cian).                                                                                     | F1 (tokens) | ❓ Requiere decisión: ¿manda el logo o el PRD?                                                                                            |
| **D-13** | **Paper del logo ≠ Paper del PRD.** Los SVG usan `#f2f2f2`; PRD Master §4 fija `#F7F6F2` y pide explícitamente «evitar blanco digital excesivamente frío». `#f2f2f2` es justamente un gris neutro frío.                                               | F1 (tokens) | ❓ Requiere decisión. F1 no puede tokenizar dos definiciones de Paper.                                                                    |
| **D-14** | **Falta variante compacta.** PRD Nº8 §24 pide `dark`/`light`/`compact`, y §26 define un header que se compacta al hacer scroll. La lámina muestra marca compacta en móvil. No se entregó.                                                             | F8          | ✅ Resuelto en F8 (2026-08-18) con `logomark.svg`, el monograma circular que ya venía en la entrega: es la forma compacta propia de la marca, no un sustituto. El header condensado no quedó bloqueado. |
| **D-15** | **Falta `apple-touch-icon` PNG.** Safari en iOS ignora los favicon SVG.                                                                                                                                                                               | F16         | Generable desde `logomark.svg` en F16; no bloquea.                                                                                        |

Detalle técnico completo en `public/brand/README.md`.

---

## 9-ter. Manual de marca (recibido 2026-08-17)

Añadidas 12 láminas más en `docs/img/`: sistema cromático, sistema tipográfico, sistema de logo,
instrucción del logo, sistema gráfico e iconografía, estilo fotográfico, aplicaciones clave.

> **Regla de precedencia confirmada por el cliente: los PRDs siguen mandando.**
> El manual es referencia de apoyo. Donde el manual implicaría un cambio abrupto sobre lo ya
> especificado en los PRDs, **no se aplica** — se registra aquí y se decide aparte.

### Lo que CONFIRMA (sin cambios necesarios)

- Negro Editorial `#0A0A0A`, Rojo Investigación `#D71920`, Papel `#F7F6F2` — idénticos al PRD Master §4.
- Playfair Display (editorial) + Source Sans 3 (interfaz/lectura) — idéntico al PRD Master §6.
- Espaciado en múltiplos de 4 px, con pasos 8/12/16/24/32/48/64 — idéntico al PRD Master §39.
- Ancho de columna 65–75 caracteres — idéntico al PRD Nº8 §13.
- Proporción cromática ≈60% negro / 25% papel / 8% gris / 5% rojo / 2% neutros — refina el PRD Master §5 (60/25/10/5).

### Lo que DIVERGE — no aplicado, pendiente de decisión

| #        | Divergencia                                                                                                                                                                                                                                                                                                                                  | Estado                                                                                                                                                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **D-16** | **Rampa de grises.** Implementado el PRD Nº8 §5 (`#222222 #555555 #7A7A7A #D5D5D5 #E5E5E5 #F0F0F0`). El manual define `#1A1A1A #333333 #6B6B6B #9A9A9A #E5E5E5 #F0F0F0` — que coincide con el PRD Master §4. Es en el fondo un conflicto PRD-vs-PRD que el manual desempata a favor del Master. Por precedencia (doc más reciente) gana Nº8. | **NO aplicado.** Se mantiene Nº8. Nota real: el `#7A7A7A` de Nº8 da 3.97:1 sobre Papel y **no pasa AA**, mientras el `#6B6B6B` del Master/manual da 4.93:1 y sí. Por eso los tokens de texto muted/metadata apuntan a `#555555`, no a `#7A7A7A`. |
| **D-17** | **Especificaciones tipográficas en pt.** El manual da tamaños de imprenta (Playfair Black 64–72 pt, tracking −20 a −40, etc.). La escala implementada viene del PRD Master §7, en px y declarada como referencia de pantalla.                                                                                                                | **NO aplicado.** Rige el PRD Master §7. Los valores en pt son de soporte impreso y no traducen 1:1 a la web.                                                                                                                                     |

### Errores detectados en la tabla de contraste del manual

El manual publica una tabla «COMBINACIONES DE CONTRASTE» con valores que no se sostienen al
calcularlos. Verificado con `src/styles/contrast.ts`:

| Combinación                    | Declara   | Real      | Veredicto                              |
| ------------------------------ | --------- | --------- | -------------------------------------- |
| Negro Editorial sobre Papel    | 21.0      | **18.31** | pasa igual, pero el número está mal    |
| Blanco sobre Negro Editorial   | 21.0      | **19.80** | pasa igual, número mal                 |
| Gris Información sobre Papel   | 4.5       | **4.93**  | pasa                                   |
| Rojo sobre Papel               | 4.6 / AAA | **4.80**  | pasa AA; **no es AAA** (AAA exige 7:1) |
| **Rojo sobre Negro Editorial** | 4.7 / AAA | **3.82**  | **NO pasa AA para texto normal**       |

El último es el que importa: el manual presenta rojo sobre negro como combinación aprobada para
texto, y no lo es. Solo es válida para texto grande (≥24 px, o ≥19 px en negrita) y para elementos
no textuales, donde el umbral es 3:1.

Esto ya está blindado en código: `src/styles/contrast.test.ts` afirma explícitamente que
`--color-accent` sobre `--color-surface-inverse` está entre 3:1 y 4.5:1, de modo que si alguien
sube ese par a texto de cuerpo, el test lo detiene.

---

## 10. Qué toma F1 de aquí

1. Tokens de color, incluidos los dos nuevos por confirmar (D-01, D-02).
2. Grid 12 / gutter 24 / margin 120 / baseline 8.
3. Escala de contenedores `wide / editorial / article / reading`.
4. Tres variantes de botón con sus cuatro estados.
5. Sistema de etiquetas donde el color codifica sección.
6. Confirmación de que el modo oscuro es **recurso editorial por bloque**, no dark mode global (PRD Master §45, PRD Nº8 §140).
