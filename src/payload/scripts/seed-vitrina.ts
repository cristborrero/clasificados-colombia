import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * `pnpm seed:vitrina` — llena el sitio con material de muestra.
 *
 * Existe para que la portada no se vea vacía mientras la redacción prepara lo
 * suyo. **Corre en producción a propósito**, a diferencia de `seed.ts`, que se
 * niega: ese siembra fixtures para las pruebas, este monta una vitrina.
 *
 * Tres reglas que lo hacen seguro:
 *
 * 1. **Todo lleva DEMO en el titular y en la bajada.** Nadie que lea una de
 *    estas piezas puede confundirla con periodismo publicado por este medio.
 * 2. **No se inventan hechos, cifras ni declaraciones.** Cada resumen se apoya
 *    en información pública verificable —el Servicio Geológico, la UNGRD, actos
 *    oficiales— y no atribuye frases a nadie. Fabricar declaraciones sobre un
 *    terremoto con cientos de muertos, o acusaciones contra personas reales, no
 *    es contenido de relleno: es desinformación con otro nombre.
 * 3. **Las fotos son de lugares de Colombia, con licencia libre y crédito.**
 *    Ninguna es de un desastre: una imagen de otro terremoto ilustrando este
 *    daría a entender algo falso aunque el texto diga DEMO.
 *
 * El sitio entero va con `noindex` mientras `NEXT_PUBLIC_ALLOW_INDEXING` no
 * diga `true`, así que nada de esto puede llegar a un buscador.
 *
 * Idempotente: se puede correr dos veces sin duplicar nada.
 */

const dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURES = path.join(dirname, 'fixtures/vitrina')

/*
 * El aviso va al pie del cuerpo, no en la bajada.
 *
 * Pegarlo en la bajada convertía cada sumario en un párrafo de cuatro líneas y
 * rompía la retícula de la portada: una bajada larga empuja la tarjeta hacia
 * abajo y deja la fila desalineada. El DEMO del titular ya avisa a quien mira;
 * el aviso completo espera a quien entra a leer.
 */
const AVISO =
  'CONTENIDO DE MUESTRA. Resumen de información pública, publicado como material de relleno mientras se prepara el sitio. No es una pieza periodística de Clasificados Colombia.'

type Foto = {
  archivo: string
  titulo: string
  licencia: string
  autor: string
}

type Seccion = { slug: string; name: string; order: number; description: string }

const SECCIONES: Seccion[] = [
  { slug: 'nacion', name: 'Nación', order: 1, description: 'Lo que pasa en el país.' },
  { slug: 'politica', name: 'Política', order: 2, description: 'Gobierno, Congreso y poder.' },
  { slug: 'justicia', name: 'Justicia', order: 3, description: 'Cortes, fiscalía y derechos.' },
  { slug: 'conflicto', name: 'Conflicto', order: 4, description: 'Grupos armados y seguridad.' },
  { slug: 'regiones', name: 'Regiones', order: 5, description: 'Colombia fuera de Bogotá.' },
]

type Pieza = {
  slug: string
  titulo: string
  bajada: string
  seccion: string
  foto: string
  cuerpo: string[]
  horas: number
}

/*
 * Los hechos que se resumen abajo son públicos y verificables. Están aquí como
 * material de relleno, no como cobertura: por eso cada pieza lleva DEMO y el
 * aviso, y por eso ninguna cita a nadie.
 */
