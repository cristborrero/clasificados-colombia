# PRD — SERVICIO SEGURO DE DENUNCIAS
## Clasificados Colombia
### Documento Nº 6

---

# 1. Objetivo

Construir un servicio independiente para recibir:

- denuncias ciudadanas;
- documentos;
- fotografías;
- videos;
- audios;
- pistas;
- información sensible;

sin conectarlo directamente con el CMS editorial principal.

El sistema debe priorizar:

**privacidad  
minimización de datos  
aislamiento  
seguridad  
trazabilidad  
control humano**

No debe funcionar como:

“un formulario de contacto con archivos”.

Debe funcionar como un **canal controlado de recepción de información periodística**.

---

# 2. Principio arquitectónico

La arquitectura debe ser:

```txt
Internet
   │
   ▼
denuncias.clasificadoscolombia.com
   │
   ▼
Denuncias App
   │
   ├── Denuncias DB
   │
   └── Quarantine Storage
```

Separado de:

```txt
Next.js + Payload
Postgres Editorial
Evidence Vault
Meilisearch
```

---

# 3. PROHIBICIÓN CRÍTICA

No debe existir:

```txt
foreign key
direct DB connection
shared ORM model
shared database user
```

entre:

```txt
denuncias-db
```

y:

```txt
clasificados_prod
```

---

# 4. PRINCIPIO DE AISLAMIENTO

Aunque ambos sistemas vivan inicialmente en el mismo VPS:

```txt
mismo servidor
≠
misma zona de confianza
```

Separar:

- containers;
- network;
- DB;
- users;
- secrets;
- storage;
- logs;
- backup policy.

---

# 5. SERVICIOS

Crear:

```txt
denuncias-app
denuncias-db
denuncias-storage
scanner-worker
```

Opcional:

```txt
queue
```

si el procesamiento asíncrono lo requiere.

---

# 6. DOMINIO

Utilizar:

```txt
denuncias.clasificadoscolombia.com
```

No integrar el formulario directamente dentro de:

```txt
clasificadoscolombia.com/admin
```

---

# 7. EXPERIENCIA PÚBLICA

La interfaz debe transmitir:

- seguridad;
- claridad;
- respeto;
- sobriedad;
- privacidad.

No utilizar lenguaje sensacionalista.

---

# 8. COPY PRINCIPAL

Debe explicar claramente:

```txt
Qué puede enviar
Qué no debe enviar
Cómo será revisado
Qué significa enviar una denuncia
Qué garantías existen
Qué garantías NO existen
```

No prometer anonimato absoluto si técnicamente no puede garantizarse.

---

# 9. MODOS DE ENVÍO

Permitir dos modos:

```txt
IDENTIFICADO
ANÓNIMO
```

---

# 10. ENVÍO IDENTIFICADO

Campos opcionales/según flujo:

```txt
nombre
email
teléfono
medio preferido de contacto
```

---

# 11. ENVÍO ANÓNIMO

Debe permitir:

```txt
no nombre
no email
no teléfono
```

sin bloquear submission.

---

# 12. NO FORZAR CUENTA

No requerir:

```txt
crear usuario
login
Facebook
Google OAuth
```

para denunciar.

---

# 13. FORMULARIO BASE

Campos:

```txt
Título
Descripción
Ubicación aproximada
Fecha aproximada del hecho
Personas/entidades relacionadas
Archivos
Deseo permanecer anónimo
Acepto términos de envío
```

---

# 14. DESCRIPCIÓN

Campo amplio.

No limitar excesivamente.

Pero aplicar límite técnico para evitar abuso.

Ejemplo:

```txt
20.000 caracteres
```

ajustable.

---

# 15. CASE ID

Cada envío recibe:

```txt
UUID
```

Ejemplo:

```txt
8f726dad-...
```

No usar IDs incrementales públicos.

---

# 16. PUBLIC TRACKING TOKEN

Si se ofrece consulta posterior:

generar token independiente y aleatorio.

Nunca exponer:

```txt
database primary key
```

como código de seguimiento.

---

# 17. NO ACCOUNTLESS ENUMERATION

El token debe tener suficiente entropía para impedir adivinación.

No:

```txt
DEN-000123
```

como única credencial de consulta.

---

