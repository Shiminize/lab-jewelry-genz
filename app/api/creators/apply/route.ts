import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { sendEmail, sendMediaKitEmail } from '@/lib/email'
import { logAdminActivity } from '@/services/admin/activityLog'
import { getAdminSettings } from '@/services/admin/settings'
import type { CreatorMediaKitStatus } from '@/types/creator'

const applicationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Valid email is required'),
  platform: z.string().min(1, 'Primary platform is required').max(60),
  audience: z.string().min(1, 'Audience size is required').max(60),
  notes: z.string().max(2000).optional(),
  wantsMediaKit: z.boolean(),
})

function normalizeBoolean(value: FormDataEntryValue | null | undefined) {
  if (value == null) return false
  const normalized = String(value).toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on'
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const payload = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim().toLowerCase(),
      platform: String(formData.get('platform') ?? '').trim(),
      audience: String(formData.get('audience') ?? '').trim(),
      notes: (() => {
        const value = formData.get('notes')
        if (!value) return undefined
        return String(value).trim()
      })(),
      wantsMediaKit: normalizeBoolean(formData.get('mediaKit')),
    }

    const parsed = applicationSchema.parse(payload)
    const adminSettings = await getAdminSettings()

    const now = new Date()
    const source = {
      userAgent: request.headers.get('user-agent') ?? '',
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '',
      referer: request.headers.get('referer') ?? '',
    }

    let mediaKitStatus: CreatorMediaKitStatus = parsed.wantsMediaKit ? ('pending' as CreatorMediaKitStatus) : ('not_requested' as CreatorMediaKitStatus)
    let mediaKitSentAt: Date | undefined
    let mediaKitMessageId: string | undefined
    let mediaKitError: string | undefined

    if (parsed.wantsMediaKit && adminSettings.autoSendMediaKit) {
      const emailResult = await sendMediaKitEmail({ to: parsed.email, name: parsed.name })
      if (emailResult.success) {
        mediaKitStatus = 'sent'
        mediaKitSentAt = new Date()
        mediaKitMessageId = emailResult.messageId
      } else {
        mediaKitStatus = 'failed'
        mediaKitError = emailResult.reason === 'not_configured'
          ? 'Email service not configured'
          : emailResult.reason === 'send_failed'
            ? 'Email delivery failed'
            : 'Unknown delivery issue'
      }
    }

    const application = await prisma.creatorApplication.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        platform: parsed.platform,
        audience: parsed.audience,
        notes: parsed.notes,
        wantsMediaKit: parsed.wantsMediaKit,
        status: 'received',
        mediaKitStatus,
        mediaKitSentAt,
        mediaKitMessageId,
        mediaKitError,
        source: JSON.stringify(source),
      }
    })

    const notifyAddress = process.env.CREATOR_PROGRAM_NOTIFY_EMAIL
    if (notifyAddress) {
      const summary = [
        `New creator application submitted at ${now.toISOString()}`,
        '',
        `Name: ${parsed.name}`,
        `Email: ${parsed.email}`,
        `Platform: ${parsed.platform}`,
        `Audience: ${parsed.audience}`,
        `Media kit requested: ${parsed.wantsMediaKit ? 'Yes' : 'No'}`,
        parsed.notes ? `Notes: ${parsed.notes}` : null,
        '',
        `Source: ${JSON.stringify(source)}`,
      ]
        .filter(Boolean)
        .join('\n')

      void sendEmail({
        to: notifyAddress,
        subject: 'New GlowGlitch Creator Application',
        text: summary,
      }).catch((notifyError) => {
        console.warn('Failed to notify creator program inbox', notifyError)
      })
    }

    await logAdminActivity({
      action: 'create_creator_application',
      entityType: 'creator_application',
      entityId: application.id,
      summary: `New creator application: ${parsed.name}`,
      after: {
        name: parsed.name,
        email: parsed.email,
        platform: parsed.platform,
        audience: parsed.audience,
        wantsMediaKit: parsed.wantsMediaKit,
        status: 'received',
        mediaKitStatus,
        mediaKitSentAt,
        mediaKitMessageId,
        mediaKitError,
      },
    })

    await revalidatePath('/dashboard/creators')
    await revalidatePath('/dashboard')

    const redirectUrl = new URL('/creators?submitted=1', request.url)
    return NextResponse.redirect(redirectUrl, { status: 303 })
  } catch (error) {
    console.error('Creator application submission failed', error)
    const redirectUrl = new URL('/creators?error=1', request.url)
    return NextResponse.redirect(redirectUrl, { status: 303 })
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