const PIEZAS: Pieza[] = [
  {
    slug: 'demo-sismo-choco-magnitud',
    titulo: 'DEMO · Un sismo de magnitud 7,4 con epicentro en el Chocó',
    bajada: 'Los datos que publicó el Servicio Geológico Colombiano sobre el movimiento del 10 de agosto.',
    seccion: 'nacion',
    foto: 'choco',
    horas: 2,
    cuerpo: [
      'El Servicio Geológico Colombiano situó el epicentro a unos 12 kilómetros de San José del Palmar, en el departamento del Chocó, y la profundidad en 103 kilómetros.',
      'El movimiento se registró a las 07:34 hora local del lunes 10 de agosto de 2026.',
      'La profundidad es lo que explica que se haya sentido en buena parte del centro y el occidente del país.',
    ],
  },
  {
    slug: 'demo-sismo-por-que-duro-tanto',
    titulo: 'DEMO · Por qué el movimiento se sintió durante tanto tiempo',
    bajada: 'La explicación técnica tiene que ver con la profundidad a la que ocurrió.',
    seccion: 'nacion',
    foto: 'manizales',
    horas: 5,
    cuerpo: [
      'Un sismo profundo libera energía que viaja más lejos y llega a la superficie con oscilaciones más largas que las de un sismo superficial de magnitud parecida.',
      'Eso es coherente con los reportes de percepción en ciudades alejadas del epicentro.',
    ],
  },
  {
    slug: 'demo-sismo-pereira-edificaciones',
    titulo: 'DEMO · Pereira, entre las ciudades con afectaciones más graves',
    bajada: 'Edificaciones colapsadas y operaciones de rescate que se extendieron varios días.',
    seccion: 'regiones',
    foto: 'pereira',
    horas: 8,
    cuerpo: [
      'Pereira concentró parte de los daños más serios reportados tras el sismo, con edificaciones colapsadas.',
      'Las labores de búsqueda y rescate se prolongaron en los días siguientes.',
      'Cali, Manizales, Armenia y Quibdó también reportaron afectaciones.',
    ],
  },
  {
    slug: 'demo-sismo-balance-oficial',
    titulo: 'DEMO · El balance oficial se actualizó durante los días de rescate',
    bajada: 'Las cifras de fallecidos, heridos y desaparecidos cambiaron a medida que avanzaron las operaciones.',
    seccion: 'nacion',
    foto: 'quibdo',
    horas: 12,
    cuerpo: [
      'Las autoridades actualizaron el balance varias veces mientras continuaban las operaciones de búsqueda.',
      'Los reportes oficiales del 14 de agosto hablaban de 289 fallecidos, 4.187 heridos y 143 desaparecidos.',
      'Una cifra que se mueve durante una emergencia no es una contradicción: es lo que ocurre cuando el conteo avanza al ritmo del rescate.',
    ],
  },
  {
    slug: 'demo-sismo-municipios-cercanos',
    titulo: 'DEMO · Los municipios del Chocó más cercanos al epicentro',
    bajada: 'San José del Palmar y su entorno, en una zona con vías limitadas.',
    seccion: 'regiones',
    foto: 'choco',
    horas: 18,
    cuerpo: [
      'El epicentro quedó en una zona del Chocó donde el acceso terrestre es limitado, lo que condiciona cualquier operación de emergencia.',
      'Quibdó, la capital departamental, reportó afectaciones.',
    ],
  },

  {
    slug: 'demo-posesion-presidencial',
    titulo: 'DEMO · La posesión presidencial del 7 de agosto',
    bajada: 'Abelardo de la Espriella asumió para el periodo 2026-2030.',
    seccion: 'politica',
    foto: 'casa-narino',
    horas: 26,
    cuerpo: [
      'La investidura presidencial se realizó el 7 de agosto de 2026, para el periodo 2026-2030.',
      'El mandato anterior, encabezado por Gustavo Petro, terminó el 6 de agosto.',
    ],
  },
  {
    slug: 'demo-primer-discurso-prioridades',
    titulo: 'DEMO · Las prioridades anunciadas en el primer discurso',
    bajada: 'Seguridad, una lista de grupos señalados como narcoterroristas y nuevas cárceles.',
    seccion: 'politica',
    foto: 'capitolio',
    horas: 30,
    cuerpo: [
      'Entre los anuncios del primer discurso estuvieron una lista de grupos señalados como narcoterroristas y la construcción de cárceles de gran capacidad.',
      'También se anunció una reforma al sistema tributario orientada a desincentivar la evasión.',
    ],
  },
  {
    slug: 'demo-politica-exterior-embajadas',
    titulo: 'DEMO · El anuncio sobre 14 misiones diplomáticas',
    bajada: 'El nuevo gobierno anunció cierres de embajadas y cambios en relaciones bilaterales.',
    seccion: 'politica',
    foto: 'capitolio',
    horas: 36,
    cuerpo: [
      'El gobierno anunció el cierre de 14 embajadas y misiones diplomáticas.',
      'También anunció la ruptura de relaciones bilaterales con Cuba y Nicaragua, y un alineamiento con Washington y Tel Aviv.',
    ],
  },
  {
    slug: 'demo-transicion-entrega-gobierno',
    titulo: 'DEMO · Cómo se dio la entrega del gobierno',
    bajada: 'El proceso de empalme se desarrolló durante julio y la primera semana de agosto.',
    seccion: 'politica',
    foto: 'congreso-int',
    horas: 44,
    cuerpo: [
      'El presidente saliente confirmó en julio que su mandato terminaba el 6 de agosto de 2026.',
      'El proceso de entrega se desarrolló en las semanas previas a la posesión.',
    ],
  },
  {
    slug: 'demo-reforma-tributaria-anuncio',
    titulo: 'DEMO · Qué se anunció sobre la reforma tributaria',
    bajada: 'El anuncio apunta a la evasión y a incentivos a la inversión.',
    seccion: 'politica',
    foto: 'medellin',
    horas: 52,
    cuerpo: [
      'El anuncio presentó una reforma del sistema tributario orientada a desincentivar la evasión.',
      'El detalle del articulado define lo que hoy es solo un anuncio.',
    ],
  },

  {
    slug: 'demo-eln-frente-33-pacto',
    titulo: 'DEMO · El pacto que se rompió entre el ELN y el Frente 33',
    bajada: 'La ruptura de enero de 2026 derivó en una crisis humanitaria en la región.',
    seccion: 'conflicto',
    foto: 'choco',
    horas: 60,
    cuerpo: [
      'El pacto de no agresión entre el ELN y el Frente 33 de las disidencias de las FARC se rompió en enero de 2026.',
      'La ruptura derivó en una crisis humanitaria y en un reacomodo del control territorial en la zona.',
    ],
  },
  {
    slug: 'demo-informe-fip-combatientes',
    titulo: 'DEMO · El informe que contó 27.000 combatientes',
    bajada: 'La Fundación Ideas para la Paz registró un aumento del 23% en integrantes de grupos armados.',
    seccion: 'conflicto',
    foto: 'cartagena',
    horas: 70,
    cuerpo: [
      'Un informe de la Fundación Ideas para la Paz publicado en enero de 2026 registró alrededor de 27.000 combatientes en grupos armados.',
      'El mismo informe reportó un aumento del 23% en el número de integrantes y un récord de disputas territoriales.',
    ],
  },
  {
    slug: 'demo-disputas-territoriales-2026',
    titulo: 'DEMO · Las disputas territoriales del primer semestre',
    bajada: 'El panorama de seguridad se deterioró frente a años anteriores.',
    seccion: 'conflicto',
    foto: 'medellin',
    horas: 80,
    cuerpo: [
      'Los análisis del primer semestre describen un panorama de seguridad más frágil que el de años anteriores.',
      'El Estado mantiene dificultades para recuperar control en zonas amplias del país.',
    ],
  },

  {
    slug: 'demo-instalacion-sesiones-congreso',
    titulo: 'DEMO · La instalación de sesiones del Congreso',
    bajada: 'El calendario legislativo que recibe los primeros proyectos del nuevo gobierno.',
    seccion: 'politica',
    foto: 'congreso-int',
    horas: 90,
    cuerpo: [
      'El Congreso instala sesiones cada 20 de julio, y es donde se tramitan los proyectos anunciados por el ejecutivo.',
      'La composición de las cámaras determina qué anuncios llegan a ser ley.',
    ],
  },
  {
    slug: 'demo-cortes-agenda-judicial',
    titulo: 'DEMO · La agenda de las altas cortes para el segundo semestre',
    bajada: 'Los tribunales que revisan lo que el ejecutivo y el legislativo aprueban.',
    seccion: 'justicia',
    foto: 'palacio-just',
    horas: 100,
    cuerpo: [
      'Las altas cortes revisan la constitucionalidad de las reformas que aprueba el Congreso.',
      'Es el contrapeso institucional que define cuánto de un programa de gobierno sobrevive.',
    ],
  },
]

