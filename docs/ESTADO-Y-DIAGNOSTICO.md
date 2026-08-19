# Estado del proyecto y diagnóstico honesto

2026-08-19

Este documento responde tres preguntas: qué está pasando, qué falta, y qué se
arregla ya. Todo lo que afirmo está medido; donde no lo esté, lo digo.

---

## 1. La respuesta corta

**No estás viendo un proyecto que sale mal. Estás viendo un proyecto que avanza
44 veces más lento de lo que debería, y esa lentitud convierte cada error normal
en media hora de espera.**

La causa principal es medible y no es una opinión:

```txt
Disco externo (donde vive el repo)     26,9 MB/s
Disco interno                        1.187,0 MB/s
                                     ─────────────
                                     44× más lento
```

Sobre ese disco viven 2,1 GB de artefactos que se leen y escriben en cada ciclo:

```txt
node_modules            931 MB
.playwright-browsers    849 MB
.next                   342 MB
```

Un build que en el disco interno tardaría ~40 segundos tarda entre **3 y 7
minutos**. Una corrida de pruebas completa, entre **4 y 8 minutos**. Eso
significa que corregir una línea y comprobarla cuesta cerca de diez minutos.
Cuando algo falla tres veces seguidas —que es lo normal al integrar— son treinta
minutos de pantalla en los que parece que todo se rompe.

No se rompe más que en cualquier otro proyecto. Se tarda 44 veces más en
demostrar que está arreglado.

---

## 2. Los "tantos errores": qué eran realmente

Conté lo que pasó por pantalla en esta sesión y lo separé en tres montones,
porque no son lo mismo y mezclarlos es lo que genera la sensación de caos.

### 2.1 Defectos reales que las pruebas encontraron (10)

Estos existían y habrían llegado a producción. Encontrarlos es la prueba
haciendo su trabajo, no el proyecto fallando:

| Qué | Por qué importaba |
| --- | --- |
| Una cuenta deshabilitada respondía distinto que una contraseña incorrecta | Permite enumerar qué cuentas existen |
| `/api/payload-jobs` era legible por un `author` | Lista en vivo de qué piezas sin publicar existen |
| Se podían subir SVG a la biblioteca | Un SVG puede llevar `<script>` y se sirve desde nuestro dominio |
| El original publicado conservaba EXIF | Una foto de teléfono lleva las coordenadas de dónde se tomó |
| Se podía borrar una imagen que un artículo publicado mostraba | Rompe contenido vivo |
| Los redirects se escribían y nadie los leía | Cambiar un slug rompía la URL anterior |
| `max-image-preview` solo bajo `googleBot` | Ningún otro rastreador lo veía |
| El sitemap se horneaba en el build, con la base vacía | Publicaba un mapa de una sola página |
| El redirect de artículos apuntaba a una URL muerta | Redirect roto en los dos extremos |
| `media:regenerate` recalculaba las huellas | Rompía la detección de duplicados en silencio |

De estos, **cuatro los introduje yo** en fases anteriores y los arreglé después:
la CSP con `upgrade-insecure-requests`, el redirect de artículos que quedó
obsoleto al cambiar las URL en F16, el sitemap horneado, y las huellas de
`media:regenerate`. Los otros seis venían del diseño original o de Payload.

### 2.2 Fricción mía: tiempo puro perdido

Esto sí es responsabilidad mía y es lo que más caro salió:

- **Depuré durante ~40 minutos un build viejo.** `pnpm test:e2e` **no compila** y
  reutiliza el servidor existente. Mis correcciones en `src/` no se estaban
  ejecutando: el mismo error 500 se repetía mientras la misma función, llamada
  desde el código fuente, funcionaba bien. Debí comprobar eso a los dos minutos,
  no a los cuarenta.
- **Borré `.next` antes de casi cada build.** A veces hacía falta (una caché a
  medias ya colgó un build en este disco), pero no siempre. Cada borrado tira la
  caché incremental y paga el coste completo sobre un disco de 27 MB/s.
- **Escribí pruebas antes de verificar la forma real de la API.** Tres veces:
  Payload espera los campos en una parte `_payload` del multipart; el endpoint de
  búsqueda devuelve `plainTitle`, no `title`; y `login()` deja una cookie que
  Payload prefiere sobre la cabecera. Cada equivocación costó un ciclo completo
  de pruebas.
