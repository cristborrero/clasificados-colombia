'use client'

import { useAllFormFields } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

import {
  getPublishBlockers,
  type FactCheckStatus,
  type LegalStatus,
} from '@/editorial/status'

/**
 * What still stands between this piece and publication (F18).
 *
 * The server refuses the publish either way — `enforceStatusContract` is the
 * authority and it runs on every write, REST included. This exists so an editor
 * finds out before pressing the button rather than after, from an error that
 * arrives as a wall of text.
 *
 * It deliberately reuses `getPublishBlockers`, the same pure function the
 * server guard calls. A second list of rules written for the UI would drift,
 * and it would drift in the direction that matters least to notice: the panel
 * saying "ready" for something the backend then refuses.
 *
 * The rights check is the exception and has to be asked of the server, because
 * the licence lives on the media document and the form holds only its id.
 */

type FormValue = { value?: unknown }
type FormState = Record<string, FormValue | undefined>

function read(fields: FormState, path: string): unknown {
  return fields[path]?.value
}

/** `true` when a relationship or array field actually holds something. */
function hasAny(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'number') return true

  return value !== undefined && value !== null && value !== ''
}

export function PublicationChecklist() {
  const [fields] = useAllFormFields() as unknown as [FormState, unknown]

  const rawHero = read(fields, 'hero.image') ?? read(fields, 'poster')
  const heroId =
    typeof rawHero === 'object' && rawHero !== null && 'id' in rawHero
      ? (rawHero as { id: unknown }).id
      : rawHero

  /*
   * Keyed by the image it describes, rather than reset when the image changes.
   * Clearing it in the effect would mean a synchronous `setState` on every
   * render where there is no hero, which is a cascading render for a value that
   * can simply be derived.
   */
  const [checked, setChecked] = useState<{ id: string; blocker: string | null } | null>(null)
  const heroKey =
    typeof heroId === 'string' || typeof heroId === 'number' ? String(heroId) : null
  const rightsBlocker = checked && checked.id === heroKey ? checked.blocker : null

  useEffect(() => {
    if (!heroKey) return

    let cancelled = false

    /*
     * Asked of the server rather than inferred. The form carries the id of the
     * image, not its licence, and guessing from what is on screen is how a
     * panel ends up disagreeing with the guard that actually decides.
     */
    void fetch(`/api/media/${heroKey}?depth=0`, { credentials: 'include' })
      .then((response) => (response.ok ? response.json() : null))
      .then((asset: { license?: string; alt?: string } | null) => {
        if (cancelled) return

        setChecked({
          id: heroKey,
          blocker:
            asset?.license === 'unknown'
              ? `La imagen principal («${asset.alt ?? 'sin descripción'}») tiene licencia desconocida. Regístrala en la imagen antes de publicar.`
              : null,
        })
      })
      .catch(() => {
        // A failed lookup must not invent a blocker. The server still refuses.
        if (!cancelled) setChecked({ id: heroKey, blocker: null })
      })

    return () => {
      cancelled = true
    }
  }, [heroKey])

  const namesPeople =
    hasAny(read(fields, 'people')) || hasAny(read(fields, 'relations.people'))

  const blockers = getPublishBlockers({
    factCheckStatus: read(fields, 'workflow.factCheckStatus') as FactCheckStatus | undefined,
    legalStatus: read(fields, 'workflow.legalStatus') as LegalStatus | undefined,
    /*
     * Methodology is required of investigations only, and the marker for one is
     * that the field exists on this form at all.
     */
    requiresMethodology: 'methodology' in fields,
    hasMethodology: hasAny(read(fields, 'methodology')),
    hasAuthors: hasAny(read(fields, 'authors')),
    namesPeople,
  })

  const messages = [...blockers.map((blocker) => blocker.message)]

  if (rightsBlocker) messages.push(rightsBlocker)

  if (messages.length === 0) {
    return (
      <p
        style={{
          margin: '0 0 var(--base) 0',
          fontSize: '0.8rem',
          color: 'var(--theme-success-600, #2e7d32)',
        }}
      >
        Listo para publicar: no queda ningún requisito pendiente.
      </p>
    )
  }

  return (
    <div
      role="status"
      style={{
        margin: '0 0 var(--base) 0',
        padding: 'calc(var(--base) / 2)',
        borderLeft: '3px solid var(--theme-warning-500, #d98e04)',
        background: 'var(--theme-elevation-50)',
        fontSize: '0.8rem',
      }}
    >
      <strong style={{ display: 'block', marginBottom: '0.4em' }}>
        Falta antes de publicar
      </strong>

      <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  )
}

export default PublicationChecklist
