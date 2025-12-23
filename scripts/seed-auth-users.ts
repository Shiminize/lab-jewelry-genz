#!/usr/bin/env tsx

import path from 'node:path'
import { config as loadEnv } from 'dotenv'
import type { UserRole } from '../src/lib/auth/userRepository'

loadEnv({ path: path.resolve(process.cwd(), '.env.local') })
loadEnv()

type SeedTarget = {
  email: string
  password: string
  name?: string
  role?: UserRole
  marketingOptIn?: boolean
}

const ADMIN_DEFAULT: SeedTarget = {
  email: process.env.SEED_ADMIN_EMAIL || 'admin@glowglitch.com',
  password: process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123!',
  name: process.env.SEED_ADMIN_NAME || 'Glow Admin',
  role: 'admin',
  marketingOptIn: false,
}

const CUSTOMER_DEFAULT: SeedTarget = {
  email: process.env.SEED_CUSTOMER_EMAIL || 'customer@glowglitch.com',
  password: process.env.SEED_CUSTOMER_PASSWORD || 'CustomerPassword123!',
  name: process.env.SEED_CUSTOMER_NAME || 'Glow Customer',
  role: 'customer',
  marketingOptIn: true,
}

async function ensureUser(
  target: SeedTarget,
  deps: {
    findUserByEmail: typeof import('../src/lib/auth/userRepository')['findUserByEmail']
    createUser: typeof import('../src/lib/auth/userRepository')['createUser']
  }
) {
  const existing = await deps.findUserByEmail(target.email)
  // If exists, verify role? For now just skip
  if (existing) {
    console.log(`ℹ️  ${target.email} already exists (role: ${existing.role})`)
    return
  }

  await deps.createUser({
    email: target.email,
    password: target.password,
    name: target.name,
    role: target.role as UserRole,
    marketingOptIn: target.marketingOptIn,
  })
  console.log(`✅ Created ${target.role ?? 'customer'} account → ${target.email}`)
}

async function main() {
  // Dynamic import to ensure env vars is loaded first if needed, though TSX handles it
  const { createUser, findUserByEmail } = await import('../src/lib/auth/userRepository')

  const targets: SeedTarget[] = []
  if (process.env.SKIP_SEED_ADMIN !== '1') {
    targets.push(ADMIN_DEFAULT)
  }
  if (process.env.SKIP_SEED_CUSTOMER !== '1') {
    targets.push(CUSTOMER_DEFAULT)
  }

  if (targets.length === 0) {
    console.log('Nothing to seed (both admin/customer targets skipped).')
    return
  }

  for (const target of targets) {
    try {
      await ensureUser(target, { createUser, findUserByEmail })
    } catch (error) {
      console.error(`❌ Failed to seed ${target.email}`, error)
      process.exitCode = 1
    }
  }
}

main()
  .then(() => {
    process.exit(process.exitCode ?? 0)
  })
  .catch((error) => {
    console.error('Unexpected failure while seeding auth users', error)
    process.exit(1)
  })
