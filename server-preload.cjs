/**
 * Low-level HTTP server preload & URL normalizer (CommonJS).
 *
 * 1. Patches `globalThis.URL` constructor and `URL.canParse` so that any
 *    comma-separated multi-value URL inputs resulting from chained reverse
 *    proxies (e.g. Cloudflare -> OpenLiteSpeed -> Docker) are automatically
 *    cleaned to the primary URL rather than crashing with ERR_INVALID_URL.
 *
 * 2. Intercepts Node's `http.Server` request dispatch and sanitizes ALL
 *    incoming HTTP request headers containing comma-separated URLs or hosts.
 */
const http = require('node:http')

function cleanUrlString(val) {
  if (typeof val === 'string' && val.includes(',')) {
    const parts = val.split(',')
    const first = (parts[0] || '').trim()
    if (first.startsWith('http://') || first.startsWith('https://') || first.includes('.')) {
      return first
    }
  }
  return val
}

const OriginalURL = globalThis.URL

globalThis.URL = class PatchedURL extends OriginalURL {
  constructor(input, base) {
    const cleanedInput = typeof input === 'string' ? cleanUrlString(input) : input
    const cleanedBase = typeof base === 'string' ? cleanUrlString(base) : base

    try {
      super(cleanedInput, cleanedBase)
    } catch (err) {
      if (typeof input === 'string' && input.includes(',')) {
        const fallback = input.split(',')[0].trim()
        super(fallback, cleanedBase)
      } else {
        throw err
      }
    }
  }
}

// Preserve all static properties and methods from original URL
for (const prop of Object.getOwnPropertyNames(OriginalURL)) {
  if (prop !== 'prototype' && prop !== 'length' && prop !== 'name') {
    globalThis.URL[prop] = OriginalURL[prop]
  }
}

if (typeof OriginalURL.canParse === 'function') {
  globalThis.URL.canParse = function (input, base) {
    const cleanedInput = typeof input === 'string' ? cleanUrlString(input) : input
    const cleanedBase = typeof base === 'string' ? cleanUrlString(base) : base
    return OriginalURL.canParse(cleanedInput, cleanedBase)
  }
}

const originalEmit = http.Server.prototype.emit

http.Server.prototype.emit = function (event, req, res) {
  if (event === 'request' && req && req.headers) {
    for (const key of Object.keys(req.headers)) {
      const val = req.headers[key]
      if (typeof val === 'string' && val.includes(',')) {
        const lowerKey = key.toLowerCase()
        if (
          lowerKey.includes('host') ||
          lowerKey.includes('proto') ||
          lowerKey.includes('origin') ||
          lowerKey.includes('referer') ||
          lowerKey.includes('url') ||
          lowerKey.includes('uri')
        ) {
          req.headers[key] = val.split(',')[0].trim()
        }
      }
    }
  }

  return originalEmit.apply(this, arguments)
}
