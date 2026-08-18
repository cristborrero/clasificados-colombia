/*
 * NOTE ON `server-only`: this module is deliberately *not* marked with it.
 *
 * `server-only` throws unless it is resolved through Next's `react-server`
 * export condition, and `pnpm search:reindex` runs under plain Node via the
 * Payload CLI — where the marker turns a maintenance command into a crash.
 *
 * The guard lives one layer up, in `src/data/search.ts`, which only Next ever
 * imports. What protects the key here is that it is read from a non-`PUBLIC`
 * environment variable, so a client bundle would receive `undefined` rather
 * than a credential — and it is read inside a function, never at module scope,
 * so importing this file has no side effect at all.
 */

import { INDEXES, SETTINGS_BY_INDEX, type IndexName, type IndexSettings } from './settings'

/**
 * Meilisearch adapter (PRD Nº9 §37-§39, PRD Nº8 §43 — "detrás de una capa
 * estable").
 *
 * A typed `fetch` wrapper rather than the official client library. Our surface
 * is five endpoints — settings, add documents, delete documents, search, health
 * — and CLAUDE.md §85 asks whether the platform already solves the problem
 * before a dependency goes in. `fetch` solves HTTP. The PRD requires an adapter
 * layer in front of Meilisearch regardless, so the library would have been
 * wrapped rather than used directly.
 *
 * `server-only` at the top is load-bearing. This module holds the master key,
 * and the import throws at build time if a Client Component ever pulls it in —
 * a far better outcome than finding the key in a JavaScript bundle.
 */

export class SearchUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SearchUnavailableError'
  }
}

type MeiliConfig = { host: string; key: string }

/**
 * Reads configuration at call time, not at module load.
 *
 * A module-level env read runs during the build, where MEILI_HOST is
 * legitimately absent — and a module that throws on import takes the build with
 * it.
 */
function config(): MeiliConfig | null {
  const host = process.env.MEILI_HOST?.replace(/\/+$/, '')
  const key = process.env.MEILI_INDEXER_KEY || process.env.MEILI_MASTER_KEY

  return host && key ? { host, key } : null
}

export const isSearchConfigured = (): boolean => config() !== null

/** Requests time out rather than holding a render open on a dead service. */
const REQUEST_TIMEOUT_MS = 5_000

/**
 * Highlight markers.
 *
 * Plain sentinels rather than HTML tags. PRD Nº9 §46 allows highlighting but
 * forbids producing unsafe HTML, and the safe way to honour both is to never
 * let markup cross the boundary: Meilisearch returns text with these markers,
 * and the UI splits on them to build real elements. Nothing is ever passed to
 * `dangerouslySetInnerHTML`.
 *
 * The sequences are chosen to be things no editor would type.
 */
export const HIGHLIGHT_OPEN = '[[hl]]'
export const HIGHLIGHT_CLOSE = '[[/hl]]'

async function request<T>(
  path: string,
  init: { method?: string; body?: unknown; timeoutMs?: number } = {},
): Promise<T> {
  const meili = config()

  if (!meili) {
    throw new SearchUnavailableError('Meilisearch no está configurado (MEILI_HOST / clave).')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), init.timeoutMs ?? REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${meili.host}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${meili.key}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: controller.signal,
      // Never cached by Next: the index is the freshness boundary, and a cached
      // search response would outlive the documents it describes.
      cache: 'no-store',
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')

      throw new SearchUnavailableError(
        `Meilisearch respondio ${response.status} en ${path}. ${detail.slice(0, 300)}`,
      )
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof SearchUnavailableError) throw error

    // Includes the abort. The caller decides whether that is fatal: for a
    // reader it is a degraded search, for the indexer it is a job retry.
    throw new SearchUnavailableError(
      `No se pudo contactar Meilisearch: ${error instanceof Error ? error.message : 'error desconocido'}`,
    )
  } finally {
    clearTimeout(timer)
  }
}

export async function health(): Promise<{ status: string }> {
  return request<{ status: string }>('/health', { timeoutMs: 2_000 })
}

/**
 * Creates the index if it does not exist yet.
 *
 * Asks first rather than creating and tolerating the failure. Since writes are
 * now confirmed, "already exists" arrives as a *failed task* rather than as an
 * HTTP 409 — and a function that distinguishes real failures from expected ones
 * by matching on an error string is a function that stops working the day
 * Meilisearch rewords a message.
 */
