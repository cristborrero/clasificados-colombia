import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURES = path.join(dirname, 'fixtures/opinion-drones')

export const OPINION_SLUG = 'seis-semanas-despues-de-la-promesa-llegaron-los-drones'

function textNode(text: string, bold = false) {
  return {
    type: 'text',
    version: 1,
    text,
    format: bold ? 1 : 0,
    detail: 0,
    mode: 'normal',
    style: '',
  }
}

function paragraph(text: string) {
  return {
    type: 'paragraph',
    version: 1,
    children: [textNode(text)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
  }
}

function heading(text: string, tag: 'h2' | 'h3' = 'h2') {
  return {
    type: 'heading',
    version: 1,
    tag,
    children: [textNode(text)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
  }
}

function bulletList(items: string[]) {
  return {
    type: 'list',
    version: 1,
    listType: 'bullet' as const,
    tag: 'ul' as const,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    children: items.map((item, index) => ({
      type: 'listitem',
      version: 1,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      value: index + 1,
      children: [textNode(item)],
    })),
  }
}

function pullQuoteBlock(text: string, attribution?: string, source?: string) {
  return {
    type: 'block',
    version: 1,
    format: '',
    fields: {
      blockType: 'pullQuote',
      text,
      attribution,
      source,
    },
  }
}

function factBoxBlock(
  title: string,
  items: { label: string; value: string; description?: string }[],
  source?: string,
) {
  return {
    type: 'block',
    version: 1,
    format: '',
    fields: {
      blockType: 'factBox',
      title,
      items,
      source,
    },
  }
}

function calloutBlock(variant: 'context' | 'editor_note' | 'methodology', title: string, body: string) {
  return {
    type: 'block',
    version: 1,
    format: '',
    fields: {
      blockType: 'callout',
      variant,
      title,
      body,
    },
  }
}

function imageBlock(mediaId: number | string, captionOverride?: string, size: 'column' | 'article' | 'full' = 'article') {
  return {
    type: 'block',
    version: 1,
    format: '',
    fields: {
      blockType: 'imageBlock',
      image: mediaId,
      captionOverride,
      size,
    },
  }
}

function embedBlock(provider: 'facebook' | 'instagram' | 'youtube' | 'x' | 'tiktok', url: string, caption?: string) {
  return {
    type: 'block',
    version: 1,
    format: '',
    fields: {
      blockType: 'embed',
      provider,
      url,
      caption,
    },
  }
}

export function buildOpinionBody(mediaDanioId?: number | string, mediaCoberturaId?: number | string) {
  const children: unknown[] = [
    paragraph(
      'Eran las doce y media. Hora del almuerzo. Ese momento sagrado del cuartel en que el fusil descansa contra la pared, la bandeja de aluminio tintinea y un muchacho de 19 años piensa en su mamá, en la novia del pueblo o en el partido del domingo. Ahí, en el rancho de tropa del Cantón Militar de Santa Rosa del Sur, en el sur de Bolívar, cayeron los explosivos. No llegaron por tierra ni a tiros desde el monte. Bajaron del cielo, colgados de aparatos que cualquiera compra por internet.',
    ),
    paragraph(
      'Jairo Lince Carvajal, soldado profesional. Dilan Andrés Lozano León y Álvaro Pushaina, soldados regulares, de esos que prestan el servicio porque les tocó, no porque lo escogieron. Los tres murieron. Decenas de compañeros quedaron heridos, al menos dieciséis de gravedad; dos de ellos permanecen en cuidados intensivos en Bucaramanga, y otros podrían quedar con daños en la vista y el oído para el resto de la vida.',
    ),
    paragraph(
      'Los nombres primero, porque en este país los muertos se vuelven cifra demasiado rápido. Ahora, las preguntas.',
    ),

    factBoxBlock(
      'El ataque al Cantón Militar en cifras',
      [
        {
          label: 'Víctimas mortales',
          value: '3 soldados',
          description: 'Jairo Lince Carvajal (profesional), Dilan Andrés Lozano León y Álvaro Pushaina (regulares).',
        },
        {
          label: 'Heridos graves',
          value: '16 uniformados',
          description: 'Evacuados de urgencia a centros asistenciales de Bucaramanga y Barrancabermeja.',
        },
        {
          label: 'Lugar del impacto',
          value: 'Rancho de tropa',
          description: 'Comedor del Cantón Militar Prócer Manuel Rodríguez Torices, Batallón de Selva N.º 48.',
        },
        {
          label: 'Días desde la promesa',
          value: '42 días',
          description: 'El Gobierno prometió escudos antidrones en el mismo municipio el 26 de septiembre.',
        },
      ],
      'Ministerio de Defensa y Ejército Nacional de Colombia',
    ),

    heading('La promesa que no aterrizó', 'h2'),
    paragraph(
      'El 26 de septiembre de 2026, el Gobierno del presidente Abelardo de la Espriella hizo un Consejo de Seguridad en ese mismo municipio, Santa Rosa del Sur. De allí salieron anuncios concretos: más protección para los alcaldes de la región, reconstrucción de estaciones de Policía y, textualmente, la "dotación de sistemas antidrones y de cámaras". El ministro de Defensa, Jorge Eduardo Mora, prometió: "Vamos a llegar con soluciones, porque hoy adquirimos compromisos con el sur de Bolívar".',
    ),
    paragraph('Cuarenta y dos días después, los drones llegaron antes que las soluciones.'),
    paragraph(
      'Y al día siguiente del ataque, el presidente escribió en X que "estamos trabajando para dotar a la Fuerza Pública de sistemas de defensa antidrones", que lo hará "pese a la dificilísima situación económica" y, de paso, gastó buena parte del mensaje en culpar a su antecesor: "El mitómano que gobernó Colombia dice que dejó todo listo para contratar un escudo antidrones. ¡MENTIRA!".',
    ),
    paragraph(
      'Puede que tenga razón sobre Gustavo Petro. Probablemente la tiene en parte. Pero a un soldado muerto en el rancho no le sirve de nada saber de quién fue la culpa del escudo que no existía. En Colombia el pasado siempre tiene la culpa, y el presente nunca tiene el escudo.',
    ),

    heading('La represalia que todos veían venir', 'h2'),
    paragraph(
      'Hay un detalle que vuelve todo más incómodo. El viernes 6 de noviembre, el mismo presidente anunció con orgullo la captura de Leivis Enrique Valero Castillo, alias "Carrito", señalado jefe financiero del Frente de Resistencia Guamocó del ELN. ¿Dónde lo capturaron? En la vereda Mina Nueva, zona rural de Santa Rosa del Sur. El mismo municipio. Hasta el Comando Sur de Estados Unidos celebró el golpe.',
    ),
    paragraph(
      'Menos de veinticuatro horas después, el ministro de Defensa atribuyó al ELN el ataque contra el cantón y lo explicó como una "retaliación" por esa captura. Conviene decirlo con precisión: la autoría sigue siendo una hipótesis oficial, nadie la ha reivindicado y no se conocen capturas. Pero si el propio Gobierno sostiene que era una represalia, la pregunta se escribe sola: si golpeas las finanzas de una guerrilla en su propio patio, ¿no esperas que responda? ¿Quién reforzó ese cantón la noche del viernes?',
    ),
    paragraph(
      'La captura de un cabecilla es un logro. Celebrarla sin blindar a la tropa que queda expuesta en el mismo territorio es dejarle la cuenta a los soldados rasos.',
    ),

    ...(mediaDanioId
      ? [
          imageBlock(
            mediaDanioId,
            'Estructuras y tejados del cantón militar en Santa Rosa del Sur tras el impacto de los artefactos explosivos.',
          ),
        ]
      : []),

    heading('El consejo de seguridad que oyó las explosiones', 'h2'),
    paragraph(
      'Hay ironías que ni Jaime Garzón se habría atrevido a inventar. El ataque ocurrió mientras las autoridades celebraban en la Alcaldía un consejo de seguridad, convocado por el asesinato de tres jóvenes —los hermanos Jauger y Yilder Pabuena y Omar Andrés Carpio Vargas— a manos de sicarios en motocicleta, horas antes, en la zona de bares del pueblo. Indepaz la registró como la masacre 105 de 2026 en Colombia. La 104 había ocurrido apenas un día antes, en Toro, Valle: una madre y sus dos hijas.',
    ),
    paragraph(
      'Es decir: mientras los funcionarios se reunían para hablar de seguridad, la inseguridad les tocó la puerta con explosivos. Esa noche, además, las alertas de inteligencia sobre posibles atentados del ELN obligaron a evacuar la sede de Caracol Televisión en Bogotá, y el presidente ordenó reforzar la protección de RCN, Caracol y Semana. Un solo sábado bastó para mostrar el mapa completo: cuarteles, pueblos, discotecas y salas de redacción.',
    ),

    embedBlock(
      'instagram',
      'https://www.instagram.com/reel/DfgHZaADMqN/?utm_source=ig_web_copy_link&dlrf=NTc4MTIwNjQ2YQ==',
      'Video en Instagram: Murieron almorzando — Cobertura y reporte de Clasificados Colombia.',
    ),
    embedBlock(
      'facebook',
      'https://www.facebook.com/share/r/1QnqqR7vYo/',
      'Video en Facebook: Cronología del ataque en Santa Rosa del Sur — Clasificados Colombia.',
    ),

    heading('"Un segundo Catatumbo" que nadie quiso oír', 'h2'),
    paragraph(
      'El alcalde de Santa Rosa del Sur, Milton Olaya, no habló con eufemismos: "Es el segundo Catatumbo". Y explicó por qué: "Recibimos a cada rato desplazamientos, minas antipersonas, confinamientos, enfrentamientos de los grupos porque aquí se encuentran las minas de oro. Estamos cortitos de Fuerza Pública".',
    ),
    paragraph(
      'Ahí está la palabra que lo explica todo: oro. En el sur de Bolívar se disputan la tierra el ELN, el Clan del Golfo y las disidencias de alias Calarcá, y la población civil y minera vive en medio del fuego cruzado.',
    ),
    paragraph(
      'Nada de esto es sorpresa. La Defensoría del Pueblo incluyó a Santa Rosa del Sur en su Alerta Temprana 034 de 2023. Hizo un nuevo informe de seguimiento en agosto de 2026. Documentó 22 emergencias humanitarias entre mayo y septiembre de este año, con al menos 11.135 personas afectadas por confinamientos y desplazamientos. Y denunció algo que debería avergonzar a cualquier Gobierno: pese a todo, nunca se convocó la CIPRAT, la comisión que existe precisamente para responder a esas alertas.',
    ),
    paragraph(
      'En septiembre, el ministro del Interior, Rodrigo Lara, reconoció que ninguno de los alcaldes de la zona roja tenía vehículo blindado. Tres años de alertas. Un consejo de seguridad. Una visita ministerial. Promesas de antidrones. Y el resultado es un rancho de tropa con el techo en el suelo.',
    ),

    pullQuoteBlock(
      'En Colombia los drones llegan a tiempo. Las promesas, nunca.',
      'Opinión | Clasificados Colombia',
      'Santa Rosa del Sur, noviembre de 2026',
    ),

    heading('¿Volvió la violencia? No: nunca se fue', 'h2'),
    paragraph(
      'Sería cómodo decir que Colombia "regresó a la violencia" con este Gobierno. Sería falso. Los ataques con drones crecieron bajo el gobierno anterior: 108 en 2024, 158 en 2025. La "paz total" de Petro no frenó esa nueva guerra aérea; la vio nacer y multiplicarse.',
    ),
    paragraph(
      'Pero el nuevo Gobierno llegó prometiendo exactamente lo contrario: mano dura, resultados, recuperar el territorio. En sus primeros meses cerró uno a uno los procesos de diálogo —incluida la revocatoria de las delegaciones ante el ELN y el Clan del Golfo el 9 de septiembre—, ordenó al menos cinco bombardeos, en varios de los cuales murieron menores reclutados, y presentó capturas y operativos de alto impacto mediático.',
    ),
    paragraph(
      '¿Y los números? Entre enero y el 1 de octubre de 2026, las Fuerzas Militares contaron 176 ataques con drones explosivos, más que en todo 2025, con 203 uniformados heridos en nueve meses. La Fundación Ideas para la Paz, con otra metodología, habla de 318 ataques: uno cada 20 horas. Agosto, el primer mes del nuevo Gobierno, fue el mes con más ataques del año.',
    ),
    paragraph(
      'Un analista de La Silla Vacía resumió los primeros 88 días de esta política con dos adjetivos difíciles de rebatir: "reactiva" y "showcera". Hay decisiones, operativos y proyectos de ley, pero no se ve todavía una estrategia integral que proteja a la gente donde la guerra vive.',
    ),
    paragraph(
      'La paz total fracasó por ingenua. La mano dura corre el riesgo de fracasar por vanidosa. En el medio, los mismos de siempre: soldados de 19 años, mineros, campesinos y alcaldes sin carro blindado.',
    ),

    ...(mediaCoberturaId
      ? [
          imageBlock(
            mediaCoberturaId,
            'Investigación y análisis: El impacto de la guerra aérea con drones y las víctimas invisibles.',
          ),
        ]
      : []),

    embedBlock(
      'instagram',
      'https://www.instagram.com/reel/DfgG9jajjD2/?utm_source=ig_web_copy_link&mdxt=MzRlODBiNWFlZA==&srtk=MzRlODBiNWFlZA==',
      'Video en Instagram: Tres soldados murieron almorzando — Clasificados Colombia.',
    ),
    embedBlock(
      'facebook',
      'https://www.facebook.com/share/r/14x99txnonn/',
      'Video en Facebook: ¿Quién responde por los soldados de Santa Rosa del Sur? — Clasificados Colombia.',
    ),

    heading('Lo que se le debe exigir al Gobierno', 'h2'),
    paragraph('No basta con trinos que prometen "no ceder un centímetro". Los ciudadanos tienen derecho a respuestas concretas:'),

    bulletList([
      '¿Qué pasó con los sistemas antidrones anunciados el 26 de septiembre para el sur de Bolívar? ¿Se contrataron? ¿Se instalaron? ¿Cuándo llegarán?',
      '¿Por qué no se reforzó la protección del cantón tras la captura de alias "Carrito", si el propio Ministerio de Defensa considera que el ataque fue una represalia previsible?',
      '¿Por qué no se ha convocado la CIPRAT, pese a tres años de alertas de la Defensoría?',
      '¿Cuál es el plan para la población civil del sur de Bolívar, más allá de bombardeos y capturas: escuelas abiertas, caminos, justicia, alternativas a la economía del oro ilegal?',
    ]),

    paragraph(
      'La guerra cambió de forma: ya no se libra solo en la selva, ahora también se libra en el aire, con aparatos baratos y explosivos caseros. Un Estado que sigue respondiendo con ruedas de prensa a una amenaza que llega por el aire está, literalmente, mirando hacia el lado equivocado.',
    ),
    paragraph(
      'Jairo, Dilan y Álvaro no murieron en combate. Murieron almorzando. Y eso debería quitarle el apetito a más de uno en Bogotá.',
    ),

    calloutBlock(
      'editor_note',
      'Nota editorial',
      'Este texto es una columna de opinión. Los hechos citados provienen de fuentes oficiales y periodísticas verificadas; las valoraciones son del autor. La autoría del ataque atribuida al ELN es, a la fecha, una hipótesis del Ministerio de Defensa, sin reivindicación ni responsabilidad judicial establecida. El Gobierno nacional y el Ministerio de Defensa tienen abierto el derecho de réplica.',
    ),

    calloutBlock(
      'context',
      'Pregunta ciudadana',
      'Si el Gobierno prometió escudos antidrones en Santa Rosa del Sur hace seis semanas, ¿quién debe responder por los tres soldados que murieron almorzando? Comparte esta columna. Que la pregunta llegue hasta el Ministerio de Defensa y no se quede en un trino de condolencias.\n\n#SantaRosaDelSur #SurDeBolívar #ColombiaMereceRespuestas',
    ),
  ]

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children,
    },
  }
}

