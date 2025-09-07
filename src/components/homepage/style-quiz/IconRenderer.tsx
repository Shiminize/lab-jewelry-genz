'use client'

import React from 'react'
import { Gem, Crown, Heart, Star } from 'lucide-react'

interface IconRendererProps {
  iconName: 'gem' | 'crown' | 'heart' | 'star'
  className?: string
}

export function IconRenderer({ iconName, className = 'w-6 h-6' }: IconRendererProps) {
  const icons = {
    gem: Gem,
    crown: Crown,
    heart: Heart,
    star: Star
  }
  
  const IconComponent = icons[iconName]
  
  return <IconComponent className={className} />
}