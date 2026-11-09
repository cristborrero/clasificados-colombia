import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURES_VITRINA = path.join(dirname, 'fixtures/vitrina')
const FIXTURES_OPINION = path.join(dirname, 'fixtures/opinion-drones')
const FIXTURES_NOTICIAS = path.join(dirname, 'fixtures/noticias-reales')

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

function makeLexicalRoot(children: unknown[]) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children,
    },
  }
}

type ArticuloDef = {
  slug: string
  title: string
  dek: string
  contentType: 'news' | 'analysis' | 'feature' | 'profile'
  seccion: 'conflicto' | 'politica' | 'justicia' | 'regiones' | 'nacion'
  foto: string
  hoursAgo: number
  cuerpoNodes: unknown[]
}

export const ARTICULOS_REALES: ArticuloDef[] = [
  // ── 1. CONFLICTO ──
  {
    slug: 'ataque-drones-canton-santa-rosa-del-sur',
    title: 'Ataque con drones a Cantón Militar de Santa Rosa del Sur deja tres soldados muertos y 47 uniformados afectados',
    dek: 'Aparatos no tripulados cargados con explosivos impactaron el rancho de tropa al mediodía del sábado 7 de noviembre. El Ejército atribuye la acción al ELN como represalia por la captura de alias "Carrito".',
    contentType: 'news',
    seccion: 'conflicto',
    foto: 'portada-soldados',
    hoursAgo: 44,
    cuerpoNodes: [
      paragraph('Un ataque con artefactos explosivos arrojados desde aeronaves no tripuladas (drones) sacudió el mediodía del sábado 7 de noviembre de 2026 las instalaciones del Cantón Militar Prócer Manuel Rodríguez Torices, sede del Batallón de Infantería de Selva N.º 48, ubicado en el casco urbano de Santa Rosa del Sur, en el departamento de Bolívar.'),
      paragraph('El ataque se produjo exactamente a las 12:35 p.m., en momentos en que decenas de uniformados se encontraban congregados en el comedor del rancho de tropa para el almuerzo. Los explosivos, adaptados con detonadores de impacto, atravesaron la cubierta de lámina y estallaron en el recinto cerrado.'),
      factBoxBlock(
        'Balance oficial del atentado en Santa Rosa del Sur',
        [
          { label: 'Víctimas mortales', value: '3 uniformados', description: 'Un soldado profesional y dos regulares' },
          { label: 'Heridos de gravedad', value: '16 soldados', description: 'Remitidos a centros de alta complejidad en Bucaramanga y Barrancabermeja' },
          { label: 'Afectados por onda', value: '31 soldados', description: 'Traumas acústicos, laceraciones y esquirlas menores' },
          { label: 'Lugar del impacto', value: 'Cantón Militar Rodríguez Torices', description: 'Batallón de Infantería de Selva N.º 48' },
        ],
        'Comando General de las Fuerzas Militares · Reporte 09-Nov-2026',
      ),
      heading('Los nombres de las víctimas'),
      paragraph('El Ejército Nacional identificó a los tres uniformados que perdieron la vida como el soldado profesional Jairo Lince Carvajal y los soldados regulares Dilan Andrés Lozano León y Álvaro Pushaina, estos últimos jóvenes que cumplían con su servicio militar obligatorio.'),
      paragraph('Dieciséis militares con heridas complejas por esquirlas y politraumatismos fueron evacuados por vía aérea hacia el Hospital Universitario de Santander en Bucaramanga y centros médicos de Barrancabermeja. Dos de ellos permanecen bajo pronóstico reservado en unidades de cuidados intensivos.'),
      pullQuoteBlock(
        'No llegaron por tierra ni a tiros desde el monte. Bajaron del cielo aparatos comerciales modificados, impactando directamente el rancho mientras los muchachos almorzaban.',
        'Oficial del Batallón de Selva N.º 48',
        'Testimonio en Santa Rosa del Sur',
      ),
      heading('Hipótesis de inteligencia y contexto regional'),
      paragraph('El ministro de Defensa, Jorge Eduardo Mora, y mandos de la Primera División del Ejército señalaron de manera preliminar como presunto responsable al Frente de Resistencia Guamocó del Ejército de Liberación Nacional (ELN). Según las fuentes de inteligencia militar, la acción violenta habría sido una retaliación directa tras la captura, dos días antes, de alias "Carrito", considerado uno de los principales articuladores logísticos y de finanzas armadas de esa estructura en la Serranía de San Lucas.'),
      paragraph('El atentado se produjo pocas horas después de un consejo extraordinario de seguridad municipal convocado por el homicidio de tres personas en la vereda San Benito. La Defensoría del Pueblo y organizaciones de derechos humanos han reiterado sus alertas tempranas por el confinamiento de comunidades campesinas ante la sangrienta disputa entre el ELN, el Clan del Golfo (Ejército Gaitanista) y disidencias de las FARC por el control de la minería de oro en la región.'),
    ],
  },
  {
    slug: 'defensoria-alerta-urgente-serrania-san-lucas',
    title: 'Defensoría del Pueblo emite alerta urgente por confinamiento de comunidades en la Serranía de San Lucas',
    dek: 'Más de 1.800 familias campesinas permanecen incomunicadas por la confrontación armada y la siembra de minas antipersonal entre Santa Rosa del Sur, Simití y Morales.',
    contentType: 'analysis',
    seccion: 'conflicto',
    foto: 'san-lucas',
    hoursAgo: 38,
    cuerpoNodes: [
      paragraph('La Defensoría del Pueblo emitió un llamado de urgencia humanitaria ante el grave deterioro del orden público y las libertades civiles en la subregión de la Serranía de San Lucas, en el sur de Bolívar, un territorio estratégico donde convergen límites con el Magdalena Medio y el bajo Cauca antioqueño.'),
      paragraph('De acuerdo con el monitoreo del Sistema de Alertas Tempranas (SAT), al menos 1.800 familias de una quincena de corregimientos y veredas de los municipios de Santa Rosa del Sur, Simití, Morales y Arenal se encuentran en situación de confinamiento parcial o total debido a retenes ilegales, toques de queda impuestos por grupos armados ilegales y la proliferación de artefactos explosivos improvisados.'),
      heading('Una disputa por el oro y las rutas fluviales'),
      paragraph('El informe humanitario documenta que la Serranía de San Lucas enfrenta una de las fases más críticas de confrontación armada desde la firma del Acuerdo de Paz de 2016. En la zona operan simultáneamente el ELN, las Autodefensas Gaitanistas de Colombia (Clan del Golfo) y facciones disidentes de las FARC.'),
      bulletList([
        'Restricciones a la navegación de botes de víveres sobre el río Magdalena y afluentes como el Tigüí y el Cimitarra.',
        'Desabastecimiento progresivo de medicinas esenciales y suspensión de clases en escuelas rurales.',
        'Uso recurrente de drones comerciales adaptados para lanzar artefactos sobre campamentos y áreas perimetrales.',
        'Presión violenta contra líderes de Juntas de Acción Comunal para forzar empadronamientos ilegales.',
      ]),
      paragraph('La Defensoría exigió al Gobierno Nacional la instalación de un corredor de auxilio humanitario supervisado por la Cruz Roja Internacional y la Organización de Naciones Unidas para permitir la salida de enfermos y el ingreso de alimentos a las zonas más apartadas de la serranía.'),
    ],
  },
  {
    slug: 'fuerza-publica-plan-antidrones-bolivar-catatumbo',
    title: 'Fuerza Pública activa plan especial de escudo antidrones en bases y estaciones del sur de Bolívar y Catatumbo',
    dek: 'El Ministerio de Defensa aceleró la adquisición e instalación de inhibidores de radiofrecuencia y sistemas de detección electro-ópticos en diez guarniciones prioritarias.',
    contentType: 'news',
    seccion: 'conflicto',
    foto: 'canton-militar',
    hoursAgo: 24,
    cuerpoNodes: [
      paragraph('Tras el mortífero ataque contra el cantón militar de Santa Rosa del Sur, el Ministerio de Defensa y el Comando General de las Fuerzas Militares activaron un plan de contingencia inmediata para dotar de tecnología de detección y neutralización de drones a diez guarniciones del Ejército y la Policía Nacional ubicadas en zonas de alta confrontación.'),
      paragraph('El dispositivo contempla el despliegue de inhibidores de radiofrecuencia tipo jammers portátiles y vehiculares, capaces de interrumpir las frecuencias de enlace de mando y control (2.4 GHz y 5.8 GHz), así como la señal satelital GPS utilizada por aeronaves comerciales modificadas.'),
      heading('Guarniciones priorizadas'),
      paragraph('Los primeros equipos comenzarán a instalarse en acantonamientos militares de Santa Rosa del Sur, San Pablo, Cantagallo y Simití en el sur de Bolívar; Tibú, El Tarra y Convención en el Catatumbo; y bases del norte del Cauca.'),
      pullQuoteBlock(
        'La amenaza aérea no tripulada cambió la doctrina de defensa de base. Cada cantón militar en zona roja requiere cobertura electrónica permanente.',
        'Jorge Eduardo Mora',
        'Ministro de Defensa Nacional',
      ),
      paragraph('La cartera de Defensa informó que se abrió un proceso expedito de compra internacional para adquirir sistemas de cúpula fija que combinan radar de corto alcance con cámaras térmicas y neutralizadores direccionales, con el objetivo de blindar las instalaciones antes del cierre del año.'),
    ],
  },

  // ── 2. POLÍTICA ──
  {
    slug: 'congreso-aprueba-ley-sometimiento-justicia-bandas',
    title: 'Congreso aprueba en último debate la Ley de Sometimiento a la Justicia para bandas criminales',
    dek: 'Con 57 votos en el Senado y 95 en la Cámara, la iniciativa insignia del Ministerio de Justicia quedó lista para sanción presidencial tras excluir beneficios a reclutadores de menores.',
    contentType: 'news',
    seccion: 'politica',
    foto: 'congreso-int',
    hoursAgo: 32,
    cuerpoNodes: [
      paragraph('En una sesión a contrarreloj y con textos idénticos aprobados en ambas cámaras legislativas, las plenarias del Senado de la República y la Cámara de Representantes le dieron el visto bueno definitivo al proyecto de Ley de Sometimiento a la Justicia para estructuras armadas organizadas de alto impacto.'),
      paragraph('La iniciativa, liderada por el ministro de Justicia Iván Cancino, busca establecer un marco jurídico específico y ordenado para el desmonte de bandas multicrimen dedicadas al narcotráfico, la minería ilegal y la extorsión.'),
      factBoxBlock(
        'Puntos clave de la Ley de Sometimiento aprobada',
        [
          { label: 'Rebaja para bases', value: 'Hasta 50% de la pena', description: 'Sujeta a entrega de armas y verdad judicial' },
          { label: 'Rebaja para cabecillas', value: 'Hasta 30% de la pena', description: 'Condicionada a la entrega del 100% de bienes ilícitos' },
          { label: 'Reclutamiento de menores', value: 'Cero beneficios', description: 'Exclusión absoluta de cualquier descuento punitivo' },
          { label: 'Lavado y testaferrato', value: 'Penas agravadas', description: 'Mínimo de 6 a 12 años sin subrogados' },
        ],
        'Gaceta del Congreso · Acta de Plenaria',
      ),
      heading('El debate sobre las víctimas y la extradición'),
      paragraph('Durante la discusión en el Capitolio Nacional, bancadas de oposición señalaron reparos sobre el mecanismo de verificación de reparación integral a las víctimas, demandando que las rebajas no entren en vigor sin la restitución efectiva de tierras despojadas.'),
      paragraph('Por su parte, el Gobierno subrayó que la ley mantiene intactas las facultades constitucionales de extradición hacia otros países y prohíbe taxativamente la suspensión de órdenes de captura por delitos de lesa humanidad.'),
    ],
  },
  {
    slug: 'senado-debate-reforma-constitucional-futuro-jep',
    title: 'Comienza en el Senado el pulso por la reforma constitucional que define el futuro de la JEP',
    dek: 'Sectores políticos plantean un cronograma de cierre y el traslado progresivo de expedientes pendientes hacia la justicia ordinaria antes de 2028.',
    contentType: 'analysis',
    seccion: 'politica',
    foto: 'jep-sede',
    hoursAgo: 20,
    cuerpoNodes: [
      paragraph('La Comisión Primera del Senado de la República abrió formalmente el debate alrededor de un proyecto de acto legislativo que busca fijar un término perentorio de funcionamiento para la Jurisdicción Especial para la Paz (JEP), creada en virtud del Acuerdo de Paz de 2016.'),
      paragraph('El articulado en discusión propone un plan de transición que contempla la conclusión de las investigaciones macrocriminales en curso y el traslado progresivo de los expedientes que no hayan alcanzado resolución de conclusiones a la Sala Penal de la Corte Suprema de Justicia y a la Fiscalía General.'),
      heading('Argumentos enfrentados'),
      paragraph('Los defensores de la reforma sostienen que, cumplida una década desde la refrendación de los acuerdos, el país requiere certidumbre jurídica definitiva y sanciones efectivas a los máximos responsables de crímenes de guerra.'),
      paragraph('Organizaciones de víctimas y defensores de derechos humanos, sin embargo, alertaron que fijar un límite temporal abrupto podría colapsar la justicia ordinaria y dejar en la impunidad patrones sistemáticos de secuestro, desaparición forzada y ejecuciones extrajudiciales que aún se encuentran en fase de contrastación probatoria.'),
    ],
  },
  {
    slug: 'gobierno-ponentes-ajuste-presupuesto-inversion-2027',
    title: 'Gobierno y ponentes ajustan el proyecto de presupuesto de inversión regional para la vigencia 2027',
    dek: 'Las comisiones económicas del Congreso concentran la discusión en los rubros destinados a infraestructura vial y subsidios a las tarifas de energía eléctrica.',
    contentType: 'news',
    seccion: 'politica',
    foto: 'capitolio',
    hoursAgo: 16,
    cuerpoNodes: [
      paragraph('Delegados del Ministerio de Hacienda y los coordinadores ponentes de las comisiones económicas conjuntas de Senado y Cámara avanzaron este fin de semana en la reasignación de partidas del Presupuesto General de la Nación para 2027, con un énfasis particular en inversión para departamentos periféricos.'),
      paragraph('El paquete de ajustes busca blindar los recursos del Fondo de Estabilización Tarifaria para el Caribe y el Pacífico, en respuesta al reclamo de alcaldes y gobernadores por el impacto del alza en los costos de generación térmica.'),
      paragraph('Asimismo, se proyecta garantizar recursos específicos para el mantenimiento de vías terciarias y proyectos de conectividad rural en Cauca, Nariño, Putumayo y Bolívar.'),
    ],
  },

  // ── 3. JUSTICIA ──
  {
    slug: 'corte-suprema-fija-febrero-2027-juicio-exministros-ungrd',
    title: 'Corte Suprema de Justicia fija para febrero de 2027 el juicio contra exministros por caso UNGRD',
    dek: 'La Sala de Primera Instancia otorgó un nuevo plazo a las defensas de Ricardo Bonilla y Luis Fernando Velasco para verificar el descubrimiento probatorio digital entregado por la Fiscalía.',
    contentType: 'news',
    seccion: 'justicia',
    foto: 'palacio-just',
    hoursAgo: 30,
    cuerpoNodes: [
      paragraph('La Sala Especial de Primera Instancia de la Corte Suprema de Justicia reprogramó para el martes 2 de febrero de 2027 la audiencia preparatoria de juicio oral en el proceso que se sigue contra los exministros Ricardo Bonilla (Hacienda) y Luis Fernando Velasco (Interior), en el marco de las investigaciones por presuntas irregularidades en contratos de la Unidad Nacional para la Gestión del Riesgo de Desastres (UNGRD).'),
      paragraph('La decisión del alto tribunal atendió solicitudes formuladas por los apoderados judiciales de los exfuncionarios, quienes expusieron dificultades técnicas para acceder y revisar la totalidad de los archivos digitales, bases de datos y copias espejo forenses trasladadas por la Fiscalía Delegada ante la Corte.'),
      heading('Los cargos en el expediente'),
      paragraph('La acusación formal contra Bonilla y Velasco se sustenta en los presuntos delitos de cohecho por dar u ofrecer, concierto para delinquir agravado e interés indebido en la celebración de contratos, derivados del supuesto direccionamiento de convenios y partidas de mitigación de emergencias a cambio de apoyos legislativos durante el periodo 2023-2024.'),
      pullQuoteBlock(
        'El debido proceso y el principio de igualdad de armas exigen que la defensa técnica cuente con el tiempo idóneo para contrastar cada elemento material probatorio digital.',
        'Auto de la Sala de Primera Instancia',
        'Corte Suprema de Justicia',
      ),
      paragraph('La Fiscalía General de la Nación ratificó por su parte que el material descubierto cumple con todos los protocolos de cadena de custodia y que el catálogo de pruebas testimoniales y periciales está completamente estructurado para sustentar el juicio oral.'),
    ],
  },
  {
    slug: 'tribunal-revoca-detencion-domiciliaria-luis-fernando-velasco',
    title: 'Tribunal revoca detención domiciliaria a Luis Fernando Velasco: exministro se defenderá en libertad',
    dek: 'La segunda instancia determinó que no persiste el riesgo de obstrucción procesal en la etapa preparatoria del proceso por presunto cohecho y concierto para delinquir.',
    contentType: 'news',
    seccion: 'justicia',
    foto: 'luis-fernando-velasco',
    hoursAgo: 26,
    cuerpoNodes: [
      paragraph('La Sala Penal del Tribunal Superior de Bogotá revocó la medida de aseguramiento privativa de la libertad que pesaba contra el exministro del Interior Luis Fernando Velasco, disponiendo su libertad inmediata en el marco de la investigación por el entramado de corrupción en la UNGRD.'),
      paragraph('Los magistrados consideraron que, habiéndose culminado la fase de recolección de testimonios principales y formulado el pliego de acusación, no se configuran los presupuestos de peligro de reiteración delictiva ni de riesgo fundado de obstrucción a la justicia que justificaron inicialmente la medida domiciliaria.'),
      paragraph('Tras conocer la providencia, Velasco reiteró su inocencia y manifestó que continuará compareciendo a todas las diligencias procesales para demostrar que no participó en acuerdos ilegales para la adjudicación de recursos estatales.'),
    ],
  },
  {
    slug: 'juzgado-rechaza-tutela-sneyder-pinilla-carcel-la-picota',
    title: 'Juzgado rechaza tutela de Sneyder Pinilla y ratifica su reclusión en la cárcel La Picota',
    dek: 'El juez de tutela consideró que las medidas de seguridad adoptadas por el INPEC en el pabellón de testigos protegidos son idóneas y no vulneran derechos fundamentales.',
    contentType: 'news',
    seccion: 'justicia',
    foto: 'la-picota',
    hoursAgo: 18,
    cuerpoNodes: [
      paragraph('Un juzgado penal del circuito de Bogotá declaró improcedente la acción de tutela promovida por el exsubdirector de Manejo de Desastres de la UNGRD, Sneyder Pinilla, con la cual pretendía que se ordenara su traslado inmediato desde el Complejo Carcelario La Picota hacia una instalación militar de reclusión especial.'),
      paragraph('Pinilla, considerado uno de los testigos centrales de la Fiscalía y la Corte Suprema en el esclarecimiento de los sobrecostos en carrotanques de La Guajira y contratos en Carmen de Bolívar, alegaba riesgos inminentes contra su vida y la de su núcleo familiar.'),
      paragraph('El despacho judicial concluyó que la Dirección General del Instituto Nacional Penitenciario y Carcelario (INPEC) ha dispuesto esquemas reforzados de custodia, monitoreo de cámaras y aislamiento preventivo suficientes para salvaguardar la integridad del testigo.'),
    ],
  },

  // ── 4. REGIONES ──
  {
    slug: 'alerta-roja-cuencas-la-mojana-choco-temporada-lluvias',
    title: 'Alerta roja en cuencas de La Mojana y Chocó por inicio de la segunda temporada de lluvias',
    dek: 'El Ideam y la UNGRD vigilan crecientes súbitas en los ríos Cauca, San Jorge y Atrato. Municipios ribereños piden acelerar obras de contención y dragado.',
    contentType: 'news',
    seccion: 'regiones',
    foto: 'inundaciones-cauca',
    hoursAgo: 28,
    cuerpoNodes: [
      paragraph('El Instituto de Hidrología, Meteorología y Estudios Ambientales (Ideam) declaró la alerta roja hidrológica en sectores neurálgicos de la región de La Mojana —que abarca zonas de Sucre, Bolívar, Córdoba y Antioquia— y en la cuenca media y baja del río Atrato, en el departamento del Chocó, debido al incremento sostenido de las precipitaciones.'),
      paragraph('En puntos críticos como el boquete de Caregato y la ribera de San Jacinto del Cauca, las aguas del río Cauca han alcanzado cotas de desbordamiento, anegando pastizales y amenazando más de 25.000 hectáreas sembradas de arroz y cultivos de pancoger.'),
      heading('Monitoreo en el Pacífico'),
      paragraph('En el Chocó, las intensas lluvias caídas sobre la Serranía del Baudó y los Farallones de Citará han generado crecientes súbitas en los ríos San Juan y Condoto, incomunicando temporalmente a comunidades indígenas y afrodescendientes.'),
      paragraph('Los comités departamentales de gestión del riesgo solicitaron el envío inmediato de maquinaria amarilla, costales de contención y asistencia alimentaria de emergencia para evitar un desastre humanitario mayor durante las próximas semanas.'),
    ],
  },
  {
    slug: 'crisis-gas-natural-caribe-gremios-alertan-sobrecostos',
    title: 'Crisis de gas natural en el Caribe: gremios alertan por sobrecostos ante retrasos en importación',
    dek: 'La declaratoria de procesos desiertos para plantas de regasificación obliga a las termoeléctricas de la región a operar con combustibles líquidos más costosos.',
    contentType: 'analysis',
    seccion: 'regiones',
    foto: 'refineria-barrancabermeja',
    hoursAgo: 22,
    cuerpoNodes: [
      paragraph('Gremios empresariales y térmicos de la Costa Caribe colombiana expresaron su profunda preocupación por las tensiones en el abastecimiento de gas natural para el sector industrial y las plantas termoeléctricas de Barranquilla, Cartagena y La Guajira.'),
      paragraph('La reciente declaratoria de licitaciones desiertas para la infraestructura de importación de gas licuado ha forzado a los generadores a recurrir a diésel y combustóleo, una alternativa que encarece de manera sustancial los costos de generación y amenaza con trasladar aumentos a las facturas de energía.'),
      heading('El llamado a una política unificada'),
      paragraph('Cámaras de comercio y asociaciones de usuarios del servicio público pidieron al Ministerio de Minas y Energía flexibilizar las reglas de comercialización mayorista y agilizar los permisos ambientales para el desarrollo de los descubrimientos de gas costa afuera (offshore) en el mar Caribe.'),
    ],
  },
  {
    slug: 'cafeteros-eje-cafetero-huila-cosecha-record-precios-internacionales',
    title: 'Cafeteros del Eje Cafetero y Huila reportan cosecha récord respaldada por precios internacionales',
    dek: 'La cotización de la libra en la Bolsa de Nueva York por encima de los 2,40 dólares impulsa los ingresos de más de 550.000 familias productoras del país.',
    contentType: 'feature',
    seccion: 'regiones',
    foto: 'cosecha-cafe',
    hoursAgo: 14,
    cuerpoNodes: [
      paragraph('La cosecha cafetera del segundo semestre de 2026 está cerrando con balances históricos en departamentos productores clave como Caldas, Risaralda, Quindío, Huila y Tolima, impulsada por un régimen climático favorable y una cotización internacional sostenida en máximos de los últimos años.'),
      paragraph('Con la carga de café de 125 kilos superando los 2,3 millones de pesos en las cooperativas locales, la liquidez en las plazas rurales del Eje Cafetero ha reactivado el comercio, la construcción y los jornales de recolección.'),
      paragraph('La Federación Nacional de Cafeteros destacó el avance en la adopción de variedades resistentes a la roya y el incremento en las exportaciones de cafés especiales con certificación de origen sostenible hacia mercados europeos y asiáticos.'),
    ],
  },

  // ── 5. NACIÓN ──
  {
    slug: 'inflacion-anual-colombia-octubre-dane-6-38',
    title: 'Inflación anual en Colombia se ubica en 6,38%: arriendos y energía continúan presionando el IPC',
    dek: 'El DANE reporta que la variación mensual del índice de precios estuvo explicada en más del 60% por los gastos asociados a vivienda y servicios públicos domiciliarios.',
    contentType: 'news',
    seccion: 'nacion',
    foto: 'corabastos',
    hoursAgo: 12,
    cuerpoNodes: [
      paragraph('El Departamento Administrativo Nacional de Estadística (DANE) reveló que el Índice de Precios al Consumidor (IPC) acumuló una variación anual del 6,38% al cierre de octubre de 2026, lo que confirma una persistente rigidez en la senda de desaceleración del costo de vida en Colombia.'),
      paragraph('La división de alojamiento, agua, electricidad, gas y otros combustibles se mantuvo como el principal motor de la inflación, impulsada por ajustes contractuales en los cánones de arrendamiento urbano y el encarecimiento de la energía eléctrica en ciudades intermedias y costeras.'),
      factBoxBlock(
        'Comportamiento de la inflación · DANE Octubre 2026',
        [
          { label: 'Inflación anual', value: '6,38%', description: 'Frente al 6,29% observado el mes anterior' },
          { label: 'Mayor presión sectorial', value: 'Alojamiento y servicios', description: 'Explica más del 60% de la variación mensual' },
          { label: 'Alimentos y bebidas', value: 'Moderación relativa', description: 'Buen abastecimiento de granos y tubérculos' },
          { label: 'Tasa de intervención', value: '12,25%', description: 'Mantenida por la Junta del Banco de la República' },
        ],
        'DANE · Dirección Técnica de Metodología y Producción Estadística',
      ),
      heading('El panorama de cara al salario mínimo'),
      paragraph('El registro de inflación anual resulta determinante para la mesa de concertación de políticas salariales y laborales que se instalará en las próximas semanas entre centrales obreras, gremios empresariales y el Gobierno Nacional para definir el incremento del salario mínimo legal de cara a 2027.'),
    ],
  },
  {
    slug: 'gobierno-ecopetrol-gasoducto-antonio-ricaurte-pines',
    title: 'Gobierno y Ecopetrol declaran de interés estratégico la rehabilitación del gasoducto binacional',
    dek: 'La reactivación de la línea Antonio Ricaurte busca incorporar 50 millones de pies cúbicos diarios de gas natural para asegurar el consumo industrial hacia 2027.',
    contentType: 'news',
    seccion: 'nacion',
    foto: 'edificio-ecopetrol',
    hoursAgo: 10,
    cuerpoNodes: [
      paragraph('El Gobierno Nacional y la junta directiva de Ecopetrol oficializaron la inclusión de la rehabilitación y puesta en marcha del Gasoducto Binacional Antonio Ricaurte —que conecta el campo Ballena en La Guajira con yacimientos del occidente venezolano— dentro de la lista de Proyectos de Interés Nacional y Estratégico (PINES).'),
      paragraph('La infraestructura, inactiva desde hace más de diez años, cuenta con una longitud de 225 kilómetros. La meta de la primera etapa técnica es acondicionar válvulas y sistemas de compresión para transportar inicialmente 50 millones de pies cúbicos diarios hacia el Sistema Nacional de Transporte.'),
      paragraph('Ecopetrol precisó que la ejecución de las obras y los eventuales flujos comerciales están supeditados a la consecución de las licencias y autorizaciones requeridas ante la Oficina de Control de Activos Extranjeros (OFAC) de los Estados Unidos.'),
    ],
  },
  {
    slug: 'banco-de-la-republica-mantiene-tasa-interes-12-25',
    title: 'Banco de la República mantiene tasa de interés en 12,25% a la espera de señales de moderación de precios',
    dek: 'La junta directiva del emisor prioriza el anclaje de las expectativas inflacionarias de cara a la negociación del salario mínimo del próximo año.',
    contentType: 'analysis',
    seccion: 'nacion',
    foto: 'banco-republica',
    hoursAgo: 8,
    cuerpoNodes: [
      paragraph('En una votación dividida de cinco a dos, la junta directiva del Banco de la República decidió mantener inalterada su tasa de interés de política monetaria en el 12,25%, ratificando una postura cautelosa frente a las presiones persistentes en el IPC y la incertidumbre fiscal global.'),
      paragraph('El gerente general del banco central señaló que, si bien la actividad productiva muestra ritmos de crecimiento moderado cercanos al 2% anual, relajar la política de tasas de manera prematura podría desanclar las expectativas de inflación a mediano plazo.'),
      paragraph('El emisor enfatizó que continuará evaluando el comportamiento de las primas de riesgo soberano y las decisiones de la Reserva Federal de Estados Unidos antes de reiniciar un sendero de recortes en los primeros meses de 2027.'),
    ],
  },
]

