# Clasificados Colombia

Medio digital de investigación. Next.js + Payload CMS en un solo proyecto,
Postgres, Meilisearch, desplegado con Coolify sobre un VPS compartido.

En producción: `https://clasificadoscolombia.co`

---

## Cómo se trabaja acá

La versión anterior de este archivo tenía 98 secciones numeradas y las traté
como contrato: cada una generaba un requisito, que generaba código, que generaba
pruebas, que generaban ciclos. Está en `docs/archive/CLAUDE-v1-98-secciones.md`
si hace falta consultarla. Ya no manda.

**Los PRD de `docs/prd/` son referencia, no contrato.** Se consultan cuando hay
una duda de producto —qué campos lleva una investigación, cómo se ordena la
portada— y se ignoran cuando piden infraestructura que este medio no necesita.
Si un PRD y el sentido común discrepan, gana el sentido común y se anota por qué.

### El ciclo

```txt
cambio  →  pnpm typecheck        (7 s)
        →  pnpm test             (1 s)
        →  la prueba E2E del archivo que tocaste
        →  commit
```

`pnpm build` y la suite E2E completa se corren **antes de cerrar un bloque de
trabajo**, no después de cada cambio.

### Reglas de velocidad, aprendidas a golpes

- **`pnpm test:e2e` NO compila.** Reutiliza el servidor existente. Si tocaste
  `src/`, compila antes o vas a depurar el build viejo. `pnpm test:e2e:full`
  compila y prueba.
- **No borres `.next` por costumbre.** Solo si un build quedó a medias.
- **Verifica la forma real de una API antes de escribir la prueba que la usa.**
  Tres veces me costó un ciclo entero: Payload quiere los campos en `_payload`
  del multipart; el endpoint de búsqueda devuelve `plainTitle`, no `title`;
  `login()` deja cookie y Payload la prefiere sobre la cabecera.
- **Mide antes de suponer.** Las dos veces que adiviné, perdí más tiempo que
  investigando.
- **`payload migrate` abre un prompt interactivo** cuando detecta cambios de
  desarrollo. Parece colgado; está esperando. Para validar migraciones desde
  cero: `pnpm migrate:fresh --force-accept-warning`.
- **Los tipos de Payload se regeneran** con `pnpm generate:types` después de
  tocar una colección. `typecheck` pasa en verde con tipos viejos.

---

## Idioma y Tono del Producto (REGLA PERMANENTE Y ESTRICTA)

**Español Neutro (Colombia / Internacional):**
Todo texto visible en la interfaz, mensajes de error, textos de ayuda, formularios, validaciones, semillas de datos, pruebas y documentación técnica DEBE estar redactado exclusivamente en **español neutro** (tuteo estándar profesional).

- **PROHIBIDO EL VOSEO RIOPLATENSE:** No usar bajo ninguna circunstancia formas verbales de voseo (ej. `escribí`, `contanos`, `tenés`, `probá`, `revisá`, `elegí`, `recargá`, `sos`, `vos`, `decilo`, `mirá`).
- **USAR SIEMPRE FORMAS NEUTRAS:** Usar `escribe`, `cuéntanos`, `tienes`, `prueba`, `revisa`, `elige`, `recarga`, `eres`, `tú`, `dilo`, `mira`.
- **Cero excepciones:** Aplica a todo código fuente, componentes React, rutas API, esquemas Zod, pruebas y documentación.

---

## Lo que no se negocia

Cuatro cosas. No porque el PRD las pida, sino porque publicar tiene
consecuencias para personas reales.

1. **Las fotos no publican dónde se tomaron.** Todo original pasa por sharp al
   subirse y sale sin metadatos. Una foto de teléfono lleva coordenadas GPS, y
   acá eso puede ser la casa de una fuente.
2. **Los borradores y las denuncias no son visibles.** Ni por la API, ni por el
   índice de búsqueda, ni por la diferencia entre un 404 y un 403.
3. **El anonimato vive en el modelo de datos.** Si quien denuncia marca la
   casilla, los campos de contacto no se guardan. No ocultos ni cifrados: no se
   guardan.
4. **Una denuncia nunca genera contenido automáticamente.** De denuncia a
   publicación siempre pasa una persona.

Y una regla de forma: **la seguridad se aplica en el backend.** Ocultar un botón
no es negar una operación.

---

## Roles

```txt
admin    control total: contenido, usuarios, configuración
editor   revisa, aprueba, publica. Lee denuncias
author   crea y edita solo sus borradores
```

---

## Stack, ya decidido

Next.js · Payload CMS · Postgres · Meilisearch · Tailwind · Coolify.

No se sustituye ninguna pieza por preferencia. Cambiarlas necesita un ADR en
`docs/adr/`, no una opinión.

---

## Comandos

```bash
pnpm dev                 desarrollo
pnpm typecheck           7 s
pnpm test                unitarios, 1 s
pnpm test:e2e            E2E (NO compila)
pnpm test:e2e:full       compila y prueba
pnpm build               ~30 s

pnpm generate:types      tras tocar una colección
pnpm migrate:create      nueva migración
pnpm migrate:fresh       reconstruir desde cero (destructivo, solo dev)

pnpm search:reindex      reconstruir el índice
pnpm media:regenerate    rehacer derivados de imagen
pnpm media:rights        licencias vencidas
pnpm jobs:health         trabajos que fallaron
pnpm services:up         postgres, meilisearch y minio locales
```

---

## Dónde está todo

```txt
src/app/(frontend)     sitio público
src/app/(payload)      panel de administración
src/payload/           colecciones, hooks, jobs, acceso
src/lib/routes.ts      única fuente de verdad de las URL
src/data/              proyecciones públicas — lo que llega al navegador
src/search/            Meilisearch
e2e/                   pruebas de extremo a extremo
docs/implementation/   qué se construyó y por qué
docs/adr/              decisiones con consecuencias
```

**Este disco importa.** El proyecto vive en el disco interno a propósito: en el
externo escribía a 27 MB/s y un build tardaba siete minutos. Ver
`docs/ESTADO-Y-DIAGNOSTICO.md`.

---

## Al terminar algo

Una entrada en `docs/implementation/IMPLEMENTATION-LOG.md` con lo que no se ve
en el código: por qué se eligió esto y no aquello, qué defecto apareció, qué se
dejó afuera a propósito.

Un ADR en `docs/adr/` solo si la decisión sería cara de revertir.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
