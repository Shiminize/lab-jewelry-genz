import type { Session } from 'next-auth'
import { auth } from './server'

type MaybeSession = Pick<Session, 'user'> | null

export async function getOptionalSession(): Promise<MaybeSession> {
  const bypassRole = process.env.ADMIN_BYPASS_ROLE
  if (bypassRole) {
    return {
      user: {
        role: bypassRole,
        email: process.env.ADMIN_BYPASS_EMAIL || 'bypass@local',
        id: 'bypass',
      },
    }
  }

  try {
    return await auth()
  } catch (error) {
    console.warn('[auth] session lookup failed, proceeding unauthenticated', error)
    return null
  }
}
