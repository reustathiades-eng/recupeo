// ============================================================
// RÉCUPÉO — Chat Rate Limiter (en mémoire)
// ============================================================

import { RATE_LIMIT } from './constants'

interface RateBucket {
  minuteCount: number
  minuteReset: number
  sessionCount: number
}

const buckets = new Map<string, RateBucket>()

export function checkRateLimit(
  sessionId: string,
  authenticated: boolean
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const limits = authenticated ? RATE_LIMIT.authenticated : RATE_LIMIT.anonymous

  let bucket = buckets.get(sessionId)
  if (!bucket) {
    bucket = { minuteCount: 0, minuteReset: now + 60_000, sessionCount: 0 }
    buckets.set(sessionId, bucket)
  }

  // Reset minute window
  if (now > bucket.minuteReset) {
    bucket.minuteCount = 0
    bucket.minuteReset = now + 60_000
  }

  // Check limits
  if (bucket.minuteCount >= limits.maxPerMin) {
    return { allowed: false, remaining: 0 }
  }
  if (bucket.sessionCount >= limits.maxPerSession) {
    return { allowed: false, remaining: 0 }
  }

  bucket.minuteCount++
  bucket.sessionCount++

  return {
    allowed: true,
    remaining: limits.maxPerSession - bucket.sessionCount,
  }
}

// Cleanup vieux buckets toutes les 10 min
setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (now - bucket.minuteReset > 3_600_000) {
      buckets.delete(key)
    }
  }
}, 600_000)
