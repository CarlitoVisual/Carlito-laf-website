const buckets = new Map<string, { count: number; resetAt: number }>()

/** Basic in-memory per-key rate limit. Resets on redeploy/cold start — good enough to blunt naive form flooding. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (bucket.count >= limit) return false
  bucket.count++
  return true
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  return forwarded?.split(",")[0].trim() || "unknown"
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: unknown): boolean {
  return typeof email === "string" && EMAIL_RE.test(email)
}
