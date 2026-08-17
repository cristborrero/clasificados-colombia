import { NextResponse } from 'next/server'

/**
 * Liveness — "is the process alive?" (PRD Nº4 §71)
 *
 * Deliberately checks NOTHING external. A liveness probe that touches the
 * database will restart a healthy container during a transient DB blip, which
 * turns a small outage into a big one.
 */
export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json(
    { status: 'ok', check: 'liveness' },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
