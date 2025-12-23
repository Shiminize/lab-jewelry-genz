import prisma from '@/lib/prisma'
import { logAdminActivity } from './activityLog'
import { Prisma } from '@prisma/client'

export interface AdminSettings {
  notifyEmail: string
  slackWebhook: string
  autoSendMediaKit: boolean
  mediaKitSlaHours: number
}

export interface AdminSettingsUpdate {
  notifyEmail?: string
  slackWebhook?: string
  autoSendMediaKit?: boolean
  mediaKitSlaHours?: number
}

const DEFAULT_SETTINGS: AdminSettings = {
  notifyEmail: process.env.CREATOR_PROGRAM_NOTIFY_EMAIL ?? '',
  slackWebhook: '',
  autoSendMediaKit: true,
  mediaKitSlaHours: 72,
}

export async function getAdminSettings(): Promise<AdminSettings> {
  try {
    const doc = await prisma.adminSettings.findUnique({
      where: { id: 'global' }
    })

    if (!doc) {
      return DEFAULT_SETTINGS
    }

    return {
      notifyEmail: doc.notifyEmail ?? DEFAULT_SETTINGS.notifyEmail,
      slackWebhook: doc.slackWebhook ?? DEFAULT_SETTINGS.slackWebhook,
      autoSendMediaKit: doc.autoSendMediaKit ?? DEFAULT_SETTINGS.autoSendMediaKit,
      mediaKitSlaHours: doc.mediaKitSlaHours ?? DEFAULT_SETTINGS.mediaKitSlaHours,
    }
  } catch (error) {
    console.warn('Falling back to default admin settings', error)
    return DEFAULT_SETTINGS
  }
}

export async function updateAdminSettings(updates: AdminSettingsUpdate) {
  const before = await prisma.adminSettings.findUnique({ where: { id: 'global' } })

  const data: Prisma.AdminSettingsUpdateInput = { updatedAt: new Date() }

  if (updates.notifyEmail !== undefined) {
    const trimmed = updates.notifyEmail.trim()
    data.notifyEmail = trimmed || null
  }

  if (updates.slackWebhook !== undefined) {
    const trimmed = updates.slackWebhook.trim()
    data.slackWebhook = trimmed || null
  }

  if (updates.autoSendMediaKit !== undefined) {
    data.autoSendMediaKit = updates.autoSendMediaKit
  }

  if (updates.mediaKitSlaHours !== undefined && Number.isFinite(updates.mediaKitSlaHours)) {
    const safeValue = Math.max(1, Math.round(updates.mediaKitSlaHours))
    data.mediaKitSlaHours = safeValue
  }

  await prisma.adminSettings.upsert({
    where: { id: 'global' },
    update: data,
    create: {
      id: 'global',
      notifyEmail: (data.notifyEmail as string) ?? DEFAULT_SETTINGS.notifyEmail,
      slackWebhook: (data.slackWebhook as string) ?? DEFAULT_SETTINGS.slackWebhook,
      autoSendMediaKit: (data.autoSendMediaKit as boolean) ?? DEFAULT_SETTINGS.autoSendMediaKit,
      mediaKitSlaHours: (data.mediaKitSlaHours as number) ?? DEFAULT_SETTINGS.mediaKitSlaHours
    }
  })

  await logAdminActivity({
    action: 'update_admin_settings',
    entityType: 'admin_settings',
    entityId: 'global',
    summary: 'Updated admin dashboard settings',
    before: before ? (before as unknown as Record<string, unknown>) : undefined,
    after: updates as Record<string, unknown>,
  })
}
