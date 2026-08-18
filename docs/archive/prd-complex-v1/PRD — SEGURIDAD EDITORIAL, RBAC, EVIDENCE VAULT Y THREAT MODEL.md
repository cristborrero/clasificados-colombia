# PRD — SEGURIDAD EDITORIAL, RBAC, EVIDENCE VAULT Y THREAT MODEL
## Clasificados Colombia · Payload CMS + MinIO
### Documento Nº 5

---

# 1. Objetivo

Diseñar un modelo de seguridad editorial que proteja:

- contenido no publicado;
- investigaciones sensibles;
- usuarios internos;
- documentos de evidencia;
- configuraciones críticas;
- auditoría;
- credenciales;
- datos personales;
- operaciones privilegiadas;
- relación entre periodismo y evidencia.

La seguridad debe estar implementada en:

```txt
Código
Infraestructura
Permisos
Storage
Procesos
Logs
Workflow editorial
```

No únicamente en UI.

---

# 2. Principio central

## DENY BY DEFAULT

Todo recurso debe asumir:

```txt
NO ACCESS
```

hasta que exista una regla explícita que permita acceso.

Evitar:

```txt
allow all
→ luego bloquear excepciones
```

Preferir:

```txt
deny all
→ permitir únicamente operaciones necesarias
```

---

# 3. SECURITY MODEL

Separar cinco dimensiones:

```txt
AUTHENTICATION
¿Quién eres?

AUTHORIZATION
¿Qué puedes hacer?

CLASSIFICATION
¿Qué tan sensible es el recurso?

CONTEXT
¿En qué estado editorial se encuentra?

AUDIT
¿Quién hizo qué y cuándo?
```

---

# 4. PAYLOAD ACCESS CONTROL

Utilizar Access Control real de Payload para:

- Collections
- Globals
- Fields

Payload permite definir `read`, `create`, `update` y `delete` mediante funciones de acceso.

Nunca confiar únicamente en:

```txt
admin.hidden
admin.condition
```

como controles de seguridad.

La UI puede ocultar.

El backend debe denegar.

---

# 5. USER COLLECTION

Crear:

```txt
users
```

con autenticación habilitada.

Campos:

```txt
name
email
role
status
department
avatar

lastLoginAt
passwordChangedAt

mfaEnabled
securityNotes
```

No almacenar:

```txt
plain password
MFA secret visible
recovery codes plaintext
```

---

# 6. ROLES

Roles iniciales:

```txt
administrator
editor_in_chief
editor
investigative_editor
reporter
fact_checker
legal_reviewer
photo_editor
contributor
```

No utilizar nombres ambiguos como:

```txt
user
manager
staff
```

para permisos importantes.

---

# 7. PRINCIPLE OF LEAST PRIVILEGE

Cada rol obtiene solo los permisos necesarios.

Ejemplo:

Un Reporter necesita:

```txt
crear artículos
editar sus borradores
adjuntar evidencia autorizada
enviar a revisión
```

No necesita:

```txt
crear usuarios
modificar roles
cambiar site settings
desclasificar documentos
borrar artículos publicados
```

---

# 8. MATRIZ GENERAL DE ROLES

## Administrator

Puede:

```txt
gestionar infraestructura lógica del CMS
usuarios
roles
settings
migrations administrativas
```

No debe convertirse automáticamente en autoridad editorial.

---

## Editor in Chief

Puede:

```txt
publicar
despublicar
aprobar
gestionar portada
breaking news
correcciones
```

No debería administrar secretos de infraestructura.

---

## Investigative Editor

Puede:

```txt
gestionar investigaciones
ver evidencia internal
solicitar acceso restricted
revisar fuentes
aprobar estructura editorial
```

No puede modificar roles.

---

## Editor

Puede:

```txt
editar
asignar
aprobar contenido estándar
programar publicación
```

---

## Reporter

Puede:

```txt
crear
editar sus drafts
adjuntar material autorizado
enviar a revisión
```

---

## Fact Checker

Puede:

```txt
leer contenido en revisión
acceder a fuentes asignadas
actualizar factCheckStatus
crear notas de verificación
```

---

## Legal Reviewer

Puede:

