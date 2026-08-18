'use client'

import { Check, Copy, Link2 } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/components/ui/cn'

/**
 * Share controls (PRD Nº8 §62).
 *
 * No third-party share widgets, and that is a source-protection decision before
 * it is a performance one. The usual buttons load a script from each platform
 * on page view, which reports who opened which investigation to companies that
 * have no business knowing — whether or not the reader ever shares anything.
 *
 * What is here instead: plain intent links, which send nothing until clicked,
 * and a copy-to-clipboard control. The web-share sheet is used when the browser
 * has one, because on a phone that is the native way to do this.
 *
 * The confirmation is announced, not merely coloured: a check mark that only
 * changes shape tells a screen-reader user nothing about whether the copy
 * worked.
 */
export type ShareActionsProps = {
  url: string
  title: string
  /** `sidebar` is the discreet desktop rail; `inline` sits in the flow. */
  layout?: 'inline' | 'sidebar'
  className?: string
}

const buttonClass = cn(
  'inline-flex items-center justify-center gap-2 p-3',
  'font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)]',
  'border border-[var(--color-border)] no-underline',
  'hover:bg-[var(--color-surface-sunken)]',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
)

export function ShareActions({ url, title, layout = 'inline', className }: ShareActionsProps) {
  const [copied, setCopied] = useState(false)

  const share = async (): Promise<void> => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // Includes the reader dismissing the sheet. Fall through to copying,
        // which is the outcome they were reaching for anyway.
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 3000)
    } catch {
      // Clipboard access can be refused outright. Saying nothing is better than
      // claiming a copy that did not happen.
      setCopied(false)
    }
  }

  return (
    <div
      className={cn(
        'flex gap-2',
        layout === 'sidebar' ? 'flex-col' : 'flex-row flex-wrap items-center',
        className,
      )}
    >
      <p className="sr-only">Compartir este artículo</p>

      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
      >
        <Link2 aria-hidden size={16} strokeWidth={1.75} />
        WhatsApp
      </a>

      <a
        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}
        className={buttonClass}
      >
        <Link2 aria-hidden size={16} strokeWidth={1.75} />
        Correo
      </a>

      <button type="button" onClick={share} className={buttonClass}>
        {copied ? (
          <Check aria-hidden size={16} strokeWidth={2} />
        ) : (
          <Copy aria-hidden size={16} strokeWidth={1.75} />
        )}
        {copied ? 'Enlace copiado' : 'Copiar enlace'}
      </button>

      {/* Announced rather than only shown, so the outcome reaches a screen
          reader as well as an eye. */}
      <p role="status" aria-live="polite" className="sr-only">
        {copied ? 'Enlace copiado al portapapeles' : ''}
      </p>
    </div>
  )
}
