'use client'

/**
 * Creator Dashboard Component
 * Main dashboard for content creators to manage their referral links and track performance
 */

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import CreatorStats from './CreatorStats'
import ReferralLinks from './ReferralLinks'
import CreatorProfile from './CreatorProfile'
import CommissionHistory from './CommissionHistory'
import LinkGenerator from './LinkGenerator'
import PayoutRequest from './PayoutRequest'
import PayoutHistory from './PayoutHistory'

interface Creator {
  id: string
  creatorCode: string
  displayName: string
  email: string
  profileImage?: string
  bio?: string
  socialLinks: Record<string, string>
  commissionRate: number
  minimumPayout: number
  status: 'pending' | 'approved' | 'suspended' | 'inactive'
  metrics: {
    totalClicks: number
    totalSales: number
    totalCommission: number
    conversionRate: number
    lastSaleDate?: string
  }
  settings: {
    emailNotifications: boolean
    publicProfile: boolean
    allowDirectMessages: boolean
  }
  createdAt: string
  approvedAt?: string
}

export default function CreatorDashboard() {
  const [creator, setCreator] = useState<Creator | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch creator profile
  useEffect(() => {
    fetchCreatorProfile()
  }, [])

  const fetchCreatorProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/creators')
      const result = await response.json()

      if (result.success) {
        setCreator(result.data.creator)
      } else {
        setError(result.error?.message || 'Failed to load creator profile')
      }
    } catch (error) {
      console.error('Error fetching creator profile:', error)
      setError('Failed to load creator profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading creator dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">Error Loading Dashboard</div>
            <p className="text-aurora-nav-muted mb-6">{error}</p>
            <Button onClick={fetchCreatorProfile}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-aurora-nav-muted text-lg mb-4">Creator Profile Not Found</div>
            <p className="text-aurora-nav-muted mb-6">You need to apply to become a creator first.</p>
            <Button onClick={() => window.location.href = '/creators/apply'}>
              Apply to Become a Creator
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Creator Dashboard</h1>
          <p className="text-aurora-nav-muted">Welcome back, {creator.displayName}!</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge 
            variant={
              creator.status === 'approved' ? 'default' :
              creator.status === 'pending' ? 'secondary' :
              creator.status === 'suspended' ? 'destructive' : 'outline'
            }
            className="capitalize"
          >
            {creator.status}
          </Badge>
          <div className="text-right">
            <div className="text-sm text-aurora-nav-muted">Creator Code</div>
            <div className="font-mono font-bold text-amber-600">{creator.creatorCode}</div>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {creator.status === 'pending' && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
              <div>
                <div className="font-medium text-foreground">Application Under Review</div>
                <div className="text-sm text-aurora-nav-muted">
                  Your creator application is being reviewed. You'll receive an email once it's approved.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {creator.status === 'suspended' && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <div>
                <div className="font-medium text-foreground">Account Suspended</div>
                <div className="text-sm text-aurora-nav-muted">
                  Your creator account has been suspended. Please contact support for more information.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CreatorStats creator={creator} />
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <ReferralLinks />
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <LinkGenerator creatorCode={creator.creatorCode} />
        </TabsContent>

        <TabsContent value="commissions" className="space-y-6">
          <CommissionHistory />
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <PayoutRequest />
          <PayoutHistory />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <CreatorProfile creator={creator} onUpdate={fetchCreatorProfile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}