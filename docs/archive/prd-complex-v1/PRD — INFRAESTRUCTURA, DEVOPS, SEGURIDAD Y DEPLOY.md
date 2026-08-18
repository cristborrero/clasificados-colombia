# PRD — INFRAESTRUCTURA, DEVOPS, SEGURIDAD Y DEPLOY
## Clasificados Colombia · Contabo + Coolify
### Documento Nº 4

---

# 1. Objetivo

Construir una infraestructura de producción robusta, auditable y mantenible para **Clasificados Colombia**, desplegada sobre servidor propio en Contabo y orquestada mediante Coolify.

La arquitectura debe priorizar:

- soberanía de datos;
- seguridad;
- separación de servicios;
- bajo costo operativo;
- backups verificables;
- observabilidad;
- despliegues repetibles;
- posibilidad de recuperación;
- rendimiento consistente;
- mínima exposición pública;
- facilidad de mantenimiento.

No se busca una infraestructura “enterprise por apariencia”.

Se busca una infraestructura pequeña, clara y correctamente aislada.

---

# 2. Plataforma base

Servidor:

```txt
Contabo VPS / VDS
12 GB RAM
Linux
Docker
Coolify
```

Coolify será la capa de despliegue y administración.

No utilizar paneles adicionales que dupliquen la función de Coolify.

---

# 3. Arquitectura general

Servicios principales:

```txt
Internet
   │
   ▼
Reverse Proxy / TLS
   │
   ├── clasificadoscolombia.com
   │      │
   │      ▼
   │   Next.js + Payload
   │      │
   │      ├── PostgreSQL
   │      ├── Meilisearch
   │      └── MinIO
   │
   └── denuncias.clasificadoscolombia.com
          │
          ▼
      Servicio Denuncias
          │
          ▼
      DB Denuncias
```

El servicio de denuncias debe ser un sistema separado.

---

# 4. Principio crítico

No confundir:

```txt
mismo servidor
```

con:

```txt
misma zona de confianza
```

Aunque varios servicios vivan en el mismo Contabo, deben estar aislados mediante:

- redes Docker;
- credenciales distintas;
- bases distintas;
- secrets distintos;
- políticas distintas;
- endpoints distintos;
- permisos mínimos.

---

# 5. SERVICIOS DE PRODUCCIÓN

Crear al menos:

```txt
web
postgres
meilisearch
minio
denuncias-app
denuncias-db
```

Opcionales si se justifican:

```txt
redis
backup-worker
monitoring
```

No introducir servicios sin una necesidad concreta.

---

# 6. WEB

Servicio:

```txt
web
```

Contiene:

```txt
Next.js
Payload CMS
Payload Admin
frontend editorial
API Payload
```

Todo en el mismo proyecto/repositorio.

No desplegar Payload como backend separado salvo razón técnica futura.

---

# 7. PAYLOAD + NEXT.JS

Producción:

```txt
Next.js standalone output
Node.js
pnpm
```

Usar imagen Docker multistage.

Objetivo:

- reducir imagen final;
- separar build/runtime;
- no incluir dependencias dev innecesarias.

---

# 8. NODE VERSION

Fijar una versión LTS compatible con la versión estable de Payload/Next.js utilizada.

No utilizar:

```txt
node:latest
```

Usar versión explícita.

Ejemplo conceptual:

```txt
node:22-alpine
```

siempre verificada contra requisitos actuales.

---

# 9. PNPM

Usar:

```txt
pnpm
```

Fijar versión mediante:

```txt
packageManager
```

en `package.json`.

No permitir que cada entorno instale una versión arbitraria.

---

# 10. LOCKFILE

`pnpm-lock.yaml`

debe incluirse en Git.

Build de producción:

```txt
pnpm install --frozen-lockfile
```

---

# 11. POSTGRESQL

Servicio:

```txt
postgres
```

Uso exclusivo para:

```txt
Payload CMS
contenido editorial
usuarios
roles
configuración
metadata
redirects
```

No almacenar allí datos del servicio de denuncias.

---

# 12. DATABASE SEPARATION

Crear:

```txt
clasificados_prod
```

y DB aparte:

```txt
denuncias_prod
```

Preferiblemente en instancias/containers distintos.

No utilizar una única base con schemas compartidos para ambos sistemas.

---

# 13. POSTGRES NETWORKING

Postgres principal:

NO debe publicar puerto `5432` a Internet.

Debe ser accesible únicamente desde la red Docker interna.

