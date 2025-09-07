'use client'

/**
 * Geographic Analytics Heat Map
 * Shows conversion and click density by geographic location
 */

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/Badge'
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Marker, 
  ZoomableGroup 
} from 'react-simple-maps'
import { scaleLinear } from 'd3-scale'
import { MapPin, Globe, TrendingUp, Users, DollarSign, Filter } from 'lucide-react'

interface LocationData {
  country: string
  countryCode: string
  state?: string
  city?: string
  latitude: number
  longitude: number
  clicks: number
  conversions: number
  revenue: number
  topCreator: string
  conversionRate: number
}

interface CountryData {
  countryCode: string
  countryName: string
  clicks: number
  conversions: number
  revenue: number
  conversionRate: number
  heatValue: number
}

// Mock geographic data
const mockLocationData: LocationData[] = [
  {
    country: 'United States',
    countryCode: 'US',
    state: 'California',
    city: 'Los Angeles',
    latitude: 34.0522,
    longitude: -118.2437,
    clicks: 4500,
    conversions: 180,
    revenue: 14400,
    topCreator: 'SARAH2024',
    conversionRate: 4.0
  },
  {
    country: 'United States',
    countryCode: 'US',
    state: 'New York',
    city: 'New York',
    latitude: 40.7128,
    longitude: -74.0060,
    clicks: 3800,
    conversions: 152,
    revenue: 12160,
    topCreator: 'MIKE2024',
    conversionRate: 4.0
  },
  {
    country: 'United States',
    countryCode: 'US',
    state: 'Texas',
    city: 'Austin',
    latitude: 30.2672,
    longitude: -97.7431,
    clicks: 2200,
    conversions: 88,
    revenue: 7040,
    topCreator: 'SARAH2024',
    conversionRate: 4.0
  },
  {
    country: 'Canada',
    countryCode: 'CA',
    state: 'Ontario',
    city: 'Toronto',
    latitude: 43.6532,
    longitude: -79.3832,
    clicks: 1800,
    conversions: 90,
    revenue: 7200,
    topCreator: 'MIKE2024',
    conversionRate: 5.0
  },
  {
    country: 'United Kingdom',
    countryCode: 'GB',
    city: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    clicks: 2500,
    conversions: 125,
    revenue: 10000,
    topCreator: 'SARAH2024',
    conversionRate: 5.0
  },
  {
    country: 'Australia',
    countryCode: 'AU',
    city: 'Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    clicks: 1200,
    conversions: 72,
    revenue: 5760,
    topCreator: 'MIKE2024',
    conversionRate: 6.0
  },
  {
    country: 'Germany',
    countryCode: 'DE',
    city: 'Berlin',
    latitude: 52.5200,
    longitude: 13.4050,
    clicks: 1600,
    conversions: 64,
    revenue: 5120,
    topCreator: 'SARAH2024',
    conversionRate: 4.0
  },
  {
    country: 'France',
    countryCode: 'FR',
    city: 'Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    clicks: 1400,
    conversions: 84,
    revenue: 6720,
    topCreator: 'MIKE2024',
    conversionRate: 6.0
  }
]

// GeoJSON URL for world map
const geoUrl = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"

