import type { DefaultUser, DefaultSession } from 'next-auth'
import type { JWT as DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface User extends DefaultUser {
    role?: string
    id?: string
  }

  interface Session extends DefaultSession {
    user: {
      id?: string
      email?: string | null
      name?: string | null
      role?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role?: string
    name?: string | null
    email?: string | null
  }
}