Correcto:

```txt
web → postgres:5432
```

Incorrecto:

```txt
Internet → server-ip:5432
```

---

# 14. POSTGRES USER

No conectar aplicación como superuser.

Crear usuario de aplicación:

```txt
clasificados_app
```

con permisos limitados a su DB.

Usuario administrativo separado.

---

# 15. DATABASE URL

Ejemplo conceptual:

```txt
postgresql://clasificados_app:SECRET@postgres:5432/clasificados_prod
```

Guardar exclusivamente en secrets/env de producción.

Nunca:

- commitear;
- imprimir en logs;
- exponer al navegador.

---

# 16. POSTGRES BACKUPS

Backups automáticos mediante:

```txt
pg_dump
```

como mínimo.

Frecuencia recomendada:

```txt
diario
```

Mantener:

```txt
7 diarios
4 semanales
6 mensuales
```

Ajustable según espacio disponible.

---

# 17. BACKUP ≠ VOLUME

Un volumen Docker no es un backup.

El backup debe vivir fuera del volumen activo.

Ideal:

```txt
servidor
→ backup cifrado
→ destino externo
```

---

# 18. OFFSITE BACKUP

Al menos una copia debe salir físicamente del VPS.

Opciones:

- otro VPS;
- storage S3 compatible externo;
- proveedor de backup;
- almacenamiento cifrado independiente.

No considerar seguro un sistema donde:

```txt
producción + backups
```

viven únicamente en el mismo disco.

---

# 19. RESTORE TEST

Mensualmente ejecutar prueba real:

```txt
backup
↓
restore
↓
database check
```

Un backup no probado es únicamente una hipótesis.

---

# 20. MINIO

Servicio:

```txt
minio
```

Uso:

documentos de evidencia.

No utilizarlo como simple carpeta de assets públicos sin control.

MinIO soporta API compatible con S3 y URLs presignadas para acceso temporal.

---

# 21. BUCKETS

Separar por nivel de acceso:

```txt
evidence-public
evidence-internal
evidence-restricted
```

No depender únicamente de metadata dentro de Payload.

La separación debe existir en storage/policy.

---

# 22. PUBLIC

`evidence-public`

Puede contener documentos explícitamente aprobados para publicación.

Aun así, preferir acceso controlado desde la aplicación.

---

# 23. INTERNAL

`evidence-internal`

Solo accesible por usuarios internos autorizados.

No URL pública permanente.

---

# 24. RESTRICTED

`evidence-restricted`

Nivel más sensible.

Acceso únicamente tras autorización backend.

Nunca exponer credenciales MinIO al cliente.

---

# 25. PRESIGNED URLS

Flujo:

```txt
Usuario autorizado
↓
Next.js server
↓
verifica permiso
↓
MinIO
↓
presigned URL
↓
expiración corta
```

Para restricted:

usar expiración muy corta.

Ejemplo:

```txt
60–300 segundos
```

según caso.

---

# 26. NO PERMANENT URL

Nunca almacenar una presigned URL en Payload.

Almacenar:

```txt
bucket
objectKey
classification
metadata
```

La URL se genera bajo demanda.

---

# 27. MINIO CREDENTIALS

Crear usuarios/policies separados.

Ejemplo:

```txt
web-public-reader
web-evidence-reader
backup-writer
admin
```

No usar root credentials dentro de la aplicación.

---

# 28. VERSIONING

Habilitar versioning en buckets de evidencia donde proceda.

Especialmente:

```txt
internal
restricted
```

MinIO requiere versioning para funciones de Object Lock.

---

# 29. OBJECT LOCK

Evaluar para documentos probatorios que deban conservarse inmutables.

No activar indiscriminadamente.

Usar únicamente si existe política clara de retención.

---

# 30. ENCRYPTION

Usar TLS en tránsito.

Para documentos altamente sensibles:

evaluar server-side encryption y/o cifrado adicional antes de almacenamiento.

No asumir que bucket privado equivale a cifrado.

---

# 31. MINIO NETWORK

API MinIO:

solo red interna.

Console MinIO:

NO debe exponerse públicamente sin protección.

Idealmente:

```txt
VPN / tunnel / admin-only domain
```

---

# 32. MINIO BACKUPS

La replicación o copia debe incluir:

```txt
objects
versions
metadata
```

Para evidencia importante, considerar backup externo independiente.

MinIO soporta replicación de buckets entre clusters, pero no debe sustituir automáticamente una estrategia de backup.