```txt
leer investigaciones asignadas
leer evidencia autorizada
emitir legalStatus
crear notas legales
```

---

## Photo Editor

Puede:

```txt
gestionar imágenes editoriales
credits
crops
alt
```

No evidencia restricted.

---

## Contributor

Puede:

```txt
crear borradores propios
editar únicamente borradores propios
```

No publicar.

---

# 9. ROLE HELPER

Centralizar lógica.

Ejemplo conceptual:

```txt
src/access/
  roles.ts
  canRead.ts
  canCreate.ts
  canUpdate.ts
  canDelete.ts
```

No duplicar:

```ts
user.role === 'editor'
```

por 50 archivos.

---

# 10. ACCESS HELPERS

Crear funciones:

```txt
isAdmin
isEditorInChief
isEditor
isReporter
isFactChecker
isLegalReviewer

canPublish
canAccessInternalEvidence
canAccessRestrictedEvidence
canManageUsers
```

---

# 11. COLLECTION ACCESS

Cada colección debe declarar explícitamente:

```txt
create
read
update
delete
```

No depender de defaults.

---

# 12. ARTICLE READ

Público:

```txt
_status = published
```

Usuario autenticado:

según rol + workflow.

Ejemplo:

Reporter:

```txt
own drafts
+
published
```

Editor:

```txt
all editorial content
```

---

# 13. ARTICLE UPDATE

Reporter puede actualizar solo:

```txt
createdBy = req.user.id
AND
editorialStatus IN [
  draft,
  editing_changes_requested
]
```

No contenido publicado.

---

# 14. PUBLISHED ARTICLE UPDATE

Solo:

```txt
Editor
Editor in Chief
```

según política.

Cambios materiales requieren:

```txt
updatedAt
change record
```

---

# 15. DELETE POLICY

Content deletion debe ser restrictivo.

Preferir:

```txt
archive
unpublish
```

sobre:

```txt
delete
```

Artículos publicados:

no delete para roles editoriales normales.

---

# 16. USER MANAGEMENT

Crear usuarios:

```txt
administrator
```

y, si se decide:

```txt
editor_in_chief
```

solo para roles editoriales no privilegiados.

---

# 17. ROLE ESCALATION

Un usuario nunca puede asignar un rol superior al suyo.

Ejemplo:

Editor no puede crear:

```txt
administrator
editor_in_chief
```

---

# 18. SELF ROLE CHANGE

Ningún usuario puede modificar su propio:

```txt
role
permissions
status
```

aunque pueda editar su perfil.

Implementar Field Access Control.

---

# 19. CRITICAL FIELDS

Field-level access para:

```txt
role
status
legalStatus
factCheckStatus
classification
publishedAt
securityMetadata
```

---

# 20. FIELD ACCESS

Ejemplo:

```txt
classification
```

visible para:

```txt
investigative_editor
editor_in_chief
administrator
```

No para contributor.

---

# 21. WORKFLOW ENFORCEMENT

El frontend Admin puede mostrar botones según estado.

Pero el backend debe validar transición.

Ejemplo inválido:

```txt
draft
→ published
```

por Reporter.

Debe rechazarse incluso vía REST.

---

# 22. STATE MACHINE

Definir transiciones válidas:

```txt
draft
↓
editing
↓
fact_check
↓
legal_review
↓
approved
↓
scheduled
↓
published
```

Permitir rutas simplificadas para noticias que no requieren legal review.

---

# 23. TRANSITION GUARDS

Ejemplo:

`fact_check → approved`

requiere:

```txt
factCheckStatus = verified
```

Investigación:

```txt
legalStatus = approved
```

antes de publish.

---

# 24. PUBLISH PERMISSION

Función central:

```txt
canPublish()
```

evaluar:

```txt
role
contentType
workflowStatus
factCheckStatus
legalStatus
requiredFields
```

---

# 25. BREAKING NEWS

Breaking News requiere velocidad.

Permisos:

```txt
editor
editor_in_chief
```

No saltarse autorización.

Puede tener workflow reducido.

---

# 26. BREAKING EXPIRATION

Una alerta debe tener:

```txt
startsAt
expiresAt
```

