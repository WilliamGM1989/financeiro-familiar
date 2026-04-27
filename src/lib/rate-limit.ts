const store = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; msUntilReset: number } {
  const now = Date.now()
  const record = store.get(key)

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, msUntilReset: 0 }
  }

  if (record.count >= max) {
    return { allowed: false, msUntilReset: record.resetAt - now }
  }

  record.count++
  return { allowed: true, msUntilReset: 0 }
}