---

# 33. MEILISEARCH

Servicio:

```txt
meilisearch
```

Indexa únicamente contenido público.

Nunca:

```txt
drafts
internal
restricted
denuncias
```

---

# 34. MASTER KEY

Configurar:

```txt
MEILI_MASTER_KEY
```

larga y aleatoria.

Nunca operar Meilisearch en producción sin protección.

---

# 35. API KEYS

Crear keys separadas:

```txt
search-public
indexer
admin
```

Meilisearch permite limitar acciones e índices por API key.

---

# 36. PUBLIC SEARCH KEY

La key que llegue al navegador:

solo puede:

```txt
search
```

sobre índices públicos.

Nunca permitir:

```txt
documents.add
documents.delete
indexes.*
keys.*
```

---

# 37. INDEXER KEY

Solo backend.

Permisos:

```txt
documents.add
documents.update
documents.delete
settings.*
```

sobre índices concretos.

---

# 38. MEILISEARCH NETWORK

No publicar Meilisearch directamente a Internet.

Ideal:

```txt
web → meilisearch
```

por network interno.

---

# 39. MEILISEARCH BACKUPS

Generar periódicamente:

```txt
dumps
```

o snapshots según estrategia.

Meilisearch dispone de APIs específicas para dumps y snapshots.

---

# 40. REINDEXABILITY

La búsqueda debe ser reconstruible.

Fuente canónica:

```txt
Payload/Postgres
```

Meilisearch es derivado.

Si se pierde:

```txt
recreate index
↓
reindex Payload content
```

No tratar el search index como fuente de verdad.

---

# 41. SERVICIO DE DENUNCIAS

Debe ser tratado como sistema de riesgo elevado.

Arquitectura:

```txt
denuncias-app
denuncias-db
```

Separado de:

```txt
web
postgres
payload
```

---

# 42. NO FOREIGN KEY

No debe existir foreign key entre:

```txt
denuncias-db
```

y:

```txt
clasificados_prod
```

Tal como define la arquitectura vigente.

---

# 43. NO SHARED DB USER

Nunca compartir:

```txt
DATABASE_USER
DATABASE_PASSWORD
```

entre ambas aplicaciones.

---

# 44. NO SHARED NETWORK BY DEFAULT

Idealmente:

```txt
denuncias-network
```

separada de:

```txt
editorial-network
```

Permitir únicamente comunicaciones explícitamente requeridas.

---

# 45. TRANSFERENCIA DE CASOS

Si una denuncia termina convirtiéndose en investigación:

no enlazar directamente DBs.

Usar proceso explícito:

```txt
denuncia
↓
revisión humana
↓
export controlado
↓
nuevo registro editorial
```

---

# 46. IDENTIFICADORES

Nunca exponer IDs incrementales de denuncias.

Usar UUID o identificadores no predecibles.

---

# 47. LOGGING DE DENUNCIAS

Minimizar logs.

No registrar:

- cuerpo de denuncia;
- nombres;
- emails;
- teléfonos;
- archivos;
- tokens.

Logs técnicos deben limitarse a lo necesario.

---

# 48. IP ADDRESSES

No conservar IPs innecesariamente.

Si se requieren temporalmente por seguridad/rate limiting:

definir:

- propósito;
- retención;
- eliminación.

---

# 49. UPLOADS DE DENUNCIAS

Nunca ejecutar ni interpretar archivos.

Aplicar:

- límites de tamaño;
- tipos permitidos;
- MIME validation;
- antivirus/malware scanning si se implementa;
- nombres aleatorios.

---

# 50. QUARANTINE

Idealmente:

```txt
upload
↓
quarantine
↓
scan
↓
approved storage
```

No entregar un upload directamente a periodistas desde almacenamiento activo sin controles.

---

# 51. DOMINIOS

Ejemplo:

```txt
clasificadoscolombia.com
www.clasificadoscolombia.com
denuncias.clasificadoscolombia.com
```

Admin:

evaluar:

```txt
admin.clasificadoscolombia.com
```

o:

```txt
clasificadoscolombia.com/admin
```

---

# 52. ADMIN EXPOSURE

Payload Admin debe estar protegido adicionalmente.

Mínimo:

- autenticación robusta;
- rate limit;
- MFA si disponible/implementado;
- sesiones seguras.

Ideal:

- Cloudflare Access / VPN / allowlist si el workflow lo permite.

---

