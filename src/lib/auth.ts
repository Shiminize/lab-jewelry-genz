/**
 * NextAuth.js Configuration for GlowGlitch
 * Implements JWT-based authentication with multiple providers
 * Follows CLAUDE_RULES.md security and GDPR requirements
 */

import { NextAuthOptions } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import AppleProvider from 'next-auth/providers/apple'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { MongoClient } from 'mongodb'

import { LoginSchema } from '@/types/auth'
import type { User, UserRole, AuthSession, JWTPayload } from '@/types/auth'
import { getUserByEmail, createUser, updateUserLastLogin } from '@/lib/user-service'

// Environment variables validation
const envSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  
  // OAuth provider credentials
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
  APPLE_ID: z.string().optional(),
  APPLE_SECRET: z.string().optional(),
  
  // Email service
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  
  // JWT settings
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRE: z.string().default('1h'),
  JWT_REFRESH_EXPIRE: z.string().default('7d')
})

const env = envSchema.parse(process.env)

// MongoDB client for NextAuth adapter
const client = new MongoClient(env.MONGODB_URI)

// Rate limiting store (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Rate limiting function
function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const key = identifier
  const record = rateLimitMap.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(client),
  providers: [
    // Email/Password provider
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        try {
          // Rate limiting: 5 attempts per minute per IP
          const ip = req?.headers?.['x-forwarded-for'] as string || 'unknown'
          if (!checkRateLimit(`auth:${ip}`, 5, 60 * 1000)) {
            throw new Error('RATE_LIMIT_EXCEEDED')
          }
          
          // Validate input
          const validatedCredentials = LoginSchema.parse(credentials)
          
          // Get user from database
          const user = await getUserByEmail(validatedCredentials.email)
          if (!user || !user.password) {
            throw new Error('INVALID_CREDENTIALS')
          }
          
          // Check account status
          if (user.status === 'suspended') {
            throw new Error('ACCOUNT_SUSPENDED')
          }
          
          if (user.status === 'pending-verification') {
            throw new Error('EMAIL_NOT_VERIFIED')
          }
          
          // Check if account is locked
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new Error('ACCOUNT_LOCKED')
          }
          
          // Verify password
          const isValidPassword = await bcrypt.compare(
            validatedCredentials.password,
            user.password
          )
          
          if (!isValidPassword) {
            // Increment login attempts
            await updateUserLastLogin(user._id, false)
            throw new Error('INVALID_CREDENTIALS')
          }
          
          // Update last login
          await updateUserLastLogin(user._id, true)
          
          // Return user object for JWT
          return {
            id: user._id,
            email: user.email,
            name: user.displayName || `${user.firstName} ${user.lastName}`,
            image: user.profileImage,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),

    // Google OAuth provider
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: 'consent',
            access_type: 'offline',
            response_type: 'code',
            scope: 'openid email profile'
          }
        }
      })
    ] : []),

    // Facebook OAuth provider
    ...(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET ? [
      FacebookProvider({
        clientId: env.FACEBOOK_CLIENT_ID,
        clientSecret: env.FACEBOOK_CLIENT_SECRET
      })
    ] : []),

    // Apple OAuth provider
    ...(env.APPLE_ID && env.APPLE_SECRET ? [
      AppleProvider({
        clientId: env.APPLE_ID,
        clientSecret: env.APPLE_SECRET
      })
    ] : [])
  ],

  // JWT configuration
  jwt: {
    secret: env.JWT_SECRET,
    maxAge: 60 * 60, // 1 hour
    async encode({ secret, token }) {
      const jwt = require('jsonwebtoken')
      return jwt.sign(token, secret, { algorithm: 'HS256' })
    },
    async decode({ secret, token }) {
      const jwt = require('jsonwebtoken')
      try {
        return jwt.verify(token, secret, { algorithms: ['HS256'] })
      } catch (error) {
        return null
      }
    }
  },

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60, // 1 hour
    updateAge: 60 * 15 // Update every 15 minutes
  },

  // Security configuration
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.glowglitch.com' : undefined
      }
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },

  // Callback functions
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        // For OAuth providers, create or update user
        if (account?.provider !== 'credentials') {
          const existingUser = await getUserByEmail(user.email!)
          
          if (existingUser) {
            // Update OAuth provider connection
            // Implementation would go here
            return true
          } else {
            // Create new user from OAuth
            const newUser = await createUser({
              email: user.email!,
              firstName: profile?.given_name || user.name?.split(' ')[0] || '',
              lastName: profile?.family_name || user.name?.split(' ').slice(1).join(' ') || '',
              emailVerified: true, // OAuth emails are considered verified
              providers: [{
                provider: account.provider as any,
                providerId: account.providerAccountId,
                connected: new Date()
              }],
              profileImage: user.image,
              role: 'customer',
              status: 'active'
            })
            return true
          }
        }
        
        return true
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    },

    async jwt({ token, user, account, profile, isNewUser }) {
      // Include user info in JWT token
      if (user) {
        token.sub = user.id
        token.email = user.email!
        token.role = (user as any).role || 'customer'
        token.status = (user as any).status || 'active'
        token.emailVerified = (user as any).emailVerified || false
        token.jti = `jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      
      return token
    },

    async session({ session, token }) {
      // Include additional data in session
      const authSession: AuthSession = {
        ...session,
        user: {
          id: token.sub!,
          email: token.email!,
          name: session.user?.name,
          image: session.user?.image,
          role: (token as any).role || 'customer',
          status: (token as any).status || 'active',
          emailVerified: (token as any).emailVerified || false
        },
        accessToken: token.jti as string,
        refreshToken: '', // Would implement refresh token logic
        expires: session.expires
      }
      
      return authSession
    },

    async redirect({ url, baseUrl }) {
      // Ensure redirects stay within the app
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      } else if (new URL(url).origin === baseUrl) {
        return url
      }
      return baseUrl
    }
  },

  // Pages configuration
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/welcome'
  },

  // Events
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`)
    },
    async signOut({ session, token }) {
      console.log(`User signed out: ${token?.email}`)
    },
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`)
    },
    async linkAccount({ user, account, profile }) {
      console.log(`Account linked: ${user.email} to ${account.provider}`)
    },
    async session({ session, token }) {
      // Session access logging could go here
    }
  },

  // Debug mode (only in development)
  debug: process.env.NODE_ENV === 'development',

  // Logger configuration
  logger: {
    error(code, metadata) {
      console.error(`NextAuth Error [${code}]:`, metadata)
    },
    warn(code) {
      console.warn(`NextAuth Warning [${code}]`)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`NextAuth Debug [${code}]:`, metadata)
      }
    }
  }
}

// Helper function to get session on server side
export async function getAuthSession() {
  const { getServerSession } = await import('next-auth/next')
  return getServerSession(authOptions) as Promise<AuthSession | null>
}

// Helper function to require authentication
export async function requireAuth(): Promise<AuthSession> {
  const session = await getAuthSession()
  if (!session) {
    throw new Error('UNAUTHORIZED')
  }
  return session
}

// Helper function to require specific role
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthSession> {
  const session = await requireAuth()
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('FORBIDDEN')
  }
  return session
}

export default authOptions