Evitar banners olvidados.

---

# 27. EVIDENCE VAULT

La evidencia no se almacena directamente en Payload.

Payload guarda únicamente metadata/control.

MinIO guarda objeto.

Modelo:

```txt
Payload
→ evidence record

MinIO
→ physical object
```

---

# 28. EVIDENCE RECORD

Colección:

```txt
evidence
```

Campos:

```txt
title
description

classification

bucket
objectKey
mimeType
size
checksum

uploadedBy
uploadedAt

relatedInvestigation
relatedArticles

accessPolicy

retention
legalHold

status
```

---

# 29. CLASSIFICATION LEVELS

Exactamente:

```txt
public
internal
restricted
```

---

# 30. PUBLIC

Puede ser visto por:

```txt
Internet
```

solo después de publicación/desclasificación explícita.

---

# 31. INTERNAL

Solo:

```txt
usuarios autenticados autorizados
```

Ejemplos:

- documentos de trabajo;
- reportes internos;
- material aún no publicado.

---

# 32. RESTRICTED

Solo usuarios expresamente autorizados.

Ejemplos:

- evidencia sensible;
- información con riesgo jurídico;
- documentos vinculados a investigación activa;
- material cuya filtración pueda perjudicar fuentes.

---

# 33. CLASSIFICATION IS SECURITY

No tratar:

```txt
classification = restricted
```

como simple etiqueta.

Debe determinar:

```txt
Storage bucket
Access policy
API permissions
UI
Audit
URL generation
```

---

# 34. STORAGE MAPPING

Ejemplo:

```txt
public
→ evidence-public

internal
→ evidence-internal

restricted
→ evidence-restricted
```

---

# 35. MINIO ACCESS CONTROL

Utilizar políticas con mínimo privilegio.

MinIO permite políticas que restringen acciones y recursos.

No usar root credentials desde Next.js.

---

# 36. APPLICATION MINIO USER

Crear identidad de servicio.

Ejemplo:

```txt
clasificados-evidence-service
```

Permisos limitados.

---

# 37. DIRECT CLIENT ACCESS

Browser nunca recibe:

```txt
MINIO_ACCESS_KEY
MINIO_SECRET_KEY
```

Todo acceso pasa por backend autorizado.

---

# 38. DOWNLOAD FLOW

```txt
Browser
↓
GET /api/evidence/:id/access
↓
Auth
↓
Authorization
↓
Classification check
↓
Audit log
↓
Generate presigned URL
↓
Return temporary URL
```

---

# 39. PRESIGNED URL

Las URLs presignadas son temporales y pueden conceder acceso a un objeto privado sin revelar credenciales.

No tratarlas como enlaces revocables instantáneamente después de entregarlos.

Su principal control es:

```txt
short expiry
```

---

# 40. EXPIRATION POLICY

Recomendación inicial:

```txt
public: 15–60 min
internal: 5–15 min
restricted: 60–300 sec
```

Ajustable.

---

# 41. REAUTHENTICATION FOR RESTRICTED

Para acciones críticas:

```txt
download restricted
change classification
remove legal hold
```

evaluar reautenticación reciente.

OWASP recomienda reautenticación ante operaciones de riesgo elevado.

---

# 42. RESTRICTED ACCESS

No basta:

```txt
role = editor
```

Usar acceso contextual.

Ejemplo:

```txt
role allowed
AND
assigned investigation
```

o autorización explícita.

---

# 43. ACCESS GRANTS

Colección:

```txt
evidenceAccessGrants
```

Campos:

```txt
user
evidence
grantedBy
reason
createdAt
expiresAt
```

---

# 44. GRANT EXPIRY

Los grants restricted pueden expirar.

Ejemplo:

```txt
7 days
30 days
end of investigation
```

No mantener permisos indefinidos sin necesidad.

---

# 45. GROUP ACCESS

Si se requiere:

```txt
investigationTeam
```

Colección:

```txt
investigationTeams
```

con miembros.

Evitar grants individuales masivos.

---

# 46. NEED TO KNOW

Restricted:

acceso por necesidad de trabajo.

No por nivel jerárquico únicamente.

Un Administrator técnico no necesariamente necesita leer evidencia periodística.

