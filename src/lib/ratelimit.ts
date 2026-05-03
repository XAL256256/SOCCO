/**
 * In-memory token bucket rate limiter. Suitable for single-instance deployment.
 * For multi-instance, swap the store for Redis (Upstash) without changing the API.
 */

type Bucket = { tokens: number; updatedAt: number };

const buckets = new Map<string, Bucket>();

const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (now - bucket.updatedAt > 10 * 60_000) buckets.delete(key);
  }
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetMs: number;
};

export function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const refillPerMs = opts.limit / opts.windowMs;
  const existing = buckets.get(opts.key);
  let tokens = opts.limit;
  let updatedAt = now;

  if (existing) {
    const elapsed = now - existing.updatedAt;
    tokens = Math.min(opts.limit, existing.tokens + elapsed * refillPerMs);
    updatedAt = now;
  }

  if (tokens < 1) {
    buckets.set(opts.key, { tokens, updatedAt });
    return {
      success: false,
      remaining: 0,
      resetMs: Math.ceil((1 - tokens) / refillPerMs),
    };
  }

  tokens -= 1;
  buckets.set(opts.key, { tokens, updatedAt });

  return {
    success: true,
    remaining: Math.floor(tokens),
    resetMs: Math.ceil((opts.limit - tokens) / refillPerMs),
  };
}

export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 60_000 },
  api: { limit: 60, windowMs: 60_000 },
  receipt: { limit: 30, windowMs: 60_000 },
} as const;
