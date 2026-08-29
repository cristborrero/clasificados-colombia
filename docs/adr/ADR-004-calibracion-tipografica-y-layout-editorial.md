# ADR-004: Calibración Tipográfica, Ancho de Lectura (768px) y Renderizado Multilínea

**Fecha:** 2026-08-29  
**Estado:** Aprobado e Implementado  
**Contexto:** Frontend Editorial y Payload CMS  

---

## 1. Contexto y Problema

Durante las pruebas editoriales y de experiencia de usuario (UX) en artículos e investigaciones, se detectaron tres desajustes clave:

1. **Cuellos de botella y anchos inconsistentes:** Aunque los contenedores principales tenían anchos amplios, existían clases internas (`max-w-[58ch]`, `max-w-[62ch]`) que estrangulaban el texto a ~578px en unas secciones y 768px en otras, generando inconsistencia visual.
2. **Escala tipográfica sobredimensionada:** La escala inicial fijaba titulares de hasta 96px (`6rem`) y cuerpos de hasta 19px, lo que resultaba visualmente invasivo y desproporcionado respecto a la sobriedad editorial requerida.
3. **Colapso de saltos de línea (`white-space`):** En campos `textarea` de Payload CMS (tales como hallazgos clave, cronología, entradas de capítulos y resúmenes), los saltos de línea ingresados por los editores colapsaban en un solo bloque continuo de texto debido al comportamiento por defecto de HTML (`white-space: normal`).

---

## 2. Decisión

### 2.1 Ancho de lectura unificado a 768px (`max-w-3xl`)
- Se unificó el ancho del marco de lectura a **768px (`max-w-3xl`)** en todas las vistas de contenido (artículos, investigaciones, autores, temas, categorías, denuncias y búsqueda), emulando la arquitectura limpia de periódicos digitales como *El Espectador*.
- Se eliminaron todas las restricciones intermedias (`max-w-[...ch]`), permitiendo que titulares, bajadas y párrafos ocupen el 100% de la columna de 768px.

### 2.2 Escala tipográfica sobria y refinada
Se recalibraron los tokens CSS fluidos en `src/styles/globals.css`:
- **`--text-body`**: `clamp(1rem, 0.98rem + 0.08vw, 1.0625rem)` (16px móvil → 17px desktop, `line-height: 1.65`).
- **`--text-lead`**: `clamp(1.125rem, 1.05rem + 0.3vw, 1.25rem)` (18px → 20px, `line-height: 1.5`).
- **`--text-h1`**: `clamp(1.75rem, 1.35rem + 1.4vw, 2.375rem)` (28px → 38px, `line-height: 1.12`).
- **`--text-display`**: `clamp(2rem, 1.5rem + 1.8vw, 2.75rem)` (32px → 44px, `line-height: 1.08`).
- **`--text-h2`**: `clamp(1.375rem, 1.15rem + 0.8vw, 1.625rem)` (22px → 26px, `line-height: 1.2`).
- **`--text-h3`**: `clamp(1.125rem, 1.05rem + 0.3vw, 1.25rem)` (18px → 20px, `line-height: 1.3`).
- **`--text-metadata`**: `clamp(0.8125rem, 0.8rem + 0.05vw, 0.875rem)` (13px → 14px, `line-height: 1.4`).
- **`--text-label`**: `clamp(0.6875rem, 0.66rem + 0.09vw, 0.75rem)` (11px → 12px, `line-height: 1.3`).

### 2.3 Preservación de saltos de línea (`whitespace-pre-line`)
Se aplicó la clase `whitespace-pre-line` en todos los componentes que renderizan campos de texto de Payload CMS:
- `KeyFindings.tsx` (`finding.description`)
- `EditorialTimeline.tsx` (`event.description`)
- `InvestigationHero.tsx` (`summary`)
- `EntityList.tsx` (`entity.context`)
- `investigacion/[slug]/page.tsx` (`chapter.intro`)
- `autor/[slug]/page.tsx` (`author.bio`)
- `[categoria]/[articulo]/page.tsx` (`article.dek`)
- `tema/[slug]/page.tsx` y `[categoria]/page.tsx` (`description`)

---

## 3. Consecuencias y Verificación

- **Legibilidad:** Mayor confort de lectura, ritmo visual balanceado y respeto estricto de la estructura de párrafos definida por los redactores en el CMS.
- **Mantenibilidad:** Toda la escala tipográfica responde centralizadamente a las variables de CSS en `globals.css` sin sobreescrituras arbitrarias (`sm:text-5xl`) en componentes individuales.
- **Pruebas:** 300 tests unitarios y validaciones de contraste WCAG AAA superadas satisfactoriamente.
