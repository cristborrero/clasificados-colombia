# Runbook de despliegue — Clasificados Colombia

Escrito contra el servidor real, no contra el ideal del PRD. Ese servidor ya
tiene una convención que funciona y seis dominios encima; este documento la
sigue en vez de pelearla.

## El servidor

VPS de Contabo con Ubuntu 24.04, 6 núcleos y 11 GB de RAM.

**No es un servidor dedicado.** Aloja también sitios, correo y aplicaciones de
otros proyectos. Todo lo que se haga acá puede afectar a terceros, así que
ningún cambio de puertos, proxy o certificados es rutinario.

> **Los datos concretos —IP, credenciales, dominios vecinos, puertos ocupados—
> viven en `/etc/clasificados/INFRAESTRUCTURA.md` en el propio servidor, no en
> este repositorio.** Este repositorio es público: publicar acá el mapa de una
> máquina que aloja producción de terceros sería exponer información que no es
> nuestra.

## La convención que ya existe

```txt
Internet :443
   └─ LiteSpeed (CyberPanel)        termina TLS, gestiona certificados
        └─ vhost con reverse proxy → 127.0.0.1:<puerto>
             └─ contenedor (construido y corrido por Coolify)
```

Coolify **no** tiene Traefik ni Caddy levantados: su proxy está desactivado
porque LiteSpeed es dueño de los puertos 80 y 443. Cada aplicación se publica en
un puerto de loopback y CyberPanel la expone.

Otras aplicaciones ya ocupan varios puertos de loopback; la lista está en el
documento de infraestructura del servidor. Este proyecto usa **`3020`**
(`APP_PORT`).

> No cambies esto por «lo que dice el PRD». Levantar Traefik en 80/443 tumba
> los seis dominios que ya sirve LiteSpeed.

## Antes de desplegar

1. **Dominio canónico:** `https://clasificadoscolombia.co` — decidido y en
   producción desde 2026-08-18.
2. **Claves de Turnstile** del dominio real. Con las de prueba el formulario de
   denuncias acepta cualquier cosa; sin ninguna, rechaza todo.
3. **Memoria.** Comprobar que hay margen antes de construir:
   ```bash
   free -h        # buscar al menos 3 GB disponibles
   ```
   El 2026-08-18 un proceso huérfano consumía 5.3 GB y el swap estaba al 100%.
   Se resolvió, pero conviene mirar: un build de Next pica entre 2 y 4 GB.

## Despliegue

### 1 · Aplicación en Coolify

Crear un recurso *Docker Compose* apuntando a este repositorio. Coolify
construye la imagen con el `Dockerfile` y levanta `docker-compose.yml`.

Variables de entorno (en los secretos de Coolify, nunca en el repositorio):

```bash
NEXT_PUBLIC_SERVER_URL=https://<dominio>
APP_PORT=3020

POSTGRES_USER=clasificados_app        # nunca superusuario
POSTGRES_PASSWORD=<generar>
POSTGRES_DB=clasificados

PAYLOAD_SECRET=<openssl rand -base64 48>
MEILI_MASTER_KEY=<openssl rand -base64 32>
MEILI_INDEXER_KEY=

TURNSTILE_SECRET_KEY=<clave real>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<clave real>
```

El compose falla ruidosamente si falta cualquiera de las marcadas con `:?`. Es
deliberado: un despliegue con una variable vacía es peor que uno que no arranca.

#### ⚠ `NEXT_PUBLIC_SERVER_URL` va como *build argument*, no solo como entorno

Todo lo que empieza por `NEXT_PUBLIC_` **se hornea en el bundle del navegador
durante el build**. Ponerlo únicamente como variable de entorno en tiempo de
ejecución no sirve para el código que corre en el cliente.

En Coolify, en la sección de *Build Arguments* del recurso:

```txt
NEXT_PUBLIC_SERVER_URL=https://<dominio>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<clave real>
```

Hoy ningún componente del cliente lo lee —solo se valida— así que una imagen
construida con el valor por defecto arranca igual. **Eso deja de ser cierto en
F16**, cuando las URL canónicas y el structured data empiecen a usarlo. Si en
ese momento la imagen se construyó con `localhost`, los canonical van a
apuntar a `localhost` y nadie lo va a notar hasta ver el sitio en Search
Console.

Consecuencia operativa: **la imagen es específica del dominio.** No se reutiliza
la misma entre staging y producción.

### 2 · Migraciones

**Nunca automáticas al arrancar.** Un contenedor que migra al iniciar migra otra
vez en cada reinicio y en cada réplica.

```bash
docker compose --profile tools run --rm migrate
```

Es un contenedor de un solo uso: corre, migra y sale. Está detrás de un
*profile*, así que `docker compose up` nunca lo levanta.

