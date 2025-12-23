'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type MaterialOptionId = 'silver' | 'yellow-gold' | 'rose-gold' | 'white-gold'

export interface MaterialOption {
    id: MaterialOptionId
    label: string
    description: string
    priceMod: number
    priceDisplay: string
}

export const MATERIAL_OPTIONS: MaterialOption[] = [
    {
        id: 'silver',
        label: '925 Sterling Silver',
        description: 'The foundation. Pure, bright, and timeless. No plating, just solid shine.',
        priceMod: 0,
        priceDisplay: '+$0',
    },
    {
        id: 'yellow-gold',
        label: 'Yellow Gold Plated',
        description: '18k on 925 silver base. Warm, luminous, substantial.',
        priceMod: 120,
        priceDisplay: '+$120',
    },
    {
        id: 'white-gold',
        label: 'White Gold Plated',
        description: 'Rhodium on 925 silver base. Crisp, mirror-like brilliance.',
        priceMod: 110,
        priceDisplay: '+$110',
    },
    {
        id: 'rose-gold',
        label: 'Rose Gold Plated',
        description: '18k on 925 silver base. Soft, understated blush warmth.',
        priceMod: 95,
        priceDisplay: '+$95',
    },
]

interface MaterialSelectorProps {
    selected: MaterialOptionId
    onSelect: (id: MaterialOptionId) => void
}

export function MaterialSelector({ selected, onSelect }: MaterialSelectorProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <span className="font-accent text-xs uppercase tracking-[0.2em] text-text-muted">
                    Material
                </span>
                <h3 className="text-lg font-medium text-text-primary">Select your finish</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
                {MATERIAL_OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onSelect(option.id)}
                        className={cn(
                            'group flex flex-col items-start justify-between min-h-[140px] p-4 md:p-6 text-left transition-all duration-300',
                            selected === option.id
                                ? 'bg-accent-primary text-white shadow-soft ring-1 ring-accent-primary'
                                : 'bg-white/50 hover:bg-white border border-transparent'
                        )}
                    >
                        <div className="space-y-2 md:space-y-3 w-full">
                            <span className={cn(
                                "font-heading text-sm md:text-lg font-semibold block leading-tight",
                                selected === option.id ? "text-white" : "text-text-primary"
                            )}>
                                {option.label}
                            </span>
                            <p className={cn(
                                "text-xs leading-relaxed font-body hidden md:block",
                                selected === option.id ? "text-white/90" : "text-text-secondary"
                            )}>
                                {option.description}
                            </p>
                            {/* Mobile-only shortened description if needed, or just hide as done above for cleaner UI */}
                        </div>
                        <div className="mt-3 md:mt-4 flex items-center gap-2 w-full">
                            <span
                                className={cn(
                                    'w-2 h-2 md:w-3 md:h-3 block flex-shrink-0',
                                    selected === option.id ? 'bg-white' : 'bg-border-strong'
                                )}
                            />
                            <span className={cn(
                                "text-xs md:text-sm font-medium",
                                selected === option.id ? "text-white" : "text-text-muted"
                            )}>
                                {option.priceDisplay}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

