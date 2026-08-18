# ADR-002 · Familia de primitives accesibles

- **Estado:** Aceptado
- **Fecha:** 2026-08-18
- **Resuelve:** conflicto C-08 del MASTER-IMPLEMENTATION-PLAN
- **Afecta:** F8 (MobileNav), F13 (SearchDialog), F11 (galería), formularios de F21

## Contexto

Dos PRD nombran dos familias de primitives sin decidir entre ellas:

- PRD Frontend §43-§44: *"shadcn/ui solo como primitives"*, *"Base UI cuando aporte accesibilidad"*.
- PRD Master §288-§289: lista `shadcn/ui` y `Base UI primitives` como parte del stack.

PRD Master §321 acota shadcn: *"No utilizar shadcn como una plantilla visual. Usar únicamente
sus primitives accesibles."* Y §287 prohíbe *"librerías gigantes para funcionalidades pequeñas"*.

La superficie interactiva real del producto es chica: un menú móvil, un diálogo de búsqueda,
un combobox de autocompletado, una galería y los formularios de denuncias. Mantener dos
familias de primitives para eso significaría dos modelos de foco, dos formas de bloquear el
scroll y dos vocabularios de ARIA conviviendo en el mismo header.

## Decisión

**Radix Primitives, instalados primitive por primitive.**

Base UI queda habilitada como excepción puntual, no como default, exactamente en los términos
condicionales del PRD: *cuando aporte accesibilidad* que Radix no cubra.

## Motivo

1. **Base UI está en `1.0.0-rc.0`** (verificado en el registro el 2026-08-18). Es un release
   candidate. El destino de despliegue es un VPS self-hosted en Coolify, sin el botón de
   rollback instantáneo de una plataforma administrada. Un cambio de API en un RC entre dos
   deploys se paga caro, y lo que está en juego es un menú móvil. `@radix-ui/react-dialog`
   está en `1.1.23`, estable.

2. **"shadcn/ui solo como primitives" se resuelve, en la práctica, a Radix.** shadcn no es una
   dependencia en tiempo de ejecución: es un generador que copia código a tu repo. Lo que
   aporta es (a) markup estilado con Tailwind y (b) la capa accesible, que *es* Radix. El punto
   (a) está explícitamente prohibido por §321 — toda la apariencia sale del Design System de
   Clasificados Colombia. Descontado (a), queda (b): Radix.

3. **Instalación por primitive, no el meta-paquete.** `@radix-ui/react-dialog` pesa lo que pesa
   un diálogo. Es lo contrario de la "librería gigante para funcionalidad pequeña" que §287
   prohíbe.

## Consecuencias

- Los componentes interactivos importan de `@radix-ui/react-*` y se estilan íntegramente con
  los tokens de `globals.css`. Ningún estilo llega desde la librería.
- Radix aporta gestión de foco, `aria-*`, bloqueo de scroll y cierre por `Escape`. Nada de eso
  se reimplementa a mano — es precisamente el código donde un error propio no se nota hasta que
  alguien navega con teclado o lector de pantalla.
- El componente que use un primitive queda marcado `'use client'`; el resto del árbol sigue
  siendo Server Component (PRD Master §292).
- **Revisar cuando Base UI llegue a 1.0 estable.** La decisión se tomó por madurez, no por
  capacidad. Si en ese momento Base UI cubre un caso que Radix no —el PRD lo contempla— la
  excepción se documenta en su propio ADR.

## Alternativas descartadas

| Alternativa | Por qué no |
|---|---|
| Base UI como default | RC en producción sin rollback rápido. |
| Ambas familias | Dos modelos de foco y de ARIA en el mismo header. |
| Primitives propios | El foco, el `inert` del fondo y el orden de tabulación son justo el código donde un bug propio es invisible hasta que alguien depende de él. |
| `npx shadcn add` | Trae el estilado que §321 prohíbe; habría que borrarlo entero para quedarse con Radix. |
