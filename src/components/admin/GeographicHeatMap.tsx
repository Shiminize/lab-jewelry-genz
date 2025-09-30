'use client'

import { useMemo } from 'react'

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
      <section className='rounded-ultra border border-void-700/40 bg-void-900/60'>
        <div className='border-b border-void-800/60 px-6 py-4'>
          <h2 className='text-xl font-semibold text-void-50'>Geographic Performance</h2>
          <p className='mt-1 text-sm text-void-300'>Top regions by revenue and engagement</p>
        </div>
        <div className='space-y-6 px-6 py-5'>
          <div className='grid gap-6 lg:grid-cols-3'>
            <div className='space-y-4 lg:col-span-2'>
              {COUNTRY_DATA.map((country) => {
                const progress = Math.round((country.revenue / maxRevenue) * 100)
                return (
                  <div key={country.isoCode} className='space-y-2 rounded-token-lg border border-void-800/60 bg-void-950/70 p-4'>
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

            <div className='rounded-token-lg border border-void-800/60 bg-void-950/80 p-4'>
              <span className='text-xs uppercase tracking-[0.25em] text-void-400'>Totals</span>
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
            <span className='text-xs uppercase tracking-[0.25em] text-void-400'>Top cities</span>
            <div className='mt-3 grid gap-3 sm:grid-cols-2'>
              {CITY_DATA.map((city) => (
                <div key={`${city.city}-${city.country}`} className='rounded-token-lg border border-void-800/60 bg-void-950/70 p-4'>
                  <div className='flex items-center justify-between text-sm font-medium text-void-50'>
                    <span>{city.city}, {city.country}</span>
                    <span>{city.conversionRate.toFixed(1)}%</span>
                  </div>
                  <p className='mt-2 text-xs text-void-400'>Top creator · {city.topCreator}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
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
