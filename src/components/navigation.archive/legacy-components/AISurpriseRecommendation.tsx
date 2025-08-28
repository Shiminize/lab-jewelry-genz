'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface RecommendationItem {
  id: string
  title: string
  subtitle: string
  price: string
  trend: 'hot' | 'rising' | 'new'
  match: number // percentage match
  reason: string
  image?: string
  category: string
}

interface AISurpriseModalProps {
  isOpen: boolean
  onClose: () => void
  userPreferences?: {
    style?: string[]
    priceRange?: [number, number]
    materials?: string[]
  }
}

// Mock AI recommendations based on user patterns
const generateRecommendations = (): RecommendationItem[] => {
  const categories = ['Rings', 'Necklaces', 'Earrings', 'Bracelets']
  const trends = ['hot', 'rising', 'new'] as const
  const reasons = [
    'Based on your love for minimalist designs',
    'Trending among users with similar taste',
    'Perfect match for your recent searches',
    'Recommended by our AI stylist',
    'Complements your saved items',
    'Popular in your price range'
  ]
  
  return Array.from({ length: 4 }, (_, i) => ({
    id: `rec-${i + 1}`,
    title: `Aurora ${categories[i]} Collection`,
    subtitle: 'Lab-grown diamond masterpiece',
    price: `$${Math.floor(Math.random() * 5000 + 1000)}`,
    trend: trends[Math.floor(Math.random() * trends.length)],
    match: Math.floor(Math.random() * 30 + 70),
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    category: categories[i]
  }))
}

export function AISurpriseRecommendation({ isOpen, onClose, userPreferences }: AISurpriseModalProps) {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      // Simulate AI processing time
      setTimeout(() => {
        setRecommendations(generateRecommendations())
        setLoading(false)
      }, 1500)
    }
  }, [isOpen])

  const getTrendIcon = (trend: RecommendationItem['trend']) => {
    switch (trend) {
      case 'hot': return '🔥'
      case 'rising': return '📈'
      case 'new': return '✨'
    }
  }

  const getTrendColor = (trend: RecommendationItem['trend']) => {
    switch (trend) {
      case 'hot': return 'from-red-500 to-orange-500'
      case 'rising': return 'from-green-500 to-emerald-500'
      case 'new': return 'from-purple-500 to-pink-500'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[var(--nebula-purple)] to-[var(--aurora-pink)] p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
              
              <div className="text-center">
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  className="text-4xl mb-2"
                >
                  ✨
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">AI Curated Surprises</h2>
                <p className="text-white/90">
                  Unique finds based on your style DNA
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-[var(--nebula-purple)] border-t-transparent rounded-full mb-4"
                  />
                  <p className="text-gray-600 animate-pulse">
                    AI is analyzing your preferences...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        'relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
                        selectedItem === item.id
                          ? 'border-[var(--aurora-pink)] bg-gradient-to-br from-purple-50 to-pink-50'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                      )}
                      onClick={() => setSelectedItem(item.id)}
                    >
                      {/* Trend Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white',
                          'bg-gradient-to-r',
                          getTrendColor(item.trend)
                        )}>
                          {getTrendIcon(item.trend)} {item.trend.toUpperCase()}
                        </span>
                      </div>

                      {/* Match Percentage */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">AI Match</span>
                          <span className="text-xs font-bold text-[var(--nebula-purple)]">
                            {item.match}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.match}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            className="h-2 rounded-full bg-gradient-to-r from-[var(--nebula-purple)] to-[var(--aurora-pink)]"
                          />
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.subtitle}</p>
                        <p className="text-lg font-semibold text-[var(--nebula-purple)]">
                          {item.price}
                        </p>
                        <p className="text-xs text-gray-500 italic">
                          💡 {item.reason}
                        </p>
                      </div>

                      {/* Category Tag */}
                      <div className="mt-3">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {item.category}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    setLoading(true)
                    setTimeout(() => {
                      setRecommendations(generateRecommendations())
                      setLoading(false)
                    }, 1000)
                  }}
                  className="px-4 py-2 text-[var(--nebula-purple)] font-semibold hover:bg-purple-50 rounded-lg transition-colors"
                >
                  🔄 Refresh Suggestions
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>
                  {selectedItem && (
                    <button
                      onClick={() => {
                        // Navigate to product
                        window.location.href = `/products/${selectedItem}`
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-[var(--nebula-purple)] to-[var(--aurora-pink)] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      View Product →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}