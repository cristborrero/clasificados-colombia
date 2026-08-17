import type { Metadata } from 'next'
import React from 'react'

import { fontVariables } from '@/styles/fonts'

import '@/styles/globals.css'

/*
 * The full metadata layer — canonical URLs, Open Graph, JSON-LD — is F16.
 * What is here is the minimum a page needs to be a valid document.
 */
export const metadata: Metadata = {
  title: {
    default: 'Clasificados Colombia',
    template: '%s · Clasificados Colombia',
  },
  description: 'Investigamos. Informamos. No callamos.',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={fontVariables}>
      <body>{children}</body>
    </html>
  )
}
