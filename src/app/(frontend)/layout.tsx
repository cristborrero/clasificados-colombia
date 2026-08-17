import type { Metadata } from 'next'
import React from 'react'

import '@/styles/globals.css'

/*
 * Fonts (Playfair Display + Source Sans 3 via next/font) and the real metadata
 * layer land in F1 and F16 respectively. PRD Master §6 requires next/font so
 * that there is no blocking external request at runtime.
 */
export const metadata: Metadata = {
  title: 'Clasificados Colombia',
  description: 'Investigamos. Informamos. No callamos.',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body>{children}</body>
    </html>
  )
}
