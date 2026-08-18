/**
 * Meilisearch settings as code (PRD Nº9 §12-§22, §31-§36; CLAUDE.md §39).
 *
 * Versioned here, never configured only from the dashboard. A ranking rule that
 * exists solely in a running container is a ranking rule that disappears with
 * the container and that nobody can review, diff or explain six months later.
 * §22 asks for every ranking change to be documented; this file is where that
 * documentation lives.
 */

export const INDEXES = {
  editorial: 'editorial_content',
  entities: 'entities',
  authors: 'authors',
} as const

export type IndexName = (typeof INDEXES)[keyof typeof INDEXES]

export type IndexSettings = {
  searchableAttributes: string[]
  filterableAttributes: string[]
  sortableAttributes: string[]
  rankingRules: string[]
  distinctAttribute?: string
  stopWords?: string[]
  synonyms?: Record<string, string[]>
  typoTolerance?: {
    enabled: boolean
    minWordSizeForTypos: { oneTypo: number; twoTypos: number }
    disableOnWords?: string[]
    disableOnAttributes?: string[]
  }
}

/**
 * Stop words (PRD Nº9 §35).
 *
 * Deliberately short. Aggressive stop-word lists break exactly the queries a
 * news archive needs to answer — "la fiscalía" and "el proceso" are how people
 * actually type, and removing the article is fine, but a long list starts
 * eating words that carry meaning in a headline.
 */
const STOP_WORDS = [
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'del', 'al', 'a', 'ante', 'con', 'en', 'para', 'por', 'sin', 'sobre',
  'y', 'e', 'o', 'u', 'que', 'se', 'su', 'sus', 'lo',
]

/**
 * Synonyms (PRD Nº9 §31-§34).
 *
 * Colombian institutional vocabulary, where the same body is referred to by an
 * acronym, a short name and a full legal name — and a reader searching for
 * "Contraloría" should find a piece that only ever writes "CGR".
 *
 * §33 warns about directionality. Meilisearch synonyms are one-directional per
 * key, so each pairing that should work both ways is written in both
 * directions. Getting that wrong produces a search that works from the acronym
 * and mysteriously fails from the full name.
 */
const SYNONYMS: Record<string, string[]> = {
  fiscalia: ['fiscalía', 'fgn', 'fiscalía general'],
  'fiscalía': ['fiscalia', 'fgn', 'fiscalía general'],
  fgn: ['fiscalía', 'fiscalía general de la nación'],

  contraloria: ['contraloría', 'cgr', 'contraloría general'],
  'contraloría': ['contraloria', 'cgr', 'contraloría general'],
  cgr: ['contraloría', 'contraloría general de la república'],

  procuraduria: ['procuraduría', 'pgn'],
  'procuraduría': ['procuraduria', 'pgn'],
  pgn: ['procuraduría', 'procuraduría general de la nación'],

  secop: ['sistema electrónico de contratación pública', 'contratación estatal'],
  dian: ['dirección de impuestos y aduanas nacionales'],
  dnp: ['departamento nacional de planeación'],
  ungrd: ['unidad nacional para la gestión del riesgo de desastres'],

  'corte suprema': ['csj', 'corte suprema de justicia'],
  'corte constitucional': ['cc'],
}

/**
 * Words where typo tolerance does more harm than good (PRD Nº9 §27).
 *
 * Short institutional acronyms are within one edit of each other and of common
 * Spanish words. With typo tolerance on, a search for "CGR" also returns "CAR"
 * and "CRC" — three different public bodies.
 */
const NO_TYPO_WORDS = ['cgr', 'fgn', 'pgn', 'dian', 'dnp', 'csj', 'car', 'crc', 'ungrd', 'secop']

/**
 * Editorial content index (PRD Nº9 §6, §12-§22).
 *
 * `searchableAttributes` order is the ranking (§12-§13): a piece where the
 * query appears once in the headline should normally beat one where it appears
 * five times in the body. Meilisearch weights earlier attributes more heavily,
 * so `bodyText` is deliberately last.
 *
 * `rankingRules` keeps Meilisearch's defaults and appends two editorial
 * signals, in that order and no earlier. Putting `searchPriority` above
 * `proximity` or `attribute` would let an investigation outrank a piece that is
 * plainly a better answer, which §20 forbids: the boost breaks ties, it does
 * not overturn relevance. `publishedAt` last gives freshness as a final
 * tie-breaker without turning search into a reverse-chronological list (§16,
 * §21).
 */
export const EDITORIAL_SETTINGS: IndexSettings = {
  searchableAttributes: [
    'title',
    'dek',
    'authors.name',
    'topics',
    'people',
    'organizations',
    'bodyText',
  ],

  filterableAttributes: [
    'contentType',
    'category.slug',
    'topicSlugs',
    'authors.id',
    'publishedAt',
    'featured',
    'breaking',
    'collection',
  ],

  sortableAttributes: ['publishedAt', 'searchPriority'],

  rankingRules: [
    'words',
    'typo',
    'proximity',
    'attribute',
    'sort',
    'exactness',
    'searchPriority:desc',
    'publishedAt:desc',
  ],

  stopWords: STOP_WORDS,
  synonyms: SYNONYMS,

  typoTolerance: {
    enabled: true,
    // Spanish institutional acronyms are three to five characters, and one
    // edit apart from each other. Requiring five characters before allowing a
    // single typo keeps "CGR" from matching "CAR".
    minWordSizeForTypos: { oneTypo: 5, twoTypos: 9 },
    disableOnWords: NO_TYPO_WORDS,
  },
}

/** Entities index (PRD Nº9 §7, §67-§70). */
export const ENTITIES_SETTINGS: IndexSettings = {
  searchableAttributes: ['name', 'aliases', 'roleDescription'],
  filterableAttributes: ['kind', 'active'],
  sortableAttributes: ['name'],
  rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  typoTolerance: {
    enabled: true,
    // Names are the thing people misspell most, so this index is more forgiving
    // than the editorial one.
    minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
  },
}

/** Authors index (PRD Nº9 §8, §71). */
export const AUTHORS_SETTINGS: IndexSettings = {
  searchableAttributes: ['name', 'jobTitle', 'expertise'],
  filterableAttributes: ['active'],
  sortableAttributes: ['name'],
  rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
}

export const SETTINGS_BY_INDEX: Record<IndexName, IndexSettings> = {
  [INDEXES.editorial]: EDITORIAL_SETTINGS,
  [INDEXES.entities]: ENTITIES_SETTINGS,
  [INDEXES.authors]: AUTHORS_SETTINGS,
}
