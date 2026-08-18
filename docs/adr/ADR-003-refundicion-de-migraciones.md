# ADR-003 · Refundición del historial de migraciones

- **Estado:** Aceptado
- **Fecha:** 2026-08-18
- **Contexto:** simplificación arquitectónica (9 roles → 3, retiro del Evidence Vault, denuncias dentro de Payload)

## Contexto

La simplificación cambia el esquema en tres frentes a la vez:

- el enum `enum_users_role` pasa de nueve valores a tres;
- desaparecen `evidence`, `evidence_access_grants` e `investigation_teams`;
- aparecen `evidence_documents` y `tips`.

El generador de migraciones de Payload no puede resolver esto solo. Al intentar
generar la migración incremental preguntó, de forma interactiva:

```txt
Is enum_tips_status enum created or renamed from another enum?
  + enum_tips_status                                create enum
  ~ enum_evidence_classification › enum_tips_status rename enum
  ~ enum_evidence_status › enum_tips_status         rename enum
```

Es una pregunta razonable —desde el esquema, un enum nuevo y un enum renombrado
se parecen— pero contestarla mal produce una migración que renombra en lugar de
crear, y eso se descubre en producción.

## Decisión

**Refundir las doce migraciones anteriores en una sola migración inicial.**

## Motivo

1. **No hay ningún despliegue.** F20 está bloqueada por falta de credenciales de
   Contabo/Coolify. No existe una base de datos en producción a la que haya que
   migrar, así que el historial no protege nada: solo describe cómo se llegó a
   un esquema que ya no es el esquema.

2. **Doce migraciones que construyen tablas que la trece borra** no son
   historia, son ruido. Cualquiera que las lea aprende sobre un Evidence Vault
   que no existe.

3. **La alternativa era peor.** Encadenar renombres de enums adivinados a mano
   deja una migración que nadie puede revisar con confianza, para preservar una
   historia que nadie va a reproducir.

## Consecuencias

- `migrate:fresh` reconstruye desde cero sin sorpresas.
- **A partir del primer despliegue esta decisión deja de estar disponible.** En
  cuanto exista una base de datos en producción, toda evolución del esquema pasa
  a ser incremental y aditiva, y refundir vuelve a ser destructivo.
- El historial anterior sigue en Git. Nada se perdió: lo que se retiró es la
  cadena de migraciones, no el registro de lo que se hizo.

## Cuándo *no* volver a hacer esto

En cuanto exista producción. La regla operativa es simple:

```txt
¿existe una base de datos que no puedas recrear desde cero?
  sí → nunca refundas
  no → refundir es barato
```
