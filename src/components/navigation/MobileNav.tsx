'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { Logo } from '@/components/brand/Logo'
import { cn } from '@/components/ui/cn'
import type { ResolvedLink } from '@/lib/navigation/links'

import { NavLink } from './NavLink'

/**
 * Mobile navigation (PRD Nº8 §28, ADR-002).
 *
 * Radix Dialog rather than a hand-rolled panel. What it provides is precisely
 * the part that is invisible until someone depends on it: focus moves into the
 * panel and is trapped there, the page behind is marked inert so a screen
 * reader does not read straight through the overlay, background scroll is
 * locked, and Escape closes. Every one of those is a bug you only find by
 * testing with a keyboard, which is exactly why it is not worth writing twice.
 *
 * Radix supplies behaviour only. Every visual decision here comes from the
 * design tokens (PRD Master §321).
 *
 * The panel closes on navigation. Next's App Router keeps the component mounted
 * across a client-side route change, so without this the reader taps a section
 * and the menu stays open over the page they asked for.
 *
 * That reset is done during render rather than in an effect. React's own
 * guidance for adjusting state when a prop changes is to compare against the
 * previous value while rendering: an effect would paint the open panel once on
 * the new route and then close it, which is a visible flash of the menu over
 * the page the reader just asked for.
 */
export type MobileNavProps = {
  links: readonly ResolvedLink[]
  secondary?: readonly ResolvedLink[]
}

export function MobileNav({ links, secondary = [] }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [renderedPath, setRenderedPath] = useState(pathname)

  if (pathname !== renderedPath) {
    setRenderedPath(pathname)
    setOpen(false)
  }

  if (links.length === 0 && secondary.length === 0) return null

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={cn(
          'inline-flex items-center gap-2 lg:hidden',
          /* 44px target (PRD Nº8, DoD F8): p-3 on a 20px icon. */
          'p-3 text-[length:var(--text-metadata)] uppercase',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
        )}
      >
        <Menu aria-hidden size={20} strokeWidth={1.75} />
        <span className="sr-only">Abrir menú</span>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgb(10_10_10/0.4)]" />

        <Dialog.Content
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col',
            'bg-[var(--color-surface)] shadow-[var(--shadow-overlay)]',
            'focus:outline-none',
          )}
        >
          {/* Required by Radix for the dialog's accessible name. Visually
              redundant next to the logo, so it is hidden rather than duplicated. */}
          <Dialog.Title className="sr-only">Menú de navegación</Dialog.Title>

          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
            <Logo variant="mark" height={32} />

            <Dialog.Close
              className={cn(
                'inline-flex items-center justify-center p-3',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
              )}
            >
              <X aria-hidden size={20} strokeWidth={1.75} />
              <span className="sr-only">Cerrar menú</span>
            </Dialog.Close>
          </div>

          <nav aria-label="Secciones" className="flex-1 overflow-y-auto px-6 py-6">
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <NavLink
                    link={link}
                    current={pathname === link.href}
                    className="block py-3 text-[length:var(--text-h3)] font-[family-name:var(--font-editorial)]"
                  />
                </li>
              ))}
            </ul>

            {secondary.length > 0 ? (
              <ul className="mt-8 flex flex-col gap-1 border-t border-[var(--color-border)] pt-6">
                {secondary.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <NavLink
                      link={link}
                      current={pathname === link.href}
                      className="block py-2 text-[length:var(--text-metadata)] text-[color:var(--color-text-muted)] uppercase"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
