import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthError } from 'next-auth'
import { createUser } from '@/lib/auth/userRepository'
import { auth, signIn } from '@/lib/auth/server'

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(120).optional(),
  marketingOptIn: z.boolean().optional(),
})

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)
  const parsed = RegisterSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_REQUEST', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { email, password, name, marketingOptIn } = parsed.data

  try {
    await createUser({ email, password, name, marketingOptIn })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    const status = message.toLowerCase().includes('already')
      ? 409
      : 500

    return NextResponse.json(
      { error: 'REGISTRATION_FAILED', message },
      { status }
    )
  }

  try {
    await signIn('credentials', {
      redirect: false,
      email,
      password,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: 'SESSION_INIT_FAILED', message: error.message },
        { status: 500 }
      )
    }
    throw error
  }

  const session = await auth()
  return NextResponse.json(
    { ok: true, user: session?.user ?? null },
    { status: 201 }
  )
}
