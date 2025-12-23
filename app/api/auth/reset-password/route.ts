import { NextResponse } from 'next/server'
import { z } from 'zod'
import { findValidPasswordResetToken, markPasswordResetTokenUsed } from '@/lib/auth/passwordResetTokens'
import { updateUserPassword } from '@/lib/auth/userRepository'

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_REQUEST', issues: parsed.error.flatten() }, { status: 400 })
  }

  const { token, password } = parsed.data
  const record = await findValidPasswordResetToken(token)
  if (!record) {
    return NextResponse.json({ error: 'TOKEN_INVALID', message: 'Reset link is invalid or expired' }, { status: 400 })
  }

  await updateUserPassword(record.userId, password)
  await markPasswordResetTokenUsed(record.id)

  return NextResponse.json({ ok: true })
}
