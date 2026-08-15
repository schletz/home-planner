let counter = 0

/**
 * Creates a short unique id. `crypto.randomUUID` is available in every target
 * browser, the counter is only a fallback for exotic environments.
 */
export function createId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : `${Date.now().toString(36)}${(counter += 1)}`
  return `${prefix}-${random}`
}
