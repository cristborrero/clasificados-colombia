import { withPayload } from '@payloadcms/next/withPayload'

/**
 * Security headers per PRD Nº4 §54.
 * CSP is intentionally NOT set here yet: PRD Nº4 §55 requires an allowlist
 * designed against real integrations and tested against real functionality.
 * It lands in F19 (Docker & Compose) once the integration surface is known.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /*
   * Standalone output is what the Docker multistage image in F19 needs, but it
   * is not compatible with `next start` — Next prints a warning and expects
   * `node .next/standalone/server.js` instead.
   *
   * Leaving it always on meant the local production server and the E2E suite
   * ran against a configuration Next considers unsupported. Gated on an
   * explicit build flag so the container build opts in and everything else
   * keeps a working `pnpm start`.
   */
  ...(process.env.BUILD_STANDALONE === 'true' ? { output: 'standalone' } : {}),
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
