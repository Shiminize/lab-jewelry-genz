import { NextResponse } from 'next/server'
import { z } from 'zod'
import { findUserByEmail } from '@/lib/auth/userRepository'
import { createPasswordResetToken } from '@/lib/auth/passwordResetTokens'
import { sendEmail } from '@/lib/email'
import { getClientIP } from '@/lib/api-utils'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/jwt-utils'
import { renderPasswordResetEmail } from '@/emails/templates/passwordReset'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_REQUEST', issues: parsed.error.flatten() }, { status: 400 })
  }

  const clientIp = getClientIP(request)
  const rateKey = `pwd-reset:${clientIp}`
  const rateResult = checkRateLimit(rateKey, 5, 60 * 60 * 1000)
  if (!rateResult.allowed) {
    const response = NextResponse.json({ error: 'RATE_LIMITED', message: 'Too many reset requests' }, { status: 429 })
    const headers = getRateLimitHeaders(rateResult)
    Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v))
    return response
  }

  const email = parsed.data.email.toLowerCase().trim()
  const user = await findUserByEmail(email)
  if (!user) {
    return NextResponse.json({ ok: true })
  }

  const { token, expiresAt } = await createPasswordResetToken(user.id)
  const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'http://localhost:3000'
  const resetUrl = new URL(`/reset-password/${token}`, baseUrl).toString()
  const expiresMinutes = Math.max(1, Math.round((expiresAt.getTime() - Date.now()) / (60 * 1000)))

  const { subject, html, text } = renderPasswordResetEmail({
    resetUrl,
    expiresMinutes,
    userEmail: user.email,
  })

  const emailResult = await sendEmail({ to: user.email, subject, text, html })
  if (!emailResult.success && emailResult.reason === 'not_configured') {
    console.info('[auth] password reset link issued (email not configured)', {
      email: user.email,
      resetUrl,
      expiresAt,
    })
  }

  return NextResponse.json({ ok: true })
}
