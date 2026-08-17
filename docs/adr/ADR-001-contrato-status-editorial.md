# ADR-001 · Contrato entre `_status` y `editorialStatus`

- **Estado:** Aceptada
- **Fecha:** 2026-08-17
- **Fase:** requerida antes de F4 (Core Content Model)
- **Riesgo que mitiga:** R-01 del `MASTER-IMPLEMENTATION-PLAN` §7 (crítico)
- **Conflicto que resuelve:** C-06 del `MASTER-IMPLEMENTATION-PLAN` §4.6

---

## Contexto

Dos documentos aprobados describen la publicación de forma incompatible.

**PRD Arquitectura CMS §4** declara que `editorialStatus` deja de ser «un campo que en teoría gatea la publicación» y pasa a ser **la única fuente de verdad**, porque las funciones de `access` se escriben para respetarlo literalmente.

**PRD Nº7 §126** —posterior y marcado _definitivo_— declara lo contrario en la práctica: que los drafts/versions nativos de Payload y `editorialStatus` _«resuelven problemas diferentes»_ y deben coexistir. Y **PRD Nº7 §44** define la lectura pública anónima filtrando por `_status = published`, no por `editorialStatus`.

O sea: un documento dice que manda `editorialStatus`, el otro filtra el acceso público por `_status`.

### Por qué esto no es un detalle de implementación

Si ambos campos pueden moverse por separado, existen dos estados inconsistentes, y ninguno es benigno:

| `_status`   | `editorialStatus` | Qué significa en la práctica                                                                                                                                                                          |
| ----------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `published` | `legal_review`    | **Contenido en revisión legal, visible al público.** Es exactamente el riesgo que el PRD Nº5 §109 llama «accidental publish», sobre un medio que publica investigaciones con implicaciones jurídicas. |
| `draft`     | `published`       | La redacción cree que publicó. El lector ve un 404. Nadie se entera hasta que alguien pregunta por qué no aparece la nota.                                                                            |

El primero es un incidente editorial y potencialmente legal. El segundo es una falla silenciosa. Ninguno se detecta mirando la UI del Admin, porque la UI muestra los dos campos como si fueran independientes.

---

## Decisión

Los dos campos se conservan, con **responsabilidades disjuntas y un invariante que las liga**.

### `_status` — visibilidad pública

Nativo de Payload. Es **lo único** que filtra la lectura anónima.

- Responde a: _¿esto se ve desde Internet?_
- Lo mueve el sistema al publicar/despublicar, nunca a mano.
- Es el campo que consulta `access.read` para anónimos (PRD Nº7 §44).

### `editorialStatus` — posición en el flujo de redacción

Campo propio. Es **lo único** que gobierna quién puede modificar y quién puede transicionar.

- Responde a: _¿en qué punto del proceso está esta pieza y quién manda ahora?_
- Valores (PRD Nº7 §39): `draft → editing → fact_check → legal_review → approved → scheduled → published → archived`.
- Lo mueve la redacción, con guards por rol y por precondición.

### El invariante

Se aplica en `beforeChange` (PRD Nº7 §90), del lado del servidor, y por lo tanto también contra la API REST y la Local API — no solo contra el Admin.

```txt
1.  editorialStatus ∈ {draft, editing, fact_check,
                       legal_review, approved, scheduled}
    ⟹ _status = draft

2.  editorialStatus = published
    ⟹ _status = published

3.  _status = published
    ⟹ editorialStatus ∈ {published, archived}

4.  editorialStatus = archived
    ⟹ _status libre (lo decide el flujo de retiro)
```

Las reglas 2 y 3 son la biconditional que cierra el hueco: _publicado editorialmente_ y _visible públicamente_ son la misma cosa.

`archived` es deliberadamente la excepción. El PRD Arquitectura §48 pide preferir archivar sobre borrar y **mostrar un estado apropiado en el frontend en vez de un 404 genérico**, así que una pieza archivada puede seguir visible con su aviso, o retirarse. Esa decisión pertenece al flujo de retiro (F17), no a este invariante.

