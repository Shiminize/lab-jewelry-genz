import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const checks: Record<string, unknown> = {
      uptimeSec: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_BUILD_ID || 'dev',
    }

    try {
      // Optional DB check if localDb mode is enabled
      const conciergeMode = process.env.CONCIERGE_DATA_MODE
      if (conciergeMode === 'localDb') {
        const prisma = (await import('@/lib/prisma')).default
        // Simple check: count events or just check connection
        await prisma.$queryRaw`SELECT 1`
        checks.db = 'ok'
      }
    } catch (error) {
      console.error('Health DB check failed:', error)
      checks.db = 'error'
      checks.dbError = String(error)
    }

    return NextResponse.json({ ok: true, checks })
  } catch (error) {
    console.error('Health check critical failure:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}


