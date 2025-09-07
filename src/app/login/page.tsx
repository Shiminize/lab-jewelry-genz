'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { H1, MutedText } from '@/components/foundation/Typography'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const redirectTo = searchParams.get('from') || '/dashboard'
  const message = searchParams.get('message')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Redirect to the original page or dashboard
      router.push(redirectTo)
      router.refresh() // Refresh to update middleware state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-token-sm">
          <H1 className="">
            Sign in to GlowGlitch
          </H1>
          <MutedText size="md">
            Enter your credentials to access your account
          </MutedText>
        </div>

        {message && (
          <Alert variant="warning">
            {message}
          </Alert>
        )}

        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        <form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          noValidate
          aria-label="Sign in form"
        >
          <div>
            <Input
              id="email"
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              disabled={isLoading}
              autoComplete="email"
              aria-describedby="email-hint"
              hint="We'll never share your email with anyone else"
            />
          </div>

          <div>
            <Input
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={isLoading}
              autoComplete="current-password"
              aria-describedby={error ? 'password-error' : undefined}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email || !password}
            isLoading={isLoading}
            variant="primary"
            size="lg"
            className="w-full"
            aria-describedby={isLoading ? 'loading-status' : undefined}
          >
            Sign In
          </Button>
          
          {isLoading && (
            <div 
              id="loading-status" 
              className="sr-only" 
              aria-live="polite" 
              aria-atomic="true"
            >
              Signing in, please wait...
            </div>
          )}
        </form>

        <div className="text-center">
          <MutedText size="sm">
            Don't have an account?{' '}
            <a 
              href="/register" 
              className="text-cta hover:text-cta-hover transition-colors underline focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-sm"
              aria-label="Navigate to sign up page"
            >
              Sign up
            </a>
          </MutedText>
        </div>
      </div>
    </div>
  )
}