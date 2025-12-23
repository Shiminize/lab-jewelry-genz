import bcrypt from 'bcryptjs'

const DEFAULT_ROUNDS = 10

export async function hashPassword(password: string) {
  return bcrypt.hash(password, DEFAULT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string) {
  if (!password || !hash) return false
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.warn('[auth/password] compare failed', error)
    return false
  }
}