- **Adiviné dos veces en vez de medir.** La hipótesis de la CSP me costó tres
  reinicios inútiles antes de descubrir que las cabeceras se hornean en el build.

Con un disco normal, todo esto habría sido molesto. Con este disco, fue media
tarde.

### 2.3 Trampas del entorno, no del código

- Un WebKit en frío tarda ~25 s en su primera navegación en esta máquina (256 ms
  en caliente). Con cuatro procesos arrancando a la vez, ocho pruebas agotaban
  los 90 segundos sobre una página que el servidor entrega en 30 ms.
- `payload migrate` abre un **prompt interactivo** cuando detecta cambios de
  desarrollo. Parece colgado. No lo está: está esperando una respuesta.

---

## 3. El otro factor: la especificación

Esto no explica los errores, pero sí explica el volumen de trabajo.

```txt
PRD activos          11.118 líneas
PRD archivados       10.823 líneas
                     ──────────────
                     21.941 líneas de especificación

Código propio        27.418 líneas
Documentación        24.185 líneas
```

**Hay casi tanta documentación como código.** Y el modelo de datos tiene 18
colecciones con 196 campos.

Tenés razón en la intuición: un periódico digital no necesita 22.000 líneas de
especificación. Ya lo corregiste una vez —la simplificación del 18 de agosto
quitó nueve roles, el Evidence Vault y el microservicio de denuncias— y fue la
decisión correcta. Pero los PRD siguen mandando el plan por fases, y cada
sección numerada genera un requisito, que genera código, que genera pruebas, que
generan ciclos de diez minutos.

**Dónde sí está justificado el peso.** Sos un medio de investigación en
Colombia. Que una foto no publique las coordenadas de la casa de una fuente, que
un borrador no sea visible, que no se pueda distinguir una cuenta deshabilitada
de una contraseña mal escrita: eso no es "candado de la CIA", es lo mínimo
cuando publicar tiene consecuencias para personas reales.

**Dónde está de más.** El flujo editorial tiene ocho estados con validación de
transiciones. Para una redacción chica es ceremonia: obliga a pasar por
`fact_check` y `approved` antes de publicar aunque sean la misma persona en la
misma tarde. Eso se puede aflojar sin tocar nada de seguridad.

---

## 4. Estado real, hoy

### Lo que está hecho y verificado

```txt
F0–F14   base, diseño, Payload, RBAC, contenido, investigaciones,
         frontend, portada, artículo, perfiles, búsqueda
F15      pipeline de medios
F16      SEO, JSON-LD, sitemaps
F17      redirects, correcciones, 404 editorial
F18      cola de trabajos y UX de publicación
F19–F21  Docker, despliegue, denuncias
```

```txt
typecheck   limpio
lint        limpio
unit        321 pruebas
e2e         226 pruebas
migración   base vacía → 4 migraciones → correcto
build       limpio
```

El sitio está vivo en `https://clasificadoscolombia.co` con TLS, CSP y HSTS.

### Un hallazgo importante que salí a comprobar ahora

**Lo que está desplegado es el commit `51cf721`.** F15, F16, F17 y F18 están
commiteadas pero **no desplegadas**. Se comprueba directo:

```txt
https://clasificadoscolombia.co/sitemap.xml   →  404
```

Es decir: cuatro fases de trabajo —incluido todo el SEO— están en el repositorio
y no en el aire. Desplegar eso es lo más rentable que se puede hacer hoy.

### Lo que falta

**F22** es la última fase, y tal como está especificada es enorme: QA de RBAC,
mappers de frontera pública, auditoría WCAG 2.2 AA con lector de pantalla, ocho
breakpoints, Core Web Vitals, MFA para usuarios privilegiados, rotación de
secretos documentada.

**Tres decisiones tuyas siguen abiertas:**

1. **Override de derechos de imagen.** El PRD permite publicar con licencia
   desconocida mediante una excepción auditada. No la implementé: convierte en
   una casilla la única decisión que tiene que tomar una persona. Si la querés,
   se añade.
2. **Los medios van a disco local**, no a MinIO. Con volumen persistente, así que
   es duradero, pero se aparta de lo que dice `CLAUDE.md` §24. Conviene decidirlo
   a propósito y no por inercia.
3. **La contraseña de CyberPanel** que imprimí sin querer en la conversación
   sigue sin rotar.

---

## 5. Qué se arregla ya, sin pedirte nada

Estas tres las hago ahora mismo si me decís que siga:

