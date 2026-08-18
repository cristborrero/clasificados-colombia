import { describe, expect, it } from 'vitest'

import { RateLimiter } from './rateLimit'

const START = 1_000_000

describe('RateLimiter', () => {
  it('allows requests up to the limit', () => {
    const limiter = new RateLimiter({ limit: 3, windowMs: 60_000 })

    for (let i = 0; i < 3; i += 1) {
      expect(limiter.check('a', START).allowed, `request ${i + 1}`).toBe(true)
    }
  })

  it('refuses the one after the limit', () => {
    const limiter = new RateLimiter({ limit: 2, windowMs: 60_000 })

    limiter.check('a', START)
    limiter.check('a', START)

    const result = limiter.check('a', START)

    expect(result.allowed).toBe(false)
    expect(result.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('counts each key separately', () => {
    // Otherwise one noisy sender locks out everyone behind the same limiter.
    const limiter = new RateLimiter({ limit: 1, windowMs: 60_000 })

    expect(limiter.check('a', START).allowed).toBe(true)
    expect(limiter.check('b', START).allowed).toBe(true)
    expect(limiter.check('a', START).allowed).toBe(false)
  })

  it('opens a fresh window once the old one expires', () => {
    const limiter = new RateLimiter({ limit: 1, windowMs: 60_000 })

    expect(limiter.check('a', START).allowed).toBe(true)
    expect(limiter.check('a', START + 59_999).allowed).toBe(false)
    expect(limiter.check('a', START + 60_000).allowed).toBe(true)
  })

  it('reports how long to wait, rounded up', () => {
    const limiter = new RateLimiter({ limit: 1, windowMs: 60_000 })

    limiter.check('a', START)

    expect(limiter.check('a', START + 30_500).retryAfterSeconds).toBe(30)
  })

  it('bounds its own memory', () => {
    // A spray of distinct addresses must not turn the limiter into a leak —
    // a denial of service through the thing meant to prevent one.
    const limiter = new RateLimiter({ limit: 5, windowMs: 60_000, maxKeys: 10 })

    for (let i = 0; i < 100; i += 1) limiter.check(`key-${i}`, START)

    // Still functional after the bound was hit.
    expect(limiter.check('key-fresh', START).allowed).toBe(true)
  })

  it('reports the remaining allowance', () => {
    const limiter = new RateLimiter({ limit: 3, windowMs: 60_000 })

    expect(limiter.check('a', START).remaining).toBe(2)
    expect(limiter.check('a', START).remaining).toBe(1)
    expect(limiter.check('a', START).remaining).toBe(0)
    expect(limiter.check('a', START).remaining).toBe(0)
  })
})