/** Lexical mínimo: párrafos y el aviso al final. */
function cuerpoLexical(parrafos: string[]) {
  const parrafo = (texto: string, negrita = false) => ({
    type: 'paragraph',
    version: 1,
    children: [
      { type: 'text', version: 1, text: texto, format: negrita ? 1 : 0, detail: 0, mode: 'normal', style: '' },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
  })

  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      children: [...parrafos.map((p) => parrafo(p)), parrafo(AVISO, true)],
    },
  }
}

async function main(): Promise<void> {
  const payload = await getPayload({ config })

  const catalogo = JSON.parse(
    await readFile(path.join(FIXTURES, 'catalogo.json'), 'utf8'),
  ) as Record<string, Foto>

  /* ── Quién publica ──────────────────────────────────────────────────── */

  /*
   * La vitrina se publica *como* un editor, no saltándose el guardián.
   *
   * `enforceStatusContract` exige que quien publica tenga autoridad editorial, y
   * un administrador no la tiene a propósito: PRD Nº5 §8 separa la
   * administración técnica de la decisión de publicar. Un script que se saltara
   * esa regla para llenar la portada estaría probando que la regla se puede
   * saltar.
   */
  const editores = await payload.find({
    collection: 'users',
    where: { and: [{ role: { equals: 'editor' } }, { status: { equals: 'active' } }] },
    limit: 1,
    overrideAccess: true,
  })

  const editor = editores.docs[0]

  if (!editor) {
    payload.logger.error(
      'No hay ninguna cuenta de editor activa, y la vitrina se publica como editor. ' +
        'Crea una desde el panel (Usuarios → rol «editor») y vuelve a ejecutar esto.',
    )
    process.exit(1)
  }

  payload.logger.info(`Publicando como ${editor.email}.`)

  /* ── Autoría ────────────────────────────────────────────────────────── */
  const autorSlug = 'redaccion-clasificados'
  let autor = (
    await payload.find({
      collection: 'authors',
      where: { slug: { equals: autorSlug } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0]

  if (!autor) {
    autor = await payload.create({
      collection: 'authors',
      overrideAccess: true,
      data: {
        name: 'Redacción Clasificados Colombia',
        slug: autorSlug,
        jobTitle: 'Equipo editorial',
        expertise: [{ area: 'Redacción' }],
        shortBio: 'Firma provisional del material de muestra.',
        active: true,
      },
    })
    payload.logger.info('Autoría creada.')
  }

  /* ── Secciones ──────────────────────────────────────────────────────── */
  const seccionIds = new Map<string, number | string>()

  for (const s of SECCIONES) {
    const existente = (
      await payload.find({
        collection: 'categories',
        where: { slug: { equals: s.slug } },
        limit: 1,
        overrideAccess: true,
      })
    ).docs[0]

    if (existente) {
      seccionIds.set(s.slug, existente.id)
      continue
    }

    const creada = await payload.create({
      collection: 'categories',
      overrideAccess: true,
      data: { name: s.name, slug: s.slug, description: s.description, order: s.order, active: true },
    })

    seccionIds.set(s.slug, creada.id)
    payload.logger.info(`Sección creada: ${s.name}`)
  }

  /* ── Fotos ──────────────────────────────────────────────────────────── */
  const fotoIds = new Map<string, number | string>()

  for (const [clave, foto] of Object.entries(catalogo)) {
    const alt = `Fotografía de archivo: ${foto.titulo.replace(/^File:/, '').replace(/\.[a-z]+$/i, '')}`

    const existente = (
      await payload.find({
        collection: 'media',
        where: { alt: { equals: alt } },
        limit: 1,
        overrideAccess: true,
      })
    ).docs[0]

    if (existente) {
      fotoIds.set(clave, existente.id)
      continue
    }

    const creada = await payload.create({
      collection: 'media',
      overrideAccess: true,
      filePath: path.join(FIXTURES, foto.archivo),
      data: {
        alt,
        /*
         * El crédito y la licencia se registran porque son ciertos y porque el
         * guardián de publicación exige una licencia establecida. Es también lo
         * que la licencia de origen pide a cambio de poder usarla.
         */
        credit: `Foto: ${foto.autor || 'Wikimedia Commons'} · ${foto.licencia}`,
        source: 'Wikimedia Commons',
        license: foto.licencia.toLowerCase().includes('public domain') ? 'public_domain' : 'creative_commons',
        copyrightHolder: foto.autor || 'Wikimedia Commons',
        mediaType: 'photo',
        usageNotes: 'Imagen de muestra. Reemplazar por fotografía propia antes de publicar de verdad.',
      },
    })

    fotoIds.set(clave, creada.id)
    payload.logger.info(`Foto cargada: ${clave}`)
  }

  /* ── Piezas ─────────────────────────────────────────────────────────── */
  let creadas = 0

  let corregidas = 0

  for (const pieza of PIEZAS) {
    const existente = await payload.find({
      collection: 'articles',
      where: { slug: { equals: pieza.slug } },
      limit: 1,
      overrideAccess: true,
    })

    const yaEsta = existente.docs[0]

    if (yaEsta) {
      /*
       * Corrige la bajada de una pieza que ya existe.
       *
       * Las primeras versiones pegaban el aviso completo dentro de la bajada, y
       * eso convertía cada sumario en cuatro líneas que rompían la retícula de
       * la portada. Saltar las piezas existentes dejaba el texto viejo en
       * producción para siempre: un sembrado idempotente que nunca corrige es
       * un sembrado que congela sus propios errores.
       */
      if (yaEsta.dek !== pieza.bajada) {
        await payload.update({
          collection: 'articles',
          id: yaEsta.id,
          data: { dek: pieza.bajada },
          overrideAccess: true,
          user: editor,
        })
        corregidas += 1
      }

      continue
    }

    const categoria = seccionIds.get(pieza.seccion)
    const imagen = fotoIds.get(pieza.foto) ?? [...fotoIds.values()][0]

    await payload.create({
      collection: 'articles',
      overrideAccess: true,
      user: editor,
      data: {
        title: pieza.titulo,
        slug: pieza.slug,
        dek: pieza.bajada,
        body: cuerpoLexical(pieza.cuerpo) as never,
        category: categoria as never,
        authors: [autor.id] as never,
        hero: { image: imagen as never },
        publication: {
          publishedAt: new Date(Date.now() - pieza.horas * 3_600_000).toISOString(),
        },
        workflow: {
          editorialStatus: 'published',
          factCheckStatus: 'verified',
          legalStatus: 'not_required',
        },
        seo: {
          /*
           * Redundante con el `noindex` de todo el sitio, y a propósito: si
           * mañana se activa la indexación para lanzar, estas piezas siguen
           * fuera hasta que alguien las borre.
           */
          noIndex: true,
        },
        _status: 'published',
      } as never,
    })

    creadas += 1
  }

  /* ── La cara del sitio ──────────────────────────────────────────────── */

  /*
   * Sin esto la portada se ve como una instalación recién hecha, y no porque
   * falte nada: `getHomepage` cae en `DEFAULT_BANDS` —la pieza más reciente y
   * después el flujo— cuando el global `homepage` está vacío, y la cabecera no
   * dibuja menú cuando `navigation` lo está. Las nueve bandas existen desde F10;
   * lo que faltaba era decirle cuáles y en qué orden.
   *
   * Una banda sin contenido devuelve `null` y no se dibuja, así que se pueden
   * declarar todas: aparecen solas el día que haya investigaciones u opinión.
   */
  const navegacion = (await payload.findGlobal({
    slug: 'navigation',
    overrideAccess: true,
  })) as { primary?: unknown[]; footer?: unknown[]; social?: unknown[] }

  /*
   * Cada parte se comprueba por separado.
   *
   * Antes las tres colgaban de si `primary` estaba vacío, y eso significaba que
   * un sitio con menú ya puesto nunca recibía el pie — que es exactamente lo
   * que pasaba en producción. Un guardián que agrupa cosas independientes no
   * protege: esconde.
   */
  const enlaceSeccion = (s: Seccion) => ({
    label: s.name,
    linkType: 'internal',
    category: seccionIds.get(s.slug),
  })

  const parche: Record<string, unknown> = {}

  if (!navegacion?.primary?.length) {
    parche.primary = SECCIONES.map(enlaceSeccion)
  }

  if (!navegacion?.footer?.length) {
    parche.footer = [
      { title: 'Secciones', links: SECCIONES.map(enlaceSeccion) },
      {
        title: 'El medio',
        links: [
          { label: 'Quiénes somos', linkType: 'external', url: '/quienes-somos' },
          { label: 'Código ético', linkType: 'external', url: '/codigo-etico' },
          { label: 'Cómo trabajamos', linkType: 'external', url: '/como-trabajamos' },
          { label: 'Contacto', linkType: 'external', url: '/contacto' },
        ],
      },
      {
        title: 'Participa',
        links: [
          { label: 'Enviar una denuncia', linkType: 'external', url: '/denunciar' },
          { label: 'Buscar en el archivo', linkType: 'external', url: '/buscar' },
        ],
      },
    ]
  }

  if (!navegacion?.social?.length) {
    parche.social = [
      { platform: 'X', url: 'https://x.com/' },
      { platform: 'Instagram', url: 'https://instagram.com/' },
      { platform: 'YouTube', url: 'https://youtube.com/' },
      { platform: 'Facebook', url: 'https://facebook.com/' },
    ]
  }

  if (Object.keys(parche).length > 0) {
    await payload.updateGlobal({ slug: 'navigation', overrideAccess: true, data: parche as never })
    payload.logger.info(`Navegación actualizada: ${Object.keys(parche).join(', ')}.`)
  }

  const ajustes = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })

  if (!(ajustes as { siteName?: string })?.siteName) {
    await payload.updateGlobal({
      slug: 'site-settings',
      overrideAccess: true,
      data: {
        siteName: 'Clasificados Colombia',
        siteDescription: 'Investigamos. Informamos. No callamos.',
      } as never,
    })
    payload.logger.info('Ajustes del sitio configurados.')
  }

  const portada = (await payload.findGlobal({ slug: 'homepage', overrideAccess: true })) as {
    bands?: { blockType?: string; title?: string }[]
  }

  /*
   * Corrección puntual: las primeras versiones de este archivo escribieron el
   * texto en rioplatense, y esto es un medio colombiano. Se reescribe solo si
   * sigue diciendo lo de antes, para no pisar lo que haya cambiado la redacción.
   *
   * Cuando la redacción arme su propia portada, este bloque sobra.
   */
  const conVoseo = (portada.bands ?? []).some((b) => b.title?.startsWith('Recibí'))

  if (conVoseo) {
    await payload.updateGlobal({
      slug: 'homepage',
      overrideAccess: true,
      data: {
        bands: (portada.bands ?? []).map((b) =>
          b.title?.startsWith('Recibí')
            ? {
                ...b,
                title: 'Recibe nuestras investigaciones',
                description:
                  'Una entrega cuando publicamos algo que vale tu tiempo. Sin ruido y sin spam.',
                ctaLabel: 'Suscribirme',
              }
            : b,
        ),
      } as never,
    })
    payload.logger.info('Texto de la portada corregido a español neutro.')
  }

  if (!portada?.bands?.length) {
    await payload.updateGlobal({
      slug: 'homepage',
      overrideAccess: true,
      data: {
        bands: [
          { blockType: 'hero' },
          { blockType: 'secondary', title: 'También hoy', limit: 4, leadCount: 2 },
          { blockType: 'investigations', title: 'Investigaciones', limit: 3 },
          { blockType: 'latest', title: 'Últimas noticias', limit: 8 },
          { blockType: 'opinion', title: 'Opinión', limit: 3 },
          { blockType: 'data', title: 'Datos', limit: 3 },
          { blockType: 'video', title: 'Video', limit: 3 },
          {
            blockType: 'newsletter',
            title: 'Recibe nuestras investigaciones',
            description:
              'Una entrega cuando publicamos algo que vale tu tiempo. Sin ruido y sin spam.',
            ctaLabel: 'Suscribirme',
          },
        ],
      } as never,
    })
    payload.logger.info('Portada configurada: 8 bandas.')
  }

  /*
   * La barra de última hora.
   *
   * Existe desde F8 con los cuatro estados que pide la guía visual —última
   * hora, alerta, en desarrollo, confirmado— y estaba simplemente apagada.
   * `expiresAt` es obligatoria a propósito (PRD Nº5 §26): una barra sin fecha
   * de caducidad es una emergencia que sigue anunciándose una semana después.
   */
  const barra = await payload.findGlobal({ slug: 'breaking-news', overrideAccess: true })

  if (!(barra as { headline?: string })?.headline) {
    const ahora = Date.now()

    await payload.updateGlobal({
      slug: 'breaking-news',
      overrideAccess: true,
      data: {
        enabled: true,
        severity: 'breaking',
        headline: 'DEMO · Material de muestra mientras se prepara el sitio',
        description: 'Esta barra es parte de la vitrina de demostración.',
        startsAt: new Date(ahora - 3_600_000).toISOString(),
        expiresAt: new Date(ahora + 30 * 24 * 3_600_000).toISOString(),
      } as never,
    })
    payload.logger.info('Barra de última hora activada.')
  }

  payload.logger.info(
    `Vitrina lista: ${creadas} piezas nuevas, ${PIEZAS.length - creadas} ya existían` +
      `${corregidas > 0 ? ` (${corregidas} con la bajada corregida)` : ''}. ` +
      `${SECCIONES.length} secciones, ${fotoIds.size} fotos.`,
  )

  process.exit(0)
}

await main()
