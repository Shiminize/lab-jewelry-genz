import prisma from '@/lib/prisma'
import { sendMediaKitEmail } from '@/lib/email'
import { logAdminActivity } from './activityLog'
import type {
  CreatorApplicationRecord,
  CreatorApplicationStatus,
  CreatorMediaKitStatus,
} from '@/types/creator'

export interface CreatorApplication extends CreatorApplicationRecord {
  id: string
}

export interface CreatorPipelineStats {
  total: number
  received: number
  reviewing: number
  approved: number
  declined: number
  mediaKitRequested: number
  mediaKitFailed: number
  overdue: number
}

function mapCreatorDoc(doc: any): CreatorApplication {
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    platform: doc.platform,
    audience: doc.audience,
    wantsMediaKit: doc.wantsMediaKit,
    status: doc.status as CreatorApplicationStatus,
    mediaKitStatus: doc.mediaKitStatus as CreatorMediaKitStatus,
    notes: doc.notes || '',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    mediaKitSentAt: doc.mediaKitSentAt || undefined,
    mediaKitMessageId: doc.mediaKitMessageId || undefined,
    mediaKitError: doc.mediaKitError || undefined,
    source: doc.source || undefined,
  }
}

export async function listCreatorApplications(): Promise<CreatorApplication[]> {
  const docs = await prisma.creatorApplication.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200
  })

  return docs.map(mapCreatorDoc)
}

export async function updateCreatorApplication(
  id: string,
  updates: Partial<
    Pick<
      CreatorApplicationRecord,
      'status' | 'notes' | 'mediaKitStatus' | 'mediaKitSentAt' | 'mediaKitError' | 'mediaKitMessageId'
    >
  >,
) {
  const data: any = { updatedAt: new Date() }
  if (updates.status) data.status = updates.status
  if (typeof updates.notes === 'string') data.notes = updates.notes
  if (updates.mediaKitStatus) data.mediaKitStatus = updates.mediaKitStatus
  if (updates.mediaKitSentAt) data.mediaKitSentAt = updates.mediaKitSentAt
  if (updates.mediaKitError !== undefined) data.mediaKitError = updates.mediaKitError
  if (updates.mediaKitMessageId !== undefined) data.mediaKitMessageId = updates.mediaKitMessageId

  await prisma.creatorApplication.update({
    where: { id },
    data
  })
}

export async function getCreatorPipelineStats({ slaHours }: { slaHours?: number } = {}): Promise<CreatorPipelineStats> {
  const statusCounts = await prisma.creatorApplication.groupBy({
    by: ['status'],
    _count: { status: true }
  })

  const mediaKitCounts = await prisma.creatorApplication.groupBy({
    by: ['mediaKitStatus'],
    _count: { mediaKitStatus: true }
  })

  // Convert to map for easy lookup
  const statusMap = new Map(statusCounts.map(i => [i.status, i._count.status]))
  const mediaKitMap = new Map(mediaKitCounts.map(i => [i.mediaKitStatus, i._count.mediaKitStatus]))

  const pickStatus = (status: CreatorApplicationStatus) => statusMap.get(status) ?? 0

  const total = Array.from(statusMap.values()).reduce((a, b) => a + b, 0)
  const mediaKitRequested = await prisma.creatorApplication.count({ where: { wantsMediaKit: true } })
  const mediaKitFailed = mediaKitMap.get('failed') ?? 0

  const hours = Math.max(1, slaHours ?? 72)
  const overdueCutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
  const overdue = await prisma.creatorApplication.count({
    where: {
      status: 'received',
      createdAt: { lt: overdueCutoff }
    }
  })

  return {
    total,
    received: pickStatus('received'),
    reviewing: pickStatus('reviewing'),
    approved: pickStatus('approved'),
    declined: pickStatus('declined'),
    mediaKitRequested,
    mediaKitFailed,
    overdue,
  }
}

export async function resendCreatorMediaKit(id: string) {
  const doc = await prisma.creatorApplication.findUnique({ where: { id } })

  if (!doc) {
    throw new Error('Creator application not found')
  }

  const email = doc.email || doc.contactEmail || ''
  if (!email) {
    throw new Error('Creator application missing email')
  }

  const name = doc.name || 'Creator'
  const sendResult = await sendMediaKitEmail({ to: email, name })
  const now = new Date()

  const updateData: any = {
    mediaKitStatus: sendResult.success ? 'sent' : 'failed',
    updatedAt: now,
    mediaKitError: null // clear error on success
  }

  if (sendResult.success) {
    updateData.mediaKitSentAt = now
    updateData.mediaKitMessageId = sendResult.messageId
  } else {
    updateData.mediaKitError =
      sendResult.reason === 'not_configured'
        ? 'Email service not configured'
        : sendResult.reason === 'send_failed'
          ? 'Email delivery failed'
          : 'Unknown delivery issue'
  }

  await prisma.creatorApplication.update({
    where: { id },
    data: updateData
  })

  await logAdminActivity({
    action: 'resend_creator_media_kit',
    entityType: 'creator_application',
    entityId: id,
    summary: `Resent media kit to ${name}`,
    after: {
      mediaKitStatus: updateData.mediaKitStatus,
      mediaKitSentAt: updateData.mediaKitSentAt,
      mediaKitMessageId: updateData.mediaKitMessageId,
      mediaKitError: updateData.mediaKitError,
    },
  })

  return {
    success: sendResult.success,
    reason: sendResult.success
      ? undefined
      : sendResult.reason === 'not_configured'
        ? 'Email service not configured'
        : sendResult.reason === 'send_failed'
          ? 'Email delivery failed'
          : 'Failed to send media kit',
  }
}

export async function getCreatorApplicationById(id: string): Promise<CreatorApplication | null> {
  const doc = await prisma.creatorApplication.findUnique({ where: { id } })
  if (!doc) return null
  return mapCreatorDoc(doc)
}