export default function GeographicHeatMap() {
  const [selectedMetric, setSelectedMetric] = useState<'clicks' | 'conversions' | 'revenue'>('conversions')
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [center, setCenter] = useState([0, 20])

  // Aggregate data by country
  const countryData = useMemo(() => {
    const countries = new Map<string, CountryData>()
    
    mockLocationData.forEach(location => {
      const key = location.countryCode
      if (countries.has(key)) {
        const existing = countries.get(key)!
        existing.clicks += location.clicks
        existing.conversions += location.conversions
        existing.revenue += location.revenue
        existing.conversionRate = (existing.conversions / existing.clicks) * 100
      } else {
        countries.set(key, {
          countryCode: location.countryCode,
          countryName: location.country,
          clicks: location.clicks,
          conversions: location.conversions,
          revenue: location.revenue,
          conversionRate: (location.conversions / location.clicks) * 100,
          heatValue: 0
        })
      }
    })

    // Calculate heat values based on selected metric
    const values = Array.from(countries.values())
    const maxValue = Math.max(...values.map(c => {
      switch (selectedMetric) {
        case 'clicks': return c.clicks
        case 'conversions': return c.conversions
        case 'revenue': return c.revenue
        default: return c.conversions
      }
    }))

    values.forEach(country => {
      const value = selectedMetric === 'clicks' ? country.clicks :
                   selectedMetric === 'conversions' ? country.conversions :
                   country.revenue
      country.heatValue = value / maxValue
    })

    return countries
  }, [selectedMetric])

  // Color scale for heat map
  const colorScale = scaleLinear<string>()
    .domain([0, 1])
    .range(['#F1F2F6', '#6B46C1']) // Aurora: Starlight Gray to Nebula Purple

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

  const handleCountryClick = (geo: any) => {
    const countryCode = geo.properties.ISO_A2
    const countryInfo = countryData.get(countryCode)
    
    if (countryInfo) {
      // Find a representative location for this country
      const location = mockLocationData.find(l => l.countryCode === countryCode)
      if (location) {
        setSelectedLocation(location)
      }
    }
  }

  const handleMarkerClick = (location: LocationData) => {
    setSelectedLocation(location)
    setCenter([location.longitude, location.latitude])
    setZoomLevel(4)
  }

  const topLocations = [...mockLocationData]
    .sort((a, b) => {
      switch (selectedMetric) {
        case 'clicks': return b.clicks - a.clicks
        case 'conversions': return b.conversions - a.conversions
        case 'revenue': return b.revenue - a.revenue
        default: return b.conversions - a.conversions
      }
    })
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Geographic Analytics</h2>
        <div className="flex items-center space-x-token-md">
          <div className="flex items-center space-x-token-sm">
            <Filter className="h-4 w-4 text-aurora-nav-muted" />
            <select 
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as 'clicks' | 'conversions' | 'revenue')}
              className="border border-border rounded-token-md px-3 py-1 text-sm"
            >
              <option value="clicks">Clicks</option>
              <option value="conversions">Conversions</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>
          <button
            onClick={() => {
              setZoomLevel(1)
              setCenter([0, 20])
              setSelectedLocation(null)
            }}
            className="px-3 py-1 text-sm border border-border rounded-token-md hover:bg-muted"
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-token-sm">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-aurora-nav-muted">Countries</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-foreground">
                {countryData.size}
              </div>
              <div className="text-sm text-aurora-nav-muted">Active markets</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-token-sm">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-aurora-nav-muted">Total Clicks</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-foreground">
                {formatNumber(mockLocationData.reduce((sum, loc) => sum + loc.clicks, 0))}
              </div>
              <div className="text-sm text-aurora-nav-muted">Across all regions</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-token-sm">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-aurora-nav-muted">Conversions</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-foreground">
                {formatNumber(mockLocationData.reduce((sum, loc) => sum + loc.conversions, 0))}
              </div>
              <div className="text-sm text-aurora-nav-muted">Global purchases</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-token-sm">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-aurora-nav-muted">Revenue</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(mockLocationData.reduce((sum, loc) => sum + loc.revenue, 0))}
              </div>
              <div className="text-sm text-aurora-nav-muted">Total generated</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-token-sm">
              <MapPin className="h-5 w-5" />
              <span>Global {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Heat Map</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 100,
                  center: center as [number, number]
                }}
                style={{ 
                  width: '100%', 
                  height: '400px',
                  backgroundColor: '#FEFCF9' // Aurora: Background
                }}
              >
                <ZoomableGroup zoom={zoomLevel} center={center as [number, number]}>
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map(geo => {
                        const countryCode = geo.properties.ISO_A2
                        const countryInfo = countryData.get(countryCode)
                        const fillColor = countryInfo 
                          ? colorScale(countryInfo.heatValue)
                          : '#F1F2F6' // Aurora: Starlight Gray
                        
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={fillColor}
                            stroke="#E2E8F0" // Aurora: Quantum borders
                            strokeWidth={0.5}
                            style={{
                              default: { outline: 'none' },
                              hover: { 
                                fill: countryInfo ? '#6B46C1' : '#F1F2F6', // Aurora: Nebula Purple or Starlight Gray
                                outline: 'none',
                                cursor: countryInfo ? 'pointer' : 'default'
                              },
                              pressed: { outline: 'none' }
                            }}
                            onClick={() => handleCountryClick(geo)}
                          />
                        )
                      })
                    }
                  </Geographies>
                  
                  {/* City markers */}
                  {mockLocationData.map((location) => (
                    <Marker
                      key={`${location.country}-${location.city}`}
                      coordinates={[location.longitude, location.latitude]}
                      onClick={() => handleMarkerClick(location)}
                    >
                      <circle
                        r={Math.max(2, Math.min(8, location.conversions / 10))}
                        fill="#FF6B9D" // Aurora: Iridescent Pink
                        stroke="#FFFFFF"
                        strokeWidth={1}
                        style={{ cursor: 'pointer' }}
                      />
                    </Marker>
                  ))}
                </ZoomableGroup>
              </ComposableMap>
              
              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-background p-3 rounded-token-lg border shadow-sm">
                <div className="text-xs font-medium text-foreground mb-2">
                  {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Intensity
                </div>
                <div className="flex items-center space-x-token-sm">
                  <div className="w-4 h-4 bg-muted rounded"></div>
                  <span className="text-xs text-aurora-nav-muted">Low</span>
                  <div className="w-8 h-4 bg-gradient-to-r from-gray-200 to-red-600 rounded"></div>
                  <span className="text-xs text-aurora-nav-muted">High</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Details & Top Performers */}
        <div className="space-y-6">
          {/* Selected Location Details */}
          {selectedLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-foreground">
                      {selectedLocation.city}, {selectedLocation.state || selectedLocation.country}
                    </div>
                    <div className="text-sm text-aurora-nav-muted">
                      Top Creator: @{selectedLocation.topCreator}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-aurora-nav-muted">Clicks</div>
                      <div className="font-medium">{formatNumber(selectedLocation.clicks)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-aurora-nav-muted">Conversions</div>
                      <div className="font-medium">{formatNumber(selectedLocation.conversions)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-aurora-nav-muted">Revenue</div>
                      <div className="font-medium">{formatCurrency(selectedLocation.revenue)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-aurora-nav-muted">Conv. Rate</div>
                      <div className="font-medium">{selectedLocation.conversionRate.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Performing Locations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Top Locations by {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topLocations.map((location, index) => {
                  const metricValue = selectedMetric === 'clicks' ? location.clicks :
                                    selectedMetric === 'conversions' ? location.conversions :
                                    location.revenue
                  
                  return (
                    <div 
                      key={`${location.country}-${location.city}`}
                      className="flex items-center justify-between p-3 bg-muted rounded-token-lg hover:bg-muted cursor-pointer"
                      onClick={() => handleMarkerClick(location)}
                    >
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium text-sm">
                            {location.city}, {location.state || location.country}
                          </div>
                          <div className="text-xs text-aurora-nav-muted">
                            @{location.topCreator}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          {selectedMetric === 'revenue' 
                            ? formatCurrency(metricValue) 
                            : formatNumber(metricValue)
                          }
                        </div>
                        <div className="text-xs text-aurora-nav-muted">
                          {location.conversionRate.toFixed(1)}% conv.
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}