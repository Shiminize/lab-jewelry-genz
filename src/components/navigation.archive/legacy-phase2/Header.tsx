'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QuantumNavigation } from '@/components/navigation/QuantumNavigation'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { VoiceSearch } from '@/components/ai/VoiceSearch'
import { usePredictiveMorphing } from '@/components/ai/PredictiveMorphing'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const router = useRouter()
  const [voiceSearchOpen, setVoiceSearchOpen] = useState(false)
  
  // Aurora AI Integration
  const { morphInterface } = usePredictiveMorphing()

  // Aurora Navigation Handler
  const handleQuantumNavigation = (path: string, layer: 'surface' | 'discovery' | 'deep') => {
    console.log(`🌌 Aurora Navigation: ${path} (Layer: ${layer})`)
    morphInterface('quantum_navigation', { path, layer })
    router.push(path)
  }

  // Bottom Navigation Handler
  const handleBottomNavigation = (path: string) => {
    console.log(`📱 Bottom Navigation: ${path}`)
    router.push(path)
  }
  
  // Aurora Voice Search Handler
  const handleVoiceSearch = (query: string, emotions: string[], intent: string) => {
    console.log(`🎤 Aurora Voice Search: "${query}" | Emotions: ${emotions.join(', ')} | Intent: ${intent}`)
    morphInterface('voice_search', { query, emotions, intent })
    
    // Navigate based on intent
    if (intent === 'surprise') {
      router.push('/surprise-me')
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}&emotions=${emotions.join(',')}&intent=${intent}`)
    }
    
    setVoiceSearchOpen(false)
  }

  return (
    <>
      {/* Skip to main content link for screen readers */}
      <Link 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-foreground text-background px-4 py-2 z-[100] font-body"
        tabIndex={1}
      >
        Skip to main content
      </Link>

      {/* Aurora Quantum Navigation System - Unified Single Navigation */}
      <QuantumNavigation 
        className={className}
        onNavigate={handleQuantumNavigation}
      />

      {/* Aurora Voice Search Modal */}
      <VoiceSearch
        isOpen={voiceSearchOpen}
        onClose={() => setVoiceSearchOpen(false)}
        onSearch={handleVoiceSearch}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNavigation 
        onNavigate={handleBottomNavigation}
      />
    </>
  )
}