# 18. DATABASE

DB completamente separada.

Ejemplo:

```txt
denuncias_prod
```

Usuario:

```txt
denuncias_app
```

---

# 19. DATA MODEL

Tabla/entidad:

```txt
submissions
```

Campos mínimos:

```txt
id
createdAt
status

title
description
location
eventDate

anonymous

contactEncrypted

riskLevel
editorialPriority

assignedTo

retentionUntil
```

---

# 20. CONTACT DATA

No almacenar datos de contacto mezclados innecesariamente con contenido.

Preferir separación lógica.

Ejemplo:

```txt
submission_contacts
```

---

# 21. ENCRYPTION

Datos personales sensibles deben cifrarse en reposo a nivel de aplicación o storage según diseño final.

Especialmente:

```txt
email
teléfono
nombre
```

si se decide conservarlos.

---

# 22. KEY SEPARATION

La clave utilizada para cifrar datos sensibles:

no debe almacenarse dentro de la DB.

Guardar como secret seguro.

---

# 23. MINIMIZACIÓN

No recolectar información “por si acaso”.

Preguntar:

```txt
¿Necesitamos realmente este dato?
```

antes de añadir un campo.

---

# 24. IP ADDRESS

No guardar IP permanentemente por defecto.

Si se utiliza para rate limiting:

- procesar temporalmente;
- minimizar;
- eliminar;
- documentar retención.

---

# 25. USER AGENT

No almacenar completo si no es necesario.

Puede generar fingerprinting involuntario.

---

# 26. LOGS

No registrar:

```txt
description
contact details
uploaded filenames
tokens
submission text
```

en logs técnicos.

OWASP recomienda excluir datos sensibles, credenciales y otros secretos del logging.

---

# 27. NO ANALYTICS INVASIVO

Evitar:

```txt
Meta Pixel
Hotjar
session replay
third-party behavioral analytics
```

en el portal de denuncias.

---

# 28. ANALYTICS

Si se necesita medición:

usar métricas agregadas y respetuosas con privacidad.

Ejemplo:

```txt
form_started
form_completed
form_error
```

sin contenido del formulario.

---

# 29. SEARCH ENGINES

La aplicación debe ser:

```txt
noindex
```

cuando corresponda.

No indexar submissions ni interfaces internas.

---

# 30. ROBOTS

Bloquear crawling de rutas privadas.

Pero recordar:

```txt
robots.txt ≠ security
```

---

# 31. STORAGE

Los archivos enviados NO deben entrar directamente al Evidence Vault editorial.

Primero:

```txt
quarantine
```

---

# 32. QUARANTINE BUCKET

Crear storage separado:

```txt
denuncias-quarantine
```

Nunca:

```txt
evidence-restricted
```

directamente.

---

# 33. UPLOAD FLOW

```txt
User
↓
Request upload slot
↓
Authorization / rate limit
↓
Presigned upload
↓
Quarantine
↓
Validation
↓
Malware scan
↓
Review
```

---

# 34. FILE SIZE

Definir límites explícitos.

Ejemplo inicial:

```txt
imagen: 15 MB
PDF: 50 MB
video: 250 MB
audio: 100 MB
```

Ajustar según capacidad.

---

# 35. FILE TYPES

Allowlist.

Ejemplo:

```txt
PDF
JPG
JPEG
PNG
WEBP
MP4
MOV
MP3
WAV
DOCX
XLSX
```

Solo los realmente necesarios.

---

# 36. NEVER TRUST EXTENSION

Validar:

```txt
extension
MIME
magic bytes
```

cuando sea posible.

OWASP advierte que el `Content-Type` suministrado por el cliente puede falsificarse.

---

# 37. FILE NAME

Renombrar a:

```txt
UUID
```

No almacenar físicamente con nombre original.

---

# 38. ORIGINAL FILENAME

Si se conserva:

metadata protegida.

No usarlo como path público.

---

# 39. MALWARE SCANNING

Incluir worker:

```txt
scanner-worker
```

Puede usar:

```txt
ClamAV
```

o alternativa adecuada.

No liberar archivo antes de scan cuando el tipo lo requiera.

OWASP recomienda considerar análisis antimalware en pipelines de subida.

---

# 40. SCAN STATUS