export async function publicarOpinion(payload: Payload): Promise<void> {
  payload.logger.info('Iniciando publicación de columna de opinión sobre drones en Santa Rosa del Sur...')

  // 1. Obtener o crear autor
  let autor = (
    await payload.find({
      collection: 'authors',
      where: { slug: { in: ['redaccion-clasificados', 'redaccion', 'clasificados-colombia'] } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0]

  if (!autor) {
    const autores = await payload.find({
      collection: 'authors',
      limit: 1,
      overrideAccess: true,
    })
    autor = autores.docs[0]
  }

  if (!autor) {
    autor = await payload.create({
      collection: 'authors',
      overrideAccess: true,
      data: {
        name: 'Redacción Clasificados Colombia',
        slug: 'redaccion-clasificados',
        jobTitle: 'Unidad Investigativa y de Opinión',
        bio: 'Equipo periodístico de investigación, crónica y análisis de Clasificados Colombia.',
        active: true,
      },
    })
  }

  // 2. Editor responsable
  const editor = (
    await payload.find({
      collection: 'users',
      where: { role: { in: ['editor', 'admin'] } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0]

  // 3. Subir o vincular imágenes
  async function subirImagenOExistente(nombreArchivo: string, alt: string, caption: string, credit: string) {
    const existentes = await payload.find({
      collection: 'media',
      where: { filename: { equals: nombreArchivo } },
      limit: 1,
      overrideAccess: true,
    })

    if (existentes.docs[0]) {
      return existentes.docs[0]
    }

    const rutaLocal = path.join(FIXTURES, nombreArchivo)
    try {
      const data = await readFile(rutaLocal)
      const creado = await payload.create({
        collection: 'media',
        overrideAccess: true,
        data: {
          alt,
          caption,
          credit,
        },
        file: {
          data,
          name: nombreArchivo,
          mimetype: 'image/jpeg',
          size: data.byteLength,
        },
      })

      return creado
    } catch (e) {
      payload.logger.warn(`No se pudo cargar la imagen ${nombreArchivo}: ${e}`)
      return (
        await payload.find({
          collection: 'media',
          limit: 1,
          overrideAccess: true,
        })
      ).docs[0]
    }
  }

  const mediaPortada = await subirImagenOExistente(
    'portada-soldados-santa-rosa.jpg',
    'Fotografía oficial de los soldados Jairo Lince Carvajal, Dilan Andrés Lozano León y Álvaro Pushaina',
    'Jairo Lince Carvajal, Dilan Andrés Lozano León y Álvaro Pushaina, los tres soldados que murieron en el ataque con drones explosivos contra el rancho de tropa en Santa Rosa del Sur, sur de Bolívar.',
    'X@COL_EJERCITO / Archivo particular',
  )

  const mediaDanio = await subirImagenOExistente(
    'canton-militar-drones-danos.jpg',
    'Daños estructurales en el Cantón Militar de Santa Rosa del Sur tras el ataque con drones',
    'Instalaciones del Cantón Militar de Santa Rosa del Sur tras el ataque con drones cargados con explosivos perpetrado al mediodía del sábado 7 de noviembre de 2026.',
    'Fuentes locales / Archivo particular',
  )

  const mediaCobertura = await subirImagenOExistente(
    'clasificados-cobertura-drones.jpg',
    'Infografía y cobertura de Clasificados Colombia sobre los hechos en Santa Rosa del Sur',
    'Investigación y seguimiento de Clasificados Colombia: la cronología del ataque en Santa Rosa del Sur y las promesas de seguridad incumplidas.',
    'Clasificados Colombia',
  )

  // 4. Preparar documento de Opinión
  const existingDoc = (
    await payload.find({
      collection: 'opinions',
      where: { slug: { equals: OPINION_SLUG } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0]

  const opinionData = {
    title: 'Seis semanas después de la promesa, llegaron los drones',
    slug: OPINION_SLUG,
    dek: 'El Gobierno anunció escudos antidrones en Santa Rosa del Sur el 26 de septiembre. El 7 de noviembre, tres soldados murieron almorzando. Crónica de una guerra que nadie apagó y que ahora se pelea desde el cielo.',
    contentNature: 'opinion',
    author: autor.id,
    hero: mediaPortada
      ? {
          image: mediaPortada.id,
          captionOverride:
            'Jairo Lince Carvajal, Dilan Andrés Lozano León y Álvaro Pushaina, los tres soldados fallecidos en el ataque con drones explosivos en el Cantón Militar de Santa Rosa del Sur.',
        }
      : undefined,
    body: buildOpinionBody(mediaDanio?.id, mediaCobertura?.id) as never,
    workflow: {
      editorialStatus: 'published',
      factCheckStatus: 'verified',
      legalStatus: 'not_required',
    },
    publication: {
      publishedAt: '2026-11-08T18:00:00.000Z',
    },
    seo: {
      metaTitle: 'Seis semanas después de la promesa, llegaron los drones | Clasificados Colombia',
      metaDescription:
        'El Gobierno anunció escudos antidrones en Santa Rosa del Sur el 26 de septiembre. El 7 de noviembre, tres soldados murieron almorzando. Crónica y análisis de una guerra que ahora se pelea desde el cielo.',
      noIndex: false,
    },
    _status: 'published',
  }

  if (existingDoc) {
    payload.logger.info(`Actualizando columna de opinión existente: ${OPINION_SLUG} (ID: ${existingDoc.id})`)
    await payload.update({
      collection: 'opinions',
      id: existingDoc.id,
      data: opinionData as never,
      overrideAccess: true,
      user: editor,
    })
  } else {
    payload.logger.info(`Creando nueva columna de opinión: ${OPINION_SLUG}`)
    await payload.create({
      collection: 'opinions',
      data: opinionData as never,
      overrideAccess: true,
      user: editor,
    })
  }

  // 5. Crear redirección desde /conflicto si alguien intenta acceder por allí
  const existingRedirect = (
    await payload.find({
      collection: 'redirects',
      where: { from: { equals: `/conflicto/${OPINION_SLUG}` } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0]

  if (!existingRedirect) {
    await payload.create({
      collection: 'redirects',
      overrideAccess: true,
      data: {
        from: `/conflicto/${OPINION_SLUG}`,
        to: `/opinion/${OPINION_SLUG}`,
        statusCode: '308',
        reason: 'Migración canónica de columna de opinión',
        active: true,
      },
    })
  }

  payload.logger.info(`\n========================================`)
  payload.logger.info(`✅ COLUMNA DE OPINIÓN PUBLICADA EXITOSAMENTE`)
  payload.logger.info(`Título: "${opinionData.title}"`)
  payload.logger.info(`Slug: ${OPINION_SLUG}`)
  payload.logger.info(`Ruta pública: /opinion/${OPINION_SLUG}`)
  payload.logger.info(`========================================\n`)
}

async function main() {
  const payload = await getPayload({ config })
  await publicarOpinion(payload)
  process.exit(0)
}

// Si se ejecuta como script CLI
if (process.argv[1] && process.argv[1].includes('publicar-opinion-drones')) {
  main().catch((err) => {
    console.error('Error al publicar opinión:', err)
    process.exit(1)
  })
}

