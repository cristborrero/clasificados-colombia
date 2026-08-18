# `src/data/` — capa de acceso a datos

Regla única, y es la que sostiene todo el bloque C:

> **Ningún componente de presentación consulta Payload directamente.**
> (DoD F9 del MASTER-IMPLEMENTATION-PLAN)

Los componentes reciben datos por props. Las páginas los piden acá. Payload se
consulta únicamente en este directorio.

## Por qué

1. **La frontera pública vive en un solo lugar.** Toda función pública de este
   directorio consulta con `overrideAccess: false`, así el `Where` de la
   colección —`_status: published` para anónimos— se aplica siempre. Un
   componente que llamara a `payload.find()` por su cuenta podría olvidarlo, y
   ese olvido publica un borrador (riesgo R-01).

2. **Se puede testear.** Una card se prueba con un objeto literal. Si la card
   consultara la base, probarla exigiría una base.

3. **La proyección es explícita.** Estas funciones devuelven la forma que la
   vista necesita, no el documento completo de Payload. Un campo interno no
   llega al cliente por descuido: no llega porque nadie lo puso acá.

## Convención

- Un archivo por área (`articles`, `categories`, `investigations`, `site`).
- Funciones `async` que devuelven tipos declarados en el mismo archivo.
- Nunca `overrideAccess: true` en una función que sirve al sitio público.
- `null` para "no existe", nunca una excepción: la página decide si eso es un
  404 o un bloque vacío.