Valores:

```txt
pending
clean
suspicious
infected
failed
```

---

# 41. SCAN FAILURE

Si scanner falla:

```txt
DO NOT mark clean
```

Mantener en cuarentena.

---

# 42. INFECTED FILE

No abrir.

Marcar:

```txt
infected
```

y restringir acceso.

Definir retención específica.

---

# 43. ARCHIVE FILES

ZIP/RAR requieren controles adicionales.

Limitar:

```txt
nested depth
uncompressed size
file count
compression ratio
```

---

# 44. ZIP BOMB

No extraer archivos sin límites.

Procesar en worker aislado.

---

# 45. DOCUMENT PREVIEW

No mostrar directamente archivos activos en browser.

Preferir:

```txt
rendered preview
```

para documentos.

---

# 46. OFFICE FILES

No ejecutar macros.

No abrir con software de escritorio en servidor.

---

# 47. VIDEO PROCESSING

Procesar metadata/video en worker.

No dentro del request HTTP.

---

# 48. STATUS DE DENUNCIA

Estados:

```txt
received
triage
under_review
needs_contact
rejected
accepted_for_investigation
archived
deleted
```

---

# 49. RECEIVED

Significa únicamente:

```txt
el sistema recibió el material
```

No:

```txt
Clasificados Colombia verificó la denuncia
```

---

# 50. TRIAGE

Primera revisión:

- relevancia;
- riesgo;
- duplicado;
- calidad;
- urgencia;
- posibles amenazas.

---

# 51. RISK LEVEL

Campo interno:

```txt
low
medium
high
critical
```

No visible al denunciante.

---

# 52. CRITICAL

Puede incluir:

- riesgo físico;
- evidencia delicada;
- fuente vulnerable;
- posible delito grave;
- alto riesgo legal.

Debe escalarse.

---

# 53. EDITORIAL PRIORITY

Separar:

```txt
riskLevel
```

de:

```txt
editorialPriority
```

Algo puede ser sensible sin ser prioritario editorialmente.

---

# 54. ASSIGNMENT

Asignación interna a:

```txt
journalist/reviewer
```

No enviar automáticamente a toda la redacción.

---

# 55. NEED TO KNOW

Solo usuarios asignados deben acceder al contenido completo cuando el caso sea sensible.

---

# 56. PANEL INTERNO

El panel de denuncias debe ser independiente de Payload Admin.

No incrustarlo como iframe.

---

# 57. INTERNAL USER MODEL

Puede usar autenticación separada.

No compartir sesiones con Payload.

---

# 58. USERS

Roles mínimos:

```txt
triage_reviewer
investigative_editor
security_admin
```

---

# 59. SECURITY ADMIN

Admin técnico:

no necesariamente necesita leer el contenido completo.

Separar permisos.

---

# 60. REVIEWER

Puede:

```txt
ver submissions asignadas
clasificar
añadir notas
solicitar contacto
```

---

# 61. INVESTIGATIVE EDITOR

Puede:

```txt
aceptar para investigación
aprobar transferencia controlada
```

---

# 62. INTERNAL NOTES

Nunca mezclar con texto enviado por usuario.

Campos separados:

```txt
submissionText
internalNotes
```

---

# 63. INTERNAL NOTES SECURITY

No exportarlas automáticamente al CMS editorial.

---

# 64. TRANSFER TO INVESTIGATION

No foreign key.

Proceso:

```txt
Submission
↓
Human review
↓
Accept
↓
Controlled export
↓
New investigation record
```

---

# 65. EXPORT PACKAGE

Generar paquete mínimo:

```txt
internal case reference
summary
approved files
selected metadata
```

---

# 66. DO NOT AUTO COPY EVERYTHING

Nunca:

```txt
all uploaded files
all contact details
all notes
```

automáticamente.

El editor selecciona.

---

# 67. CONTACT DATA TRANSFER

Datos del denunciante:

NO transferir al CMS editorial por defecto.

Mantener separados.

---

# 68. SOURCE IDENTITY

Si el caso se convierte en investigación:

crear referencia interna pseudónima.

Ejemplo:

```txt
SOURCE-8F71
```

---

# 69. PAYLOAD

Payload puede recibir:

```txt
investigation
```

pero no:

```txt
raw complaint
```

---

# 70. EVIDENCE VAULT TRANSFER

Archivo aprobado:

```txt
quarantine
↓
scan clean
↓
editorial review
↓
copy into restricted evidence
```

No mover directamente.

---

# 71. COPY, NOT RECLASSIFY

Preferir:

```txt
copy verified file
```

al Evidence Vault.

Mantener original en sistema de denuncias según retención.

---

# 72. CHECKSUM

Calcular:

```txt
SHA-256
```

en ingestión.

Al transferir:

volver a calcular/verificar.

---

# 73. CHAIN OF CUSTODY

Registrar:

```txt
receivedAt
checksum
scan result
reviewedBy
transferredBy
transferredAt
destinationEvidenceId
```

sin conexión DB directa.

---

# 74. TRANSFER ID

Puede guardarse como string externo:

```txt
editorialReference
```

pero no foreign key.

---

# 75. RETENTION POLICY

Definir periodos según estado.

Ejemplo inicial:

```txt
rejected → 30–90 days
unreviewed abandoned → 90 days
accepted → policy-specific
critical/legal hold → manual
```

---

# 76. DATA DELETION

La eliminación debe:

- borrar DB donde corresponda;
- eliminar storage;
- invalidar derivados;
- registrar evento técnico mínimo.

---

# 77. LEGAL HOLD

Si un caso debe preservarse:

```txt
legalHold = true
```

suspende eliminación automática.

---

# 78. ANONYMOUS SUBMISSIONS

No intentar reidentificar al usuario.

No enriquecer automáticamente con:

```txt
IP intelligence
social matching
fingerprinting
```

---

# 79. PRIVACY

OWASP recomienda diseñar específicamente contra amenazas a la privacidad y anonimato en sistemas que manejan información personal.

---

# 80. TRANSPORT SECURITY

Todo:

```txt
HTTPS
```

TLS obligatorio.

---

# 81. CSP

Política más restrictiva que el sitio editorial.

Idealmente:

```txt
script-src 'self'
connect-src 'self'
img-src 'self'
```

más excepciones estrictamente necesarias.

---

# 82. NO SOCIAL EMBEDS

No cargar:

```txt
Facebook SDK
Instagram SDK
X widgets
TikTok
```

en portal de denuncias.

---

# 83. THIRD PARTY JS

Minimizar al máximo.

Cada script externo incrementa superficie de exposición.

---

# 84. CAPTCHA

No asumir que CAPTCHA = seguridad.

Puede utilizarse como control antiabuso si es necesario.

Preferir opciones con menor impacto de privacidad.

---

# 85. RATE LIMITING

Aplicar en:

```txt
submission create
upload slot
tracking lookup
contact reply
```

---

# 86. ABUSE

Detectar:

- flood;
- automation;
- huge uploads;
- repeated invalid files.

Sin construir perfiles invasivos.

---

# 87. DOS PROTECTION

Límites:

```txt
body size
upload count
concurrent uploads
rate
```

---

# 88. FILE COUNT

Ejemplo inicial:

```txt
max 20 files/submission
```

Ajustable.

---

# 89. SUBMISSION SIZE

Definir límite agregado.

Ejemplo:

```txt
500 MB total
```

según infraestructura.

---

# 90. LARGE MATERIAL

Para grandes volúmenes:

no forzar al formulario a aceptar gigabytes.

Crear proceso separado cuando sea necesario.

---

# 91. EMAIL NOTIFICATIONS

Evitar enviar contenido sensible por email.

Correcto:

```txt
Nueva denuncia recibida.
Accede al panel seguro.
```

Incorrecto:

```txt
Full complaint body + files
```

---

# 92. EMAIL TO USER

Si dejó email:

respuesta mínima.

No enviar detalles sensibles sin necesidad.

---

# 93. CONTACT WORKFLOW

La comunicación posterior debería utilizar canal definido.

No improvisar desde cuentas personales.

---

# 94. TRACKING PAGE

Si existe:

```txt
/seguimiento
```

solo debe mostrar información limitada.

Ejemplo:

```txt
Recibido
En revisión
Necesitamos contacto
Cerrado
```

---

# 95. DO NOT EXPOSE INTERNAL STATUS

No mostrar:

