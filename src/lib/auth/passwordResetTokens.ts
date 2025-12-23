import prisma from '@/lib/prisma'
import crypto from 'node:crypto'

export interface PasswordResetTokenDocument {
  id: string
  userId: string
  tokenHash: string
  expiresAt: Date
  usedAt?: Date | null
  createdAt: Date
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function createPasswordResetToken(userId: string, ttlMinutes = 30) {
  const token = crypto.randomUUID()
  const tokenHash = hashToken(token)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000)

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      createdAt: now,
    }
  })

  return { token, expiresAt }
}

export async function findValidPasswordResetToken(token: string) {
  const tokenHash = hashToken(token)
  const doc = await prisma.passwordResetToken.findUnique({
    where: { tokenHash }
  })

  if (!doc) return null
  if (doc.usedAt) return null
  if (doc.expiresAt.getTime() < Date.now()) return null

  return doc
}

export async function markPasswordResetTokenUsed(id: string) {
  await prisma.passwordResetToken.update({
    where: { id },
    data: { usedAt: new Date() }
  })
}