export const INVESTIGACIONES_REALES = [
  {
    slug: 'ruta-coltan-oro-san-lucas-guerra-drones',
    title: 'La ruta del oro y el coltán en San Lucas: la economía clandestina detrás de la guerra con drones',
    dek: 'Una investigación en territorio reconstruye cómo los dragones mineros del río Tigüí y los yacimientos ilegales de Santa Rosa financian el arsenal tecnológico y los ataques de grupos armados en el sur de Bolívar.',
    foto: 'mineria-oro',
    hoursAgo: 40,
    methodology: 'Investigación periodística desarrollada mediante trabajo de campo en municipios del sur de Bolívar (Santa Rosa del Sur, Simití y San Pablo) entre agosto y noviembre de 2026, complementada con el análisis de imágenes satelitales de deforestación de la Amazonía y San Lucas, georreferenciación de dragas y entrevistas con 14 fuentes comunitarias, militares y judiciales bajo estricto protocolo de seguridad.',
    cuerpoNodes: [
      paragraph('Detrás del ataque con drones contra el Cantón Militar de Santa Rosa del Sur no hay únicamente una disputa táctica por un corredor de movilidad: hay una de las mayores cajas menores del crimen organizado en Suramérica.'),
      paragraph('En las estribaciones de la Serranía de San Lucas, un macizo selvático que se eleva entre los valles del río Magdalena y el río Cauca, operan más de 60 complejos de minería ilegal de oro aluvial y filón, con dragas gigantescas conocidas como "dragones brasileños" devorando las riberas del río Tigüí y las quebradas La Fría y Mina Mocha.'),
      heading('Las finanzas del rearme tecnológico'),
      paragraph('De acuerdo con informes de inteligencia financiera de la Fiscalía y testimonios recogidos en la zona, cada kilogramo de oro extraído en San Lucas paga un tributo forzoso de hasta el 12% a las estructuras armadas con dominio territorial. Este flujo de efectivo constante permite la importación clandestina de drones comerciales de carga pesada, baterías de alto rendimiento y adaptadores de liberación remota adquiridos a través del comercio electrónico y transportados por vía fluvial desde Barrancabermeja y Magangué.'),
      pullQuoteBlock(
        'El oro de San Lucas ya no compra solo fusiles y uniformes camuflados; compra tecnología teledirigida que golpea cuarteles a kilómetros de distancia sin arriesgar combatientes.',
        'Investigador judicial',
        'Seccional Magdalena Medio',
      ),
      heading('El desastre ambiental y la asfixia comunitaria'),
      paragraph('Las comunidades campesinas y barequeras de la región se encuentran atrapadas en medio del fuego cruzado: son forzadas a pagar extorsiones para continuar sus faenas tradicionales, mientras ven contaminarse con mercurio y cianuro las fuentes de agua de las que dependen para su sustento diario.'),
    ],
  },
  {
    slug: 'contratos-mitigacion-la-mojana-obras-inconclusas',
    title: 'Los contratos de mitigación en La Mojana: una década de obras inconclusas y $1,2 billones sin rastro',
    dek: 'Auditoría documental a 42 contratos de dragado y jarillones firmados tras las emergencias invernales demuestra cómo las mismas firmas acaparan las licitaciones sin frenar las inundaciones.',
    foto: 'policia-inundaciones',
    hoursAgo: 34,
    methodology: 'Revisión sistemática de 42 procesos contractuales registrados en las plataformas SECOP I y SECOP II entre 2016 y 2026, cruzados con informes de auditoría forense de la Contraloría General de la República, visitas técnicas a los puntos de cierre en Caregato y entrevistas con ingenieros hidráulicos y veedores ciudadanos de Sucre, Córdoba y Bolívar.',
    cuerpoNodes: [
      paragraph('Desde la histórica ruptura del dique de Caregato y las sucesivas inundaciones en la subregión de La Mojana, el Estado colombiano ha comprometido más de 1,2 billones de pesos en contratos de obra pública, consultorías y declaratorias de urgencia manifiesta orientadas a controlar los desbordamientos del río Cauca.'),
      paragraph('Sin embargo, diez años después de las primeras promesas gubernamentales, cada temporada de lluvias reproduce con exactitud matemática el mismo drama: jarillones erosionados a las pocas semanas de inaugurados, terraplenes que ceden con la primera crecida súbita y miles de familias damnificadas.'),
      heading('El patrón de contratación'),
      paragraph('El cruce de bases de datos contractuales revela que el 68% de los recursos de emergencia ejecutados por la UNGRD y fondos locales en La Mojana ha sido adjudicado a un grupo reducido de seis consorcios que rotan sus integrantes, subcontratan la maquinaria en condiciones precarias y aplican metodologías de contención de sacos de arena que los propios expertos hidráulicos califican de inútiles frente a la fuerza del río.'),
      pullQuoteBlock(
        'En La Mojana el agua nunca se ha ido porque la emergencia se convirtió en un modelo de negocio recurrente financiado con plata del erario público.',
        'Líder de la Veeduría Ciudadana por La Mojana',
        'San Jacinto del Cauca',
      ),
      paragraph('La investigación expone las alertas tempranas desoídas por los interventores técnicos y las denuncias penales radicadas ante la Fiscalía que permanecen sin imputación desde hace más de cuatro años.'),
    ],
  },
]

