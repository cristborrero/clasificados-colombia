import { withPayload } from '@payloadcms/next/withPayload'

/**
 * Content Security Policy (PRD Master §51, CLAUDE.md §57).
 *
 * Built as an allowlist against the integrations this site actually has, which
 * PRD Nº4 §55 required before writing one. That surface is now known and it is
 * small — which is itself a result of earlier decisions: social embeds render
 * as links rather than as third-party frames, and share controls are plain
 * intent links, so there is no Twitter, Meta or TikTok script to allow.
 *
 * Two policies, not one. The public site gets the strict version; the Payload
 * admin gets a looser one because it is a bundled application that legitimately
 * needs blob workers and inline styles, and locking it to the public policy
 * breaks the CMS without making the public site any safer.
 *
 * `'unsafe-inline'` on script-src is the honest compromise here. Next injects
 * inline bootstrap scripts, and the nonce-based alternative requires threading
 * a nonce through middleware into every response — which disables static
 * optimisation and, on a Payload-in-Next setup, fights the admin bundle. The
 * mitigation that matters more is `object-src 'none'`, `base-uri 'self'` and
 * `frame-ancestors 'none'`, which close the injection routes that actually get
 * used.
 */
const mediaHost = (() => {
  const raw = process.env.S3_PUBLIC_URL ?? process.env.MINIO_ENDPOINT
  if (!raw) return ''

  try {
    return new URL(raw).origin
  } catch {
    return ''
  }
})()

const publicCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https:${mediaHost ? ` ${mediaHost}` : ''}`,
  "font-src 'self' data:",
  "connect-src 'self' blob: data: https:",
  "worker-src 'self' blob:",
  // YouTube is the only third party allowed to frame anything, and only
  // through the domain that sets no tracking cookie until playback starts.
  "frame-src https://www.youtube-nocookie.com https://challenges.cloudflare.com",
  "media-src 'self' blob: data: https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ')

/**
 * Admin policy.
 *
 * `blob:` for scripts and workers because the Lexical editor and the media
 * library create them; `data:` for images because the admin previews uploads
 * before they exist on a server.
 */
const adminCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https:${mediaHost ? ` ${mediaHost}` : ''}`,
  "font-src 'self' data:",
  "connect-src 'self' blob: data: https:",
  "worker-src 'self' blob:",
  "media-src 'self' blob: data: https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  /*
   * HSTS. Only meaningful behind TLS, and the proxy terminates it — but sending
   * it from the application means the header survives a proxy reconfiguration
   * that forgets it. Two years, subdomains included, without `preload`:
   * preloading is effectively irreversible and is the site owner's decision,
   * not a default.
   */
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /*
   * Modern formats (PRD Master §47).
   *
   * Negotiated per request by the image optimiser rather than stored as extra
   * derivatives. A stored AVIF and a stored WebP beside every size would double
   * the library for no gain: the optimiser already picks by `Accept` and falls
   * back to the original format on its own, so the alternative is more storage
   * and a second thing to regenerate. Declared explicitly instead of inherited
   * from the default so the choice is visible where the rest of the delivery
   * configuration lives.
   */
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'clasificadoscolombia.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
  /*
   * Standalone output is what the Docker multistage image needs, but it is not
   * compatible with `next start` — Next prints a warning and expects
   * `node .next/standalone/server.js` instead.
   *
   * Leaving it always on meant the local production server and the E2E suite
   * ran against a configuration Next considers unsupported. Gated on an
   * explicit build flag so the container build opts in and everything else
   * keeps a working `pnpm start`.
   */
  ...(process.env.BUILD_STANDALONE === 'true' ? { output: 'standalone' } : {}),
  async headers() {
    return [
      /*
       * Order alone is not enough to separate these.
       *
       * `/:path*` also matches `/admin`, both rules fire, and the one that
       * lands is the last — so the admin was served the public policy and the
       * Lexical editor lost its blob workers. The negative lookahead is what
       * actually keeps them apart; the ordering below is just for reading.
       */
      {
        source: '/admin',
        headers: [
          ...securityHeaders,
          { key: 'Content-Security-Policy', value: adminCsp },
          /*
           * The admin panel is a stateful React app whose content depends on
           * the session cookie. Without no-store, Next.js App Router caches
           * the page in the client-side Router Cache, which means:
           *   - Logout shows "session closed" but the cached admin page
           *     stays on screen instead of redirecting to /admin/login.
           *   - Browser back/forward may show stale admin views.
           */
          { key: 'Cache-Control', value: 'private, no-cache, no-store, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          ...securityHeaders,
          { key: 'Content-Security-Policy', value: adminCsp },
          { key: 'Cache-Control', value: 'private, no-cache, no-store, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [...securityHeaders, { key: 'Content-Security-Policy', value: adminCsp }],
      },
      {
        source: '/((?!admin|api).*)',
        headers: [...securityHeaders, { key: 'Content-Security-Policy', value: publicCsp }],
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