# 53. TLS

Coolify/reverse proxy debe gestionar certificados TLS.

Todo tráfico público:

```txt
HTTPS
```

Forzar redirect desde HTTP.

---

# 54. SECURITY HEADERS

Next.js debe servir:

```txt
Strict-Transport-Security
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
```

Usar CSP específica.

No:

```txt
script-src *
```

---

# 55. CSP

Diseñar allowlist según integraciones reales.

Ejemplo conceptual:

```txt
default-src 'self'
img-src 'self' ...
script-src 'self' ...
connect-src 'self' ...
```

No copiar una CSP genérica sin probar funcionalidad.

---

# 56. SECRETS

Guardar en Coolify:

```txt
PAYLOAD_SECRET
DATABASE_URL
MEILI_MASTER_KEY
MEILI_INDEXER_KEY
MINIO_ACCESS_KEY
MINIO_SECRET_KEY
DENUNCIAS_DATABASE_URL
```

Coolify soporta variables por equipo, proyecto y entorno.

---

# 57. REQUIRED ENV VARS

En Docker Compose utilizar sintaxis de variable requerida donde sea apropiado.

Ejemplo conceptual:

```txt
${PAYLOAD_SECRET:?PAYLOAD_SECRET is required}
```

Coolify soporta esta validación en Compose.

---

# 58. NO BUILD-TIME SECRETS

No pasar secrets sensibles como:

```txt
ARG
```

si terminan embebidos en layers de imagen.

Distinguir:

```txt
build-time public config
runtime secrets
```

---

# 59. PUBLIC VARIABLES

Solo variables con prefijo:

```txt
NEXT_PUBLIC_
```

si realmente pueden exponerse al browser.

Nunca:

```txt
NEXT_PUBLIC_DATABASE_URL
NEXT_PUBLIC_MINIO_SECRET
```

---

# 60. GIT

Repositorio privado recomendado.

Branches:

```txt
main
develop
feature/*
hotfix/*
```

o flujo equivalente simple.

No diseñar GitFlow excesivamente complejo para equipo pequeño.

---

# 61. ENVIRONMENTS

Mínimo:

```txt
production
staging
```

Staging debe usar:

- DB separada;
- Meilisearch separado;
- bucket separado;
- secrets distintos.

Nunca apuntar staging a producción.

---

# 62. STAGING DATA

No copiar datos sensibles de producción indiscriminadamente.

Especialmente:

```txt
usuarios
evidencia restricted
denuncias
```

Preferir datos seed/sanitizados.

---

# 63. CI

Antes de deploy:

```txt
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

No desplegar si build/typecheck falla.

---

# 64. DATABASE MIGRATIONS

Payload migrations deben formar parte del deploy.

Nunca ejecutar cambios destructivos sin revisar.

Flujo:

```txt
backup
↓
migration
↓
health check
↓
traffic
```

---

# 65. MIGRATION SAFETY

Cambios peligrosos:

- drop column;
- rename;
- type change;
- constraint change.

Preferir despliegues compatibles hacia atrás.

Ejemplo:

```txt
add new field
↓
deploy
↓
migrate data
↓
switch code
↓
remove old field later
```

---

# 66. DOCKER COMPOSE

Organizar producción mediante Compose cuando aporte claridad.

Coolify soporta servicios multi-contenedor, volúmenes, variables y networking dentro de Docker Compose.

---

# 67. NETWORKS

Definir:

```txt
public
editorial-internal
evidence-internal
denuncias-internal
```

Ejemplo:

```txt
web
 ├── public
 ├── editorial-internal
 └── evidence-internal

postgres
 └── editorial-internal

meilisearch
 └── editorial-internal

minio
 └── evidence-internal

denuncias-app
 ├── public
 └── denuncias-internal

denuncias-db
 └── denuncias-internal
```

---

# 68. EXPOSE VS PORTS

Servicios internos:

usar:

```txt
expose
```

o networking de Docker.

No:

```txt
ports:
  - "5432:5432"
