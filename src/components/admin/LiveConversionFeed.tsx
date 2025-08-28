'use client'

/**
 * Live Conversion Feed Component
 * Real-time feed of conversions and affiliate activity using WebSocket
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/Badge'
import { DollarSign, Users, TrendingUp, Clock, MapPin, Smartphone } from 'lucide-react'
import { io, Socket } from 'socket.io-client'

interface ConversionEvent {
  id: string
  creatorId: string
  creatorCode: string
  orderAmount: number
  commissionAmount: number
  commissionRate: number
  timestamp: string
  productName?: string
  linkId: string
}

interface ClickEvent {
  id: string
  creatorId: string
  linkId: string
  timestamp: string
  location?: {
    country: string
    state?: string
    city?: string
  }
  deviceType: string
  referrer?: string
}

interface KPIData {
  totalConversions: number
  totalRevenue: number
  averageOrderValue: number
  conversionRate: number
  activeCreators: number
  topCreator: {
    id: string
    name: string
    revenue: number
  }
}

export default function LiveConversionFeed() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [recentConversions, setRecentConversions] = useState<ConversionEvent[]>([])
  const [recentClicks, setRecentClicks] = useState<ClickEvent[]>([])
  const [kpis, setKpis] = useState<KPIData>({
    totalConversions: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    activeCreators: 0,
    topCreator: { id: '', name: '', revenue: 0 }
  })
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io({
      path: '/socket.io',
      addTrailingSlash: false,
    })

    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server')
      setIsConnected(true)
      socketInstance.emit('join-admin-analytics')
      socketInstance.emit('join-conversion-tracking')
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket server')
      setIsConnected(false)
    })

    // Listen for conversion events
    socketInstance.on('conversion', (data) => {
      const conversion = data.data as ConversionEvent
      setRecentConversions(prev => [conversion, ...prev.slice(0, 9)]) // Keep last 10
    })

    // Listen for click events
    socketInstance.on('click', (data) => {
      const click = data.data as ClickEvent
      setRecentClicks(prev => [click, ...prev.slice(0, 9)]) // Keep last 10
    })

    // Listen for KPI updates
    socketInstance.on('kpi-update', (data) => {
      setKpis(data.data as KPIData)
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getLocationString = (location?: { country: string; state?: string; city?: string }) => {
    if (!location) return 'Unknown'
    if (location.city && location.state) {
      return `${location.city}, ${location.state}, ${location.country}`
    }
    if (location.state) {
      return `${location.state}, ${location.country}`
    }
    return location.country
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Live Activity Feed</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-muted0' : 'bg-red-500'}`} />
          <span className="text-sm text-aurora-nav-muted">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Real-time KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-aurora-nav-muted">Total Revenue</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(kpis.totalRevenue)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-aurora-nav-muted">Conversions</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-foreground">
                {kpis.totalConversions.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-aurora-nav-muted">Active Creators</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-foreground">
                {kpis.activeCreators}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-aurora-nav-muted">Avg Order Value</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(kpis.averageOrderValue)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Recent Conversions</span>
              <Badge variant="secondary" className="ml-auto">
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentConversions.length === 0 ? (
                <div className="text-center text-aurora-nav-muted py-8">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-aurora-nav-muted" />
                  <p>Waiting for conversions...</p>
                </div>
              ) : (
                recentConversions.map((conversion) => (
                  <div
                    key={conversion.id}
                    className="flex items-start justify-between p-3 bg-muted border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          @{conversion.creatorCode}
                        </Badge>
                        <span className="text-sm text-aurora-nav-muted">
                          {formatTime(conversion.timestamp)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <div className="font-medium text-foreground">
                          {formatCurrency(conversion.orderAmount)} order
                        </div>
                        <div className="text-sm text-aurora-nav-muted">
                          Commission: {formatCurrency(conversion.commissionAmount)} ({conversion.commissionRate}%)
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Clicks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Recent Clicks</span>
              <Badge variant="secondary" className="ml-auto">
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentClicks.length === 0 ? (
                <div className="text-center text-aurora-nav-muted py-8">
                  <Users className="h-8 w-8 mx-auto mb-2 text-aurora-nav-muted" />
                  <p>Waiting for clicks...</p>
                </div>
              ) : (
                recentClicks.map((click) => (
                  <div
                    key={click.id}
                    className="flex items-start justify-between p-3 bg-muted border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-aurora-nav-muted">
                          {formatTime(click.timestamp)}
                        </span>
                      </div>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3 text-aurora-nav-muted" />
                          <span className="text-sm text-aurora-nav-muted">
                            {getLocationString(click.location)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-3 w-3 text-aurora-nav-muted" />
                          <span className="text-sm text-aurora-nav-muted">
                            {click.deviceType}
                          </span>
                        </div>
                        {click.referrer && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-aurora-nav-muted">
                              From: {new URL(click.referrer).hostname}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}