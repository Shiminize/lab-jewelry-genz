import { lazy, Suspense } from 'react'

// Phase 5: Performance optimization - Lazy load heavy components
const AuroraHeatMap = lazy(() => import('./AuroraHeatMap').then(module => ({ default: module.AuroraHeatMap })))
const AISurpriseRecommendation = lazy(() => import('./AISurpriseRecommendation').then(module => ({ default: module.AISurpriseRecommendation })))

interface LazyAuroraFeaturesProps {
  // Heat map props
  isHeatMapVisible: boolean
  morphIntensity: number
  
  // AI recommendation props  
  isAiModalOpen: boolean
  onAiModalClose: () => void
  userPreferences: {
    style: string[]
    priceRange: [number, number]
    materials: string[]
  }
}

export function LazyAuroraFeatures({
  isHeatMapVisible,
  morphIntensity,
  isAiModalOpen,
  onAiModalClose,
  userPreferences
}: LazyAuroraFeaturesProps) {
  return (
    <Suspense fallback={<div className="aurora-loading-placeholder" />}>
      {/* Lazy-loaded Aurora Heat Map */}
      <AuroraHeatMap
        isVisible={isHeatMapVisible}
        morphIntensity={morphIntensity}
      />
      
      {/* Lazy-loaded AI Surprise Recommendation */}
      <AISurpriseRecommendation
        isOpen={isAiModalOpen}
        onClose={onAiModalClose}
        userPreferences={userPreferences}
      />
    </Suspense>
  )
}