```

salvo necesidad administrativa temporal y controlada.

---

# 69. HEALTH CHECKS

Cada servicio debe tener health check.

Coolify utiliza health checks para routing y rolling updates.

---

# 70. WEB HEALTH

Crear endpoint:

```txt
/api/health
```

Debe verificar:

```txt
app alive
db reachable
```

No realizar tests costosos en cada request.

---

# 71. READINESS VS LIVENESS

Separar conceptualmente:

```txt
liveness
```

¿proceso vivo?

```txt
readiness
```

¿puede recibir tráfico?

Si la infraestructura lo permite, implementar endpoints separados.

---

# 72. DEPLOYMENTS

Objetivo:

```txt
low-downtime
```

o:

```txt
zero-downtime
```

cuando sea razonable.

Coolify soporta rolling updates cuando los health checks están correctamente configurados.

---

# 73. GRACEFUL SHUTDOWN

La app debe manejar:

```txt
SIGTERM
```

correctamente.

Durante deploy:

- dejar de aceptar tráfico;
- completar requests en curso;
- cerrar conexiones.

---

# 74. COOLIFY

Coolify debe administrar:

- deploy;
- TLS;
- variables;
- dominios;
- health;
- logs básicos;
- storage volumes.

No convertir Coolify en única fuente de backup.

---

# 75. PERSISTENT STORAGE

Persistir:

```txt
postgres data
minio data
meilisearch data
```

No depender de filesystem efímero del container.

---

# 76. VOLUME NAMES

Usar nombres explícitos:

```txt
clasificados_postgres_data
clasificados_minio_data
clasificados_meili_data
```

Evitar volumes anónimos.

---

# 77. SERVER RESOURCE BUDGET

Con 12 GB RAM, no permitir que cada servicio utilice memoria sin límite.

Asignar presupuesto inicial.

Ejemplo orientativo:

```txt
Host + Docker + Coolify    1.5–2 GB
Next/Payload               2–3 GB
Postgres                   2–3 GB
Meilisearch                1–2 GB
MinIO                      1–2 GB
Denuncias                  0.5–1 GB
Reserva                    1–2 GB
```

Ajustar según métricas reales.

---

# 78. MEMORY

No configurar límites demasiado agresivos antes de medir.

Pero sí proteger contra un servicio que consuma todo el host.

Usar:

```txt
memory limits
restart policies
```

---

# 79. SWAP

Configurar swap razonable como protección ante picos.

No utilizar swap como sustituto de RAM.

Monitorear swapping sostenido.

---

# 80. CPU

Medir:

- Next.js builds;
- Meilisearch indexing;
- Postgres queries;
- MinIO uploads.

Evitar ejecutar tareas pesadas simultáneamente sin control.

---

# 81. BUILD SERVER

Si los builds consumen demasiados recursos:

evaluar build externo/CI y desplegar imagen preparada.

No es requisito inicial.

---

# 82. LOGGING

Logs estructurados.

Campos recomendados:

```txt
timestamp
level
service
requestId
route
status
duration
```

No incluir secrets.

---

# 83. REQUEST ID

Generar/capturar:

```txt
requestId
```

para correlacionar errores entre servicios.

---

# 84. ERROR MONITORING

Implementar herramienta de error monitoring.

Puede ser:

- Sentry;
- GlitchTip self-hosted;
- equivalente.

Registrar:

- excepción;
- stack;
- release;
- requestId.

No PII innecesaria.

---

# 85. METRICS

Medir:

```txt
CPU
RAM
disk
disk I/O
container restarts
HTTP latency
5xx
Postgres connections
DB size
Meilisearch size
MinIO size
```

---

# 86. UPTIME

Configurar monitor externo.

Debe comprobar:

```txt
homepage
/api/health
denuncias health
```

desde fuera del propio VPS.

---

# 87. ALERTING

Alertas mínimas:

```txt
site down
high 5xx rate
disk > 80%
backup failure
database unreachable
TLS expiry issue
```

Evitar alertas inútiles por cada evento menor.

---

# 88. DISK

Monitor crítico.

Postgres + MinIO + backups + Docker images pueden llenar disco silenciosamente.

Configurar alertas:

```txt
70%
80%
90%
```

con niveles diferentes.

---

# 89. DOCKER CLEANUP

Definir mantenimiento seguro de:

- imágenes antiguas;
- build cache;
- logs.

Nunca ejecutar:

```txt
docker system prune -a
```

automáticamente sin evaluar impacto.

---

# 90. LOG ROTATION

Configurar límites.

Los logs Docker no deben crecer sin límite.

Ejemplo:

```txt
max-size
max-file
```

---

# 91. RATE LIMITING

Aplicar especialmente en:

```txt
login
password reset
search
forms
denuncias
document access
```

Puede realizarse:

- reverse proxy;
- app;
- Redis si posteriormente se necesita estado distribuido.

---

# 92. REDIS

No añadir Redis inicialmente solo porque “es estándar”.

Introducirlo únicamente si se necesita para:

- rate limit distribuido;
- queues;
- cache compartido;
- sessions específicas;
- background jobs.

---

# 93. BACKGROUND JOBS

Tareas candidatas:

```txt
Meilisearch indexing
OG generation
document processing
email
backups
malware scanning
```

No ejecutar trabajos pesados dentro del request web.

---

# 94. QUEUE

Si los jobs aumentan:

introducir cola.

No obligatorio en v1.

---

# 95. PAYLOAD AUTH

Aplicar access control en código.

Cada colección debe definir:

```txt
read
create
update
delete
```

según rol.

No confiar únicamente en ocultar botones del Admin UI.

---

# 96. ADMIN ACCOUNTS

No compartir usuarios.

Cada persona:

```txt
cuenta individual
rol individual
```

Deshabilitar inmediatamente al abandonar el equipo.

---

# 97. PASSWORDS

Requerir passwords robustas.

No almacenar contraseñas manualmente.

Dejar hashing al sistema de autenticación.

---

# 98. MFA

Implementar o integrar MFA para usuarios de alto privilegio cuando sea viable.

Especialmente:

```txt
Administrator
Editor in Chief
```

---

# 99. SESSION COOKIES

Configurar:

```txt
HttpOnly
Secure
SameSite
```

según arquitectura.

No almacenar tokens administrativos sensibles en localStorage.

---

# 100. CSRF

Proteger endpoints mutables según mecanismo de auth utilizado.

No asumir que API privada elimina CSRF automáticamente.

---

# 101. CORS

Allowlist estricta.

No:

```txt
Access-Control-Allow-Origin: *
```

en APIs autenticadas.

---

# 102. FILE SIZE LIMITS

Definir límites explícitos.

Ejemplo:

```txt
images: 15 MB
documents: 100 MB
```

Valores finales según necesidades reales.

No aceptar uploads ilimitados.

---

# 103. MIME VALIDATION

Validar:

- extensión;
- MIME;
- contenido cuando sea posible.

No confiar únicamente en filename.

---

# 104. IMAGE PROCESSING

Procesar imágenes de forma server-side.

Generar tamaños derivados.

No modificar original de forma irreversible.

---

# 105. DEPENDENCIES

Usar herramientas de actualización y auditoría.

Revisar:

```txt
pnpm audit
Dependabot/Renovate
```

con criterio.

No actualizar automáticamente major versions en producción.

---

# 106. CONTAINER IMAGES

Fijar tags.

No:

```txt
postgres:latest
```

Sí:

```txt
postgres:17.x
```

o versión estable elegida y documentada.

---

# 107. DATABASE UPGRADE

Postgres major upgrade:

tratar como operación planificada.

Siempre:

```txt
backup
restore test
upgrade plan
rollback plan
```

---

# 108. MINIO VERSION

Igual:

no actualizar almacenamiento crítico de forma automática sin revisar release notes y backups.

---

# 109. MEILISEARCH VERSION

Las upgrades pueden requerir revisión de compatibilidad de dumps/snapshots.

Documentar versión exacta.

---

# 110. FIREWALL

En host exponer únicamente lo requerido.

Normalmente:

```txt
22
80
443
```

y restringir SSH cuando sea posible.

No exponer:

```txt
5432
7700
9000
9001
```

a Internet.

---

# 111. SSH

Preferir:

```txt
SSH keys
```

Deshabilitar password login si la administración lo permite.

No permitir root SSH directo cuando no sea necesario.

---

# 112. FAIL2BAN

Evaluar Fail2ban u otra protección en host.

No sustituye seguridad de aplicación.

---

# 113. OS UPDATES

Aplicar security updates regularmente.

No dejar upgrades críticos indefinidamente.

Programar mantenimiento.

---

# 114. HOST ACCESS

Muy pocas personas deben tener acceso SSH.

Un periodista/editor normalmente NO necesita acceso al servidor.

---

# 115. COOLIFY ACCESS

Separar roles administrativos.

Activar medidas de seguridad disponibles.

No compartir una cuenta única.

---

# 116. BACKUP ENCRYPTION

Backups offsite sensibles:

cifrar antes de salida o usar almacenamiento con cifrado sólido.

Las claves de backup no deben vivir únicamente junto al backup.

---

# 117. DISASTER SCENARIOS

Preparar runbooks para:

```txt
servidor perdido
Postgres corrupto
MinIO perdido
Meilisearch perdido
deploy roto
dominio/TLS roto
credencial comprometida
```

---

# 118. RTO

Definir objetivo inicial.

Ejemplo:

```txt
RTO <= 4 horas
```

para portal principal.

---

# 119. RPO

Ejemplo inicial:

```txt
RPO <= 24 horas
```

basado en backup diario.

Para investigaciones activas puede requerirse menor.

---

# 120. MEILISEARCH DISASTER

No es crítico si hay Payload/Postgres.

Flujo:

```txt
new instance
↓
settings
↓
full reindex
```

---

# 121. MINIO DISASTER

Sí es crítico.

Los documentos pueden ser irreemplazables.

Por eso:

```txt
backup + versioning + offsite
```

tienen prioridad.

---

# 122. POSTGRES DISASTER

Restaurar:

```txt
latest verified backup
```

Luego validar:

- usuarios;
- artículos;
- relaciones;
- migraciones.

---

# 123. RELEASE STRATEGY

Versión:

```txt
Git SHA
```

o semver.

Cada deploy debe poder identificarse.

Mostrar release en logs/monitoring.

---

# 124. ROLLBACK

Debe ser posible volver a imagen previa.

Pero si hubo migration destructiva:

rollback de código puede no ser suficiente.

Por eso las migrations deben diseñarse para compatibilidad.

---

# 125. FEATURE FLAGS

No añadir plataforma externa inicialmente.

Puede bastar configuración en Payload/env para features experimentales.

---

# 126. DEPLOY PREVIEW

Pull request previews son deseables si recursos lo permiten.

Pero nunca conectados a datos de producción sensibles.

---

# 127. DOMAIN ENVIRONMENTS

Ejemplo:

```txt
clasificadoscolombia.com → production
staging.clasificadoscolombia.com → staging
```

Proteger staging con auth.

---

# 128. SEARCH ENGINE INDEXING STAGING

Staging:

```txt
noindex
```

y preferiblemente acceso restringido.

No confiar solo en robots.txt.

---

# 129. EMAIL

Si Payload necesita email transaccional:

usar SMTP/proveedor dedicado.

Nunca montar un servidor de correo completo en el mismo VPS inicialmente.

---

# 130. DNS

Usar proveedor DNS confiable.

Configurar:

- A/AAAA;
- CAA;
- SPF;
- DKIM;
- DMARC si hay email.

---

# 131. CDN / PROXY

Puede utilizarse Cloudflare delante del sitio si se decide.

Beneficios potenciales:

- DNS;
- CDN;
- WAF;
- DDoS mitigation;
- bot protection.

Pero no es obligatorio para arrancar.

---

# 132. CACHE

No cachear indiscriminadamente:

```txt
/admin
authenticated API
presigned URL endpoints
preview
```

Sí considerar cache para:

```txt
public articles
images
static assets
```

---

# 133. PUBLIC ASSETS

Servir con:

```txt
Cache-Control
```

adecuado.

Assets fingerprinted:

```txt
immutable
```

cuando corresponda.

---

# 134. DATABASE CONNECTIONS

Con un único servidor Node, mantener pool razonable.

No configurar 100 conexiones por proceso sin necesidad.

Medir:

```txt
active connections
idle
wait
```

---

# 135. PGBOUNCER

No introducir PgBouncer inicialmente si no existe problema de conexiones.

Agregarlo solo si métricas lo justifican.

---

# 136. MAINTENANCE MODE

Crear forma de mostrar:

```txt
maintenance
```

sin destruir admin/backend.

Debe devolver status apropiado.

---

# 137. INCIDENT RESPONSE

Definir:

```txt
detect
contain
investigate
recover
document
```

Para incidentes de seguridad.

---

# 138. SECRET ROTATION

Toda credencial debe poder rotarse.

Especialmente:

```txt
Payload secret
DB passwords
MinIO keys
Meili keys
admin tokens
```

---

# 139. COMPROMISED SECRET

Runbook:

```txt
revoke
rotate
redeploy
audit logs
verify access
```

No simplemente cambiar `.env`.

---

# 140. AUDIT LOG

Registrar acciones administrativas relevantes:

```txt
publish
unpublish
role change
user creation
document classification change
restricted access
```

Especialmente útil para medios de investigación.

---

# 141. RESTRICTED DOCUMENT ACCESS LOG

Para documentos restricted:

registrar:

```txt
user
document
timestamp
action
```

No registrar el contenido.

---

# 142. PRESIGNED DOWNLOAD LOG

Flujo:

```txt
authorization check
↓
audit event
↓
generate URL
```

No generar URLs silenciosamente sin trazabilidad.

---

# 143. DOCUMENT CLASSIFICATION CHANGE

Cambio:

```txt
restricted → public
```

debe requerir permiso elevado.

Idealmente confirmación explícita.

---

# 144. PUBLICATION SECURITY

Publicar un artículo y desclasificar evidencia son acciones distintas.

No asumir:

```txt
publish article
= publish every attached document
```

---

# 145. SENSITIVE METADATA

Evitar que nombres internos de archivos revelen fuentes.

No:

```txt
juan-perez-whistleblower-original.pdf
```

Usar object keys neutros/UUID.

---

# 146. BACKUP OF DENUNCIAS

Estrategia completamente separada.

Más restrictiva.

Cifrada.

Retención definida según política legal/operativa.

No mezclar en dumps generales del CMS.

---

# 147. COOLIFY PROJECTS

Recomendación conceptual:

```txt
Project: Clasificados Colombia

