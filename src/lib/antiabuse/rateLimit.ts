/**
 * In-process rate limiting (PRD Master §51, CLAUDE.md §68).
 *
 * Pure and testable: the clock is an argument, so window boundaries can be
 * asserted rather than slept through.
 *
 * Deliberately not distributed. This stops one client hammering an endpoint;
 * it is not a security control, and it does not survive a restart or coordinate
 * across instances. The real limiter belongs at the reverse proxy, where it can
 * see every instance — that lands with the infrastructure phase. Saying so here
 * matters more than the code: a limiter people believe is stronger than it is
 * ends up being the only one.
 */
export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number }

export type RateLimiterOptions = {
  /** Requests permitted per window. */
  limit: number
  windowMs: number
  /**
   * Bound on tracked keys. Without it a spray of distinct addresses turns the
   * limiter into a memory leak — a denial-of-service through the thing meant to
   * prevent one.
   */
  maxKeys?: number
}

type Bucket = { count: number; resetAt: number }

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>()

  constructor(private readonly options: RateLimiterOptions) {}

  check(key: string, now: number): RateLimitResult {
    const bucket = this.buckets.get(key)

    if (!bucket || bucket.resetAt <= now) {
      if (this.buckets.size >= (this.options.maxKeys ?? 10_000)) this.buckets.clear()

      this.buckets.set(key, { count: 1, resetAt: now + this.options.windowMs })

      return { allowed: true, remaining: this.options.limit - 1, retryAfterSeconds: 0 }
    }

    bucket.count += 1

    const allowed = bucket.count <= this.options.limit

    return {
      allowed,
      remaining: Math.max(0, this.options.limit - bucket.count),
      retryAfterSeconds: allowed ? 0 : Math.ceil((bucket.resetAt - now) / 1000),
    }
  }

  /** Test seam. */
  reset(): void {
    this.buckets.clear()
  }
}