---

# 47. SEPARATION OF DUTIES

Separar:

```txt
technical administration
editorial authority
evidence authority
```

cuando sea posible.

---

# 48. DESCLASSIFICATION

Cambio:

```txt
restricted
→ internal
→ public
```

es operación sensible.

---

# 49. WHO CAN DECLASSIFY

Recomendación:

```txt
investigative_editor
editor_in_chief
```

según nivel.

Restricted → Public:

idealmente requiere doble confirmación.

---

# 50. FOUR-EYES PRINCIPLE

Para evidencia de alto riesgo:

```txt
Requester
↓
Second approver
↓
classification change
```

Especialmente:

```txt
restricted → public
```

---

# 51. CLASSIFICATION HISTORY

Nunca sobrescribir silenciosamente.

Guardar:

```txt
oldClassification
newClassification
changedBy
approvedBy
reason
timestamp
```

---

# 52. AUDIT LOG

Crear colección append-only:

```txt
auditEvents
```

No editable desde Admin ordinario.

---

# 53. AUDIT EVENT

Campos:

```txt
timestamp
actorId
actorRole
action

resourceType
resourceId

result

ipHash
userAgentSummary

metadata
```

---

# 54. LOG ACTIONS

Registrar mínimo:

```txt
login_success
login_failure

user_created
user_disabled
role_changed

article_published
article_unpublished
article_deleted

evidence_uploaded
evidence_downloaded
evidence_access_denied

classification_changed
access_granted
access_revoked

legal_hold_changed

settings_changed
```

OWASP recomienda registrar eventos de autenticación, fallos de autorización y otros eventos relevantes para seguridad.

---

# 55. NO SENSITIVE LOG DATA

Nunca loggear:

```txt
passwords
tokens
presigned URLs
full documents
full complaint content
MinIO credentials
session cookies
```

---

# 56. AUDIT IMMUTABILITY

Usuarios ordinarios:

```txt
read = false or limited
update = false
delete = false
```

Administradores tampoco deben poder editar eventos desde UI.

---

# 57. AUDIT RETENTION

Definir política.

Ejemplo inicial:

```txt
security audit: >= 12 months
restricted access logs: >= 24 months
```

Validar posteriormente con necesidades legales.

---

# 58. OBJECT INTEGRITY

Al subir evidencia:

calcular checksum.

Ejemplo:

```txt
SHA-256
```

Guardar en Payload.

---

# 59. CHECKSUM

Permite verificar:

```txt
archivo almacenado
=
archivo original registrado
```

No sustituye firma digital.

---

# 60. VERSIONING

Para buckets sensibles:

habilitar versioning.

MinIO requiere versioning para Object Lock.

---

# 61. OBJECT LOCK

Usar selectivamente cuando la evidencia requiera inmutabilidad.

MinIO permite Object Lock y legal hold en buckets configurados para ello.

---

# 62. LEGAL HOLD

No permitir que cualquier editor active/desactive hold.

Permiso:

```txt
administrator/security authority
+
editor_in_chief
```

según política final.

---

# 63. DELETE EVIDENCE

Restricted evidence:

no hard delete ordinario.

Preferir:

```txt
logical delete
retention
object versioning
```

---

# 64. UPLOAD FLOW

```txt
User
↓
request upload permission
↓
backend authorizes
↓
short presigned PUT
↓
upload
↓
server verifies object
↓
checksum
↓
metadata record
```

MinIO soporta presigned PUT con expiración.

---

# 65. UPLOAD OBJECT KEY

Usar:

```txt
UUID/random key
```

No:

```txt
source-name-secret-document.pdf
```

---

# 66. ORIGINAL FILENAME

Si se necesita:

guardar cifrado o metadata protegida.

No utilizarlo como object key.

---

# 67. FILE VALIDATION

Validar:

```txt
maximum size
MIME
extension
magic bytes
```

cuando sea posible.

---

# 68. MALWARE

Documentos entrantes:

idealmente:

```txt
upload
→ quarantine
→ scan
→ release
```

Especialmente archivos externos.

---

# 69. PREVIEW OF DOCUMENTS

No ejecutar:

