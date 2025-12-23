import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { Session } from 'next-auth'
import { auth } from '@/lib/auth/server'
import { findUserById, updateUserProfile } from '@/lib/auth/userRepository'

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  marketingOptIn: z.boolean().optional(),
})

function requireSession(session: Session | null) {
  if (!session?.user?.id) {
    const response = NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    return { response, userId: null }
  }
  return { response: null, userId: session.user.id }
}

export async function GET() {
  const session = await auth()
  const { response, userId } = requireSession(session)
  if (response || !userId) {
    return response ?? NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const user = await findUserById(userId)
  if (!user) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name ?? '',
      marketingOptIn: user.marketingOptIn ?? false,
      role: user.role,
    },
  })
}

export async function POST(request: Request) {
  const session = await auth()
  const { response, userId } = requireSession(session)
  if (response || !userId) {
    return response ?? NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_REQUEST', issues: parsed.error.flatten() }, { status: 400 })
  }

  const updated = await updateUserProfile(userId, parsed.data)
  if (!updated) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name ?? '',
      marketingOptIn: updated.marketingOptIn ?? false,
      role: updated.role,
    },
  })
}