```txt
riskLevel
assignedJournalist
legalReview
internalNotes
```

---

# 96. TRACKING TOKEN

Almacenarlo:

```txt
hashed
```

cuando sea posible.

Similar a password reset tokens.

---

# 97. EXPIRATION

Evaluar expiración de token de seguimiento.

---

# 98. LOSS OF TOKEN

Para anónimo:

si pierde token, quizá no exista recuperación.

Explicarlo claramente.

---

# 99. ADMIN LOGIN

Requerir:

- cuenta individual;
- MFA;
- rate limiting;
- secure session.

---

# 100. MFA

Obligatorio para usuarios internos del panel de denuncias.

---

# 101. SESSION

Más corta que CMS editorial.

Ejemplo inicial:

```txt
4–8h
```

con reauth para acciones críticas.

---

# 102. NO SHARED ACCOUNT

Nunca:

```txt
denuncias@...
password compartida
```

---

# 103. DOWNLOAD SENSITIVE FILE

Requerir:

```txt
authorization
audit
recent authentication
```

---

# 104. AUDIT

Registrar:

```txt
login
submission viewed
file downloaded
status changed
assigned
contact accessed
export generated
deleted
```

---

# 105. AUDIT DATA

No incluir texto completo ni contenido del archivo.

---

# 106. FAILED ACCESS

Registrar intentos denegados relevantes.

---

# 107. LOG SEPARATION

Logs de denuncias:

separados de logs editoriales.

---

# 108. BACKUPS

DB + storage:

backup separado del CMS.

---

# 109. BACKUP ENCRYPTION

Backups deben cifrarse.

---

# 110. BACKUP ACCESS

Acceso más limitado que backups normales.

---

# 111. BACKUP RETENTION

Debe alinearse con política de eliminación.

No sirve borrar un dato activo si permanece 5 años en backups sin política.

---

# 112. RESTORE

Test periódico.

Pero nunca restaurar backup real sensible a staging.

---

# 113. STAGING

Usar:

```txt
synthetic data
```

No copiar denuncias reales.

---

# 114. DEVELOPMENT

Developers no necesitan acceso a producción para programar.

---

# 115. SUPPORT

Nunca pedir al denunciante que envíe la denuncia completa por chat/email porque “el formulario falló”.

Definir canal alternativo seguro.

---

# 116. INCIDENT RESPONSE

Si se compromete el sistema:

```txt
contain
isolate
preserve logs
rotate secrets
assess access
notify responsible team
recover
```

---

# 117. CREDENTIAL LEAK

Rotar:

```txt
DB
storage
encryption keys where possible
session secrets
```

según impacto.

---

# 118. STORAGE LEAK

Evaluar:

```txt
which objects
access timestamps
download events
classification
```

---

# 119. THREAT MODEL — ASSETS

Activos:

```txt
complaint text
source identity
contact data
files
case status
audit logs
encryption keys
credentials
```

---

# 120. THREAT ACTORS

Considerar:

```txt
anonymous attacker
bot
malicious uploader
compromised journalist
insider
former employee
credential thief
```

---

# 121. THREAT: MALICIOUS UPLOAD

Mitigaciones:

```txt
allowlist
magic-byte validation
quarantine
scan
size limits
no execution
```

---

# 122. THREAT: SOURCE IDENTIFICATION

Mitigaciones:

```txt
minimal logs
no third-party analytics
no forced account
no unnecessary IP retention
metadata minimization
```

---

# 123. THREAT: CREDENTIAL THEFT

Mitigaciones:

```txt
MFA
short sessions
least privilege
audit
```

---

# 124. THREAT: INSIDER

Mitigaciones:

```txt
assignment-based access
audit
need-to-know
contact separation
```

---

# 125. THREAT: STORAGE BREACH

Mitigaciones:

```txt
network isolation
private storage
encryption
random object keys
no permanent URLs
```

---

# 126. THREAT: SQL INJECTION

Use parameterized ORM/query APIs.

No raw user-built SQL.

---

# 127. THREAT: XSS

Sanitize displayed complaint content.

Never render user HTML.

---

# 128. THREAT: SSRF

No fetch arbitrary URLs supplied by users.

If link preview is introduced later:

use strict SSRF protections.