Environment: Production
  web
  postgres
  meilisearch
  minio

Project: Denuncias
  denuncias-app
  denuncias-db
```

Separar claramente secrets y recursos.

---

# 148. COMPOSE VALIDATION

Antes de producción:

```txt
docker compose config
```

para validar configuración final.

---

# 149. DOCUMENTATION

Crear:

```txt
/docs/infrastructure/
```

con:

```txt
architecture.md
deploy.md
backups.md
restore.md
secrets.md
incident-response.md
minio.md
meilisearch.md
postgres.md
coolify.md
```

---

# 150. RUNBOOK DE DEPLOY

Ejemplo:

```txt
1. CI passes
2. backup if migration
3. deploy new image
4. run migration
5. readiness passes
6. switch traffic
7. smoke test
8. monitor errors
```

---

# 151. SMOKE TEST

Después de deploy:

comprobar:

```txt
homepage
article
admin login
Payload API
search
image delivery
health
```

No probar restricted documents con usuarios sin permiso.

---

# 152. DAILY OPERATIONS

Automatizar:

```txt
DB backup
backup status
disk monitoring
uptime
certificate monitoring
```

---

# 153. WEEKLY OPERATIONS

Revisar:

```txt
failed logins
disk growth
container restarts
5xx
backup integrity
dependency alerts
```

---

# 154. MONTHLY OPERATIONS

Realizar:

```txt
restore test
permission review
inactive account review
OS patch review
storage growth analysis
```

---

# 155. CAPACITY

Con 12 GB:

la arquitectura es válida para una primera etapa si se controla consumo.

Pero documentar umbrales de separación.

Ejemplo:

Mover Postgres a servidor independiente cuando:

- I/O compita consistentemente;
- RAM sea insuficiente;
- disponibilidad requiera aislamiento;
- volumen editorial aumente significativamente.

---

# 156. SCALE PATH

Orden probable de separación futura:

```txt
1. backups offsite
2. Postgres
3. MinIO
4. Meilisearch
5. application replicas
```

No escalar prematuramente.

---

# 157. SINGLE SERVER RISK

Reconocer explícitamente:

Contabo único = single point of failure.

Docker isolation NO elimina fallo de:

- host;
- disco;
- proveedor;
- red;
- kernel.

La mitigación es:

```txt
backups externos
restore probado
infra documentada
DNS controlado
```

---

# 158. INFRASTRUCTURE AS CODE

Guardar:

```txt
docker-compose.yml
Dockerfile
config templates
scripts
```

en Git.

No depender únicamente de configuración manual dentro de Coolify.

---

# 159. NO MANUAL SNOWFLAKE

Un servidor debe poder reconstruirse usando:

```txt
repo
secrets
backups
documentation
```

No mediante memoria del administrador.

---

# 160. PRINCIPIO FINAL

La seguridad de Clasificados Colombia no depende de tener muchas herramientas.

Depende de:

```txt
menos servicios públicos
menos privilegios
menos secretos compartidos
más aislamiento
más trazabilidad
más backups
más capacidad de recuperación
```

La infraestructura debe ser lo suficientemente simple para comprenderla completamente y lo suficientemente sólida para proteger un medio de investigación.

**Control propio no significa seguridad automática.  
Control propio significa responsabilidad total sobre la seguridad.**