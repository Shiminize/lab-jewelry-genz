'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HeatMapDataPoint {
  x: number
  y: number
  intensity: number
  category: string
  label: string
}

interface AuroraHeatMapProps {
  isVisible: boolean
  morphIntensity: number
}

// Mock heat map data simulating user behavior patterns
const generateHeatMapData = (): HeatMapDataPoint[] => {
  const categories = ['diamonds', 'rings', 'necklaces', 'customization']
  const data: HeatMapDataPoint[] = []
  
  // Generate hotspots based on user interaction patterns
  for (let i = 0; i < 24; i++) {
    data.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      intensity: Math.random() * 0.8 + 0.2,
      category: categories[Math.floor(Math.random() * categories.length)],
      label: `${Math.floor(Math.random() * 47 + 3)} users here`
    })
  }
  
  return data
}

export function AuroraHeatMap({ isVisible, morphIntensity }: AuroraHeatMapProps) {
  const [heatMapData, setHeatMapData] = useState<HeatMapDataPoint[]>([])
  const [activePoint, setActivePoint] = useState<string | null>(null)
  
  useEffect(() => {
    if (isVisible) {
      setHeatMapData(generateHeatMapData())
      
      // Refresh heat map data every 8 seconds
      const interval = setInterval(() => {
        setHeatMapData(generateHeatMapData())
      }, 8000)
      
      return () => clearInterval(interval)
    }
  }, [isVisible])
  
  const getCategoryColor = (category: string, intensity: number) => {
    const colors = {
      diamonds: `rgba(168, 85, 247, ${intensity * 0.6})`, // Purple
      rings: `rgba(236, 72, 153, ${intensity * 0.6})`, // Pink
      necklaces: `rgba(59, 130, 246, ${intensity * 0.6})`, // Blue
      customization: `rgba(16, 185, 129, ${intensity * 0.6})` // Green
    }
    return colors[category as keyof typeof colors] || `rgba(168, 85, 247, ${intensity * 0.6})`
  }
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(168, 85, 247, 0.01) 50%, rgba(236, 72, 153, 0.01) 100%)` 
          }}
        >
          {/* Heat map points */}
          {heatMapData.map((point, index) => (
            <motion.div
              key={`${point.x}-${point.y}-${index}`}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: point.intensity * morphIntensity,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                delay: index * 0.05,
                duration: 0.8,
                ease: 'easeOut'
              }}
              whileHover={{ scale: 1.5, zIndex: 10 }}
              onHoverStart={() => setActivePoint(`${index}`)}
              onHoverEnd={() => setActivePoint(null)}
            >
              {/* Heat point circle */}
              <motion.div
                className="w-4 h-4 rounded-full relative"
                style={{
                  background: getCategoryColor(point.category, point.intensity),
                  boxShadow: `0 0 ${point.intensity * 20}px ${getCategoryColor(point.category, point.intensity)}`
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [point.intensity * 0.8, point.intensity, point.intensity * 0.8]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.1
                }}
              >
                {/* Ripple effect */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-current opacity-0"
                  animate={{
                    scale: [1, 3, 5],
                    opacity: [0.6, 0.3, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: index * 0.15
                  }}
                  style={{ borderColor: getCategoryColor(point.category, 0.4) }}
                />
              </motion.div>
              
              {/* Tooltip */}
              <AnimatePresence>
                {activePoint === `${index}` && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.8 }}
                    animate={{ opacity: 1, y: -10, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.8 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none"
                  >
                    <div className="bg-black text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                      <div className="font-semibold capitalize">{point.category}</div>
                      <div className="opacity-80">{point.label}</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          
          {/* Ambient Aurora glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                'radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)'
              ]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          
          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: morphIntensity, x: 0 }}
            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg"
          >
            <div className="text-xs font-semibold text-gray-700 mb-2">Live Activity Heat Map</div>
            <div className="space-y-1">
              {['diamonds', 'rings', 'necklaces', 'customization'].map((category, index) => (
                <div key={category} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCategoryColor(category, 0.8) }}
                  />
                  <span className="text-xs capitalize text-gray-600">{category}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}