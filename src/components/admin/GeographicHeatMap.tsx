'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'

interface CountryInsight {
  country: string
  isoCode: string
  revenue: number
  conversions: number
  visitors: number
}

interface CityInsight {
  city: string
  country: string
  conversionRate: number
  topCreator: string
}

const COUNTRY_DATA: CountryInsight[] = [
  { country: 'United States', isoCode: 'US', revenue: 18240, conversions: 410, visitors: 9200 },
  { country: 'Canada', isoCode: 'CA', revenue: 6240, conversions: 155, visitors: 2700 },
  { country: 'United Kingdom', isoCode: 'GB', revenue: 5810, conversions: 138, visitors: 2600 },
  { country: 'Australia', isoCode: 'AU', revenue: 4725, conversions: 112, visitors: 2200 },
  { country: 'Germany', isoCode: 'DE', revenue: 3980, conversions: 97, visitors: 2050 }
]

const CITY_DATA: CityInsight[] = [
  { city: 'Los Angeles', country: 'United States', conversionRate: 4.3, topCreator: 'SARAH2024' },
  { city: 'Toronto', country: 'Canada', conversionRate: 3.8, topCreator: 'LUMEN' },
  { city: 'London', country: 'United Kingdom', conversionRate: 3.6, topCreator: 'NOVA' },
  { city: 'Berlin', country: 'Germany', conversionRate: 3.1, topCreator: 'VANTA' }
]

export default function GeographicHeatMap() {
  const maxRevenue = useMemo(() => Math.max(...COUNTRY_DATA.map((item) => item.revenue)), [])

  const totals = useMemo(() => {
    return COUNTRY_DATA.reduce(
      (acc, country) => {
        acc.revenue += country.revenue
        acc.conversions += country.conversions
        acc.visitors += country.visitors
        return acc
      },
      { revenue: 0, conversions: 0, visitors: 0 }
    )
  }, [])

  return (
    <div className='space-y-6 text-void-50'>
      <Card className='border-void-700/40 bg-void-900/60'>
        <CardHeader>
          <CardTitle className='text-xl text-void-50'>Geographic Performance</CardTitle>
          <Typography variant='body' tone='muted'>Top regions by revenue and engagement</Typography>
        </CardHeader>
        <CardContent className='space-y-5'>
          <div className='grid gap-6 lg:grid-cols-3'>
            <div className='lg:col-span-2 space-y-4'>
              {COUNTRY_DATA.map((country) => {
                const progress = Math.round((country.revenue / maxRevenue) * 100)
                return (
                  <div key={country.isoCode} className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='font-medium text-void-50'>{country.country}</span>
                      <span className='text-void-300'>${country.revenue.toLocaleString()}</span>
                    </div>
                    <div className='h-2 rounded-full bg-void-800/70'>
                      <div
                        className='h-full rounded-full bg-gradient-cyber'
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className='flex gap-4 text-xs text-void-400'>
                      <span>{country.conversions} conversions</span>
                      <span>{country.visitors.toLocaleString()} visitors</span>
                      <span>{(country.conversions / Math.max(country.visitors, 1) * 100).toFixed(1)}% CVR</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className='rounded-ultra border border-void-700/40 bg-void-950/80 p-4'>
              <Typography variant='micro' tone='muted' className='uppercase tracking-[0.25em]'>Totals</Typography>
              <div className='mt-3 space-y-2 text-sm'>
                <StatLine label='Revenue' value={`$${totals.revenue.toLocaleString()}`} />
                <StatLine label='Conversions' value={totals.conversions.toLocaleString()} />
                <StatLine label='Visitors' value={totals.visitors.toLocaleString()} />
                <StatLine
                  label='Global CVR'
                  value={`${(totals.conversions / Math.max(totals.visitors, 1) * 100).toFixed(2)}%`}
                />
              </div>
            </div>
          </div>

          <div>
            <Typography variant='micro' tone='muted' className='uppercase tracking-[0.25em]'>Top cities</Typography>
            <div className='mt-3 grid gap-3 sm:grid-cols-2'>
              {CITY_DATA.map((city) => (
                <div key={`${city.city}-${city.country}`} className='rounded-ultra border border-void-800/60 bg-void-950/70 p-4'>
                  <div className='flex items-center justify-between text-sm font-medium text-void-50'>
                    <span>{city.city}, {city.country}</span>
                    <span>{city.conversionRate.toFixed(1)}%</span>
                  </div>
                  <Typography variant='micro' tone='muted' className='mt-2'>Top creator · {city.topCreator}</Typography>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface StatLineProps {
  label: string
  value: string
}

function StatLine({ label, value }: StatLineProps) {
  return (
    <div className='flex items-center justify-between text-void-300'>
      <span>{label}</span>
      <span className='font-medium text-void-50'>{value}</span>
    </div>
  )
}
