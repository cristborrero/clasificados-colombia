'use client'

import { useState } from 'react'

import { Body } from '@/components/editorial/Typography'
import { cn } from '@/components/ui/cn'
import { MAX_DESCRIPTION, MAX_TITLE } from '@/lib/tips/submission'

/**
 * Tip submission form (PRD Master §22).
 *
 * The anonymity checkbox does something visible: ticking it removes the contact
 * fields from the page rather than merely flagging them. A form that keeps
 * asking for a phone number after you said you want to be anonymous is a form
 * that is not listening, and a source reads that as carelessness — correctly,
 * since the server also drops those values, but the sender cannot see the
 * server.
 *
 * Submits to `/api/tips`, where the rate limit, Turnstile and validation live.
 * Nothing here is a security control; the checks that matter are the ones the
 * browser cannot skip.
 */
const fieldClass = cn(
  'w-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3',
  'font-[family-name:var(--font-sans)] text-[length:var(--text-body)]',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
)

const labelClass =
  'font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)] font-semibold'

type State = 'idle' | 'sending' | 'sent' | 'error'

export function TipForm() {
  const [anonymous, setAnonymous] = useState(false)
  const [state, setState] = useState<State>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setState('sending')
    setErrors({})

    const form = new FormData(event.currentTarget)

    try {
      const response = await fetch('/api/denunciar', { method: 'POST', body: form })
      const result = (await response.json()) as {
        ok: boolean
        message?: string
        errors?: Record<string, string>
      }

      if (result.ok) {
        setState('sent')
        setMessage(result.message ?? 'Recibimos tu denuncia.')
        return
      }

      setState('error')
      setMessage(result.message ?? 'No pudimos enviar tu denuncia.')
      setErrors(result.errors ?? {})
    } catch {
      setState('error')
      setMessage('No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.')
    }
  }

  if (state === 'sent') {
    return (
      <div
        role="status"
        className="border-l-2 border-[var(--color-accent)] py-4 pl-6"
      >
        <Body>{message}</Body>
        <Body className="mt-2 text-[color:var(--color-text-muted)]">
          {anonymous
            ? 'Como pediste anonimato, no guardamos ningún dato de contacto y no vamos a poder responderte.'
            : 'Si necesitamos más detalles, te escribimos.'}
        </Body>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className={labelClass}>
          Título
        </label>
        <input id="title" name="title" required maxLength={MAX_TITLE} className={fieldClass} />
        {errors.title ? (
          <p className="text-[length:var(--text-metadata)] text-[color:var(--color-danger)]">
            {errors.title}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className={labelClass}>
          Qué ocurrió
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={8}
          maxLength={MAX_DESCRIPTION}
          className={fieldClass}
        />
        {errors.description ? (
          <p className="text-[length:var(--text-metadata)] text-[color:var(--color-danger)]">
            {errors.description}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="location" className={labelClass}>
          Ubicación <span className="font-normal text-[color:var(--color-text-muted)]">(opcional)</span>
        </label>
        <input id="location" name="location" className={fieldClass} />
      </div>

      <div className="flex items-start gap-3 border-y border-[var(--color-border)] py-4">
        <input
          id="anonymous"
          name="anonymous"
          type="checkbox"
          checked={anonymous}
          onChange={(event) => setAnonymous(event.target.checked)}
          className="mt-1 size-5"
        />
        <label htmlFor="anonymous" className="font-[family-name:var(--font-sans)]">
          Quiero permanecer anónimo
          <span className="mt-1 block text-[length:var(--text-metadata)] text-[color:var(--color-text-muted)]">
            No guardaremos tu nombre, correo ni teléfono. Tampoco vamos a poder responderte.
          </span>
        </label>
      </div>

      {/*
        Removed from the DOM rather than disabled or hidden. A source who asked
        for anonymity should not watch the form keep asking for a phone number.
      */}
      {!anonymous ? (
        <fieldset className="flex flex-col gap-6 border-0 p-0">
          <legend className={cn(labelClass, 'mb-2')}>
            Cómo contactarte{' '}
            <span className="font-normal text-[color:var(--color-text-muted)]">(opcional)</span>
          </legend>

          <div className="flex flex-col gap-2">
            <label htmlFor="contactName" className={labelClass}>
              Nombre
            </label>
            <input id="contactName" name="contactName" className={fieldClass} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="contactEmail" className={labelClass}>
              Correo
            </label>
            <input id="contactEmail" name="contactEmail" type="email" className={fieldClass} />
            {errors.contactEmail ? (
              <p className="text-[length:var(--text-metadata)] text-[color:var(--color-danger)]">
                {errors.contactEmail}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="contactPhone" className={labelClass}>
              Teléfono
            </label>
            <input id="contactPhone" name="contactPhone" type="tel" className={fieldClass} />
          </div>
        </fieldset>
      ) : null}

      {/*
        Turnstile renders into this container when the site key is configured.
        The widget script is added with the key in F19; the endpoint already
        refuses submissions without a valid token, so wiring the UI later cannot
        leave the endpoint open — it can only leave the form unable to submit,
        which is the safe direction.
      */}
      <div
        className="cf-turnstile"
        data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
      />

      {state === 'error' && message ? (
        <p role="alert" className="border-l-2 border-[var(--color-danger)] py-2 pl-4">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === 'sending'}
        className={cn(
          'self-start border border-[var(--color-ink)] bg-[var(--color-ink)] px-6 py-3',
          'font-[family-name:var(--font-sans)] text-[color:var(--color-text-inverse)]',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
        )}
      >
        {state === 'sending' ? 'Enviando…' : 'Enviar'}
      </button>
    </form>
  )
}
