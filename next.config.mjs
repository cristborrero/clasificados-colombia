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
  // Required for the Docker multistage image in F19.
  output: 'standalone',
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
