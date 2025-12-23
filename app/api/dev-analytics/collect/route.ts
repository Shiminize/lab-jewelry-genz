import { type NextRequest, NextResponse } from 'next/server'
import { hashPII } from '@/lib/security'
import { mkdir, appendFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

type StoredEvent = {
  id: string
  event: string
  sessionId?: string
  requestId?: string
  timestamp: number
  detail: Record<string, unknown>
}

const events: StoredEvent[] = []
const MAX_EVENTS = 200
const LOG_PATH = join(process.cwd(), '.analytics', 'dev.log')
const isProd = process.env.NODE_ENV === 'production'
const mirrorEnabled = process.env.NEXT_PUBLIC_ANALYTICS_DEV_MIRROR_ENABLED !== 'false'

async function persistEvent(entry: StoredEvent) {
  if (!mirrorEnabled) {
    return
  }

  try {
    await mkdir(dirname(LOG_PATH), { recursive: true })
    await appendFile(LOG_PATH, `${JSON.stringify(entry)}\n`)
  } catch {
    // non-blocking
  }

  // Also store in Postgres if in localDb mode
  try {
    const conciergeMode = process.env.CONCIERGE_DATA_MODE;
    if (conciergeMode === 'localDb') {
      const prisma = (await import('@/lib/prisma')).default;

      // Store id, sessionId, requestId, detail in metadata
      const metadata = {
        sessionId: entry.sessionId,
        requestId: entry.requestId,
        detail: entry.detail,
        id: entry.id // Storing original event ID in metadata if needed matching schema
      };

      await prisma.widgetAnalyticsEvent.create({
        data: {
          event: entry.event,
          metadata: metadata as any, // Json type
          createdAt: new Date(entry.timestamp),
        }
      });
    }
  } catch (err) {
    // non-blocking
    console.warn('Analytics persist error', err);
  }
}

export async function POST(req: NextRequest) {
  if (isProd && !mirrorEnabled) {
    return NextResponse.json({ error: 'DEV_ANALYTICS_DISABLED' }, { status: 404 })
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body || typeof body.event !== 'string') {
    return NextResponse.json({ error: 'INVALID_EVENT' }, { status: 400 })
  }

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : undefined
  const requestId = typeof body.requestId === 'string' ? body.requestId : undefined
  const entry: StoredEvent = {
    id: typeof body.id === 'string' ? body.id : crypto.randomUUID?.() ?? `evt-${Date.now()}`,
    event: body.event,
    sessionId,
    requestId,
    timestamp: typeof body.timestamp === 'number' ? body.timestamp : Date.now(),
    detail: sanitizeDetail(body),
  }

  events.push(entry)
  if (events.length > MAX_EVENTS) {
    events.shift()
  }

  await persistEvent(entry)

  return NextResponse.json({ ok: true })
}

export async function GET() {
  if (isProd && !mirrorEnabled) {
    return NextResponse.json({ error: 'DEV_ANALYTICS_DISABLED' }, { status: 404 })
  }
  return NextResponse.json({ events })
}

function sanitizeDetail(detail: Record<string, unknown>): Record<string, unknown> {
  const clone: Record<string, unknown> = { ...detail }
  // Basic PII scrubbing
  if (typeof clone.email === 'string') {
    clone.email = hashPII(clone.email)
  }
  if (typeof clone.phone === 'string') {
    clone.phone = hashPII(clone.phone)
  }
  if (typeof clone.customerEmail === 'string') {
    clone.customerEmail = hashPII(clone.customerEmail)
  }
  if (typeof clone.customerPhone === 'string') {
    clone.customerPhone = hashPII(clone.customerPhone)
  }
  return clone
}
