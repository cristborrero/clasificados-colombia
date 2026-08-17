/*
 * F0 placeholder.
 *
 * This is NOT the homepage. The real homepage is F10 and depends on the design
 * system (F1), editorial components (F9) and the content model (F4).
 *
 * Its only job is to prove the frontend route group renders and that Tailwind
 * and the brand tokens are wired.
 */
export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-24">
      <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-investigation-red)] uppercase">
        Fase 0 · Baseline
      </p>

      <h1 className="text-4xl font-semibold text-balance">Clasificados Colombia</h1>

      <p className="max-w-prose text-lg text-[var(--color-ink)]/70">
        Scaffold operativo. Next.js y Payload CMS corren en el mismo proceso sobre PostgreSQL.
      </p>

      {/*
        Plain anchors are correct here, not next/link:
          - /admin is rendered by Payload in a separate route group with its own
            root layout, so it is a full document boundary, not a client-side
            navigation target.
          - /api/health/* are Route Handlers returning JSON. Prefetching or
            soft-navigating to them would be meaningless.
      */}
      {/* eslint-disable @next/next/no-html-link-for-pages */}
      <ul className="max-w-prose space-y-1 text-sm text-[var(--color-ink)]/70">
        <li>
          Admin editorial:{' '}
          <a className="underline underline-offset-4" href="/admin">
            /admin
          </a>
        </li>
        <li>
          Liveness:{' '}
          <a className="underline underline-offset-4" href="/api/health/live">
            /api/health/live
          </a>
        </li>
        <li>
          Readiness:{' '}
          <a className="underline underline-offset-4" href="/api/health/ready">
            /api/health/ready
          </a>
        </li>
      </ul>
      {/* eslint-enable @next/next/no-html-link-for-pages */}
    </main>
  )
}
