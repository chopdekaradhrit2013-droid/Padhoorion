// Simple, robust in-memory sliding window rate limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

/**
 * Checks if a given key has exceeded the maximum allowed requests within a window.
 * @param key unique identifier (e.g. `comment:${userId}` or `upload:${userId}`)
 * @param limit maximum allowed actions
 * @param windowMs window size in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): { success: boolean; remaining: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { success: false, remaining: 0, retryAfterSeconds };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count };
}

