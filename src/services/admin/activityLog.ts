import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export interface AdminActivity {
  id: string
  action: string
  entityType: string
  entityId: string
  summary: string
  timestamp: Date
  actor?: string
  undoAvailable?: boolean
}

export async function logAdminActivity(entry: {
  action: string
  entityType: string
  entityId: string
  summary: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  actor?: string
}) {
  try {
    await prisma.adminActivity.create({
      data: {
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        summary: entry.summary,
        actor: entry.actor ?? 'admin',
        before: entry.before as Prisma.JsonObject,
        after: entry.after as Prisma.JsonObject,
        undoAvailable: Boolean(entry.before),
      }
    })
  } catch (error) {
    console.warn('Failed to log admin activity', error)
  }
}

export async function listAdminActivity(limit = 50): Promise<AdminActivity[]> {
  try {
    const docs = await prisma.adminActivity.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return docs.map((doc) => ({
      id: doc.id,
      action: doc.action,
      entityType: doc.entityType,
      entityId: doc.entityId,
      summary: doc.summary,
      timestamp: doc.createdAt,
      actor: doc.actor,
      undoAvailable: doc.undoAvailable,
    }))
  } catch (error) {
    console.warn('Failed to list admin activity', error)
    return []
  }
}

export async function getActivityForUndo(id: string) {
  return prisma.adminActivity.findUnique({
    where: { id }
  })
}

export async function markActivityUndone(id: string) {
  await prisma.adminActivity.update({
    where: { id },
    data: { undoAvailable: false, undoneAt: new Date() }
  })
}
