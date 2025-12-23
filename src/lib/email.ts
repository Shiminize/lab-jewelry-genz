import nodemailer from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'

type EmailSendResult =
  | { success: true; messageId: string }
  | { success: false; reason: 'not_configured' | 'send_failed'; error?: unknown }

let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null = null

function isEmailConfigured() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS)
}

async function getTransporter() {
  if (!isEmailConfigured()) {
    return null
  }

  if (!transporter) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env
    const port = Number(SMTP_PORT)
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number.isFinite(port) ? port : 465,
      secure: SMTP_SECURE ? SMTP_SECURE === 'true' : port === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  }

  return transporter
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  to: string
  subject: string
  text: string
  html?: string
  replyTo?: string
}): Promise<EmailSendResult> {
  const transporter = await getTransporter()

  if (!transporter) {
    console.warn('Email transport is not configured. Skipping send.')
    return { success: false, reason: 'not_configured' }
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'no-reply@glowglitch.com',
      to,
      subject,
      text,
      html,
      replyTo,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send email', error)
    return { success: false, reason: 'send_failed', error }
  }
}

export async function sendMediaKitEmail({
  to,
  name,
  mediaKitUrl,
}: {
  to: string
  name?: string
  mediaKitUrl?: string
}) {
  const link = mediaKitUrl ?? process.env.MEDIA_KIT_URL ?? 'https://glowglitch.com/media-kit'
  const safeName = name && name.trim().length > 0 ? name.trim() : 'Creator'
  const subject = 'Your GlowGlitch Creator Media Kit'
  const text = [
    `Hi ${safeName},`,
    '',
    'Thanks for applying to the GlowGlitch Creator Program. Here is your media kit to help you prepare for launch:',
    link,
    '',
    'It includes launch assets, brand guidelines, and the Coral & Sky preset files so you can start crafting content right away.',
    '',
    'We’ll be in touch within 48 hours to review next steps.',
    '',
    '— The GlowGlitch Team',
  ].join('\n')

  const html = [
    `<p>Hi ${safeName},</p>`,
    '<p>Thanks for applying to the GlowGlitch Creator Program. Here is your media kit to help you prepare for launch:</p>',
    `<p><a href="${link}">${link}</a></p>`,
    '<p>It includes launch assets, brand guidelines, and the Coral &amp; Sky preset files so you can start crafting content right away.</p>',
    '<p>We’ll be in touch within 48 hours to review next steps.</p>',
    '<p>— The GlowGlitch Team</p>',
  ].join('')

  return sendEmail({ to, subject, text, html })
}
