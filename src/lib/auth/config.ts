import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Apple from 'next-auth/providers/apple'
import Facebook from 'next-auth/providers/facebook'
import type { NextAuthConfig } from 'next-auth'
import { findUserByEmail } from './userRepository'
import { verifyPassword } from './password'

const googleProvider =
  process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID
    ? Google({
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email ?? '',
          name: profile.name ?? profile.email ?? 'Glow user',
          role: 'customer',
        }
      },
    })
    : null

const appleProvider =
  process.env.AUTH_APPLE_ID || process.env.APPLE_CLIENT_ID
    ? Apple({
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email ?? '',
          name: profile.name ?? profile.email ?? 'Glow user',
          role: 'customer',
        }
      },
    })
    : null

const facebookProvider =
  process.env.AUTH_FACEBOOK_ID || process.env.FACEBOOK_CLIENT_ID
    ? Facebook({
      profile(profile) {
        return {
          id: profile.id,
          email: profile.email ?? '',
          name: profile.name ?? profile.email ?? 'Glow user',
          role: 'customer',
        }
      },
    })
    : null

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().toLowerCase().trim()
        const password = credentials?.password !== undefined ? String(credentials.password) : undefined
        if (!email || !password) {
          return null
        }
        const user = await findUserByEmail(email)
        if (!user) {
          return null
        }
        const valid = await verifyPassword(password, user.password)
        if (!valid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        }
      },
    }),
    ...(googleProvider ? [googleProvider] : []),
    ...(appleProvider ? [appleProvider] : []),
    ...(facebookProvider ? [facebookProvider] : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = (user as any).id ?? token.sub
        token.email = user.email ?? token.email
        token.role = (user as any).role ?? token.role ?? 'customer'
        token.name = user.name ?? token.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) ?? session.user.id
        session.user.email = (token.email as string) ?? session.user.email
        session.user.role = (token.role as string) ?? 'customer'
        session.user.name = (token.name as string) ?? session.user.name
      }
      return session
    },
  },
} satisfies NextAuthConfig
