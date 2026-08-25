# Runbook: Rotación de Secretos y Checklist de Lanzamiento

Clasificados Colombia · Plataforma Editorial Digital

---

## 1. Procedimiento de Rotación de Secretos

Todos los secretos se gestionan en las variables de entorno de **Coolify** en el servidor de producción (o en el archivo `.env` en desarrollo local). Nunca deben commitearse en Git.

### 1.1 `PAYLOAD_SECRET` (Clave de cifrado de sesiones Payload)
* **Cuándo rotar:** Compromiso sospechado o periódicamente cada 6 meses.
* **Impacto:** Invalida todas las sesiones activas de usuarios en `/admin` (obliga a volver a iniciar sesión). No afecta contraseñas ni contenido.
* **Comando para generar nuevo secreto:**
  ```bash
  openssl rand -base64 48
  ```
* **Aplicación:** Actualizar `PAYLOAD_SECRET` en Coolify y redesplegar el servicio.

### 1.2 `DATABASE_URL` / `POSTGRES_PASSWORD`
* **Cuándo rotar:** Compromiso o cambio de credenciales en base de datos.
* **Impacto:** Requiere actualizar el usuario en PostgreSQL y la variable de conexión al mismo tiempo para evitar caída de servicio.
* **Comando:**
  ```sql
  -- En postgres (clasificados_prod)
  ALTER USER clasificados_app WITH PASSWORD 'NUEVA_CONTRASENA_SEGURA';
  ```
* **Aplicación:** Actualizar `DATABASE_URL` y `POSTGRES_PASSWORD` en Coolify y reiniciar contenedor.

### 1.3 `MEILI_MASTER_KEY`
* **Cuándo rotar:** Exposición accidental de la clave del motor de búsqueda.
* **Comando para generar:**
  ```bash
  openssl rand -base64 32
  ```
* **Aplicación:** Actualizar `MEILI_MASTER_KEY` en Coolify. Si se rotó, reiniciar el servicio `meilisearch` y ejecutar reindexación si corresponde (`pnpm search:reindex`).

### 1.4 Cloudflare Turnstile (`TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY`)
* **Cuándo rotar:** Rotación en el panel de Cloudflare (sección Turnstile).
* **Impacto:** `NEXT_PUBLIC_TURNSTILE_SITE_KEY` debe definirse tanto en variables como en *Build Arguments* en Coolify para hornearse en el bundle de cliente.

### 1.5 SMTP / Resend (`SMTP_PASS`)
* **Cuándo rotar:** Generación de nueva API key en Resend (`resend.com`).
* **Aplicación:** Actualizar `SMTP_PASS` en Coolify y reiniciar.

---

## 2. Checklist de Lanzamiento (Go-Live)

| Paso | Verificación | Estado |
| :--- | :--- | :---: |
| **1. Desbloquear Indexación** | Cambiar `ALLOW_INDEXING=true` en Coolify y redesplegar para emitir cabeceras `index, follow` y permitir rastreo en `/robots.txt`. | Pendiente Go-Live |
| **2. Dominio y TLS** | Certificado SSL/TLS emitido y renovado en LiteSpeed/CyberPanel con HSTS activo (`max-age=63072000`). | Verificado |
| **3. CSP y Encabezados** | Cabeceras de seguridad activas (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, CSP estricta en público y permisiva en `/admin`). | Verificado |
| **4. Google News & SEO** | Rutas `/sitemap.xml` y `/news-sitemap.xml` respondiendo XML válido con piezas publicadas recientes (<48h para noticias). | Verificado |
| **5. Cuentas de Redacción** | Contraseñas provisionales de `admin` y `editor` cambiadas por credenciales definitivas y seguras. | Recomendado |
| **6. Prevención de Fugas** | Verificado que `/api/search`, `/buscar` y las APIs públicas nunca devuelven borradores, piezas archivadas ni denuncias ciudadanas. | Verificado |
| **7. Canal de Denuncias** | Formulario `/denunciar` funcional con Turnstile en producción, almacenamiento sin datos de contacto si se marca anónimo. | Verificado |
| **8. Backups Automatizados** | Cron de volcado de base de datos PostgreSQL activo en el VPS hacia directorio seguro `/root/respaldos/`. | Verificado |
