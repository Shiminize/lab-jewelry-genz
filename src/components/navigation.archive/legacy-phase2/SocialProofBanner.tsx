'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Users, Heart, Sparkles } from 'lucide-react'
import { BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'
import { trustSignals } from '@/data/navigation-genz'

interface SocialProofBannerProps {
  variant?: 'header' | 'floating' | 'inline'
  className?: string
}

export function SocialProofBanner({ variant = 'header', className }: SocialProofBannerProps) {
  const [currentProof, setCurrentProof] = useState(0)
  const [liveStats, setLiveStats] = useState({
    activeUsers: 127,
    recentPurchases: 8,
    designsCreated: 34
  })

  const proofPoints = [
    {
      icon: Star,
      text: `${trustSignals.socialProof.averageRating}★ from ${trustSignals.socialProof.reviewCount} reviews`,
      action: "See reviews",
      href: "/reviews"
    },
    {
      icon: Users,
      text: `${trustSignals.socialProof.totalCustomers} happy customers worldwide`,
      action: "Join them",
      href: "/customizer"
    },
    {
      icon: Heart,
      text: `${trustSignals.socialProof.creatorNetwork} creators earning 30% commission`,
      action: "Start earning",
      href: "/creators/apply"
    },
    {
      icon: Sparkles,
      text: "Featured in Vogue, Elle & Sustainability Today",
      action: "Read press",
      href: "/press"
    }
  ]

  // Rotate proof points
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProof((prev) => (prev + 1) % proofPoints.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [proofPoints.length])

  // Simulate live activity
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 6) - 3,
        recentPurchases: prev.recentPurchases + Math.floor(Math.random() * 2),
        designsCreated: prev.designsCreated + Math.floor(Math.random() * 4)
      }))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const currentPoint = proofPoints[currentProof]
  const Icon = currentPoint.icon

  if (variant === 'header') {
    return (
      <div className={cn(
        "bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-100",
        className
      )}>
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center space-x-4">
            <Icon className="w-4 h-4 text-green-600" />
            <BodyText size="sm" className="text-foreground font-medium">
              {currentPoint.text}
            </BodyText>
            <Link
              href={currentPoint.href}
              className="text-sm text-green-600 hover:text-green-700 font-medium underline decoration-dotted underline-offset-2 transition-colors duration-200"
            >
              {currentPoint.action}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'floating') {
    return (
      <div className={cn(
        "fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-background border border-border rounded-lg shadow-lg p-4 z-30",
        className
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <BodyText size="sm" className="font-medium text-foreground">
              Live Activity
            </BodyText>
          </div>
          <button 
            className="text-muted hover:text-foreground transition-colors duration-200"
            onClick={() => {/* Handle close */}}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <BodyText className="font-bold text-cta">
              {liveStats.activeUsers}
            </BodyText>
            <BodyText size="xs" className="text-muted">
              Browsing now
            </BodyText>
          </div>
          
          <div className="text-center">
            <BodyText className="font-bold text-green-600">
              {liveStats.recentPurchases}
            </BodyText>
            <BodyText size="xs" className="text-muted">
              Orders today
            </BodyText>
          </div>
          
          <div className="text-center">
            <BodyText className="font-bold text-purple-600">
              {liveStats.designsCreated}
            </BodyText>
            <BodyText size="xs" className="text-muted">
              Designs made
            </BodyText>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-cta to-accent rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-background" />
          </div>
          <div className="flex-1">
            <BodyText size="sm" className="text-foreground">
              Emma just shared her custom ring
            </BodyText>
            <BodyText size="xs" className="text-muted">
              2 minutes ago • 12 likes already
            </BodyText>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={cn(
        "bg-background border border-border rounded-lg p-4",
        className
      )}>
        <div className="flex items-center justify-between mb-3">
          <BodyText className="font-medium text-foreground">
            Join the Community
          </BodyText>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <BodyText size="sm" className="text-foreground font-medium">
              {trustSignals.socialProof.averageRating}
            </BodyText>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex -space-x-1">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 bg-gradient-to-br from-cta to-accent rounded-full border-2 border-background"
                />
              ))}
            </div>
            <BodyText size="sm" className="text-foreground">
              {trustSignals.socialProof.totalCustomers} customers love us
            </BodyText>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-muted rounded-lg p-3">
              <BodyText className="font-bold text-cta">
                4.9★
              </BodyText>
              <BodyText size="xs" className="text-muted">
                Trust Score
              </BodyText>
            </div>
            
            <div className="bg-muted rounded-lg p-3">
              <BodyText className="font-bold text-green-600">
                500+
              </BodyText>
              <BodyText size="xs" className="text-muted">
                Creators
              </BodyText>
            </div>
          </div>

          <div className="space-y-2">
            {trustSignals.guarantees.slice(0, 2).map((guarantee, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <BodyText size="sm" className="text-foreground">
                  {guarantee}
                </BodyText>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}

// Component for creator spotlights in navigation
export function CreatorSpotlight({ className }: { className?: string }) {
  const creators = [
    {
      name: "@maya_jewels",
      followers: "47.2K",
      avatar: "🌟",
      latest: "Rose gold sustainability collection",
      earnings: "$2,847 this month"
    },
    {
      name: "@eco_elegance", 
      followers: "23.8K",
      avatar: "🌱",
      latest: "Ocean plastic removal rings",
      earnings: "$1,923 this month"
    },
    {
      name: "@gen_z_gems",
      followers: "89.1K", 
      avatar: "💎",
      latest: "TikTok viral mood rings",
      earnings: "$4,521 this month"
    }
  ]

  const [currentCreator, setCurrentCreator] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCreator((prev) => (prev + 1) % creators.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [creators.length])

  const creator = creators[currentCreator]

  return (
    <div className={cn(
      "bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <BodyText className="font-medium text-foreground">
          Creator Spotlight
        </BodyText>
        <div className="text-2xl">
          {creator.avatar}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <BodyText className="font-medium text-purple-700">
            {creator.name}
          </BodyText>
          <BodyText size="sm" className="text-muted">
            {creator.followers} followers
          </BodyText>
        </div>

        <BodyText size="sm" className="text-foreground">
          Latest: {creator.latest}
        </BodyText>

        <div className="flex items-center justify-between pt-2 border-t border-purple-200">
          <BodyText size="sm" className="text-green-600 font-medium">
            {creator.earnings}
          </BodyText>
          <Link
            href="/creators/apply"
            className="text-sm text-purple-600 hover:text-purple-700 font-medium underline decoration-dotted underline-offset-2 transition-colors duration-200"
          >
            Start earning →
          </Link>
        </div>
      </div>
    </div>
  )
}