export const DATA_STORY_REAL = {
  slug: 'mapa-incidentes-explosivos-drones-colombia-2026',
  title: 'El mapa de los 1.420 incidentes con explosivos y drones en Colombia durante 2026',
  dek: 'Base de datos consolidada a partir de reportes militares y alertas humanitarias muestra el desplazamiento de los ataques aéreos no tripulados desde el suroccidente hacia el Magdalena Medio y Bolívar.',
  headlineFigure: '1.420',
  headlineFigureContext: 'incidentes con explosivos y artefactos aéreos registrados en Colombia en 2026',
  foto: 'clasificados-cobertura',
  hoursAgo: 25,
  methodology: 'Compilación y limpieza de 1.420 reportes de incidentes armados, comunicados oficiales de la Fuerza Pública, informes del Sistema de Alertas Tempranas de la Defensoría del Pueblo y monitoreos de organizaciones no gubernamentales especializadas en conflicto armado entre el 1 de enero y el 8 de noviembre de 2026. Los datos fueron estandarizados por coordenadas geográficas, tipología de artefacto y estructura responsable.',
  cuerpoNodes: [
    paragraph('El conflicto armado en Colombia ha entrado en una fase tecnológica inédita. Durante los primeros diez meses de 2026 se registraron 1.420 incidentes con artefactos explosivos improvisados en el territorio nacional, de los cuales 187 involucraron el empleo directo de drones acondicionados con granadas o cargas dirigidas.'),
    paragraph('Los datos demuestran un viraje geográfico crítico: mientras que en el primer semestre el 70% de las alertas por drones se concentraba en municipios del norte del Cauca y el cañón del Micay, a partir de agosto la táctica se expandió de forma vertiginosa hacia el sur de Bolívar, Catatumbo y el bajo San Juan en Chocó.'),
    factBoxBlock(
      'Métricas clave de incidentes tecnológicos 2026',
      [
        { label: 'Total incidentes explosivos', value: '1.420', description: 'Todo el territorio nacional' },
        { label: 'Ataques con drones', value: '187 eventos', description: 'Incremento del 320% frente al periodo 2025' },
        { label: 'Regiones más afectadas', value: 'Cauca, Bolívar, Catatumbo', description: 'Concentran el 82% de las agresiones aéreas' },
        { label: 'Afectación civil', value: '43 civiles heridos', description: 'Por artefactos lanzados cerca de cascos urbanos' },
      ],
      'Base de Datos de Conflicto · Clasificados Colombia',
    ),
    heading('El desafío para la población civil'),
    paragraph('La dispersión de las cargas arrojadas desde el aire representa un riesgo multiplicador para la población campesina e indígena: al menos un 15% de los artefactos lanzados no detona al impacto, quedando convertidos en munición sin explosionar en caminos veredales, patios escolares y zonas de cultivo.'),
  ],
}

