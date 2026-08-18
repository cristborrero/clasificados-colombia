import { Container } from '@/components/layout/Container'

/*
 * F8 placeholder.
 *
 * This is NOT the homepage. The real homepage is F10 and depends on the
 * editorial components of F9.
 *
 * It no longer renders its own `<main>`: the layout owns that landmark, and two
 * `main` elements on one page leave a screen reader with no single answer to
 * "where does the content start" — which is exactly what the skip link needs.
 */
export default function Page() {
  return (
    <Container width="reading" className="flex flex-col gap-6 py-24">
      <p className="text-[length:var(--text-label)] font-semibold tracking-[var(--text-label--letter-spacing)] text-[color:var(--color-accent)] uppercase">
        Fase 8 · Shell del sitio
      </p>

      <h1 className="font-[family-name:var(--font-editorial)] text-[length:var(--text-h1)] text-balance">
        Clasificados Colombia
      </h1>

      <p className="text-[length:var(--text-lead)] text-[color:var(--color-text-muted)]">
        Header, navegación y pie ya se leen desde Payload. La portada editorial es F10.
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
      <ul className="space-y-1 text-[length:var(--text-metadata)] text-[color:var(--color-text-muted)]">
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
    </Container>
  )
}