---

# 129. THREAT: TRACKING TOKEN BRUTE FORCE

Mitigations:

```txt
high entropy
rate limit
hashed token
```

---

# 130. THREAT: ENUMERATION

Responses should not reveal:

```txt
case exists
user exists
email exists
```

unnecessarily.

---

# 131. THREAT: EMAIL LEAK

Never include complaint contents in email notifications.

---

# 132. THREAT: LOG LEAK

Redaction and minimal logging.

---

# 133. THREAT: BACKUP LEAK

Encrypted backups + separate access.

---

# 134. THREAT: ACCIDENTAL CMS TRANSFER

Require explicit human action.

No webhook:

```txt
submission received
→ automatically create Payload article
```

---

# 135. SECURITY TESTING

Automate:

```txt
authorization tests
upload validation tests
rate-limit tests
token tests
XSS tests
```

---

# 136. UPLOAD SECURITY TESTS

Test:

```txt
renamed executable
spoofed MIME
double extension
oversized file
zip bomb
malformed PDF
```

---

# 137. AUTHORIZATION TESTS

Examples:

```txt
Reviewer A cannot read case B if not assigned
Anonymous cannot access panel
Disabled user cannot login
```

---

# 138. PRIVACY TEST

Inspect:

```txt
network requests
cookies
logs
analytics
HTML
```

to ensure no unnecessary identifiers are exposed.

---

# 139. DATA FLOW DOCUMENT

Maintain:

```txt
/docs/denuncias/data-flow.md
```

Document:

```txt
User
→ app
→ DB
→ storage
→ reviewer
→ export
```

---

# 140. DOCUMENTATION

Create:

```txt
/docs/denuncias/
```

with:

```txt
architecture.md
threat-model.md
retention.md
uploads.md
privacy.md
triage.md
transfer-to-editorial.md
incident-response.md
```

---

# 141. TERMS

The public interface should clarify:

submission does not mean:

```txt
publication
legal representation
automatic investigation
guaranteed response
```

---

# 142. SAFETY MESSAGE

When appropriate, tell users not to put themselves at risk to obtain evidence.

Do not encourage illegal or dangerous acquisition.

---

# 143. EMERGENCY DISCLAIMER

The portal is not an emergency service.

Do not use generic emergency language unless legally appropriate.

---

# 144. NO FALSE ANONYMITY CLAIMS

Do not say:

```txt
100% anonymous
impossible to trace
totally secure
```

unless technically and legally supportable.

---

# 145. USER TRUST

Better language:

```txt
Puede enviar información sin proporcionar sus datos de contacto.

Minimizamos la información técnica que conservamos y aplicamos controles de acceso internos.
```

---

# 146. PHASE 1

Build:

```txt
submission form
anonymous mode
DB isolation
quarantine storage
file validation
MFA internal panel
triage
manual transfer
audit
```

---

# 147. PHASE 2

Add:

```txt
malware scanning
encrypted contact fields
tracking token
retention automation
```

if not completed in Phase 1.

---

# 148. PHASE 3

Evaluate:

```txt
advanced secure messaging
special large-file transfer
more isolated infrastructure
```

only if newsroom needs justify it.

---

# 149. DEFINITION OF DONE

The service is ready when:

1. a user can submit anonymously;
2. no CMS account is required;
3. files enter quarantine;
4. uploads are validated;
5. internal users require MFA;
6. access is assignment-based;
7. contact data is minimized;
8. logs do not expose complaint contents;
9. no direct DB link exists with Payload;
10. transfer to editorial requires explicit human approval;
11. evidence files do not automatically enter the main vault;
12. deletion/retention policies are enforceable;
13. backups are separate and encrypted;
14. critical actions are auditable.

---

# 150. PRINCIPIO FINAL

El servicio de denuncias debe asumir que:

```txt
la información recibida puede ser falsa,
puede ser peligrosa,
puede contener malware,
puede revelar a una fuente,
puede tener valor periodístico,
o puede no tenerlo.
```

Por eso ningún dato entrante debe recibir confianza implícita.

**Recibir información no significa confiar en ella.  
Proteger a la fuente no significa prometer lo imposible.  
Y aceptar una denuncia nunca debe convertirla automáticamente en contenido editorial.**