1. **Dejar de borrar `.next` por defecto.** Solo cuando la caché quedó a medias
   por un build interrumpido. Ahorra entre 2 y 4 minutos por ciclo.
2. **Que `pnpm test:e2e` avise si el build está viejo.** Una comprobación de
   fechas entre `src/` y `.next/`. Convierte mi error de 40 minutos en un aviso
   de una línea, para siempre.
3. **Recortar F22 a lo que de verdad bloquea un lanzamiento**, y dejar el resto
   documentado como trabajo posterior. Propuesta concreta abajo.

### F22 recortada — propuesta

| Se hace | Se deja para después |
| --- | --- |
| QA de RBAC contra la API (ya existe, se completa) | MFA para usuarios privilegiados |
| Que no se filtren borradores ni denuncias en búsqueda | Auditoría con lector de pantalla |
| `axe` automatizado en las páginas principales | QA manual de los 8 breakpoints |
| Los 4 breakpoints reales (360 / 768 / 1024 / 1440) | Core Web Vitals con presupuesto formal |
| Checklist de producción de `CLAUDE.md` §94 | Mappers públicos para colecciones que aún no se sirven |
| Rotación de secretos documentada | |

Eso cierra el riesgo de lanzamiento y quita de encima aproximadamente la mitad
del trabajo especificado.

---

## 6. Qué necesita tu decisión

### La que más impacto tiene: dónde viven los artefactos de build

Tenés una regla explícita —nada ocupa el disco interno sin que lo decidas vos— y
por eso no lo he tocado. Pero es el cuello de botella medido:

| Opción | Qué implica | Ganancia |
| --- | --- | --- |
| **A. Todo sigue igual** | Sin cambios | Ninguna. Cada ciclo sigue en 10 min |
| **B. Mover solo los navegadores de prueba** (849 MB) | Enlace simbólico al disco interno | Arranque de WebKit deja de tardar 25 s; menos pruebas inestables |
| **C. Mover también `node_modules` y `.next`** (2,1 GB) | El código fuente sigue en el externo; solo lo regenerable se va al interno | Build de ~40 s en vez de 3–7 min. **Es la diferencia real** |
| **D. Mover el repositorio entero** | ~2,5 GB en el interno | Igual que C |

Mi recomendación es **C**: el código y los documentos —lo que de verdad es
tuyo— siguen en el disco externo. Al interno solo va lo que se regenera con
`pnpm install` y `pnpm build`, y se puede borrar en cualquier momento sin perder
nada.

### Las otras tres

- ¿Implemento el override de derechos de imagen, o se queda como está?
- ¿Los medios se quedan en disco local, o los llevo a MinIO?
- ¿Rotás la contraseña de CyberPanel?

---

## 7. ¿Conviene rehacerlo de otra forma?

**No.** Y no lo digo por defender lo hecho, sino porque el diagnóstico no apunta
ahí.

Empezar de nuevo arreglaría cero de los tres problemas reales: el disco seguiría
a 27 MB/s, los PRD seguirían teniendo 11.000 líneas, y las trampas del entorno
seguirían siendo las mismas. Y costaría todo lo construido: 321 pruebas
unitarias, 226 de extremo a extremo, cuatro migraciones que replican desde cero,
y un sitio que ya está en el aire.

Lo que sí conviene rehacer es **la forma de trabajar en lo que queda**:

- Menos ciclos completos. Probar el archivo que cambió, no la suite entera, hasta
  que la fase esté cerrada.
- Verificar la forma real de una API antes de escribir la prueba que la usa.
- Medir antes de suponer. Las dos veces que adiviné en esta sesión, perdí más
  tiempo que investigando.

Y **aflojar el flujo editorial** si querés: pasar de ocho estados a cuatro
(borrador → revisión → aprobado → publicado) es un cambio contenido, no toca
seguridad, y le quita ceremonia diaria a la redacción. Decime si lo querés y lo
propongo aparte.

---

## 8. Lo que haría ahora, por orden

1. **Desplegar lo que ya está commiteado** (F15–F18). Cuatro fases de trabajo,
   incluido todo el SEO, están en el repositorio y no en producción.
2. **Decidir lo del disco.** Es lo único que cambia el ritmo de todo lo demás.
3. **F22 recortada** con el alcance de arriba.
4. **Lanzar.**

Con el disco resuelto, lo que queda son días, no semanas.
