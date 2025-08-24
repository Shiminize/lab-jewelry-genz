'use client'

/**
 * Conversion Funnel Visualization
 * Shows the customer journey from click to purchase with drop-off rates
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/Badge'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts'
import { TrendingDown, Users, ShoppingCart, CreditCard, Check } from 'lucide-react'

interface FunnelStage {
  name: string
  value: number
  percentage: number
  dropOff: number
  icon: React.ReactNode
  color: string
}

interface CreatorFunnelData {
  creatorId: string
  creatorCode: string
  stages: FunnelStage[]
  conversionRate: number
  totalRevenue: number
}

const mockFunnelData: FunnelStage[] = [
  {
    name: 'Link Clicks',
    value: 10000,
    percentage: 100,
    dropOff: 0,
    icon: <Users className="h-4 w-4" />,
    color: '#3B82F6'
  },
  {
    name: 'Product Views',
    value: 7500,
    percentage: 75,
    dropOff: 25,
    icon: <Users className="h-4 w-4" />,
    color: '#6366F1'
  },
  {
    name: 'Add to Cart',
    value: 3750,
    percentage: 37.5,
    dropOff: 50,
    icon: <ShoppingCart className="h-4 w-4" />,
    color: '#8B5CF6'
  },
  {
    name: 'Checkout Started',
    value: 1875,
    percentage: 18.75,
    dropOff: 50,
    icon: <CreditCard className="h-4 w-4" />,
    color: '#A855F7'
  },
  {
    name: 'Purchase Complete',
    value: 1312,
    percentage: 13.12,
    dropOff: 30,
    icon: <Check className="h-4 w-4" />,
    color: '#10B981'
  }
]

const topCreatorFunnels: CreatorFunnelData[] = [
  {
    creatorId: '1',
    creatorCode: 'SARAH2024',
    stages: [
      { name: 'Clicks', value: 2500, percentage: 100, dropOff: 0, icon: <Users className="h-3 w-3" />, color: '#3B82F6' },
      { name: 'Views', value: 2000, percentage: 80, dropOff: 20, icon: <Users className="h-3 w-3" />, color: '#6366F1' },
      { name: 'Cart', value: 1200, percentage: 48, dropOff: 40, icon: <ShoppingCart className="h-3 w-3" />, color: '#8B5CF6' },
      { name: 'Checkout', value: 900, percentage: 36, dropOff: 25, icon: <CreditCard className="h-3 w-3" />, color: '#A855F7' },
      { name: 'Purchase', value: 720, percentage: 28.8, dropOff: 20, icon: <Check className="h-3 w-3" />, color: '#10B981' }
    ],
    conversionRate: 28.8,
    totalRevenue: 45600
  },
  {
    creatorId: '2',
    creatorCode: 'MIKE2024',
    stages: [
      { name: 'Clicks', value: 1800, percentage: 100, dropOff: 0, icon: <Users className="h-3 w-3" />, color: '#3B82F6' },
      { name: 'Views', value: 1260, percentage: 70, dropOff: 30, icon: <Users className="h-3 w-3" />, color: '#6366F1' },
      { name: 'Cart', value: 630, percentage: 35, dropOff: 50, icon: <ShoppingCart className="h-3 w-3" />, color: '#8B5CF6' },
      { name: 'Checkout', value: 378, percentage: 21, dropOff: 40, icon: <CreditCard className="h-3 w-3" />, color: '#A855F7' },
      { name: 'Purchase', value: 302, percentage: 16.8, dropOff: 20, icon: <Check className="h-3 w-3" />, color: '#10B981' }
    ],
    conversionRate: 16.8,
    totalRevenue: 23760
  }
]

export default function ConversionFunnelChart() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [funnelData, setFunnelData] = useState<FunnelStage[]>(mockFunnelData)
  const [selectedCreator, setSelectedCreator] = useState<string>('all')

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toLocaleString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Users: <span className="font-medium">{formatNumber(data.value)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Conversion: <span className="font-medium">{data.percentage.toFixed(1)}%</span>
          </p>
          {data.dropOff > 0 && (
            <p className="text-sm text-red-600">
              Drop-off: <span className="font-medium">{data.dropOff}%</span>
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const FunnelStageCard = ({ stage, isLast }: { stage: FunnelStage; isLast: boolean }) => (
    <div className="relative">
      <div 
        className="p-4 rounded-lg border-2 text-white font-medium text-center transition-all hover:scale-105"
        style={{ backgroundColor: stage.color, minHeight: '120px' }}
      >
        <div className="flex items-center justify-center mb-2">
          {stage.icon}
        </div>
        <div className="text-lg font-bold mb-1">{formatNumber(stage.value)}</div>
        <div className="text-sm opacity-90">{stage.name}</div>
        <div className="text-xs mt-1 opacity-80">{stage.percentage.toFixed(1)}%</div>
      </div>
      
      {!isLast && stage.dropOff > 0 && (
        <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 z-10">
          <div className="bg-red-100 border border-red-300 rounded-full p-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-xs text-red-600 font-medium mt-1 text-center">
            -{stage.dropOff}%
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Conversion Funnel Analysis</h2>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedCreator}
            onChange={(e) => setSelectedCreator(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Creators</option>
            <option value="SARAH2024">@SARAH2024</option>
            <option value="MIKE2024">@MIKE2024</option>
          </select>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Overall Conversion Rate */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">13.12%</div>
              <div className="text-sm text-gray-600">Overall Conversion Rate</div>
              <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
                +2.3% vs last period
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(funnelData[0]?.value || 0)}</div>
              <div className="text-sm text-gray-600">Total Clicks</div>
              <div className="text-xs text-gray-500 mt-1">Starting traffic</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(funnelData[funnelData.length - 1]?.value || 0)}</div>
              <div className="text-sm text-gray-600">Conversions</div>
              <div className="text-xs text-gray-500 mt-1">Completed purchases</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(82500)}</div>
              <div className="text-sm text-gray-600">Revenue Generated</div>
              <div className="text-xs text-gray-500 mt-1">From conversions</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Funnel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Customer Journey Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Desktop Funnel Visualization */}
              <div className="hidden md:block">
                <div className="grid grid-cols-5 gap-8 items-center">
                  {funnelData.map((stage, index) => (
                    <FunnelStageCard 
                      key={stage.name} 
                      stage={stage} 
                      isLast={index === funnelData.length - 1}
                    />
                  ))}
                </div>
              </div>
              
              {/* Mobile Funnel Visualization */}
              <div className="md:hidden space-y-4">
                {funnelData.map((stage, index) => (
                  <div key={stage.name} className="relative">
                    <FunnelStageCard 
                      stage={stage} 
                      isLast={index === funnelData.length - 1}
                    />
                    {index < funnelData.length - 1 && (
                      <div className="flex justify-center mt-2 mb-2">
                        <TrendingDown className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Drop-off Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Drop-off Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.slice(1).map((stage, index) => {
                const prevStage = funnelData[index]
                const dropOffUsers = prevStage.value - stage.value
                
                return (
                  <div key={stage.name} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {prevStage.name} → {stage.name}
                      </span>
                      <Badge variant="outline" className="text-red-700 border-red-300">
                        -{stage.dropOff}%
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      Lost {formatNumber(dropOffUsers)} users
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-red-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${stage.dropOff}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Creator Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Creator Funnel Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {topCreatorFunnels.map((creator) => (
              <div key={creator.creatorId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">@{creator.creatorCode}</Badge>
                    <span className="text-sm text-gray-600">
                      {creator.conversionRate.toFixed(1)}% conversion rate
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(creator.totalRevenue)} revenue
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {creator.stages.map((stage, index) => (
                    <div key={stage.name} className="text-center">
                      <div 
                        className="p-2 rounded text-white text-xs font-medium"
                        style={{ backgroundColor: stage.color }}
                      >
                        <div className="flex justify-center mb-1">
                          {stage.icon}
                        </div>
                        <div>{formatNumber(stage.value)}</div>
                        <div className="opacity-80">{stage.percentage.toFixed(1)}%</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{stage.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}