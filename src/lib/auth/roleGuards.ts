import type { Session } from 'next-auth'

type MaybeSession = Pick<Session, 'user'> | null | undefined

function forbiddenError(message = 'Forbidden') {
  const error: any = new Error(message)
  error.status = 403
  return error
}

export function assertAdminOrMerch(session: MaybeSession) {
  const role = session?.user?.role
  if (role === 'admin' || role === 'merchandiser') {
    return
  }
  throw forbiddenError()
}

export function assertAdmin(session: MaybeSession) {
  if (session?.user?.role === 'admin') {
    return
  }
  throw forbiddenError()
}

export async function requireAdminSession() {
  const { auth } = await import('./server')
  const session = await auth()
  if (!session?.user) {
    return null
  }
  if (session.user.role !== 'admin') {
    return null
  }
  return session
}
