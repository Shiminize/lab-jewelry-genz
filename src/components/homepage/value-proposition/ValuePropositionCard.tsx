/**
 * ValuePropositionCard - Enhanced value proposition card with image backgrounds
 * Extracted from EnhancedValueProposition for CLAUDE_RULES compliance
 * Supports background images with overlay gradients
 */

'use client'

import React from 'react'
import Image from 'next/image'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { H3, BodyText, MutedText } from '@/components/foundation/Typography'

const valueCardVariants = cva(
  'group relative overflow-hidden rounded-token-lg min-h-[400px] transition-all duration-token-slow ease-token-out hover:scale-101 hover:-translate-y-1 hover:shadow-token-xl cursor-pointer',
  {
    variants: {
      overlay: {
        grey: 'before:absolute before:inset-0 before:bg-neutral-500/50 before:z-10 hover:before:bg-neutral-500/40 before:transition-colors before:duration-300',
        dark: 'before:absolute before:inset-0 before:bg-neutral-900/50 before:z-10 hover:before:bg-neutral-900/40 before:transition-colors before:duration-300',
        light: 'before:absolute before:inset-0 before:bg-neutral-200/50 before:z-10 hover:before:bg-neutral-200/40 before:transition-colors before:duration-300'
      },
      style: {
        imageCard: 'bg-cover bg-center transform transition-transform duration-500 group-hover:scale-105',
        gradientCard: 'bg-gradient-to-br from-[var(--aurora-nebula-purple)]/10 to-[var(--aurora-pink)]/5'
      }
    },
    defaultVariants: {
      overlay: 'grey',
      style: 'imageCard'
    }
  }
)

interface ValueProp {
  id: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  headline: string
  description: string
  trustSignals: Array<{
    icon: React.ComponentType<{ className?: string; size?: number }>
    text: string
    description?: string
  }>
  details?: string
  backgroundImage?: string
}

interface ValuePropositionCardProps 
  extends VariantProps<typeof valueCardVariants> {
  valueProp: ValueProp
  className?: string
}

export const ValuePropositionCard: React.FC<ValuePropositionCardProps> = ({ 
  valueProp, 
  overlay,
  style,
  className = '' 
}) => (
  <div 
    className={cn(valueCardVariants({ overlay, style }), className)} 
    data-testid="value-proposition-card"
    style={valueProp.backgroundImage ? { 
      backgroundImage: `url(${valueProp.backgroundImage})` 
    } : undefined}
  >
    {/* Background Image (if using Next.js Image optimization) */}
    {valueProp.backgroundImage && (
      <div className="absolute inset-0 z-0">
        <Image
          src={valueProp.backgroundImage}
          alt={valueProp.headline}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    )}
    
    {/* Content Container */}
    <div className="relative z-20 h-full flex flex-col justify-end p-6 text-center group-hover:translate-y-[-4px] transition-transform duration-300">      
      {/* Content */}
      <div className="space-y-4">
        <H3 className="text-white drop-shadow-2xl">
          {valueProp.headline}
        </H3>
        <BodyText className="text-white leading-relaxed drop-shadow-lg">
          {valueProp.description}
        </BodyText>
      </div>

      {/* Trust Signals */}
      {valueProp.trustSignals && valueProp.trustSignals.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {valueProp.trustSignals.map((signal, index) => (
            <div 
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white/25 backdrop-blur-md text-white rounded-full shadow-lg border border-white/20 group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300"
            >
              <signal.icon className="w-3 h-3" size={12} />
              <MutedText size="sm" className="font-medium text-white">
                {signal.text}
              </MutedText>
            </div>
          ))}
        </div>
      )}

      {/* Details (if available) */}
      {valueProp.details && (
        <MutedText className="text-sm text-white/80 mt-4 drop-shadow-lg group-hover:text-white/90 transition-all duration-300">
          {valueProp.details}
        </MutedText>
      )}
    </div>
  </div>
)

export default ValuePropositionCard