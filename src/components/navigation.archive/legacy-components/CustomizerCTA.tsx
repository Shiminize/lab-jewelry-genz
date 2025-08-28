'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Zap, Heart, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

interface CustomizerCTAProps {
  variant?: 'primary' | 'secondary' | 'floating'
  category?: string
  className?: string
}

export function CustomizerCTA({ variant = 'primary', category, className }: CustomizerCTAProps) {
  const [currentMessage, setCurrentMessage] = useState(0)
  
  const messages = [
    { icon: Sparkles, text: "Design Your Story", subtext: "Create something uniquely you" },
    { icon: Zap, text: "See It in 3D", subtext: "Real-time visualization" },
    { icon: Heart, text: "100% Sustainable", subtext: "Lab-grown diamonds" },
    { icon: Users, text: "Join 50k+ Creators", subtext: "Share & earn 30%" }
  ]

  useEffect(() => {
    if (variant === 'floating') {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [variant, messages.length])

  const currentMsg = messages[currentMessage]
  const Icon = currentMsg.icon

  if (variant === 'primary') {
    return (
      <div className={cn("relative group", className)}>
        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-cta to-accent hover:from-cta-hover hover:to-accent/90 text-background font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Link href={category ? `/customizer?category=${category}` : '/customizer'}>
            <Sparkles className="w-5 h-5 mr-2" />
            Design Your Story
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </Link>
        </Button>
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <BodyText size="xs" className="text-muted whitespace-nowrap">
            ✨ Most popular with Gen Z
          </BodyText>
        </div>
      </div>
    )
  }

  if (variant === 'secondary') {
    return (
      <Link
        href={category ? `/customizer?category=${category}` : '/customizer'}
        className={cn(
          "flex items-center space-x-3 p-4 bg-gradient-to-r from-cta/10 to-accent/10 rounded-lg border border-cta/20 hover:from-cta/20 hover:to-accent/20 transition-all duration-200 group",
          className
        )}
      >
        <div className="w-12 h-12 bg-cta rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
          <Sparkles className="w-6 h-6 text-background" />
        </div>
        <div className="flex-1">
          <BodyText className="font-medium text-foreground">
            Design {category ? category : 'Your Jewelry'}
          </BodyText>
          <BodyText size="sm" className="text-muted">
            See your creation in 3D
          </BodyText>
        </div>
        <div className="text-cta group-hover:translate-x-1 transition-transform duration-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    )
  }

  if (variant === 'floating') {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 z-40 md:hidden",
        className
      )}>
        <Link
          href="/customizer"
          className="flex items-center space-x-3 bg-cta hover:bg-cta-hover text-background px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Icon className="w-5 h-5" />
          <div>
            <BodyText size="sm" className="font-medium">
              {currentMsg.text}
            </BodyText>
            <BodyText size="xs" className="opacity-90">
              {currentMsg.subtext}
            </BodyText>
          </div>
        </Link>
      </div>
    )
  }

  return null
}

// Component for showing customizer progress/continuation
interface CustomizerProgressProps {
  designId?: string
  category?: string
  progress?: number
  className?: string
}

export function CustomizerProgress({ designId, category, progress = 0, className }: CustomizerProgressProps) {
  if (!designId) return null

  return (
    <div className={cn(
      "bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-lg p-4",
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <BodyText className="font-medium text-foreground">
          Continue Your Design
        </BodyText>
        <BodyText size="sm" className="text-purple-600">
          {progress}% complete
        </BodyText>
      </div>
      
      <div className="w-full bg-purple-200 rounded-full h-2 mb-3">
        <div 
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex items-center justify-between">
        <BodyText size="sm" className="text-muted">
          {category} • Saved 5 minutes ago
        </BodyText>
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="bg-purple-500 hover:bg-purple-600 text-white"
        >
          <Link href={`/customizer?design=${designId}`}>
            Continue
          </Link>
        </Button>
      </div>
    </div>
  )
}

// Social proof component for customizer engagement
export function CustomizerSocialProof({ className }: { className?: string }) {
  const [stats, setStats] = useState({
    activeDesigners: 47,
    recentCreations: 23,
    sharedToday: 156
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        activeDesigners: prev.activeDesigners + Math.floor(Math.random() * 3) - 1,
        recentCreations: prev.recentCreations + Math.floor(Math.random() * 2),
        sharedToday: prev.sharedToday + Math.floor(Math.random() * 5)
      }))
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn(
      "bg-background border border-border rounded-lg p-4 space-y-3",
      className
    )}>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <BodyText size="sm" className="text-foreground font-medium">
          Live Design Activity
        </BodyText>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <BodyText className="font-bold text-cta">
            {stats.activeDesigners}
          </BodyText>
          <BodyText size="xs" className="text-muted">
            Designing now
          </BodyText>
        </div>
        
        <div>
          <BodyText className="font-bold text-accent">
            {stats.recentCreations}
          </BodyText>
          <BodyText size="xs" className="text-muted">
            Created today
          </BodyText>
        </div>
        
        <div>
          <BodyText className="font-bold text-purple-500">
            {stats.sharedToday}
          </BodyText>
          <BodyText size="xs" className="text-muted">
            Shared on social
          </BodyText>
        </div>
      </div>

      <Button
        asChild
        variant="ghost"
        size="sm"
        className="w-full text-cta hover:text-cta-hover hover:bg-cta/10"
      >
        <Link href="/customizer">
          <Sparkles className="w-4 h-4 mr-2" />
          Join the creativity
        </Link>
      </Button>
    </div>
  )
}