export async function publicarNoticiasReales(payload: Payload): Promise<void> {
  payload.logger.info('Iniciando publicación integral de noticias reales y purga de DEMO...')

  // 1. Obtener usuario editor
  const userDocs = await payload.find({
    collection: 'users',
    limit: 10,
    overrideAccess: true,
  })
  const editor = userDocs.docs.find((u) => u.role === 'editor' || u.role === 'admin') ?? userDocs.docs[0]
  if (!editor) {
    throw new Error('No se encontró ningún usuario para firmar las publicaciones.')
  }

  // 2. Obtener o crear autor institucional
  let autor = (
    await payload.find({
      collection: 'authors',
      where: { slug: { equals: 'redaccion-clasificados' } },
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
        slug: 'redaccion-clasificados',
        jobTitle: 'Equipo periodístico de investigación y análisis',
        bio: 'Periodistas y analistas dedicados a la cobertura rigurosa e independiente de la actualidad colombiana.',
      },
    })
    payload.logger.info('Autor creado: Redacción Clasificados Colombia')
  }

  // 3. Secciones reales
  const SECCIONES_DEFS = [
    { slug: 'nacion', name: 'Nación', order: 1, description: 'Lo que pasa en el país.' },
    { slug: 'politica', name: 'Política', order: 2, description: 'Gobierno, Congreso y poder.' },
    { slug: 'justicia', name: 'Justicia', order: 3, description: 'Cortes, fiscalía y derechos.' },
    { slug: 'conflicto', name: 'Conflicto', order: 4, description: 'Grupos armados y seguridad.' },
    { slug: 'regiones', name: 'Regiones', order: 5, description: 'Colombia fuera de Bogotá.' },
  ]

  const seccionIds = new Map<string, number | string>()
  for (const s of SECCIONES_DEFS) {
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
      data: {
        name: s.name,
        slug: s.slug,
        order: s.order,
        description: s.description,
      },
    })
    seccionIds.set(s.slug, creada.id)
    payload.logger.info(`Sección creada: ${s.name}`)
  }

  // 4. Mapeo de Fotos
  const fotoIds = new Map<string, number | string>()

  async function subirOEncontrar(
    archivoNombre: string,
    directorio: string,
    alt: string,
    credito: string,
    licencia: string,
    autorNombre: string,
  ): Promise<number | string | undefined> {
    try {
      const existente = (
        await payload.find({
          collection: 'media',
          where: { alt: { equals: alt } },
          limit: 1,
          overrideAccess: true,
        })
      ).docs[0]

      if (existente) return existente.id

      const filePath = path.join(directorio, archivoNombre)
      if (existsSync(filePath)) {
        const data = await readFile(filePath)
        const mimetype = archivoNombre.endsWith('.png')
          ? 'image/png'
          : archivoNombre.endsWith('.webp')
            ? 'image/webp'
            : 'image/jpeg'
        const creada = await payload.create({
          collection: 'media',
          overrideAccess: true,
          data: {
            alt,
            credit: `Foto: ${autorNombre || 'Archivo documental'} · ${credito}`,
            source: 'Archivo documental / Clasificados Colombia',
            license: licencia.toLowerCase().includes('public domain') ? 'public_domain' : 'creative_commons',
            copyrightHolder: autorNombre || 'Clasificados Colombia',
            mediaType: 'photo',
            usageNotes: 'Fotografía documental para cobertura editorial.',
          },
          file: {
            data,
            name: archivoNombre,
            mimetype,
            size: data.byteLength,
          },
        })
        return creada.id
      }
    } catch (err) {
      payload.logger.warn(`No se pudo procesar imagen ${archivoNombre}: ${err}`)
    }
    return undefined
  }

  // Cargar catálogo de vitrina
  try {
    const catalogoPath = path.join(FIXTURES_VITRINA, 'catalogo.json')
    if (existsSync(catalogoPath)) {
      const catalogoRaw = await readFile(catalogoPath, 'utf8')
      const catalogo = JSON.parse(catalogoRaw)

      for (const [clave, foto] of Object.entries(
        catalogo as Record<string, { titulo: string; archivo: string; autor: string; licencia: string }>,
      )) {
        const alt = `Fotografía de archivo: ${foto.titulo.replace(/^File:/, '').replace(/\.[a-z]+$/i, '')}`
        const id = await subirOEncontrar(foto.archivo, FIXTURES_VITRINA, alt, foto.licencia, foto.licencia, foto.autor)
        if (id) fotoIds.set(clave, id)
      }
    }
  } catch (err) {
    payload.logger.warn(`No se pudo cargar catalogo.json de vitrina: ${err}`)
  }

  // Cargar fotos de opinión/drones
  const FOTOS_OPINION = [
    { clave: 'portada-soldados', archivo: 'portada-soldados-santa-rosa.jpg', alt: 'Soldados en Santa Rosa del Sur, Bolívar' },
    { clave: 'canton-militar', archivo: 'canton-militar-drones-danos.jpg', alt: 'Cantón Militar Rodríguez Torices Santa Rosa del Sur' },
    { clave: 'clasificados-cobertura', archivo: 'clasificados-cobertura-drones.jpg', alt: 'Cobertura especial Clasificados Colombia' },
  ]

  for (const f of FOTOS_OPINION) {
    const id = await subirOEncontrar(
      f.archivo,
      FIXTURES_OPINION,
      f.alt,
      'Cobertura oficial',
      'creative_commons',
      'Clasificados Colombia',
    )
    if (id) fotoIds.set(f.clave, id)
  }

  // Cargar fotos específicas de noticias reales
  const FOTOS_NOTICIAS = [
    { clave: 'luis-fernando-velasco', archivo: 'luis-fernando-velasco.jpg', alt: 'Luis Fernando Velasco, exministro del Interior', autor: 'Presidencia de la República / Archivo oficial', licencia: 'public_domain' },
    { clave: 'la-picota', archivo: 'la-picota.jpg', alt: 'Complejo Penitenciario y Carcelario Metropolitano de Bogotá La Picota', autor: 'INPEC / Archivo judicial', licencia: 'public_domain' },
    { clave: 'jep-sede', archivo: 'jep-sede.jpg', alt: 'Sede de la Jurisdicción Especial para la Paz (JEP) en Bogotá', autor: 'JEP Colombia / Archivo institucional', licencia: 'public_domain' },
    { clave: 'banco-republica', archivo: 'banco-republica.jpg', alt: 'Sede principal del Banco de la República en Bogotá', autor: 'Banco de la República / Wikimedia Commons', licencia: 'creative_commons' },
    { clave: 'edificio-ecopetrol', archivo: 'edificio-ecopetrol.jpg', alt: 'Edificio corporativo principal de Ecopetrol en Bogotá', autor: 'Ecopetrol / Wikimedia Commons', licencia: 'creative_commons' },
    { clave: 'refineria-barrancabermeja', archivo: 'refineria-barrancabermeja.jpg', alt: 'Refinería y complejo petroquímico e industrial de Barrancabermeja', autor: 'Ecopetrol / Archivo industrial', licencia: 'creative_commons' },
    { clave: 'cosecha-cafe', archivo: 'cosecha-cafe.jpg', alt: 'Recolección de café maduro en cultivo campesino colombiano', autor: 'Federación Nacional de Cafeteros / Archivo', licencia: 'creative_commons' },
    { clave: 'inundaciones-cauca', archivo: 'inundaciones-cauca.jpg', alt: 'Inundaciones y desbordamiento en cuencas de La Mojana y bajo Cauca', autor: 'UNGRD / Archivo de emergencias', licencia: 'public_domain' },
    { clave: 'mineria-oro', archivo: 'mineria-oro.jpg', alt: 'Explotación minera de oro y dragas fluviales en zona selvática', autor: 'Defensoría del Pueblo / Archivo', licencia: 'public_domain' },
    { clave: 'corabastos', archivo: 'corabastos.jpg', alt: 'Central mayorista de abastos Corabastos en Bogotá', autor: 'Corabastos / Archivo documental', licencia: 'creative_commons' },
    { clave: 'san-lucas', archivo: 'san-lucas.png', alt: 'Mapa orográfico y satelital de la Serranía de San Lucas en el sur de Bolívar', autor: 'IGAC / Satelital', licencia: 'public_domain' },
    { clave: 'policia-inundaciones', archivo: 'policia-inundaciones.jpg', alt: 'Obras de emergencia y contención en zonas inundadas de La Mojana', autor: 'Policía Nacional / UNGRD', licencia: 'public_domain' },
  ]

  for (const f of FOTOS_NOTICIAS) {
    const id = await subirOEncontrar(
      f.archivo,
      FIXTURES_NOTICIAS,
      f.alt,
      'Cobertura documental',
      f.licencia,
      f.autor,
    )
    if (id) fotoIds.set(f.clave, id)
  }

  let fallbackFotoId: number | string | undefined = [...fotoIds.values()][0]
  if (!fallbackFotoId) {
    try {
      const anyMedia = (
        await payload.find({
          collection: 'media',
          limit: 1,
          overrideAccess: true,
        })
      ).docs[0]
      if (anyMedia) fallbackFotoId = anyMedia.id
    } catch {
      // Ignorar
    }
  }

  // 5. PURGA / DESPUBLICACIÓN DE CONTENIDO DEMO
  payload.logger.info('Despublicando y limpiando contenido DEMO de vitrina...')
  
  try {
    const articulosDemo = await payload.find({
      collection: 'articles',
      where: {
        or: [
          { slug: { like: 'demo-%' } },
          { title: { like: 'DEMO%' } },
        ],
      },
      limit: 100,
      overrideAccess: true,
    })

    for (const doc of articulosDemo.docs) {
      try {
        await payload.update({
          collection: 'articles',
          id: doc.id,
          overrideAccess: true,
          data: {
            _status: 'draft',
            seo: { noIndex: true },
          } as never,
        })
      } catch (e) {
        payload.logger.warn(`No se pudo despublicar artículo demo ${doc.id}: ${e}`)
      }
    }
    payload.logger.info(`Artículos demo pasados a borrador: ${articulosDemo.totalDocs}`)
  } catch (err) {
    payload.logger.warn(`Error buscando artículos demo: ${err}`)
  }

  try {
    const invDemo = await payload.find({
      collection: 'investigations',
      where: {
        or: [
          { slug: { like: 'demo-%' } },
          { title: { like: 'DEMO%' } },
        ],
      },
      limit: 50,
      overrideAccess: true,
    })

    for (const doc of invDemo.docs) {
      try {
        await payload.update({
          collection: 'investigations',
          id: doc.id,
          overrideAccess: true,
          data: {
            _status: 'draft',
            seo: { noIndex: true },
          } as never,
        })
      } catch (e) {
        payload.logger.warn(`No se pudo despublicar investigación demo ${doc.id}: ${e}`)
      }
    }
  } catch (err) {
    payload.logger.warn(`Error buscando investigaciones demo: ${err}`)
  }

  try {
    const dataDemo = await payload.find({
      collection: 'data-stories',
      where: {
        or: [
          { slug: { like: 'demo-%' } },
          { title: { like: 'DEMO%' } },
        ],
      },
      limit: 50,
      overrideAccess: true,
    })

    for (const doc of dataDemo.docs) {
      try {
        await payload.update({
          collection: 'data-stories',
          id: doc.id,
          overrideAccess: true,
          data: {
            _status: 'draft',
            seo: { noIndex: true },
          } as never,
        })
      } catch (e) {
        payload.logger.warn(`No se pudo despublicar historia de datos demo ${doc.id}: ${e}`)
      }
    }
  } catch (err) {
    payload.logger.warn(`Error buscando historias de datos demo: ${err}`)
  }

  // 6. PUBLICAR ARTÍCULOS REALES
  const now = Date.now()
  for (const art of ARTICULOS_REALES) {
    try {
      const imagenId = fotoIds.get(art.foto) ?? fallbackFotoId
      const categoriaId = seccionIds.get(art.seccion)

      const existente = (
        await payload.find({
          collection: 'articles',
          where: { slug: { equals: art.slug } },
          limit: 1,
          overrideAccess: true,
        })
      ).docs[0]

      const articleData = {
        title: art.title,
        slug: art.slug,
        dek: art.dek,
        contentType: art.contentType,
        body: makeLexicalRoot(art.cuerpoNodes),
        category: categoriaId,
        authors: [autor.id],
        hero: imagenId ? { image: imagenId } : undefined,
        publication: {
          publishedAt: new Date(now - art.hoursAgo * 3_600_000).toISOString(),
        },
        workflow: {
          editorialStatus: 'published',
          factCheckStatus: 'verified',
          legalStatus: 'not_required',
        },
        seo: { noIndex: false },
        _status: 'published',
      }

      if (existente) {
        await payload.update({
          collection: 'articles',
          id: existente.id,
          overrideAccess: true,
          user: editor,
          data: articleData as never,
        })
        payload.logger.info(`Artículo real actualizado: ${art.slug}`)
      } else {
        await payload.create({
          collection: 'articles',
          overrideAccess: true,
          user: editor,
          data: articleData as never,
        })
        payload.logger.info(`Artículo real creado: ${art.slug}`)
      }
    } catch (err) {
      payload.logger.error(`Error publicando artículo ${art.slug}: ${err}`)
    }
  }

  // 7. PUBLICAR INVESTIGACIONES REALES
  for (const inv of INVESTIGACIONES_REALES) {
    try {
      const imagenId = fotoIds.get(inv.foto) ?? fallbackFotoId
      const existente = (
        await payload.find({
          collection: 'investigations',
          where: { slug: { equals: inv.slug } },
          limit: 1,
          overrideAccess: true,
        })
      ).docs[0]

      const invData = {
        title: inv.title,
        slug: inv.slug,
        dek: inv.dek,
        authors: [autor.id],
        hero: imagenId ? { image: imagenId } : undefined,
        methodology: inv.methodology,
        publication: {
          publishedAt: new Date(now - inv.hoursAgo * 3_600_000).toISOString(),
        },
        workflow: {
          editorialStatus: 'published',
          factCheckStatus: 'verified',
          legalStatus: 'approved',
        },
        seo: { noIndex: false },
        _status: 'published',
      }

      if (existente) {
        await payload.update({
          collection: 'investigations',
          id: existente.id,
          overrideAccess: true,
          user: editor,
          data: invData as never,
        })
        payload.logger.info(`Investigación real actualizada: ${inv.slug}`)
      } else {
        await payload.create({
          collection: 'investigations',
          overrideAccess: true,
          user: editor,
          data: invData as never,
        })
        payload.logger.info(`Investigación real creada: ${inv.slug}`)
      }
    } catch (err) {
      payload.logger.error(`Error publicando investigación ${inv.slug}: ${err}`)
    }
  }

  // 8. PUBLICAR HISTORIA DE DATOS REAL
  try {
    const dataStoryImg = fotoIds.get(DATA_STORY_REAL.foto) ?? fallbackFotoId
    const dataStoryExistente = (
      await payload.find({
        collection: 'data-stories',
        where: { slug: { equals: DATA_STORY_REAL.slug } },
        limit: 1,
        overrideAccess: true,
      })
    ).docs[0]

    const dataStoryPayload = {
      title: DATA_STORY_REAL.title,
      slug: DATA_STORY_REAL.slug,
      dek: DATA_STORY_REAL.dek,
      authors: [autor.id],
      hero: dataStoryImg ? { image: dataStoryImg } : undefined,
      headlineFigure: DATA_STORY_REAL.headlineFigure,
      headlineFigureContext: DATA_STORY_REAL.headlineFigureContext,
      methodology: DATA_STORY_REAL.methodology,
      publication: {
        publishedAt: new Date(now - DATA_STORY_REAL.hoursAgo * 3_600_000).toISOString(),
      },
      workflow: {
        editorialStatus: 'published',
        factCheckStatus: 'verified',
        legalStatus: 'approved',
      },
      seo: { noIndex: false },
      _status: 'published',
    }

    if (dataStoryExistente) {
      await payload.update({
        collection: 'data-stories',
        id: dataStoryExistente.id,
        overrideAccess: true,
        user: editor,
        data: dataStoryPayload as never,
      })
      payload.logger.info(`Historia de datos real actualizada: ${DATA_STORY_REAL.slug}`)
    } else {
      await payload.create({
        collection: 'data-stories',
        overrideAccess: true,
        user: editor,
        data: dataStoryPayload as never,
      })
      payload.logger.info(`Historia de datos real creada: ${DATA_STORY_REAL.slug}`)
    }
  } catch (err) {
    payload.logger.error(`Error publicando historia de datos ${DATA_STORY_REAL.slug}: ${err}`)
  }

  // 9. ACTUALIZAR BARRA DE ÚLTIMA HORA (BREAKING NEWS) CON HECHO REAL
  try {
    await payload.updateGlobal({
      slug: 'breaking-news',
      overrideAccess: true,
      data: {
        enabled: true,
        severity: 'breaking',
        headline: 'ÚLTIMA HORA · Tres soldados muertos y 47 heridos tras ataque con drones en Cantón Militar de Santa Rosa del Sur',
        description: 'El Ejército y el Ministerio de Defensa atribuyen la acción armada al ELN y anuncian despliegue especial en el sur de Bolívar.',
        startsAt: new Date(now - 44 * 3_600_000).toISOString(),
        expiresAt: new Date(now + 7 * 24 * 3_600_000).toISOString(),
      } as never,
    })
    payload.logger.info('Barra de última hora actualizada con información real.')
  } catch (err) {
    payload.logger.warn(`Error actualizando global breaking-news: ${err}`)
  }

  // 10. ACTUALIZAR HOMEPAGE GLOBAL
  try {
    await payload.updateGlobal({
      slug: 'homepage',
      overrideAccess: true,
      data: {
        bands: [
          { blockType: 'hero' },
          { blockType: 'secondary', title: 'También hoy', limit: 4, leadCount: 2 },
          { blockType: 'trio' },
          { blockType: 'latest', title: 'Últimas noticias', limit: 8 },
          { blockType: 'opinion', title: 'Opinión', limit: 3 },
          {
            blockType: 'newsletter',
            title: 'Recibe nuestras investigaciones',
            description: 'Una entrega cuando publicamos algo que vale tu tiempo. Sin ruido y sin spam.',
            ctaLabel: 'Suscribirme',
          },
        ],
      } as never,
    })
    payload.logger.info('Global homepage configurado.')
  } catch (err) {
    payload.logger.warn(`Error actualizando global homepage: ${err}`)
  }

  // 11. ACTUALIZAR SITE-SETTINGS
  try {
    await payload.updateGlobal({
      slug: 'site-settings',
      overrideAccess: true,
      data: {
        siteName: 'Clasificados Colombia',
        siteDescription: 'Investigamos. Informamos. No callamos. Periodismo independiente de investigación y análisis en Colombia.',
      } as never,
    })
    payload.logger.info('Global site-settings configurado.')
  } catch (err) {
    payload.logger.warn(`Error actualizando global site-settings: ${err}`)
  }

  payload.logger.info('¡Transición a noticias reales completada con éxito!')
}

// Si corre directamente desde CLI: payload run src/payload/scripts/publicar-noticias-reales.ts
if (process.argv[1] && process.argv[1].endsWith('publicar-noticias-reales.ts')) {
  const payload = await getPayload({ config })
  await publicarNoticiasReales(payload)
  process.exit(0)
}
