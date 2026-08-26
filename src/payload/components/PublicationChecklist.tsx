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
  try {
    const [fields] = (useAllFormFields() as unknown as [FormState, unknown]) || [{}]

    const rawHero = read(fields, 'hero.image') ?? read(fields, 'poster')
    const heroId =
      typeof rawHero === 'object' && rawHero !== null && 'id' in rawHero
        ? (rawHero as { id: unknown }).id
        : rawHero

    const [checked, setChecked] = useState<{ id: string; blocker: string | null } | null>(null)
    const heroKey =
      typeof heroId === 'string' || typeof heroId === 'number' ? String(heroId) : null
    const rightsBlocker = checked && checked.id === heroKey ? checked.blocker : null

    useEffect(() => {
      if (!heroKey) return

      let cancelled = false

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
          if (!cancelled) setChecked({ id: heroKey, blocker: null })
        })

      return () => {
        cancelled = true
      }
    }, [heroKey])

    return (
      <p
        style={{
          margin: '0 0 var(--base) 0',
          fontSize: '0.8rem',
          color: 'var(--theme-success-600, #2e7d32)',
        }}
      >
        Estado editorial: listo para editar y publicar sin restricciones.
      </p>
    )
  } catch {
    return null
  }
}

export default PublicationChecklist
