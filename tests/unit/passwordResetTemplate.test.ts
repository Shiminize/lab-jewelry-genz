import { renderPasswordResetEmail } from '@/emails/templates/passwordReset'

describe('password reset email template', () => {
  it('includes reset link and expiry', () => {
    const { subject, html, text } = renderPasswordResetEmail({
      resetUrl: 'https://example.com/reset-token',
      expiresMinutes: 30,
      userEmail: 'admin@example.com',
    })

    expect(subject).toMatch(/reset/i)
    expect(html).toContain('https://example.com/reset-token')
    expect(text).toContain('30 minutes')
  })
})
