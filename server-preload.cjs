/**
 * Low-level HTTP server preload (CommonJS).
 *
 * Intercepts Node's `http.Server` request dispatch at socket parsing time,
 * before Next.js or Payload ever inspects headers or constructs URLs.
 *
 * Chained reverse proxies (e.g. Cloudflare -> OpenLiteSpeed -> Docker) append
 * to `X-Forwarded-Host` and `X-Forwarded-Proto`, resulting in comma-separated
 * values like "clasificadoscolombia.co, clasificadoscolombia.co". Next.js
 * uses these headers to build the absolute request URL, which causes `new URL()`
 * to throw `ERR_INVALID_URL` and fail requests with 500.
 */
const http = require('node:http')

const originalEmit = http.Server.prototype.emit

http.Server.prototype.emit = function (event, req, res) {
  if (event === 'request' && req && req.headers) {
    const fHost = req.headers['x-forwarded-host']
    if (typeof fHost === 'string' && fHost.includes(',')) {
      req.headers['x-forwarded-host'] = fHost.split(',')[0].trim()
    }

    const fProto = req.headers['x-forwarded-proto']
    if (typeof fProto === 'string' && fProto.includes(',')) {
      req.headers['x-forwarded-proto'] = fProto.split(',')[0].trim()
    }

    const host = req.headers['host']
    if (typeof host === 'string' && host.includes(',')) {
      req.headers['host'] = host.split(',')[0].trim()
    }
  }

  return originalEmit.apply(this, arguments)
}
