export function generateCSRFToken(): string {
  const array = new Uint8Array(24)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Basic fallback for environments without crypto (rare in modern JS)
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function hashPII(value: string): string {
  // Non-cryptographic fast hash for anonymization (not for security-sensitive use)
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    const chr = value.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0
  }
  return `h_${Math.abs(hash)}`
}

