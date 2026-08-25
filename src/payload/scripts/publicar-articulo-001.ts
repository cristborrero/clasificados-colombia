import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * `pnpm publicar:articulo-001`
 *
 * Publica el artículo de investigación "Quién reconstruye, y con qué reglas"
 * en la colección de artículos de Payload CMS.
 *
 * Idempotente: Si ya existe (por slug), lo actualiza con el contenido más reciente.
 */

function buildLexicalBody() {
  const textNode = (text: string, bold = false) => ({
    type: 'text',
    version: 1,
    text,
    format: bold ? 1 : 0,
    detail: 0,
    mode: 'normal',
    style: '',
  })

  const paragraph = (text: string) => ({
    type: 'paragraph',
    version: 1,
    children: [textNode(text)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
  })

  const heading = (text: string, tag: 'h2' | 'h3' = 'h2') => ({
    type: 'heading',
    version: 1,
    tag,
    children: [textNode(text)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
  })

  const quote = (text: string) => ({
    type: 'quote',
    version: 1,
    children: [textNode(text)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
  })

  const bulletList = (items: string[]) => ({
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
  })

  const children = [
    paragraph(
      'Colombia tembló dos veces el 10 de agosto de 2026. La primera, cuando la tierra se movió con una magnitud de 7,4 en San José del Palmar, Chocó, a las 7:34 de la mañana, dejando en cuestión de segundos lo que hoy suman más de 320 muertos, cerca de 4.600 heridos y más de 250 desaparecidos en 15 departamentos y 472 municipios. La segunda sacudida fue política: apenas tres días antes, el 7 de agosto, Abelardo de la Espriella había jurado como presidente en Cali, prometiendo mano dura contra el crimen y austeridad fiscal. El país recibió la tragedia con un gobierno que ni siquiera había terminado de acomodar los muebles.',
    ),
    paragraph(
      'Este reportaje sigue el rastro del poder y del dinero, y plantea la pregunta que pocos en el Palacio de Nariño quieren escuchar en voz alta: ¿quién decide quién recibe ayuda, quién administra las donaciones, y por qué el aparato estatal llegó a la emergencia más grande de la década sin timonel fijo?',
    ),
    heading('Un gobierno sin empalme, una emergencia sin director', 'h2'),
    paragraph(
      'La reconstrucción de los hechos revela una cadena de negligencias institucionales que antecede al sismo. El propio proceso de transición entre Gustavo Petro y De la Espriella fue accidentado desde el principio: el 7 de julio de 2026, apenas cinco días después de la primera reunión formal, el presidente electo anunció que suspendía el empalme con el gobierno saliente, alegando nombramientos de última hora y contrataciones millonarias que consideraba sospechosas. La entonces ministra de Cultura entrante, Paola Holguín, denunció públicamente "nombramientos de última hora" que, según ella, podían "comprometer la transparencia del empalme". El vicepresidente electo, José Manuel Restrepo, llegó a pedirle a la Cancillería que congelara nombramientos diplomáticos.',
    ),
    paragraph(
      'El resultado de esa guerra de trincheras políticas —legítima en parte, pero también conveniente como relato de victimización anticipada— fue que Colombia llegó al terremoto más fuerte del siglo XXI en su territorio sin director en propiedad de la UNGRD, la entidad encargada de coordinar toda la respuesta a desastres. El diario El País documentó que De la Espriella enfrentó el terremoto "sin director propio en la gestión de desastres" y que fue el funcionario saliente, Javier Pava, quien terminó dando la cara ante los medios en las primeras horas de la tragedia.',
    ),
    paragraph(
      'Ese vacío no es un detalle administrativo menor. Las primeras cien horas después de un terremoto son, según cualquier protocolo internacional de gestión de riesgo, las que determinan cuántas personas sobreviven bajo los escombros. Petro lo dijo sin medias tintas en la primera réplica televisada de la oposición, el 19 de agosto: "La incapacidad de empalme del gobierno entrante que generó Abelardo, convirtió esas horas en un desastre". Es una crítica interesada —viene de quien perdió la presidencia—, pero los hechos que la sostienen, como la ausencia de director de la UNGRD y el buque-hospital Benkos Biohó siete días sin operar en puerto, están documentados por varios medios y no solo por la retórica del Pacto Histórico.',
    ),
    paragraph(
      'Cuando finalmente se nombró a David Tamayo como director de la UNGRD, dos días después del sismo, se destapó otro episodio confuso: circuló la versión de que el nuevo gobierno había frenado el ingreso de equipos internacionales de búsqueda y rescate. La investigación posterior estableció que la carta que restringía esa ayuda la había firmado Pava, el funcionario saliente, no el nuevo gobierno. Es un ejemplo de cómo la desinformación circula más rápido que los hechos, y de por qué verificar antes de acusar sigue siendo la única forma honesta de hacer periodismo.',
    ),
    heading('La ayuda "selectiva": la acusación que sigue sin resolverse', 'h2'),
    paragraph(
      'El senador opositor Iván Cepeda, del Pacto Histórico, visitó Quibdó el 15 de agosto y lanzó una denuncia grave: que el gobierno estaría dando trato "selectivo" a la ayuda internacional ofrecida, aceptando la de unos países y rechazando —sin explicación pública— la de otros. Cepeda fue más lejos: aseguró haber recibido denuncias de que la entrega de ayudas en terreno estaría condicionada a haber votado por De la Espriella.',
    ),
    paragraph(
      'Esta es, hasta ahora, una acusación política sin sustento documental público verificado de manera independiente. No existe, en las fuentes consultadas, prueba de casos concretos y nombrados de esa condicionalidad electoral en la entrega de ayuda. Lo que sí existe es una advertencia seria de que la oposición hará seguimiento a la trazabilidad de los recursos, lo cual —dado el historial colombiano de politización de la ayuda humanitaria en emergencias anteriores, incluida la crisis de la UNGRD bajo el propio Petro en 2024— es un frente que exige vigilancia ciudadana, no denuncia gratuita.',
    ),
    heading('La fundación de la primera dama: un problema de diseño, no de delito probado', 'h2'),
    paragraph(
      'Aquí se concentra la controversia más sensible de esta reconstrucción. El 21 de agosto, la organización de periodismo investigativo Cuestión Pública reveló que la campaña de donaciones \'Colombia, un solo corazón\', liderada por la primera dama Ana Lucía Pineda, canaliza recursos a través de tres organizaciones: la Corporación Minuto de Dios, la Asociación de Bancos de Alimentos de Colombia y una tercera, la Fundación Colombia Luz y Sonrisas, cuya representante legal es la propia Pineda.',
    ),
    paragraph(
      'El dato clave, que rara vez aparece con suficiente relieve en la cobertura masiva: esa fundación fue creada el 7 de julio de 2026, apenas quince días después de que De la Espriella ganara la segunda vuelta electoral y un mes antes de su posesión, según reveló un columnista de La Silla Vacía. No se trata de una fundación con trayectoria construida antes de la política; nació en el ecosistema del poder entrante, en el momento exacto en que su esposo ya sabía que sería presidente.',
    ),
    paragraph('Es indispensable precisar qué significa esto y qué no significa:'),
    bulletList([
      'Ninguna de las investigaciones periodísticas consultadas demuestra que los recursos donados hayan terminado en el patrimonio personal de la primera dama.',
      'Tampoco hay, hasta la fecha de este reportaje, una irregularidad penal o administrativa comprobada.',
      'Lo que sí está establecido y es objetivamente cuestionable es el diseño institucional: quien lidera la campaña oficial de recolección de donaciones para las víctimas es la misma persona que representa legalmente una de las tres entidades receptoras de esos fondos. Eso rompe el principio más elemental de control cruzado: nadie debería auditarse a sí mismo.',
    ]),
    paragraph(
      'La reacción en redes no se hizo esperar. El youtuber petrista Levy Rincón comparó la fundación con "el tigre de Temu", en referencia al apodo de De la Espriella, "El Tigre", y a la sospecha de improvisación detrás de la iniciativa. Es un ataque cargado de sesgo político, pero la pregunta de fondo que plantea, despojada de la ironía, coincide con la que cualquier contralor debería estar haciendo de oficio: quién auditará esa fundación, y con qué independencia.',
    ),
    paragraph(
      'Vale la pena, además, un ejercicio de memoria histórica: la sombra de la corrupción en el manejo de emergencias no es nueva ni exclusiva de este gobierno. En 2024, bajo la administración Petro, la propia UNGRD estuvo en el centro de un escándalo mayúsculo por el direccionamiento de recursos de la primera ola invernal hacia campañas de congresistas aliados. La pregunta de fondo no es si la derecha es corrupta y la izquierda no, sino si Colombia alguna vez construirá un sistema de gestión de riesgo con controles que sobrevivan al color político de quien gobierna.',
    ),
    heading('El otro dinero: la colecta que ya llegó a la Corte Suprema', 'h2'),
    paragraph(
      'Mientras la fundación presidencial genera preguntas éticas, ya existe un caso con implicaciones penales activas. El representante a la Cámara Óscar Benavides enfrenta una denuncia formal ante la Sala de Instrucción de la Corte Suprema de Justicia, después de que una colecta para damnificados en Chocó superara los 300 millones de pesos. El expediente, repartido al magistrado Francisco Farfán, busca establecer quién recibió el dinero, qué entidad debía administrarlo, bajo qué autorización se usaron los canales de recaudo y cuál fue el destino final de los recursos. Es apenas una denuncia, no una condena ni una imputación, y así debe tratarse: como un proceso en curso cuyo desenlace aún se desconoce.',
    ),
    heading('Los nombramientos: la costumbre de gobernar sin plan', 'h2'),
    paragraph(
      'El patrón de improvisación no se limita a la primera dama. Se repite en la manera en que el gabinete se fue anunciando "a cuentagotas" —la expresión es de El País— incluso después de la posesión, y en la manera en que la UNGRD llegó al peor desastre natural en años sin director titular. La congresista Martha Ruiz Solera advirtió, además, que el Fondo Nacional de Gestión del Riesgo podría no tener recursos suficientes para responder a una tragedia de esta magnitud, y pidió una reforma que garantice financiación permanente ante futuras emergencias. Si eso se confirma, el problema no sería solo de este gobierno, sino una falla estructural del Estado colombiano que ningún presidente, de cualquier signo político, ha resuelto.',
    ),
    heading('Los medios: ¿silencio cómplice o simple lentitud?', 'h2'),
    paragraph(
      'Sobre el papel de la prensa, la evidencia recogida cuenta una historia más matizada de lo que a veces se asume desde las redes sociales. Medios como El País, Infobae, La Silla Vacía, Semana, Cuestión Pública y Publimetro sí han publicado, y con nombre propio, las controversias sobre la fundación de la primera dama, el vacío en la dirección de la UNGRD y las críticas de la oposición. La cobertura existe. Lo que sí es cierto es que buena parte de esa cobertura crítica proviene de medios digitales de investigación o de columnas de opinión, mientras que la prensa de mayor audiencia masiva ha priorizado las cifras de víctimas y la narrativa de unidad nacional por encima del escrutinio a la gestión del dinero. Eso no prueba complicidad editorial deliberada, pero sí revela un patrón: en momentos de duelo colectivo, la pregunta incómoda tiende a quedar para después, y "después" en Colombia casi siempre llega demasiado tarde.',
    ),
    heading('Lo que aún no se puede afirmar', 'h2'),
    paragraph(
      'Con el rigor que exige este oficio, hay que decirlo sin rodeos: no existe, en las fuentes públicas disponibles hasta el 25 de agosto de 2026, evidencia que demuestre desvío de fondos hacia el patrimonio personal de la primera dama, ni prueba documentada de que la entrega de ayudas humanitarias esté condicionada al voto político de las comunidades. Ambas son acusaciones activas, alimentadas por un diseño institucional legítimamente cuestionable y por un historial de opacidad en la gestión de emergencias en Colombia, pero acusación no es lo mismo que veredicto. El expediente contra Benavides sí es un proceso judicial formal y verificable, y ese sí merece seguimiento línea por línea.',
    ),
    quote(
      'En Colombia la tierra tiembla una vez, pero el poder siempre encuentra la forma de temblar dos veces: la primera con la tragedia, la segunda con quién decide administrarla.',
    ),
    paragraph(
      '¿Debería una fundación creada por la primera dama, quince días después de ganar la segunda vuelta, administrar donaciones para víctimas de un desastre nacional? Las familias de Chocó, Cali, Pereira y Manizales tienen derecho a saber exactamente a dónde va cada peso donado en su nombre, y ese derecho no se garantiza solo con buenas intenciones.',
    ),
  ]

  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      children,
    },
  }
}

async function main(): Promise<void> {
  const payload = await getPayload({ config })

  // 1. Obtener o asignar editor responsable
  const editor = (
    await payload.find({
      collection: 'users',
      where: { role: { in: ['editor', 'admin'] } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0]

  if (!editor) {
    payload.logger.error('No hay usuarios con rol editor/admin en la base de datos.')
    process.exit(1)
  }

  // 2. Obtener autor (o crearlo si no existe)
  let autor = (
    await payload.find({
      collection: 'authors',
      where: { slug: { in: ['redaccion', 'investigacion', 'clasificados-colombia'] } },
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
        slug: 'redaccion',
        jobTitle: 'Unidad Investigativa',
        bio: 'Equipo periodístico de investigación de Clasificados Colombia.',
        active: true,
      },
    })
  }

  // 3. Obtener categoría (Nación o Política)
  let seccion = (
    await payload.find({
      collection: 'categories',
      where: { slug: { equals: 'nacion' } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0]

  if (!seccion) {
    seccion = (
      await payload.find({
        collection: 'categories',
        where: { slug: { equals: 'politica' } },
        limit: 1,
        overrideAccess: true,
      })
    ).docs[0]
  }

  if (!seccion) {
    const secciones = await payload.find({
      collection: 'categories',
      limit: 1,
      overrideAccess: true,
    })
    seccion = secciones.docs[0]
  }

  if (!seccion) {
    seccion = await payload.create({
      collection: 'categories',
      overrideAccess: true,
      data: {
        name: 'Nación',
        slug: 'nacion',
        order: 1,
        active: true,
        description: 'Lo que pasa en el país y en las regiones.',
      },
    })
  }

  // 4. Obtener imagen de cabecera existente o fallback
  const imagenExistente = (
    await payload.find({
      collection: 'media',
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0]

  const slug = 'quien-reconstruye-y-con-que-reglas'
  const existingDoc = (
    await payload.find({
      collection: 'articles',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0]

  const articleData = {
    title: 'Quién reconstruye, y con qué reglas',
    slug,
    dek: 'El terremoto que desnudó a un gobierno recién nacido',
    contentType: 'reportage',
    category: seccion.id,
    authors: [autor.id],
    body: buildLexicalBody() as never,
    hero: imagenExistente
      ? {
          image: imagenExistente.id,
          captionOverride: 'Emergencia y reconstrucción en el Pacífico colombiano.',
        }
      : undefined,
    workflow: {
      editorialStatus: 'published',
      factCheckStatus: 'verified',
      legalStatus: 'not_required',
    },
    publication: {
      publishedAt: new Date().toISOString(),
    },
    seo: {
      metaTitle: 'Quién reconstruye, y con qué reglas | Clasificados Colombia',
      metaDescription:
        'El sismo en Chocó desnudó a un gobierno sin directores de emergencia, una fundación presidencial bajo cuestionamiento ético y una colecta investigada en la Corte Suprema.',
      noIndex: false,
    },
    _status: 'published',
  }

  if (existingDoc) {
    payload.logger.info(`Actualizando artículo existente: ${slug} (ID: ${existingDoc.id})`)
    await payload.update({
      collection: 'articles',
      id: existingDoc.id,
      data: articleData as never,
      overrideAccess: true,
      user: editor,
    })
  } else {
    payload.logger.info(`Creando nuevo artículo: ${slug}`)
    await payload.create({
      collection: 'articles',
      data: articleData as never,
      overrideAccess: true,
      user: editor,
    })
  }

  const catSlug = typeof seccion.slug === 'string' ? seccion.slug : 'nacion'
  console.log(`\n========================================`)
  console.log(`✅ ARTÍCULO PUBLICADO EXITOSAMENTE`)
  console.log(`Título: "${articleData.title}"`)
  console.log(`Slug: ${slug}`)
  console.log(`Categoría: ${seccion.name} (/${catSlug})`)
  console.log(`Ruta pública: /${catSlug}/${slug}`)
  console.log(`========================================\n`)
  process.exit(0)
}

await main()