```txt
HTML
JS
macros
embedded binaries
```

en navegador/editor.

Preferir conversión segura para preview.

---

# 70. PDF

Para PDF:

considerar vista previa renderizada.

No asumir PDF = seguro.

---

# 71. OFFICE FILES

DOCX/XLSX/PPTX:

no abrir automáticamente en servidor con herramientas inseguras.

Si se convierte:

aislar proceso.

---

# 72. ARCHIVES

ZIP/RAR:

limitar:

```txt
size
files
nested depth
decompression ratio
```

para evitar archive bombs.

---

# 73. PAYLOAD LOCAL API

Atención crítica:

cualquier uso de Local API debe respetar access control.

No utilizar:

```txt
overrideAccess: true
```

por defecto.

---

# 74. OVERRIDE ACCESS

Solo permitido en:

```txt
controlled server jobs
migrations
maintenance
```

y documentado.

---

# 75. API KEYS

Payload permite aplicar el mismo Access Control a API keys.

Crear API users con rol específico.

No crear:

```txt
super-admin-api-key
```

para todas las integraciones.

---

# 76. SERVICE ACCOUNTS

Ejemplos:

```txt
meilisearch-indexer
backup-worker
migration-service
```

Cada uno:

permisos mínimos.

---

# 77. ADMIN AUTH

Payload incluye operaciones de autenticación como login, logout, reset password y unlock.

Configurar:

- rate limiting;
- secure cookies;
- password rules;
- lockouts apropiados.

---

# 78. MFA

Para:

```txt
administrator
editor_in_chief
investigative_editor
```

MFA debe considerarse requisito de producción.

Si Payload core no cubre la UX deseada:

implementar estrategia compatible o identity layer adicional.

---

# 79. SESSION SECURITY

Cookies:

```txt
HttpOnly
Secure
SameSite
```

Sesión con expiración razonable.

---

# 80. PRIVILEGED SESSION

Operaciones de alto riesgo:

requerir sesión reciente.

Ejemplo:

```txt
role change
restricted download
classification change
```

---

# 81. PASSWORD RESET

Reset de contraseña:

- token de corta vida;
- invalidar después de uso;
- no revelar existencia de cuenta innecesariamente;
- registrar evento.

---

# 82. ACCOUNT DISABLE

`status`:

```txt
active
suspended
disabled
```

Disabled:

no login.

---

# 83. OFFBOARDING

Cuando alguien abandona:

```txt
disable account
revoke API keys
revoke evidence grants
invalidate sessions
review recent activity
```

---

# 84. ROLE CHANGE

Cambio de rol privilegiado:

auditable.

Idealmente:

reautenticación.

---

# 85. ADMIN UI

La UI debe mostrar solo acciones permitidas.

Pero esto es UX.

Seguridad sigue en Access Control.

---

# 86. ERROR RESPONSES

No revelar:

```txt
resource exists but you lack permission
```

cuando eso exponga información sensible.

Para restricted puede responder:

```txt
404
```

en ciertos contextos.

---

# 87. API ERROR DETAILS

Producción:

no devolver stack traces.

Logs internos:

sí.

---

# 88. THREAT MODEL

Modelar amenazas por activos.

Activos:

```txt
CMS accounts
published content
draft content
evidence
restricted evidence
author identities
configuration
credentials
audit logs
```

---

# 89. THREAT ACTORS

Considerar:

```txt
anonymous attacker
credential thief
malicious insider
compromised journalist account
bot
scraper
former employee
misconfigured service
```

---

# 90. THREAT: STOLEN EDITOR ACCOUNT

Impacto:

```txt
malicious publication
draft theft
evidence exposure
```

Mitigaciones:

```txt
MFA
least privilege
session control
audit
restricted grants
```

---

# 91. THREAT: COMPROMISED ADMIN

Impacto alto.

Mitigaciones:

```txt
separation of duties
MFA
no automatic evidence access
audit
network security
```

---

# 92. THREAT: MALICIOUS INSIDER

Mitigaciones:

```txt
need-to-know
classification
audit
four-eyes declassification
limited deletes
```

---

# 93. THREAT: OBJECT URL LEAK

Presigned URL compartida.