> **No sirve `docker compose exec app node node_modules/payload/bin.js migrate`.**
> La imagen de runtime es la salida *standalone* de Next: un subconjunto trazado
> con exactamente lo que toca `server.js`. La CLI de Payload no está ahí, y el
> comando falla con `MODULE_NOT_FOUND`. Por eso existe la etapa `migrator`, que
> se construye desde `deps` —dependencias y config, sin compilar la app—.

Orden obligatorio: **backup → migración → deploy → health → smoke test.**

Verificado localmente el 2026-08-18: la migración inicial se aplica en 464 ms
desde el contenedor, y `readiness` pasa de 503 a 200 después.

### 3 · Vhost en CyberPanel

Crear el sitio para el dominio en CyberPanel, emitir el certificado, y añadir a
`/usr/local/lsws/conf/vhosts/<dominio>/vhost.conf`:

```
context / {
  type                    proxy
  handler                 http://127.0.0.1:3020
  addDefaultCharset       off
}
```

Y reiniciar LiteSpeed:

```bash
systemctl restart lsws
```

Copiar el patrón exacto de un vhost que ya funcione en ese servidor, en vez de
escribirlo de memoria.

### 4 · Contenido inicial

```bash
docker compose exec app node node_modules/payload/bin.js run src/search/reindex.ts
```

El índice de Meilisearch es derivado: si se pierde, se reconstruye con eso. Por
eso no entra en los backups.

## Probar el stack en local

```bash
docker compose --env-file <archivo> -p prueba up -d --build
docker compose --env-file <archivo> -p prueba --profile tools run --rm migrate
curl -s localhost:3020/api/health/ready
```

> **Parar el stack antes de reconstruir.** En una VM de Docker con poca memoria
> —Colima por defecto— tener los tres contenedores arriba y compilar Next a la
> vez termina con el build muerto por OOM (`exit code 137`). En el servidor no
> aplica: Coolify construye con la versión anterior corriendo y ahí hay margen
> de sobra.

## Estado actual (2026-08-18)

Desplegado y verificado en `https://clasificadoscolombia.co`:

```txt
/                200      /api/health/live    200
/admin           200      /api/health/ready   200
/denunciar       200      TLS                 válido
/buscar          200      CSP · HSTS          presentes
```

Los secretos viven en `/etc/clasificados/env.production` (`600`), **fuera** de
`/opt/clasificados` — un `rsync --delete` los borró la primera vez por estar
dentro del directorio sincronizado.

La base de producción está vacía a propósito: no se siembra contenido DEMO en
producción. La portada muestra su estado vacío hasta que la redacción publique.

### Cloudflare

```txt
clasificadoscolombia.co       SIN proxy (nube gris) → directo al origen
www.clasificadoscolombia.co   CON proxy (nube naranja)
```

Recomendado: activar el proxy también en el ápex, que es el dominio canónico y
hoy no pasa por el WAF. Y decidir una redirección entre ápex y `www`, o quedan
dos rutas al mismo sitio.

### Pendiente antes de anunciar

**Claves reales de Turnstile.** Hoy están las de prueba de Cloudflare, que
siempre pasan: el formulario de `/denunciar` funciona pero **no tiene
protección real contra spam**. Se cambian en
`/etc/clasificados/env.production` y hace falta reconstruir, porque
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` se hornea en el bundle.

## Verificación posterior

```bash
curl -sf https://<dominio>/api/health/live    # proceso vivo
curl -sf https://<dominio>/api/health/ready   # base alcanzable
curl -sI https://<dominio> | grep -i content-security-policy
```

Y a mano: portada, un artículo, una búsqueda, el panel en `/admin`, y el
formulario de `/denunciar`.

## Volúmenes

```txt
clasificados_prod_postgres
clasificados_prod_meili
clasificados_prod_media
```

El infijo `_prod_` no es decorativo. Estos nombres coincidían al principio con
los de `docker-compose.dev.yml`, y la consecuencia apareció enseguida:
Meilisearch se negaba a arrancar con `Resource temporarily unavailable` porque
dos instancias peleaban por un mismo directorio LMDB. La mitad silenciosa de ese
error es peor: **el stack de producción se habría conectado a la base de
desarrollo y habría parecido que funcionaba.**

## Puertos que nunca se publican

```txt
5432   Postgres
7700   Meilisearch
```

No tienen `ports:` en el compose. Si algún día aparece uno, es un error.

## Rollback

Coolify guarda los despliegues anteriores: se revierte desde su interfaz.

**Una migración no se revierte sola.** Si el despliegue fallido incluyó una,
restaurar el backup de Postgres es el camino, no `migrate:down`.

## Backups

| Qué | Cómo | Por qué |
| --- | --- | --- |
| Postgres | `pg_dump` diario, fuera del servidor | Es la fuente de verdad |
| `media` | Copia del volumen | Los originales no se regeneran |
| Meilisearch | **No se respalda** | Se reconstruye con `search:reindex` |

Un backup que nunca se restauró no es un backup. Probar la restauración en
local al menos una vez.