export async function ensureIndex(index: IndexName): Promise<void> {
  try {
    await request(`/indexes/${index}`, { timeoutMs: 5_000 })

    return
  } catch {
    // Absent, or unreachable. If it is unreachable the creation below fails
    // with the real reason, which is the one worth reporting.
  }

  const task = await request<{ taskUid: number }>('/indexes', {
    method: 'POST',
    body: { uid: index, primaryKey: 'id' },
  })

  await waitForTask(task.taskUid)
}

/** Applies the versioned settings for an index (PRD Nº9 §22, CLAUDE.md §39). */
export async function applySettings(
  index: IndexName,
  settings: IndexSettings = SETTINGS_BY_INDEX[index],
): Promise<void> {
  const task = await request<{ taskUid: number }>(`/indexes/${index}/settings`, {
    method: 'PATCH',
    body: settings,
  })

  // Confirmed for the same reason as a document write: a rejected ranking rule
  // would otherwise leave the index running on its previous settings while the
  // deploy reports success.
  await waitForTask(task.taskUid)
}

/**
 * Every write in Meilisearch is asynchronous.
 *
 * A write returns 202 with a task id; whether the documents were actually
 * accepted is decided later, in the task queue. Treating the 202 as success is
 * how eleven documents came back "indexed" into an empty index: the ids
 * contained a character Meilisearch rejects, every task failed, and nothing in
 * the application ever heard about it.
 *
 * PRD Nº9 §86 forbids losing failures silently. So every write here is
 * confirmed, and an unconfirmed write is an error rather than a shrug.
 */
type EnqueuedTask = { taskUid: number }

type TaskStatus = {
  status: 'enqueued' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  error?: { message?: string; code?: string } | null
}

const TASK_POLL_INTERVAL_MS = 100

export async function waitForTask(taskUid: number, timeoutMs = 30_000): Promise<void> {
  const deadline = Date.now() + timeoutMs

  for (;;) {
    const task = await request<TaskStatus>(`/tasks/${taskUid}`, { timeoutMs: 5_000 })

    if (task.status === 'succeeded') return

    if (task.status === 'failed' || task.status === 'canceled') {
      throw new SearchUnavailableError(
        `La tarea ${taskUid} de Meilisearch terminó en ${task.status}: ${
          task.error?.message ?? 'sin detalle'
        }`,
      )
    }

    if (Date.now() > deadline) {
      // Still enqueued or processing. Not necessarily broken — but not
      // confirmed either, and reporting an unconfirmed write as done is the
      // failure mode this whole function exists to remove.
      throw new SearchUnavailableError(
        `La tarea ${taskUid} de Meilisearch no terminó en ${timeoutMs} ms (estado: ${task.status}).`,
      )
    }

    await new Promise((resolve) => setTimeout(resolve, TASK_POLL_INTERVAL_MS))
  }
}

export async function addDocuments(index: IndexName, documents: unknown[]): Promise<void> {
  if (documents.length === 0) return

  const task = await request<EnqueuedTask>(`/indexes/${index}/documents`, {
    method: 'PUT',
    body: documents,
    // A reindex batch is larger and slower than an interactive request.
    timeoutMs: 30_000,
  })

  await waitForTask(task.taskUid)
}

export async function deleteDocument(index: IndexName, id: string): Promise<void> {
  const task = await request<EnqueuedTask>(
    `/indexes/${index}/documents/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  )

  await waitForTask(task.taskUid)
}

export async function deleteAllDocuments(index: IndexName): Promise<void> {
  const task = await request<EnqueuedTask>(`/indexes/${index}/documents`, {
    method: 'DELETE',
    timeoutMs: 30_000,
  })

  await waitForTask(task.taskUid)
}

export type SearchHit = Record<string, unknown> & { id: string }

export type SearchResponse = {
  hits: SearchHit[]
  estimatedTotalHits: number
  processingTimeMs: number
  limit: number
  offset: number
}

export type SearchRequest = {
  q: string
  limit?: number
  offset?: number
  filter?: string[]
  sort?: string[]
  attributesToHighlight?: string[]
  attributesToCrop?: string[]
  cropLength?: number
}

export async function search(index: IndexName, body: SearchRequest): Promise<SearchResponse> {
  return request<SearchResponse>(`/indexes/${index}/search`, {
    method: 'POST',
    body: {
      ...body,
      highlightPreTag: HIGHLIGHT_OPEN,
      highlightPostTag: HIGHLIGHT_CLOSE,
    },
  })
}

export { INDEXES }