Mitigaciones:

```txt
short expiration
TLS
no logging URL
limited scope
audit generation
```

---

# 94. THREAT: MINIO CREDENTIAL LEAK

Mitigaciones:

```txt
service-specific policy
rotation
no browser exposure
secret storage
network isolation
```

---

# 95. THREAT: SQL INJECTION

Use ORM/query APIs correctly.

Validate input.

No construir raw queries a partir de inputs.

---

# 96. THREAT: BROKEN ACCESS CONTROL

Objetivo de pruebas prioritario.

OWASP ASVS debe utilizarse como baseline verificable.

Tests:

```txt
Reporter cannot publish
Reporter cannot change role
Editor cannot access unrelated restricted evidence
Anonymous cannot read draft
API key cannot bypass role
```

---

# 97. THREAT: IDOR

Nunca confiar en:

```txt
/api/evidence/123
```

sin verificar acceso al objeto específico.

Authorization por recurso en cada request.

---

# 98. THREAT: MASS ASSIGNMENT

No permitir que inputs arbitrarios actualicen:

```txt
role
classification
status
publishedAt
```

sin field access.

---

# 99. THREAT: XSS

Portable Text, embeds y custom HTML:

sanitizar.

Evitar campos HTML libres.

---

# 100. THREAT: SSRF

Especial atención a:

```txt
remote image import
URL embeds
document fetch
webhooks
```

No permitir URLs internas arbitrarias.

---

# 101. THREAT: FILE UPLOAD

Mitigaciones:

```txt
size limits
type validation
random keys
quarantine
malware scan
no execution
```

---

# 102. THREAT: CSRF

Proteger operaciones mutables según mecanismo de sesión.

No asumir same-site elimina todo riesgo.

---

# 103. THREAT: BRUTE FORCE

Login:

```txt
rate limit
temporary lock
monitoring
MFA
```

---

# 104. THREAT: SESSION THEFT

Mitigaciones:

```txt
Secure cookies
HttpOnly
TLS
shorter privileged sessions
re-auth sensitive actions
```

---

# 105. THREAT: SECRET LEAK THROUGH LOGS

Implementar redaction en logger.

Nunca serializar env completo.

---

# 106. THREAT: SEARCH INDEX LEAK

Meilisearch solo recibe:

```txt
published public content
```

Nunca metadata restricted.

---

# 107. THREAT: BACKUP LEAK

Backups contienen información altamente sensible.

Requieren:

```txt
encryption
restricted access
offsite security
retention
```

---

# 108. THREAT: MISCLASSIFICATION

Humano marca restricted como public.

Mitigación:

```txt
confirmation
four-eyes
preview
audit
```

---

# 109. THREAT: ACCIDENTAL PUBLISH

Investigaciones:

require explicit publish action.

No auto-publish al terminar revisión.

---

# 110. SECURITY TESTING

CI:

```txt
unit access tests
integration authorization tests
lint
typecheck
dependency review
```

---

# 111. ACCESS TEST MATRIX

Crear tests automatizados:

```txt
Role × Resource × Operation × Status
```

Ejemplo:

```txt
Reporter
Article Draft Own
Update
ALLOW

Reporter
Article Published
Update
DENY
```

---

# 112. FIELD ACCESS TESTS

Testear:

```txt
role
classification
legalStatus
factCheckStatus
```

por API, no únicamente Admin.

---

# 113. API KEY TESTS

Confirmar que API keys no evitan access control.

---

# 114. EVIDENCE TESTS

Test:

```txt
anonymous restricted
→ DENY

reporter unrelated restricted
→ DENY

authorized investigator
→ ALLOW temporary URL
```

---

# 115. AUDIT TESTS

Acciones críticas deben generar evento.

Si la acción falla:

registrar:

```txt
result = denied
```

cuando corresponda.

---

# 116. SECURITY ACCEPTANCE STANDARD

Usar OWASP ASVS como baseline de verificación de seguridad técnica.

No es necesario implementar “todo enterprise” desde v1.

Pero controles relevantes al threat model deben estar explícitamente cubiertos.

---

# 117. ADMIN SECURITY CHECKLIST

Antes de producción:

```txt
MFA privileged users
rate limiting
secure cookies
no shared accounts
role tests
field access tests
audit enabled
admin not indexed
TLS
session expiration
```

---

# 118. EVIDENCE SECURITY CHECKLIST

```txt
separate buckets
policies applied
root keys unused
object keys random
checksums
versioning
short presigned URLs
audit downloads
restricted grants
no search indexing
no sitemap
```

---

# 119. PUBLISH CHECKLIST

Para investigación:

```txt
fact check complete
legal review complete
evidence classification reviewed
public attachments confirmed
author approved
editor approval
```

---

# 120. DECLASSIFICATION CHECKLIST

```txt
correct evidence selected
PII reviewed
source identity reviewed
metadata reviewed
legal reviewed
second approval
audit event
```

---

# 121. PII REVIEW

Antes de publicar documentos:

revisar:

- nombres;
- teléfonos;
- emails;
- direcciones;
- firmas;
- identificadores;
- metadata.

Redactar cuando corresponda.

---

# 122. SOURCE PROTECTION

No guardar identidad confidencial dentro de:

```txt
article
evidence title
filename
audit metadata
Meilisearch
```

---

# 123. PUBLIC DOCUMENT COPY

Cuando un documento restricted se publique:

preferir generar/cargar una copia pública revisada.

No cambiar simplemente permisos del objeto original sensible.

---

# 124. DERIVATIVE MODEL

Ejemplo:

```txt
restricted/original.pdf

↓ editorial review

public/redacted-public-copy.pdf
```

Mantener relación interna.

---

# 125. ORIGINAL PRESERVATION

Original restricted:

permanece inmutable cuando corresponda.

Public version:

se trata como derivado.

---

# 126. SECURITY DOCUMENTATION

Crear:

```txt
/docs/security/
```

con:

```txt
rbac.md
access-matrix.md
evidence-classification.md
evidence-access.md
threat-model.md
audit.md
incident-response.md
offboarding.md
declassification.md
```

---

# 127. SECURITY OWNER

Definir responsable.

No dejar seguridad como “responsabilidad de todos”, que suele significar responsabilidad de nadie.

---

# 128. QUARTERLY REVIEW

Cada trimestre revisar:

```txt
users
roles
grants
API keys
restricted access
unused accounts
audit anomalies
```

---

# 129. SECURITY INCIDENT

Ejemplo:

credencial comprometida.

Flujo:

```txt
disable/revoke
↓
contain
↓
rotate
↓
audit
↓
assess data access
↓
recover
↓
document
```

---

# 130. EVIDENCE INCIDENT

Si se sospecha fuga:

```txt
identify object
review access log
revoke grants
rotate service keys if needed
assess URL lifetime
preserve logs
escalate editorial/legal
```

---

# 131. IMPORTANT LIMITATION

Presigned URL ya emitida puede funcionar hasta expiración.

Por eso:

```txt
restricted URLs must be very short-lived
```

---

# 132. DON'T BUILD SECURITY THEATRE

No introducir:

```txt
10 confirmation modals
complex password rituals
arbitrary restrictions
```

que no mitiguen amenazas reales.

---

# 133. PRIORITY ORDER

Prioridad v1:

```txt
1. Authentication
2. RBAC
3. Field Access
4. Workflow enforcement
5. Evidence isolation
6. Presigned authorization
7. Audit
8. MFA privileged users
9. Backup security
10. Threat tests
```

---

# 134. DEFINITION OF DONE

Este sistema estará listo cuando:

```txt
Un usuario sin permiso no pueda obtener datos usando:
Admin UI
REST API
GraphQL
Local API expuesta incorrectamente
direct object URL
search
```

y cuando las operaciones críticas sean auditables.

---

# 135. PRINCIPIO FINAL

El objetivo no es impedir que los periodistas hagan su trabajo.

El objetivo es conseguir que:

```txt
cada persona vea solo lo que necesita,
cada operación sensible requiera autoridad real,
cada evidencia conserve contexto e integridad,
y cada acción importante deje trazabilidad.
```

**El CMS administra periodismo.  
El Evidence Vault protege evidencia.  
Ninguno debe confiar implícitamente en el otro.**