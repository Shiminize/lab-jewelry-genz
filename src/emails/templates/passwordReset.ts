import type { MJMLParseResults } from 'mjml'
import { passwordResetMjml } from './passwordReset.mjml'

interface PasswordResetTemplateProps {
  resetUrl: string
  expiresMinutes: number
  userEmail: string
}

export function renderPasswordResetEmail({ resetUrl, expiresMinutes, userEmail }: PasswordResetTemplateProps) {
  const subject = 'Reset your GlowGlitch password'
  const { html } = require('mjml')(passwordResetMjml({ resetUrl, expiresMinutes, userEmail })) as MJMLParseResults
  const text = [
    'Password reset requested for your GlowGlitch account.',
    `Reset link: ${resetUrl}`,
    `This link expires in ${expiresMinutes} minutes.`,
    '',
    'If you did not request this, you can safely ignore this email.',
  ].join('\n')

  return { subject, html, text }
}
