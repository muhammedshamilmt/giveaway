/**
 * In-memory sliding-window rate limiter.
 * For multi-instance / edge deployments replace the Map with a Redis/Upstash counter.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param key     Unique key — typically `ip:routeName`
 * @param limit   Max requests allowed in the window
 * @param windowMs Window duration in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count += 1;

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  };
}

/** Preset limits */
export const LIMITS = {
  auth:   { limit: 5,  windowMs: 15 * 60 * 1000 }, // 5 / 15 min
  otp:    { limit: 3,  windowMs: 15 * 60 * 1000 }, // 3 / 15 min
  form:   { limit: 10, windowMs: 60 * 1000 },        // 10 / min
  api:    { limit: 60, windowMs: 60 * 1000 },        // 60 / min
  admin:  { limit: 30, windowMs: 60 * 1000 },        // 30 / min
} as const;
