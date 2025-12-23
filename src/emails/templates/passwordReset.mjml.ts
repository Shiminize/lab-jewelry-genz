import { getDesignToken } from '@/lib/designTokens'

const emailTheme = {
  text: getDesignToken('email-ink') || getDesignToken('color-ink'),
  buttonBg: getDesignToken('email-button-bg') || getDesignToken('color-accent'),
  bodyBg: getDesignToken('email-body-bg') || getDesignToken('color-bg'),
  cardBg: getDesignToken('email-card-bg') || getDesignToken('color-surface'),
  divider: getDesignToken('email-divider') || getDesignToken('color-line-subtle'),
  muted: getDesignToken('email-muted') || getDesignToken('color-ink-2'),
  subtle: getDesignToken('email-subtle') || getDesignToken('color-muted'),
}

export const passwordResetMjml = (opts: { resetUrl: string; expiresMinutes: number; userEmail: string }) => `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-text font-family="Inter, Helvetica, Arial, sans-serif" color="${emailTheme.text}" />
      <mj-button font-family="Inter, Helvetica, Arial, sans-serif" background-color="${emailTheme.buttonBg}" color="${emailTheme.text}" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="${emailTheme.bodyBg}">
    <mj-section background-color="${emailTheme.cardBg}" padding="32px">
      <mj-column>
        <mj-text align="center" font-size="20px" font-weight="600">GlowGlitch</mj-text>
        <mj-divider border-color="${emailTheme.divider}" padding="16px 0" />
        <mj-text font-size="18px" font-weight="600" padding="0 0 8px 0">Password reset requested</mj-text>
        <mj-text font-size="14px" line-height="1.6">
          We received a request to reset the password for <strong>${opts.userEmail}</strong>. Select the button below to set a new password.
        </mj-text>
        <mj-button href="${opts.resetUrl}" padding="16px 0">Reset password</mj-button>
        <mj-text font-size="13px" color="${emailTheme.muted}" line-height="1.6">
          This link expires in ${opts.expiresMinutes} minutes. If you didn't request a reset you can ignore this email—your password won't change.
        </mj-text>
        <mj-divider border-color="${emailTheme.divider}" padding="16px 0" />
        <mj-text font-size="12px" color="${emailTheme.subtle}">
          Need help? Reply to this email or contact concierge@glowglitch.com.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`