### Quién puede llegar a `published`

El invariante impide estados incoherentes, pero no autoriza por sí solo. La transición a `published` exige además, y de forma acumulativa:

- rol con `canPublish` — `editor` o `editor_in_chief` (PRD Nº7 §49);
- `factCheckStatus = verified` cuando el tipo de contenido lo requiere (PRD Nº5 §23);
- `legalStatus = approved` para investigaciones (PRD Nº7 §56);
- campos obligatorios presentes (PRD Arquitectura §39).

Esos guards viven con las colecciones que tienen esos campos: F4 para `Articles`, F5 para `Investigations`.

---

## Alternativas descartadas

**Eliminar `editorialStatus` y usar solo `_status`.**
Es lo que sugiere leer literalmente «única fuente de verdad» al revés. Se descarta porque `_status` es binario: no puede representar _en verificación_ ni _en revisión legal_, que es precisamente lo que distingue a esta redacción de un blog. Perderíamos el flujo entero para ganar simplicidad en un campo.

**Eliminar `_status` y filtrar la lectura pública por `editorialStatus`.**
Es la lectura literal del PRD Arquitectura §4. Se descarta porque desactiva drafts y versions nativos de Payload, que el PRD Nº7 §126-§127 exige habilitar en todo el contenido editorial y que dan historial con autor y timestamp sin construir nada. También rompe Live Preview.

**Dejarlos independientes y confiar en el proceso.**
Se descarta porque es el estado actual del riesgo R-01. Un invariante que depende de que nadie se equivoque no es un invariante.

---

## Consecuencias

**A favor**

- La lectura pública tiene un único filtro, y es el nativo. No hay dos caminos hacia «¿esto es público?».
- El flujo de redacción conserva su granularidad completa.
- Drafts, versions y Live Preview siguen funcionando sin adaptaciones.
- Los dos estados incoherentes de la tabla de arriba pasan a ser **imposibles de representar**, no _desaconsejados_.

**En contra, y aceptado**

- Hay dos campos donde conceptualmente hay uno. Se paga con documentación y con el hook que los mantiene atados.
- El hook corre en cada escritura de contenido. Es una comparación de dos campos, no una query.
- Alguien que use `overrideAccess` con `context` para saltarse hooks puede violarlo. Por eso `overrideAccess` queda restringido a jobs controlados, migraciones y mantenimiento, siempre documentado (PRD Nº5 §74, PRD Nº7 §104).

---

## Verificación

El invariante no se considera implementado hasta que existan estos tests, que se escriben junto a `Articles` en F4:

1. Publicar con `editorialStatus = draft` es rechazado **por la API REST**, no solo oculto en el Admin.
2. Mover `editorialStatus` a `published` sin `_status = published` es rechazado.
3. Un reportero no puede publicar aunque manipule ambos campos en la misma petición.
4. Un lector anónimo nunca recibe un documento con `_status = draft`, cualquiera sea su `editorialStatus`.
5. `archived` admite ambos valores de `_status` sin que el guard se dispare.

El punto 4 es el que importa de verdad: es la afirmación de que ninguna investigación en revisión legal es alcanzable desde Internet.

---

## Referencias

- `docs/prd/PRD-arquitectura-cms-payload-clasificados-colombia.md` §4, §35, §48
- `docs/prd/PRD — MODELO DE DATOS DEFINITIVO PAYLOAD.md` §39, §44, §49, §56, §90, §126-§127
- `docs/prd/PRD — SEGURIDAD EDITORIAL, RBAC, EVIDENCE VAULT Y THREAT MODEL.md` §21-§24, §74, §109
- `docs/implementation/MASTER-IMPLEMENTATION-PLAN.md` §4.6 (C-06), §7 (R-01)
