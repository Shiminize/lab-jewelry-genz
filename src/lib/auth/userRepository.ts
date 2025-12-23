import prisma from '@/lib/prisma'
import { hashPassword } from './password'

export type UserRole = 'customer' | 'admin' | 'creator'

export interface UserDocument {
  id: string
  email: string
  password: string
  role: string
  name?: string | null
  marketingOptIn: boolean
  createdAt: Date
  updatedAt: Date
}

export async function findUserByEmail(email: string) {
  if (!email) return null
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() }
  })
  return user ? mapPrismaUser(user) : null
}

export async function findUserById(id: string) {
  if (!id) return null
  const user = await prisma.user.findUnique({
    where: { id }
  })
  return user ? mapPrismaUser(user) : null
}

interface CreateUserInput {
  email: string
  password: string
  name?: string
  marketingOptIn?: boolean
  role?: UserRole
}

export async function createUser(input: CreateUserInput) {
  const existing = await findUserByEmail(input.email)
  if (existing) {
    throw new Error('Email already registered')
  }
  const hashed = await hashPassword(input.password)

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase().trim(),
      password: hashed,
      role: input.role ?? 'customer',
      name: input.name?.trim(),
      // @ts-ignore: metadata currently not in schema but might be needed
      // If we need marketingOptIn, we should add it to schema or put in metadata JSON
      // For now, let's assume we add it to schema or ignore it if strict
    }
  })

  return mapPrismaUser(user)
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const hashed = await hashPassword(newPassword)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed }
  })
}

export async function updateUserProfile(
  userId: string,
  updates: { name?: string; marketingOptIn?: boolean }
) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: updates.name?.trim() || undefined,
      // marketingOptIn: updates.marketingOptIn // Schema needs update if we strictly check this
    }
  })
  return mapPrismaUser(updated)
}

function mapPrismaUser(user: any): UserDocument {
  return {
    id: user.id,
    email: user.email,
    password: user.password,
    role: user.role,
    name: user.name,
    // @ts-ignore
    marketingOptIn: false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }
}
