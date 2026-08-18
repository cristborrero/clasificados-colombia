# Variables de entorno pendientes

`.env.example` está protegido por permisos y no lo pude editar. Estas dos
variables hay que añadirlas a mano, y **el formulario de denuncias no acepta
nada sin ellas**.

```bash
# ── Cloudflare Turnstile — formulario público de denuncias ───────────────────
# El endpoint /api/tips FALLA CERRADO sin la clave secreta: sin
# TURNSTILE_SECRET_KEY ninguna denuncia se acepta.
#
# Es deliberado. Tratar "sin clave" como "sin verificación" haría que un deploy
# que olvide la variable publique un endpoint abierto sin que nada se vea mal.
#
# Las de abajo son las claves de PRUEBA publicadas por Cloudflare: siempre
# pasan. Reemplazar en producción por las del dominio real.
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

## Además, dos correcciones menores en el mismo archivo

El bloque de MinIO todavía se titula «MinIO Evidence Vault — wired in F6» y cita
PRD Nº5, que está archivado. Debería decir:

```bash
# ── S3 / MinIO (server-only) ─────────────────────────────────────────────────
# Media y documentos publicados. Nunca usar credenciales root desde la
# aplicación, y nunca enviar estas claves al navegador.
```

Y a la lista de gaps del pie conviene sumarle:

```txt
#   G-07  Dominio canónico        (bloquea F16)
#   G-12  Acceso Contabo/Coolify  (bloquea F20)
```

## Efecto práctico hoy

Sin `TURNSTILE_SECRET_KEY` en `.env`:

- `/denunciar` renderiza y valida en el navegador;
- `/api/tips` devuelve 400 a todo, incluido un envío legítimo;
- el test E2E `the endpoint refuses a submission that never cleared Turnstile`
  pasa justamente por eso, y seguirá pasando con las claves de prueba
  configuradas solo si el token no se envía.
