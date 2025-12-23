import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthError } from 'next-auth'
import { auth, signIn } from '@/lib/auth/server'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)
  const parsed = LoginSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_REQUEST', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { email, password } = parsed.data

  try {
    await signIn('credentials', {
      redirect: false,
      email,
      password,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      const status = error.type === 'CredentialsSignin' ? 401 : 500
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS', message: error.message },
        { status }
      )
    }
    throw error
  }

  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'SESSION_NOT_FOUND' }, { status: 401 })
  }

  return NextResponse.json({ ok: true, user: session.user })
}
