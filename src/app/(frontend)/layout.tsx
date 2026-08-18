import type { Metadata } from 'next'
import React from 'react'

import { SiteFooter } from '@/components/navigation/SiteFooter'
import { SiteHeader } from '@/components/navigation/SiteHeader'
import { fontVariables } from '@/styles/fonts'

import '@/styles/globals.css'

/*
 * The full metadata layer — canonical URLs, Open Graph, JSON-LD — is F16.
 * What is here is the minimum a page needs to be a valid document.
 */
/**
 * The frontend renders per request, not at build time.
 *
 * `/` was previously prerendered, and the consequence was not theoretical: the
 * production build runs before the database has its content, so the header was
 * baked with an empty navigation and stayed that way. Tag revalidation does not
 * rescue it either — `revalidateTag` only reaches the running Next server, so a
 * change made by the seed, a migration or a worker leaves the built HTML
 * untouched.
 *
 * The breaking-news bar makes it worse. It expires by the clock passing
 * `expiresAt`, and no save fires at that instant. A statically built page would
 * keep announcing an emergency that ended hours ago — exactly the failure the
 * mandatory expiry exists to prevent.
 *
 * The cost is small because the reads are still cached: `readGlobal` holds each
 * global for 60 seconds and drops it the moment an editor saves. A request
 * therefore renders from memory, not from Postgres.
 *
 * F16 owns the full caching strategy (PRD Infraestructura §132) and is where
 * per-route static or ISR delivery gets designed properly, with the tags to
 * support it. Until then this is the setting that cannot serve stale editorial
 * state, which on this product is the failure that matters.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    default: 'Clasificados Colombia',
    template: '%s · Clasificados Colombia',
  },
  description: 'Investigamos. Informamos. No callamos.',
}

/**
 * Frontend shell (PRD Nº8 §26-§32).
 *
 * `<main id="contenido">` is the target of the skip link and the page's only
 * `main` landmark — the two things that let a screen reader user reach the
 * article without walking the header first.
 *
 * Header and footer are async Server Components reading their own globals.
 * Keeping them out of the page components means no page has to remember to
 * fetch navigation, and no page can forget.
 */
export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={fontVariables}>
      <body className="flex min-h-dvh flex-col bg-[var(--color-surface)] text-[color:var(--color-text)]">
        <SiteHeader />

        <main id="contenido" className="flex-1">
          {children}
        </main>

        <SiteFooter />
      </body>
    </html>
  )
}
